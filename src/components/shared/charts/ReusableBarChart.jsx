import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import DashboardCard from '../DashboardCard';
import PropTypes from 'prop-types';

const ReusableBarChart = ({ title, subtitle, series, categories, colors, height = 300 }) => {
  const theme = useTheme();
  
  const options = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
    },
    colors: colors || [theme.palette.primary.main, theme.palette.secondary.main],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: true,
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: categories || [],
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  return (
    <DashboardCard title={title} subtitle={subtitle}>
      <Box>
        <Chart options={options} series={series} type="bar" height={height} width="100%" />
      </Box>
    </DashboardCard>
  );
};

ReusableBarChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  series: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  colors: PropTypes.array,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ReusableBarChart;
