import React from 'react';
import { Box, Typography } from '@mui/material';
import SetupShell from './SetupShell';
import UploadLearnersTab from '../tabs/UploadLearnersTab';

const Stage5AddLearners = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      stage={4}
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      noPadding
      leftTitle="Add your learners."
      leftSubtitle="Upload or manually add learners into their respective classes."
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: { xs: 3, md: '60px' },
          pt: 4,
          pb: 1,
        }}
      >
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'text.primary', mb: 0.5, flexShrink: 0 }}>
          Add Learners
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, lineHeight: 1.6, flexShrink: 0 }}>
          Add your learners into their classes
        </Typography>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: '#fff',
            borderRadius: '12px !important',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <UploadLearnersTab onSaveAndContinue={onNext} />
        </Box>
      </Box>
    </SetupShell>
  );
};

export default Stage5AddLearners;
