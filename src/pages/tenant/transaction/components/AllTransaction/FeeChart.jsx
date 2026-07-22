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

import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// Register dayjs plugins
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const FeeChart = ({
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  statusData,
  period,
  periodValue,
  onPeriodChange,
  // setPeriodValue,
  onPeriodValueChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderSubPicker = () => {
    const handleChange = (value) => {
      onPeriodValueChange(value);
    };

    switch (period) {
      case 'today':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
              value={periodValue ? dayjs(periodValue) : dayjs()}
              onChange={(newValue) => handleChange(newValue?.format('YYYY-MM-DD') || null)}
              maxDate={dayjs()} // Only today picker should be limited to today
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
              const week = dayjs(date).isoWeek();
              const year = dayjs(date).year();
              handleChange({ week, year });
            }}
            showWeekPicker
            showWeekNumbers
            dateFormat="yyyy-'W'ww"
            className="custom-week-picker"
            maxDate={new Date()} // Allow past weeks
            minDate={new Date(2020, 0, 1)} // Optional: limit how far back
            calendarStartDay={1}
          />
        );

      case 'this_month':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              views={['year', 'month']}
              openTo="month"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
              value={
                periodValue?.year && periodValue?.month
                  ? dayjs()
                      .year(periodValue.year)
                      .month(periodValue.month - 1)
                  : dayjs()
              }
              onChange={(newValue) => {
                if (!newValue) return;
                handleChange({
                  month: newValue.month() + 1,
                  year: newValue.year(),
                });
              }}
              maxDate={dayjs()} // Allow past months
            />
          </LocalizationProvider>
        );

      case 'this_year':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDatePicker
              views={['year']}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 120 } } }}
              value={periodValue ? dayjs().year(Number(periodValue)) : dayjs()}
              onChange={(newValue) => handleChange(newValue?.year() ?? null)}
              maxDate={dayjs()} // Allow past years
            />
          </LocalizationProvider>
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
