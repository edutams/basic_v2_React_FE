import React from 'react';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReactDatePicker from 'react-datepicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';

const FeeChart = ({
  open,
  onClose,
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  period,
  periodValue,
  onPeriodChange,
  onPeriodValueChange,
  statusData,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderSubPicker = () => {
    switch (period) {
      case 'today':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
              value={periodValue ? dayjs(periodValue) : dayjs()}
              onChange={(newValue) => onPeriodValueChange(newValue?.format('YYYY-MM-DD') || null)}
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
              const week = dayjs(date).isoWeek();
              const year = dayjs(date).year();
              onPeriodValueChange({ week, year });
            }}
            showWeekPicker
            showWeekNumbers
            dateFormat="yyyy-'W'ww"
            className="custom-week-picker"
            maxDate={new Date()}
            calendarStartDay={1}
          />
        );

      case 'this_month':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
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
                onPeriodValueChange({
                  month: newValue.month() + 1,
                  year: newValue.year(),
                });
              }}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        );

      case 'this_year':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              views={['year']}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 120 } } }}
              value={periodValue ? dayjs().year(Number(periodValue)) : dayjs()}
              onChange={(newValue) => onPeriodValueChange(newValue?.year() ?? null)}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2} mt={3} mb={3}>
      {/* Chart */}
      <Grid size={{ xs: 12, md: 9 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? '#1e1e1e' : 'white',
            p: 2,
          }}
        >
          {/* Duration Dropdown Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>
              {title || 'Transaction Chart'}
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

      {/* Side Panel */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Box
          sx={{
            border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
            borderRadius: '10px',
            bgcolor: isDark ? theme.palette.background.paper : '#fff',
            p: 2,
            height: '100%',
          }}
        >
          {/* Header row */}
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
