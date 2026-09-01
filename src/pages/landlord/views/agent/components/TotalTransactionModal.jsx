import React from 'react';
import { Grid, Box, Typography, Stack, Card, useTheme } from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import { IconCash, IconClockHour4, IconCoins } from '@tabler/icons-react';

function formatNaira(value) {
  return Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#FEF3C7', color: '#D97706' },
];

const TopCard = ({ label, value, colorIndex = 0, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '14px',
        bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
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
          <Icon size={18} color="currentColor" />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            fontWeight={800}
            sx={{ fontSize: '20px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}
          >
            ₦ {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: isDark ? '#ffffff' : '#64748B', fontWeight: 500, fontSize: '12px' }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const SideStatRow = ({ label, value, colorIndex = 0, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
      sx={{
        py: 1.2,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : scheme.bg,
          color: isDark ? '#ffffff' : scheme.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color="currentColor" />
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography fontWeight={800} sx={{ fontSize: '14px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.2 }}>
          ₦{value}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px', display: 'block' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

const TotalTransactionModal = ({ open, onClose, transactionVolume = 0, transactionPending = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const total = transactionVolume + transactionPending;

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '35%', distributed: true } },
    dataLabels: { enabled: false },
    colors: ['#16a34a', '#d97706'],
    xaxis: {
      categories: ['Collected', 'Pending'],
      labels: { style: { colors: isDark ? '#aaa' : '#64748B', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#aaa' : '#64748B' },
        formatter: (val) => `₦${formatNaira(val)}`,
      },
    },
    legend: { show: false },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `₦${formatNaira(val)}` },
    },
  };

  const chartSeries = [{ name: 'Amount', data: [transactionVolume, transactionPending] }];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total Transaction"
      maxWidth="lg"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Collected" value={formatNaira(transactionVolume)} colorIndex={0} icon={IconCash} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Pending" value={formatNaira(transactionPending)} colorIndex={2} icon={IconClockHour4} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard label="Total" value={formatNaira(total)} colorIndex={1} icon={IconCoins} />
        </Grid>
      </Grid>

      {/* Chart + side panel */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 9 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? '#1e1e1e' : 'white',
              p: 1,
            }}
          >
            <Chart options={chartOptions} series={chartSeries} type="bar" height={360} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? theme.palette.background.paper : '#fff',
              p: 2,
              height: '100%',
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1.5, color: isDark ? '#fff' : '#1a1a1a' }}
            >
              Breakdown
            </Typography>
            <SideStatRow label="Collected" value={formatNaira(transactionVolume)} colorIndex={0} icon={IconCash} />
            <SideStatRow label="Pending" value={formatNaira(transactionPending)} colorIndex={2} icon={IconClockHour4} />
            <SideStatRow label="Total" value={formatNaira(total)} colorIndex={1} icon={IconCoins} />
          </Box>
        </Grid>
      </Grid>
    </StandardModal>
  );
};

export default TotalTransactionModal;
