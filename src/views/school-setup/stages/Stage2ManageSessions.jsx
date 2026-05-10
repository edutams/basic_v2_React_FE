import React from 'react';
import { Box, Typography } from '@mui/material';
import SetCalendarTab from '../tabs/SetCalendarTab';
import SetupShell from './SetupShell';
import Stage2Image from '../../../assets/images/setup/setup2.png';

const Stage2ManageSessions = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      stage={2}
      totalStages={3}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      noPadding
      leftImage={Stage2Image}
      leftTitle="Manage your school sessions."
      leftSubtitle="Select the academic session and subscribe to get your school calendar running."
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
