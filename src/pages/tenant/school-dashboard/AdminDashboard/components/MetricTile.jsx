import React from 'react';
import { Box, Typography, Paper, Tooltip, Skeleton, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Compact metric tile used in Teacher / Learner analytics grids.
 * Layout matches the reference: icon + label at the top (beside each other),
 * with the big value below. Border + shadow follow the Global Overview cards.
 * When `onClick` is provided the tile is clickable and shows a tooltip.
 *
 * The skeleton is built in: when `loading` is true the tile renders shimmer
 * placeholders in the exact layout (icon chip, label, value) so no separate
 * skeleton component is needed.
 */
const MetricTile = ({ icon: Icon, color, label, value, sub, right, onClick, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Tooltip title={!loading && onClick ? 'Click to view details' : ''} placement="top" arrow>
      <Paper
        elevation={0}
        onClick={loading ? undefined : onClick}
        sx={{
          p: 1.75,
          borderRadius: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: !loading && onClick ? 'pointer' : 'default',
          border: '2px solid',
          borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.5) : color),
          bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.05)),
          boxShadow: isDark
            ? '0 10px 30px rgba(0,0,0,0.35)'
            : `0 4px 20px ${alpha(color, 0.12)}`,
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: !loading && onClick ? 'translateY(-2px)' : 'none',
            boxShadow: isDark
              ? '0 8px 30px rgba(0,0,0,0.35)'
              : `0 6px 24px ${alpha(color, 0.2)}`,
          },
        }}
      >
        {loading ? (
          <>
            {/* Top row: icon + label placeholders */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, minWidth: 0 }}>
              <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '10px' }} />
              <Skeleton variant="text" width="65%" height={12} />
            </Box>
            {/* Value placeholder */}
            <Skeleton variant="text" width={70} height={24} sx={{ mt: 'auto' }} />
          </>
        ) : (
          <>
            {/* Top row: icon + label beside it (+ optional right element) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: alpha(color, 0.12),
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.78)' : 'text.secondary'),
                  lineHeight: 1.3,
                }}
              >
                {label}
              </Typography>
              {right && <Box sx={{ flexShrink: 0 }}>{right}</Box>}
            </Box>

            {/* Value row */}
            <Typography sx={{ mt: 'auto', fontSize: 19, fontWeight: 800, lineHeight: 1.1 }}>
              {value}
              {sub && (
                <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 700, color, ml: 0.5 }}>
                  {sub}
                </Typography>
              )}
            </Typography>
          </>
        )}
      </Paper>
    </Tooltip>
  );
};

export default MetricTile;
