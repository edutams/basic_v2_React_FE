import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Button,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

import ReusablePieChart from '@/components/shared/charts/ReusablePieChart';
import ReusableBarChart from '@/components/shared/charts/ReusableBarChart';
import AnalyticsModal from './AnalyticsModal';
import StatCardSkeleton from './StatCardSkeleton';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';

// ── Theme-aware stat card ──────────────────────────────────────
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const StatCard = ({ children, colorIndex = 0, clickable = false, onClick, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex] || schemeMap[0];

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        ...(clickable
          ? {
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#94a3b8',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
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
const PsychomotorAnalyticsCards = ({
  metrics,
  loading = false,
  classArmId,
  sessionId,
  termId,
  weekId,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({
    open: false,
    title: '',
    content: null,
    loading: false,
  });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  // Shared: fetch learners + domain breakdown, show student table + bar chart
  const openDomainBreakdown = useCallback(
    async (params, domainType) => {
      const isAffective = domainType === 'affective';
      const title = isAffective ? 'Affective Rating Breakdown' : 'Psychomotor Rating Breakdown';
      const accentColor = isAffective ? theme.palette.success.main : theme.palette.primary.main;

      // No records until a filter (class/arm) has been applied
      if (!params?.class_arm_id) {
        openCardModal(
          title,
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
            >
              No Records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
              Apply a filter first — select a <strong>Class/Arm</strong> (and <strong>Week</strong>)
              above and click the <strong>Filter Results</strong> button to load records.
            </Typography>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({ open: true, title, content: null, loading: true });
      try {
        const [traitRes, learnersRes] = await Promise.all([
          attendanceApi.getTraitBreakdown(params),
          attendanceApi.getPsychomotorLearners(params).catch(() => ({ data: { data: {} } })),
        ]);

        const traitData = traitRes.data?.data || {};
        const traits = isAffective ? traitData.affective || [] : traitData.psychomotor || [];

        const learnerPayload = learnersRes.data?.data || {};
        const students = learnerPayload.students || [];

        if (traits.length === 0 && students.length === 0) {
          openCardModal(
            title,
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
              >
                No {domainType} data found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                No {domainType} assessments have been recorded for this class/week.
              </Typography>
            </Box>,
          );
          return;
        }

        // Compute per-student averages
        const enriched = students.map((s) => {
          const affVals = Object.values(s.affective || {}).filter((v) => v > 0);
          const psyVals = Object.values(s.psychomotor || {}).filter((v) => v > 0);
          const affAvg =
            affVals.length > 0 ? affVals.reduce((a, b) => a + b, 0) / affVals.length : 0;
          const psyAvg =
            psyVals.length > 0 ? psyVals.reduce((a, b) => a + b, 0) / psyVals.length : 0;
          return {
            ...s,
            affAvg: Math.round(affAvg * 10) / 10,
            psyAvg: Math.round(psyAvg * 10) / 10,
          };
        });

        openCardModal(
          title,
          <Box sx={{ py: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Average rating per {domainType} trait (out of {metrics.maxRating}).
                </Typography>
                <ReusableBarChart
                  series={[{ name: 'Avg Rating', data: traits.map((t) => t.avg_rating) }]}
                  categories={traits.map((t) => t.trait)}
                  colors={[accentColor]}
                  height={260}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {students.length} learner(s) — per-student averages.
                </Typography>
                <TableContainer sx={{ maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>NAME</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>GENDER</TableCell>
                        {isAffective ? (
                          <TableCell
                            sx={{ fontWeight: 700, fontSize: '0.75rem', color: accentColor }}
                            align="center"
                          >
                            AFFECTIVE AVG
                          </TableCell>
                        ) : (
                          <TableCell
                            sx={{ fontWeight: 700, fontSize: '0.75rem', color: accentColor }}
                            align="center"
                          >
                            PSYCHOMOTOR AVG
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                          OVERALL AVG
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                          STATUS
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enriched.map((s) => (
                        <TableRow key={s.student_registration_id} hover>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{s.name}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{s.gender || '—'}</TableCell>
                          {isAffective ? (
                            <TableCell
                              align="center"
                              sx={{ fontSize: '0.8rem', fontWeight: 600, color: accentColor }}
                            >
                              {s.affAvg}
                            </TableCell>
                          ) : (
                            <TableCell
                              align="center"
                              sx={{ fontSize: '0.8rem', fontWeight: 600, color: accentColor }}
                            >
                              {s.psyAvg}
                            </TableCell>
                          )}
                          <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                            {s.average_domain ?? '—'}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                s.average_domain < 1.5
                                  ? 'Critical'
                                  : s.average_domain < 2.5
                                    ? 'Low'
                                    : s.average_domain >= 4
                                      ? 'Excellent'
                                      : 'Good'
                              }
                              size="small"
                              color={
                                s.average_domain < 1.5
                                  ? 'error'
                                  : s.average_domain < 2.5
                                    ? 'warning'
                                    : s.average_domain >= 4
                                      ? 'success'
                                      : 'info'
                              }
                              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>,
        );
      } catch (e) {
        console.error(`Failed to fetch ${domainType} breakdown:`, e);
        openCardModal(title, <Typography color="error">Failed to load data.</Typography>);
      }
    },
    [theme, metrics.maxRating],
  );

  // Fetch real needing support data from API
  const openNeedingSupport = useCallback(
    async (params) => {
      // No records until a filter (class/arm) has been applied
      if (!params?.class_arm_id) {
        openCardModal(
          'Learners Needing Support',
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
            >
              No Records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
              Apply a filter first — select a <strong>Class/Arm</strong> (and <strong>Week</strong>)
              above and click the <strong>Filter Results</strong> button to load records.
            </Typography>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({
        open: true,
        title: 'Learners Needing Support',
        content: null,
        loading: true,
      });
      try {
        const [statsRes, learnersRes] = await Promise.all([
          attendanceApi.getPsychomotorStats(params),
          attendanceApi.getLearnersNeedingSupport(params).catch(() => ({ data: { data: [] } })),
        ]);
        const stats = statsRes.data?.data || {};
        const learners = learnersRes.data?.data || [];
        const totalRated = stats.total_assessed || 1;
        const realNeedingSupport = learners.length;
        const realOnTrack = Math.max(0, totalRated - realNeedingSupport);

        // Check if there's actual data
        if ((stats.total_assessed || 0) === 0 && learners.length === 0) {
          openCardModal(
            'Learners Needing Support',
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
              >
                📋 No support data found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                No learners need support yet. All assessed students are on track.
              </Typography>
            </Box>,
          );
          return;
        }

        const sortedLearners = [...learners].sort((a, b) => b.average_domain - a.average_domain);

        openCardModal(
          'Learners Needing Support',
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {realNeedingSupport} out of {totalRated} assessed learners need targeted support (avg
              rating &lt; 2.5).
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReusablePieChart
                  series={[realNeedingSupport, realOnTrack]}
                  labels={['Needing Support', 'On Track']}
                  colors={[theme.palette.warning.main, theme.palette.success.main]}
                  height={350}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReusableBarChart
                  series={[
                    { name: 'Avg Rating', data: sortedLearners.map((l) => l.average_domain) },
                  ]}
                  categories={sortedLearners.map((l) => l.name.split(' ').pop())}
                  colors={[theme.palette.warning.main]}
                  height={280}
                  yAxisPrefix=""
                />
              </Grid>
            </Grid>
            {sortedLearners.length > 0 && (
              <TableContainer sx={{ mt: 2, maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>NAME</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>GENDER</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                        AFFECTIVE AVG
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                        PSYCHOMOTOR AVG
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                        STATUS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedLearners.map((l) => (
                      <TableRow key={l.student_registration_id} hover>
                        <TableCell sx={{ fontSize: '0.8rem' }}>{l.name}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>{l.gender || '—'}</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                          {l.affective_avg}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                          {l.psychomotor_avg}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              l.average_domain < 1.5
                                ? 'Critical'
                                : l.average_domain < 2
                                  ? 'Low'
                                  : 'Needs Support'
                            }
                            size="small"
                            color={
                              l.average_domain < 1.5
                                ? 'error'
                                : l.average_domain < 2
                                  ? 'warning'
                                  : 'info'
                            }
                            sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>,
        );
      } catch (e) {
        console.error('Failed to fetch support data:', e);
        openCardModal(
          'Learners Needing Support',
          <Typography color="error">Failed to load data.</Typography>,
        );
      }
    },
    [theme],
  );

  // Fetch gender rating breakdown from API
  const openGenderBreakdown = useCallback(
    async (params) => {
      // No records until a filter (class/arm) has been applied
      if (!params?.class_arm_id) {
        openCardModal(
          'Gender Rating Comparison',
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
            >
              No Records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
              Apply a filter first — select a <strong>Class/Arm</strong> (and <strong>Week</strong>)
              above and click the <strong>Filter Results</strong> button to load records.
            </Typography>
          </Box>,
        );
        return;
      }

      setAnalyticsModal({
        open: true,
        title: 'Gender Rating Comparison',
        content: null,
        loading: true,
      });
      try {
        const res = await attendanceApi.getRatingByGender(params);
        const genderData = res.data?.data || {};
        const maleCount = genderData.male_count || 0;
        const femaleCount = genderData.female_count || 0;
        const maleAvg = genderData.male_rating || 0;
        const femaleAvg = genderData.female_rating || 0;

        // Check if there's actual assessment data
        if (maleCount === 0 && femaleCount === 0) {
          openCardModal(
            'Gender Rating Comparison',
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ mb: 1, fontSize: '1.15rem', fontWeight: 600, color: 'text.secondary' }}
              >
                👥 No gender data found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                No psychomotor/affective assessments have been recorded yet. Submit assessments
                first to see the gender distribution.
              </Typography>
            </Box>,
          );
          return;
        }

        openCardModal(
          'Gender Rating Comparison',
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of assessed learners by gender (left) and average domain rating (right).
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReusablePieChart
                  series={[maleCount, femaleCount]}
                  labels={['Male', 'Female']}
                  colors={[theme.palette.primary.main, theme.palette.success.main]}
                  height={350}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ReusableBarChart
                  series={[{ name: 'Avg Rating', data: [maleAvg, femaleAvg] }]}
                  categories={['Male', 'Female']}
                  colors={[theme.palette.info.main]}
                  height={300}
                />
              </Grid>
            </Grid>
          </Box>,
        );
      } catch (e) {
        console.error('Failed to fetch gender breakdown:', e);
        openCardModal(
          'Gender Rating Comparison',
          <Typography color="error">Failed to load data.</Typography>,
        );
      }
    },
    [theme],
  );

  const colors = {
    success: schemeMap[1],
    primary: schemeMap[0],
    warning: schemeMap[3],
    info: schemeMap[2],
  };

  return (
    <>
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`skeleton-${i}`}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Card 1: AVG. AFFECTIVE RATING */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Tooltip title="Click to view affective skills breakdown" arrow placement="top">
              <StatCard
                colorIndex={1}
                clickable
                onClick={() =>
                  openDomainBreakdown(
                    {
                      class_arm_id: classArmId,
                      session_id: sessionId || undefined,
                      term_id: termId || undefined,
                      week_term_id: weekId || undefined,
                    },
                    'affective',
                  )
                }
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : colors.success.color,
                    textTransform: 'uppercase',
                  }}
                >
                  AVG. AFFECTIVE RATING
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : colors.success.color }}
                >
                  {metrics.avgAffective}/{metrics.maxRating}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Math.round((metrics.avgAffective / metrics.maxRating) * 100),
                    100,
                  )}
                  sx={{
                    my: 1,
                    height: 5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.success.color,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: colors.success.color }}
                  >
                    {metrics.affectiveTrendText || 'No previous data'}
                  </Typography>
                  {metrics.affectiveChange > 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  ) : metrics.affectiveChange < 0 ? (
                    <TrendingDownIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  ) : (
                    <TrendingFlatIcon sx={{ fontSize: 14, color: colors.success.color }} />
                  )}
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 2: AVG. PSYCHOMOTOR RATING */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Tooltip title="Click to view psychomotor skills breakdown" arrow placement="top">
              <StatCard
                colorIndex={0}
                clickable
                onClick={() =>
                  openDomainBreakdown(
                    {
                      class_arm_id: classArmId,
                      session_id: sessionId || undefined,
                      term_id: termId || undefined,
                      week_term_id: weekId || undefined,
                    },
                    'psychomotor',
                  )
                }
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : colors.primary.color,
                    textTransform: 'uppercase',
                  }}
                >
                  AVG. PSYCHOMOTOR RATING
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : colors.primary.color }}
                >
                  {metrics.avgPsychomotor}/{metrics.maxRating}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    Math.round((metrics.avgPsychomotor / metrics.maxRating) * 100),
                    100,
                  )}
                  sx={{
                    my: 1,
                    height: 5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: colors.primary.color,
                    },
                  }}
                />
                <Stack direction="row" alignItems="center" spacing={0.4}>
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
                  >
                    {metrics.psychoTrendText || 'No previous data'}
                  </Typography>
                  {metrics.psychoChange > 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                  ) : metrics.psychoChange < 0 ? (
                    <TrendingDownIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                  ) : (
                    <TrendingFlatIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                  )}
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 3: NEEDING SUPPORT */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Tooltip title="Click to view learners needing support" arrow placement="top">
              <StatCard
                colorIndex={3}
                clickable
                onClick={() =>
                  openNeedingSupport({
                    class_arm_id: classArmId,
                    session_id: sessionId || undefined,
                    term_id: termId || undefined,
                    week_term_id: weekId || undefined,
                  })
                }
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.72)' : colors.warning.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    NEEDING SUPPORT
                  </Typography>
                  <Chip
                    label="URGENT"
                    size="small"
                    color="error"
                    sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                  />
                </Stack>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ my: 0.5, color: isDark ? '#fff' : colors.warning.color }}
                >
                  {metrics.needingSupport}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5, textTransform: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openNeedingSupport({
                      class_arm_id: classArmId,
                      session_id: sessionId || undefined,
                      term_id: termId || undefined,
                      week_term_id: weekId || undefined,
                    });
                  }}
                >
                  View Details
                </Button>
              </StatCard>
            </Tooltip>
          </Grid>

          {/* Card 4: RATING BY GENDER */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Tooltip title="Click to view gender rating comparison" arrow placement="top">
              <StatCard
                colorIndex={2}
                clickable
                onClick={() =>
                  openGenderBreakdown({
                    class_arm_id: classArmId,
                    session_id: sessionId || undefined,
                    term_id: termId || undefined,
                    week_term_id: weekId || undefined,
                  })
                }
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : colors.info.color,
                    mb: 1,
                    display: 'block',
                    textTransform: 'uppercase',
                  }}
                >
                  RATING BY GENDER
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.25}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563' }}
                      >
                        MALE
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: isDark ? '#fff' : colors.primary.color }}
                      >
                        {metrics.maleRating}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        Math.round((metrics.maleRating / metrics.maxRating) * 100),
                        100,
                      )}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                        '& .MuiLinearProgress-bar': { bgcolor: colors.primary.color },
                      }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.25}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563' }}
                      >
                        FEMALE
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: isDark ? '#fff' : colors.success.color }}
                      >
                        {metrics.femaleRating}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        Math.round((metrics.femaleRating / metrics.maxRating) * 100),
                        100,
                      )}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                        '& .MuiLinearProgress-bar': { bgcolor: colors.success.color },
                      }}
                    />
                  </Box>
                </Stack>
              </StatCard>
            </Tooltip>
          </Grid>
        </Grid>
      )}

      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
        loading={analyticsModal.loading}
      />
    </>
  );
};

export default PsychomotorAnalyticsCards;
