import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Small stat card used in page-level "live stats" rows (calendar, subscriptions,
// etc.) — a label/value pair on the left, an optional tinted icon badge on the
// right so the card doesn't look empty.
const MiniStat = ({ label, value, loading, color, icon: Icon }) => (
  <Box
    sx={{
      flex: '1 1 140px',
      minWidth: 140,
      p: 1.25,
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={50} height={28} />
      ) : (
        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: color || 'text.primary' }}>
          {value}
        </Typography>
      )}
    </Box>
    {Icon && (
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: (theme) => {
            const paletteKey = color ? color.split('.')[0] : 'primary';
            return alpha(theme.palette[paletteKey]?.main ?? theme.palette.primary.main, 0.12);
          },
          color: color || 'primary.main',
        }}
      >
        <Icon size={18} />
      </Box>
    )}
  </Box>
);

export default MiniStat;
