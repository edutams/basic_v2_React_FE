import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Snackbar, Alert, Skeleton, useTheme } from '@mui/material';

const QuickActions = ({ loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const actions = [
    {
      id: 'add_student',
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Add Student',
      onClick: () => setSnackbar({ open: true, message: 'Add Student — Page under development' }),
    },
    {
      id: 'manage_students',
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Manage Students',
      onClick: () => setSnackbar({ open: true, message: 'Manage Students — Page under development' }),
    },
    {
      id: 'manage_staff',
      iconColor: '#7c3aed',
      iconBg: '#f3e8ff',
      title: 'Manage Staff',
      onClick: () => setSnackbar({ open: true, message: 'Manage Staff — Page under development' }),
    },
    {
      id: 'upload_results',
      iconColor: '#d97706',
      iconBg: '#fef3c7',
      title: 'Upload Results',
      onClick: () => setSnackbar({ open: true, message: 'Upload Results — Page under development' }),
    },
    {
      id: 'view_attendance',
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      title: 'View Attendance',
      onClick: () => setSnackbar({ open: true, message: 'View Attendance — Page under development' }),
    },
    {
      id: 'create_announcement',
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Create Announcement',
      onClick: () => setSnackbar({ open: true, message: 'Create Announcement — Page under development' }),
    },
    {
      id: 'generate_report',
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Generate Report',
      onClick: () => setSnackbar({ open: true, message: 'Generate Report — Page under development' }),
    },
  ];

  return (
    <Box height="100%">
      <Box
        sx={{
          height: '100%',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          borderRadius: '14px',
          px: 1.5,
          py: 1,
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
            mb: 1,
          }}
        >
          QUICK ACTIONS
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={110}
                height={34}
                sx={{ borderRadius: '8px' }}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {actions.map((item) => (
              <Button
                key={item.id}
                variant="contained"
                disableElevation
                onClick={item.onClick}
                sx={{
                  borderRadius: '8px',
                  px: 1.75,
                  py: 0.75,
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : item.iconBg,
                  color: item.iconColor,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'transparent',
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
        )}
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
