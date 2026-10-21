import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { getSubjectColor } from '@/utils/subjectColor';
import { getSubjectIcon } from '@/utils/subjectIcons';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { StatCardShell, BarWithPct, LegendDot } from '@/components/shared/timetable/StatCardParts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', jsDay: 1 },
  { key: 'tuesday', label: 'Tuesday', jsDay: 2 },
  { key: 'wednesday', label: 'Wednesday', jsDay: 3 },
  { key: 'thursday', label: 'Thursday', jsDay: 4 },
  { key: 'friday', label: 'Friday', jsDay: 5 },
];

const dayKeyOf = (date) => WEEKDAYS.find((d) => d.jsDay === date.getDay())?.key || null;

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // back up to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isSameDay = (a, b) => toISODate(a) === toISODate(b);
const formatShortDate = (date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const formatLongDate = (date) =>
  date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const STATUS_META = {
  attended: { icon: CheckCircleIcon, color: '#16A34A', label: 'Attended', description: 'You confirmed this class held.' },
  upcoming: { icon: AccessTimeIcon, color: '#D97706', label: 'Upcoming', description: "Hasn't happened yet — click to confirm attendance or cancel once it's due." },
  cancelled: { icon: CancelIcon, color: '#DC2626', label: 'Cancelled', description: 'You cancelled this class.' },
  not_scheduled: { icon: HelpOutlineIcon, color: '#9CA3AF', label: 'Not Scheduled', description: "This class's time has passed and you never confirmed it — click to mark it attended or cancelled." },
};

const StatusIcon = ({ status, fontSize = 'small' }) => {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <Tooltip title={`${meta.label} — ${meta.description}`}>
      <Icon fontSize={fontSize} sx={{ color: meta.color }} />
    </Tooltip>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        bgcolor: `${meta.color}1A`,
        color: meta.color,
        px: 1,
        py: 0.4,
        borderRadius: 999,
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 14 }} />
      <Typography variant="caption" fontWeight={800}>
        {meta.label}
      </Typography>
    </Stack>
  );
};

const isActionable = (status) => status === 'upcoming' || status === 'not_scheduled';

const emptyStats = {
  today: { total: 0, completed: 0, upcoming: 0, cancelled: 0 },
  this_week: { total: 0, attended: 0, cancelled: 0, percent: 0 },
  attendance_rate: { percent: 0, attended: 0, total: 0, sparkline: [0, 0, 0, 0, 0] },
  cancelled_this_week: 0,
  upcoming_next: null,
  subjects: [],
};

/**
 * Subject teacher's own "My Timetable" — real week grid plus real
 * attendance tracking (Mark Attendance / Cancel Class), backed by
 * GET /timetable/my-schedule-overview and the timetable_occurrences table.
 * No row in that table means "upcoming" (hasn't happened) or
 * "not_scheduled" (a past class the teacher never confirmed) — only a
 * deviation from the default template gets persisted.
 */
const MyTimetable = () => {
  const notify = useNotification();
  const { user } = useContext(TenantAuthContext) || {};
  const [overview, setOverview] = useState({ schedule: {}, stats: emptyStats });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Session / Term — lets the teacher look at a past term's timetable, not
  // just whatever's currently active.
  const [sessions, setSessions] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');

  // Programme / Class / Arm — the same "only what I'm assigned to" scoping
  // Score Upload uses, so a teacher who teaches several classes can focus
  // the week grid on just one. Empty arm = every assigned class, merged.
  const [myClassArms, setMyClassArms] = useState([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedArmId, setSelectedArmId] = useState('');

  const loadTermsForSession = useCallback(async (sessionId) => {
    try {
      const res = await fetchSessionTerms(sessionId);
      const terms = res.data || [];
      setSessionTerms(terms);
      const activeTerm = terms.find((t) => t.status === 'active') || terms[0];
      setSelectedTermId(activeTerm ? activeTerm.id : '');
    } catch {
      notify.error('Failed to fetch terms for the selected session');
    }
  }, [notify]);

  useEffect(() => {
    fetchTenantSessions({ pagination: false })
      .then((res) => {
        const allSessions = res.data || [];
        setSessions(allSessions);
        const activeSession = allSessions.find((s) => s.status === 'active') || allSessions[0];
        if (activeSession) {
          setSelectedSessionId(activeSession.id);
          loadTermsForSession(activeSession.id);
        }
      })
      .catch(() => notify.error('Failed to fetch sessions'));

    timetableApi
      .getMyClassArms()
      .then((res) => {
        const arms = res.data.data || [];
        setMyClassArms(arms);
        // An arm already implies its class and programme — prefill all
        // three from the teacher's first assigned arm instead of leaving
        // the filters empty and making them pick through 3 dropdowns to
        // see what we already know they teach.
        const first = arms[0];
        if (first) {
          setSelectedProgrammeId(first.programme_id);
          setSelectedClassId(first.class_id);
          setSelectedArmId(first.class_arm_id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSessionChange = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setSelectedTermId('');
    setSessionTerms([]);
    if (sessionId) await loadTermsForSession(sessionId);
  };

  const programmeOptions = useMemo(() => {
    const map = new Map();
    myClassArms.forEach((a) => {
      if (!map.has(a.programme_id)) map.set(a.programme_id, { id: a.programme_id, name: a.programme_name });
    });
    return Array.from(map.values());
  }, [myClassArms]);

  const classOptions = useMemo(() => {
    const map = new Map();
    myClassArms
      .filter((a) => !selectedProgrammeId || a.programme_id === selectedProgrammeId)
      .forEach((a) => {
        if (!map.has(a.class_id)) map.set(a.class_id, { id: a.class_id, name: a.class_name });
      });
    return Array.from(map.values());
  }, [myClassArms, selectedProgrammeId]);

  const armOptions = useMemo(
    () =>
      myClassArms.filter(
        (a) =>
          (!selectedProgrammeId || a.programme_id === selectedProgrammeId) &&
          (!selectedClassId || a.class_id === selectedClassId),
      ),
    [myClassArms, selectedProgrammeId, selectedClassId],
  );

  const handleProgrammeFilterChange = (value) => {
    setSelectedProgrammeId(value);
    setSelectedClassId('');
    setSelectedArmId('');
  };

  const handleClassFilterChange = (value) => {
    setSelectedClassId(value);
    setSelectedArmId('');
  };

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const today = useMemo(() => new Date(), []);

  const weekDates = useMemo(
    () =>
      WEEKDAYS.map((d, idx) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + idx);
        return { ...d, date };
      }),
    [weekStart],
  );

  const fetchOverview = useCallback(
    async (weekStartParam) => {
      if (!selectedTermId) return;
      setLoading(true);
      try {
        const res = await timetableApi.getMyScheduleOverview({
          week_start: weekStartParam,
          session_term_id: selectedTermId,
          class_arm_id: selectedArmId || undefined,
        });
        setOverview(res.data.data);
      } catch {
        notify.error('Failed to load your timetable');
      } finally {
        setLoading(false);
      }
    },
    [selectedTermId, selectedArmId, notify],
  );

  useEffect(() => {
    fetchOverview(weekStartISO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO, selectedTermId, selectedArmId]);

  const schedule = overview.schedule || {};
  const stats = overview.stats || emptyStats;

  // Every day carries the same full period list (periods + breaks), so
  // the first day with any loaded rows gives the whole set.
  const allPeriods = useMemo(() => {
    const dayWithRows = WEEKDAYS.map((d) => schedule[d.key]).find((rows) => rows?.length);
    return (dayWithRows || []).map((row) => row.period);
  }, [schedule]);

  const cellFor = (dayKey, periodId) => {
    const row = (schedule[dayKey] || []).find((r) => r.period.id === periodId);
    return row ? row.slot : null;
  };

  const selectedDayKey = dayKeyOf(selectedDate);
  const selectedDayRows = useMemo(() => {
    if (!selectedDayKey) return [];
    return (schedule[selectedDayKey] || [])
      .filter((row) => !row.period.is_break && row.slot)
      .map((row) => ({ ...row.slot, period: row.period }))
      .sort((a, b) => (a.period.start_time || '').localeCompare(b.period.start_time || ''));
  }, [schedule, selectedDayKey]);

  // ── Mark Attendance / Cancel Class ──────────────────────────────────
  const [actionTarget, setActionTarget] = useState(null); // { slot_id, date, subject_name, class_name, period, status }
  const [actionMode, setActionMode] = useState(null); // null | 'cancel'
  const [cancelNote, setCancelNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAction = (row) => {
    if (!row || !isActionable(row.status)) return;
    setActionTarget(row);
    setActionMode(null);
    setCancelNote('');
  };
  const closeAction = () => {
    setActionTarget(null);
    setActionMode(null);
    setCancelNote('');
  };

  const canMarkAttended = actionTarget && actionTarget.date <= toISODate(today);

  const handleMarkAttendance = async () => {
    if (!actionTarget) return;
    setSubmitting(true);
    try {
      await timetableApi.markAttendance({ slot_id: actionTarget.slot_id, date: actionTarget.date });
      notify.success('Attendance confirmed');
      closeAction();
      fetchOverview(weekStartISO);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to confirm attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClass = async () => {
    if (!actionTarget) return;
    setSubmitting(true);
    try {
      await timetableApi.cancelClass({
        slot_id: actionTarget.slot_id,
        date: actionTarget.date,
        note: cancelNote || undefined,
      });
      notify.success('Class cancelled');
      closeAction();
      fetchOverview(weekStartISO);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to cancel class');
    } finally {
      setSubmitting(false);
    }
  };

  const openUpcomingNextAction = (cancel) => {
    if (!stats.upcoming_next) return;
    openAction({
      slot_id: stats.upcoming_next.slot_id,
      date: stats.upcoming_next.date,
      subject_name: stats.upcoming_next.subject_name,
      class_name: stats.upcoming_next.class_name,
      period: stats.upcoming_next.period,
      status: 'upcoming',
    });
    if (cancel) setActionMode('cancel');
  };

  const sparkline = stats.attendance_rate.sparkline?.length
    ? stats.attendance_rate.sparkline
    : [0, 0, 0, 0, 0];

  return (
    <PageContainer
      title="My Timetable"
      description="View your class schedule, confirm attendance, or cancel a class when necessary."
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: '#2563EB',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              My Timetable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View your class schedule, confirm attendance, or cancel a class when necessary.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{ p: 1.5, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Session</InputLabel>
            <Select
              label="Session"
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }} disabled={!selectedSessionId}>
            <InputLabel>Term</InputLabel>
            <Select label="Term" value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}>
              {sessionTerms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term?.term_name || t.term_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Programme</InputLabel>
            <Select
              label="Programme"
              value={selectedProgrammeId}
              onChange={(e) => handleProgrammeFilterChange(e.target.value)}
            >
              <MenuItem value="">All My Classes</MenuItem>
              {programmeOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }} disabled={!selectedProgrammeId}>
            <InputLabel>Class</InputLabel>
            <Select
              label="Class"
              value={selectedClassId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }} disabled={!selectedClassId}>
            <InputLabel>Arm</InputLabel>
            <Select label="Arm" value={selectedArmId} onChange={(e) => setSelectedArmId(e.target.value)}>
              <MenuItem value="">All Arms</MenuItem>
              {armOptions.map((a) => (
                <MenuItem key={a.class_arm_id} value={a.class_arm_id}>
                  {a.arm_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedArmId && (
            <Button
              size="small"
              onClick={() => {
                setSelectedProgrammeId('');
                setSelectedClassId('');
                setSelectedArmId('');
              }}
            >
              Clear Class Filter
            </Button>
          )}
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 1.25,
          mb: 2,
        }}
      >
        <StatCardShell
          icon={TodayIcon}
          iconColor="#16A34A"
          title="Today's Classes"
          tooltip="How many of today's classes you've already confirmed vs. still have coming up."
          loading={loading}
        >
          <BarWithPct
            value={
              stats.today.total ? Math.round((stats.today.completed / stats.today.total) * 100) : 0
            }
            mainLabel={stats.today.total}
            subLabel={`${stats.today.completed} completed · ${stats.today.upcoming} upcoming`}
            barColor="#16A34A"
          />
        </StatCardShell>

        <StatCardShell
          icon={FactCheckIcon}
          iconColor="#2563EB"
          title="Attendance Rate"
          tooltip="Your real confirmed-vs-cancelled rate over the last 5 school weeks, up to today."
          loading={loading}
        >
          <BarWithPct
            value={stats.attendance_rate.percent}
            mainLabel={`${stats.attendance_rate.percent}%`}
            subLabel={`${stats.attendance_rate.attended} of ${stats.attendance_rate.total} classes attended`}
            barColor="#2563EB"
            legend={
              <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 16 }}>
                {sparkline.map((v, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: `${Math.max(v, 8)}%`,
                      bgcolor: v >= 70 ? '#16A34A' : v > 0 ? '#DC2626' : '#E5E7EB',
                      borderRadius: 0.5,
                    }}
                  />
                ))}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 0.5, whiteSpace: 'nowrap' }}
                >
                  5wk trend
                </Typography>
              </Stack>
            }
          />
        </StatCardShell>

        <StatCardShell
          icon={EventRepeatIcon}
          iconColor="#7E22CE"
          title="Classes This Week"
          tooltip="How many classes this week you've confirmed vs. cancelled, out of the total scheduled."
          loading={loading}
        >
          <BarWithPct
            value={stats.this_week.percent}
            mainLabel={stats.this_week.total}
            subLabel="Total classes this week"
            barColor="#7E22CE"
            legend={
              <>
                <LegendDot color="#16A34A" label={`Attended ${stats.this_week.attended}`} />
                <LegendDot color="#DC2626" label={`Cancelled ${stats.this_week.cancelled}`} />
              </>
            }
          />
        </StatCardShell>

        <StatCardShell
          icon={ScheduleIcon}
          iconColor="#DC2626"
          title="Upcoming Next"
          tooltip="The next class on your timetable that you haven't confirmed or cancelled yet."
          loading={loading}
        >
          {stats.upcoming_next ? (
            <>
              <Typography variant="body2" fontWeight={800}>
                {stats.upcoming_next.subject_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {stats.upcoming_next.class_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {new Date(stats.upcoming_next.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                · {stats.upcoming_next.period.start_time?.slice(0, 5)}-
                {stats.upcoming_next.period.end_time?.slice(0, 5)}
              </Typography>
              <Button
                size="small"
                fullWidth
                variant="contained"
                disabled={!stats.upcoming_next.actionable}
                onClick={() => openUpcomingNextAction(false)}
                sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
              >
                Confirm Attendance
              </Button>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nothing scheduled in the next 2 weeks.
            </Typography>
          )}
        </StatCardShell>

        <StatCardShell
          icon={EventBusyIcon}
          iconColor="#D97706"
          title="Cancelled Classes"
          tooltip="Classes you've cancelled this week."
          loading={loading}
          linkText="View Details"
          onLinkClick={() =>
            document.getElementById('my-timetable-grid')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <Typography variant="h5" fontWeight={900} lineHeight={1}>
            {stats.cancelled_this_week}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            This week
          </Typography>
        </StatCardShell>

        <StatCardShell
          icon={MenuBookIcon}
          iconColor="#0F766E"
          title={`My Subjects (${stats.subjects.length})`}
          tooltip="Every subject you teach, based on your current subject-teacher allocations."
          loading={loading}
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {stats.subjects.map((s) => (
              <Stack key={s.id} direction="row" spacing={0.5} alignItems="center">
                <Box
                  sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: getSubjectColor(s) }}
                />
                <Typography variant="caption" fontWeight={600}>
                  {s.name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </StatCardShell>
      </Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Paper
          id="my-timetable-grid"
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Button
              size="small"
              startIcon={<ChevronLeftIcon fontSize="small" />}
              onClick={() =>
                setSelectedDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() - 7);
                  return n;
                })
              }
            >
              Previous Week
            </Button>
            <Typography variant="subtitle2" fontWeight={800}>
              Week: {formatShortDate(weekDates[0].date)} – {formatShortDate(weekDates[4].date)}
            </Typography>
            <Button
              size="small"
              endIcon={<ChevronRightIcon fontSize="small" />}
              onClick={() =>
                setSelectedDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() + 7);
                  return n;
                })
              }
            >
              Next Week
            </Button>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              sx={{
                '& .MuiTableCell-root': { py: 0.6, px: 1, fontSize: '0.78rem' },
                '& .MuiTableCell-head': { fontWeight: 800, bgcolor: '#F1F5F9' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Period</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Time</TableCell>
                  {weekDates.map((d) => (
                    <TableCell
                      key={d.key}
                      sx={{
                        whiteSpace: 'nowrap',
                        color: isSameDay(d.date, today) ? '#2563EB' : undefined,
                      }}
                    >
                      {d.label}
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}
                      >
                        {formatShortDate(d.date)}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton variant="text" height={28} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : allPeriods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No timetable has been set up for you yet.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  allPeriods.map((period) => {
                    if (period.is_break) {
                      return (
                        <TableRow key={period.id}>
                          <TableCell sx={{ bgcolor: '#FEF3C7' }}>—</TableCell>
                          <TableCell
                            colSpan={6}
                            sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                          >
                            {period.label} — {period.start_time?.slice(0, 5)}-
                            {period.end_time?.slice(0, 5)}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={period.id}>
                        <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {period.label}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {period.start_time?.slice(0, 5)}-{period.end_time?.slice(0, 5)}
                        </TableCell>
                        {weekDates.map((d) => {
                          const cell = cellFor(d.key, period.id);
                          if (!cell) {
                            return (
                              <TableCell key={d.key}>
                                <Typography variant="caption" color="text.disabled">
                                  —
                                </Typography>
                              </TableCell>
                            );
                          }
                          const subjectColor = getSubjectColor({
                            id: cell.subject_id,
                            color: cell.subject_color,
                          });
                          const SubjectIcon = getSubjectIcon(cell.subject_name);
                          const clickable = isActionable(cell.status);
                          return (
                            <TableCell
                              key={d.key}
                              onClick={() => clickable && openAction({ ...cell, period })}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                '&:hover': clickable ? { bgcolor: 'action.hover' } : undefined,
                              }}
                            >
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Box
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    bgcolor: `${subjectColor}14`,
                                    border: '1px solid',
                                    borderColor: `${subjectColor}3D`,
                                    borderRadius: 1.5,
                                    p: 0.6,
                                  }}
                                >
                                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                                    <Box
                                      sx={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 1.25,
                                        bgcolor: subjectColor,
                                        color: '#fff',
                                        boxShadow: `0 2px 6px ${subjectColor}66`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <SubjectIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="caption" fontWeight={800} noWrap sx={{ display: 'block', color: subjectColor }}>
                                        {cell.subject_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                        {cell.class_name}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                                <StatusIcon status={cell.status} />
                              </Stack>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mt: 1.5 }}
          >
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <Tooltip key={key} title={meta.description}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <meta.icon sx={{ fontSize: 16, color: meta.color }} />
                    <Typography variant="caption" color="text.secondary">
                      {meta.label}
                    </Typography>
                  </Stack>
                </Tooltip>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Click on a class to confirm attendance or cancel.
            </Typography>
          </Stack>
        </Paper>

        <Stack
          spacing={2}
          sx={{
            width: { xs: '100%', lg: 300 },
            flexShrink: 0,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              pb: 1,
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
              <CalendarViewMonthIcon fontSize="small" sx={{ color: '#2563EB' }} />
              <Typography variant="subtitle2" fontWeight={800}>
                Select Date
              </Typography>
            </Stack>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={dayjs(selectedDate)}
                onChange={(value) => value && setSelectedDate(value.toDate())}
                sx={{
                  width: '100%',
                  height: 'auto',
                  '& .MuiPickersCalendarHeader-root': { pl: 0.5, pr: 0.5 },
                  '& .MuiDayCalendar-slideTransition': { minHeight: 190 },
                }}
              />
            </LocalizationProvider>
          </Paper>

          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight={800}>
              {isSameDay(selectedDate, today) ? "Today's Schedule" : 'Schedule'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {formatLongDate(selectedDate)}
            </Typography>
            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              <Stack spacing={1}>
                {!selectedDayKey ? (
                  <Alert severity="info" sx={{ py: 0.25 }}>
                    No school day selected.
                  </Alert>
                ) : loading ? (
                  <Skeleton variant="rounded" height={60} />
                ) : selectedDayRows.length === 0 ? (
                  <Alert severity="info" sx={{ py: 0.25 }}>
                    No classes scheduled.
                  </Alert>
                ) : (
                  selectedDayRows.map((row) => (
                    <Stack
                      key={row.slot_id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          {row.period.start_time?.slice(0, 5)}-{row.period.end_time?.slice(0, 5)}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {row.subject_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {row.class_name}
                        </Typography>
                      </Box>
                      {isActionable(row.status) ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openAction(row)}
                          sx={{
                            bgcolor: '#2563EB',
                            '&:hover': { bgcolor: '#1D4ED8' },
                            flexShrink: 0,
                          }}
                        >
                          Confirm
                        </Button>
                      ) : (
                        <StatusBadge status={row.status} />
                      )}
                    </Stack>
                  ))
                )}
              </Stack>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Tooltip
                title={
                  stats.upcoming_next && !stats.upcoming_next.actionable
                    ? "This class hasn't happened yet"
                    : ''
                }
              >
                <span>
                  <Button
                    fullWidth
                    size="small"
                    color="success"
                    variant="outlined"
                    startIcon={<CheckCircleIcon fontSize="small" />}
                    disabled={!stats.upcoming_next || !stats.upcoming_next.actionable}
                    onClick={() => openUpcomingNextAction(false)}
                  >
                    Mark Attendance
                  </Button>
                </span>
              </Tooltip>
              <Button
                fullWidth
                size="small"
                color="error"
                variant="outlined"
                startIcon={<CancelIcon fontSize="small" />}
                disabled={!stats.upcoming_next}
                onClick={() => openUpcomingNextAction(true)}
              >
                Cancel Class
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <Dialog open={Boolean(actionTarget)} onClose={closeAction} maxWidth="xs" fullWidth>
        <DialogTitle>{actionTarget?.subject_name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {actionTarget?.class_name}
          </Typography>
          {actionTarget && (
            <Typography variant="body2" sx={{ mb: actionMode === 'cancel' ? 2 : 0 }}>
              {formatLongDate(new Date(actionTarget.date))} ·{' '}
              {actionTarget.period.start_time?.slice(0, 5)}-
              {actionTarget.period.end_time?.slice(0, 5)}
            </Typography>
          )}
          {actionMode === 'cancel' && (
            <TextField
              label="Reason (optional)"
              fullWidth
              multiline
              rows={2}
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {actionMode === 'cancel' ? (
            <>
              <Button onClick={() => setActionMode(null)} disabled={submitting}>
                Back
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleCancelClass}
                disabled={submitting}
              >
                {submitting ? 'Cancelling…' : 'Confirm Cancel'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={closeAction} disabled={submitting}>
                Close
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => setActionMode('cancel')}
                disabled={submitting}
              >
                Cancel Class
              </Button>
              <Tooltip title={!canMarkAttended ? "This class hasn't happened yet" : ''}>
                <span>
                  <Button
                    color="success"
                    variant="contained"
                    onClick={handleMarkAttendance}
                    disabled={submitting || !canMarkAttended}
                  >
                    {submitting ? 'Confirming…' : 'Mark as Attended'}
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default MyTimetable;
