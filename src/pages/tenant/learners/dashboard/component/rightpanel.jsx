import React from 'react';
import { Box, Card, Typography, Stack } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

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
    <Card elevation={0} sx={{ ...cardSx, p: '14px 14px' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>
          Activity Log
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          View All
        </Typography>
      </Stack>

      {/* Activity Items */}
      <Stack spacing={1.5}>
        {MOCK_ACTIVITIES.map((item) => {
          const Icon = item.icon;
          return (
            <Stack
              key={item.id}
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: '2px',
                  }}
                >
                  <Icon sx={{ fontSize: 14 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight="700" sx={{ fontSize: '0.72rem', color: '#111827', lineHeight: 1.25 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.63rem', color: '#6B7280', mt: 0.15, lineHeight: 1.3 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', fontWeight: 500, flexShrink: 0, mt: '2px' }}>
                {item.time}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};

export default RightPanel;
