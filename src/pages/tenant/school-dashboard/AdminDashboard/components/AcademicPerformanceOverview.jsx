import React from 'react';
import { Box, Typography, Paper, useTheme, Skeleton } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * Academic Performance Overview Bar Chart Component. `data` is empty and
 * `trend` is null until at least one class's broadsheet has actually been
 * SPA-approved this term — shown as an explicit empty state rather than a
 * fabricated placeholder chart.
 */
const AcademicPerformanceOverview = ({
  data = [],
  avgScore = '0%',
  trend = null,
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = data || [];
  const hasData = chartData.length > 0;

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
          <Box sx={{ width: '100%', height: 180, mb: 1.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 1, pb: 2.5 }}>
            {[70, 100, 55, 40].map((h, i) => (
              <Skeleton key={i} variant="rounded" width={36} height={h} sx={{ borderRadius: '6px 6px 0 0' }} />
            ))}
          </Box>
        ) : hasData ? (
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
        ) : (
        <Box
          sx={{
            width: '100%',
            height: 180,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            No reviewed results yet this term
          </Typography>
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
        {loading ? (
          <>
            <Box sx={{ borderRight: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pr: 3 }}>
              <Skeleton variant="text" width={80} height={14} />
              <Skeleton variant="text" width={50} height={22} />
            </Box>
            <Skeleton variant="text" width={110} height={18} />
          </>
        ) : (
        <>
        <Box sx={{ borderRight: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pr: 3 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
            Average Score
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a', lineHeight: 1.1 }}>
            {avgScore}
          </Typography>
        </Box>

        {trend == null ? (
          <Typography variant="caption" sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            No prior term to compare
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
            {trend >= 0 ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
            <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '13px', color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
              {Math.abs(trend)}% vs last term
            </Typography>
          </Box>
        )}
        </>
        )}
      </Box>
    </Paper>
  );
};

export default AcademicPerformanceOverview;
