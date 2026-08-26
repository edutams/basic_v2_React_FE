import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Paper, FormControl, Select, MenuItem, useTheme, Tooltip } from '@mui/material';
import { Search as SearchIcon, PersonOutline, InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Search Student/Staff + Switch Role Bar Component
 */
const SearchAndRoleBar = ({ currentRole = 'administrator', onRoleChange }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/learners/student-manager?search=${encodeURIComponent(query)}`);
  };

  const handleSwitchRole = (newRole) => {
    if (onRoleChange) {
      onRoleChange(newRole);
    } else {
      if (newRole === 'admission') navigate('/dashboard/admission');
      else if (newRole === 'bursary') navigate('/dashboard/bursary');
      else if (newRole === 'teacher') navigate('/staff-manager/teacher-dashboard');
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 280px' }, gap: 2, mb: 2.5 }}>
      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 800,
            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 1.25,
          }}
        >
          SEARCH STUDENT / STAFF
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1.5, flexWrap: 'nowrap' }}>
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, admission number, staff ID, class..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '10px',
                fontSize: '13.5px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 3.5,
              borderRadius: '10px',
              bgcolor: '#1d4ed8',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'none',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(29, 78, 216, 0.3)',
              '&:hover': {
                bgcolor: '#1e40af',
              },
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Switch Role Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            SWITCH ROLE
          </Typography>
          <Tooltip title="Switch to view dashboard perspectives for different roles" arrow placement="top">
            <InfoOutlined sx={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer' }} />
          </Tooltip>
        </Box>

        <FormControl size="small" fullWidth>
          <Select
            value={currentRole}
            onChange={(e) => handleSwitchRole(e.target.value)}
            renderValue={(val) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutline sx={{ fontSize: 18, color: '#2563eb' }} />
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '13px' }}>
                  {val === 'administrator' ? 'School Administrator' : val === 'admission' ? 'Admission Officer' : val === 'bursary' ? 'Bursary Officer' : 'Teacher'}
                </Typography>
              </Box>
            )}
            sx={{
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
            }}
          >
            <MenuItem value="administrator" sx={{ fontSize: '13px', fontWeight: 600 }}>School Administrator</MenuItem>
            <MenuItem value="admission" sx={{ fontSize: '13px', fontWeight: 600 }}>Admission Officer</MenuItem>
            <MenuItem value="bursary" sx={{ fontSize: '13px', fontWeight: 600 }}>Bursary Officer</MenuItem>
            <MenuItem value="teacher" sx={{ fontSize: '13px', fontWeight: 600 }}>Teacher / Instructor</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default SearchAndRoleBar;
