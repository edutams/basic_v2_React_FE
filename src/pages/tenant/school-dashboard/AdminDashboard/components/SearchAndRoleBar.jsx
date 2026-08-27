import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Paper,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  Tooltip,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, PersonOutline, InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tenantApi from '@/api/tenant/tenant_api';

/**
 * Search Student/Staff + Switch Role Bar Component
 */
const SearchAndRoleBar = ({ currentRole = 'administrator', onRoleChange }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
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

  const handleResultClick = (result) => {
    const id = result.id;
    const userType = result.user_type;
    if (!id) return;

    if (userType === 'student') {
      navigate('/learner-management');
    } else if (userType === 'staff') {
      navigate('/staff-manager');
    } else {
      navigate('/learner-management');
    }
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

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'nowrap', position: 'relative' }}>
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
            onClick={handleSearch}
            disabled={searchLoading || query.trim().length < 2}
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
              '&:hover': { bgcolor: '#1e40af' },
            }}
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
                        onClick={() => handleResultClick(result)}
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
