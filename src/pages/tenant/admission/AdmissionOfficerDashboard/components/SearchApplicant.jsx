import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Paper, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Search Applicant Bar Component
 */
const SearchApplicant = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/admission/processing?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2.5,
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
        SEARCH APPLICANT
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1.5, flexWrap: 'nowrap' }}>
        <TextField
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by applicant name, application ID, phone or email..."
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
  );
};

export default SearchApplicant;
