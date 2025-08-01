import React from 'react';
import { Card, CardContent, Typography, Box, Fab } from '@mui/material';
import Chart from 'react-apexcharts';
import { IconCurrencyDollar } from "@tabler/icons-react";

import { useTheme } from '@mui/material/styles';

const MonthlySales = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const optionsmonthlychart = {
    grid: {
      show: true,
      borderColor: 'transparent',
      strokeDashArray: 2,
      padding: {
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
    colors: [primary],
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: '#adb0bb',
      fontFamily: "inherit",
      sparkline: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 2,
      curve: 'smooth',
    },
    tooltip: {
      theme: 'dark',
    },
  };
  const seriesmonthlychart = [
    {
      name: 'Monthly Sales',
      data: [35, 60, 30, 55, 40],
    },
  ];
  return (
    <Card
      sx={{
        pb: 0,
        pl: 0,
        pr: 0,
      }}
    >
      <CardContent
        sx={{
          paddingLeft: '30px',
          paddingRight: '30px',
        }}
      >
        <Box display="flex" alignItems="flex-start">
          <Box>
            <Typography
              variant="h5"
              color="textSecondary"
              sx={{
                marginBottom: '0',
              }}
              gutterBottom
            >
              Monthly Sales
            </Typography>
            <Typography
              variant="h2" mb={0}
              gutterBottom
            >
              3,246
            </Typography>
          </Box>

          <Box
            sx={{
              marginLeft: 'auto',
            }}
          >
            <Fab
              size="medium"
              color="warning"
              aria-label="add"
              elevation="0"
              sx={{
                boxShadow: 'none',
              }}
            >
              <IconCurrencyDollar width="21" height="21" />

            </Fab>
          </Box>
        </Box>
      </CardContent>
      <Chart options={optionsmonthlychart} series={seriesmonthlychart} type="area" height="75px" />
    </Card>
  );
};

export default MonthlySales;
