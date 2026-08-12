import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Schedule } from '@mui/icons-material';

/**
 * Footer bar — last-updated timestamp + realtime note.
 */
const DashboardFooter = ({ lastUpdated }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 3,
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Schedule sx={{ fontSize: 13, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdated}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          All data is real-time and based on current session.
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardFooter;
