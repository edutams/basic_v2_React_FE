import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography, Avatar } from '@mui/material';
import DashboardCard from '../DashboardCard';
import PropTypes from 'prop-types';

const ReusablePieChart = ({ title, subtitle, series, labels, colors, height = 300 }) => {
  const theme = useTheme();
  
  const options = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
    },
    labels: labels || [],
    colors: colors || [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
  };

  return (
    <DashboardCard title={title} subtitle={subtitle}>
      <Box mt={3}>
        <Chart options={options} series={series} type="donut" height={height} width="100%" />
        
        <Stack spacing={2} mt={4}>
          {labels.map((label, index) => (
            <Stack key={label} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: options.colors[index] || '#ccc',
                }}
              />
              <Typography variant="subtitle2" color="textSecondary">
                {label} ({series[index]})
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </DashboardCard>
  );
};

ReusablePieChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  series: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  colors: PropTypes.array,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReusablePieChart;
