import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Snackbar, Alert, useTheme } from '@mui/material';

const QuickActions = ({ onApplyAdmission, hasOpenBatches }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const comingSoon = (title) => () => setSnackbar({ open: true, message: `${title} — Page under development` });

  const actions = [
    {
      id: 'pay_fees',
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Pay School Fees',
      onClick: () => navigate('/pay-school-fees'),
    },
    {
      id: 'apply_admission',
      iconColor: '#7c3aed',
      iconBg: '#f3e8ff',
      title: 'Apply for Admission',
      onClick: () => (onApplyAdmission ? onApplyAdmission() : navigate('/admission/new-application')),
    },
    {
      id: 'message_teacher',
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Message Teacher',
      // No messaging feature exists yet — this used to navigate to
      // /school-calendar, an unrelated page.
      onClick: comingSoon('Message Teacher'),
    },
    {
      id: 'download_reports',
      iconColor: '#ea580c',
      iconBg: '#ffedd5',
      title: 'Download Reports',
      // Used to navigate to /dashboard (itself) — a no-op that downloaded
      // nothing. No parent-facing reports page exists yet.
      onClick: comingSoon('Download Reports'),
    },
    {
      id: 'payment_history',
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      title: 'View Payment History',
      onClick: () => navigate('/pay-school-fees'),
    },
    {
      id: 'attendance_overview',
      iconColor: '#e11d48',
      iconBg: '#ffe4e6',
      title: 'Attendance Overview',
      // Used to navigate to /dashboard (itself) — same no-op issue.
      onClick: comingSoon('Attendance Overview'),
    },
  ];

  const visibleActions = hasOpenBatches
    ? actions
    : actions.filter((a) => a.title !== 'Apply for Admission');

  return (
    <Box>
      <Box
        sx={{
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          borderRadius: '14px',
          px: 1.25,
          py: 0.75,
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {visibleActions.map((item) => (
            <Button
              key={item.id}
              variant="outlined"
              disableElevation
              onClick={item.onClick}
              sx={{
                borderRadius: '8px',
                px: 1.6,
                py: 0.65,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: 'transparent',
                color: item.iconColor,
                borderColor: item.iconColor,
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : `${item.iconColor}0D`,
                  borderColor: item.iconColor,
                  color: item.iconColor,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {item.title}
            </Button>
          ))}
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
    </Box>
  );
};

export default QuickActions;
