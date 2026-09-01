import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import tenantApi from '@/api/tenant/tenant_api';
import { fetchSessionTerms, fetchActiveSessionTermId } from '@/api/tenant/session-term/sessionTermApi';
import { fetchWeeks } from '@/api/tenant/term-weeks/weekApi';
import { fetchHolidays } from '@/api/tenant/holidays/holidayApi';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';

dayjs.extend(isBetween);

const SchoolCalendar = ({ onViewFullCalendar }) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [loading, setLoading] = useState(true);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(dayjs());
  const [termStats, setTermStats] = useState({
    totalSchoolDays: 0,
    daysSpent: 0,
    daysRemaining: 0,
    totalHolidays: 0,
    pctCompleted: 0,
  });
  const [holidaysList, setHolidaysList] = useState([]);
  const [weeksList, setWeeksList] = useState([]);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const termBounds = useMemo(() => {
    if (!weeksList || weeksList.length === 0) return { startDate: null, endDate: null };
    const startDates = weeksList
      .map((w) => w.start_date)
      .filter(Boolean)
      .sort();
    const endDates = weeksList
      .map((w) => w.end_date)
      .filter(Boolean)
      .sort();
    if (startDates.length === 0 || endDates.length === 0) {
      return { startDate: null, endDate: null };
    }
    return {
      startDate: dayjs(startDates[0]),
      endDate: dayjs(endDates[endDates.length - 1]),
    };
  }, [weeksList]);

  const canPrevMonth = useMemo(() => {
    if (!termBounds.startDate) return true;
    return currentMonthDate.startOf('month').isAfter(termBounds.startDate.startOf('month'));
  }, [currentMonthDate, termBounds]);

  const canNextMonth = useMemo(() => {
    if (!termBounds.endDate) return true;
    return currentMonthDate.startOf('month').isBefore(termBounds.endDate.startOf('month'));
  }, [currentMonthDate, termBounds]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);

      const [acadResult, activeTermResult] = await Promise.allSettled([
        tenantApi.get('/school_setup/get_academic_info'),
        fetchActiveSessionTermId(),
      ]);

      if (acadResult.status === 'fulfilled') {
        setAcademicInfo(acadResult.value?.data || {});
      }

      let activeTermId = activeTermResult.status === 'fulfilled' ? activeTermResult.value : null;

      if (!activeTermId) {
        const sessionTermsRes = await fetchSessionTerms();
        const termsList = sessionTermsRes?.data ?? (Array.isArray(sessionTermsRes) ? sessionTermsRes : []);
        const activeTerm = termsList.find((t) => t.status === 'active') || termsList[0];
        activeTermId = activeTerm?.session_term_id;
      }

      if (activeTermId) {
        const [weeksRes, holidaysRes] = await Promise.allSettled([
          fetchWeeks(activeTermId),
          fetchHolidays(activeTermId),
        ]);

        const weeksData = weeksRes.status === 'fulfilled' ? weeksRes.value : null;
        const fetchedWeeks = weeksData?.data ?? [];
        setWeeksList(fetchedWeeks);

        const holidaysData = holidaysRes.status === 'fulfilled' ? holidaysRes.value : null;
        const fetchedHolidays = holidaysData?.data ?? [];
        setHolidaysList(fetchedHolidays);

        const startDates = fetchedWeeks
          .map((w) => w.start_date)
          .filter(Boolean)
          .sort();
        const endDates = fetchedWeeks
          .map((w) => w.end_date)
          .filter(Boolean)
          .sort();
        if (startDates.length > 0 && endDates.length > 0) {
          const termStart = dayjs(startDates[0]);
          const termEnd = dayjs(endDates[endDates.length - 1]);
          const today = dayjs();
          if (today.isBetween(termStart.startOf('month'), termEnd.endOf('month'), 'day', '[]')) {
            setCurrentMonthDate(today);
          } else {
            setCurrentMonthDate(termStart);
          }
        }

        if (weeksData?.stats) {
          const s = weeksData.stats;
          setTermStats({
            totalSchoolDays: s.total_school_days ?? 0,
            daysSpent: s.days_spent ?? 0,
            daysRemaining: s.remaining_school_days ?? 0,
            totalHolidays: s.holiday_days_allocated ?? 0,
            pctCompleted: s.pct_completed ?? 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load school calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [openModal, setOpenModal] = useState(false);

  const handlePrevMonth = () => {
    if (canPrevMonth) {
      setCurrentMonthDate((prev) => prev.subtract(1, 'month'));
    }
  };

  const handleNextMonth = () => {
    if (canNextMonth) {
      setCurrentMonthDate((prev) => prev.add(1, 'month'));
    }
  };

  const handleThisTerm = () => {
    setCurrentMonthDate(dayjs());
  };

  const handleViewFull = () => {
    setOpenModal(true);
  };

  const monthName = currentMonthDate.format('MMMM');
  const year = currentMonthDate.format('YYYY');

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonthDate.startOf('month');
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = currentMonthDate.daysInMonth();
    const todayStr = dayjs().format('YYYY-MM-DD');

    const days = [];

    // Muted days from previous month
    const prevMonth = currentMonthDate.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        muted: true,
        dateStr: prevMonth.date(prevMonthDays - i).format('YYYY-MM-DD'),
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = currentMonthDate.date(d);
      const dateStr = curDate.format('YYYY-MM-DD');
      const isToday = dateStr === todayStr;
      const dayOfWeek = curDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const holidayObj = holidaysList.find((h) => {
        if (h.start_date && h.end_date) {
          return curDate.isBetween(dayjs(h.start_date), dayjs(h.end_date), 'day', '[]');
        }
        return h.date === dateStr || h.start_date === dateStr;
      });

      const isHoliday = !!holidayObj;
      const holidayName = holidayObj?.name ?? '';

      const hasEvent =
        isHoliday || weeksList.some((w) => w.start_date === dateStr || w.end_date === dateStr);

      days.push({
        day: d,
        muted: false,
        selected: isToday,
        isWeekend,
        isHoliday,
        holidayName,
        event: hasEvent,
        dateStr,
      });
    }

    // Muted days for next month to round out grid
    const totalSoFar = days.length;
    const remainingCells = (7 - (totalSoFar % 7)) % 7;
    const nextMonth = currentMonthDate.add(1, 'month');
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        muted: true,
        dateStr: nextMonth.date(i).format('YYYY-MM-DD'),
      });
    }

    return days;
  }, [currentMonthDate, holidaysList, weeksList]);

  const renderCalendarDay = (date, index) => {
    const isToday = date.selected;

    const dayCell = (
      <Box
        key={`${date.dateStr}-${index}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: {
            xs: 31,
            sm: 33,
            md: 34,
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: 27,
              sm: 29,
              md: 31,
            },
            height: {
              xs: 27,
              sm: 29,
              md: 31,
            },
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',

            backgroundColor: isToday ? 'primary.main' : date.isHoliday ? '#fef3c7' : 'transparent',

            color: isToday
              ? '#ffffff'
              : date.isHoliday
                ? '#d97706'
                : date.muted
                  ? '#b7bec8'
                  : date.isWeekend
                    ? '#94a3b8'
                    : '#344054',

            fontSize: {
              xs: '10px',
              sm: '11px',
            },

            fontWeight: isToday || date.isHoliday ? 700 : 500,

            transition: 'all 0.2s ease',

            cursor: date.isHoliday ? 'pointer' : 'default',

            '&:hover': {
              backgroundColor: date.muted
                ? 'transparent'
                : isToday
                  ? 'primary.dark'
                  : date.isHoliday
                    ? '#fde68a'
                    : '#eef8f5',
            },
          }}
        >
          {date.day}
        </Box>
      </Box>
    );

    if (date.isHoliday && date.holidayName) {
      return (
        <Tooltip key={`${date.dateStr}-${index}`} title={date.holidayName} arrow placement="top">
          {dayCell}
        </Tooltip>
      );
    }

    return dayCell;
  };

  return (
    <ParentCard>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: {
            xs: 2,
            md: 2.2,
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: {
              xs: '15px',
              sm: '16px',
            },
            fontWeight: 700,
            color: '#182230',
          }}
        >
          School Calendar
        </Typography>

        <Button
          onClick={handleViewFull}
          variant="contained"
          endIcon={
            <ArrowForwardIcon
              sx={{
                fontSize: '14px !important',
              }}
            />
          }
          sx={{
            fontSize: {
              xs: '10px',
              sm: '11px',
            },
          }}
        >
          View full calendar
        </Button>
      </Box>

      {/* MONTH NAVIGATION */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >
        <IconButton
          size="small"
          disabled={!canPrevMonth}
          onClick={handlePrevMonth}
          sx={{
            width: 28,
            height: 28,
            color: '#344054',
            '&:hover': {
              backgroundColor: '#f5f7f8',
            },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontSize: {
              xs: '13px',
              sm: '14px',
            },
            fontWeight: 700,
            color: '#344054',
          }}
        >
          {monthName} {year}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            disabled={!canNextMonth}
            onClick={handleNextMonth}
            sx={{
              width: 28,
              height: 28,
              color: '#344054',
              '&:hover': {
                backgroundColor: '#f5f7f8',
              },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* THIS TERM BUTTON */}
      {/* <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={handleThisTerm}
            startIcon={
              <CalendarTodayOutlinedIcon
                sx={{
                  fontSize: "13px !important",
                }}
              />
            }
            sx={{
              minHeight: 27,
              px: 1,
              borderRadius: "5px",
              borderColor: "#e5e7eb",
              color: "#475467",
              textTransform: "none",
              fontSize: "9px",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#d0d5dd",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            This Term
          </Button>
        </Box> */}

      {/* WEEK DAYS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          mb: 0.4,
        }}
      >
        {weekDays.map((day) => (
          <Box
            key={day}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 27,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: '9px',
                  sm: '10px',
                },
                fontWeight: 600,
                color: '#667085',
              }}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* CALENDAR DAYS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          position: 'relative',
        }}
      >
        {calendarDays.map(renderCalendarDay)}
      </Box>

      {/* DAYS IN TERM STATS & LEGEND */}
      <Box
        sx={{
          mt: {
            xs: 1.5,
            md: 2,
          },
          pt: {
            xs: 1.5,
            md: 2,
          },
          borderTop: '1px solid #f0f2f4',
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: '11px',
              sm: '12px',
            },
            fontWeight: 700,
            color: '#344054',
            mb: 1.5,
          }}
        >
          Total Term Days
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr) auto',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5, md: 2 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: '18px',
                  sm: '20px',
                },
                fontWeight: 700,
                lineHeight: 1,
                color: 'primary.main',
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.totalSchoolDays}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: '9px', sm: '10px' },
                color: '#667085',
                lineHeight: 1.25,
              }}
            >
              School Days
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: '18px',
                  sm: '20px',
                },
                fontWeight: 700,
                lineHeight: 1,
                color: 'success.dark',
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.daysSpent}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: '9px', sm: '10px' },
                color: '#667085',
                lineHeight: 1.25,
              }}
            >
              Days Spent
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: '18px',
                  sm: '20px',
                },
                fontWeight: 700,
                lineHeight: 1,
                color: 'secondary.dark',
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.daysRemaining}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: '9px', sm: '10px' },
                color: '#667085',
                lineHeight: 1.25,
              }}
            >
              Days Left
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: '18px',
                  sm: '20px',
                },
                fontWeight: 700,
                lineHeight: 1,
                color: 'warning.dark',
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.totalHolidays}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: '9px', sm: '10px' },
                color: '#667085',
                lineHeight: 1.25,
              }}
            >
              Holidays
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: {
                xs: 52,
                sm: 58,
              },
              height: {
                xs: 52,
                sm: 58,
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={54}
              thickness={4}
              sx={{
                position: 'absolute',
                color: '#edf1f3',
              }}
            />

            <CircularProgress
              variant="determinate"
              value={loading ? 0 : termStats.pctCompleted}
              size={54}
              thickness={4}
              sx={{
                color: '#159a72',
                transform: 'rotate(-90deg)',
                strokeLinecap: 'round',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: '11px',
                    sm: '12px',
                  },
                  fontWeight: 800,
                  lineHeight: 1,
                  color: '#182230',
                }}
              >
                {loading ? '...' : `${termStats.pctCompleted}%`}
              </Typography>

              <Typography
                sx={{
                  fontSize: '8px',
                  fontWeight: 600,
                  color: '#667085',
                  mt: 0.2,
                }}
              >
                Completed
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <SchoolCalendarModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        weeks={weeksList}
        holidays={holidaysList}
        termStats={termStats}
      />
    </ParentCard>
  );
};

const SchoolCalendarModal = ({ open, onClose, weeks, holidays, termStats }) => {
  const [tab, setTab] = useState(0);

  const renderStatusChip = (status, isCurrent) => {
    const labelText = isCurrent ? 'Current Week' : status || 'Active';
    const st = isCurrent ? 'primary' : (status || 'active').toLowerCase();

    let paletteKey = 'success';
    if (st === 'primary' || isCurrent) paletteKey = 'primary';
    else if (st === 'upcoming' || st === 'pending') paletteKey = 'warning';
    else if (st === 'completed' || st === 'ended') paletteKey = 'info';
    else if (st === 'inactive' || st === 'deactivated' || st === 'error') paletteKey = 'error';

    return (
      <Chip
        label={labelText}
        size="small"
        sx={{
          bgcolor: (theme) => theme.palette[paletteKey]?.light,
          color: (theme) => theme.palette[paletteKey]?.main,
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '11px',
          textTransform: 'capitalize',
        }}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarTodayOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
              School Calendar Breakdown
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Active Term Schedule & Academic Weeks
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {/* TERM PROGRESS BAR */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1px solid #fed7aa',
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
              Term Completion Progress
            </Typography>
            <Chip
              label={`${termStats.pctCompleted}% Complete`}
              size="small"
              sx={{
                bgcolor: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 11,
                height: 22,
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={termStats.pctCompleted}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(234, 88, 12, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ea580c',
                borderRadius: 4,
              },
            }}
          />

          <Typography sx={{ fontSize: 11.5, color: '#c2410c', mt: 1, fontWeight: 500 }}>
            {termStats.daysSpent} days spent • {termStats.totalHolidays} holiday days allocated •{' '}
            {termStats.daysRemaining} days remaining.
          </Typography>
        </Paper>

        {/* STATS OVERVIEW CARDS */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              count={termStats.totalSchoolDays}
              label="Total School Days"
              icon={CalendarTodayOutlinedIcon}
              colorIndex={0}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              count={termStats.daysSpent}
              label="Days Spent"
              icon={CheckCircleOutlineOutlinedIcon}
              colorIndex={1}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              count={termStats.daysRemaining}
              label="Days Left"
              icon={AccessTimeOutlinedIcon}
              colorIndex={2}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              count={termStats.totalHolidays}
              label="Holidays"
              icon={BeachAccessOutlinedIcon}
              colorIndex={3}
            />
          </Grid>
        </Grid>

        {/* TABS HEADER */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`Academic Weeks (${weeks.length})`} />
            <Tab label={`Holidays (${holidays.length})`} />
          </Tabs>
        </Box>

        {/* TAB 0: WEEKS TABLE */}
        {tab === 0 && (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #eaecf0', borderRadius: '8px' }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    S/N
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    Week Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    Start Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}
                    align="center"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeks.length > 0 ? (
                  weeks.map((w, idx) => {
                    const sDate = w.start_date ? dayjs(w.start_date).format('MMM D, YYYY') : '—';
                    const eDate = w.end_date ? dayjs(w.end_date).format('MMM D, YYYY') : '—';
                    const isCurrent = dayjs().isBetween(
                      dayjs(w.start_date),
                      dayjs(w.end_date),
                      'day',
                      '[]',
                    );

                    return (
                      <TableRow key={w.id || idx} hover>
                        <TableCell sx={{ fontSize: '12.5px' }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12.5px' }}>
                          {w.week_name || `Week ${idx + 1}`}
                        </TableCell>
                        <TableCell sx={{ fontSize: '12.5px', color: '#475569' }}>{sDate}</TableCell>
                        <TableCell sx={{ fontSize: '12.5px', color: '#475569' }}>{eDate}</TableCell>
                        <TableCell align="center">
                          {renderStatusChip(w.status, isCurrent)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 3, color: 'text.secondary', fontSize: '13px' }}
                    >
                      No weeks generated for this term yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 1: HOLIDAYS TABLE */}
        {tab === 1 && (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #eaecf0', borderRadius: '8px' }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    S/N
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    Holiday Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    Start Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#475569' }}>
                    End Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.length > 0 ? (
                  holidays.map((h, idx) => (
                    <TableRow key={h.id || idx} hover>
                      <TableCell sx={{ fontSize: '12.5px' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12.5px' }}>
                        {h.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12.5px', color: '#475569' }}>
                        {h.start_date ? dayjs(h.start_date).format('MMM D, YYYY') : '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12.5px', color: '#475569' }}>
                        {h.end_date ? dayjs(h.end_date).format('MMM D, YYYY') : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 3, color: 'text.secondary', fontSize: '13px' }}
                    >
                      No holidays registered for this term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { SchoolCalendarModal };
export default SchoolCalendar;
