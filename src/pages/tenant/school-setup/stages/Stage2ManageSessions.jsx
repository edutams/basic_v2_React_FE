import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SetCalendarTab from '../components/SetCalendarTab';
import SetupShell from './SetupShell';
import Stage2Image from '@/assets/images/setup/setup2.png';

const Stage2ManageSessions = ({ onNext, onBack, onSkip }) => {
  const [canContinue, setCanContinue] = useState(false);

  return (
    <SetupShell
      stage={2}
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      canContinue={canContinue}
      noPadding
      leftImage={Stage2Image}
      leftTitle="Manage your school sessions."
      leftSubtitle="Select the academic session and subscribe to get your school calendar running."
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', sm: '100%' } }}>
        <Box sx={{ px: 2, pt: { xs: '80px', sm: '85px', md: '90px' }, pb: 1, flexShrink: 0 }}>
          <Typography
            sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 800, color: 'text.primary', mb: 0.5 }}
          >
            Manage Sessions
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
            Select the session and subscribe
          </Typography>
        </Box>

        <Box sx={{ px: 2, flex: 1, minHeight: 0, overflow: { xs: 'visible', sm: 'hidden' } }}>
          <SetCalendarTab onSaveAndContinue={onNext} onReadyChange={setCanContinue} />
        </Box>
      </Box>
    </SetupShell>
  );
};

export default Stage2ManageSessions;
