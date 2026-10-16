import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { getSubjectColor } from '@/utils/subjectColor';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
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
  Chip,
  Skeleton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  LinearProgress,
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
  attended: { icon: CheckCircleIcon, color: '#16A34A', label: 'Attended' },
  upcoming: { icon: AccessTimeIcon, color: '#D97706', label: 'Upcoming' },
  cancelled: { icon: CancelIcon, color: '#DC2626', label: 'Cancelled' },
  not_scheduled: { icon: HelpOutlineIcon, color: '#9CA3AF', label: 'Not Scheduled' },
};

const StatusIcon = ({ status, fontSize = 'small' }) => {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  return <Icon fontSize={fontSize} sx={{ color: meta.color }} />;
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
      setLoading(true);
      try {
        const res = await timetableApi.getMyScheduleOverview({ week_start: weekStartParam });
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

  const schedule = overview.schedule || {};
  const stats = overview.stats || emptyStats;

  const allPeriods = useMemo(() => {
    const map = new Map();
    Object.values(schedule).forEach((rows) => {
      (rows || []).forEach((row) => {
        if (row.period && !map.has(row.period.id)) map.set(row.period.id, row.period);
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.start_time || '').localeCompare(b.start_time || ''),
    );
  }, [schedule]);

  const cellFor = (dayKey, periodId) =>
    (schedule[dayKey] || []).find((r) => r.period.id === periodId) || null;

  const selectedDayKey = dayKeyOf(selectedDate);
  const selectedDayRows = useMemo(
    () =>
      selectedDayKey
        ? (schedule[selectedDayKey] || [])
            .slice()
            .sort((a, b) => (a.period.start_time || '').localeCompare(b.period.start_time || ''))
        : [],
    [schedule, selectedDayKey],
  );

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

  const sparkline = stats.attendance_rate.sparkline?.length
    ? stats.attendance_rate.sparkline
    : [0, 0, 0, 0, 0];
  const maxSparkline = Math.max(...sparkline, 1);

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

      <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
        <Paper
          elevation={0}
          sx={{ flex: '1 1 160px', bgcolor: '#DCFCE7', borderRadius: 2, p: 1.25 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TodayIcon sx={{ color: '#166534', fontSize: 22 }} />
            {loading ? (
              <Skeleton variant="text" width={30} height={30} />
            ) : (
              <Typography variant="h5" fontWeight={900} color="#166534" lineHeight={1}>
                {stats.today.total}
              </Typography>
            )}
          </Stack>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#14532D"
            sx={{ display: 'block', mt: 0.5 }}
          >
            Today&apos;s Classes
          </Typography>
          {!loading && (
            <Typography variant="caption" color="#166534" sx={{ display: 'block' }}>
              {stats.today.completed} completed · {stats.today.upcoming} upcoming
            </Typography>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{ flex: '1 1 180px', bgcolor: '#EFF6FF', borderRadius: 2, p: 1.25 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FactCheckIcon sx={{ color: '#1D4ED8', fontSize: 22 }} />
            {loading ? (
              <Skeleton variant="text" width={40} height={30} />
            ) : (
              <Typography variant="h5" fontWeight={900} color="#1D4ED8" lineHeight={1}>
                {stats.attendance_rate.percent}%
              </Typography>
            )}
          </Stack>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#1E3A8A"
            sx={{ display: 'block', mt: 0.5 }}
          >
            Attendance Rate
          </Typography>
          {!loading && (
            <>
              <Typography variant="caption" color="#1D4ED8" sx={{ display: 'block', mb: 0.5 }}>
                {stats.attendance_rate.attended} of {stats.attendance_rate.total} classes attended
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 18 }}>
                {sparkline.map((v, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 6,
                      height: `${Math.max((v / maxSparkline) * 100, 8)}%`,
                      bgcolor: v >= 70 ? '#16A34A' : v > 0 ? '#DC2626' : '#E5E7EB',
                      borderRadius: 0.5,
                    }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Last 5 school weeks
              </Typography>
            </>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{ flex: '1 1 180px', bgcolor: '#F3E8FF', borderRadius: 2, p: 1.25 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <EventRepeatIcon sx={{ color: '#7E22CE', fontSize: 22 }} />
            {loading ? (
              <Skeleton variant="text" width={30} height={30} />
            ) : (
              <Typography variant="h5" fontWeight={900} color="#7E22CE" lineHeight={1}>
                {stats.this_week.total}
              </Typography>
            )}
          </Stack>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#6B21A8"
            sx={{ display: 'block', mt: 0.5 }}
          >
            Classes This Week
          </Typography>
          {!loading && (
            <>
              <LinearProgress
                variant="determinate"
                value={stats.this_week.percent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  my: 0.5,
                  bgcolor: '#E9D5FF',
                  '& .MuiLinearProgress-bar': { bgcolor: '#7E22CE' },
                }}
              />
              <Typography variant="caption" color="#6B21A8">
                {stats.this_week.attended} attended · {stats.this_week.cancelled} cancelled ·{' '}
                {stats.this_week.percent}%
              </Typography>
            </>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{ flex: '1 1 220px', bgcolor: '#FEF2F2', borderRadius: 2, p: 1.25 }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            color="#B91C1C"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <ScheduleIcon fontSize="small" /> Upcoming Next
          </Typography>
          {loading ? (
            <Skeleton variant="text" height={30} />
          ) : stats.upcoming_next ? (
            <>
              <Typography variant="body2" fontWeight={800} sx={{ mt: 0.5 }}>
                {stats.upcoming_next.subject_name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
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
                onClick={() =>
                  openAction({
                    slot_id: stats.upcoming_next.slot_id,
                    date: stats.upcoming_next.date,
                    subject_name: stats.upcoming_next.subject_name,
                    class_name: stats.upcoming_next.class_name,
                    period: stats.upcoming_next.period,
                    status: 'upcoming',
                  })
                }
                sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
              >
                Confirm Attendance
              </Button>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Nothing scheduled in the next 2 weeks.
            </Typography>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{ flex: '1 1 160px', bgcolor: '#FFFBEB', borderRadius: 2, p: 1.25 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <EventBusyIcon sx={{ color: '#D97706', fontSize: 22 }} />
            {loading ? (
              <Skeleton variant="text" width={30} height={30} />
            ) : (
              <Typography variant="h5" fontWeight={900} color="#B45309" lineHeight={1}>
                {stats.cancelled_this_week}
              </Typography>
            )}
          </Stack>
          <Typography
            variant="caption"
            fontWeight={700}
            color="#92400E"
            sx={{ display: 'block', mt: 0.5 }}
          >
            Cancelled Classes
          </Typography>
          <Typography variant="caption" color="#B45309">
            This week
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{ flex: '1 1 220px', bgcolor: '#F0FDFA', borderRadius: 2, p: 1.25 }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <MenuBookIcon sx={{ color: '#0F766E', fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={800} color="#115E59">
              My Subjects ({stats.subjects.length})
            </Typography>
          </Stack>
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
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Paper
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
                          const clickable = isActionable(cell.status);
                          return (
                            <TableCell
                              key={d.key}
                              onClick={() => clickable && openAction(cell)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                '&:hover': clickable ? { bgcolor: 'action.hover' } : undefined,
                              }}
                            >
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Box sx={{ minWidth: 0 }}>
                                  <Chip
                                    size="small"
                                    label={cell.subject_name}
                                    sx={{
                                      bgcolor: subjectColor,
                                      color: '#fff',
                                      fontWeight: 700,
                                      height: 20,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 0.25 }}
                                  >
                                    {cell.class_name}
                                  </Typography>
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
                <Stack key={key} direction="row" spacing={0.5} alignItems="center">
                  <meta.icon sx={{ fontSize: 16, color: meta.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {meta.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Click on a class to confirm attendance or cancel.
            </Typography>
          </Stack>
        </Paper>

        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
              Select Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={dayjs(selectedDate)}
                onChange={(value) => value && setSelectedDate(value.toDate())}
                sx={{ width: '100%', '& .MuiPickersCalendarHeader-root': { pl: 0.5, pr: 0.5 } }}
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
                      <StatusIcon status={row.status} />
                    )}
                  </Stack>
                ))
              )}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}
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
                    onClick={() =>
                      openAction({
                        slot_id: stats.upcoming_next.slot_id,
                        date: stats.upcoming_next.date,
                        subject_name: stats.upcoming_next.subject_name,
                        class_name: stats.upcoming_next.class_name,
                        period: stats.upcoming_next.period,
                        status: 'upcoming',
                      })
                    }
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
                onClick={() => {
                  openAction({
                    slot_id: stats.upcoming_next.slot_id,
                    date: stats.upcoming_next.date,
                    subject_name: stats.upcoming_next.subject_name,
                    class_name: stats.upcoming_next.class_name,
                    period: stats.upcoming_next.period,
                    status: 'upcoming',
                  });
                  setActionMode('cancel');
                }}
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
