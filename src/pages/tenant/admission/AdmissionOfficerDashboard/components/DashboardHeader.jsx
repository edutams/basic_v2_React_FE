import React from 'react';
import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material';
import { CalendarMonth, KeyboardArrowDown } from '@mui/icons-material';

/**
 * Session Term Selector + User Bar above stat cards.
 */
const DashboardHeader = ({ sessionTerm, sessionTerms = [], onSessionChange }) => {

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 20, sm: 22 } }}>
          Admission Dashboard
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        {/* Session Term Dropdown */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={sessionTerm || 'all'}
            onChange={(e) => onSessionChange && onSessionChange(e.target.value)}
            renderValue={(v) => {
              const label = sessionTerms.find((s) => String(s.id) === String(v))?.label || '2024/2025 Session';
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                    {label}
                  </Typography>
                  <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary', ml: 'auto' }} />
                </Box>
              );
            }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '10px',
              fontSize: '13px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {sessionTerms.map((st) => (
              <MenuItem key={st.id} value={st.id} sx={{ fontSize: '13px', fontWeight: 600 }}>
                {st.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>


      </Box>
    </Box>
  );
};

export default DashboardHeader;
