import React from 'react';
import { Box, Typography, Paper, Stack, Button, useTheme } from '@mui/material';
import { DescriptionOutlined, ChevronRight, ArrowForward, PersonOutline, CalendarMonthOutlined, AssignmentOutlined, ReceiptLongOutlined, PeopleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const defaultReports = [
  { id: 'enrolment', label: 'Student Enrolment Report', icon: <PersonOutline sx={{ fontSize: 16, color: '#2563eb' }} />, route: '/reports/general-report' },
  { id: 'attendance', label: 'Attendance Report', icon: <CalendarMonthOutlined sx={{ fontSize: 16, color: '#16a34a' }} />, route: '/reports/general-report' },
  { id: 'academic', label: 'Academic Performance Report', icon: <AssignmentOutlined sx={{ fontSize: 16, color: '#7c3aed' }} />, route: '/reports/general-report' },
  { id: 'financial', label: 'Financial Summary Report', icon: <ReceiptLongOutlined sx={{ fontSize: 16, color: '#d97706' }} />, route: '/reports/general-report' },
  { id: 'staff', label: 'Staff Summary Report', icon: <PeopleOutline sx={{ fontSize: 16, color: '#0284c7' }} />, route: '/reports/general-report' },
];

/**
 * Quick Reports Card Component
 */
const QuickReportsCard = ({ reports = defaultReports, onViewAllReports }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: '14px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <DescriptionOutlined sx={{ fontSize: 18, color: '#2563eb' }} />
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            QUICK REPORTS
          </Typography>
        </Box>

        {/* Report items list */}
        <Stack spacing={0}>
          {reports.map((rpt, index) => (
            <Box
              key={rpt.id}
              onClick={() => navigate(rpt.route)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                px: 1.25,
                cursor: 'pointer',
                borderBottom: index < reports.length - 1 ? '1px solid' : 'none',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  transform: 'translateX(2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {rpt.icon}
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>
                  {rpt.label}
                </Typography>
              </Box>
              <ChevronRight sx={{ fontSize: 18, color: '#94a3b8' }} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 1.5 }}>
        <Button
          disableRipple
          onClick={() => (onViewAllReports ? onViewAllReports() : navigate('/reports/general-report'))}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
        >
          View All Reports
        </Button>
      </Box>
    </Paper>
  );
};

export default QuickReportsCard;
