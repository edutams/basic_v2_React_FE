import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  AssignmentOutlined,
  QuizOutlined,
  PaymentOutlined,
  EventNoteOutlined,
  FolderZipOutlined,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const NotifItem = ({ icon: Icon, iconBg, iconColor, rowBg, rowBorder, title, desc, time }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1,
      bgcolor: rowBg,
      border: `1px solid ${rowBorder}`,
      borderRadius: '6px',
      px: 1,
      py: 0.75,
      mb: 0.75,
      '&:last-child': { mb: 0 },
    }}
  >
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: '1px',
      }}
    >
      <Icon sx={{ fontSize: 12 }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography fontWeight="700" sx={{ fontSize: '0.73rem', color: '#111827', lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', whiteSpace: 'nowrap', ml: 0.75, flexShrink: 0 }}>
          {time}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: '0.65rem', color: '#4B5563', mt: 0.15, lineHeight: 1.25 }}>
        {desc}
      </Typography>
    </Box>
  </Box>
);

const EventItem = ({ month, day, title, timeStr }) => (
  <ListItem sx={{ px: 0, py: 0.75, borderBottom: '1px solid #F3F4F6', '&:last-child': { borderBottom: 0, pb: 0 } }}>
    <Box
      sx={{
        width: 36,
        textAlign: 'center',
        mr: 1.25,
        flexShrink: 0,
        bgcolor: '#EFF6FF',
        borderRadius: '6px',
        py: 0.35,
        border: '1px solid #BFDBFE',
      }}
    >
      <Typography sx={{ fontSize: '0.55rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>
        {month}
      </Typography>
      <Typography fontWeight="800" sx={{ fontSize: '0.9rem', color: '#1E3A8A', lineHeight: 1.1 }}>
        {day}
      </Typography>
    </Box>
    <ListItemText
      primary={<Typography fontWeight="700" sx={{ fontSize: '0.76rem', color: '#111827', lineHeight: 1.2 }}>{title}</Typography>}
      secondary={<Typography sx={{ fontSize: '0.66rem', color: '#6B7280', mt: 0.1 }}>{timeStr}</Typography>}
    />
  </ListItem>
);

const RightPanel = () => {
  return (
    <Stack spacing={2}>
      {/* ─── Notifications Section ─── */}
      <Card elevation={0} sx={{ ...cardSx, p: '12px 14px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>
            Notifications
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
            View All
          </Typography>
        </Stack>

        <NotifItem
          icon={AssignmentOutlined}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          rowBg="#EFF6FF"
          rowBorder="#BFDBFE"
          title="New assignment posted"
          desc="Physics: Wave Theory Assignment"
          time="30 mins ago"
        />

        <NotifItem
          icon={QuizOutlined}
          iconBg="#FEF3C7"
          iconColor="#D97706"
          rowBg="#FFFBEB"
          rowBorder="#FDE68A"
          title="Upcoming Quiz"
          desc="English Language Quiz"
          time="Tomorrow, 9:00 AM"
        />

        <NotifItem
          icon={PaymentOutlined}
          iconBg="#FEE2E2"
          iconColor="#DC2626"
          rowBg="#FFF5F5"
          rowBorder="#FECACA"
          title="Fee Payment Reminder"
          desc="You have outstanding fees"
          time="2 hours ago"
        />

        <NotifItem
          icon={EventNoteOutlined}
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
          rowBg="#F5F3FF"
          rowBorder="#DDD6FE"
          title="Exam Timetable Released"
          desc="Check your exam schedule"
          time="1 day ago"
        />

        <NotifItem
          icon={FolderZipOutlined}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          rowBg="#F0FDF4"
          rowBorder="#A7F3D0"
          title="New Resource Available"
          desc="Chemistry: Organic Compounds"
          time="2 days ago"
        />
      </Card>

      {/* ─── Upcoming Events Section ─── */}
      <Card elevation={0} sx={{ ...cardSx, p: '12px 14px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
          <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>
            Upcoming Events
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>
            View Calendar
          </Typography>
        </Stack>

        <List disablePadding>
          <EventItem month="MAY" day="10" title="Physics Quiz" timeStr="May 10, 2025 · 9:00 AM" />
          <EventItem month="MAY" day="12" title="Mathematics Assignment Due" timeStr="May 12, 2025 · 11:59 PM" />
          <EventItem month="MAY" day="16" title="Inter-House Sports" timeStr="May 16, 2025 · All Day" />
          <EventItem month="MAY" day="26" title="Term Exam Begins" timeStr="May 26, 2025 · 8:00 AM" />
        </List>
      </Card>
    </Stack>
  );
};

export default RightPanel;
