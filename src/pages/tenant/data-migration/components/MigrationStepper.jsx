import React from 'react';
import { Box, Grid, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';

/**
 * Four-stage progress stepper for the migration page. Every step is
 * freely clickable, not gated to "only after the one before it finishes"
 * — confirmed live, 2026-11-13: Run History already had its own bypass
 * of that restriction (checking it is exactly what you want to do while
 * something looks stuck, which is precisely when you haven't "finished"
 * the steps before it), and each tab already fetches its own data
 * independently by tenantId, so jumping straight to any of them is
 * always safe once a school is actually chosen. `isStepDisabled(index)`
 * is the one real exception that's left (no school picked yet) — shown
 * with a dimmed, non-interactive state and a tooltip explaining why,
 * rather than silently doing nothing on click.
 */
const MigrationStepper = ({ steps, activeStep, onStepClick, isStepDisabled }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const disabled = Boolean(isStepDisabled?.(index));

        const step = (
          <Paper
            elevation={0}
            onClick={disabled ? undefined : () => onStepClick(index)}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
              border: '1.5px solid',
              borderColor: isActive
                ? theme.palette.primary.main
                : isDark
                  ? 'rgba(255,255,255,0.12)'
                  : '#e2e8f0',
              transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
              '&:hover': disabled
                ? undefined
                : {
                    borderColor: theme.palette.primary.main,
                    boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.08)' : '0 2px 8px rgba(15,23,42,0.08)',
                    transform: 'translateY(-1px)',
                  },
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
                  bgcolor: isComplete
                    ? '#16A34A'
                    : isActive
                      ? theme.palette.primary.main
                      : 'transparent',
                  color:
                    isComplete || isActive ? '#fff' : isDark ? 'rgba(255,255,255,0.6)' : '#94a3b8',
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
                  color: isActive ? theme.palette.primary.main : isDark ? '#fff' : '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </Typography>
          </Paper>
        );

        return (
          <Grid key={label} size={{ xs: 6, sm: 2.3 }}>
            {disabled ? (
              <Tooltip title="Pick a school first" arrow>
                <span>{step}</span>
              </Tooltip>
            ) : (
              step
            )}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default MigrationStepper;
