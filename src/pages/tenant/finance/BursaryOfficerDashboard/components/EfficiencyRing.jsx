import React from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';

/**
 * Efficiency ring — circular progress with the percentage centered.
 */
const EfficiencyRing = ({ value }) => {
  const theme = useTheme();
  const color =
    value >= 75
      ? theme.palette.success.main
      : value >= 50
        ? theme.palette.warning.main
        : theme.palette.error.main;
  return (
    <Box sx={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(value, 100)}
        size={52}
        thickness={4.5}
        sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" fontWeight={800} sx={{ fontSize: 10 }}>
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default EfficiencyRing;
