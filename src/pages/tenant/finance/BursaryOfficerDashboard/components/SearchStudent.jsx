import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, useTheme, CircularProgress, Stack, Avatar, Chip } from '@mui/material';
import { Search } from '@mui/icons-material';

/**
 * Search Student — search box with results dropdown matching the design image.
 * Props:
 *   onSearch  – callback(query) when the user submits a search
 *   loading   – boolean, shows a spinner while the API call is in flight
 *   results   – array of student objects returned by the backend, or null
 */
const SearchStudent = ({ onSearch, loading, results, onStudentClick, onClear }) => {
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

  const showResults = results && results.length > 0;

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
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            if (value.length === 0 && onClear) {
              onClear();
            }
          }}
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
          disabled={loading || searchQuery.length < 2}
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
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Search'}
        </Button>
      </Box>

      {/* Loading indicator */}
      {loading && !showResults && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      )}

      {/* Search results */}
      {showResults && (
        <Box
          sx={{
            mt: 1.5,
            maxHeight: 260,
            overflowY: 'auto',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 4 },
          }}
        >
          <Stack spacing={0}>
            {results.map((student, i) => (
              <Box
                key={student.id || student.user_id || i}
                onClick={() => onStudentClick && onStudentClick(student)}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderBottom: i < results.length - 1 ? '1px solid #F3F4F6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: '#EFF6FF' },
                }}
              >
                <Avatar
                  src={student.avatar || ''}
                  alt={student.name}
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 13,
                    bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                  }}
                >
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                    {student.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.2, flexWrap: 'wrap' }}>
                    {student.admission_no && (
                      <Typography sx={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 500 }}>
                        {student.admission_no}
                      </Typography>
                    )}
                    {student.class_name && (
                      <Chip
                        label={student.class_name}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          bgcolor: '#EEF2FF',
                          color: '#4338CA',
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* No results message */}
      {results && results.length === 0 && !loading && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            No students found matching your search
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchStudent;
