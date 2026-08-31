import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  Chip,
  useTheme,
  Card,
  Select,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import agentApi from '@/api/landlord/organizations/agent';
import activityLogApi from '@/api/landlord/activity-log/activityLogApi';
// import { getStatCardColor } from '@/utils/statCardColors';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

// Shared reusable stat card
import DashboardStatCard from '@/components/shared/cards/DashboardStatCard';

// Agent Analytics Components
import { IconSchool, IconListTree, IconSearch } from '@tabler/icons-react';
import { IconChartBar } from '@tabler/icons-react';

// Agent Modals
import PlanDistributionModal from '@/pages/landlord/views/agent/components/PlanDistributionModal';
import LoggedInUsersModal from '@/pages/landlord/views/agent/components/LoggedInUsersModal';
import ViewUsersListModal from '@/pages/landlord/views/agent/components/ViewUsersListModal';
import TotalSchoolModal from '@/pages/landlord/views/agent/components/TotalSchoolModal';
import TotalTransactionModal from '@/pages/landlord/views/agent/components/TotalTransactionModal';
import TotalSubAgentModal from '@/pages/landlord/views/agent/components/TotalSubAgentModal';

const columnHelper = createColumnHelper();

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  // Revenue Trend Mock Data
  const revenueSeries = [
    { name: 'Revenue', data: [3.0, 0.5, 0.2, 4.5, 4.0, 2.7, 6.0, 2.3, 0.5, 4.5, 4.0, 5.5] },
  ];
  const months = [
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

  // Plan Distribution Mock Data
  const planSeries = [65, 52, 39, 25];
  const planLabels = ['Freemium', 'Basic', 'Basic+', 'Basic++'];



  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLoggedInUsersModalOpen, setIsLoggedInUsersModalOpen] = useState(false);
  const [isViewUsersListModalOpen, setIsViewUsersListModalOpen] = useState(false);
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState(null);
  const [selectedUserFilters, setSelectedUserFilters] = useState(null);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSubAgentModalOpen, setIsSubAgentModalOpen] = useState(false);
  const [selectedSchoolForUsers] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [loginActivities, setLoginActivities] = useState([]);
  const [loginActivitiesLoading, setLoginActivitiesLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    const fetchLoginActivities = async () => {
      try {
        const res = await activityLogApi.getLoginActivities30Days();
        if (res.status) setLoginActivities(res.data);
      } catch (e) {
        console.error('Failed to fetch login activities', e);
      } finally {
        setLoginActivitiesLoading(false);
      }
    };
    fetchLoginActivities();
  }, []);

  // Table filter states
  const [searchName, setSearchName] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterGateway, setFilterGateway] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await agentApi.getAll();
        const paginator = response.status === true ? response.data : response;
        const agentsArray = paginator.data || [];

        if (agentsArray.length > 0) {
          const mappedData = agentsArray.slice(0, 10).map((agent) => ({
            s_n: agent.id,
            agentDetails: agent.organization_name || agent.name,
            organizationName: agent.organization_name || agent.org_name,
            imgsrc: agent.organization_logo || agent.image,
            tenants_count: agent.tenants_count || 0,
            sub_agents_count: agent.sub_organizations_count || agent.children_count || 0,
            access_level: agent.access_level,
            phoneNumber: agent.organization_phone || agent.phone,
            contactDetails: agent.organization_email || agent.email,
            primaryColor: agent.primary_color || '#4a3aff',
            status: agent.status
              ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
              : 'Inactive',
            tenants: agent.tenants || [],
          }));
          setData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch top performing agents', error);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 's_n',
        header: () => 'S/N',
        cell: (info) => (
          <Typography color="textSecondary" variant="h6" fontWeight="400">
            {info.row.index + 1}
          </Typography>
        ),
      }),
      columnHelper.accessor('agentDetails', {
        header: () => 'Organization Details',
        cell: (info) => {
          const agent = info.row.original;
          const initials = (agent.organizationName || 'NA')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar
                src={agent.imgsrc}
                alt={agent.organizationName}
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '12px',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {!agent.imgsrc && initials}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.3 }}>
                  {agent.organizationName}
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="caption"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {agent.phoneNumber || 'N/A'} | Region
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="caption"
                  sx={{ display: 'block', lineHeight: 1.4 }}
                >
                  {info.getValue()}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      columnHelper.display({
        id: 'gateway',
        header: () => 'Gateway',
        cell: () => (
          <Typography variant="subtitle2" fontWeight="500" color="textSecondary">
            -
          </Typography>
        ),
      }),
      columnHelper.accessor('sub_agents_count', {
        header: () => 'Sub Org.',
        cell: (info) => (
          <Box
            sx={{
              bgcolor: '#ede9fe',
              color: '#6d28d9',
              borderRadius: '20px',
              px: 2,
              py: 0.4,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              minWidth: '36px',
            }}
          >
            {info.getValue() ?? 0}
          </Box>
        ),
      }),
      columnHelper.accessor('performance', {
        header: () => 'Performance',
        cell: (info) => (
          <Stack
            direction="row"
            spacing={0}
            sx={{
              borderRadius: '6px',
              overflow: 'hidden',
              fontWeight: '800',
              width: 'fit-content',
            }}
          >
            <Box sx={{ px: 1.5, py: 0.5 }}>
              <Typography variant="subtitle3" fontWeight="800" color="#333333">
                School
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'primary.main', px: 1.5, py: 0.5 }}>
              <Typography variant="caption" fontWeight="700" sx={{ color: '#fff' }}>
                {info.row.original.tenants_count ?? 0}
              </Typography>
            </Box>
          </Stack>
        ),
      }),
      columnHelper.accessor('primaryColor', {
        header: () => 'Primary Color',
        cell: (info) => {
          const color = info.getValue() || theme.palette.primary.main;
          return (
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: color,
                border: '2px solid rgba(255,255,255,0.8)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
              }}
            />
          );
        },
      }),
      columnHelper.accessor('status', {
        header: () => 'Status',
        cell: (info) => (
          <Chip
            sx={{
              bgcolor:
                info.getValue() === 'active'
                  ? '#dcfee6'
                  : info.getValue() === 'inactive'
                    ? '#ffe4e6'
                    : '#f3f4f6',
              color:
                info.getValue() === 'active'
                  ? '#16a34a'
                  : info.getValue() === 'inactive'
                    ? '#e11d48'
                    : '#4b5563',
              borderRadius: '6px',
              fontWeight: 600,
            }}
            size="small"
            label={info.getValue()}
          />
        ),
      }),
    ],
    [theme],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageContainer title="Analytical Dashboard" description="this is Dashboard">
      <Box mt={1.5}>
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardStatCard
              title="Total School"
              value={analyticsLoading ? '...' : String(analytics?.totalSchools ?? 0)}
              colorIndex={0}
              subStats={[
                {
                  label: 'Approved',
                  value: analyticsLoading ? '...' : String(analytics?.activeSchools ?? 0),
                },
                {
                  label: 'Pending',
                  value: analyticsLoading ? '...' : String(analytics?.pendingSchools ?? 0),
                },
                {
                  label: 'Rejected',
                  value: analyticsLoading ? '...' : String(analytics?.rejectedSchools ?? 0),
                },
              ]}
              onIconClick={() => setIsSchoolModalOpen(true)}
              onClick={() => setIsSchoolModalOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardStatCard
              title="Total Transaction Value"
              value="₦7,000,234.00"
              colorIndex={1}
              subStats={[
                { label: 'Commission', value: '₦100,000,000' },
                { label: 'Volume', value: '304,043,000' },
              ]}
              onIconClick={() => setIsTransactionModalOpen(true)}
              onClick={() => setIsTransactionModalOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardStatCard
              title="Total Organization"
              value={analyticsLoading ? '...' : String(analytics?.totalSubAgents ?? 0)}
              colorIndex={2}
              subStats={[
                {
                  label: 'Lv2',
                  value: analyticsLoading ? '...' : String(analytics?.subAgentLevels?.lv2 ?? 0),
                },
                {
                  label: 'Lv3',
                  value: analyticsLoading ? '...' : String(analytics?.subAgentLevels?.lv3 ?? 0),
                },
                {
                  label: 'Lv4',
                  value: analyticsLoading ? '...' : String(analytics?.subAgentLevels?.lv4 ?? 0),
                },
                {
                  label: 'Lv5',
                  value: analyticsLoading ? '...' : String(analytics?.subAgentLevels?.lv5 ?? 0),
                },
              ]}
              onIconClick={() => setIsSubAgentModalOpen(true)}
              onClick={() => setIsSubAgentModalOpen(true)}
            />
          </Grid>
        </Grid>

        {/* Row 2: Charts and Login Activities */}
        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card
              sx={{
                p: 0,
                height: '100%',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="600"
                  sx={{ color: 'text.secondary' }}
                >
                  Transaction
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Select
                    size="small"
                    value="year"
                    sx={{
                      minWidth: 100,
                      height: '35px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                      borderRadius: '8px',
                      color: isDark ? '#fff' : 'inherit',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)',
                      },
                      '& .MuiSelect-icon': {
                        color: isDark ? '#fff' : 'inherit',
                      },
                    }}
                  >
                    <MenuItem value="year">Year</MenuItem>
                  </Select>

                  <Select
                    size="small"
                    value="gateway"
                    sx={{
                      minWidth: 100,
                      height: '35px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                      borderRadius: '8px',
                      color: isDark ? '#fff' : 'inherit',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)',
                      },
                      '& .MuiSelect-icon': {
                        color: isDark ? '#fff' : 'inherit',
                      },
                    }}
                  >
                    <MenuItem value="gateway">Gateway</MenuItem>
                  </Select>
                </Stack>
              </Box>
              <Box
                sx={{
                  background: 'transparent',
                  '& .apexcharts-canvas': {
                    background: 'transparent !important',
                  },
                  '& .apexcharts-svg': {
                    background: 'transparent !important',
                  },
                }}
              >
                <Chart
                  options={{
                    chart: {
                      type: 'bar',
                      fontFamily: "'Plus Jakarta Sans', sans-serif;",
                      foreColor: '#adb0bb',
                      toolbar: { show: false },
                      zoom: { enabled: false },
                      background: 'transparent',
                    },
                    // colors: [getStatCardColor(null, 3, isDark, theme).accentColor],
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: '45%',
                        distributed: false,
                      },
                    },
                    dataLabels: { enabled: false },
                    legend: { show: false },
                    grid: {
                      borderColor: 'rgba(0,0,0,0.1)',
                      strokeDashArray: 3,
                      xaxis: { lines: { show: false } },
                      yaxis: { lines: { show: true } }
                    },
                    xaxis: {
                      categories: months,
                      axisBorder: { show: false },
                      title: {
                        text: 'Month',
                        style: { color: '#adb0bb', fontWeight: 400 }
                      }
                    },
                    yaxis: {
                      labels: {
                        show: true,
                        formatter: (val) => `N${val.toFixed(1)}M`,
                      },
                    },
                    tooltip: {
                      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                    },
                  }}
                  series={revenueSeries}
                  type="bar"
                  height={250}
                  width="100%"
                />
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <Card
              sx={{
                p: 0,
                height: '100%',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box sx={{ p: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ color: 'text.secondary' }}
                  >
                    Login Activities (30 days)
                  </Typography>
                  <Box
                    onClick={() => setIsLoggedInUsersModalOpen(true)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#F3E8FF',
                      color: isDark ? '#ffffff' : '#9333EA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.85 },
                    }}
                  >
                    <IconChartBar size={18} color="currentColor" />
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ flex: 1 }}>
                  {(loginActivitiesLoading
                    ? [{ label: 'Loading...', value: '...' }]
                    : loginActivities
                  )?.map((activity, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="h5"
                        fontWeight="500"
                        sx={{
                          color: isDark ? '#fff' : '#1a1a1a',
                          fontSize: '18px'
                        }}
                      >
                        {activity.label}:
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="600"
                        sx={{
                          fontSize: '20px'
                        }}
                      >
                        {activity.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                p: '10px !important',
                height: '100%',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  sx={{ color: 'text.secondary' }}
                >
                  Plan Distribution
                </Typography>
                <Box
                  onClick={() => setIsPlanModalOpen(true)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#FEF3C7',
                    color: isDark ? '#ffffff' : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.85 },
                  }}
                >
                  <IconChartBar size={18} color="currentColor" />
                </Box>
              </Box>
              <Box
                sx={{
                  '& .apexcharts-canvas': {
                    background: 'transparent !important',
                  },
                  '& .apexcharts-svg': {
                    background: 'transparent !important',
                  },
                }}
              >
                <Chart
                  options={{
                    chart: {
                      type: 'donut',
                      fontFamily: "'Plus Jakarta Sans', sans-serif;",
                      foreColor: theme.palette.text.secondary,
                      toolbar: { show: false },
                      background: 'transparent',
                    },
                    labels: planLabels,
                    colors: [
                      "#ff1804",
                      '#2196f3',
                      '#ff4081',
                      '#9c27b0'
                    ],
                    plotOptions: {
                      pie: {
                        donut: {
                          size: '50%',
                          background: 'transparent',
                        },
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: function (val) {
                        return val.toFixed(0) + '%';
                      },
                      style: {
                        fontSize: '10px',
                        fontWeight: '600',
                        colors: ['#ffffff'],
                      },
                      dropShadow: { enabled: false },
                    },
                    stroke: { show: false },
                    legend: {
                      show: true,
                      position: 'right',
                      horizontalAlign: 'center',
                      floating: false,
                      fontSize: '12px',
                      fontWeight: '600',
                      labels: { colors: theme.palette.text.secondary },
                      itemMargin: { horizontal: 5, vertical: 5 },
                    },
                    tooltip: {
                      theme: theme.palette.mode,
                      fillSeriesColor: false,
                    },
                  }}
                  series={planSeries}
                  type="donut"
                  height={200}
                  width="100%"
                />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Row 3: Top Agents Table */}
        <Grid container spacing={1.5}>
          <Grid size={12}>
            <ParentCard
              title={
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: '#2ca87f',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <IconSchool size={16} />
                    </Box>
                    <Typography variant="h5">Agent Performance</Typography>
                  </Stack>
                  <Button variant="contained" size="small" onClick={() => navigate('/agent/organization')}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: theme.palette.primary.light, boxShadow: 'none' },
                    }}
                  >
                    <IconListTree size={16} />
                    View All
                  </Button>
                </Stack>
              }
            >
              <Box
                sx={{
                  mt: 1,
                  p: 0.75,
                  borderRadius: '8px',
                  bgcolor: isDark ? theme.palette.background.default : '#f8fafc',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  flexWrap="wrap"
                >
                  <TextField
                    size="small"
                    placeholder="Search by Name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={16} color="#888" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                  <Select
                    size="small"
                    displayEmpty
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="">Agent Levels</MenuItem>
                    <MenuItem value="1">Level 1</MenuItem>
                    <MenuItem value="2">Level 2</MenuItem>
                    <MenuItem value="3">Level 3</MenuItem>
                  </Select>
                  <Select
                    size="small"
                    displayEmpty
                    value={filterGateway}
                    onChange={(e) => setFilterGateway(e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="">Gateway</MenuItem>
                    <MenuItem value="skoolpay">Skoolpay</MenuItem>
                  </Select>
                  <Select
                    size="small"
                    displayEmpty
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                  <Button variant="contained" size="small" sx={{ borderRadius: '8px', textTransform: 'none', px: 3, boxShadow: 'none', }}>
                    Filter
                  </Button>
                </Stack>
              </Box>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id}>
                            <Typography variant="h6">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} hover>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ParentCard>
          </Grid>
        </Grid>
      </Box>

      {/* Agent Modals */}
      <PlanDistributionModal open={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      <LoggedInUsersModal
        open={isLoggedInUsersModalOpen}
        onClose={() => setIsLoggedInUsersModalOpen(false)}
        onViewUserList={(row, filters) => {
          setSelectedTenantForUsers(row);
          setSelectedUserFilters(filters);
          setIsViewUsersListModalOpen(true);
        }}
        stats={loginActivities}
      />
      <ViewUsersListModal
        open={isViewUsersListModalOpen}
        onClose={() => setIsViewUsersListModalOpen(false)}
        schoolId={selectedTenantForUsers?.id}
        schoolName={selectedTenantForUsers?.school}
        filters={selectedUserFilters}
      />
      <TotalSchoolModal
        open={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        stats={analytics}
      />
      <TotalTransactionModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
      <TotalSubAgentModal
        open={isSubAgentModalOpen}
        onClose={() => setIsSubAgentModalOpen(false)}
        orgId={analytics?.orgId}
      />
    </PageContainer>
  );
}
