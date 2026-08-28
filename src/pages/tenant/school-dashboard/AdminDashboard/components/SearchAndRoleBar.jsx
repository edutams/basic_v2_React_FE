import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  useTheme,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import tenantApi from '@/api/tenant/tenant_api';

/**
 * Search Student/Staff Bar Component
 */
const SearchAndRoleBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearchLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/global-search', {
        params: { search: query.trim() },
      });
      if (res.data?.status) {
        const list = res.data.data || [];
        setSearchResults(Array.isArray(list) ? list : []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResultClick = () => {
    setSnackbar({ open: true, message: 'This page is currently under development.' });
    setSearchResults(null);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          px: 1,
          py: 0.5,
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
            mb: 0.5,
          }}
        >
          SEARCH STUDENT / STAFF
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'nowrap', position: 'relative' }}>
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length === 0) setSearchResults(null);
            }}
            onKeyDown={handleKeyDown}
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
            variant="contained"
            disableRipple
            onClick={handleSearch}
            disabled={searchLoading || query.trim().length < 2}
            sx={{ px: 2.5, py: 0.5, flexShrink: 0, fontSize: '12px' }}
          >
            {searchLoading ? <CircularProgress size={18} color="inherit" /> : 'Search'}
          </Button>

          {/* Search Results Dropdown */}
          {searchResults !== null && (
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 0.5,
                maxHeight: 300,
                overflowY: 'auto',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                zIndex: 1300,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 4 },
              }}
            >
              {searchLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Stack spacing={0}>
                  {searchResults.map((result, i) => {
                    const name = result.full_name || `${result.fname || ''} ${result.lname || ''}`.trim() || 'Unknown';
                    const className = result.class_name || '';
                    const idTag = result.admission_no || result.staff_id || '';
                    const email = result.email || '';
                    const userType = result.user_type || 'student';
                    const userTypeLabel = result.user_type_label || 'Student';
                    const tagColor = userType === 'staff' ? { bg: '#FEF3C7', color: '#92400E' } : { bg: '#EEF2FF', color: '#4338CA' };
                    return (
                      <Box
                        key={result.id || idTag || i}
                        onClick={handleResultClick}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderBottom: i < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#EFF6FF' },
                        }}
                      >
                        <Avatar
                          src={result.avatar || ''}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 13,
                            bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                          }}
                        >
                          {name.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#fff' : '#111827', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {name}
                            </Typography>
                            <Chip
                              label={userTypeLabel}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.55rem',
                                fontWeight: 600,
                                bgcolor: tagColor.bg,
                                color: tagColor.color,
                                flexShrink: 0,
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                            {className && (
                              <Chip
                                label={className}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.55rem',
                                  fontWeight: 600,
                                  bgcolor: '#DCFCE7',
                                  color: '#166534',
                                  flexShrink: 0,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.15, alignItems: 'center' }}>
                            {userType === 'student' ? (
                              idTag && (
                                <Typography sx={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 500 }}>
                                  {idTag}
                                </Typography>
                              )
                            ) : (
                              email && (
                                <Typography sx={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {email}
                                </Typography>
                              )
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ py: 2.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    No results found
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: '' })}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SearchAndRoleBar;
