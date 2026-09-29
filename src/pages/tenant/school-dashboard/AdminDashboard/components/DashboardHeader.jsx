import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { PersonOutline, Search as SearchIcon } from '@mui/icons-material';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNavigate } from 'react-router-dom';
import tenantApi from '@/api/tenant/tenant_api';

/**
 * Admin Dashboard Header — Greeting + Search + Role Switcher
 */
const DashboardHeader = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useTenantAuth();
  const userRole = user?.role_name || user?.role || 'School Admin';
  const navigate = useNavigate();

  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

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

  const handleSwitchRole = (newRole) => {
    if (!newRole) return;
    if (newRole === 'admission') navigate('/dashboard/admission');
    else if (newRole === 'bursary') navigate('/dashboard/bursary');
    else if (newRole === 'teacher') navigate('/staff-manager/teacher-dashboard');
  };

  return (
    <>
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
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: 20, sm: 22 }, color: isDark ? '#fff' : '#0f172a' }}
          >
            Good morning, {userRole}! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>
            Here's an overview of your school today.
          </Typography>
        </Box>

        {/* Right: Search + Role Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto', flexWrap: 'wrap' }}>
          {/* Global Search Component */}
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TextField
              size="small"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length === 0) setSearchResults(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search student / staff..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '10px',
                  fontSize: '13px',
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                },
              }}
              sx={{ minWidth: { xs: 200, sm: 240, md: 280 } }}
            />
            {Boolean(query.trim()) && (
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searchLoading}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 0.65,
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                  minHeight: '36px',
                }}
              >
                {searchLoading ? <CircularProgress size={16} color="inherit" /> : 'Search'}
              </Button>
            )}

            {/* Search Results Dropdown */}
            {searchResults !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 0.5,
                  maxHeight: 280,
                  overflowY: 'auto',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                  zIndex: 1300,
                }}
              >
                {searchResults.length > 0 ? (
                  <Stack spacing={0}>
                    {searchResults.map((result, i) => {
                      const name =
                        result.full_name ||
                        `${result.fname || ''} ${result.lname || ''}`.trim() ||
                        'Unknown';
                      const className = result.class_name || '';
                      const idTag = result.admission_no || result.staff_id || '';
                      const userType = result.user_type || 'student';
                      const userTypeLabel = result.user_type_label || 'Student';
                      const tagColor =
                        userType === 'staff'
                          ? { bg: '#FEF3C7', color: '#92400E' }
                          : { bg: '#EEF2FF', color: '#4338CA' };

                      return (
                        <Box
                          key={result.id || i}
                          onClick={handleResultClick}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderBottom:
                              i < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#EFF6FF' },
                          }}
                        >
                          <Avatar src={result.avatar || ''} sx={{ width: 28, height: 28, fontSize: 12 }}>
                            {name.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Typography
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: isDark ? '#fff' : '#111827',
                                  noWrap: true,
                                }}
                              >
                                {name}
                              </Typography>
                              <Chip
                                label={userTypeLabel}
                                size="small"
                                sx={{ height: 16, fontSize: '0.55rem', bgcolor: tagColor.bg, color: tagColor.color }}
                              />
                              {className && (
                                <Chip
                                  label={className}
                                  size="small"
                                  sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#DCFCE7', color: '#166534' }}
                                />
                              )}
                            </Stack>
                            {idTag && (
                              <Typography sx={{ fontSize: '0.62rem', color: '#6B7280' }}>
                                {idTag}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      No results found
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Role Switcher */}
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <Select
              displayEmpty
              value=""
              onChange={(e) => handleSwitchRole(e.target.value)}
              renderValue={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonOutline sx={{ fontSize: 18, color: '#2563eb' }} />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ fontSize: 13, color: isDark ? '#fff' : '#1e293b' }}
                  >
                    Switch Role
                  </Typography>
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
              <MenuItem value="" disabled sx={{ fontSize: '13px', fontWeight: 600 }}>
                Select Role to Switch
              </MenuItem>
              <MenuItem value="admission" sx={{ fontSize: '13px', fontWeight: 600 }}>
                Admission Officer
              </MenuItem>
              <MenuItem value="bursary" sx={{ fontSize: '13px', fontWeight: 600 }}>
                Bursary Officer
              </MenuItem>
              <MenuItem value="teacher" sx={{ fontSize: '13px', fontWeight: 600 }}>
                Teacher / Instructor
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

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

export default DashboardHeader;
