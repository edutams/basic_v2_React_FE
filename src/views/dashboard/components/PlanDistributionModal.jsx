import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  Button,
  Paper,
  useTheme,
  Divider,
  Card,
} from '@mui/material';
import Chart from 'react-apexcharts';
import { IconCreditCard } from '@tabler/icons-react';
import ReusableModal from 'src/components/shared/ReusableModal';
import { IconBuildingBank } from '@tabler/icons-react';

const PlanDistributionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const plans = [
    { label: 'Freemium', value: '7,000,234.00', color: '#263393', bg: 'white', border: '#263393' },
    { label: 'Basic', value: '7,000,234.00', color: '#7987FF', bg: 'white', border: '#7987FF' },
    { label: 'Basic +', value: '7,000,234.00', color: '#FA7CEB', bg: 'white', border: '#FA7CEB' },
    { label: 'Basic ++', value: '7,000,234.00', color: '#E697FF', bg: 'white', border: '#E697FF' },
  ];

  const totalSchools = plans.reduce((sum, p) => sum + p.schoolCount, 0);

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
      colors: theme.palette.mode === 'dark' ? ['#333'] : ['#fff'],
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
        style: {
          fontSize: '10px',
          fontWeight: 600,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      title: {
        text: 'Agent',
        style: {
          fontWeight: 700,
          fontSize: '12px',
          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
        offsetY: 85,
      },
      axisBorder: { show: true, color: theme.palette.mode === 'dark' ? '#444' : '#e0e0e0' },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'NO of Schools',
        style: {
          fontWeight: 700,
          fontSize: '12px',
          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      labels: {
        style: { colors: theme.palette.mode === 'dark' ? '#fff' : '#333' },
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
      borderColor: theme.palette.mode === 'dark' ? '#444' : '#f1f1f1',
      strokeDashArray: 0,
    },
    theme: { mode: theme.palette.mode },
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
        <Typography
          fontSize={24}
          fontWeight={700}
          sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F' }}
        >
          Plan Distribution
        </Typography>
      }
    >
      <Box sx={{ bgcolor: isDark ? theme.palette.background.default : '#f8fafc' }}>
        {/* Top Plan Value Cards */}
        <Grid container spacing={2} mb={3}>
          {plans.map((plan, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#333' : '#e8eaf6'}`,
                  bgcolor: isDark ? '#1e1e1e' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: isDark ? '#2a2a2a' : plan.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconBuildingBank size={22} color={plan.color} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="800"
                    sx={{ color: plan.color, fontSize: '16px', lineHeight: 1.2 }}
                  >
                    {plan.value}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: plan.color }} />
                    <Typography
                      variant="caption"
                      fontWeight="600"
                      sx={{ color: isDark ? '#aaa' : '#666' }}
                    >
                      {plan.label}
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Chart Section */}
        <Box
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: isDark ? '#1e1e1e' : '#fff',
            border: isDark ? '1px solid #333' : '1px solid #e2e8f0',
          }}
        >
          {/* Filter Bar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'flex-end',
              p: 2,
              gap: 2,
              bgcolor: isDark ? '#1e1e1e' : '#f0fdf4',
              borderBottom: `1px solid ${isDark ? '#333' : '#d1fae5'}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                borderRadius: '6px',
                bgcolor: isDark ? '#2d2d2d' : '#fff',
                overflow: 'hidden',
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
                    minWidth: '70px',
                    fontSize: '13px',
                    color: isDark ? '#fff' : '#333',
                  },
                }}
              >
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </Box>
            <Button variant="primary" sx={{ height: '36px', px: 4 }}>
              Filter
            </Button>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Bar Chart */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Chart options={chartOptions} series={chartSeries} type="bar" height={420} />
              </Grid>

              {/* Plan per School Summary */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="700"
                    sx={{ color: isDark ? '#fff' : '#1E3A5F', mb: 2, fontSize: '15px' }}
                  >
                    Plan per School
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2} sx={{ flex: 1 }}>
                    {plans.map((plan, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '8px',
                              bgcolor: isDark ? '#2a2a2a' : plan.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconBuildingBank size={18} color={plan.color} />
                          </Box>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
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
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#888' }}>
                            School
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: plan.color,
                              color: '#fff',
                              px: 1.5,
                              py: 0.3,
                              borderRadius: '4px',
                              minWidth: 40,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" fontWeight="700">
                              {plan.schoolCount}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>

                  {/* Total */}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '10px',
                      bgcolor: isDark ? '#2a2a2a' : '#EEF2FF',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: theme.palette.primary.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconBuildingBank size={20} color="#4a3aff" />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="800"
                        sx={{ color: isDark ? '#fff' : '#1E3A5F', lineHeight: 1 }}
                      >
                        {totalSchools.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: isDark ? '#aaa' : '#64748B', fontWeight: 600 }}
                      >
                        Total School
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </ReusableModal>
  );
};

export default PlanDistributionModal;
