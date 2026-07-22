import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  useTheme,
} from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

const INITIAL_CLASS_ENROLLMENT = [
  { id: 'pry1', label: 'PRY 1', count: 102, colorIndex: 0, arms: [{ arm: 'Diamond', count: 34 }, { arm: 'Gold', count: 34 }, { arm: 'Silver', count: 34 }] },
  { id: 'pry2', label: 'PRY 2', count: 98, colorIndex: 1, arms: [{ arm: 'Diamond', count: 33 }, { arm: 'Gold', count: 33 }, { arm: 'Silver', count: 32 }] },
  { id: 'pry3', label: 'PRY 3', count: 115, colorIndex: 2, arms: [{ arm: 'Diamond', count: 38 }, { arm: 'Gold', count: 38 }, { arm: 'Silver', count: 39 }] },
  { id: 'pry4', label: 'PRY 4', count: 124, colorIndex: 3, arms: [{ arm: 'Diamond', count: 42 }, { arm: 'Gold', count: 41 }, { arm: 'Silver', count: 41 }] },
  { id: 'pry5', label: 'PRY 5', count: 88, colorIndex: 4, arms: [{ arm: 'Diamond', count: 30 }, { arm: 'Gold', count: 29 }, { arm: 'Silver', count: 29 }] },
  { id: 'pry6', label: 'PRY 6', count: 94, colorIndex: 5, arms: [{ arm: 'Diamond', count: 32 }, { arm: 'Gold', count: 31 }, { arm: 'Silver', count: 31 }] },
];

const colorNames = ['primary', 'success', 'info', 'warning', 'error', 'secondary'];

const ClassEnrollmentCard = ({ onClassClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('primary', 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Class Enrollment Breakdown
        </Typography>
        <Button size="small" variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          View Detailed Report
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {INITIAL_CLASS_ENROLLMENT.map((cls) => {
          const itemColors = getStatCardColor(colorNames[cls.colorIndex], cls.colorIndex, isDark, theme);
          return (
            <Grid size={{ xs: 6, sm: 4 }} key={cls.label}>
              <Box
                onClick={() => onClassClick(cls)}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : `1px solid ${itemColors.borderColor}`,
                  background: isDark ? 'rgba(255,255,255,0.02)' : itemColors.cardBg,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                   transform: 'translateY(-3px)',
                    boxShadow: isDark
                      ? '0 8px 20px rgba(0,0,0,0.35)'
                      : '0 6px 16px rgba(0,0,0,0.12)',
                    borderColor: itemColors.accentColor,
                  // '&:hover': {
                  //   transform: 'translateY(-3px)',
                  //   boxShadow: isDark
                  //     ? '0 8px 20px rgba(0,0,0,0.35)'
                  //     : '0 6px 16px rgba(0,0,0,0.12)',
                  //   borderColor: itemColors.accentColor,
                  // },
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : itemColors.accentColor, letterSpacing: 0.5 }}
                  >
                    {cls.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>
                    {cls.count}
                  </Typography>
                  <Box
                    sx={{
                      height: 3,
                      width: '45%',
                      bgcolor: itemColors.accentColor,
                      borderRadius: 2,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    background: itemColors.iconBg,
                    color: itemColors.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    ml: 1,
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0,0,0,.3)'
                      : `0 6px 18px -2px ${itemColors.iconGlow}`,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 22 }} />
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default ClassEnrollmentCard;
