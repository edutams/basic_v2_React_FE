import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { getSubjectColor } from '@/utils/subjectColor';
import { TenantAuthContext } from '@/context/TenantContext/auth';
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
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', jsDay: 1 },
  { key: 'tuesday', label: 'Tuesday', jsDay: 2 },
  { key: 'wednesday', label: 'Wednesday', jsDay: 3 },
  { key: 'thursday', label: 'Thursday', jsDay: 4 },
  { key: 'friday', label: 'Friday', jsDay: 5 },
];

const todayKey = () => WEEKDAYS.find((d) => d.jsDay === new Date().getDay())?.key || null;

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // back up to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatShortDate = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/**
 * Shared teacher/learner "my timetable" page — the backend's
 * GET /timetable/my-schedule resolves which one to return and returns a
 * full week (Monday-Friday), day-keyed. A teacher's day arrays hold flat
 * `slot_id` rows (one per class they teach that day); a learner's hold
 * `{period, slot}` grid rows (their class's full period list, including
 * breaks) — detected here by shape, not by role.
 *
 * Attendance confirmation (Mark Attendance / Cancel Class / Attendance
 * Rate) from the reference design is NOT built — it needs a real
 * per-calendar-date occurrence record this app doesn't have yet. This page
 * shows the real weekly schedule only; it doesn't fabricate attendance data.
 */
const MyTimetable = () => {
  const notify = useNotification();
  const { user } = useContext(TenantAuthContext) || {};
  const [weekSchedule, setWeekSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await timetableApi.getMySchedule();
      setWeekSchedule(res.data.data || {});
    } catch {
      notify.error('Failed to load your timetable');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const weekDates = useMemo(() => {
    const monday = startOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return WEEKDAYS.map((d, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      return { ...d, date };
    });
  }, [weekOffset]);

  const isTeacherShape = useMemo(() => {
    const firstDayWithRows = Object.values(weekSchedule).find((rows) => rows?.length);
    return Boolean(firstDayWithRows && 'slot_id' in firstDayWithRows[0]);
  }, [weekSchedule]);

  // Union of periods across the week (teacher rows don't include breaks,
  // so this is built from whichever day has the most complete period list).
  const allPeriods = useMemo(() => {
    const map = new Map();
    Object.values(weekSchedule).forEach((rows) => {
      (rows || []).forEach((row) => {
        const period = isTeacherShape ? row.period : row.period;
        if (period && !map.has(period.id)) map.set(period.id, period);
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [weekSchedule, isTeacherShape]);

  const cellFor = (dayKey, periodId) => {
    const rows = weekSchedule[dayKey] || [];
    if (isTeacherShape) {
      return rows.find((r) => r.period.id === periodId) || null;
    }
    const row = rows.find((r) => r.period.id === periodId);
    return row?.slot ? { ...row.slot, period: row.period } : null;
  };

  const today = todayKey();
  const todaysClasses = isTeacherShape ? weekSchedule[today] || [] : [];
  const totalClassesThisWeek = isTeacherShape
    ? WEEKDAYS.reduce((sum, d) => sum + (weekSchedule[d.key]?.length || 0), 0)
    : 0;
  const mySubjects = useMemo(() => {
    if (!isTeacherShape) return [];
    const map = new Map();
    Object.values(weekSchedule).forEach((rows) => {
      (rows || []).forEach((row) => {
        if (!map.has(row.subject_id)) {
          map.set(row.subject_id, { id: row.subject_id, name: row.subject_name, color: getSubjectColor({ id: row.subject_id, color: row.subject_color }) });
        }
      });
    });
    return Array.from(map.values());
  }, [weekSchedule, isTeacherShape]);

  const fullName = user ? `${user.fname || ''} ${user.lname || ''}`.trim() : '';

  return (
    <PageContainer title="My Timetable" description="View your weekly class schedule.">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              My Timetable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isTeacherShape ? 'View your weekly teaching schedule.' : 'View your class schedule.'}
            </Typography>
          </Box>
        </Stack>
        {fullName && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 0.75 }}>
            <Avatar src={user?.avatar} sx={{ width: 28, height: 28 }}>
              {fullName[0]}
            </Avatar>
            <Typography variant="body2" fontWeight={700}>
              {fullName}
            </Typography>
          </Stack>
        )}
      </Stack>

      {isTeacherShape && (
        <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          <Paper elevation={0} sx={{ flex: '1 1 160px', bgcolor: '#DCFCE7', borderRadius: 2, p: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TodayIcon sx={{ color: '#166534', fontSize: 22 }} />
              {loading ? <Skeleton variant="text" width={30} height={30} /> : (
                <Typography variant="h5" fontWeight={900} color="#166534" lineHeight={1}>
                  {todaysClasses.length}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" fontWeight={700} color="#14532D" sx={{ display: 'block', mt: 0.5 }}>
              Today&apos;s Classes
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{ flex: '1 1 160px', bgcolor: '#F3E8FF', borderRadius: 2, p: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventRepeatIcon sx={{ color: '#7E22CE', fontSize: 22 }} />
              {loading ? <Skeleton variant="text" width={30} height={30} /> : (
                <Typography variant="h5" fontWeight={900} color="#7E22CE" lineHeight={1}>
                  {totalClassesThisWeek}
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" fontWeight={700} color="#6B21A8" sx={{ display: 'block', mt: 0.5 }}>
              Classes This Week
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{ flex: '1 1 220px', bgcolor: '#DBEAFE', borderRadius: 2, p: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <MenuBookIcon sx={{ color: '#1D4ED8', fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={800} color="#1E3A8A">
                My Subjects ({mySubjects.length})
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {mySubjects.map((s) => (
                <Stack key={s.id} direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color }} />
                  <Typography variant="caption" fontWeight={600}>
                    {s.name}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Button size="small" startIcon={<ChevronLeftIcon fontSize="small" />} onClick={() => setWeekOffset((w) => w - 1)}>
            Previous Week
          </Button>
          <Typography variant="subtitle2" fontWeight={800}>
            Week: {formatShortDate(weekDates[0].date)} – {formatShortDate(weekDates[4].date)}
          </Typography>
          <Button size="small" endIcon={<ChevronRightIcon fontSize="small" />} onClick={() => setWeekOffset((w) => w + 1)}>
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
                  <TableCell key={d.key} sx={{ color: d.key === today && weekOffset === 0 ? '#2563EB' : undefined }}>
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
                            <Chip
                              size="small"
                              label={cell.subject_name}
                              sx={{ bgcolor: subjectColor, color: '#fff', fontWeight: 700, height: 20 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                              {cell.class_name || cell.room_name || ''}
                            </Typography>
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
    </PageContainer>
  );
};

export default MyTimetable;
