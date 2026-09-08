import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Snackbar, Alert, Skeleton, useTheme } from '@mui/material';
import {
  PersonAddAlt1,
  Groups,
  Badge,
  UploadFile,
  EventAvailable,
  Campaign,
  Assessment,
} from '@mui/icons-material';

const QuickActions = ({ loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const comingSoon = (title) => () => setSnackbar({ open: true, message: `${title} — Page under development` });

  // Same page a student is added from, so "Add Student" and "Manage
  // Students" are two entry points into one feature rather than two pages.
  const actions = [
    {
      id: 'add_student',
      icon: PersonAddAlt1,
      color: '#2563eb',
      title: 'Add Student',
      onClick: () => navigate('/learner-management'),
    },
    {
      id: 'manage_students',
      icon: Groups,
      color: '#16a34a',
      title: 'Manage Students',
      onClick: () => navigate('/learner-management'),
    },
    {
      id: 'manage_staff',
      icon: Badge,
      color: '#7c3aed',
      title: 'Manage Staff',
      onClick: () => navigate('/staff-setup'),
    },
    {
      id: 'upload_results',
      icon: UploadFile,
      color: '#d97706',
      title: 'Upload Results',
      onClick: comingSoon('Upload Results'),
    },
    {
      id: 'view_attendance',
      icon: EventAvailable,
      color: '#0284c7',
      title: 'View Attendance',
      onClick: () => navigate('/attendance-psychomotor'),
    },
    {
      id: 'create_announcement',
      icon: Campaign,
      color: '#16a34a',
      title: 'Create Announcement',
      onClick: comingSoon('Create Announcement'),
    },
    {
      id: 'generate_report',
      icon: Assessment,
      color: '#2563eb',
      title: 'Generate Report',
      onClick: comingSoon('Generate Report'),
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
                variant="outlined"
                size="small"
                startIcon={<item.icon sx={{ fontSize: '15px !important' }} />}
                onClick={item.onClick}
                sx={{
                  borderRadius: '8px',
                  px: 1.6,
                  py: 0.65,
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: 'transparent',
                  color: item.color,
                  borderColor: item.color,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : `${item.color}0D`,
                    borderColor: item.color,
                    color: item.color,
                    transform: 'translateY(-1px)',
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
