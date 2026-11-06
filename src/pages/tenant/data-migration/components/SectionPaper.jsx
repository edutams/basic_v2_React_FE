import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

/** Shared card shell used across every migration tab — keeps spacing and
 * border treatment identical without repeating the same sx block everywhere. */
const SectionPaper = ({ title, subtitle, action, children, sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
        ...sx,
      }}
    >
      {(title || action) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: subtitle ? 0.25 : 1.5, gap: 1 }}>
          <Box>
            {title && (
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>
                {title}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      {subtitle && (
        <Typography sx={{ fontSize: 12.5, color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', mb: 1.5 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Paper>
  );
};

export default SectionPaper;
