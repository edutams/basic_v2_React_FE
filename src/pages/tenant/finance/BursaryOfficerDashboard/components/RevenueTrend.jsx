import React, { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompact, formatCurrency } from '../constants';

// Mocked data shown when the API returns empty — will be replaced with real data later.
const MOCK_REVENUE_TREND = [
  { month: 'Jan 2024', amount: 6600000 },
  { month: 'Feb 2024', amount: 9400000 },
  { month: 'Mar 2024', amount: 10200000 },
  { month: 'Apr 2024', amount: 9300000 },
  { month: 'May 2024', amount: 11600000 },
  { month: 'Jun 2024', amount: 12400000 },
  { month: 'Jul 2024', amount: 9700000 },
  { month: 'Aug 2024', amount: 10500000 },
  { month: 'Sep 2024', amount: 11200000 },
  { month: 'Oct 2024', amount: 13500000 },
  { month: 'Nov 2024', amount: 13300000 },
  { month: 'Dec 2024', amount: 14800000 },
];

/**
 * Revenue Trend — Bar chart showing monthly collected income with stats below.
 * Standalone card (no SectionCard wrapper) matching the design image.
 */
const RevenueTrend = ({ revenue_trend = [], onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [period, setPeriod] = useState('Monthly');

  // Calculate statistics
  const trendData = revenue_trend.length > 0 ? revenue_trend : MOCK_REVENUE_TREND;
  const amounts = trendData.map((item) => item.amount || 0);
  const avgCollection = amounts.length > 0
    ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length
    : 0;

  const bestMonth = trendData.length > 0
    ? trendData.reduce((max, item) => (item.amount > max.amount ? item : max), trendData[0])
    : null;

  const worstMonth = trendData.length > 0
    ? trendData.reduce((min, item) => (item.amount < min.amount ? item : min), trendData[0])
    : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: isDark ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            {payload[0].payload.month}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={800}>
            {formatCurrency(payload[0].value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': onClick
          ? { boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)', transform: 'translateY(-2px)' }
          : {},
      }}
      onClick={onClick}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#EBF5FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp sx={{ fontSize: 17 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: '#111827', letterSpacing: 0.3 }}>
              Revenue Trend <Box component="span" sx={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 500 }}>(Collected Income)</Box>
            </Typography>
          </Box>
        </Box>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{
              height: 28,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#374151',
              bgcolor: '#F9FAFB',
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
                  mt: 0.5,
                },
              },
            }}
          >
            <MenuItem value="Monthly" sx={{ fontSize: '0.75rem', '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-selected': { bgcolor: '#EEF2FF' } }}>Monthly</MenuItem>
            <MenuItem value="Weekly" sx={{ fontSize: '0.75rem', '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-selected': { bgcolor: '#EEF2FF' } }}>Weekly</MenuItem>
            <MenuItem value="Daily" sx={{ fontSize: '0.75rem', '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-selected': { bgcolor: '#EEF2FF' } }}>Daily</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ mx: 2.5, borderTop: '1px solid #E5E7EB' }} />

      {/* Bar chart — at the top */}
      <Box sx={{ width: '100%', height: 260, px: 1.5, pt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 600 }}
              tickFormatter={(value) => formatCompact(value).replace('₦', '')}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }} />
            <Bar
              dataKey="amount"
              fill={theme.palette.primary.main}
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Statistics row — inset rounded container */}
      <Box sx={{ p: 1.5, mt: 'auto' }}>
        <Stack
          direction="row"
          spacing={0}
          sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F0F4F8',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center', py: 1.25, px: 0.5, borderRight: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.15 }}>
              Average Monthly Collection
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.75rem', color: '#3B82F6' }}>
              {formatCurrency(avgCollection)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: 'center', py: 1.25, px: 0.5, borderRight: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.15 }}>
              Best Collection Month
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.72rem', color: '#16A34A' }}>
              {bestMonth ? `${bestMonth.month} (${formatCompact(bestMonth.amount)})` : '-'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: 'center', py: 1.25, px: 0.5 }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.15 }}>
              Lowest Collection Month
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.72rem', color: '#EF4444' }}>
              {worstMonth ? `${worstMonth.month} (${formatCompact(worstMonth.amount)})` : '-'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default RevenueTrend;
