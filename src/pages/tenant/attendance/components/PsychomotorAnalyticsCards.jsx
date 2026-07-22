import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Button,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleIcon,
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
const PsychomotorAnalyticsCards = ({ metrics }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

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
          <StatCard
            colorName="primary"
            colorIndex={0}
            clickable
            onClick={() =>
              openCardModal('Psychomotor Rating Breakdown', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Average rating distribution per psychomotor skill.
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box><Typography variant="caption" fontWeight={700}>Handwriting: 4.1 / 5</Typography><LinearProgress variant="determinate" value={82} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Games & Sports: 3.6 / 5</Typography><LinearProgress variant="determinate" value={72} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Drawing & Painting: 3.7 / 5</Typography><LinearProgress variant="determinate" value={74} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                  </Stack>
                </Box>
              ))
            }
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
        </Grid>

        {/* Card 3: NEEDING SUPPORT */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            colorName="warning"
            colorIndex={3}
            clickable
            onClick={() =>
              openCardModal('Learners Needing Support List', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Students with rating scores under 3.0 needing targeted support.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Learner</TableCell><TableCell>Weak Domain</TableCell><TableCell>Score</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>BALOGUN Joseph</TableCell><TableCell>Punctuality</TableCell><TableCell>2 / 5</TableCell></TableRow>
                        <TableRow><TableCell>ADEKUNLE Ibrahim</TableCell><TableCell>Games & Sports</TableCell><TableCell>2 / 5</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
            }
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
        </Grid>

        {/* Card 4: RATING BY GENDER */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            colorName="info"
            colorIndex={2}
            clickable
            onClick={() =>
              openCardModal('Gender Rating Detailed Comparison', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Detailed affective vs psychomotor comparison by gender.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Gender</TableCell><TableCell>Affective Avg</TableCell><TableCell>Psychomotor Avg</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>Male</TableCell><TableCell>4.1 / 5</TableCell><TableCell>3.7 / 5</TableCell></TableRow>
                        <TableRow><TableCell>Female</TableCell><TableCell>4.3 / 5</TableCell><TableCell>3.9 / 5</TableCell></TableRow>
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
