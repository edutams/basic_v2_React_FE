import React from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Skeleton,
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

// Visual treatment per notification type (falls back to a neutral style).
const NOTIF_META = {
  assignment: { icon: AssignmentOutlined, iconBg: '#DBEAFE', iconColor: '#2563EB', rowBg: '#EFF6FF', rowBorder: '#BFDBFE' },
  quiz: { icon: QuizOutlined, iconBg: '#FEF3C7', iconColor: '#D97706', rowBg: '#FFFBEB', rowBorder: '#FDE68A' },
  fee: { icon: PaymentOutlined, iconBg: '#FEE2E2', iconColor: '#DC2626', rowBg: '#FFF5F5', rowBorder: '#FECACA' },
  exam: { icon: EventNoteOutlined, iconBg: '#EDE9FE', iconColor: '#7C3AED', rowBg: '#F5F3FF', rowBorder: '#DDD6FE' },
  resource: { icon: FolderZipOutlined, iconBg: '#DCFCE7', iconColor: '#16A34A', rowBg: '#F0FDF4', rowBorder: '#A7F3D0' },
};

const defaultMeta = { icon: EventNoteOutlined, iconBg: '#E5E7EB', iconColor: '#6B7280', rowBg: '#F9FAFB', rowBorder: '#E5E7EB' };

const NotifItem = ({ type = 'resource', title, desc, time }) => {
  const meta = NOTIF_META[type] || defaultMeta;
  const Icon = meta.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        bgcolor: meta.rowBg,
        border: `1px solid ${meta.rowBorder}`,
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
          bgcolor: meta.iconBg,
          color: meta.iconColor,
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
};

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

const ListSkeleton = ({ rows = 4 }) => (
  <Stack spacing={0.75}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={22} height={22} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="75%" height={12} />
          <Skeleton variant="text" width="55%" height={10} />
        </Box>
      </Box>
    ))}
  </Stack>
);

const RightPanel = ({ notifications = [], events = [], loading = false }) => {
  const notifList = Array.isArray(notifications) ? notifications : [];
  const eventList = Array.isArray(events) ? events : [];

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

        {loading ? (
          <ListSkeleton />
        ) : notifList.length === 0 ? (
          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 3, textAlign: 'center' }}>
            You're all caught up — no new notifications.
          </Typography>
        ) : (
          notifList.map((item, idx) => (
            <NotifItem
              key={`${item.type}-${item.title}-${idx}`}
              type={item.type}
              title={item.title}
              desc={item.desc}
              time={item.time}
            />
          ))
        )}
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

        {loading ? (
          <ListSkeleton rows={4} />
        ) : eventList.length === 0 ? (
          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 3, textAlign: 'center' }}>
            No upcoming events.
          </Typography>
        ) : (
          <List disablePadding>
            {eventList.map((event, idx) => (
              <EventItem
                key={`${event.title}-${idx}`}
                month={event.month}
                day={event.day}
                title={event.title}
                timeStr={event.timeStr}
              />
            ))}
          </List>
        )}
      </Card>
    </Stack>
  );
};

export default RightPanel;
