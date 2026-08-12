import React from 'react';
import {
  Box,
  Card,
  Typography,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  CloudDownloadOutlined,
  HelpOutlineOutlined,
  LocalLibraryOutlined,
  EmojiEventsOutlined,
  ContactSupportOutlined,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const actions = [
  { icon: CalendarMonthOutlined, label: 'View Timetable', color: '#2563EB', bg: '#EFF6FF' },
  { icon: CloudDownloadOutlined, label: 'Download Notes', color: '#059669', bg: '#ECFDF5' },
  { icon: HelpOutlineOutlined, label: 'Ask Question', color: '#D97706', bg: '#FEF3C7' },
  { icon: LocalLibraryOutlined, label: 'Library', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: EmojiEventsOutlined, label: 'My Achievements', color: '#E11D48', bg: '#FFF1F2' },
  { icon: ContactSupportOutlined, label: 'Contact Teacher', color: '#0891B2', bg: '#ECFEFF' },
];

const QuickActions = () => {
  return (
    <Card elevation={0} sx={{ ...cardSx, p: '12px 14px', mt: 2 }}>
      <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827', mb: 1 }}>
        Quick Actions
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 1.25,
        }}
      >
        {actions.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.label}
              elevation={0}
              sx={{
                p: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid #F3F4F6',
                borderRadius: '6px',
                cursor: 'pointer',
                bgcolor: '#fff',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: '#F9FAFB',
                  borderColor: '#E5E7EB',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  bgcolor: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent sx={{ fontSize: 15 }} />
              </Box>
              <Typography
                noWrap
                fontWeight="600"
                sx={{ fontSize: '0.72rem', color: '#374151', flex: 1 }}
              >
                {item.label}
              </Typography>
            </Card>
          );
        })}
      </Box>
    </Card>
  );
};

export default QuickActions;
