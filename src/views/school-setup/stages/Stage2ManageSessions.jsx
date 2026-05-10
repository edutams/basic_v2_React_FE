import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import SetCalendarTab from '../tabs/SetCalendarTab';
import SetupShell from './SetupShell';
import GuidedTour from '../components/GuidedTour';
import Stage2Image from '../../../assets/images/setup/setup2.png';

const TOUR_STEPS = [
  {
    targetId: 'tour-session-select',
    title: 'Select a Session',
    description: 'Choose the current academic session from this dropdown to load its terms.',
    placement: 'bottom',
  },
  {
    targetId: 'tour-terms-table',
    title: 'Subscribe to Terms',
    description: 'Click the ⋮ action menu on any term row to subscribe or change its status.',
    placement: 'top',
  },
  {
    targetId: 'generate-week-section',
    title: 'Generate Weeks',
    description: 'Once a term is active, set a start date and click Generate to create school weeks.',
    placement: 'left',
  },
];

const Stage2ManageSessions = ({ onNext, onBack, onSkip }) => {
  const [tourActive, setTourActive] = useState(true);

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

      <GuidedTour
        steps={TOUR_STEPS}
        active={tourActive}
        onFinish={() => setTourActive(false)}
      />
    </SetupShell>
  );
};

export default Stage2ManageSessions;
