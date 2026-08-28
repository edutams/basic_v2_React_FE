import React from 'react';
import { Box, Typography, Paper, useTheme, CircularProgress } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';

const defaultAcademicData = [
  { category: 'Excellent', val: 28, color: '#16a34a' },
  { category: 'Good', val: 32, color: '#2563eb' },
  { category: 'Average', val: 24, color: '#d97706' },
  { category: 'At Risk', val: 16, color: '#dc2626' },
];

/**
 * Academic Performance Overview Bar Chart Component
 */
const AcademicPerformanceOverview = ({
  data = defaultAcademicData,
  avgScore = '68.4%',
  trend = '4.2%',
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = (data && data.length > 0) ? data : defaultAcademicData;

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
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            ACADEMIC PERFORMANCE OVERVIEW
          </Typography>
        </Box>

        {/* Chart */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
        <Box sx={{ width: '100%', height: 180, mb: 1.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fontWeight: 700, fill: isDark ? '#cbd5e1' : '#334155' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val) => [`${val}%`, 'Students']}
              />
              <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        )}
      </Box>

      {/* Bottom Summary */}
      <Box
        sx={{
          p: 1.25,
          borderRadius: '10px',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ borderRight: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pr: 3 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
            Average Score
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a', lineHeight: 1.1 }}>
            {avgScore}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: '#16a34a' }}>
          <ArrowUpward sx={{ fontSize: 14 }} />
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '13px', color: '#16a34a' }}>
            {trend} vs last term
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AcademicPerformanceOverview;
