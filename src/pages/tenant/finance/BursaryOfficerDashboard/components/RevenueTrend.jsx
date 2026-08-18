import React, { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SectionCard from './SectionCard';
import { formatCompact, formatCurrency } from '../constants';

/**
 * Revenue Trend — Bar chart showing monthly collected income with stats below.
 */
const RevenueTrend = ({ revenue_trend = [], onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [period, setPeriod] = useState('Monthly');

  // Calculate statistics
  const amounts = revenue_trend.map((item) => item.amount || 0);
  const avgCollection = amounts.length > 0 
    ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length 
    : 0;
  
  const bestMonth = revenue_trend.length > 0
    ? revenue_trend.reduce((max, item) => (item.amount > max.amount ? item : max), revenue_trend[0])
    : null;
  
  const worstMonth = revenue_trend.length > 0
    ? revenue_trend.reduce((min, item) => (item.amount < min.amount ? item : min), revenue_trend[0])
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
    <SectionCard
      icon={TrendingUp}
      title="Revenue Trend (Collected Income)"
      color={theme.palette.primary.main}
      onClick={onClick}
    >
      {/* Period selector */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              fontSize: 13,
              fontWeight: 600,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider,
              },
            }}
          >
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
            <MenuItem value="Daily">Daily</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Bar chart */}
      <Box sx={{ width: '100%', height: 280, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={revenue_trend}
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
              tick={{ 
                fill: theme.palette.text.secondary, 
                fontSize: 11,
                fontWeight: 600 
              }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: theme.palette.text.secondary, 
                fontSize: 11,
                fontWeight: 600 
              }}
              tickFormatter={(value) => formatCompact(value).replace('₦', '')}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }} />
            <Bar
              dataKey="amount"
              fill={theme.palette.primary.main}
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Statistics row */}
      <Stack 
        direction="row" 
        spacing={2} 
        divider={<Box sx={{ width: 1, bgcolor: theme.palette.divider }} />}
        sx={{ 
          pt: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Average Monthly Collection
          </Typography>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {formatCurrency(avgCollection)}
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Best Collection Month
          </Typography>
          <Typography variant="h6" fontWeight={800} color="success.main">
            {bestMonth ? bestMonth.month : '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({bestMonth ? formatCurrency(bestMonth.amount) : '-'})
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Lowest Collection Month
          </Typography>
          <Typography variant="h6" fontWeight={800} color="error.main">
            {worstMonth ? worstMonth.month : '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({worstMonth ? formatCurrency(worstMonth.amount) : '-'})
          </Typography>
        </Box>
      </Stack>
    </SectionCard>
  );
};

export default RevenueTrend;
