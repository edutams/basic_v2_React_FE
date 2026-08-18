import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme, LinearProgress, Chip } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * KPI card — project-standard stat card (same pattern as PsychomotorAnalyticsCards /
 * DashboardStatCard): getStatCardColor gradient background, accent-colored uppercase
 * caption, big accent value, and LinearProgress bar with comparison to last session.
 */
const KpiCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  colorName = 'primary',
  colorIndex = 0,
  progress,
  rightElement,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

  const isPositive = progress >= 0;
  const progressAbs = Math.abs(progress || 0);

  const card = (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: '16px',
        height: '100%',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: '1px rgba(69, 67, 67, 1) solid',
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-3px)' : 'translateY(-1px)',
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
        // Layout for cards with charts (efficiency ring): value left, chart right
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: isDark ? '#fff' : colors.accentColor,
                fontSize: { xs: 22, md: 26 },
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
        // Layout for cards with icons: number flexes beside the fixed icon
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                flex: 1,
                minWidth: 0,
                color: isDark ? '#fff' : colors.accentColor,
                fontSize: { xs: 22, md: 26 },
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
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
        </>
      )}

      {/* Sublabel and comparison row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {sublabel}
        </Typography>
        {typeof progress === 'number' && (
          <Chip
            icon={isPositive ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
            label={`${progressAbs.toFixed(1)}%`}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: isPositive 
                ? isDark ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)'
                : isDark ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
              color: isPositive ? 'success.main' : 'error.main',
              '& .MuiChip-icon': {
                color: isPositive ? 'success.main' : 'error.main',
                ml: 0.5,
              },
            }}
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>
        vs last session
      </Typography>
    </Paper>
  );

  if (!onClick) {
    return card;
  }

  return (
    <Tooltip title="Click to view breakdown" placement="top" arrow>
      {card}
    </Tooltip>
  );
};

export default KpiCard;
