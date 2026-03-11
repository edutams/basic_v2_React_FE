import React from 'react';
import { Typography, Box, Grid, Stack, Select, MenuItem, Card, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';

const PlanDistributionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const plans = [
    { label: 'Freemium', value: '7,000,234.00', color: '#1a3353', bg: 'white', border: '#1a3353' },
    { label: 'Basic', value: '7,000,234.00', color: '#4a3aff', bg: 'white', border: '#4a3aff' },
    { label: 'Basic +', value: '7,000,234.00', color: '#ff4081', bg: 'white', border: '#fcc5d8' },
    { label: 'Basic ++', value: '7,000,234.00', color: '#9c27b0', bg: 'white', border: '#e1bee7' },
  ];

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 0,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: isDark ? ['#333'] : ['#fff'],
    },
    xaxis: {
      categories: [
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
        'Olasegun Obasanjo',
      ],
      labels: {
        rotate: -45,
        style: { fontSize: '10px', fontWeight: 600, colors: isDark ? '#aaa' : '#333' },
      },
      title: {
        text: 'Agent',
        style: { fontWeight: 700, fontSize: '12px', color: isDark ? '#fff' : '#333' },
        offsetY: 85,
      },
      axisBorder: { show: true, color: isDark ? '#444' : '#e0e0e0' },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'NO of Schools',
        style: { fontWeight: 700, fontSize: '12px', color: isDark ? '#fff' : '#333' },
      },
      labels: { style: { colors: isDark ? '#aaa' : '#333' } },
      min: 0,
      max: 100,
      tickAmount: 10,
    },
    fill: { opacity: 1 },
    colors: ['#3949ab', '#2196f3', '#ff4081', '#9c27b0'],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 700,
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 },
      labels: { colors: isDark ? '#fff' : '#333' },
    },
    grid: {
      borderColor: isDark ? '#333' : '#f1f1f1',
      strokeDashArray: 0,
    },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Freemium', data: [55, 10, 8, 12, 25, 10, 10, 45, 12, 12] },
    { name: 'Basic', data: [38, 40, 15, 40, 30, 15, 12, 32, 32, 32] },
    { name: 'Basic +', data: [30, 82, 32, 35, 28, 28, 5, 32, 32, 72] },
    { name: 'Basic ++', data: [48, 15, 12, 18, 50, 32, 8, 32, 55, 52] },
  ];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Plan Distribution"
      maxWidth="lg"
      padding={0}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
      actions={
        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
          <PrimaryButton variant="secondary" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton variant="primary" onClick={onClose}>
            Save
          </PrimaryButton>
        </Stack>
      }
    >
      <Box sx={{ p: 4, bgcolor: isDark ? theme.palette.background.default : '#f8fafc' }}>
        <Grid container spacing={2} mb={4}>
          {plans.map((plan, index) => (
            <Grid container size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  p: 2,
                  border: `1.5px solid ${plan.border}`,
                  boxShadow: 'none',
                  borderRadius: '4px',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  width: '100%',
                  bgcolor: isDark ? '#1e1e1e' : 'white',
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{ color: plan.color, fontSize: '22px' }}
                >
                  # {plan.value}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: plan.color }} />
                  <Typography
                    variant="caption"
                    fontWeight="700"
                    sx={{ color: isDark ? '#aaa' : '#444' }}
                  >
                    {plan.label}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: isDark ? '#1e1e1e' : 'white',
            p: 0,
            border: isDark ? '1px solid #333' : '1px solid #e2e8f0',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: isDark ? '#1e1e1e' : '#f2fdf5',
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="700"
              sx={{ color: isDark ? '#fff' : '#134E48', fontSize: { xs: '14px', sm: '16px' } }}
            >
              Plan per School
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                  borderRadius: '4px',
                  bgcolor: isDark ? '#2d2d2d' : 'white',
                  overflow: 'hidden',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    bgcolor: isDark ? '#1e1e1e' : '#e0f7fa',
                    borderRight: `1px solid ${isDark ? '#444' : '#ddd'}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="800"
                    sx={{ textTransform: 'uppercase', color: isDark ? '#fff' : '#0369A1' }}
                  >
                    Year
                  </Typography>
                </Box>
                <Select
                  size="small"
                  value="2026"
                  sx={{
                    border: 'none',
                    '& fieldset': { border: 'none' },
                    '.MuiSelect-select': {
                      py: 0.5,
                      fontWeight: 700,
                      minWidth: '80px',
                      fontSize: '13px',
                      color: isDark ? '#fff' : '#333',
                    },
                    flexGrow: { xs: 1, sm: 0 },
                  }}
                >
                  <MenuItem value="2026">2026</MenuItem>
                </Select>
              </Box>
              <PrimaryButton
                variant="primary"
                sx={{
                  height: '36px',
                  px: 4,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Filter
              </PrimaryButton>
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ display: 'flex' }}>
              <Grid size={{ xs: 12, md: 9 }}>
                <Box sx={{ p: 1, position: 'relative' }}>
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={450} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
                <Stack
                  spacing={2}
                  sx={{ width: '100%', height: '450px', justifyContent: 'space-between' }}
                >
                  {plans.map((plan, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        border: `1.5px solid ${plan.border}`,
                        boxShadow: 'none',
                        borderRadius: '4px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        bgcolor: isDark ? '#1e1e1e' : 'white',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Box
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: plan.color }}
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight="700"
                          sx={{ color: isDark ? '#fff' : '#1a3353' }}
                        >
                          {plan.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h3"
                        fontWeight="800"
                        sx={{ color: plan.color, mb: 0.5, fontSize: '28px' }}
                      >
                        {index === 1 ? '400' : index === 2 ? '30' : index === 3 ? '800' : '300'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        School
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </StandardModal>
  );
};

export default PlanDistributionModal;
