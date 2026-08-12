import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { formatCurrency } from '../constants';

/**
 * Financial fee card — stat-card treatment (gradient bg + icon tile) with a mini
 * sparkline fed by the backend's weekly fee_trend series ({ label, v } points).
 */
const FeeCard = ({ color, colorName = 'primary', title, value, sub, sparkData = [] }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
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
            fontSize: 10,
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
          fontSize: { xs: 17, md: 21 },
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      <Box sx={{ minHeight: 18 }}>{sub}</Box>

      <Box sx={{ mt: 'auto', pt: 1, height: 48 }}>
        <ReusableSparkline
          data={sparkData}
          dataKey="v"
          color={isDark ? colors.accentColor : color}
          height={48}
          showTooltip
          labelKey="label"
          tooltipValueFormatter={(v) => formatCurrency(v)}
        />
      </Box>
    </Paper>
  );
};

export default FeeCard;
