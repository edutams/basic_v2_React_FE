import React from 'react';
import { Box, Card, Typography, Stack, Avatar, List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  PersonAddOutlined,
  ChatBubbleOutlineOutlined,
  DownloadOutlined,
  ChevronRight,
} from '@mui/icons-material';

const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'grey.100',
  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  bgcolor: '#fff',
};

const actions = [
  { icon: AccountBalanceWalletOutlined, iconBg: '#DCFCE7', iconColor: '#16A34A', title: 'Pay School Fees', subtitle: 'Pay for one or more wards' },
  { icon: PersonAddOutlined, iconBg: '#EDE9FE', iconColor: '#7C3AED', title: 'Apply for Admission', subtitle: 'Start a new admission' },
  { icon: ChatBubbleOutlineOutlined, iconBg: '#DBEAFE', iconColor: '#2563EB', title: 'Message Teacher', subtitle: 'Chat with teachers/admin' },
  { icon: DownloadOutlined, iconBg: '#FEF3C7', iconColor: '#D97706', title: 'Download Reports', subtitle: 'Get ward reports' },
];

const QuickActions = () => (
  <Card elevation={0} sx={{ ...cardSx, p: '14px', mb: 2 }}>
    <Typography fontWeight="700" sx={{ fontSize: '0.88rem', color: '#111827', mb: 0.5 }}>
      Quick Actions
    </Typography>
    <List disablePadding>
      {actions.map(({ icon: Icon, iconBg, iconColor, title, subtitle }) => (
        <ListItem
          key={title}
          sx={{
            px: 0,
            py: 1,
            borderBottom: '1px solid #F3F4F6',
            '&:last-child': { borderBottom: 0, pb: 0 },
            cursor: 'pointer',
            borderRadius: '6px',
            '&:hover': { bgcolor: '#F9FAFB' },
            transition: 'background 0.15s',
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                bgcolor: iconBg,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 15 }} />
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={<Typography fontWeight="700" sx={{ fontSize: '0.8rem', color: '#111827' }}>{title}</Typography>}
            secondary={<Typography sx={{ fontSize: '0.7rem', color: '#6B7280' }}>{subtitle}</Typography>}
          />
          <ChevronRight sx={{ color: '#D1D5DB', fontSize: 17 }} />
        </ListItem>
      ))}
    </List>
  </Card>
);

export default QuickActions;
