import React from 'react';
import { Box, Typography, Button, Stack, useTheme } from '@mui/material';
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
 * Quick Actions — badge pill buttons matching Teacher Dashboard / Admin Dashboard style.
 */
const QuickActions = ({ onAction }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        borderRadius: '14px',
        p: 1.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 14,
          mb: 1.25,
          letterSpacing: '-0.2px',
          color: isDark ? '#fff' : '#0f172a',
        }}
      >
        Quick Actions
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.action}
              variant="contained"
              disableElevation
              onClick={() => onAction && onAction(item.action)}
              startIcon={<Icon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '8px',
                px: 1.6,
                py: 0.65,
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : item.bg,
                color: item.color,
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'transparent',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: item.color,
                  color: '#ffffff',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

export default QuickActions;
