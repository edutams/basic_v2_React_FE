import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Card wrapper with icon + uppercase title.
 */
const SectionCard = ({ icon: Icon, title, color, children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Paper
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
      </Box>
      {children}
    </Paper>
  );
};

export default SectionCard;
