import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  Button,
  useTheme,
  Divider,
  Card,
  Skeleton,
} from '@mui/material';
import Chart from 'react-apexcharts';
import ReusableModal from '@/components/shared/ReusableModal';
import { IconBuildingBank } from '@tabler/icons-react';
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const PlanDistributionModal = ({ open, onClose, planDistribution = [], totalOrganizations = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const plans = planDistribution.map((p, i) => ({
    label: p.label,
    value: (p.total ?? 0).toLocaleString(),
    schoolCount: p.total ?? 0,
    colorIndex: i % schemeMap.length
  }));

  const totalSchools = totalOrganizations || plans.reduce((sum, p) => sum + (p.schoolCount ?? 0), 0);

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
      categories: plans.map((p) => p.label),
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
          fontWeight: 600,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      title: {
        text: 'Plan',
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
    colors: schemeMap.map((s) => s.color),
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
    { name: 'Schools', data: plans.map((p) => p.schoolCount ?? 0) },
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
          sx={{ color: theme.palette.text.secondary }}
        >
          Plan Distribution
        </Typography>
      }
    >
      <Box sx={{ bgcolor: isDark ? theme.palette.background.default : '#f8fafc' }}>
        {/* Top Plan Value Cards */}
        <Grid container spacing={2} mb={3}>
          {plans.length > 0 ? (
            plans.map((plan, i) => {
              const scheme = schemeMap[i % schemeMap.length];
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Card
                    sx={{
                      p: '14px',
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
                        color: isDark ? '#ffffff' : scheme.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconBuildingBank size={18} color="currentColor" />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h6"
                        fontWeight="800"
                        sx={{ color: isDark ? '#ffffff' : '#0f172a', fontSize: '16px', lineHeight: 1.2 }}
                      >
                        {plan.value}
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} mt={0.3}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: scheme.color }} />
                        <Typography
                          variant="caption"
                          fontWeight="600"
                          sx={{ color: isDark ? '#ffffff' : theme.palette.text.secondary }}
                        >
                          {plan.label}
                        </Typography>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          ) : (
            [...Array(4)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Card
                  sx={{
                    p: '14px',
                    borderRadius: '14px',
                    bgcolor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                  <Box sx={{ textAlign: 'right', flex: 1 }}>
                    <Skeleton variant="text" width={50} height={28} sx={{ ml: 'auto' }} />
                    <Skeleton variant="text" width={70} height={16} sx={{ ml: 'auto' }} />
                  </Box>
                </Card>
              </Grid>
            ))
          )}
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
            <Button variant="contained" size="small" sx={{ height: '36px', px: 4 }}>
              Filter
            </Button>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Bar Chart */}
              <Grid size={{ xs: 12, md: 8 }}>
                {plans.length > 0 ? (
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={420} />
                ) : (
                  <Skeleton variant="rounded" height={420} sx={{ borderRadius: '8px' }} />
                )}
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
                    {plans.length > 0 ? (
                      plans.map((plan, i) => {
                        const scheme = schemeMap[i % schemeMap.length];
                        return (
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
                                  bgcolor: isDark ? '#2a2a2a' : scheme.bg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <IconBuildingBank size={18} color={scheme.color} />
                              </Box>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box
                                  sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: scheme.color }}
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
                                  bgcolor: scheme.color,
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
                        );
                      })
                    ) : (
                      [...Array(4)].map((_, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
                            <Skeleton variant="text" width={70} height={20} />
                          </Stack>
                          <Skeleton variant="rounded" width={40} height={24} sx={{ borderRadius: '4px' }} />
                        </Stack>
                      ))
                    )}
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
                        {totalSchools > 0 ? totalSchools.toLocaleString() : <Skeleton variant="text" width={40} height={32} />}
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
