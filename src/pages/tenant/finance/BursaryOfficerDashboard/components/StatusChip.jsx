import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { STATUS_META } from '../constants';

/**
 * Status chip with colored dot.
 */
const StatusChip = ({ status }) => {
  const theme = useTheme();
  const meta = STATUS_META[status] || { label: status || '—', color: 'default' };
  const c =
    meta.color === 'default' ? theme.palette.text.secondary : theme.palette[meta.color].main;
  return (
    <Chip
      size="small"
      icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />}
      label={meta.label}
      sx={{
        bgcolor: alpha(c, 0.1),
        color: c,
        fontWeight: 700,
        fontSize: 10,
        '& .MuiChip-icon': { ml: 0.75, mr: -0.25 },
      }}
    />
  );
};

export default StatusChip;
