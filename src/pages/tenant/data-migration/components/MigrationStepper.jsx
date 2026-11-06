import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';

/**
 * Four-stage progress stepper for the migration page. Steps are clickable
 * for now so every stage can be previewed with dummy data — once the real
 * flow is wired up, a step only becomes clickable after the one before it
 * is actually complete.
 */
const MigrationStepper = ({ steps, activeStep, onStepClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;

        return (
          <Grid key={label} size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              onClick={() => onStepClick(index)}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1.5px solid',
                borderColor: isActive
                  ? theme.palette.primary.main
                  : isDark
                    ? 'rgba(255,255,255,0.12)'
                    : '#e2e8f0',
                transition: 'border-color 150ms ease',
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  bgcolor: isComplete ? '#16A34A' : isActive ? theme.palette.primary.main : 'transparent',
                  color: isComplete || isActive ? '#fff' : isDark ? 'rgba(255,255,255,0.6)' : '#94a3b8',
                  border: isComplete || isActive ? 'none' : '1.5px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                }}
              >
                {isComplete ? <IconCheck size={15} stroke={3} /> : index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive
                    ? theme.palette.primary.main
                    : isDark
                      ? '#fff'
                      : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default MigrationStepper;
