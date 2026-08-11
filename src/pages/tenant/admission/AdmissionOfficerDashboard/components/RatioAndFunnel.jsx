import React from 'react';
import { Box, Typography, Grid, CircularProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { CardShell } from '../common';
import { BLUE, GREEN, ORANGE, num } from '../constants';

// Funnel step card — tinted rounded box with bold value on top,
// colored label below and optional colored percentage.
const FunnelCard = ({ color, label, value, pct }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: 1.75,
      borderRadius: '14px',
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.08)),
      border: '1.5px solid',
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
        fontSize: { xs: 10.5, sm: 11 },
        fontWeight: 600,
        color: 'text.secondary',
        letterSpacing: 0.3,
        mb: 0.75,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </Typography>
    <Typography 
      sx={{ 
        fontSize: { xs: 18, sm: 20 }, 
        fontWeight: 800, 
        color: 'text.primary', 
        lineHeight: 1,
      }}
    >
      {num(value).toLocaleString()}
    </Typography>
    {pct !== undefined && (
      <Typography 
        sx={{ 
          fontSize: 10.5, 
          fontWeight: 700, 
          color,
          mt: 0.5,
          lineHeight: 1,
        }}
      >
        ({Math.round(num(pct) * 10) / 10}%)
      </Typography>
    )}
  </Box>
);

/**
 * Overall Enrollment Ratio + Conversion Funnel — two side-by-side cards:
 * left shows the blue ratio percentage with a circular progress ring,
 * right shows the Applicants → Admitted → Accepted funnel steps.
 * 
 * Matches the design: clean background separation, larger fonts,
 * prominent circular progress, and colorful funnel steps.
 */
const RatioAndFunnel = ({ overallRatio, conversionFunnel, funnelAdmittedRate, enrollmentRate }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <CardShell sx={{ p: 0, height: 'auto', overflow: 'hidden' }}>
      <Grid container spacing={0}>
        {/* Overall Enrollment Ratio */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: { sm: `1px solid ${theme.palette.divider}` },
              borderBottom: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
              bgcolor: isDark ? alpha(BLUE, 0.04) : alpha(BLUE, 0.02),
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: 'text.primary',
                mb: 1.5,
                letterSpacing: 0.3,
              }}
            >
              Overall Enrollment Ratio
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              {/* Left: percentage and fraction */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 32, sm: 36 },
                    fontWeight: 800,
                    color: BLUE,
                    lineHeight: 1,
                    mb: 0.75,
                  }}
                >
                  {overallRatio}%
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    fontWeight: 500,
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
                  size={72}
                  thickness={5}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.08)' : alpha(BLUE, 0.12),
                    position: 'absolute',
                  }}
                />
                {/* Foreground progress ring */}
                <CircularProgress
                  variant="determinate"
                  value={Math.min(overallRatio, 100)}
                  size={72}
                  thickness={5}
                  sx={{
                    color: BLUE,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                      filter: isDark 
                        ? 'drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4))'
                        : 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Conversion Funnel */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: isDark ? alpha(GREEN, 0.04) : alpha(GREEN, 0.02),
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: 'text.primary',
                mb: 1.5,
                letterSpacing: 0.3,
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
                  fontSize: 18, 
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
                  fontSize: 18, 
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
