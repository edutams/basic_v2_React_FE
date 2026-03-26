import React from 'react';
import { Grid, Box, Typography, Stack, Select, MenuItem, Card, useTheme } from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconCash, IconTrendingUp, IconCoins } from '@tabler/icons-react';

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
          <Typography fontWeight={800} sx={{ fontSize: '22px', color: valueColor, lineHeight: 1.2 }}>
            ₦ {value}
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontWeight: 500, fontSize: '12px' }}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const SideStatRow = ({ label, value, valueColor, iconBg, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.2, borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}`, '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={valueColor} />
      </Box>
      <Box>
        <Typography fontWeight={800} sx={{ fontSize: '14px', color: valueColor, lineHeight: 1.2 }}>
          ₦{value}
        </Typography>
        <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontSize: '11px' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

const TotalTransactionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [year, setYear] = React.useState('2026');
  const [option, setOption] = React.useState('All');

  const chartOptions = {
    chart: {
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    colors: ['#3B82F6'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { colors: isDark ? '#aaa' : '#64748B', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#aaa' : '#64748B' },
        formatter: (val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val,
      },
    },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (val) => `₦${val.toLocaleString()}` } },
  };

  const chartSeries = [{ name: 'Transactions', data: [3500000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 3500000, 2300000, 0, 0] }];

  return (
    <StandardModal open={open} onClose={onClose} title="Total Transaction" maxWidth="lg" padding={3} dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top 3 stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Total Transaction Value" value="7,000,234.00" valueColor="#2ca87f" iconBg={isDark ? '#0d2e1e' : '#d6f5eb'} icon={IconCash} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Total Transaction Volume" value="7,000,234.00" valueColor="#e11d48" iconBg={isDark ? '#2e0d1a' : '#ffe4e6'} icon={IconTrendingUp} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Total Commission" value="1,000,234.00" valueColor="#4a3aff" iconBg={isDark ? '#1e2a4a' : '#e8e6ff'} icon={IconCoins} />
        </Grid>
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
            <Box sx={{ display: 'flex', alignItems: 'center', border: `2px solid #3B82F6`, borderRadius: '6px', bgcolor: isDark ? '#2d2d2d' : 'white', overflow: 'hidden' }}>
              <Select size="small" value={option} onChange={(e) => setOption(e.target.value)}
                sx={{ '& fieldset': { border: 'none' }, minWidth: 180, fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#333' }}>
                <MenuItem value="All">Transaction option</MenuItem>
              </Select>
            </Box>
            <PrimaryButton sx={{ height: 40, px: 3, borderRadius: '6px', bgcolor: '#1E40AF', color: '#fff', '&:hover': { bgcolor: '#1e3a8a' } }}>
              Filter
            </PrimaryButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Chart + side panel */}
      <Grid container spacing={2}>
        {/* Left: chart */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '10px', bgcolor: isDark ? '#1e1e1e' : 'white', p: 1 }}>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={360} />
          </Box>
        </Grid>

        {/* Right: side stats */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`, borderRadius: '10px', bgcolor: isDark ? theme.palette.background.paper : '#fff', p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a' }}>
              Total Transaction Value
            </Typography>
            <SideStatRow label="Transaction Today" value="7,000,234.00" valueColor="#2ca87f" iconBg={isDark ? '#0d2e1e' : '#d6f5eb'} icon={IconCash} />
            <SideStatRow label="Transaction This Month" value="7,000,234.00" valueColor="#e11d48" iconBg={isDark ? '#2e0d1a' : '#ffe4e6'} icon={IconCash} />
            <SideStatRow label="Transaction This Week" value="7,000,234.00" valueColor="#2ca87f" iconBg={isDark ? '#0d2e1e' : '#d6f5eb'} icon={IconCash} />
            <SideStatRow label="Transaction This Year" value="7,000,234.00" valueColor="#4a3aff" iconBg={isDark ? '#1e2a4a' : '#e8e6ff'} icon={IconCash} />
          </Box>
        </Grid>
      </Grid>
    </StandardModal>
  );
};

export default TotalTransactionModal;
