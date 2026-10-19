import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import tenantApi from '@/api/tenant/tenant_api';
import { getSubjectColor } from '@/utils/subjectColor';
import { getSubjectIcon, getBreakIcon } from '@/utils/subjectIcons';
import { StatCardShell, BarWithPct } from '@/components/shared/timetable/StatCardParts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import {
  Box,
  Stack,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Alert,
  Button,
  Tooltip,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

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
const formatShortDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const formatLongDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

// The real, staff-marked attendance register — a learner never marks
// their own attendance here, this just shows what's already recorded.
const ATTENDANCE_STATUS_META = {
  present: { icon: CheckCircleIcon, color: '#16A34A', label: 'Present', description: 'Your teacher marked you present for this half of the day.' },
  late: { icon: AccessTimeIcon, color: '#D97706', label: 'Late', description: 'Your teacher marked you as arriving late.' },
  absent: { icon: CancelIcon, color: '#DC2626', label: 'Absent', description: 'Your teacher marked you absent for this half of the day.' },
  excused: { icon: EventAvailableIcon, color: '#2563EB', label: 'Excused', description: 'Your absence was recorded as excused.' },
};
const NOT_MARKED = { icon: HelpOutlineIcon, color: '#9CA3AF', label: 'Not Marked Yet', description: "Your teacher hasn't recorded attendance for this half of the day yet." };

// Rendered per the mockup, but genuinely inert: none of these have a real
// page to link to yet anywhere in the app (confirmed — no My
// Classes/Assignments/Learning Resources route exists). Wiring them to
// something fake would be a dead link with extra steps, so they stay
// visible but disabled until those pages actually exist.
const QUICK_LINKS = [
  { label: 'My Subjects', icon: MenuBookIcon, color: '#2563EB' },
  { label: 'My Classes', icon: GroupsIcon, color: '#0F766E' },
  { label: 'My Assignments', icon: AssignmentIcon, color: '#7C3AED' },
  { label: 'Learning Resources', icon: AutoStoriesIcon, color: '#D97706' },
];

const AttendanceBadge = ({ status }) => {
  const meta = ATTENDANCE_STATUS_META[status] || NOT_MARKED;
  const Icon = meta.icon;
  return (
    <Tooltip title={`${meta.label} — ${meta.description}`}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ bgcolor: `${meta.color}1A`, color: meta.color, px: 1, py: 0.4, borderRadius: 999, flexShrink: 0 }}>
        <Icon sx={{ fontSize: 14 }} />
        <Typography variant="caption" fontWeight={800}>
          {meta.label}
        </Typography>
      </Stack>
    </Tooltip>
  );
};

const emptyStats = {
  today: { total: 0, completed: 0, upcoming: 0 },
  week: { total: 0, scheduled: 0, breaks: 0, percent: 0, daily_counts: [0, 0, 0, 0, 0] },
  subjects: [],
  next_class: null,
};

/**
 * Learner's own "My Timetable" — real weekly class schedule, read-only.
 * A student doesn't run or confirm a class, so there's no Mark Attendance
 * action here; "Today's Schedule" shows whatever the REAL staff-marked
 * attendance register already has for that date (present/absent/late/
 * excused/not yet marked), reusing the same `attendances` table the
 * Attendance module and learner dashboard already show — never a new,
 * self-reported record.
 */
const MyTimetableLearner = () => {
  const notify = useNotification();
  const [overview, setOverview] = useState({ schedule: {}, stats: emptyStats, class_name: null });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [academicInfo, setAcademicInfo] = useState({ academic_session: '', academic_term: '' });
  const [attendanceTerm, setAttendanceTerm] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
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
      setLoading(true);
      try {
        const res = await timetableApi.getMyLearnerScheduleOverview({ week_start: weekStartParam });
        setOverview(res.data.data);
      } catch {
        notify.error('Failed to load your timetable');
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    fetchOverview(weekStartISO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  useEffect(() => {
    tenantApi
      .get('/school_setup/get_academic_info')
      .then((res) => setAcademicInfo(res.data || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setAttendanceLoading(true);
    tenantApi
      .get('/dashboard/learner/attendance')
      .then((res) => setAttendanceTerm(res.data?.data || null))
      .catch(() => {})
      .finally(() => setAttendanceLoading(false));
  }, []);

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
      .map((row) => ({ ...row.slot, period: row.period, attendance_status: row.attendance_status }))
      .sort((a, b) => (a.period.start_time || '').localeCompare(b.period.start_time || ''));
  }, [schedule, selectedDayKey]);

  const dailyCounts = stats.week.daily_counts?.length ? stats.week.daily_counts : Array(5).fill({ scheduled: 0, breaks: 0 });
  const maxDailyTotal = Math.max(...dailyCounts.map((d) => (d.scheduled || 0) + (d.breaks || 0)), 1);

  const subjects = stats.subjects || [];
  const visibleSubjects = subjects.slice(0, 3);
  const moreSubjectsCount = Math.max(subjects.length - visibleSubjects.length, 0);

  // Honest relabel: the real attendance register counts school DAYS
  // (morning/afternoon), not individual class periods — "classes" would
  // overstate the precision of what's actually being measured.
  const attendedDays = attendanceTerm ? (attendanceTerm.present ?? 0) + (attendanceTerm.late ?? 0) : 0;
  const totalDays = attendanceTerm?.total ?? 0;
  const attendanceRate = attendanceTerm?.rate ?? 0;

  return (
    <PageContainer title="My Timetable" description="Your class timetable for the term. View your classes, teachers and stay organised.">
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CalendarMonthIcon />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            My Timetable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your class timetable for {academicInfo.academic_term || 'this term'}. View your classes, teachers and stay organised.
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.25, mb: 2 }}>
        <StatCardShell
          icon={CalendarMonthIcon}
          iconColor="#7C3AED"
          title="Today's Classes"
          tooltip="How many of today's classes have already happened vs. are still coming up."
          loading={loading}
        >
          <BarWithPct
            value={stats.today.total ? Math.round((stats.today.completed / stats.today.total) * 100) : 0}
            mainLabel={stats.today.total}
            subLabel={`${stats.today.completed} completed · ${stats.today.upcoming} upcoming`}
            barColor="#16A34A"
          />
        </StatCardShell>

        <StatCardShell
          icon={CheckCircleIcon}
          iconColor="#16A34A"
          title="Weekly Classes"
          tooltip="Real classes vs. breaks on your timetable this week. Each bar below is one day, split the same way."
          loading={loading}
        >
          <BarWithPct
            value={stats.week.percent}
            mainLabel={stats.week.total}
            subLabel={`${stats.week.scheduled} scheduled · ${stats.week.breaks} breaks`}
            barColor="#16A34A"
            legend={
              <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 16 }}>
                {dailyCounts.map((d, i) => {
                  const total = (d.scheduled || 0) + (d.breaks || 0);
                  const barHeightPct = Math.max((total / maxDailyTotal) * 100, total > 0 ? 15 : 6);
                  const scheduledShare = total > 0 ? (d.scheduled / total) * 100 : 0;
                  const breaksShare = total > 0 ? (d.breaks / total) * 100 : 100;
                  return (
                    <Tooltip key={i} title={`${WEEKDAYS[i].label}: ${d.scheduled} class${d.scheduled === 1 ? '' : 'es'}, ${d.breaks} break${d.breaks === 1 ? '' : 's'}`}>
                      <Stack sx={{ width: 6, height: `${barHeightPct}%`, borderRadius: 0.5, overflow: 'hidden' }}>
                        <Box sx={{ height: `${breaksShare}%`, bgcolor: '#D1D5DB' }} />
                        <Box sx={{ height: `${scheduledShare}%`, bgcolor: '#16A34A' }} />
                      </Stack>
                    </Tooltip>
                  );
                })}
              </Stack>
            }
          />
        </StatCardShell>

        <StatCardShell
          icon={MenuBookIcon}
          iconColor="#2563EB"
          title={`My Subjects (${subjects.length})`}
          tooltip="Every subject on your class's timetable this week."
          loading={loading}
        >
          <Typography variant="h5" fontWeight={900} lineHeight={1} sx={{ mb: 0.5 }}>
            {subjects.length}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            {visibleSubjects.map((s) => (
              <Stack key={s.id} direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: getSubjectColor(s) }} />
                <Typography variant="caption" fontWeight={600}>
                  {s.name}
                </Typography>
              </Stack>
            ))}
            {moreSubjectsCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                +{moreSubjectsCount} more
              </Typography>
            )}
          </Stack>
        </StatCardShell>

        <StatCardShell
          icon={AccessTimeIcon}
          iconColor="#DC2626"
          title="Next Class"
          tooltip="The next class on your timetable, starting from now."
          loading={loading}
          linkText="View Details"
          onLinkClick={() => document.getElementById('my-timetable-learner-grid')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {stats.next_class ? (
            <>
              <Typography variant="body2" fontWeight={800}>
                {stats.next_class.subject_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {stats.next_class.is_today ? 'Today' : new Date(stats.next_class.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })},{' '}
                {stats.next_class.period.start_time?.slice(0, 5)} - {stats.next_class.period.end_time?.slice(0, 5)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Teacher: {stats.next_class.teacher_name || '—'}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nothing scheduled in the next week.
            </Typography>
          )}
        </StatCardShell>

        <StatCardShell
          icon={TrendingUpIcon}
          iconColor="#D97706"
          title="Attendance (This Term)"
          tooltip="Your attendance record for this term, as marked by your teachers in the daily register."
          loading={attendanceLoading}
        >
          <BarWithPct value={attendanceRate} mainLabel={`${attendanceRate}%`} subLabel={`${attendedDays} of ${totalDays} days attended`} barColor="#D97706" />
        </StatCardShell>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2 }}>
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          <Tooltip title="Your current academic session.">
            <span>
              <FormControl size="small" sx={{ minWidth: 160 }} disabled>
                <InputLabel>Session</InputLabel>
                <Select label="Session" value="current">
                  <MenuItem value="current">{academicInfo.academic_session || '—'}</MenuItem>
                </Select>
              </FormControl>
            </span>
          </Tooltip>
          <Tooltip title="Your current term — this page always shows the active term's timetable.">
            <span>
              <FormControl size="small" sx={{ minWidth: 160 }} disabled>
                <InputLabel>Term</InputLabel>
                <Select label="Term" value="current">
                  <MenuItem value="current">{academicInfo.academic_term || '—'}</MenuItem>
                </Select>
              </FormControl>
            </span>
          </Tooltip>
          <Tooltip title="Your current class — you can only see your own class's timetable.">
            <span>
              <FormControl size="small" sx={{ minWidth: 160 }} disabled>
                <InputLabel>Class</InputLabel>
                <Select label="Class" value="current">
                  <MenuItem value="current">{overview.class_name || '—'}</MenuItem>
                </Select>
              </FormControl>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Paper id="my-timetable-learner-grid" elevation={0} sx={{ flex: 1, minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Button size="small" startIcon={<ChevronLeftIcon fontSize="small" />} onClick={() => setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}>
              Previous Week
            </Button>
            <Typography variant="subtitle2" fontWeight={800}>
              Week: {formatShortDate(weekDates[0].date)} – {formatShortDate(weekDates[4].date)}
            </Typography>
            <Button size="small" endIcon={<ChevronRightIcon fontSize="small" />} onClick={() => setSelectedDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}>
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
                    <TableCell key={d.key} sx={{ whiteSpace: 'nowrap', color: isSameDay(d.date, today) ? '#2563EB' : undefined }}>
                      {d.label}
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}>
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
                        No timetable has been set up for your class yet.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  allPeriods.map((period) => {
                    if (period.is_break) {
                      const BreakIcon = getBreakIcon(period.label);
                      return (
                        <TableRow key={period.id}>
                          <TableCell sx={{ bgcolor: '#FEF3C7' }}>
                            <BreakIcon sx={{ fontSize: 16, color: '#92400E' }} />
                          </TableCell>
                          <TableCell colSpan={6} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                            {period.label} — {period.start_time?.slice(0, 5)}-{period.end_time?.slice(0, 5)}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={period.id}>
                        <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{period.label}</TableCell>
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
                          const subjectColor = getSubjectColor({ id: cell.subject_id, color: cell.subject_color });
                          const SubjectIcon = getSubjectIcon(cell.subject_name);
                          return (
                            <TableCell key={d.key}>
                              <Box
                                sx={{
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
                                      {cell.teacher_name || 'No teacher'}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
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
        </Paper>

        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, pb: 1 }}>
            <Tooltip title="Pick any date to see your schedule and attendance for that day.">
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5, width: 'fit-content' }}>
                <CalendarViewMonthIcon fontSize="small" sx={{ color: '#2563EB' }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Select Date
                </Typography>
              </Stack>
            </Tooltip>
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

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
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
                      key={row.id}
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
                          {row.teacher_name || 'No teacher'}
                        </Typography>
                      </Box>
                      <AttendanceBadge status={row.attendance_status} />
                    </Stack>
                  ))
                )}
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {QUICK_LINKS.map((link) => (
                <Tooltip key={link.label} title="Not available yet — coming soon">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: `${link.color}14`,
                      color: link.color,
                      cursor: 'not-allowed',
                    }}
                  >
                    <link.icon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" fontWeight={700} sx={{ color: link.color }}>
                      {link.label}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Paper>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default MyTimetableLearner;
