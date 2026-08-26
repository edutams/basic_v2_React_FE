import { Box, Typography, Paper, LinearProgress, Button, useTheme, CircularProgress } from '@mui/material';
import { CalendarMonth, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TermCalendarCard = ({
  dayCurrent = 48,
  dayTotal = 90,
  termStart = '8 Sept 2025',
  expectedEnd = '12 Dec 2025',
  progressPct = 53,
  loading = false,
  onViewCalendar,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: '14px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonth sx={{ fontSize: 18, color: '#2563eb' }} />
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            TERM CALENDAR
          </Typography>
        </Box>

        {/* Info Row: Day Badge | Dates */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 1.5,
            mb: 2.5,
          }}
        >
          {/* Day Badge — standalone */}
          <Box
            sx={{
              flex: '0 0 auto',
              px: 2,
              py: 1.5,
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              textAlign: 'center',
              minWidth: 72,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '10px',
                fontWeight: 600,
                color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                lineHeight: 1,
              }}
            >
              Day
            </Typography>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f172a',
                lineHeight: 1.2,
              }}
            >
              {dayCurrent}
            </Typography>
            <Typography
              sx={{
                fontSize: '10px',
                fontWeight: 600,
                color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                lineHeight: 1,
              }}
            >
              of {dayTotal}
            </Typography>
          </Box>

          {/* Dates — together in one box */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Term Started */}
            <Box
              sx={{
                flex: 1,
                px: 2,
                py: 1.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Term Started
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isDark ? '#fff' : '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                {termStart}
              </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{ width: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />

            {/* Expected End */}
            <Box
              sx={{
                flex: 1,
                px: 2,
                py: 1.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Expected End
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isDark ? '#fff' : '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                {expectedEnd}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
              }}
            >
              Term Progress
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
              {progressPct}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#16a34a',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Footer Link */}
        <Box
          sx={{
            pt: 1.5,
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            mt: 2,
          }}
        >
          <Button
            disableRipple
            onClick={() => (onViewCalendar ? onViewCalendar() : navigate('/curriculum/session-mapping'))}
            endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
            sx={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#2563eb',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
              },
              '&:hover::before': {
                display: 'none',
              },
            }}
          >
            View School Calendar
          </Button>
        </Box>
      </Box>
      )}
    </Paper>
  );
};

export default TermCalendarCard;
