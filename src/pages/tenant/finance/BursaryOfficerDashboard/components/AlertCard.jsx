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

const ICON_SIZE = 38;
const ICON_GAP = 12; // px, matches gap: 1.5

/**
 * Operational alert card — icon + title + chevron on the top row, with the
 * value/sublabel content indented underneath the title. Each alert type has
 * a "primary" stat (large, bold) and a "secondary" stat (smaller, bold),
 * both stacked as value → label. Late payment inverts the usual
 * amount/count order: count is primary, amount is secondary.
 */
const AlertCard = ({ alert }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isTarget = alert.type === 'efficiency_target';

  const config = {
    outstanding_fees: {
      color: '#DC2626',
      Icon: ErrorOutline,
      primaryValue: formatCurrency(alert.amount),
      primaryLabel: 'Total Unpaid Balance',
      secondaryValue: `${alert.count} Students`,
      secondaryLabel: 'Have outstanding fees',
    },
    settlements_pending: {
      color: '#F97316',
      Icon: HourglassEmpty,
      primaryValue: formatCurrency(alert.amount),
      primaryLabel: 'Unsettled Transactions',
      secondaryValue: `${alert.count} Transactions`,
      secondaryLabel: 'Awaiting settlement',
    },
    late_payment: {
      color: '#D97706',
      Icon: Schedule,
      primaryValue: `${alert.count} Students`,
      primaryLabel: 'Payments overdue',
      secondaryValue: formatCurrency(alert.amount),
      secondaryLabel: 'Overdue Amount',
    },
    efficiency_target: {
      color: '#059669',
      Icon: TrackChanges,
      primaryValue: `${alert.percentage}%`,
      primaryLabel: 'Current Efficiency',
    },
  };

  const { color, Icon, primaryValue, primaryLabel, secondaryValue, secondaryLabel } =
    config[alert.type] || {
      color: theme.palette.info.main,
      Icon: InfoOutlined,
      primaryValue: alert.amount ? formatCurrency(alert.amount) : '',
      primaryLabel: alert.description,
    };

  return (
    <Box
      sx={{
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
      {/* Top row: icon, title, chevron */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: ICON_SIZE,
            height: ICON_SIZE,
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

        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ color, fontSize: 11.5, lineHeight: 1.3, flex: 1 }}
        >
          {alert.title}
        </Typography>

        <ChevronRight sx={{ color: alpha(color, 0.55), flexShrink: 0 }} />
      </Box>

      {/* Content, indented to align under the title */}
      <Box sx={{ pl: `${ICON_SIZE + ICON_GAP}px`, mt: 0.5 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ color: 'text.primary', fontSize: 18, lineHeight: 1.15 }}
        >
          {primaryValue}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {primaryLabel}
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
          secondaryValue && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                fontWeight={800}
                color="text.primary"
                sx={{ fontSize: 13, lineHeight: 1.2 }}
              >
                {secondaryValue}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {secondaryLabel}
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default AlertCard;