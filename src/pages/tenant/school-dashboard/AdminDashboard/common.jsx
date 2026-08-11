import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ChevronRight, ArrowForward } from '@mui/icons-material';

// Panel — rounded section container with subtle border & shadow
export const Panel = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

// Section header — tinted icon tile + uppercase title + optional action link
export const SectionHeader = ({ icon: Icon, title, color, action, onAction }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(color || 'primary.main', 0.12),
        color: color || 'primary.main',
      }}
    >
      <Icon sx={{ fontSize: 17 }} />
    </Box>
    <Typography
      variant="subtitle1"
      fontWeight={800}
      sx={{ fontSize: 12.5, letterSpacing: 0.4, textTransform: 'uppercase' }}
    >
      {title}
    </Typography>
    {action && (
      <Box
        onClick={onAction}
        sx={{
          ml: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 0.4,
          color: 'primary.main',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {action}
        <ChevronRight sx={{ fontSize: 13 }} />
      </Box>
    )}
  </Box>
);

// Legend row item
export const LegendItem = ({ color, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color, flexShrink: 0 }} />
    <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
      {label}
    </Typography>
    {value !== undefined && (
      <Typography sx={{ fontSize: 10.5, fontWeight: 800, ml: 'auto' }}>{value}</Typography>
    )}
  </Box>
);

// Section footer link — centered, blue, with arrow
export const FooterLink = ({ text, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      mt: 2,
      pt: 1.5,
      borderTop: (t) => `1px dashed ${t.palette.divider}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
      color: 'primary.main',
      fontWeight: 700,
      fontSize: 12,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': { gap: 0.9, textDecoration: 'underline' },
    }}
  >
    {text} <ArrowForward sx={{ fontSize: 14 }} />
  </Box>
);
