import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, useTheme } from '@mui/material';
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
const QuickActions = ({ onCreateBatch, onAdmissionReport }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [query, setQuery] = useState('');

  const handleAction = (action) => {
    switch (action) {
      case 'create_batch':
        onCreateBatch ? onCreateBatch() : navigate('/admission/setup');
        break;
      case 'add_applicant':
        navigate('/admission/new-application');
        break;
      case 'review_applications':
        navigate('/admission/processing');
        break;
      case 'admit_applicant':
        navigate('/admission/processing', { state: { tab: 'batch' } });
        break;
      case 'enroll_student':
        navigate('/admission/processing', { state: { tab: 'individual' } });
        break;
      case 'admission_report':
        onAdmissionReport ? onAdmissionReport() : navigate('/admission/tracker');
        break;
      default:
        break;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/admission/processing?search=${encodeURIComponent(query)}`);
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography
          fontWeight={800}
          sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3, whiteSpace: 'nowrap' }}
        >
          QUICK ACTIONS
        </Typography>
        <Box sx={{ flex: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}` }} />
      </Box>

      {/* Responsive action grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
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
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, application ID, phone or email..."
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
          type="submit"
          variant="contained"
          
        >
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default QuickActions;
