import React from 'react';
import { Select, MenuItem, useTheme } from '@mui/material';

/**
 * Compact session dropdown used by dashboard cards (Revenue Distribution,
 * Payment Categories, Outstanding Balance by Class, ...). Falls back to a
 * single "This Session" option when no sessions are available yet.
 */
const SessionSelect = ({ value = '', options = [], onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Select
      value={value}
      size="small"
      displayEmpty
      onChange={(e) => {
        e.stopPropagation();
        onChange && onChange(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
      sx={{
        height: 28,
        minWidth: 140,
        fontSize: '0.7rem',
        fontWeight: 600,
        color: '#374151',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
        borderRadius: '6px',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(229,231,235,0.8)' },
      }}
    >
      {(options.length === 0 ? [] : options).map((s) => (
        <MenuItem key={s} value={s} sx={{ fontSize: '0.7rem' }}>
          {s}
        </MenuItem>
      ))}
      {options.length === 0 && (
        <MenuItem value="This Session" sx={{ fontSize: '0.7rem' }}>
          This Session
        </MenuItem>
      )}
    </Select>
  );
};

export default SessionSelect;