import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme, CircularProgress } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

/**
 * KPI card matching the target design:
 * - Large rounded icon chip on the left
 * - Uppercase label above the value
 * - Big bold value
 * - Divider line
 * - Bottom row: "This Session" | trend arrow + % | "vs last session"
 */
const KpiCard = ({
  label,
  value,
  sublabel = 'This Session',
  icon: Icon,
  colorName = 'primary',
  progress,
  onClick,
  rightElement,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Color palette matching the design image exactly
  const colorMap = {
    primary:  { bg: '#EEF2FF', icon: '#4338CA' },
    info:     { bg: '#EEF2FF', icon: '#4338CA' },
    success:  { bg: '#ECFDF5', icon: '#059669' },
    warning:  { bg: '#FFF7ED', icon: '#EA580C' },
    error:    { bg: '#FEF2F2', icon: '#DC2626' },
    secondary:{ bg: '#F5F3FF', icon: '#7C3AED' },
  };

  const palette = colorMap[colorName] || colorMap.primary;
  const isPositive = progress >= 0;
  const progressAbs = Math.abs(progress || 0);

  const card = (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 0,
        borderRadius: '14px',
        height: '100%',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }
          : {},
      }}
    >
      {/* Top section: icon + label + value */}
      <Box sx={{ p: '8px 10px 6px', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Icon chip */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : palette.bg,
              color: isDark ? '#fff' : palette.icon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {rightElement || (Icon && <Icon sx={{ fontSize: 24 }} />)}
          </Box>

          {/* Label + Value */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: isDark ? 'rgba(255,255,255,0.55)' : '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                lineHeight: 1.25,
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 800,
                color: isDark ? '#fff' : '#111827',
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Divider line */}
      <Box sx={{ mx: '10px', borderTop: '1px solid #F3F4F6' }} />

      {/* Bottom row: sublabel | trend | vs last session */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: '10px',
          py: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF',
            fontWeight: 500,
          }}
        >
          {sublabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {typeof progress === 'number' && (
            <>
              {isPositive ? (
                <ArrowUpward sx={{ fontSize: 13, color: '#16A34A' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 13, color: '#EF4444' }} />
              )}
              <Typography
                fontWeight={700}
                sx={{
                  fontSize: '0.68rem',
                  color: isPositive ? '#16A34A' : '#EF4444',
                }}
              >
                {progressAbs.toFixed(1)}%
              </Typography>
            </>
          )}
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF',
              ml: 0.25,
            }}
          >
            vs last session
          </Typography>
        </Box>
      </Box>
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



/**
 * Efficiency Ring — circular progress with percentage centered.
 * Used inside the Collection Efficiency KPI card.
 */
const EfficiencyRing = ({ value }) => {
  const color =
    value >= 75
      ? '#16A34A'
      : value >= 50
        ? '#F59E0B'
        : '#EF4444';

  return (
    <Box sx={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(value, 100)}
        size={48}
        thickness={4}
        sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" fontWeight={800} sx={{ fontSize: 9 }}>
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
};

export { EfficiencyRing };
export default KpiCard;
