import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme, LinearProgress } from '@mui/material';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * KPI card — project-standard stat card (same pattern as PsychomotorAnalyticsCards /
 * DashboardStatCard): getStatCardColor gradient background, accent-colored uppercase
 * caption, big accent value, and LinearProgress bar.
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

      {/* Sublabel under count */}
      <Box sx={{ mt: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
      </Box>

      {typeof progress === 'number' && (
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            mt: 'auto',
            mb: 0,
            height: 5,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: colors.accentColor,
            },
          }}
        />
      )}
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
