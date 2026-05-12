import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SetupShell from './SetupShell';
import SetUpClassesTab from '../tabs/SetUpClassesTab';

const Stage4ClassArms = ({ onNext, onBack, onSkip }) => {
  const tabRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    if (tabRef.current?.save) {
      setSaving(true);
      try {
        await tabRef.current.save();
      } finally {
        setSaving(false);
      }
    } else {
      onNext();
    }
  };

  return (
    <SetupShell
      stage={3}
      totalStages={5}
      onBack={onBack}
      onSkip={onSkip}
      onSaveAndContinue={handleSaveAndContinue}
      saving={saving}
      noPadding
      leftTitle="Create your class arms."
      leftSubtitle="Set up class arms and deactivate any class you currently do not have in your school."
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          px: { xs: 2, sm: 3, md: '30px' },
          pt: { xs: '80px', sm: '85px', md: '90px' },
          pb: 1,
        }}
      >
        <Typography sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 800, color: 'text.primary', mb: 0.5, flexShrink: 0 }}>
          Create Class Arms
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2, maxWidth: 480, lineHeight: 1.6, flexShrink: 0 }}>
          Setup your class arm and deactivate any class you currently do not have in your school
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
          <SetUpClassesTab ref={tabRef} onSaveAndContinue={onNext} />
        </Box>
      </Box>
    </SetupShell>
  );
};

export default Stage4ClassArms;
