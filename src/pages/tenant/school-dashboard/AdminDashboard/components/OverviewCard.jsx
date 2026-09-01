import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Compact overview card — horizontal layout (Icon + Title on left, Value on right)
 * eliminates all empty/dead space in the card.
 */
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const OverviewCard = ({ icon: Icon, colorIndex = 0, title, value, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Tooltip
      title={onClick ? 'Click to view breakdown' : ''}
      placement="top"
      arrow
    >
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: '14px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#94a3b8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        {/* Left Side: Icon + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: scheme.bg,
              color: scheme.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? '#E2E8F0' : '#334155',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Right Side: Big Value + Optional Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 22, md: 24 },
              fontWeight: 800,
              lineHeight: 1,
              color: isDark ? '#FFF' : scheme.color,
            }}
          >
            {value}
          </Typography>
          {onClick && (
            <ArrowForwardIcon
              sx={{
                fontSize: 14,
                color: scheme.color,
                opacity: 0.5,
              }}
            />
          )}
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default OverviewCard;
