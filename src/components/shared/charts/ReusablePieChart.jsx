import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography, Avatar } from '@mui/material';
import DashboardCard from '../DashboardCard';
import PropTypes from 'prop-types';

const ReusablePieChart = ({
  title,
  subtitle,
  series,
  labels,
  colors,
  height = 300,
  hideCard = false,
}) => {
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
    colors: colors || [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          // background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + '%';
      },
      style: {
        fontSize: '10px',
        fontWeight: '600',
      },
      dropShadow: {
        enabled: false,
      },
    },
    stroke: {
      show: false,
    },
    legend: {
      show: true,
      position: 'right',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '12px',
      fontWeight: '600',
      color: theme.palette.mode === 'dark' ? 'dark' : 'light',
      style: {
        color: theme.palette.mode === 'dark' ? 'dark' : 'light',
      },
      labels: {
        colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      style: {
        color: theme.palette.mode === 'dark' ? 'dark' : 'light',
      },
      fillSeriesColor: false,
    },
  };

  const chartContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Chart options={options} series={series} type="donut" height={height} width="100%" />
    </Box>
  );

  if (hideCard) {
    return chartContent;
  }

  return (
    <DashboardCard title={title} subtitle={subtitle}>
      <Box>{chartContent}</Box>
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
  hideCard: PropTypes.bool,
};

export default ReusablePieChart;
