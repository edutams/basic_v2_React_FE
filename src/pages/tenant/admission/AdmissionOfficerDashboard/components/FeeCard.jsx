import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * Financial fee card — stat-card treatment (gradient bg + icon tile).
 *
 * When `onClick` is provided the card is clickable and shows a tooltip signalling it
 * opens a breakdown modal (same interaction as the AdminDashboard OverviewCard).
 */
const FeeCard = ({ colorName = 'primary', title, value, sub, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

  return (
    <Tooltip title={onClick ? 'Click to view breakdown' : ''} placement="top" arrow>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: 1,
          borderRadius: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: onClick ? 'pointer' : 'default',
          background: isDark ? theme.palette.background.paper : colors.cardBg,
          border: '1px rgba(69, 67, 67, 1) solid',
          boxShadow: isDark
            ? '0 10px 30px rgba(0,0,0,0.35)'
            : '0 4px 20px rgba(0,0,0,0.07)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: onClick ? 'translateY(-3px)' : 'none',
            boxShadow: isDark
              ? '0 8px 30px rgba(0,0,0,0.35)'
              : '0 6px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: `${colors.iconBg} !important`,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : `0 4px 14px ${colors.iconGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: 16, color: colors.iconColor || '#fff' }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
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
          color: isDark ? '#fff' : colors.accentColor,
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
