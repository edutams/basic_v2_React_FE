import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  PeopleOutline as PeopleOutlineIcon,
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
const AttendanceAnalyticsCards = ({ metrics }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

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
            onClick={() =>
              openCardModal('Week Attendance Rate Analysis', (
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Daily attendance breakdown for the selected week.
                  </Typography>
                  <ReusableBarChart
                    series={[
                      { name: 'Attendance %', data: [
                        Math.round(metrics.weekRate * 0.97),
                        Math.round(metrics.weekRate * 1.03),
                        Math.round(metrics.weekRate * 0.95),
                        Math.round(metrics.weekRate * 1.01),
                        Math.round(metrics.weekRate * 0.99),
                      ]},
                    ]}
                    categories={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
                    colors={[theme.palette.warning.main]}
                    height={280}
                    yAxisPrefix=""
                    yAxisFormatter={(val) => `${val}%`}
                  />
                </Box>
              ))
            }
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
            onClick={() =>
              openCardModal('Term Attendance Trend', (
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Term-to-date attendance performance trend across all weeks.
                  </Typography>
                  <ReusableBarChart
                    series={[
                      { name: 'Attendance %', data: [88, 85, 91, 87, 90, 93, 89, 92, 94, 91, 95, 93, Math.round(metrics.termRate)] },
                    ]}
                    categories={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13']}
                    colors={[theme.palette.info.main]}
                    height={280}
                    yAxisFormatter={(val) => `${val}%`}
                    xAxisTitle="Week"
                  />
                </Box>
              ))
            }
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
          <Tooltip title="Click to view absentees list" arrow placement="top">
            <StatCard
              colorName="error"
              colorIndex={4}
              clickable
              onClick={() =>
                openCardModal('Absentees Summary', (
                  <Box sx={{ py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Total absentees recorded across class arms for the current term.
                    </Typography>
                    <ReusableBarChart
                      series={[
                        { name: 'Absences', data: [
                          Math.max(1, Math.round(metrics.totalAbsentees * 0.35)),
                          Math.max(1, Math.round(metrics.totalAbsentees * 0.28)),
                          Math.max(1, Math.round(metrics.totalAbsentees * 0.22)),
                          Math.max(1, Math.round(metrics.totalAbsentees * 0.15)),
                        ]},
                      ]}
                      categories={['JS 1A', 'JS 1B', 'JS 2A', 'JS 2B']}
                      colors={[theme.palette.error.main]}
                      height={280}
                      xAxisTitle="Class Arm"
                    />
                  </Box>
                ))
              }
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
          <Tooltip title="Click to view at-risk learners" arrow placement="top">
            <StatCard
            colorName="error"
            colorIndex={4}
            clickable
            onClick={() =>
              openCardModal('At-Risk Learners Overview', (
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    At-risk learners distribution by class arm — those with 1+ week consecutive absence.
                  </Typography>
                  <ReusableBarChart
                    series={[
                      { name: 'At-Risk Learners', data: [
                        Math.max(1, Math.round(metrics.atRisk * 0.4)),
                        Math.max(1, Math.round(metrics.atRisk * 0.35)),
                        Math.max(1, Math.round(metrics.atRisk * 0.25)),
                      ]},
                    ]}
                    categories={['JS 1A', 'JS 1B', 'JS 2A']}
                    colors={[theme.palette.error.main]}
                    height={280}
                    xAxisTitle="Class Arm"
                  />
                </Box>
              ))
            }
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
