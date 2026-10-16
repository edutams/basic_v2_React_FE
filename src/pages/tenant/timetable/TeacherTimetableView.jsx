import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import staffApi from '@/api/tenant/staffs/staffApi';
import { getSubjectColor } from '@/utils/subjectColor';
import { StatCardShell, BarWithPct, LegendDot } from '@/components/shared/timetable/StatCardParts';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Autocomplete,
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', jsDay: 1 },
  { key: 'tuesday', label: 'Tuesday', jsDay: 2 },
  { key: 'wednesday', label: 'Wednesday', jsDay: 3 },
  { key: 'thursday', label: 'Thursday', jsDay: 4 },
  { key: 'friday', label: 'Friday', jsDay: 5 },
];

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

const STATUS_META = {
  attended: { icon: CheckCircleIcon, color: '#16A34A', label: 'Attended' },
  upcoming: { icon: AccessTimeIcon, color: '#D97706', label: 'Upcoming' },
  cancelled: { icon: CancelIcon, color: '#DC2626', label: 'Cancelled' },
  not_scheduled: { icon: HelpOutlineIcon, color: '#9CA3AF', label: 'Not Scheduled' },
};

const StatusIcon = ({ status }) => {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.icon;
  return <Icon fontSize="small" sx={{ color: meta.color }} />;
};

const emptyStats = {
  today: { total: 0, completed: 0, upcoming: 0, cancelled: 0 },
  this_week: { total: 0, attended: 0, cancelled: 0, percent: 0 },
  attendance_rate: { percent: 0, attended: 0, total: 0, sparkline: [0, 0, 0, 0, 0] },
  cancelled_this_week: 0,
  upcoming_next: null,
  subjects: [],
};

/**
 * Admin's "view any teacher's timetable" page — the exact same week-grid +
 * stat-card UI a subject teacher sees on their own My Timetable page (same
 * GET /timetable/teacher/{userId}/overview data shape as
 * GET /timetable/my-schedule-overview), driven by an admin-selected
 * teacher instead of the logged-in user. Read-only: no Mark Attendance /
 * Cancel Class here — that stays the teacher's own action on their own page.
 */
const TeacherTimetableView = () => {
  const notify = useNotification();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [overview, setOverview] = useState({ schedule: {}, stats: emptyStats });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await staffApi.getAll({ search: debouncedSearch, staff_type: 'teaching', per_page: 20 });
        setOptions(res.data || []);
      } catch {
        notify.error('Failed to search teachers');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [debouncedSearch, notify]);

  const fetchOverview = useCallback(
    async (userId, weekStartParam) => {
      setLoading(true);
      try {
        const res = await timetableApi.getTeacherScheduleOverview(userId, { week_start: weekStartParam });
        setOverview(res.data.data);
      } catch {
        notify.error('Failed to load teacher schedule');
      } finally {
        setLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    if (selectedTeacher) {
      fetchOverview(selectedTeacher.user_id, weekStartISO);
    } else {
      setOverview({ schedule: {}, stats: emptyStats });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacher, weekStartISO]);

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

  const teacherName = selectedTeacher?.user ? `${selectedTeacher.user.fname || ''} ${selectedTeacher.user.lname || ''}`.trim() : '';
  const sparkline = stats.attendance_rate.sparkline?.length ? stats.attendance_rate.sparkline : [0, 0, 0, 0, 0];

  return (
    <PageContainer title="Teacher Timetable View" description="View any subject teacher's full weekly teaching schedule.">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Teacher View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pick a subject teacher below to see exactly what their My Timetable looks like.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2 }}>
        <Autocomplete
          options={options}
          loading={optionsLoading}
          value={selectedTeacher}
          onChange={(_, value) => setSelectedTeacher(value)}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          getOptionLabel={(opt) => (opt.user ? `${opt.user.fname} ${opt.user.lname}` : '')}
          isOptionEqualToValue={(opt, value) => opt.user_id === value.user_id}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.user_id} sx={{ display: 'flex', gap: 1 }}>
              <Avatar src={option.user?.avatar} sx={{ width: 28, height: 28 }}>
                {option.user?.fname?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">{option.user ? `${option.user.fname} ${option.user.lname}` : '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.user_id}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for a subject teacher by name or staff ID..."
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
          sx={{ maxWidth: 420 }}
        />
      </Paper>

      {!selectedTeacher ? (
        <Alert severity="info">Search for and select a subject teacher above to view their weekly schedule.</Alert>
      ) : (
        <>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Avatar src={selectedTeacher.user?.avatar} sx={{ width: 32, height: 32 }}>
              {teacherName[0]}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={800}>
              {teacherName}
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.25, mb: 2 }}>
            <StatCardShell icon={TodayIcon} iconColor="#16A34A" title="Today's Classes" loading={loading}>
              <BarWithPct
                value={stats.today.total ? Math.round((stats.today.completed / stats.today.total) * 100) : 0}
                mainLabel={stats.today.total}
                subLabel={`${stats.today.completed} completed · ${stats.today.upcoming} upcoming`}
                barColor="#16A34A"
              />
            </StatCardShell>

            <StatCardShell icon={FactCheckIcon} iconColor="#2563EB" title="Attendance Rate" loading={loading}>
              <BarWithPct
                value={stats.attendance_rate.percent}
                mainLabel={`${stats.attendance_rate.percent}%`}
                subLabel={`${stats.attendance_rate.attended} of ${stats.attendance_rate.total} classes attended`}
                barColor="#2563EB"
                legend={
                  <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 16 }}>
                    {sparkline.map((v, i) => (
                      <Box key={i} sx={{ width: 6, height: `${Math.max(v, 8)}%`, bgcolor: v >= 70 ? '#16A34A' : v > 0 ? '#DC2626' : '#E5E7EB', borderRadius: 0.5 }} />
                    ))}
                  </Stack>
                }
              />
            </StatCardShell>

            <StatCardShell icon={EventRepeatIcon} iconColor="#7E22CE" title="Classes This Week" loading={loading}>
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

            <StatCardShell icon={ScheduleIcon} iconColor="#DC2626" title="Upcoming Next" loading={loading}>
              {stats.upcoming_next ? (
                <>
                  <Typography variant="body2" fontWeight={800}>
                    {stats.upcoming_next.subject_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {stats.upcoming_next.class_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(stats.upcoming_next.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                    {stats.upcoming_next.period.start_time?.slice(0, 5)}-{stats.upcoming_next.period.end_time?.slice(0, 5)}
                  </Typography>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Nothing scheduled in the next 2 weeks.
                </Typography>
              )}
            </StatCardShell>

            <StatCardShell icon={EventBusyIcon} iconColor="#D97706" title="Cancelled Classes" loading={loading}>
              <Typography variant="h5" fontWeight={900} lineHeight={1}>
                {stats.cancelled_this_week}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                This week
              </Typography>
            </StatCardShell>

            <StatCardShell icon={MenuBookIcon} iconColor="#0F766E" title={`Subjects Taught (${stats.subjects.length})`} loading={loading}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {stats.subjects.map((s) => (
                  <Stack key={s.id} direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: getSubjectColor(s) }} />
                    <Typography variant="caption" fontWeight={600}>
                      {s.name}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </StatCardShell>
          </Box>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
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
                  '& .MuiTableCell-root': { py: 0.6, px: 1, fontSize: '0.78rem', whiteSpace: 'nowrap' },
                  '& .MuiTableCell-head': { fontWeight: 800, bgcolor: '#F1F5F9' },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Time</TableCell>
                    {weekDates.map((d) => (
                      <TableCell key={d.key} sx={{ color: isSameDay(d.date, today) ? '#2563EB' : undefined }}>
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
                          No periods assigned to this teacher yet.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allPeriods.map((period) => {
                      if (period.is_break) {
                        return (
                          <TableRow key={period.id}>
                            <TableCell sx={{ bgcolor: '#FEF3C7' }}>—</TableCell>
                            <TableCell colSpan={6} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                              {period.label} — {period.start_time?.slice(0, 5)}-{period.end_time?.slice(0, 5)}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow key={period.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{period.label}</TableCell>
                          <TableCell>
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
                            return (
                              <TableCell key={d.key}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Box sx={{ minWidth: 0 }}>
                                    <Chip
                                      size="small"
                                      label={cell.subject_name}
                                      sx={{ bgcolor: subjectColor, color: '#fff', fontWeight: 700, height: 20 }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
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

            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <Stack key={key} direction="row" spacing={0.5} alignItems="center">
                  <meta.icon sx={{ fontSize: 16, color: meta.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {meta.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </>
      )}
    </PageContainer>
  );
};

export default TeacherTimetableView;
