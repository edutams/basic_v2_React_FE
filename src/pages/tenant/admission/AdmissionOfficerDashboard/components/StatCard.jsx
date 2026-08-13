import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getStatCardColor } from '@/utils/statCardColors';

/**
 * Top metric card — matches the pasted reference: icon tile top-left, label top-right,
 * big value, gender split column on the right, growth / active-completed footer bottom-left.
 * Uses the project-standard getStatCardColor treatment (gradient cardBg + icon tile) like
 * the BursaryOfficerDashboard KpiCard.
 *
 * When `onClick` is provided the card is clickable and shows a tooltip signalling it
 * opens a breakdown modal (same interaction as the AdminDashboard OverviewCard).
 */
const StatCard = ({ icon: Icon, colorName = 'primary', title, value, right, footer, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, 0, isDark, theme);

  return (
    <Tooltip title={onClick ? 'Click to view breakdown' : ''} placement="top" arrow>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: onClick ? 'pointer' : 'default',
          background: isDark ? theme.palette.background.paper : colors.cardBg,
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.borderColor}`,
          boxShadow: isDark
            ? '0 10px 30px rgba(0,0,0,0.35)'
            : '0 4px 20px rgba(0,0,0,0.07)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: onClick ? 'translateY(-3px)' : 'none',
            boxShadow: isDark
              ? '0 8px 30px rgba(0,0,0,0.35)'
              : '0 6px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
      {/* Icon left, label immediately after it */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
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
          <Icon sx={{ fontSize: 19, color: colors.iconColor || '#fff' }} />
        </Box>
        <Typography
          sx={{
            color: isDark ? 'rgba(255,255,255,0.85)' : 'text.primary',
            fontWeight: 700,
            fontSize: 11.5,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value + right gender split */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.25 }}>
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
        {right && <Box sx={{ flexShrink: 0 }}>{right}</Box>}
      </Box>

      {footer && (
        <Box
          sx={{
            mt: 'auto',
            pt: 1.25,
            borderTop: '1px dashed',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : alpha(colors.accentColor, 0.3),
          }}
        >
          {footer}
        </Box>
      )}
      </Paper>
    </Tooltip>
  );
};

export default StatCard;
