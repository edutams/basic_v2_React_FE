import React from 'react';
import { Grid, Box, Typography, Stack, Select, MenuItem, Card, Divider, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import StandardModal from 'src/components/shared/StandardModal';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconBuildingBank } from '@tabler/icons-react';

const plans = [
  { label: 'Freemium', value: '₦7,000,234.00', color: '#3949ab', iconBg: '#e8eaf6', schoolCount: 300 },
  { label: 'Basic',    value: '₦7,000,234.00', color: '#2196f3', iconBg: '#e3f2fd', schoolCount: 400 },
  { label: 'Basic +',  value: '₦7,000,234.00', color: '#ff4081', iconBg: '#fce4ec', schoolCount: 400 },
  { label: 'Basic ++', value: '₦7,000,234.00', color: '#9c27b0', iconBg: '#f3e5f5', schoolCount: 50  },
];

const totalSchools = plans.reduce((sum, p) => sum + p.schoolCount, 0);

// ── Shared card components matching TotalTransactionModal ──────────────
const TopCard = ({ label, value, valueColor, iconBg, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{ p: 2.5, borderRadius: '12px', boxShadow: 'none', border: `1px solid ${isDark ? theme.palette.divider : '#f0f0f0'}`, bgcolor: isDark ? theme.palette.background.paper : '#fff', height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={valueColor} />
        </Box>
        <Box>
          <Typography fontWeight={800} sx={{ fontSize: '18px', color: valueColor, lineHeight: 1.2 }}>{value}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: valueColor }} />
            <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontWeight: 500, fontSize: '12px' }}>{label}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

const SideStatRow = ({ label, count, valueColor, iconBg, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between"
      sx={{ py: 1.2, borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}`, '&:last-child': { borderBottom: 'none' } }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={valueColor} />
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: valueColor }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1a3353', fontSize: '12px' }}>{label}</Typography>
        </Stack>
      </Stack>
      <Box sx={{ bgcolor: valueColor, color: '#fff', px: 1.5, py: 0.3, borderRadius: '4px', minWidth: 36, textAlign: 'center' }}>
        <Typography variant="caption" fontWeight={700}>{count}</Typography>
      </Box>
    </Stack>
  );
};

const PlanDistributionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [year, setYear] = React.useState('2026');

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } }, fontFamily: 'inherit', foreColor: isDark ? '#aaa' : '#64748B' },
    plotOptions: { bar: { horizontal: false, columnWidth: '65%', borderRadius: 0 } },
    dataLabels: { enabled: false },
    colors: plans.map((p) => p.color),
    xaxis: {
      categories: Array(10).fill('Olasegun Obasanjo'),
      labels: { rotate: -45, style: { fontSize: '10px', fontWeight: 600, colors: isDark ? '#aaa' : '#333' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'NO of Schools', style: { fontWeight: 700, fontSize: '12px', color: isDark ? '#fff' : '#333' } },
      labels: { style: { colors: isDark ? '#aaa' : '#333' } },
      min: 0, max: 100, tickAmount: 10,
    },
    legend: { position: 'top', horizontalAlign: 'center', fontSize: '13px', fontWeight: 700, markers: { radius: 12 }, itemMargin: { horizontal: 12, vertical: 8 }, labels: { colors: isDark ? '#fff' : '#333' } },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Freemium', data: [55, 10, 8, 12, 25, 10, 10, 45, 12, 12] },
    { name: 'Basic',    data: [38, 40, 15, 40, 30, 15, 12, 32, 32, 32] },
    { name: 'Basic +',  data: [30, 82, 32, 35, 28, 28,  5, 32, 32, 72] },
    { name: 'Basic ++', data: [48, 15, 12, 18, 50, 32,  8, 32, 55, 52] },
  ];

  return (
    <StandardModal open={open} onClose={onClose} title="Plan Distribution" maxWidth="lg" padding={3} dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top 4 plan cards */}
      <Grid container spacing={2} mb={3}>
        {plans.map((plan, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <TopCard label={plan.label} value={plan.value} valueColor={plan.color} iconBg={isDark ? '#2a2a2a' : plan.iconBg} icon={IconBuildingBank} />
          </Grid>
        ))}
      </Grid>

      {/* Filter row — full width, floated right */}
      <Grid container spacing={2} mb={1}>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
            <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '6px', bgcolor: isDark ? '#2d2d2d' : 'white', overflow: 'hidden' }}>
              <Select size="small" value={year} onChange={(e) => setYear(e.target.value)}
                renderValue={(v) => `Year ${v}`}
                sx={{ '& fieldset': { border: 'none' }, minWidth: 120, fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#333' }}>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </Box>
            <PrimaryButton sx={{ height: 40, px: 3, borderRadius: '6px' }}>
              Filter
            </PrimaryButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Chart md:9 + side panel md:3 */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '10px', bgcolor: isDark ? '#1e1e1e' : 'white', p: 1 }}>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={360} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`, borderRadius: '10px', bgcolor: isDark ? theme.palette.background.paper : '#fff', p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a' }}>
              Plan per School
            </Typography>
            {plans.map((plan, i) => (
              <SideStatRow key={i} label={plan.label} count={plan.schoolCount} valueColor={plan.color} iconBg={isDark ? '#2a2a2a' : plan.iconBg} icon={IconBuildingBank} />
            ))}
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: theme.palette.primary.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconBuildingBank size={18} color="#4a3aff" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} sx={{ fontSize: '20px', color: isDark ? '#fff' : '#1E3A5F', lineHeight: 1 }}>{totalSchools.toLocaleString()}</Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontSize: '11px' }}>Total School</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </StandardModal>
  );
};

export default PlanDistributionModal;
