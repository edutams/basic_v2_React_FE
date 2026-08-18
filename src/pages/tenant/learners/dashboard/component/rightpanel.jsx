import React from 'react';
import { Box, Card, Typography, Stack, Divider } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

// Mocked activity log entries — will be replaced with real data later.
const MOCK_ACTIVITIES = [
  {
    id: 1,
    icon: WarningAmberOutlinedIcon,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    title: 'Outstanding fee reminder',
    subtitle: 'Tuition Fee of ₦45,000 is due in 5 days',
    time: '2h ago',
  },
  {
    id: 2,
    icon: AssignmentOutlinedIcon,
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
    title: 'New assignment posted',
    subtitle: 'Mathematics — Worksheet 4',
    time: '6h ago',
  },
  {
    id: 3,
    icon: PaymentsOutlinedIcon,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'Payment confirmed',
    subtitle: '₦50,000 received — TXN948271',
    time: '1d ago',
  },
  {
    id: 4,
    icon: EventAvailableOutlinedIcon,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    title: 'Mid-term exams begin',
    subtitle: 'June 10, 2025',
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

const RightPanel = () => {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: '10px',
        p: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
        },
      }}
    >
      <Box>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2, color: '#111827' }}>
            Activity Log
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main', cursor: 'pointer' }}
          >
            View all
          </Typography>
        </Stack>

        {/* Activity Items */}
        <Stack divider={<Divider flexItem />} spacing={1}>
          {MOCK_ACTIVITIES.map((item) => {
            const Icon = item.icon;
            return (
              <Stack
                key={item.id}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{ pt: 0.2, transition: 'transform 150ms ease', '&:hover': { transform: 'translateX(2px)' } }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: '#111827' }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.3 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {item.time}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
};

export default RightPanel;
