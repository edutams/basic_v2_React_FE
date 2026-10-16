import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import staffApi from '@/api/tenant/staffs/staffApi';
import { getSubjectColor } from '@/utils/subjectColor';
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
 * Admin's "view any teacher's timetable" page — same week-grid + stat-card
 * UI as the teacher's own My Timetable page, but driven by an
 * admin-selected teacher (via the search picker below) instead of the
 * logged-in user. Backs onto the same GET /timetable/teacher/{userId}
 * endpoint MyTimetable's teacher-shape response comes from, so the two
 * pages never drift apart in what a "week schedule" looks like.
 */
const TeacherTimetableView = () => {
  const notify = useNotification();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await staffApi.getAll({ search: debouncedSearch, staff_type: 'teaching', per_page: 20 });
        setOptions(res.data?.data || []);
      } catch {
        notify.error('Failed to search teachers');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [debouncedSearch, notify]);

  const fetchSchedule = useCallback(
    async (userId) => {
      setLoading(true);
      try {
        const res = await timetableApi.getTeacherSchedule(userId);
        setWeekSchedule(res.data.data || {});
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
      fetchSchedule(selectedTeacher.user_id);
    } else {
      setWeekSchedule({});
    }
  }, [selectedTeacher, fetchSchedule]);

  const weekDates = useMemo(() => {
    const monday = startOfWeek(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return WEEKDAYS.map((d, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      return { ...d, date };
    });
  }, [weekOffset]);

  const allPeriods = useMemo(() => {
    const map = new Map();
    Object.values(weekSchedule).forEach((rows) => {
      (rows || []).forEach((row) => {
        if (row.period && !map.has(row.period.id)) map.set(row.period.id, row.period);
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [weekSchedule]);

  const cellFor = (dayKey, periodId) => (weekSchedule[dayKey] || []).find((r) => r.period.id === periodId) || null;

  const today = todayKey();
  const todaysClasses = weekSchedule[today] || [];
  const totalClassesThisWeek = WEEKDAYS.reduce((sum, d) => sum + (weekSchedule[d.key]?.length || 0), 0);
  const subjectsTaught = useMemo(() => {
    const map = new Map();
    Object.values(weekSchedule).forEach((rows) => {
      (rows || []).forEach((row) => {
        if (!map.has(row.subject_id)) {
          map.set(row.subject_id, {
            id: row.subject_id,
            name: row.subject_name,
            color: getSubjectColor({ id: row.subject_id, color: row.subject_color }),
          });
        }
      });
    });
    return Array.from(map.values());
  }, [weekSchedule]);

  const teacherName = selectedTeacher?.user ? `${selectedTeacher.user.fname || ''} ${selectedTeacher.user.lname || ''}`.trim() : '';

  return (
    <PageContainer title="Teacher Timetable View" description="View any teacher's full weekly teaching schedule.">
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
              Pick a subject teacher below to see what their weekly timetable looks like.
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

          <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Paper elevation={0} sx={{ flex: '1 1 160px', bgcolor: '#DCFCE7', borderRadius: 2, p: 1.25 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TodayIcon sx={{ color: '#166534', fontSize: 22 }} />
                {loading ? (
                  <Skeleton variant="text" width={30} height={30} />
                ) : (
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
                {loading ? (
                  <Skeleton variant="text" width={30} height={30} />
                ) : (
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
                  Subjects Taught ({subjectsTaught.length})
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {subjectsTaught.map((s) => (
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
                          No periods assigned to this teacher yet.
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allPeriods.map((period) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </>
      )}
    </PageContainer>
  );
};

export default TeacherTimetableView;
