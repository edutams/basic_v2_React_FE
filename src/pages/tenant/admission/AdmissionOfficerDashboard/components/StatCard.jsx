import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const StatCard = ({ icon: Icon, colorIndex = 0, title, value, right, footer, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Tooltip title={onClick ? 'Click to view breakdown' : ''} placement="top" arrow>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          p: '14px',
          borderRadius: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: onClick ? 'pointer' : 'default',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#94a3b8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
            color: isDark ? '#ffffff' : scheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 19, color: 'inherit' }} />
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto', pt: 1.5 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: isDark ? '#fff' : scheme.color,
            fontSize: { xs: 22, md: 26 },
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
            mt: 1.25,
            pt: 1.25,
            borderTop: '1px dashed',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
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
