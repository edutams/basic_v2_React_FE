import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  Button,
  Card,
  useTheme,
} from '@mui/material';
import Chart from 'react-apexcharts';
// import StandardModal from 'src/components/shared/StandardModal';
import ReusableModal from 'src/components/shared/ReusableModal';

const PlanDistributionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const plans = [
    { label: 'Freemium', value: '7,000,234.00', color: '#263393', bg: 'white', border: '#263393' },
    { label: 'Basic', value: '7,000,234.00', color: '#7987FF', bg: 'white', border: '#7987FF' },
    { label: 'Basic +', value: '7,000,234.00', color: '#FA7CEB', bg: 'white', border: '#FA7CEB' },
    { label: 'Basic ++', value: '7,000,234.00', color: '#E697FF', bg: 'white', border: '#E697FF' },
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
      colors: ['#fff'],
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
        style: { fontSize: '10px', fontWeight: 600 },
      },
      title: {
        text: 'Agent',
        style: { fontWeight: 700, fontSize: '12px' },
        offsetY: 85,
      },
      axisBorder: { show: true, color: '#e0e0e0' },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'NO of Schools',
        style: { fontWeight: 700, fontSize: '12px' },
      },
      min: 0,
      max: 100,
      tickAmount: 10,
    },
    fill: { opacity: 1 },
    colors: ['#263393', '#7987FF', '#FA7CEB', '#E697FF'],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 700,
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 },
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 0,
    },
  };

  const chartSeries = [
    { name: 'Freemium', data: [55, 10, 8, 12, 25, 10, 10, 45, 12, 12] },
    { name: 'Basic', data: [38, 40, 15, 40, 30, 15, 12, 32, 32, 32] },
    { name: 'Basic +', data: [30, 82, 32, 35, 28, 28, 5, 32, 32, 72] },
    { name: 'Basic ++', data: [48, 15, 12, 18, 50, 32, 8, 32, 55, 52] },
  ];

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Plan Distribution
        </Typography>
      }
    >
      <Box
        sx={{
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8fafc',
          position: 'relative',
        }}
      >
        <Grid container spacing={2} mb={4} mt={2}>
          {plans.map((plan, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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
                  background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
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
                    sx={{ color: theme.palette.mode === 'dark' ? '#aaa' : '#444' }}
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
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
            p: 0,
            border: '1px solid #e2e8f0',
          }}
        >
          <Box
            sx={{ bgcolor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f2fdf5', px: 3, py: 1 }}
          >
            <Grid container alignItems="center">
              <Grid item xs={12} md={9}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="flex-start"
                  sx={{ pl: 1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      bgcolor: theme.palette.mode === 'dark' ? '#333' : 'white',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#e0f7fa',
                        borderRight: '1px solid #ddd',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                      >
                        Year
                      </Typography>
                    </Box>

                    <Select
                      size="small"
                      value="2026"
                      sx={{
                        '& fieldset': { border: 'none' },
                        '.MuiSelect-select': {
                          py: 0.5,
                          fontWeight: 600,
                          minWidth: '70px',
                          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        },
                      }}
                    >
                      <MenuItem value="2026">2026</MenuItem>
                    </Select>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#2ca87f',
                      '&:hover': { bgcolor: '#238a68' },
                      textTransform: 'none',
                      px: 3,
                      fontWeight: 600,
                      height: '32px',
                    }}
                  >
                    Filter
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography
                  fontWeight="700"
                  sx={{
                    fontSize: '16px',
                    color: theme.palette.mode === 'dark' ? '#fff' : '#555',
                  }}
                >
                  Plan per School
                </Typography>
              </Grid>
            </Grid>
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
                        background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Box
                          sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: plan.color }}
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight="700"
                          sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#1a3353' }}
                        >
                          {plan.label}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h4"
                        fontWeight="800"
                        sx={{ color: '#AE18B3', fontWeight: 600 }}
                      >
                        {index === 1 ? '400' : index === 2 ? '30' : index === 3 ? '800' : '300'}
                      </Typography>

                      <Typography variant="caption" sx={{ color: '#66696C', fontWeight: 600 }}>
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
    </ReusableModal>
  );
};

export default PlanDistributionModal;
