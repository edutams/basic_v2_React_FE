import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  Tooltip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Groups as GroupsIcon,
} from '@mui/icons-material';

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const ClassEnrollmentCard = ({ enrollmentData = [], onClassClick, loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
        height: '100%',
        maxHeight: 250,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          Class Enrollment Breakdown
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          mr: -0.5,
          scrollbarWidth: 'thin',
          scrollbarColor: isDark
            ? 'rgba(255,255,255,0.15) transparent'
            : 'rgba(0,0,0,0.12) transparent',
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            borderRadius: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
            borderRadius: 8,
            '&:hover': {
              background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : enrollmentData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No enrollment data available. Please ensure class structure is set up.
          </Typography>
        ) : (
          <Grid container spacing={1.5}>
            {enrollmentData.map((cls, index) => {
              const scheme = schemeMap[index % schemeMap.length];
              const isSenior = cls.class_code?.toUpperCase().startsWith('SS');
              return (
                <Grid size={{ xs: 6, sm: 2 }} key={cls.class_id || index}>
                  <Tooltip title="Click to view learner breakdown by arm" arrow placement="top">
                    <Box
                      onClick={() => onClassClick(cls)}
                      sx={{
                        p: '14px',
                        borderRadius: '14px',
                        bgcolor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: '#94a3b8',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            color: scheme.color,
                            letterSpacing: 0.5,
                            display: 'block',
                          }}
                        >
                          {cls.class_code}

                          {isSenior && cls.programme_code && (
                            <Typography
                              component="span"
                              sx={{
                                ml: 0.5,
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                color: scheme.color,
                              }}
                            >
                              ({cls.programme_code})
                            </Typography>
                          )}
                        </Typography>

                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="text.primary"
                          sx={{ mt: 0.5 }}
                        >
                          {cls.total}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          background: scheme.bg,
                          color: scheme.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          ml: 1,
                          mt: 3,
                        }}
                      >
                        <GroupsIcon sx={{ fontSize: 20 }} />
                      </Box>
                    </Box>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default ClassEnrollmentCard;
