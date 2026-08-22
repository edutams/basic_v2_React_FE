import React from 'react';
import { Box, Grid, Paper, Skeleton, Stack, useTheme } from '@mui/material';

/**
 * Row 1 metric cards loading skeleton — mirrors the MetricCards layout with an
 * individual skeleton card per stat (icon tile + title, value + right gender
 * split, dashed footer) so the row keeps its shape while overview loads.
 */
const MetricCardsSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={2} mb={3}>
      {[0, 1, 2, 3].map((i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: isDark ? theme.palette.background.paper : '#fff',
              border: '1px rgba(69, 67, 67, 1) solid',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
            }}
          >
            {/* Icon tile + title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '10px' }} />
              <Skeleton variant="text" width={120} height={12} />
            </Box>

            {/* Value + right gender split */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                mt: 'auto',
                pt: 1.5,
              }}
            >
              <Skeleton variant="text" width="45%" height={24} />
              <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
                <Skeleton variant="text" width={70} height={10} />
                <Skeleton variant="text" width={70} height={10} />
              </Stack>
            </Box>

          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricCardsSkeleton;
