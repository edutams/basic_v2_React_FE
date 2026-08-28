import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Paper, Snackbar, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * Search Applicant Bar Component
 */
const SearchApplicant = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSnackbar({ open: true, message: 'This page is currently under development.' });
  };

  return (
    <>
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
            disableRipple
            sx={{ px: 3.5, flexShrink: 0 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default SearchApplicant;
