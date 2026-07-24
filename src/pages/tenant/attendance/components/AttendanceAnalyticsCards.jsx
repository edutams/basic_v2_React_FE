import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  WarningAmberOutlined as WarningIcon,
  CalendarMonth as CalendarMonthIcon,
  TrendingFlat as TrendingFlatIcon,
  TrendingUp as TrendingUpIcon,
  EventNote as EventNoteIcon,
  // AnalyticsOutlined as AnalyticsIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusableBarChart from '@/components/shared/charts/ReusableBarChart';
import AnalyticsModal from './AnalyticsModal';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';

// ── Theme-aware stat card ──────────────────────────────────────
const StatCard = ({ children, colorName, colorIndex = 0, clickable = false, onClick, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(clickable
          ? {
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDark
                  ? '0 8px 30px rgba(0,0,0,0.35)'
                  : '0 6px 24px rgba(0,0,0,0.12)',
              },
            }
          : {}),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

// ── Main Component ─────────────────────────────────────────────
const AttendanceAnalyticsCards = ({ metrics, classArmId, sessionId, termId, weekId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null, loading: false });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  // Fetch daily breakdown data for week chart
  const openWeekBreakdown = useCallback(async (classArmId, _weekId) => {
    setAnalyticsModal({ open: true, title: 'Week Attendance Rate Analysis', content: null, loading: true });
    try {
      const res = await attendanceApi.getDailyBreakdown({ class_arm_id: classArmId, week_term_id: _weekId || weekId, session_id: sessionId || undefined, term_id: termId || undefined });
      const data = res.data?.data || [];
      openCardModal('Week Attendance Rate Analysis', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Daily learner attendance rate for the selected week.
          </Typography>
          <ReusableBarChart
            series={[{ name: 'Attendance %', data: data.map((d) => d.rate) }]}
            categories={data.map((d) => d.day_name)}
            colors={[theme.palette.warning.main]}
            height={280}
            yAxisFormatter={(val) => `${val}%`}
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch daily breakdown:', e);
      openCardModal('Week Attendance Rate Analysis', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [theme, sessionId, termId]);

  // Fetch weekly trend data for term chart
  const openTermTrend = useCallback(async (classArmId) => {
    setAnalyticsModal({ open: true, title: 'Term Attendance Trend', content: null, loading: true });
    try {
      const res = await attendanceApi.getWeeklyTrend({ class_arm_id: classArmId, session_id: sessionId || undefined, term_id: termId || undefined });
      const data = res.data?.data || [];
      openCardModal('Term Attendance Trend', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Term-to-date attendance performance trend across all weeks.
          </Typography>
          <ReusableBarChart
            series={[{ name: 'Attendance %', data: data.map((w) => w.rate) }]}
            categories={data.map((w) => w.week_name)}
            colors={[theme.palette.info.main]}
            height={280}
            yAxisFormatter={(val) => `${val}%`}
            xAxisTitle="Week"
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch weekly trend:', e);
      openCardModal('Term Attendance Trend', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [theme, sessionId, termId]);

  // Fetch real absentees breakdown by class arm
  const openAbsenteesBreakdown = useCallback(async () => {
    setAnalyticsModal({ open: true, title: 'Absentees Summary', content: null, loading: true });
    try {
      const res = await attendanceApi.getAbsenteesList({ class_arm_id: classArmId || undefined, week_term_id: weekId || undefined, session_id: sessionId || undefined, term_id: termId || undefined });
      const payload = res.data?.data || {};
      const byArm = payload.by_arm || [];

      if (byArm.length === 0) {
        openCardModal('Absentees Summary', (
          <Typography color="text.secondary">No absentees recorded for the selected filters.</Typography>
        ));
        return;
      }

      openCardModal('Absentees Summary', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Absentee counts by class arm — learners with no attendance in the last 3 days.
          </Typography>
          <ReusableBarChart
            series={[{ name: 'Absences', data: byArm.map((a) => a.count) }]}
            categories={byArm.map((a) => a.arm_name)}
            colors={[theme.palette.error.main]}
            height={280}
            xAxisTitle="Class Arm"
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch absentees:', e);
      openCardModal('Absentees Summary', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [classArmId, sessionId, termId]);

  // Fetch real at-risk learners breakdown by class arm
  const openAtRiskBreakdown = useCallback(async () => {
    setAnalyticsModal({ open: true, title: 'At-Risk Learners Overview', content: null, loading: true });
    try {
      const res = await attendanceApi.getAtRiskLearners({ class_arm_id: classArmId || undefined, week_term_id: weekId || undefined, session_id: sessionId || undefined, term_id: termId || undefined });
      const payload = res.data?.data || {};
      const byArm = payload.by_arm || [];

      if (byArm.length === 0) {
        openCardModal('At-Risk Learners Overview', (
          <Typography color="text.secondary">No at-risk learners for the selected filters.</Typography>
        ));
        return;
      }

      openCardModal('At-Risk Learners Overview', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            At-risk learner counts by class arm — learners with 1+ week consecutive absence.
          </Typography>
          <ReusableBarChart
            series={[{ name: 'At-Risk Learners', data: byArm.map((a) => a.count) }]}
            categories={byArm.map((a) => a.arm_name)}
            colors={[theme.palette.error.main]}
            height={280}
            xAxisTitle="Class Arm"
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch at-risk learners:', e);
      openCardModal('At-Risk Learners Overview', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [classArmId, sessionId, termId]);

  const colors = {
    success: getStatCardColor('success', 1, isDark, theme),
    warning: getStatCardColor('warning', 3, isDark, theme),
    info: getStatCardColor('info', 2, isDark, theme),
    error: getStatCardColor('error', 4, isDark, theme),
    secondary: getStatCardColor('secondary', 5, isDark, theme),
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: DAYS SCHOOL OPEN */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard colorName="success" colorIndex={1}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.success.accentColor,
                textTransform: 'uppercase',
              }}
            >
              DAYS SCHOOL OPEN
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.success.accentColor }}
            >
              {metrics.daysOpen}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.daysOpen}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.success.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              >
                126 out of 130
              </Typography>
              <CalendarMonthIcon sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
            </Stack>
          </StatCard>
        </Grid>

        {/* Card 2: WEEK ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view weekly attendance breakdown" arrow placement="top">
            <StatCard
            colorName="warning"
            colorIndex={3}
            clickable
            onClick={() => openWeekBreakdown(classArmId, undefined)}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.warning.accentColor,
                textTransform: 'uppercase',
              }}
            >
              WEEK ATTENDANCE RATE
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.warning.accentColor }}
            >
              {metrics.weekRate}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.weekRate}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.warning.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              >
                0% Same as last week
              </Typography>
              <TrendingFlatIcon sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
            </Stack>
          </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 3: TERM ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view term attendance trend" arrow placement="top">
            <StatCard
            colorName="info"
            colorIndex={2}
            clickable
            onClick={() => openTermTrend(classArmId)}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.info.accentColor,
                textTransform: 'uppercase',
              }}
            >
              TERM ATTENDANCE RATE
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.info.accentColor }}
            >
              {metrics.termRate}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.termRate}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.info.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: colors.info.accentColor }}
              >
                ↑ 44% Higher last term
              </Typography>
              <TrendingUpIcon sx={{ fontSize: 14, color: colors.info.accentColor }} />
            </Stack>
          </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 4: TOTAL ABSENTEES */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view absentees breakdown by class arm" arrow placement="top">
            <StatCard
              colorName="error"
              colorIndex={4}
              clickable
              onClick={openAbsenteesBreakdown}
              sx={{ position: 'relative' }}
            >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.error.accentColor,
                textTransform: 'uppercase',
              }}
            >
              TOTAL ABSENTEES
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.error.accentColor }}
            >
              {metrics.totalAbsentees}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={30}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.error.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              >
                Current Session
              </Typography>
              <EventNoteIcon sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
            </Stack>
          </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 5: AT-RISK STUDENTS */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Tooltip title="Click to view at-risk learners by class arm" arrow placement="top">
            <StatCard
            colorName="error"
            colorIndex={4}
            clickable
            onClick={openAtRiskBreakdown}
            sx={{
              border: (t) =>
                t.palette.mode === 'dark'
                  ? '2px solid rgba(239,68,68,0.5)'
                  : `2px solid ${colors.error.accentColor}`,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: colors.error.accentColor, textTransform: 'uppercase' }}
            >
              AT-RISK STUDENTS
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: colors.error.accentColor }}
            >
              {metrics.atRisk}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={15}
              sx={{
                my: 1,
                height: 5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.error.accentColor,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography
                variant="caption"
                sx={{ color: colors.error.accentColor }}
              >
                1+ Week Absence
              </Typography>
              <WarningIcon sx={{ fontSize: 13, color: colors.error.accentColor }} />
            </Stack>
          </StatCard>
          </Tooltip>
        </Grid>
      </Grid>

      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
      />
    </>
  );
};

export default AttendanceAnalyticsCards;
