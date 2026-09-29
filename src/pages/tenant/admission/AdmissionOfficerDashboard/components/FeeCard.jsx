import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const FeeCard = ({ colorIndex = 0, title, value, sub, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Tooltip title={onClick ? 'Click to view breakdown' : ''} placement="top" arrow>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: '14px',
          borderRadius: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#94a3b8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
            color: isDark ? '#ffffff' : scheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: 16, color: 'inherit' }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : scheme.color,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            fontSize: '11px',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          my: 1,
          color: isDark ? '#fff' : scheme.color,
          fontSize: { xs: '22px', sm: '26px' },
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      <Box sx={{ minHeight: 18 }}>{sub}</Box>
      </Paper>
    </Tooltip>
  );
};

export default FeeCard;
