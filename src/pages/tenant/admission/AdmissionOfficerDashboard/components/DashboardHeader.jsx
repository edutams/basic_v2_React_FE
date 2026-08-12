import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { CalendarMonth, KeyboardArrowDown } from '@mui/icons-material';

/**
 * Dashboard header — page title block + session-term selector.
 */
const DashboardHeader = ({ sessionTerm, sessionTerms, onSessionChange }) => (
  <Box
    sx={{
      mb: 3,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box>
      <Typography variant="h4" fontWeight={800}>
        Admission Dashboard
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
        Overview of admissions performance
      </Typography>
    </Box>

    <FormControl size="small" sx={{ minWidth: 230 }}>
      <Select
        value={sessionTerm}
        onChange={(e) => onSessionChange(e.target.value)}
        renderValue={(v) => {
          const label = sessionTerms.find((s) => s.id === v)?.label || 'All Sessions';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {label}
              </Typography>
              <KeyboardArrowDown sx={{ fontSize: 15, color: 'text.secondary' }} />
            </Box>
          );
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
        }}
      >
        {sessionTerms.map((st) => (
          <MenuItem key={st.id} value={st.id}>
            {st.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);

export default DashboardHeader;
