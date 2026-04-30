import React from 'react';
import { Grid, Box, Typography, Stack, Tabs, Tab, Select, MenuItem, Card, useTheme } from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconSchool, IconChartBar, IconBuildingCommunity } from '@tabler/icons-react';

const TopCard = ({ label, value, icon: Icon, iconBg, valueColor }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{ p: 2.5, borderRadius: '12px', boxShadow: 'none', border: `1px solid ${isDark ? theme.palette.divider : '#f0f0f0'}`, bgcolor: isDark ? theme.palette.background.paper : '#fff', height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={valueColor} />
        </Box>
        <Box>
          <Typography fontWeight={800} sx={{ fontSize: '26px', color: valueColor, lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontWeight: 500 }}>{label}</Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const TotalSchoolModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = React.useState('1');
  const [year, setYear] = React.useState('2026');
  const [agent, setAgent] = React.useState('All');

  const chartOptions = {
    chart: {
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    colors: ['#3B82F6'],
    xaxis: {
      categories: tabValue === '1'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['Olusegun Obasanjo', 'Micheal Olusegun', 'Micheal Olusegun', 'Micheal Olusegun', 'Micheal Olusegun', 'Micheal Olusegun', 'Micheal Olusegun', 'Micheal Olusegun'],
      labels: { rotate: tabValue === '1' ? 0 : -45, style: { fontSize: '12px', colors: isDark ? '#aaa' : '#64748B' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Number of School', style: { color: isDark ? '#aaa' : '#64748B', fontWeight: 500 } },
      labels: { style: { colors: isDark ? '#aaa' : '#64748B' } },
    },
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  const chartSeries = [{
    name: 'Schools',
    data: tabValue === '1'
      ? [30, 35, 35, 35, 35, 35, 35, 35, 30, 0, 0, 0]
      : [30, 38, 38, 38, 38, 38, 38, 38],
  }];

  return (
    <StandardModal open={open} onClose={onClose} title="Total School" maxWidth="lg" padding={3} dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top stat cards — only 2 */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TopCard label="Total School" value="700" valueColor="#4a3aff" iconBg={isDark ? '#1e2a4a' : '#e8e6ff'} icon={IconSchool} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', boxShadow: 'none', border: `1px solid ${isDark ? theme.palette.divider : '#f0f0f0'}`, bgcolor: isDark ? theme.palette.background.paper : '#fff', height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" height="100%">
              <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: isDark ? '#2e0d1a' : '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconBuildingCommunity size={22} color="#e11d48" />
              </Box>
              <Box>
                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" spacing={4}>
                    <Typography variant="body2" sx={{ color: isDark ? '#aaa' : '#64748B' }}>Primary Sch -</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>34</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={4}>
                    <Typography variant="body2" sx={{ color: isDark ? '#aaa' : '#64748B' }}>Senior Sec</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: isDark ? '#fff' : '#1a1a1a' }}>34</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs + Filters row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" mb={2} spacing={1.5}>
        {/* Tabs left */}
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none', fontWeight: 600, minHeight: 40, fontSize: '13px',
              color: isDark ? '#aaa' : '#64748B',
              bgcolor: isDark ? '#2d2d2d' : '#F1F5F9',
              borderRadius: '6px',
              mr: 1,
              px: 2,
              '&.Mui-selected': { color: '#fff', bgcolor: 'primary.main' },
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><IconChartBar size={16} /><span>Overview</span></Stack>} value="1" />
          <Tab label={<Stack direction="row" spacing={1} alignItems="center"><IconSchool size={16} /><span>Agent Performance</span></Stack>} value="2" />
        </Tabs>

        {/* Filters right */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {tabValue === '2' && (
            <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '6px', bgcolor: isDark ? '#2d2d2d' : 'white', overflow: 'hidden' }}>
              <Select size="small" value={agent} onChange={(e) => setAgent(e.target.value)}
                renderValue={(v) => v === 'All' ? 'All Agents' : `Agent ${v}`}
                sx={{ '& fieldset': { border: 'none' }, minWidth: 140, fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#333' }}>
                <MenuItem value="All">All Agents</MenuItem>
                <MenuItem value="1">Agent 1</MenuItem>
              </Select>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '6px', bgcolor: isDark ? '#2d2d2d' : 'white', overflow: 'hidden' }}>
            <Select size="small" value={year} onChange={(e) => setYear(e.target.value)}
              renderValue={(v) => `Year ${v}`}
              sx={{ '& fieldset': { border: 'none' }, minWidth: 110, fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#333' }}>
              <MenuItem value="2026">2026</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
            </Select>
          </Box>
          <PrimaryButton sx={{ height: 40, px: 3, borderRadius: '6px' }}>
            Filter
          </PrimaryButton>
        </Stack>
      </Stack>

      {/* Chart */}
      <Box sx={{ p: 2, border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`, borderRadius: '10px', bgcolor: isDark ? '#1e1e1e' : 'white' }}>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </Box>
    </StandardModal>
  );
};

export default TotalSchoolModal;
