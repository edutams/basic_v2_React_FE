import React from 'react';
import { Box, Grid, Paper, Skeleton, Stack, useTheme } from '@mui/material';

/**
 * Global Overview loading skeleton — mirrors the compact GlobalOverviewPanel layout
 */
const GlobalOverviewSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const statCardSx = {
    py: 1.5,
    px: 1.75,
    borderRadius: '12px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: isDark ? theme.palette.background.paper : '#fff',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.grey[200],
    boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.palette.grey[200],
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        mb: 3,
      }}
    >
      {/* Section header skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton variant="text" width={160} height={16} />
      </Box>

      <Grid container spacing={1.5} alignItems="stretch">
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper elevation={0} sx={statCardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Skeleton variant="circular" width={38} height={38} />
                <Skeleton variant="text" width={100} height={14} />
              </Box>
              <Skeleton variant="text" width={32} height={24} />
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
                : 'linear-gradient(135deg, #F8F5FF 0%, #EDE9FE 100%)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#DDD6FE',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Skeleton variant="circular" width={44} height={44} />
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Skeleton variant="text" width={80} height={12} />
                <Skeleton variant="text" width={60} height={10} />
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GlobalOverviewSkeleton;
