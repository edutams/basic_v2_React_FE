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

const INITIAL_CLASS_ENROLLMENT = [
  { id: 'pry1', label: 'PRY 1', count: 102, color: '#1976d2', arms: [{ arm: 'Diamond', count: 34 }, { arm: 'Gold', count: 34 }, { arm: 'Silver', count: 34 }] },
  { id: 'pry2', label: 'PRY 2', count: 98, color: '#2e7d32', arms: [{ arm: 'Diamond', count: 33 }, { arm: 'Gold', count: 33 }, { arm: 'Silver', count: 32 }] },
  { id: 'pry3', label: 'PRY 3', count: 115, color: '#ed6c02', arms: [{ arm: 'Diamond', count: 38 }, { arm: 'Gold', count: 38 }, { arm: 'Silver', count: 39 }] },
  { id: 'pry4', label: 'PRY 4', count: 124, color: '#9c27b0', arms: [{ arm: 'Diamond', count: 42 }, { arm: 'Gold', count: 41 }, { arm: 'Silver', count: 41 }] },
  { id: 'pry5', label: 'PRY 5', count: 88, color: '#0288d1', arms: [{ arm: 'Diamond', count: 30 }, { arm: 'Gold', count: 29 }, { arm: 'Silver', count: 29 }] },
  { id: 'pry6', label: 'PRY 6', count: 94, color: '#d32f2f', arms: [{ arm: 'Diamond', count: 32 }, { arm: 'Gold', count: 31 }, { arm: 'Silver', count: 31 }] },
];

const ClassEnrollmentCard = ({ onClassClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
        bgcolor: isDark ? 'background.paper' : '#fff',
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
        height: '100%',
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
        {INITIAL_CLASS_ENROLLMENT.map((cls) => (
          <Grid size={{ xs: 6, sm: 4 }} key={cls.label}>
            <Box
              onClick={() => onClassClick(cls)}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.grey[200]}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: cls.color || 'primary.main',
                },
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                  {cls.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>
                  {cls.count}
                </Typography>
                <Box sx={{ height: 3, width: '45%', bgcolor: cls.color || 'primary.main', borderRadius: 2 }} />
              </Box>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: `${cls.color || '#1976d2'}15`,
                  color: cls.color || 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  ml: 1,
                }}
              >
                <GroupsIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ClassEnrollmentCard;
