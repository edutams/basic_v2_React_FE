import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { WavingHand, Download } from '@mui/icons-material';
import { ORANGE } from '../constants';

/**
 * Dashboard header — welcome greeting + Download Report button.
 */
const DashboardHeader = ({ onDownload }) => (
  <Box
    sx={{
      mb: 3,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box>
      <Typography variant="h4" fontWeight={800}>
        Welcome back, Admin!{' '}
        <WavingHand sx={{ fontSize: 22, verticalAlign: 'middle', color: ORANGE }} />
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
        Here's an overview of your school today.
      </Typography>
    </Box>

    <Button
      variant="contained"
      startIcon={<Download />}
      onClick={onDownload}
      sx={{ borderRadius: 2, fontWeight: 700 }}
    >
      Download Report
    </Button>
  </Box>
);

export default DashboardHeader;
