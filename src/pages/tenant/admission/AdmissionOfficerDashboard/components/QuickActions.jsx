import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, useTheme, CircularProgress, Stack, Avatar, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  AddBoxOutlined,
  PersonAddOutlined,
  AssignmentOutlined,
  CheckCircleOutlined,
  SchoolOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tenantApi from '@/api/tenant/tenant_api';

const ACTIONS = [
  { icon: AddBoxOutlined, label: 'Create Batch', action: 'create_batch', color: '#3B82F6', bg: '#EBF5FF' },
  { icon: PersonAddOutlined, label: 'Add Applicant', action: 'add_applicant', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: AssignmentOutlined, label: 'Review Applications', action: 'review_applications', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: CheckCircleOutlined, label: 'Admit Applicant', action: 'admit_applicant', color: '#10B981', bg: '#ECFDF5' },
  { icon: SchoolOutlined, label: 'Enroll Student', action: 'enroll_student', color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: DescriptionOutlined, label: 'Admission Report', action: 'admission_report', color: '#3B82F6', bg: '#EBF5FF' },
];

/**
 * Quick Actions — card grid matching the Bursary dashboard style, with embedded search.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleAction = (action) => {
    switch (action) {
      case 'create_batch':
        navigate('/admission-setup');
        break;
      case 'add_applicant':
        navigate('/admission/new-application');
        break;
      case 'review_applications':
        navigate('/process-applications');
        break;
      case 'admit_applicant':
        navigate('/process-applications', { state: { tab: 'batch' } });
        break;
      case 'enroll_student':
        navigate('/process-applications', { state: { tab: 'individual' } });
        break;
      case 'admission_report':
        navigate('/application-tracker');
        break;
      default:
        break;
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setSearchLoading(true);
    try {
      const res = await tenantApi.post('/admission/process/applications', {
        filters: { search: query.trim() },
      });
      if (res.data?.status) {
        const list = res.data.data?.data || res.data.data || [];
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

  const handleClear = () => {
    setQuery('');
    setSearchResults(null);
  };

  const handleResultClick = (applicant) => {
    const formNumber = applicant.form_number || applicant.formNumber;
    if (formNumber) {
      navigate(`/admission/process-form/${formNumber}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'admitted': return { bgcolor: '#dcfce7', color: '#16a34a' };
      case 'pending': return { bgcolor: '#fef9c3', color: '#ca8a04' };
      case 'declined': return { bgcolor: '#fee2e2', color: '#dc2626' };
      case 'accepted': return { bgcolor: '#dbeafe', color: '#2563eb' };
      default: return { bgcolor: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <Box
      sx={{
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        p: '8px 10px',
        mb: 2.5,
      }}
    >
      {/* Quick Actions header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
          QUICK ACTIONS
        </Typography>
        <Box sx={{ flex: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}` }} />
      </Box>

      {/* Responsive action grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 1,
          flexGrow: 1,
          alignContent: 'center',
        }}
      >
        {ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Box
              key={item.action}
              onClick={() => handleAction(item.action)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: { xs: 1, sm: 1.5 },
                px: { xs: 0.25, sm: 0.5 },
                minWidth: 0,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : `${item.color}26`,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : `${item.color}0f`,
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease',
                '&:hover': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : `${item.color}40`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : `${item.color}1a`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.65)',
                  color: isDark ? '#fff' : item.color,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : `${item.color}26`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ fontSize: 19 }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '0.5rem', sm: '0.58rem' },
                  fontWeight: 600,
                  color: '#374151',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`, mt: 1.25, mb: 1 }} />

      {/* Search Applicant */}
      <Box sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          }}
        >
          Search Applicant
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', position: 'relative' }}>
        <TextField
          fullWidth
          size="small"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length === 0) setSearchResults(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, form number, phone or email..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '10px',
              fontSize: '12.5px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              height: 36,
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searchLoading || query.trim().length < 2}
          sx={{
            px: 2.5,
            borderRadius: '10px',
            // bgcolor: '#1d4ed8',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '12.5px',
            textTransform: 'none',
            flexShrink: 0,
            height: 36,
            // boxShadow: '0 2px 6px rgba(29, 78, 216, 0.3)',
            // '&:hover': { bgcolor: '#1e40af' },
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
              maxHeight: 280,
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
                {searchResults.map((applicant, i) => {
                  const name = applicant.full_name || `${applicant.fname || ''} ${applicant.lname || ''}`.trim() || 'Unknown';
                  const statusStyles = getStatusColor(applicant.status || applicant.admission_status);
                  return (
                    <Box
                      key={applicant.id || applicant.form_number || i}
                      onClick={() => handleResultClick(applicant)}
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
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#fff' : '#111827', lineHeight: 1.3 }}>
                          {name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.2, flexWrap: 'wrap', alignItems: 'center' }}>
                          {applicant.form_number && (
                            <Typography sx={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 500 }}>
                              {applicant.form_number}
                            </Typography>
                          )}
                          {(applicant.class_name || applicant.grade_level) && (
                            <Chip
                              label={applicant.class_name || applicant.grade_level}
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
                          {(applicant.status || applicant.admission_status) && (
                            <Chip
                              label={applicant.status || applicant.admission_status}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.55rem',
                                fontWeight: 600,
                                bgcolor: statusStyles.bgcolor,
                                color: statusStyles.color,
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
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
                  No applicants found matching your search
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuickActions;
