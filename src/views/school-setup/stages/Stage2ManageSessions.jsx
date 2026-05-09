import React from 'react';
import { Box, Typography } from '@mui/material';
import SetCalendarTab from '../tabs/SetCalendarTab';
import SetupShell from './SetupShell';

const Stage2ManageSessions = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      stage={2}
      totalStages={3}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      noPadding
    >
      <Box sx={{ px: { xs: 3, md: '60px' }, pt: 4, pb: 1 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Manage Sessions
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
          Select the session and subscribe
        </Typography>
      </Box>

      <SetCalendarTab onSaveAndContinue={onNext} />
    </SetupShell>
  );
};

export default Stage2ManageSessions;
