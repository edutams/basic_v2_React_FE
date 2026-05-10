import React from 'react';
import { Box, Typography } from '@mui/material';
import SetupShell from './SetupShell';
import UploadLearnersTab from '../tabs/UploadLearnersTab';
import learner from '../../../assets/images/setup/learner.png';
import ParentCard from 'src/components/shared/ParentCard';

const Stage5AddLearners = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      stage={5}
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      leftImage={learner}
      leftTitle="Add your learners."
      leftSubtitle="Upload or manually add learners into their respective classes."
    >
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
        Add Learners
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
        Add your learners into their classes
      </Typography>

<ParentCard>
  <UploadLearnersTab onSaveAndContinue={onNext} />
</ParentCard>
      
    </SetupShell>
  );
};

export default Stage5AddLearners;
