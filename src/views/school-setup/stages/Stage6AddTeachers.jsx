import React from 'react';
import { Box, Typography } from '@mui/material';
import SetupShell from './SetupShell';
import UploadTeachersTab from '../tabs/UploadTeachersTab';

const Stage6AddTeachers = ({ onNext, onBack, onSkip }) => {
  return (
    <SetupShell
      stage={6}
      totalStages={6}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={onNext}
      noPadding
      leftTitle="Add your teachers."
      leftSubtitle="Onboard your teaching and non-teaching staff to your school portal."
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
          Add Teachers
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, lineHeight: 1.6, flexShrink: 0 }}>
          Onboard your teachers to your school
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
          <UploadTeachersTab onSaveAndContinue={onNext} />
        </Box>
      </Box>
    </SetupShell>
  );
};

export default Stage6AddTeachers;
