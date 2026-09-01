import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Card,
  useTheme,
  Skeleton,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { IconSchool, IconChartBar, IconBuildingCommunity } from '@tabler/icons-react';
import agentApi from '@/api/landlord/organizations/agent';
const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
];

const TopCard = ({ label, value, icon: Icon, colorIndex = 0 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[colorIndex % schemeMap.length];

  return (
    <Card
      elevation={0}
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
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <Typography
            fontWeight={800}
            sx={{ fontSize: '20px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.1 }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: isDark ? 'rgba(255,255,255,.72)' : '#64748B', fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const TotalSchoolModal = ({ open, onClose, stats, refreshKey, organizationId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = useState('1');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [agent, setAgent] = useState('All');

  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [pendingYear, setPendingYear] = useState(year);
  const [allAgents, setAllAgents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchChartData = useCallback(async (selectedYear, selectedAgent = null) => {
    setChartLoading(true);
    try {
      const params = { year: selectedYear };
      if (organizationId) {
        params.organizationId = organizationId;
      }
      const res = await agentApi.getSchoolChartData(params);
      if (res.status) {
        setChartData(res.data);
        // Store all agents for the select options
        setAllAgents(res.data.agentPerformance || []);
      }
    } catch (e) {
      console.error('Failed to fetch school chart data', e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchFilteredChartData = useCallback(async (selectedYear, selectedAgent = null) => {
    setChartLoading(true);
    try {
      const params = { year: selectedYear };
      if (selectedAgent && selectedAgent !== 'All') {
        params.agent = selectedAgent;
      }
      if (organizationId) {
        params.organizationId = organizationId;
      }
      const res = await agentApi.getSchoolChartData(params);
      if (res.status) {
        setChartData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch filtered school chart data', e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Fetch analytics for TotalSchoolModal
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await agentApi.getAnalytics();
        if (res.status) setAnalytics(res.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey]);

  // Fetch initial data when modal opens
  useEffect(() => {
    if (open) {
      fetchChartData(year);
    }
  }, [open, year, fetchChartData]);

  const handleFilter = () => {
    setYear(pendingYear);
    // Fetch filtered data only when filter button is clicked
    fetchFilteredChartData(pendingYear, agent);
  };

  const overviewCategories = chartData?.months || [
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
  ];
  const overviewSeries = chartData?.overview || Array(12).fill(0);

  const agentCategories = (chartData?.agentPerformance || []).map((a) => a.name);
  const agentSeries = (chartData?.agentPerformance || []).map((a) => a.count);

  const baseChartOptions = {
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
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main],
    grid: { borderColor: isDark ? '#333' : '#f1f1f1', strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    yaxis: {
      title: {
        text: 'Number of Schools',
        style: { color: isDark ? '#aaa' : '#64748B', fontWeight: 500 },
      },
      labels: { style: { colors: isDark ? '#aaa' : '#64748B' } },
    },
  };

  const overviewChartOptions = {
    ...baseChartOptions,
    xaxis: {
      categories: overviewCategories,
      labels: { rotate: 0, style: { fontSize: '12px', colors: isDark ? '#aaa' : '#64748B' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
  };

  const agentChartOptions = {
    ...baseChartOptions,
    xaxis: {
      categories: agentCategories.length > 0 ? agentCategories : ['No Data'],
      labels: { rotate: -45, style: { fontSize: '12px', colors: isDark ? '#aaa' : '#64748B' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total School"
      maxWidth="lg"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      {/* Top stat cards */}
      <Grid container spacing={2} mb={3} mt={3}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TopCard
            label="Total School"
            value={stats?.totalSchools ?? 0}
            icon={IconSchool}
            colorIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TopCard
            label="Approved Schools"
            value={stats?.activeSchools ?? 0}
            icon={IconBuildingCommunity}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TopCard
            label="Pending Schools"
            value={stats?.pendingSchools ?? 0}
            icon={IconBuildingCommunity}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TopCard
            label="Rejected Schools"
            value={stats?.rejected ?? stats?.rejectedSchools ?? 0}
            icon={IconBuildingCommunity}
            colorIndex={4}
          />
        </Grid>
      </Grid>

      {/* Tabs + Filters row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        mb={2}
        spacing={1.5}
      >
        {/* Tabs left */}
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 40,
              fontSize: '13px',
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
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <IconChartBar size={16} />
                <span>Overview</span>
              </Stack>
            }
            value="1"
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <IconSchool size={16} />
                <span>Agent Performance</span>
              </Stack>
            }
            value="2"
          />
        </Tabs>

        {/* Filters right */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {tabValue === '2' && (
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
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                renderValue={(v) => (v === 'All' ? 'All Agents' : `Agent ${v}`)}
                sx={{
                  '& fieldset': { border: 'none' },
                  minWidth: 140,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isDark ? '#fff' : '#333',
                }}
              >
                <MenuItem value="All">All Agents</MenuItem>
                {allAgents.map((a, i) => (
                  <MenuItem key={i} value={a.name}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
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
              value={pendingYear}
              onChange={(e) => setPendingYear(e.target.value)}
              renderValue={(v) => `Year ${v}`}
              sx={{
                '& fieldset': { border: 'none' },
                minWidth: 110,
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#333',
              }}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <PrimaryButton sx={{ height: 40, px: 3, borderRadius: '6px' }} onClick={handleFilter}>
            Filter
          </PrimaryButton>
        </Stack>
      </Stack>

      {/* Chart */}
      <Box
        sx={{
          p: 2,
          border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
          borderRadius: '10px',
          bgcolor: isDark ? '#1e1e1e' : 'white',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {chartLoading ? (
          <Skeleton variant="rounded" height={350} sx={{ borderRadius: 1, width: '100%' }} />
        ) : tabValue === '1' ? (
          <Box width="100%">
            <Chart
              options={overviewChartOptions}
              series={[{ name: 'Schools', data: overviewSeries }]}
              type="bar"
              height={350}
            />
          </Box>
        ) : (
          <Box width="100%">
            {agentCategories.length === 0 ? (
              <Typography align="center" color="text.secondary" py={6}>
                No agent performance data for {year}.
              </Typography>
            ) : (
              <Chart
                options={agentChartOptions}
                series={[{ name: 'Schools', data: agentSeries }]}
                type="bar"
                height={350}
              />
            )}
          </Box>
        )}
      </Box>
    </StandardModal>
  );
};

export default TotalSchoolModal;
