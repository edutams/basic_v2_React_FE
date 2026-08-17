import React from 'react';
import { Box, Grid, Paper, Skeleton, Stack, useTheme } from '@mui/material';

/**
 * Financial Metrics loading skeleton — mirrors the FinancialMetrics layout with
 * an individual skeleton card per stat (icon tile + title, value, sub)
 * plus the revenue breakdown donut card.
 */
const FinancialMetricsSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cardSx = {
    p: 2,
    borderRadius: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: isDark ? theme.palette.background.paper : '#fff',
    border: '1px rgba(69, 67, 67, 1) solid',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
  };

  return (
    <Grid container spacing={2} mb={3}>
      {[0, 1, 2].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper elevation={0} sx={cardSx}>
            {/* Icon tile + title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" width={110} height={12} />
            </Box>
            {/* Value */}
            <Skeleton variant="text" width="60%" height={24} sx={{ my: 1 }} />
            {/* Sub */}
            <Skeleton variant="text" width="40%" height={10} />
          </Paper>
        </Grid>
      ))}

      {/* Revenue breakdown donut card skeleton */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Paper elevation={0} sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="text" width={110} height={12} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              flexGrow: 1,
              mt: 1.5,
            }}
          >
            <Skeleton variant="circular" width={110} height={110} />
            <Stack spacing={1.25}>
              <Skeleton variant="text" width={70} height={12} />
              <Skeleton variant="text" width={70} height={12} />
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FinancialMetricsSkeleton;
