import React from 'react';
import { Box, Typography, Paper, Stack, Button, useTheme } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdmissionFunnel = ({ funnel = [], onViewFullReport }) => {
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
      <Box>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 800,
            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 2,
          }}
        >
          ADMISSION FUNNEL
        </Typography>

        {/* Funnel Rows */}
        <Stack spacing={1.25} sx={{ px: { xs: 0, sm: 1 } }}>
          {funnel.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                No funnel data available
              </Typography>
            </Box>
          )}
          {funnel.map((item) => (
            <Box
              key={item.stage}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* Funnel Bar segment */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: `${Math.max(item.pct, 20)}%`,
                    bgcolor: item.color,
                    color: '#ffffff',
                    py: 0.75,
                    px: 1.5,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      filter: 'brightness(1.1)',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight={800} sx={{ fontSize: '12px', lineHeight: 1 }}>
                    {item.count.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Stage Title */}
              <Typography
                sx={{
                  width: 80,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                  flexShrink: 0,
                }}
              >
                {item.stage}
              </Typography>

              {/* Percentage */}
              <Typography
                sx={{
                  width: 50,
                  fontSize: '12px',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#0f172a',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {item.pct}%
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 2, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 2 }}>
        <Button
          onClick={() => (onViewFullReport ? onViewFullReport() : navigate('/admission/tracker'))}
          endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
           sx={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#2563eb',
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              bgcolor: '#EFF6FF',
              color: '#1d4ed8',
              textDecoration: 'underline',
              opacity: 1,
            },
          }}
        >
          View Full Funnel Report
        </Button>
      </Box>
    </Paper>
  );
};

export default AdmissionFunnel;
