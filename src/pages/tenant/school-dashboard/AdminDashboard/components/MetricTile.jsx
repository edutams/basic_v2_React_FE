import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Compact metric tile used in Teacher / Learner analytics grids.
 * Layout matches the reference: icon + label at the top (beside each other),
 * with the big value below.
 */
const MetricTile = ({ icon: Icon, color, label, value, sub, right }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.75,
      borderRadius: '14px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid',
      borderColor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.32) : alpha(color, 0.2)),
      bgcolor: (t) => (t.palette.mode === 'dark' ? alpha(color, 0.12) : alpha(color, 0.05)),
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 18px ${alpha(color, 0.16)}`,
      },
    }}
  >
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
  </Paper>
);

export default MetricTile;
