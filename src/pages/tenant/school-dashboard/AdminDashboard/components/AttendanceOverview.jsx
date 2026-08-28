import React from 'react';
import { Box, Typography, Paper, useTheme, CircularProgress } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const AttendanceOverview = ({
  data = [],
  avgAttendance = '—',
  trend = '0%',
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        {/* Header with Title + Legend & Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 800,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            ATTENDANCE OVERVIEW
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            {/* Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16a34a' }} />
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '10.5px', color: '#16a34a' }}>Present Marks</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#dc2626' }} />
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '10.5px', color: '#dc2626' }}>Absent Marks</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Grouped Bar Chart */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
              No attendance data available
            </Typography>
          </Box>
        ) : (
        <Box sx={{ width: '100%', height: 180, mb: 1.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#cbd5e1' : '#334155' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, name) => [`${value}%`, name]}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.label || label;
                }}
              />
              <Bar dataKey="Present" name="Present Marks" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Absent" name="Absent Marks" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={16} />
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
            Average Attendance
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a', lineHeight: 1.1 }}>
            {avgAttendance}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend.startsWith('-') ? '#dc2626' : '#16a34a' }}>
          {trend.startsWith('-') ? <ArrowDownward sx={{ fontSize: 14 }} /> : <ArrowUpward sx={{ fontSize: 14 }} />}
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '13px', color: trend.startsWith('-') ? '#dc2626' : '#16a34a' }}>
            {trend} vs last week
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceOverview;
