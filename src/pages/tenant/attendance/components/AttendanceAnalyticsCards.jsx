import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  useTheme,
} from '@mui/material';
import {
  PeopleOutline as PeopleOutlineIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
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
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : undefined,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.success.accentColor,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
            >
              126 out of 130
            </Typography>
          </StatCard>
        </Grid>

        {/* Card 2: WEEK ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            colorName="warning"
            colorIndex={3}
            clickable
            onClick={() =>
              openCardModal('Week Attendance Rate Analysis', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Detailed weekly breakdown by days and class arms for selected week.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Day</TableCell>
                          <TableCell>Present</TableCell>
                          <TableCell>Absent</TableCell>
                          <TableCell>Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>Monday</TableCell><TableCell>98</TableCell><TableCell>11</TableCell><TableCell>89.9%</TableCell></TableRow>
                        <TableRow><TableCell>Tuesday</TableCell><TableCell>105</TableCell><TableCell>4</TableCell><TableCell>96.3%</TableCell></TableRow>
                        <TableRow><TableCell>Wednesday</TableCell><TableCell>92</TableCell><TableCell>17</TableCell><TableCell>84.4%</TableCell></TableRow>
                        <TableRow><TableCell>Thursday</TableCell><TableCell>101</TableCell><TableCell>8</TableCell><TableCell>92.6%</TableCell></TableRow>
                        <TableRow><TableCell>Friday</TableCell><TableCell>99</TableCell><TableCell>10</TableCell><TableCell>90.8%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : undefined,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.warning.accentColor,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
            >
              0% Same as last week
            </Typography>
          </StatCard>
        </Grid>

        {/* Card 3: TERM ATTENDANCE RATE */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            colorName="info"
            colorIndex={2}
            clickable
            onClick={() =>
              openCardModal('Term Attendance Trend', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Term-to-date attendance performance trend across all weeks.
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box><Typography variant="caption" fontWeight={700}>Week 1–4 Average: 88%</Typography><LinearProgress variant="determinate" value={88} color="success" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Week 5–8 Average: 91%</Typography><LinearProgress variant="determinate" value={91} color="success" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Week 9–13 Projection: 94%</Typography><LinearProgress variant="determinate" value={94} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                  </Stack>
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
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : undefined,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.info.accentColor,
                },
              }}
            />
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: colors.info.accentColor }}
            >
              ↑ 44% Higher last term
            </Typography>
          </StatCard>
        </Grid>

        {/* Card 4: TOTAL ABSENTEES */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            colorName="error"
            colorIndex={4}
            clickable
            onClick={() =>
              openCardModal('Absentees Summary List', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total absentees recorded for current term session.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Learner Name</TableCell><TableCell>Class</TableCell><TableCell>Absences</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>ABDULMOJEED Hikmot</TableCell><TableCell>JS 1 A</TableCell><TableCell>4 days</TableCell></TableRow>
                        <TableRow><TableCell>OKONKWO Chidi</TableCell><TableCell>JS 1 B</TableCell><TableCell>3 days</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : undefined,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.error.accentColor,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
            >
              Current Session
            </Typography>
            <Box sx={{ position: 'absolute', right: 12, bottom: 12, opacity: 0.08 }}>
              <PeopleOutlineIcon sx={{ fontSize: 36, color: colors.error.accentColor }} />
            </Box>
          </StatCard>
        </Grid>

        {/* Card 5: AT-RISK STUDENTS */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            colorName="error"
            colorIndex={4}
            clickable
            onClick={() =>
              openCardModal('At-Risk Learners Alert List', (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <WarningIcon color="error" />
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      Learners with 1+ Week Consecutive Absence
                    </Typography>
                  </Stack>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Learner</TableCell><TableCell>Class</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>ABDULMOJEED Hikmot</TableCell>
                          <TableCell>JS 1 A</TableCell>
                          <TableCell><Chip label="DROPOUT RISK" size="small" color="error" sx={{ fontSize: 9, fontWeight: 700 }} /></TableCell>
                          <TableCell><Button size="small" variant="contained" color="error">Send Alert</Button></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                height: 4,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : undefined,
                '& .MuiLinearProgress-bar': {
                  bgcolor: colors.error.accentColor,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: colors.error.accentColor }}
            >
              1+ Week Absence
            </Typography>
          </StatCard>
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
