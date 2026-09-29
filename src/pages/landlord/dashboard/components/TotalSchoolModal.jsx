import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  Select,
  MenuItem,
  useTheme,
  Skeleton,
} from '@mui/material';
import { IconSchool, IconUsers, IconLayoutDashboard } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import Chart from 'react-apexcharts';
import agentApi from '@/api/landlord/organizations/agent';

const SchoolsOverviewModal = ({ open, onClose, stats, organizationId }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [pendingYear, setPendingYear] = useState(String(new Date().getFullYear()));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchChartData = useCallback(async (selectedYear) => {
    setChartLoading(true);
    try {
      const params = { year: selectedYear };
      if (organizationId) {
        params.organizationId = organizationId;
      }
      const res = await agentApi.getSchoolChartData(params);
      if (res.status) {
        setChartData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch school chart data', e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchChartData(year);
    }
  }, [open, year, fetchChartData]);

  const handleFilter = () => {
    setYear(pendingYear);
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

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);

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
      zoom: { enabled: false },
      background: 'transparent',
    },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main],
    grid: { borderColor: theme.palette.mode === 'dark' ? '#444' : '#eee' },
    theme: { mode: theme.palette.mode },
    yaxis: {
      title: {
        text: 'Number of Schools',
        style: { colors: theme.palette.mode === 'dark' ? '#fff' : '#333' },
      },
    },
  };

  const overviewChartOptions = {
    ...baseChartOptions,
    xaxis: {
      categories: overviewCategories,
      labels: {
        rotate: 0,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      axisBorder: { show: true, color: theme.palette.mode === 'dark' ? '#444' : '#eee' },
      axisTicks: { show: false },
    },
  };

  const agentChartOptions = {
    ...baseChartOptions,
    xaxis: {
      categories: agentCategories.length > 0 ? agentCategories : ['No Data'],
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      axisBorder: { show: true, color: theme.palette.mode === 'dark' ? '#444' : '#eee' },
      axisTicks: { show: false },
    },
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Total School
        </Typography>
      }
    >
      <Box>
        {/* Stat summary cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3}>
          <Paper
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              width: { xs: '100%', sm: 320 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: theme.palette.primary.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSchool size={22} color={theme.palette.primary.main} />
            </Box>
            <Box>
              <Typography fontSize={26} fontWeight={700}>
                {stats?.totalSchools ?? 0}
              </Typography>
              <Typography fontSize={14} color="text.secondary">
                Total School
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              width: { xs: '100%', sm: 320 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#FDE4E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconSchool size={22} color="#EF4444" />
            </Box>
            <Stack spacing={0.5} width="100%">
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Active -</Typography>
                <Typography variant="h5">{stats?.activeSchools ?? 0}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Pending -</Typography>
                <Typography variant="h5">{stats?.pendingSchools ?? 0}</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          {/* TABS + FILTERS */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            mb={2}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 42 }}
            >
              <Tab
                value={0}
                icon={<IconLayoutDashboard size={18} />}
                iconPosition="start"
                label="Overview"
                sx={{ textTransform: 'none', minHeight: 42 }}
              />
              <Tab
                value={1}
                icon={<IconUsers size={18} />}
                iconPosition="start"
                label="Agent Performance"
                sx={{ textTransform: 'none', minHeight: 42 }}
              />
            </Tabs>

            <Stack direction="row" spacing={1.5} alignItems="center" mt={{ xs: 1.5, sm: 0 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#dcdcdc'}`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <Select
                  value={pendingYear}
                  onChange={(e) => setPendingYear(e.target.value)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{
                    background: theme.palette.mode === 'dark' ? '#333' : '#F5F5F5',
                    px: 1.2,
                    minWidth: 100,
                    height: 32,
                    color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                    '& .MuiSelect-select': { padding: '6px 20px 6px 6px !important' },
                  }}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      Year {y}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box
                component="button"
                onClick={handleFilter}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  px: 2,
                  py: 0.8,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { opacity: 0.9 },
                }}
              >
                Filter
              </Box>
            </Stack>
          </Stack>

          {/* CHART AREA */}
          <Box
            sx={{
              p: 3,
              background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
              minHeight: 350,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.palette.mode === 'dark' ? '#444' : '#eee'}`,
              borderRadius: 1,
            }}
          >
            {chartLoading ? (
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: 1, width: '100%' }} />
            ) : tab === 0 ? (
              <Box width="100%">
                <Chart
                  options={overviewChartOptions}
                  series={[{ name: 'Schools', data: overviewSeries }]}
                  type="bar"
                  height={300}
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
                    height={300}
                  />
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </ReusableModal>
  );
};

export default SchoolsOverviewModal;
