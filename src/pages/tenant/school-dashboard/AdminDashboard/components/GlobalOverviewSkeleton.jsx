import React from 'react';
import { Box, Grid, Paper, Skeleton, Stack, useTheme } from '@mui/material';

/**
 * Global Overview loading skeleton — mirrors the GlobalOverviewPanel layout
 * (panel + section header + 3 stat cards + staff distribution donut) with an
 * individual skeleton card per stat, so the row keeps its shape while the
 * global-overview endpoint loads.
 */
const GlobalOverviewSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const statCardSx = {
    p: 2,
    borderRadius: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: isDark ? theme.palette.background.paper : '#fff',
    border: isDark
      ? '1px solid rgba(255,255,255,0.12)'
      : `1px solid ${theme.palette.grey[200]}`,
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mb: 3,
      }}
    >
      {/* Section header skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton variant="text" width={160} height={16} />
      </Box>

      <Grid container spacing={2}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper elevation={0} sx={statCardSx}>
              {/* Icon + title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Skeleton variant="circular" width={42} height={42} />
                <Skeleton variant="text" width={110} height={12} />
              </Box>
              {/* Value */}
              <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1.25 }} />
              {/* Trend */}
              <Skeleton variant="text" width="45%" height={10} sx={{ mt: 0.5 }} />
              {/* Sparkline */}
              <Skeleton variant="rounded" height={34} sx={{ mt: 1, width: '100%' }} />
            </Paper>
          </Grid>
        ))}

        {/* Staff distribution donut card skeleton */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              ...statCardSx,
              background: isDark
                ? theme.palette.background.paper
                : 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #C4B5FD',
            }}
          >
            <Skeleton variant="text" width={120} height={12} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
              <Skeleton variant="circular" width={118} height={118} />
              <Stack spacing={1}>
                <Skeleton variant="text" width={70} height={12} />
                <Skeleton variant="text" width={70} height={12} />
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GlobalOverviewSkeleton;
