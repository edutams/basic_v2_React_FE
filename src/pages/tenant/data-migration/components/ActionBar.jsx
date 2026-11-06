import React from 'react';
import { Box, Typography } from '@mui/material';

/** The dark bottom bar every stage ends on — a status line on the left,
 * primary/secondary actions on the right. */
const ActionBar = ({ status, children }) => (
  <Box
    sx={{
      mt: 2,
      p: 2,
      borderRadius: '14px',
      bgcolor: '#0f172a',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      justifyContent: 'space-between',
      gap: 1.5,
    }}
  >
    <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
      {status}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{children}</Box>
  </Box>
);

export default ActionBar;
