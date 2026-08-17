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
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 1.75,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': onClick
          ? {
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
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
