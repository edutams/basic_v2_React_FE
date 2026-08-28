import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Stack,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TrendingUp } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCompact, formatCurrency } from '../constants';

import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

/**
 * Revenue Trend — Bar chart showing collected income over time with stats below.
 * Mirrors the Transaction Overview chart periods (today / this_week / this_month / this_year)
 * with sub-period pickers for precise navigation.
 *
 * Props:
 *   revenue_trend      – array of { month, amount } from the backend
 *   period             – 'today' | 'this_week' | 'this_month' | 'this_year'
 *   periodValue        – sub-period value (date string, { week, year }, { month, year }, or year int)
 *   onPeriodChange     – callback when the period dropdown changes
 *   onPeriodValueChange – callback when the sub-period value changes
 *   onClick            – opens the breakdown modal
 */
const RevenueTrend = ({
  revenue_trend = [],
  period = 'this_month',
  periodValue = null,
  onPeriodChange,
  onPeriodValueChange,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const trendData = revenue_trend;
  const amounts = trendData.map((item) => item.amount || 0);
  const totalCollection = amounts.reduce((sum, val) => sum + val, 0);
  const avgCollection = amounts.length > 0 ? totalCollection / amounts.length : 0;

  const bestBucket = trendData.length > 0
    ? trendData.reduce((max, item) => (item.amount > max.amount ? item : max), trendData[0])
    : null;

  const worstBucket = trendData.length > 0
    ? trendData.reduce((min, item) => (item.amount < min.amount ? item : min), trendData[0])
    : null;

  // Adaptable stats labels based on period
  const statsLabels = {
    today: { avg: 'Avg Hourly Collection', best: 'Peak Hour', worst: 'Lowest Hour' },
    this_week: { avg: 'Avg Daily Collection', best: 'Peak Day', worst: 'Lowest Day' },
    this_month: { avg: 'Avg Daily Collection', best: 'Peak Day', worst: 'Lowest Day' },
    this_year: { avg: 'Avg Monthly Collection', best: 'Best Month', worst: 'Lowest Month' },
  };
  const labels = statsLabels[period] || statsLabels.this_month;

  // Sub-period picker
  const renderSubPicker = () => {
    const handleChange = (value) => {
      onPeriodValueChange && onPeriodValueChange(value);
    };

    switch (period) {
      case 'today':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              slotProps={{ textField: { size: 'small', sx: { minWidth: 130, fontSize: '0.7rem' } } }}
              value={periodValue ? dayjs(periodValue) : dayjs()}
              onChange={(newValue) => handleChange(newValue?.format('YYYY-MM-DD') || null)}
              maxDate={dayjs()}
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
        );

      case 'this_week':
        return (
          <ReactDatePicker
            selected={
              periodValue?.year && periodValue?.week
                ? dayjs().year(periodValue.year).isoWeek(periodValue.week).toDate()
                : new Date()
            }
            onChange={(date) => {
              if (!date) return;
              handleChange({ week: dayjs(date).isoWeek(), year: dayjs(date).year() });
            }}
            showWeekPicker
            showWeekNumbers
            dateFormat="yyyy-'W'ww"
            className="custom-week-picker"
            maxDate={new Date()}
            minDate={new Date(2020, 0, 1)}
            calendarStartDay={1}
          />
        );

      case 'this_month':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              views={['year', 'month']}
              openTo="month"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 130, fontSize: '0.7rem' } } }}
              value={
                periodValue?.year && periodValue?.month
                  ? dayjs().year(periodValue.year).month(periodValue.month - 1)
                  : dayjs()
              }
              onChange={(newValue) => {
                if (!newValue) return;
                handleChange({ month: newValue.month() + 1, year: newValue.year() });
              }}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        );

      case 'this_year':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              views={['year']}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 110, fontSize: '0.7rem' } } }}
              value={periodValue ? dayjs().year(Number(periodValue)) : dayjs()}
              onChange={(newValue) => handleChange(newValue?.year() ?? null)}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

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

  const selectSx = {
    height: 28,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#374151',
    bgcolor: '#F9FAFB',
    borderRadius: '6px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
  };

  const menuItemSx = { fontSize: '0.75rem', '&:hover': { bgcolor: '#F3F4F6' }, '&.Mui-selected': { bgcolor: '#EEF2FF' } };

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
          px: 1,
          py: 1,
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

        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={period}
              onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
              sx={selectSx}
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
              <MenuItem value="today" sx={menuItemSx}>Today</MenuItem>
              <MenuItem value="this_week" sx={menuItemSx}>This Week</MenuItem>
              <MenuItem value="this_month" sx={menuItemSx}>This Month</MenuItem>
              <MenuItem value="this_year" sx={menuItemSx}>This Year</MenuItem>
            </Select>
          </FormControl>
          {/* {renderSubPicker()} */}
        </Box>
      </Box>
      <Box sx={{ mx: 1, borderTop: '1px solid #E5E7EB' }} />

      {/* Bar chart */}
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
              {labels.avg}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.75rem', color: '#3B82F6' }}>
              {formatCurrency(avgCollection)}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: 'center', py: 1.25, px: 0.5, borderRight: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.15 }}>
              {labels.best}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.72rem', color: '#16A34A' }}>
              {bestBucket ? `${bestBucket.month} (${formatCompact(bestBucket.amount)})` : '-'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, textAlign: 'center', py: 1.25, px: 0.5 }}>
            <Typography sx={{ fontSize: '0.55rem', color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.15 }}>
              {labels.worst}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.72rem', color: '#EF4444' }}>
              {worstBucket ? `${worstBucket.month} (${formatCompact(worstBucket.amount)})` : '-'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default RevenueTrend;
