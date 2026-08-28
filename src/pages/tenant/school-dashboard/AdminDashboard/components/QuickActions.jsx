import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, Snackbar, Alert, Skeleton, useTheme } from '@mui/material';
import {
  PersonAddOutlined,
  GroupOutlined,
  PeopleOutline,
  AssignmentOutlined,
  CalendarMonthOutlined,
  CampaignOutlined,
  DescriptionOutlined,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const QuickActions = ({ loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const actions = [
    {
      id: 'add_student',
      icon: PersonAddOutlined,
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Add Student',
      subtitle: 'Register a new student',
      onClick: () => setSnackbar({ open: true, message: 'Add Student — Page under development' }),
    },
    {
      id: 'manage_students',
      icon: GroupOutlined,
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Manage Students',
      subtitle: 'View & edit student records',
      onClick: () => setSnackbar({ open: true, message: 'Manage Students — Page under development' }),
    },
    {
      id: 'manage_staff',
      icon: PeopleOutline,
      iconColor: '#7c3aed',
      iconBg: '#f3e8ff',
      title: 'Manage Staff',
      subtitle: 'View & manage staff list',
      onClick: () => setSnackbar({ open: true, message: 'Manage Staff — Page under development' }),
    },
    {
      id: 'upload_results',
      icon: AssignmentOutlined,
      iconColor: '#d97706',
      iconBg: '#fef3c7',
      title: 'Upload Results',
      subtitle: 'Upload student results',
      onClick: () => setSnackbar({ open: true, message: 'Upload Results — Page under development' }),
    },
    {
      id: 'view_attendance',
      icon: CalendarMonthOutlined,
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      title: 'View Attendance',
      subtitle: 'Check attendance records',
      onClick: () => setSnackbar({ open: true, message: 'View Attendance — Page under development' }),
    },
    {
      id: 'create_announcement',
      icon: CampaignOutlined,
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Create Announcement',
      subtitle: 'Post school-wide alerts',
      onClick: () => setSnackbar({ open: true, message: 'Create Announcement — Page under development' }),
    },
    {
      id: 'generate_report',
      icon: DescriptionOutlined,
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Generate Report',
      subtitle: 'Create academic reports',
      onClick: () => setSnackbar({ open: true, message: 'Generate Report — Page under development' }),
    },
  ];

  return (
    <Box  height="100%">
      <Box
        sx={{
          height: '100%',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          borderRadius: '14px',
          px: 1.2,
          py: 0.5,
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 1,
            }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={52}
                sx={{ borderRadius: '10px' }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 1,
            }}
          >
            {actions.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  onClick={item.onClick}
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: item.iconColor,
                      boxShadow: `0 4px 16px rgba(15, 23, 42, 0.08)`,
                      '& .action-arrow': {
                        color: item.iconColor,
                        transform: 'translateX(3px)',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      minWidth: 34,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 17 }} />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        color: isDark ? 'rgba(255,255,255,0.9)' : '#0f172a',
                        lineHeight: 1.2,
                        mb: 0.15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 9,
                        color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
                        lineHeight: 1.2,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>

                  <ArrowForwardIcon
                    className="action-arrow"
                    sx={{
                      fontSize: 14,
                      color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Card>
              );
            })}
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
