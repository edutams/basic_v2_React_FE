import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import DashboardCard from '../DashboardCard';
import PropTypes from 'prop-types';

const ReusableBarChart = ({ 
  title, 
  subtitle, 
  series, 
  categories, 
  colors, 
  height = 300,
  yAxisPrefix = '',
  yAxisFormatter = (val) => val,
  xAxisTitle = ''
}) => {
  const theme = useTheme();
  
  const options = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      }
    },
    colors: colors || [theme.palette.primary.main, theme.palette.secondary.main],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: false, // Changed to false to avoid color per bar unless explicitly needed
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
      yaxis: {
        lines: {
          show: true,
        }
      }
    },
    xaxis: {
      categories: categories || [],
      axisBorder: {
        show: false,
      },
      title: {
        text: xAxisTitle,
        style: {
          color: '#adb0bb',
          fontWeight: 400
        }
      }
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (val) => `${yAxisPrefix}${yAxisFormatter(val)}`,
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
  yAxisPrefix: PropTypes.string,
  yAxisFormatter: PropTypes.func,
  xAxisTitle: PropTypes.string,
};

export default ReusableBarChart;
