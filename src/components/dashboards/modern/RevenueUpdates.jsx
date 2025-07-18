import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import ThemeSelect from '../analytical/ThemeSelect';
import DashboardCard from '../../shared/DashboardCard';

const RevenueUpdates = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const optionsrevenue = {
    grid: {
      show: true,
      borderColor: 'rgba(0, 0, 0, .2)',
      color: '#777e89',
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    chart: {
      fontFamily: 'DM Sans',
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: [primary, secondary],

    xaxis: {
      categories: ['16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08'],
    },
    markers: {
      size: 4,
      border: 1,
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
      theme: 'dark',
    },
    legend: {
      show: false,
    },
  };
  const seriesrevenue = [
    {
      name: 'Earnings',
      data: [0, 5, 6, 8, 25, 9, 11, 24],
    },
    {
      name: 'Expense',
      data: [0, 3, 1, 2, 8, 1, 5, 1],
    },
  ];
  return (
    <DashboardCard title="Revenue Updates" action={<ThemeSelect />}>
      {/* chart */}
      <Box>
        <Chart options={optionsrevenue} series={seriesrevenue} type="line" height="290" />
      </Box>
      <Stack direction='row' justifyContent='center' gap={2} mt={3}>
        <Box
          display="flex"
          alignItems="center" gap={1}
          sx={{
            color: primary,
          }}
        >
          <Box
            sx={{
              backgroundColor: primary,
              borderRadius: '50%',
              height: 8,
              width: 8,
            }}
          />
          <Typography variant="h6">Earnings</Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center" gap={1}
          sx={{
            color: secondary,
          }}
        >
          <Box
            sx={{
              backgroundColor: secondary,
              borderRadius: '50%',
              height: 8,
              width: 8,
            }}
          />
          <Typography variant="h6">Expense</Typography>
        </Box>
      </Stack>
    </DashboardCard>
  );
};

export default RevenueUpdates;
