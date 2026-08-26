import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, Select, MenuItem, Grid, useTheme } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

/**
 * Default monthly trend data matching the design mockup (Sep 2024 - Aug 2025)
 */
const defaultTrendData = [
  { month: 'Sep 2024', thisSession: 950, lastSession: 720 },
  { month: 'Oct 2024', thisSession: 1120, lastSession: 880 },
  { month: 'Nov 2024', thisSession: 1350, lastSession: 1050 },
  { month: 'Dec 2024', thisSession: 1600, lastSession: 1250 },
  { month: 'Jan 2025', thisSession: 1900, lastSession: 1480 },
  { month: 'Feb 2025', thisSession: 2050, lastSession: 1620 },
  { month: 'Mar 2025', thisSession: 2380, lastSession: 1890 },
  { month: 'Apr 2025', thisSession: 2750, lastSession: 2150 },
  { month: 'May 2025', thisSession: 2820, lastSession: 2380 },
  { month: 'Jun 2025', thisSession: 3200, lastSession: 2600 },
  { month: 'Jul 2025', thisSession: 3450, lastSession: 2850 },
  { month: 'Aug 2025', thisSession: 3842, lastSession: 3120 },
];

/**
 * Application Trend Line Chart Component
 */
const ApplicationTrend = ({ trendData = defaultTrendData, metrics = {} }) => {
  const [filter, setFilter] = useState('this_session');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalApps = (metrics.total_applications ?? 3842).toLocaleString();
  const newThisMonth = (metrics.new_this_month ?? 512).toLocaleString();
  const avgPerMonth = (metrics.avg_per_month ?? 349).toLocaleString();
  const vsLastSession = metrics.vs_last_session ?? '18%';

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
      {/* Header with Title + Legend & Session Filter */}
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
          APPLICATION TREND
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 3, bgcolor: '#2563eb', borderRadius: 1 }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '11px', color: '#2563eb' }}>
                This Session
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 2, bgcolor: '#94a3b8', borderStyle: 'dashed' }} />
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '11px', color: '#94a3b8' }}>
                vs Last Session
              </Typography>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                height: 30,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0' },
              }}
            >
              <MenuItem value="this_session" sx={{ fontSize: '11.5px', fontWeight: 600 }}>This Session</MenuItem>
              <MenuItem value="last_session" sx={{ fontSize: '11.5px', fontWeight: 600 }}>Last Session</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 220, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'} />
            <XAxis
              dataKey="month"
              tickFormatter={(val) => val.split(' ')[0]}
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(val) => [val.toLocaleString(), 'Applications']}
            />
            <Line
              type="monotone"
              dataKey="thisSession"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="lastSession"
              stroke="#cbd5e1"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Bottom Metrics Bar */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: '10px',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        }}
      >
        <Grid container spacing={1} textAling="center">
          <Grid size={{ xs: 3 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Total Applications
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a' }}>
              {totalApps}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }} sx={{ borderLeft: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pl: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              New This Month
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a' }}>
              {newThisMonth}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }} sx={{ borderLeft: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pl: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              Avg. Per Month
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: isDark ? '#fff' : '#0f172a' }}>
              {avgPerMonth}
            </Typography>
          </Grid>

          <Grid size={{ xs: 3 }} sx={{ borderLeft: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', pl: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'block' }}>
              vs Last Session
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: '#16a34a' }}>
              <ArrowUpward sx={{ fontSize: 14 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: '15px', color: '#16a34a' }}>
                {vsLastSession}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ApplicationTrend;
