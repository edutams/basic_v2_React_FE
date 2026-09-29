import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  useTheme,
  Grid,
  Button,
  Card,
} from '@mui/material';
import { IconCash, IconTrendingUp, IconCoins } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import Chart from 'react-apexcharts';
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
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

const TotalTransactionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [year, setYear] = React.useState('2026');
  const [option, setOption] = React.useState('All');

  const chartOptions = {
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
      background: 'transparent',
    },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main || '#3B82F6'],
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      labels: { style: { colors: isDark ? '#aaa' : '#64748B', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#aaa' : '#64748B' },
        formatter: (val) =>
          val >= 1000000
            ? (val / 1000000).toFixed(1) + 'M'
            : val >= 1000
              ? (val / 1000).toFixed(0) + 'K'
              : val,
      },
    },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` },
    },
  };

  const chartSeries = [
    {
      name: 'Transactions',
      data: [
        3500000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 4200000, 3500000, 2300000, 0,
        0,
      ],
    },
  ];

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Total Transaction
        </Typography>
      }
    >
      {/* Top 3 stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard
            label="Total Transaction Value"
            value="7,000,234.00"
            colorIndex={0}
            icon={IconCash}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard
            label="Total Transaction Volume"
            value="7,000,234.00"
            colorIndex={1}
            icon={IconTrendingUp}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TopCard
            label="Total Commission"
            value="1,000,234.00"
            colorIndex={2}
            icon={IconCoins}
          />
        </Grid>
      </Grid>

      {/* Chart + side panel */}
      <Grid
        container
        spacing={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #eee',
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
        }}
      >
        <Box
          sx={{
            background: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9F9F9',
            px: 3,
            py: 1,
            width: '100%',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
                borderRadius: '6px',
                bgcolor: isDark ? '#2d2d2d' : 'white',
                overflow: 'hidden',
              }}
            >
              <Select
                size="small"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                renderValue={(v) => `Year ${v}`}
                sx={{
                  '& fieldset': { border: 'none' },
                  minWidth: 120,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isDark ? '#fff' : '#333',
                }}
              >
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: `2px solid #3B82F6`,
                borderRadius: '6px',
                bgcolor: isDark ? '#2d2d2d' : 'white',
                overflow: 'hidden',
              }}
            >
              <Select
                size="small"
                value={option}
                onChange={(e) => setOption(e.target.value)}
                sx={{
                  '& fieldset': { border: 'none' },
                  minWidth: 180,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isDark ? '#fff' : '#333',
                }}
              >
                <MenuItem value="All">Transaction option</MenuItem>
              </Select>
            </Box>

            <Button
              variant="contained"
              size="small"
              sx={{
                height: 40,
                px: 3,
                borderRadius: '6px',
                bgcolor: 'primary.main',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Filter
            </Button>
          </Stack>
        </Box>

        <Grid size={{ xs: 12, md: 9 }}>
          {/* Chart */}
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

        {/* Right: side stats */}
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
              Total Transaction Value
            </Typography>
            <SideStatRow
              label="Transaction Today"
              value="7,000,234.00"
              colorIndex={1}
              icon={IconCash}
            />
            <SideStatRow
              label="Transaction This Month"
              value="7,000,234.00"
              colorIndex={4}
              icon={IconCash}
            />
            <SideStatRow
              label="Transaction This Week"
              value="7,000,234.00"
              colorIndex={1}
              icon={IconCash}
            />
            <SideStatRow
              label="Transaction This Year"
              value="7,000,234.00"
              colorIndex={0}
              icon={IconCash}
            />
          </Box>
        </Grid>
      </Grid>
    </ReusableModal>
  );
};

export default TotalTransactionModal;
