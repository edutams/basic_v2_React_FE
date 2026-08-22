import React from 'react';
import { Box, Card, Typography, Stack, List, ListItem, ListItemText, ListItemIcon, Skeleton } from '@mui/material';
import {
  WarningAmberOutlined,
  MenuBookOutlined,
  CampaignOutlined,
  CheckCircleOutlineOutlined,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

/* Each notification row gets its own tinted background row */
const TYPE_STYLES = {
  fee:     { icon: WarningAmberOutlined,       iconBg: '#FEE2E2', iconColor: '#DC2626', rowBg: '#FFF5F5', rowBorder: '#FECACA' },
  payment: { icon: CheckCircleOutlineOutlined, iconBg: '#DCFCE7', iconColor: '#16A34A', rowBg: '#F0FDF4', rowBorder: '#A7F3D0' },
  event:   { icon: CampaignOutlined,           iconBg: '#DBEAFE', iconColor: '#2563EB', rowBg: '#EFF6FF', rowBorder: '#BFDBFE' },
  message: { icon: MenuBookOutlined,           iconBg: '#FEF3C7', iconColor: '#D97706', rowBg: '#FFFBEB', rowBorder: '#FDE68A' },
};

const NotifItem = ({ icon: Icon, iconBg, iconColor, rowBg, rowBorder, text, time }) => (
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
    {/* Icon circle */}
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
    {/* Text */}
    <Typography sx={{ fontSize: '0.73rem', color: '#111827', fontWeight: 500, lineHeight: 1.35, flex: 1 }}>
      {text}
    </Typography>
    {/* Time */}
    <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', whiteSpace: 'nowrap', mt: '2px', flexShrink: 0 }}>
      {time}
    </Typography>
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
      secondary={<Typography sx={{ fontSize: '0.66rem', color: '#6B7280' }}>{timeStr}</Typography>}
    />
  </ListItem>
);

const Notifications = ({ notifications = [], events = [], loading = false }) => {
  if (loading) {
    return (
      <Stack spacing={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {[0, 1].map((i) => (
          <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    );
  }

  return (
  <Stack spacing={2} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    {/* Notifications */}
    <Card elevation={0} sx={{ ...cardSx, p: '12px 14px', flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.9}>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>Notifications</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>View All</Typography>
      </Stack>

      {notifications.length > 0 ? (
        notifications.slice(0, 4).map((n, i) => {
          const style = TYPE_STYLES[n.type] || TYPE_STYLES.message;
          return (
            <NotifItem
              key={i}
              icon={style.icon}
              iconBg={style.iconBg}
              iconColor={style.iconColor}
              rowBg={style.rowBg}
              rowBorder={style.rowBorder}
              text={n.text}
              time={n.time}
            />
          );
        })
      ) : (
        <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 1 }}>
          You're all caught up.
        </Typography>
      )}
    </Card>

    {/* Upcoming Events */}
    <Card elevation={0} sx={{ ...cardSx, p: '12px 14px', flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>Upcoming Events</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>View Calendar</Typography>
      </Stack>
      <List disablePadding>
        {events.length > 0 ? (
          events.map((e, i) => (
            <EventItem key={i} month={e.month} day={e.day} title={e.title} timeStr={e.time} />
          ))
        ) : (
          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 1 }}>
            No upcoming events.
          </Typography>
        )}
      </List>
    </Card>
  </Stack>
  );
};

export default Notifications;
