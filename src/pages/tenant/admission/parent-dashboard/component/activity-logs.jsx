import React from 'react';
import { Box, Card, Typography, Stack } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const LOG_META = {
  fee:     { icon: WarningAmberOutlinedIcon,       iconBg: '#fee2e2', iconColor: '#dc2626' },
  payment: { icon: CheckCircleOutlineOutlinedIcon, iconBg: '#dcfce7', iconColor: '#16a34a' },
  event:   { icon: EventAvailableOutlinedIcon,     iconBg: '#dbeafe', iconColor: '#2563eb' },
  message: { icon: AssignmentOutlinedIcon,         iconBg: '#ffedd5', iconColor: '#ea580c' },
};

const ActivityLogs = ({ logs = [], onViewAll }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.25, pt: 2.25, pb: 1.5 }}>
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

      {/* Log Items — scrollable */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2.25,
          pb: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#d1d5db', borderRadius: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
      {logs.length === 0 && (
        <Typography sx={{ fontSize: 12, color: '#94a3b8', py: 2, textAlign: 'center' }}>
          No recent activity yet.
        </Typography>
      )}
      <Stack spacing={1.75}>
        {logs.map((notification, idx) => {
          const meta = LOG_META[notification.type] || LOG_META.message;
          const Icon = meta.icon;
          return (
            <Stack
              key={idx}
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
                    bgcolor: meta.iconBg,
                    color: meta.iconColor,
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
                    {notification.text}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                {notification.time}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
      </Box>
    </Card>
  );
};

export default ActivityLogs;
