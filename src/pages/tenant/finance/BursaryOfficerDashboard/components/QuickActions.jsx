import React from 'react';
import { Box, Typography, Button, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import SectionCard from './SectionCard';

/**
 * Quick Actions — Grid of action buttons for common bursary tasks.
 */
const QuickActions = ({ onAction }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const actions = [
    { 
      icon: Receipt, 
      label: 'Create Invoice', 
      action: 'create_invoice',
      color: theme.palette.primary.main 
    },
    { 
      icon: Payment, 
      label: 'Record Payment', 
      action: 'record_payment',
      color: theme.palette.success.main 
    },
    { 
      icon: ManageAccounts, 
      label: 'Manage Fees', 
      action: 'manage_fees',
      color: theme.palette.warning.main 
    },
    { 
      icon: Assessment, 
      label: 'Generate Report', 
      action: 'generate_report',
      color: theme.palette.info.main 
    },
    { 
      icon: Notifications, 
      label: 'Send Reminder', 
      action: 'send_reminder',
      color: theme.palette.secondary.main 
    },
    { 
      icon: Description, 
      label: 'Bulk Invoice', 
      action: 'bulk_invoice',
      color: theme.palette.error.main 
    },
    { 
      icon: Settings, 
      label: 'Fee Structure', 
      action: 'fee_structure',
      color: theme.palette.info.dark 
    },
    { 
      icon: FileUpload, 
      label: 'Export Data', 
      action: 'export_data',
      color: theme.palette.success.dark 
    },
  ];

  const handleAction = (action) => {
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <SectionCard
      icon={ManageAccounts}
      title="Quick Actions"
      color={theme.palette.secondary.main}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          flexGrow: 1,
        }}
      >
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.action}
              variant="outlined"
              onClick={() => handleAction(item.action)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                flexDirection: 'column',
                gap: 1,
                minHeight: 80,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: item.color,
                  bgcolor: alpha(item.color, 0.08),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(item.color, 0.2)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(item.color, 0.12),
                  color: item.color,
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  fontSize: 11,
                  lineHeight: 1.3,
                  textAlign: 'center',
                  textTransform: 'none',
                }}
              >
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Box>
    </SectionCard>
  );
};

export default QuickActions;
