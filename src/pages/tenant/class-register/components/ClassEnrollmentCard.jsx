import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Tooltip,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  InfoOutlined as InfoIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

const colorNames = ['primary', 'success', 'info', 'warning', 'error', 'secondary'];

const ClassEnrollmentCard = ({ enrollmentData = [], onClassClick, loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('primary', 0, isDark, theme);
  const isScrollable = enrollmentData.length > 6;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${colors.borderColor}`,
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        maxHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
      }}
    >
      {/* ── Header Row ──────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Class Enrollment Breakdown
        </Typography>
      </Stack>

      {/* ── Scrollable Content Area ─────────────────────────── */}
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
              const itemColors = getStatCardColor(
                colorNames[index % colorNames.length],
                index,
                isDark,
                theme,
              );
              const isSenior = cls.class_code?.toUpperCase().startsWith('SS');
              return (
                <Grid size={{ xs: 6, sm: 2 }} key={cls.class_id || index}>
                  <Tooltip title="Click to view learner breakdown by arm" arrow placement="top">
                    <Box
                      onClick={() => onClassClick(cls)}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.08)'
                          : `1px solid ${itemColors.accentColor}`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : itemColors.cardBg,
                        boxShadow: isDark
                          ? '0 8px 20px rgba(0,0,0,0.35)'
                          : '0 6px 16px rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            color: isDark ? 'rgba(255,255,255,0.72)' : itemColors.accentColor,
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
                                color: itemColors.accentColor,
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
                          background: itemColors.iconBg,
                          color: itemColors.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          ml: 1,
                          mt: 3, // adjust until it lines up with the count
                          boxShadow: isDark
                            ? '0 4px 12px rgba(0,0,0,.3)'
                            : `0 6px 18px -2px ${itemColors.iconGlow}`,
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
