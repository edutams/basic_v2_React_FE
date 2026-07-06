import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  TableContainer,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import { IconDownload } from '@tabler/icons';
import StatusBreakdownCard from './StatusBreakdownCard';
import dayjs from 'dayjs';

function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

const FeeChart = ({
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  statusData,
  period,
  periodValue,
  onPeriodChange,
  onPeriodValueChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const currentYear = dayjs().year();
  const currentWeek = getISOWeek();

  const renderSubPicker = () => {
    switch (period) {
      case 'today':
        return (
          <TextField
            size="small"
            type="date"
            value={periodValue || dayjs().format('YYYY-MM-DD')}
            onChange={(e) => onPeriodValueChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: dayjs().format('YYYY-MM-DD') }}
          />
        );
      case 'this_week':
        return (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={periodValue || currentWeek}
              onChange={(e) => onPeriodValueChange(e.target.value)}
            >
              {Array.from({ length: currentWeek }, (_, i) => i + 1).map((w) => (
                <MenuItem key={w} value={w}>
                  Week {w}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'this_month':
        return (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={periodValue || dayjs().month() + 1}
              onChange={(e) => onPeriodValueChange(e.target.value)}
            >
              {[
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ].map((m, i) => (
                <MenuItem key={m} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'this_year':
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={periodValue || currentYear}
              onChange={(e) => onPeriodValueChange(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2} mt={3} mb={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? '#1e1e1e' : 'white',
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="this_week">This Week</MenuItem>
                  <MenuItem value="this_month">This Month</MenuItem>
                  <MenuItem value="this_year">This Year</MenuItem>
                </Select>
              </FormControl>
              {renderSubPicker()}
            </Box>
          </Box>
          <Chart options={chartOptions} series={chartSeries} type={chartType} height={320} />
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? theme.palette.background.paper : '#fff',
            p: 2,
            height: '100%',
          }}
        >
          <StatusBreakdownCard
            title={statusData?.title}
            items={statusData?.items}
            metrics={statusData?.metrics}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default FeeChart;
