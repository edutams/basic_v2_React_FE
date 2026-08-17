import React from 'react';
import { Box, Card, Typography, Stack } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const DEFAULT_LOGS = [
  {
    id: 1,
    icon: WarningAmberOutlinedIcon,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    title: 'Pending payment for Amaka Adenubi',
    subtitle: 'Tuition Fee of ₦15,000 is due',
    time: '4h ago',
  },
  {
    id: 2,
    icon: AssignmentOutlinedIcon,
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    title: 'New assignment posted',
    subtitle: 'Mathematics - Worksheet 4',
    time: '6h ago',
  },
  {
    id: 3,
    icon: EventAvailableOutlinedIcon,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    title: 'Mid-term exams begin',
    subtitle: 'June 10, 2025',
    time: '1d ago',
  },
  {
    id: 4,
    icon: CheckCircleOutlineOutlinedIcon,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'Payment of ₦ 50,000 was successful',
    subtitle: 'Transaction ID: TXN948271',
    time: '2d ago',
  },
  {
    id: 5,
    icon: ReceiptLongOutlinedIcon,
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    title: 'Report card published',
    subtitle: 'Term 2 Report Card is available',
    time: '3d ago',
  },
];

const ActivityLogs = ({ logs = DEFAULT_LOGS, onViewAll }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: 2.25,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>
          Activity Logs
        </Typography>
        <Typography
          onClick={onViewAll}
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#2563eb',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View All
        </Typography>
      </Stack>

      {/* Log Items */}
      {logs.length === 0 && (
        <Typography sx={{ fontSize: 12, color: '#94a3b8', py: 2, textAlign: 'center' }}>
          No recent activity yet.
        </Typography>
      )}
      <Stack spacing={1.75}>
        {logs.map((item) => {
          const Icon = item.icon;
          return (
            <Stack
              key={item.id}
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#64748b', mt: 0.2, fontWeight: 500 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                {item.time}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};

export default ActivityLogs;
