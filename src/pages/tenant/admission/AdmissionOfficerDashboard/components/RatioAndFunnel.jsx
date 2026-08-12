import React from 'react';
import { Box, Typography, Grid, CircularProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { CardShell } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, num } from '../constants';

// Funnel step card — tinted rounded box with bold value on top,
// colored label below and optional colored percentage.
const FunnelCard = ({ color, label, value, pct }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: 1.75,
      borderRadius: '12px',
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.08)),
      border: '1px solid',
      borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.32) : alpha(color, 0.2)),
      textAlign: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
      },
    }}
  >
    <Typography
      sx={{
        fontSize: 9.5,
        fontWeight: 700,
        color,
        letterSpacing: 0.3,
        mb: 0.5,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: 14, sm: 15 },
        fontWeight: 800,
        color: 'text.primary',
        lineHeight: 1.15,
        whiteSpace: 'nowrap',
      }}
    >
      {num(value).toLocaleString()}
    </Typography>
    {pct !== undefined && (
      <Typography
        sx={{
          fontSize: 9.5,
          fontWeight: 700,
          color,
          mt: 0.4,
          lineHeight: 1,
        }}
      >
        ({Math.round(num(pct) * 10) / 10}%)
      </Typography>
    )}
  </Box>
);

/**
 * Overall Enrollment Ratio + Conversion Funnel — a full-width pair:
 * left shows the blue ratio percentage on a soft blue background,
 * right shows the Applicants → Admitted → Accepted funnel on a soft
 * violet background, wide enough that every step is fully visible.
 */
const RatioAndFunnel = ({ overallRatio, conversionFunnel, funnelAdmittedRate, enrollmentRate }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <CardShell
      sx={{
        p: 1,
        height: 'auto',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
      }}
    >
      <Grid container spacing={1}>
        {/* Overall Enrollment Ratio — soft blue background */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: (t) => (t.palette.mode === 'dark' ? alpha(BLUE, 0.32) : alpha(BLUE, 0.18)),
              bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(BLUE, 0.14) : alpha(BLUE, 0.07)),
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: 'text.secondary',
                mb: 1,
                letterSpacing: 0.2,
              }}
            >
              Overall Enrollment Ratio
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
              {/* Left: percentage and fraction */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 20, sm: 22 },
                    fontWeight: 800,
                    color: BLUE,
                    lineHeight: 1,
                    mb: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {overallRatio}%
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
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
                {/* Background ring */}
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={52}
                  thickness={5}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.1)' : alpha(BLUE, 0.15),
                    position: 'absolute',
                  }}
                />
                {/* Foreground progress ring */}
                <CircularProgress
                  variant="determinate"
                  value={Math.min(overallRatio, 100)}
                  size={52}
                  thickness={5}
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

        {/* Conversion Funnel — very wide, soft violet background */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <Box
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: (t) => (t.palette.mode === 'dark' ? alpha(PURPLE, 0.32) : alpha(PURPLE, 0.18)),
              bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(PURPLE, 0.14) : alpha(PURPLE, 0.06)),
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: 'text.secondary',
                mb: 1,
                letterSpacing: 0.2,
              }}
            >
              Conversion Funnel
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
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
                  fontSize: 16,
                  color: 'text.disabled',
                  flexShrink: 0,
                  mx: -0.5,
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
                  fontSize: 16,
                  color: 'text.disabled',
                  flexShrink: 0,
                  mx: -0.5,
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
