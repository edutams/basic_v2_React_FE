import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Card wrapper with icon + uppercase title.
 */
const SectionCard = ({ icon: Icon, title, color, children, sx = {}, onClick }) => {
  const theme = useTheme();

  const card = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'grey.200',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': onClick
          ? {
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)',
              transform: 'translateY(-2px)',
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color || 'primary.main', 0.12),
            color: color || 'primary.main',
            border: '1px solid',
            borderColor: alpha(color || 'primary.main', 0.26),
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
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

  if (!onClick) {
    return card;
  }

  return (
    <Tooltip title="Click to view breakdown" placement="top" arrow>
      {card}
    </Tooltip>
  );
};

export default SectionCard;
