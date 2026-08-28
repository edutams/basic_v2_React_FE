import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, useTheme } from '@mui/material';
import { PersonOutline, KeyboardArrowDown } from '@mui/icons-material';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Admin Dashboard Header — Greeting + Role Switcher
 */
const DashboardHeader = ({ currentRole = 'administrator' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useTenantAuth();
  const userRole = user?.role_name || user?.role || 'School Administrator';
  const navigate = useNavigate();

  const handleSwitchRole = (newRole) => {
    if (newRole === 'administrator') return;
    if (newRole === 'admission') navigate('/dashboard/admission');
    else if (newRole === 'bursary') navigate('/dashboard/bursary');
    else if (newRole === 'teacher') navigate('/staff-manager/teacher-dashboard');
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* Left Greeting */}
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 20, sm: 22 }, color: isDark ? '#fff' : '#0f172a' }}>
          Good morning, {userRole}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>
          Here's an overview of your school today.
        </Typography>
      </Box>

      {/* Right: Role Switcher */}
      <FormControl size="small" sx={{ minWidth: 220, ml: 'auto' }}>
        <Select
          value={currentRole}
          onChange={(e) => handleSwitchRole(e.target.value)}
          renderValue={(val) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutline sx={{ fontSize: 18, color: '#2563eb' }} />
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                {val === 'administrator' ? 'School Administrator' : val === 'admission' ? 'Admission Officer' : val === 'bursary' ? 'Bursary Officer' : 'Teacher'}
              </Typography>
              <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary', ml: 'auto' }} />
            </Box>
          )}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '10px',
            fontSize: '13px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <MenuItem value="administrator" sx={{ fontSize: '13px', fontWeight: 600 }}>School Administrator</MenuItem>
          <MenuItem value="admission" sx={{ fontSize: '13px', fontWeight: 600 }}>Admission Officer</MenuItem>
          <MenuItem value="bursary" sx={{ fontSize: '13px', fontWeight: 600 }}>Bursary Officer</MenuItem>
          <MenuItem value="teacher" sx={{ fontSize: '13px', fontWeight: 600 }}>Teacher / Instructor</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default DashboardHeader;
