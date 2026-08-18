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
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
        '& .MuiSelect-icon': { color: '#6B7280' },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
            mt: 0.5,
          },
        },
      }}
    >
      {(options.length === 0 ? [] : options).map((s) => (
        <MenuItem
          key={s}
          value={s}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#374151',
            borderRadius: '4px',
            mx: 0.5,
            my: 0.25,
            '&:hover': { bgcolor: '#F3F4F6' },
            '&.Mui-selected': { bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' } },
          }}
        >
          {s}
        </MenuItem>
      ))}
      {options.length === 0 && (
        <MenuItem
          value="This Session"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#374151',
            borderRadius: '4px',
            mx: 0.5,
            my: 0.25,
            '&:hover': { bgcolor: '#F3F4F6' },
            '&.Mui-selected': { bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' } },
          }}
        >
          This Session
        </MenuItem>
      )}
    </Select>
  );
};

export default SessionSelect;