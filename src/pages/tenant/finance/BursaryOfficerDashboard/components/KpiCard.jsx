import React from 'react';
import { Box, Typography, Paper, Stack, useTheme, LinearProgress } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * KPI card — project-standard stat card (same pattern as PsychomotorAnalyticsCards /
 * DashboardStatCard): getStatCardColor gradient background, accent-colored uppercase
 * caption, big accent value, LinearProgress bar, and trend indicator.
 */
const KpiCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  colorName = 'primary',
  colorIndex = 0,
  progress,
  trend,
  trendLabel,
  rightElement,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        height: '100%',
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
      {/* Label row */}
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          color: isDark ? 'rgba(255,255,255,0.72)' : colors.accentColor,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
          fontSize: 10,
          display: 'block',
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {/* Content row - different layout for rightElement vs icon */}
      {rightElement ? (
        // Layout for cards with charts (efficiency ring, sparkline): value left, chart right
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: isDark ? '#fff' : colors.accentColor,
                fontSize: { xs: 19, md: 22 },
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            {rightElement}
          </Box>
        </Box>
      ) : (
        // Layout for cards with icons: icon top-right, value below label
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            {Icon && (
              <Box
                sx={{
                  width: 38,
                  height: 38,
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
                <Icon sx={{ fontSize: 17, color: colors.iconColor || '#fff' }} />
              </Box>
            )}
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 0.5,
              color: isDark ? '#fff' : colors.accentColor,
              fontSize: { xs: 19, md: 22 },
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </>
      )}

      {typeof progress === 'number' && (
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            my: 1,
            height: 5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: colors.accentColor,
            },
          }}
        />
      )}

      {/* Sublabel and trend row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
        {trend !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.4}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: trend > 0 ? theme.palette.success.main : theme.palette.error.main }}
            >
              {trendLabel || `${trend > 0 ? '+' : ''}${trend}%`}
            </Typography>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ fontSize: 12.5, color: theme.palette.success.main }} />
            ) : trend < 0 ? (
              <TrendingDownIcon sx={{ fontSize: 12.5, color: theme.palette.error.main }} />
            ) : (
              <TrendingFlatIcon sx={{ fontSize: 12.5, color: colors.accentColor }} />
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default KpiCard;
