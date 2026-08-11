import React from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ErrorOutline,
  HourglassEmpty,
  Schedule,
  TrackChanges,
  InfoOutlined,
  ChevronRight,
} from '@mui/icons-material';
import { formatCurrency } from '../constants';

/**
 * Operational alert card — matches the reference layout: a tinted severity box with a
 * solid circular icon + bold colored title, a bold dark value with muted sublabel, a
 * secondary count stat line, and a chevron on the right. The efficiency-target alert
 * shows a progress bar with a target marker and red variance line instead.
 */
const AlertCard = ({ alert }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isTarget = alert.type === 'efficiency_target';

  const colorMap = {
    outstanding_fees: '#DC2626',
    settlements_pending: '#F97316',
    late_payment: '#D97706',
    efficiency_target: '#059669',
  };
  const iconMap = {
    outstanding_fees: ErrorOutline,
    settlements_pending: HourglassEmpty,
    late_payment: Schedule,
    efficiency_target: TrackChanges,
  };
  // Subtitle line (value label) per alert type — avoids repeating the footer text
  const subtitleMap = {
    outstanding_fees: 'Total Unpaid Balance',
    settlements_pending: 'Unsettled Transactions',
    late_payment: 'Overdue Amount',
    efficiency_target: 'Current Efficiency',
  };
  // Footer line: bold count + unit, then the trailing label
  const footerMap = {
    outstanding_fees: { unit: 'Students', label: 'Have outstanding fees' },
    settlements_pending: { unit: 'Transactions', label: 'Awaiting settlement' },
    late_payment: { unit: 'Students', label: 'Payments overdue' },
  };
  const color = colorMap[alert.type] || theme.palette.info.main;
  const Icon = iconMap[alert.type] || InfoOutlined;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.75,
        borderRadius: '14px',
        bgcolor: isDark ? alpha(color, 0.14) : alpha(color, 0.07),
        border: '1px solid',
        borderColor: isDark ? alpha(color, 0.32) : alpha(color, 0.16),
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          bgcolor: isDark ? alpha(color, 0.18) : alpha(color, 0.09),
          boxShadow: `0 6px 18px ${alpha(color, 0.16)}`,
        },
      }}
    >
      {/* Solid circular severity icon */}
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          bgcolor: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 10px ${alpha(color, 0.35)}`,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>

      {/* Content: title / value / sublabel / secondary stat */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ color, fontSize: 11.5, lineHeight: 1.3 }}
        >
          {alert.title}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ mt: 0.5, color: 'text.primary', fontSize: 18, lineHeight: 1.15 }}
        >
          {isTarget ? `${alert.percentage}%` : formatCurrency(alert.amount)}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {subtitleMap[alert.type] || alert.description}
        </Typography>

        {isTarget ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.primary">
              Target: {alert.target}%
            </Typography>
            <Box sx={{ position: 'relative', mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(alert.percentage, 100)}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.14)' : alpha(color, 0.14),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 4,
                  },
                }}
              />
              {/* Dark target marker */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  height: 11,
                  width: 3,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(255,255,255,0.9)' : '#1F2937',
                  left: `calc(${Math.min(alert.target, 100)}% - 1.5px)`,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
            >
              {alert.variance}% to target
            </Typography>
          </Box>
        ) : (
          footerMap[alert.type] && (
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontSize: 11.5 }}>
                {alert.count} {footerMap[alert.type].unit}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / {footerMap[alert.type].label}
              </Typography>
            </Box>
          )
        )}
      </Box>

      {/* Chevron */}
      <ChevronRight sx={{ color: alpha(color, 0.55), flexShrink: 0 }} />
    </Box>
  );
};

export default AlertCard;
