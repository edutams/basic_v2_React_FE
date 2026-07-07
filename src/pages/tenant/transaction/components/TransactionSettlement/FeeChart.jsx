import React, { useState } from 'react';
import { Grid, Box, Typography, useTheme, FormControl, Select, MenuItem } from '@mui/material';
import Chart from 'react-apexcharts';
import StatusBreakdownCard from './StatusBreakdownCard';

const FeeChart = ({
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  onDurationChange,
  statusData,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selectedDuration, setSelectedDuration] = useState('monthly');

  const handleDurationChange = (event) => {
    const newDuration = event.target.value;
    setSelectedDuration(newDuration);
    if (onDurationChange) {
      onDurationChange(newDuration);
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
              {title || 'Settlement Chart'}
            </Typography>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedDuration}
                onChange={handleDurationChange}
                sx={{
                  bgcolor: isDark ? '#2a2a2a' : '#f5f5f5',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? '#444' : '#e0e0e0',
                  },
                }}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
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
          <StatusBreakdownCard title={statusData?.title} items={statusData?.items} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default FeeChart;
