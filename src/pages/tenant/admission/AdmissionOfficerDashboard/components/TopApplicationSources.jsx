import React from 'react';
import { Box, Typography, Paper, Stack, Button, useTheme, Skeleton } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const defaultSourcesData = [
  { name: 'School Website', value: 1286, pct: 33.5, color: '#1d4ed8' },
  { name: 'Walk-in / In-person', value: 932, pct: 24.3, color: '#0d9488' },
  { name: 'Referral', value: 742, pct: 19.3, color: '#d97706' },
  { name: 'Social Media', value: 451, pct: 11.7, color: '#0284c7' },
  { name: 'Partner Schools', value: 236, pct: 6.1, color: '#7c3aed' },
  { name: 'Others', value: 195, pct: 5.1, color: '#dc2626' },
];

/**
 * Top Application Sources Donut Chart Component
 */
const TopApplicationSources = ({ sources = defaultSourcesData, totalApplicants = 3842, onViewSourceReport, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1,
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
        <Skeleton variant="text" width="55%" height={14} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={130} height={130} />
          <Stack spacing={1} sx={{ flex: 1 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="text" width="55%" height={12} />
                <Skeleton variant="text" width="20%" height={12} />
              </Box>
            ))}
          </Stack>
        </Box>
        <Skeleton variant="text" width="35%" height={12} sx={{ mt: 2, mx: 'auto' }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
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
          TOP APPLICATION SOURCES
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2 }}>
          {/* Donut Chart with Center Text */}
          <Box sx={{ position: 'relative', width: { xs: 130, sm: 170 }, height: { xs: 130, sm: 170 }, flexShrink: 0, mx: 'auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={'40%'}
                  outerRadius={'58%'}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val, name) => [`${val.toLocaleString()} (${sources.find(s => s.name === name)?.pct}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Text */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a', lineHeight: 1.2 }}>
                {totalApplicants.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 150 }}>
            {sources.map((src) => (
              <Box key={src.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: src.color, flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isDark ? '#cbd5e1' : '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {src.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', flexShrink: 0 }}>
                  {src.value.toLocaleString()} <Typography component="span" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>({src.pct}%)</Typography>
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Footer Link */}
      <Box sx={{ pt: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', mt: 1.5 }}>
        <Button
          disableRipple
          onClick={() => (onViewSourceReport ? onViewSourceReport() : navigate('/application-tracker'))}
             endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
            sx={{ fontSize: '12px' }}
        >
          View Source Report
        </Button>
      </Box>
    </Paper>
  );
};

export default TopApplicationSources;
