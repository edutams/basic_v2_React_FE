import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';
import {
  Receipt,
  Payment,
  ManageAccounts,
  Assessment,
  Notifications,
  Description,
  Settings,
  FileUpload,
} from '@mui/icons-material';

const ACTIONS = [
  { icon: Receipt, label: 'Create Invoice', action: 'create_invoice', color: '#3B82F6', bg: '#EBF5FF' },
  { icon: Payment, label: 'Record Payment', action: 'record_payment', color: '#10B981', bg: '#ECFDF5' },
  { icon: ManageAccounts, label: 'Manage Fees', action: 'manage_fees', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: Assessment, label: 'Generate Report', action: 'generate_report', color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: Notifications, label: 'Send Reminder', action: 'send_reminder', color: '#6366F1', bg: '#EEF2FF' },
  { icon: Description, label: 'Bulk Invoice', action: 'bulk_invoice', color: '#EF4444', bg: '#FEF2F2' },
  { icon: Settings, label: 'Fee Structure', action: 'fee_structure', color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: FileUpload, label: 'Export Data', action: 'export_data', color: '#14B8A6', bg: '#F0FDFA' },
];

/**
 * Quick Actions — search bar + 4x2 grid of action cards matching the design image.
 */
const QuickActions = ({ onAction, onSearch }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch && searchQuery.length >= 2) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
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
      }}
    >
      {/* Search Student label */}
      <Typography
        fontWeight={800}
        sx={{ fontSize: '0.78rem', color: '#111827', letterSpacing: 0.3, mb: 0.75 }}
      >
        Search Student
      </Typography>

      {/* Search field */}
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
              fontSize: '0.75rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            minWidth: 72,
            borderRadius: '8px',
            bgcolor: '#3B82F6',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.75rem',
            '&:hover': { bgcolor: '#2563EB' },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Quick Actions section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1.5,
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
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
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
              onClick={() => onAction && onAction(item.action)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: 1.5,
                px: 0.5,
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
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  color: '#374151',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default QuickActions;
