import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

export const STEPS = ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];

const AdmissionStepper = ({ currentStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {STEPS.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={step}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 48 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%',
                bgcolor: done || active ? 'primary.main' : 'grey.100',
                border: '2px solid',
                borderColor: done || active ? 'primary.main' : 'grey.300',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {done
                ? <CheckCircleIcon sx={{ color: '#fff', fontSize: 18 }} />
                : active
                  ? <SchoolIcon sx={{ color: '#fff', fontSize: 16 }} />
                  : <PendingIcon sx={{ color: 'grey.400', fontSize: 16 }} />}
            </Box>
            <Typography
              variant="caption"
              fontWeight={active ? 700 : done ? 600 : 400}
              color={active ? 'primary.main' : done ? 'primary.dark' : 'text.secondary'}
              mt={0.5} textAlign="center" sx={{ fontSize: 10 }}
            >
              {step}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: done ? 'primary.main' : 'grey.200', mb: 2.5, minWidth: 12 }} />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

export default AdmissionStepper;
