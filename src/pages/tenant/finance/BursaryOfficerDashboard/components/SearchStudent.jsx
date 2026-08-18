import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';
import SectionCard from './SectionCard';

/**
 * Search Student — Quick search box for finding students by name, admission number, or student ID.
 */
const SearchStudent = ({ onSearch }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <SectionCard
      icon={Search}
      title="Search Student"
      color={theme.palette.info.main}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search by name, admission number, student ID..."
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Box>
    </SectionCard>
  );
};

export default SearchStudent;
