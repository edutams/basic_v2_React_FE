import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import {
  PersonAddOutlined,
  GroupOutlined,
  PeopleOutline,
  AssignmentOutlined,
  CalendarMonthOutlined,
  CampaignOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Quick Actions Bar for Admin Officer Dashboard
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const actions = [
    {
      id: 'add_student',
      label: 'Add Student',
      icon: <PersonAddOutlined sx={{ fontSize: 18, color: '#2563eb' }} />,
      onClick: () => navigate('/learner-management', { state: { openAdd: true } }),
    },
    {
      id: 'manage_students',
      label: 'Manage Students',
      icon: <GroupOutlined sx={{ fontSize: 18, color: '#16a34a' }} />,
      onClick: () => navigate('/learner-management'),
    },
    {
      id: 'manage_staff',
      label: 'Manage Staff',
      icon: <PeopleOutline sx={{ fontSize: 18, color: '#7c3aed' }} />,
      onClick: () => navigate('/staff-setup'),
    },
    {
      id: 'upload_results',
      label: 'Upload Results',
      icon: <AssignmentOutlined sx={{ fontSize: 18, color: '#d97706' }} />,
      onClick: () => navigate('/assessments/broadsheet'),
    },
    {
      id: 'view_attendance',
      label: 'View Attendance',
      icon: <CalendarMonthOutlined sx={{ fontSize: 18, color: '#0284c7' }} />,
      onClick: () => navigate('/attendance-psychomotor'),
    },
    {
      id: 'create_announcement',
      label: 'Create Announcement',
      icon: <CampaignOutlined sx={{ fontSize: 18, color: '#16a34a' }} />,
      onClick: () => navigate('/communications/broadcast-messaging'),
    },
    {
      id: 'generate_report',
      label: 'Generate Report',
      icon: <DescriptionOutlined sx={{ fontSize: 18, color: '#2563eb' }} />,
      onClick: () => navigate('/reports/general-report'),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
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
          mb: 1.5,
        }}
      >
        QUICK ACTIONS
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(7, 1fr)',
          },
          gap: 1.25,
        }}
      >
        {actions.map((act) => (
          <Button
            key={act.id}
            variant="outlined"
            onClick={act.onClick}
            startIcon={act.icon}
            sx={{
              py: 1.25,
              px: 1.25,
              borderRadius: '10px',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              color: isDark ? '#ffffff' : '#1e293b',
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'none',
              justifyContent: 'flex-start',
              whiteSpace: 'nowrap',
              boxShadow: 'none',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#eff6ff',
                borderColor: '#2563eb',
                color: isDark ? '#ffffff' : '#1e293b',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
              },
              '&:hover::before': {
                display: 'none',
              },
            }}
          >
            {act.label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default QuickActions;
