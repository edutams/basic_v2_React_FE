import React from 'react';
import { Paper, Skeleton, useTheme } from '@mui/material';

/**
 * Skeleton placeholder that mirrors the analytics StatCard layout
 * (uppercase caption, big number, progress bar, footer caption)
 * while stats are being fetched.
 */
const StatCardSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        minHeight: 160,
        background: isDark ? theme.palette.background.paper : '#fff',
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${theme.palette.grey[200]}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      <Skeleton variant="text" width="72%" sx={{ fontSize: '0.75rem' }} />
      <Skeleton variant="rounded" width="48%" height={38} sx={{ borderRadius: 1.5 }} />
      <Skeleton variant="rounded" width="100%" height={5} sx={{ borderRadius: 2 }} />
      <Skeleton variant="text" width="88%" sx={{ fontSize: '0.7rem' }} />
    </Paper>
  );
};

export default StatCardSkeleton;
