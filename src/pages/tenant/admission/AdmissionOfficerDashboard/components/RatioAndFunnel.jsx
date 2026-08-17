import React from 'react';
import { Box, Typography, Grid, CircularProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { CardShell } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, num } from '../constants';

// Funnel step card — compact rounded box with bold value on top,
// colored label below and optional percentage.
const FunnelCard = ({ color, label, value, pct }) => (
  <Box
    sx={{
      flex: '1 1 0',
      minWidth: 0,
      p: { xs: 0.75, sm: 1 },
      borderRadius: '8px',
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.08)),
      border: '1px solid',
      borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.32) : alpha(color, 0.2)),
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 3px 10px ${alpha(color, 0.2)}`,
      },
    }}
  >
    <Typography
      sx={{
        fontSize: { xs: 8, sm: 8.5 },
        fontWeight: 700,
        color,
        letterSpacing: 0.3,
        mb: 0.25,
        textTransform: 'uppercase',
        lineHeight: 1.2,
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: 12, sm: 13 },
        fontWeight: 800,
        color: 'text.primary',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
      }}
    >
      {num(value).toLocaleString()}
    </Typography>
    {pct !== undefined && (
      <Typography
        sx={{
          fontSize: { xs: 8, sm: 8.5 },
          fontWeight: 700,
          color,
          mt: 0.25,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        ({Math.round(num(pct) * 10) / 10}%)
      </Typography>
    )}
  </Box>
);

/**
 * Overall Enrollment Ratio + Conversion Funnel — compact pair:
 * Reduced inner/outer padding to eliminate excess whitespace.
 */
const RatioAndFunnel = ({ overallRatio, conversionFunnel, funnelAdmittedRate, enrollmentRate }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <CardShell
      sx={{
        p: 0.75,
        height: 'auto',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
      }}
    >
      <Grid container spacing={1} alignItems="stretch">
        {/* Overall Enrollment Ratio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: { xs: 1.25, sm: 1.25, lg: 1.25 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (t) => (t.palette.mode === 'dark' ? alpha(BLUE, 0.32) : alpha(BLUE, 0.18)),
              bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(BLUE, 0.14) : alpha(BLUE, 0.07)),
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 9.5, lg: 9 },
                fontWeight: 700,
                color: 'text.secondary',
                mb: 0.75,
                letterSpacing: 0.2,
                lineHeight: 1.2,
              }}
            >
              Overall Enrollment Ratio
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              {/* Left: percentage and fraction */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 16, sm: 17 },
                    fontWeight: 800,
                    color: BLUE,
                    lineHeight: 1,
                    mb: 0.35,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {overallRatio}%
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 8.5, sm: 9 },
                    color: 'text.secondary',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ({num(conversionFunnel.accepted).toLocaleString()} / {num(conversionFunnel.applicants).toLocaleString()})
                </Typography>
              </Box>

              {/* Right: circular progress ring */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={{ xs: 44, lg: 40 }}
                  thickness={4.5}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.1)' : alpha(BLUE, 0.15),
                    position: 'absolute',
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={Math.min(overallRatio, 100)}
                  size={{ xs: 44, lg: 40 }}
                  thickness={4.5}
                  sx={{
                    color: BLUE,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Conversion Funnel */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <Box
            sx={{
              p: { xs: 1.25, sm: 1.25 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (t) => (t.palette.mode === 'dark' ? alpha(PURPLE, 0.32) : alpha(PURPLE, 0.18)),
              bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(PURPLE, 0.14) : alpha(PURPLE, 0.06)),
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 9.5, lg: 9 },
                fontWeight: 700,
                color: 'text.secondary',
                mb: 0.75,
                letterSpacing: 0.2,
                lineHeight: 1.2,
              }}
            >
              Conversion Funnel
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 0.5, sm: 0.75 },
              }}
            >
              {/* Applicants */}
              <FunnelCard
                color={BLUE}
                label="Applicants"
                value={conversionFunnel.applicants}
              />

              <ArrowForward
                sx={{
                  fontSize: { xs: 14, lg: 13 },
                  color: 'text.disabled',
                  flexShrink: 0,
                  mx: { xs: -0.25, sm: 0 },
                }}
              />

              {/* Admitted */}
              <FunnelCard
                color={ORANGE}
                label="Admitted"
                value={conversionFunnel.admitted}
                pct={funnelAdmittedRate}
              />

              <ArrowForward
                sx={{
                  fontSize: { xs: 14, lg: 13 },
                  color: 'text.disabled',
                  flexShrink: 0,
                  mx: { xs: -0.25, sm: 0 },
                }}
              />

              {/* Accepted */}
              <FunnelCard
                color={GREEN}
                label="Accepted"
                value={conversionFunnel.accepted}
                pct={enrollmentRate}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CardShell>
  );
};

export default RatioAndFunnel;
