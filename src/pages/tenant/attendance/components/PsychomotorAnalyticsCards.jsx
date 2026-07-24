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
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusablePieChart from '@/components/shared/charts/ReusablePieChart';
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
const PsychomotorAnalyticsCards = ({ metrics, classArmId, sessionId, termId, weekId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  // Fetch real per-trait psychomotor breakdown from API
  const openPsychomotorBreakdown = useCallback(async (params) => {
    try {
      const res = await attendanceApi.getTraitBreakdown(params);
      const data = res.data?.data || {};
      const psyTraits = data.psychomotor || [];

      if (psyTraits.length === 0) {
        openCardModal('Psychomotor Rating Breakdown', (
          <Typography color="text.secondary">No psychomotor assessments found for this class/week.</Typography>
        ));
        return;
      }

      openCardModal('Psychomotor Rating Breakdown', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Average rating per psychomotor trait (out of 5).
          </Typography>
          <ReusableBarChart
            series={[{ name: 'Avg Rating', data: psyTraits.map((t) => t.avg_rating) }]}
            categories={psyTraits.map((t) => t.trait)}
            colors={[theme.palette.primary.main]}
            height={300}
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch trait breakdown:', e);
      openCardModal('Psychomotor Rating Breakdown', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [theme]);

  // Fetch real needing support data from API
  const openNeedingSupport = useCallback(async (params) => {
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

      openCardModal('Learners Needing Support', (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {realNeedingSupport} out of {totalRated} assessed learners need targeted support (avg rating &lt; 2.5).
          </Typography>
          <ReusablePieChart
            series={[realNeedingSupport, realOnTrack]}
            labels={['Needing Support', 'On Track']}
            colors={[theme.palette.warning.main, theme.palette.success.main]}
            height={400}
          />
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch support data:', e);
      openCardModal('Learners Needing Support', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [theme]);

  // Fetch gender rating breakdown from API
  const openGenderBreakdown = useCallback(async (params) => {
    try {
      const res = await attendanceApi.getRatingByGender(params);
      const genderData = res.data?.data || {};
      const maleCount = genderData.male_count || 0;
      const femaleCount = genderData.female_count || 0;
      const maleAvg = genderData.male_rating || 0;
      const femaleAvg = genderData.female_rating || 0;

      openCardModal('Gender Rating Comparison', (
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
        </Box>
      ));
    } catch (e) {
      console.error('Failed to fetch gender breakdown:', e);
      openCardModal('Gender Rating Comparison', (
        <Typography color="error">Failed to load data.</Typography>
      ));
    }
  }, [theme]);

  const colors = {
    success: getStatCardColor('success', 1, isDark, theme),
    primary: getStatCardColor('primary', 0, isDark, theme),
    warning: getStatCardColor('warning', 3, isDark, theme),
    info: getStatCardColor('info', 2, isDark, theme),
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: AVG. AFFECTIVE RATING */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard colorName="success" colorIndex={1}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.72)' : colors.success.accentColor,
                textTransform: 'uppercase',
              }}
            >
              AVG. AFFECTIVE RATING
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ my: 0.5, color: isDark ? '#fff' : colors.success.accentColor }}
            >
              {metrics.avgAffective}/5
            </Typography>
            <LinearProgress
              variant="determinate"
              value={84}
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
              <Typography variant="caption" fontWeight={600} sx={{ color: colors.success.accentColor }}>
                +0.4 from last term
              </Typography>
              <TrendingUpIcon sx={{ fontSize: 14, color: colors.success.accentColor }} />
            </Stack>
          </StatCard>
        </Grid>

        {/* Card 2: AVG. PSYCHOMOTOR RATING */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Tooltip title="Click to view psychomotor skills breakdown" arrow placement="top">
            <StatCard
              colorName="primary"
              colorIndex={0}
              clickable
              onClick={() => openPsychomotorBreakdown({ class_arm_id: classArmId, session_id: sessionId || undefined, term_id: termId || undefined, week_term_id: weekId || undefined })}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.72)' : colors.primary.accentColor,
                  textTransform: 'uppercase',
                }}
              >
                AVG. PSYCHOMOTOR RATING
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : colors.primary.accentColor }}
              >
                {metrics.avgPsychomotor}/5
              </Typography>
              <LinearProgress
                variant="determinate"
                value={76}
                sx={{
                  my: 1,
                  height: 5,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.primary.accentColor,
                  },
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography
                  variant="caption"
                  sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
                >
                  → Stable performance
                </Typography>
                <CheckCircleIcon sx={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }} />
              </Stack>
            </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 3: NEEDING SUPPORT */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Tooltip title="Click to view learners needing support" arrow placement="top">
            <StatCard
              colorName="warning"
              colorIndex={3}
              clickable
              onClick={() => openNeedingSupport({ class_arm_id: classArmId, session_id: sessionId || undefined, term_id: termId || undefined, week_term_id: weekId || undefined })}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.72)' : colors.warning.accentColor,
                    textTransform: 'uppercase',
                  }}
                >
                  NEEDING SUPPORT
                </Typography>
                <Chip label="URGENT" size="small" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
              </Stack>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ my: 0.5, color: isDark ? '#fff' : colors.warning.accentColor }}
              >
                {metrics.needingSupport}
              </Typography>
              <Button size="small" variant="outlined" sx={{ mt: 0.5, textTransform: 'none' }}>
                View Details
              </Button>
            </StatCard>
          </Tooltip>
        </Grid>

        {/* Card 4: RATING BY GENDER */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Tooltip title="Click to view gender rating comparison" arrow placement="top">
            <StatCard
              colorName="info"
              colorIndex={2}
              clickable
              onClick={() => openGenderBreakdown({ class_arm_id: classArmId, session_id: sessionId || undefined, term_id: termId || undefined, week_term_id: weekId || undefined })}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : colors.info.accentColor, mb: 1, display: 'block', textTransform: 'uppercase' }}
              >
                RATING BY GENDER
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.25}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563' }}>MALE</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? '#fff' : colors.primary.accentColor }}>{metrics.maleRating}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={82}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                      '& .MuiLinearProgress-bar': { bgcolor: colors.primary.accentColor },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.25}>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563' }}>FEMALE</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? '#fff' : colors.success.accentColor }}>{metrics.femaleRating}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={86}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                      '& .MuiLinearProgress-bar': { bgcolor: colors.success.accentColor },
                    }}
                  />
                </Box>
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

export default PsychomotorAnalyticsCards;
