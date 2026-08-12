import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { GREEN, makeSparkData, num } from '../constants';

/**
 * Global overview card — circular icon top-left, title, big value, trend, sparkline.
 *
 * sparkData is real month-by-month history from the backend; when it is empty
 * (e.g. an older cached payload) a deterministic placeholder is used.
 */
const OverviewCard = ({ icon: Icon, colorName, title, value, trend, down, sparkData }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);
  const trendUp = num(trend) >= 0;
  const sparkDataResolved =
    sparkData && sparkData.length > 0 ? sparkData : makeSparkData(down || !trendUp);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
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
      {/* Icon + title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: `${colors.iconBg} !important`,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : `0 4px 14px ${colors.iconGlow}`,
            color: colors.iconColor || '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ fontSize: 11, color: 'text.secondary' }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value */}
      <Typography
        sx={{
          mt: 1.25,
          fontSize: { xs: 19, md: 22 },
          fontWeight: 800,
          lineHeight: 1.1,
          color: isDark ? '#fff' : colors.accentColor,
        }}
      >
        {value}
      </Typography>

      {/* Trend */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        {trendUp ? (
          <TrendingUp sx={{ fontSize: 12.5, color: GREEN }} />
        ) : (
          <TrendingDown sx={{ fontSize: 12.5, color: 'error.main' }} />
        )}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ fontSize: 10, color: trendUp ? GREEN : 'error.main' }}
        >
          {Math.abs(num(trend))}% vs last term
        </Typography>
      </Box>

      {/* Sparkline */}
      <Box sx={{ mt: 'auto', pt: 1, height: 34 }}>
        <ReusableSparkline
          data={sparkDataResolved}
          dataKey="v"
          color={colors.accentColor}
          height={34}
          gradientOpacity={0.3}
          showTooltip
          labelKey="label"
          tooltipValueFormatter={(v) => `${num(v).toLocaleString()} ${title.toLowerCase()}`}
        />
      </Box>
    </Paper>
  );
};

export default OverviewCard;
