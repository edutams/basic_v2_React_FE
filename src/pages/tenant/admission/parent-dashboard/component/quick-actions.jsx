import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';

const QuickActions = ({ onApplyAdmission, hasOpenBatches }) => {
  const navigate = useNavigate();

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
      onClick: () => navigate('/school-calendar'),
    },
    {
      id: 'download_reports',
      iconColor: '#ea580c',
      iconBg: '#ffedd5',
      title: 'Download Reports',
      onClick: () => navigate('/dashboard'),
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
      onClick: () => navigate('/dashboard'),
    },
  ];

  const visibleActions = hasOpenBatches
    ? actions
    : actions.filter((a) => a.title !== 'Apply for Admission');

  return (
    <Box>
      <Box
        sx={{
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
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
              variant="contained"
              disableElevation
              onClick={item.onClick}
              sx={{
                borderRadius: '8px',
                px: 1.6,
                py: 0.65,
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: item.iconBg,
                color: item.iconColor,
                border: '1px solid transparent',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: item.iconColor,
                  color: '#ffffff',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                },
              }}
            >
              {item.title}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickActions;
