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
        maxHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Header Row ──────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Class Enrollment Breakdown
        </Typography>
        {/* <Button size="small" variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          View Detailed Report
        </Button> */}
      </Stack>

      {/* ── Scroll Hint Info ───────────────────────────────── */}
      {isScrollable && (
        <Alert
          icon={<InfoIcon sx={{ fontSize: 16 }} />}
          severity="info"
          sx={{
            py: 0.5,
            px: 1.5,
            mb: 1.5,
            borderRadius: '8px',
            fontSize: '12px',
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h5" fontWeight={900}>
              Scroll down to see all classes
            </Typography>
            <ArrowDownIcon sx={{ fontSize: 14, animation: 'bounce 1.5s infinite', '@keyframes bounce': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(4px)' } } }} />
          </Stack>
        </Alert>
      )}

      {/* ── Scrollable Content Area ─────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          mr: -0.5,
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? 'rgba(255,255,255,0.15) transparent' : 'rgba(0,0,0,0.12) transparent',
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
              const itemColors = getStatCardColor(colorNames[index % colorNames.length], index, isDark, theme);
              return (
                <Grid size={{ xs: 6, sm: 4 }} key={cls.class_id || index}>
                  <Tooltip title="Click to view learner breakdown by arm" arrow placement="top">
                    <Box
                      onClick={() => onClassClick(cls)}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: isDark
                          ? '1px solid rgba(255,255,255,0.08)'
                          : `1px solid ${itemColors.borderColor}`,
                        background: isDark ? 'rgba(255,255,255,0.02)' : itemColors.cardBg,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isDark
                            ? '0 8px 20px rgba(0,0,0,0.35)'
                            : '0 6px 16px rgba(0,0,0,0.12)',
                          borderColor: itemColors.accentColor,
                        },
                      }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          noWrap
                          sx={{ color: isDark ? 'rgba(255,255,255,0.72)' : itemColors.accentColor, letterSpacing: 0.5, display: 'block' }}
                        >
                          {cls.class_name}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ my: 0.25 }}>
                          {cls.total}
                        </Typography>
                        <Box
                          sx={{
                            height: 3,
                            width: '40%',
                            bgcolor: itemColors.accentColor,
                            borderRadius: 2,
                          }}
                        />
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
