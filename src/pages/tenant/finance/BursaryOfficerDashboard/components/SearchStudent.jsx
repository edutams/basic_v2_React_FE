import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';

/**
 * Search Student — clean search box matching the design image.
 */
const SearchStudent = ({ onSearch }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch && searchQuery.length >= 2) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        p: '16px 18px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: '#EBF5FF',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Search sx={{ fontSize: 18 }} />
        </Box>
        <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3 }}>
          Search Student
        </Typography>
      </Box>

      {/* Search input + button */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Search by name, admission number, student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#9CA3AF', fontSize: 18 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              fontSize: '0.78rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E5E7EB',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3B82F6',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3B82F6',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            minWidth: 80,
            borderRadius: '8px',
            bgcolor: '#3B82F6',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            '&:hover': { bgcolor: '#2563EB' },
          }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default SearchStudent;
