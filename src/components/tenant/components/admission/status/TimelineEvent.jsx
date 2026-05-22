import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import {
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { IconClipboardCheck, IconSearch, IconTrophy, IconClock } from '@tabler/icons-react';

export const TIMELINE_ICON_MAP = {
  submitted: { icon: DescriptionIcon, bg: '#1565C0', isMui: true },
  reviewed: { icon: IconClipboardCheck, bg: '#2E7D32', isMui: false },
  exam: { icon: IconTrophy, bg: '#6A1B9A', isMui: false },
  decision: { icon: IconSearch, bg: '#E65100', isMui: false },
  fee: { icon: CreditCardIcon, bg: '#9E9E9E', isMui: true },
  pending: { icon: IconClock, bg: '#BDBDBD', isMui: false },
};

const TimelineEvent = ({ type = 'pending', title, date, detail, isLast = false }) => {
  const { icon: Icon, bg, isMui } = TIMELINE_ICON_MAP[type] ?? TIMELINE_ICON_MAP.pending;
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: bg, flexShrink: 0 }}>
          {isMui ? <Icon sx={{ fontSize: 18, color: '#fff' }} /> : <Icon size={18} color="#fff" />}
        </Avatar>
        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', mt: 0.5, mb: 0.5, minHeight: 20 }} />}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 2, pt: 0.25 }}>
        <Typography variant="body2" fontWeight={700}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {date}{detail ? ` · ${detail}` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default TimelineEvent;
