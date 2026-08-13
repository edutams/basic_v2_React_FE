import React from 'react';
import { Box, Card, Typography, Stack, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, Skeleton } from '@mui/material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const ContactItem = ({ initial, name, role }) => (
  <Box
    textAlign="center"
    sx={{ cursor: 'pointer', flex: '1 1 0', '&:hover': { opacity: 0.8 }, transition: 'opacity 0.15s' }}
  >
    <Avatar
      sx={{
        width: 38,
        height: 38,
        mb: 0.5,
        mx: 'auto',
        bgcolor: '#E2E8F0',
        color: '#334155',
        fontWeight: 700,
        fontSize: '0.8rem',
        border: '1.5px solid #CBD5E1',
      }}
    >
      {initial}
    </Avatar>
    <Typography fontWeight="700" sx={{ fontSize: '0.7rem', color: '#111827', lineHeight: 1.2 }}>{name}</Typography>
    <Typography sx={{ fontSize: '0.62rem', color: '#6B7280' }}>{role}</Typography>
  </Box>
);

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'W';

const MessageItem = ({ name, text, time }) => (
  <ListItem sx={{ px: 0, py: 0.75, borderBottom: '1px solid #F3F4F6', '&:last-child': { borderBottom: 0, pb: 0 } }}>
    <ListItemAvatar sx={{ minWidth: 34 }}>
      <Avatar sx={{ width: 26, height: 26, bgcolor: '#E2E8F0', color: '#334155', fontSize: '0.7rem', fontWeight: 700 }}>
        {initialsOf(name)}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight="700" sx={{ fontSize: '0.75rem', color: '#111827' }}>{name}</Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF' }}>{time}</Typography>
        </Stack>
      }
      secondary={
        <Typography noWrap sx={{ fontSize: '0.68rem', color: '#6B7280', display: 'block', mt: 0.1 }}>{text}</Typography>
      }
    />
  </ListItem>
);

const CommunicationCenter = ({ contacts = [], messages = [], loading = false }) => {
  if (loading) {
    return (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2} alignItems="stretch">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={160} sx={{ flex: 1, borderRadius: '8px' }} />
        ))}
      </Stack>
    );
  }

  return (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2} alignItems="stretch">

    {/* Communication Center */}
    <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1.2 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827' }}>
          Communication Center
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', mb: 1.25 }}>
          Stay connected with teachers and school admin
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {contacts.length > 0 ? (
            contacts.map((c) => (
              <ContactItem key={c.id || c.name} initial={initialsOf(c.name)} name={c.name} role={c.role} />
            ))
          ) : (
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 1 }}>
              No teacher contacts yet.
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>

    {/* Recent Messages */}
    <Card elevation={0} sx={{ ...cardSx, flex: { xs: '1 1 100%', md: '1 1 0' }, p: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827', mb: 0.6 }}>
          Recent Messages
        </Typography>
        <List disablePadding>
          {messages.length > 0 ? (
            messages.map((m, i) => <MessageItem key={i} name={m.name} text={m.text} time={m.time} />)
          ) : (
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', py: 1 }}>
              No messages yet.
            </Typography>
          )}
        </List>
      </Box>
      <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, cursor: 'pointer', mt: 0.75 }}>
        View All Messages →
      </Typography>
    </Card>

    {/* Weekly Report Ready — same row */}
    <Card
      elevation={0}
      sx={{
        ...cardSx,
        flex: { xs: '1 1 100%', md: '0.85 1 0' },
        p: '12px 14px',
        borderColor: '#BFDBFE',
        bgcolor: '#EFF6FF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle decorative bar top-right */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '0 8px 0 60px', bgcolor: 'rgba(37,99,235,0.07)' }} />

      <Box>
        <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#1E40AF', mb: 0.4 }}>
          Weekly Report Ready
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#3B82F6', lineHeight: 1.45, mb: 1.25 }}>
          Your weekly academic and attendance report is ready to view.
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        disableElevation
        sx={{
          alignSelf: 'flex-start',
          bgcolor: '#2563EB',
          borderRadius: '7px',
          textTransform: 'none',
          fontSize: '0.73rem',
          fontWeight: 600,
          px: 1.75,
          py: 0.5,
          '&:hover': { bgcolor: '#1D4ED8' },
        }}
      >
        View Report
      </Button>
    </Card>

  </Stack>
  );
};

export default CommunicationCenter;
