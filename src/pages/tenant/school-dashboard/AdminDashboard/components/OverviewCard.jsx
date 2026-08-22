import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * Compact overview card — horizontal layout (Icon + Title on left, Value on right)
 * eliminates all empty/dead space in the card.
 */
const OverviewCard = ({ icon: Icon, colorName, title, value, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

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
          py: 1.5,
          px: 1.75,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: onClick ? 'pointer' : 'default',
          background: isDark ? theme.palette.background.paper : colors.cardBg,
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : (colors.borderColor || 'grey.200'),
          boxShadow: isDark
            ? '0 4px 14px rgba(0,0,0,0.25)'
            : '0 2px 10px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: onClick ? 'translateY(-2px)' : 'none',
            boxShadow: isDark
              ? '0 6px 20px rgba(0,0,0,0.35)'
              : '0 4px 16px rgba(15, 23, 42, 0.08)',
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
              background: `${colors.iconBg} !important`,
              boxShadow: isDark
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : `0 2px 10px ${colors.iconGlow}`,
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
              color: isDark ? '#FFF' : colors.accentColor,
            }}
          >
            {value}
          </Typography>
          {onClick && (
            <ArrowForwardIcon
              sx={{
                fontSize: 14,
                color: colors.accentColor,
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
