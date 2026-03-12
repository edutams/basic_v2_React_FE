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
} from '@mui/material';
import { useNavigate } from 'react-router';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import agentApi from '../../api/agent';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

// Agent Analytics Components
import AgentSubAgentsCard from '../agent/components/AgentSubAgentsCard';
import AgentRevenueCard from '../agent/components/AgentRevenueCard';
import AgentSchoolCard from '../agent/components/AgentSchoolCard';
import LoginActivitiesCard from '../agent/components/LoginActivitiesCard';
import { IconSchool, IconUsers, IconCurrencyNaira, IconChartBar } from '@tabler/icons-react';

// Charts
import ReusableBarChart from '../../components/shared/charts/ReusableBarChart';
import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';

// Agent Modals
import PlanDistributionModal from '../agent/components/PlanDistributionModal';
import LoggedInUsersModal from '../agent/components/LoggedInUsersModal';
import ViewUsersListModal from '../agent/components/ViewUsersListModal';
import TotalSchoolModal from '../agent/components/TotalSchoolModal';
import TotalTransactionModal from '../agent/components/TotalTransactionModal';

const columnHelper = createColumnHelper();

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Revenue Trend Mock Data
  const revenueSeries = [
    {
      name: 'Revenue',
      data: [3.0, 0.5, 0.2, 4.5, 4.0, 2.7, 6.0, 2.3, 0.5, 4.5, 4.0, 5.5],
    },
  ];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Plan Distribution Mock Data
  const planSeries = [65, 52, 39, 25];
  const planLabels = ['Basic', 'Basic+', 'Basic++', 'Basic+++'];

  const loginActivities = [
    { label: 'Teacher', value: 12 },
    { label: 'SPA', value: 45 },
    { label: 'Student', value: 23 },
    { label: 'Parent', value: 12 },
    { label: 'agents', value: 72 },
  ];

  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLoggedInUsersModalOpen, setIsLoggedInUsersModalOpen] = useState(false);
  const [isViewUsersListModalOpen, setIsViewUsersListModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedSchoolForUsers, setSelectedSchoolForUsers] = useState('');

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await agentApi.getAll();
        if (response.success) {
          // Map and take top 10
          const mappedData = response.data.slice(0, 10).map((agent) => ({
            s_n: agent.id,
            agentDetails: agent.name,
            organizationName: agent.org_name,
            imgsrc: agent.image,
            tenants_count: agent.tenants_count || 0,
            sub_agents_count: agent.children_count || 0,
            access_level: agent.access_level,
            phoneNumber: agent.phone,
            contactDetails: agent.email,
            status: agent.status
              ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
              : 'Inactive',
          }));
          setData(mappedData);
        }
      } catch (error) {
        console.error('Failed to fetch top performing agents', error);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(() => [
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
      header: () => 'Agent Details',
      cell: (info) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={info.row.original.imgsrc} alt={info.getValue()} width="35" />
          <Box>
            <Typography variant="h6" fontWeight="600">
              {info.row.original.organizationName}
            </Typography>
            <Typography color="textSecondary" variant="subtitle2">
              {info.getValue()}
            </Typography>
          </Box>
        </Stack>
      ),
    }),
    columnHelper.accessor('contactDetails', {
      header: () => 'Contact Details',
      cell: (info) => (
        <Stack direction="column" spacing={0} alignItems="flex-start">
          <Typography variant="subtitle2" fontWeight="600">
            {info.row.original.phoneNumber || 'N/A'}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            {info.getValue()}
          </Typography>
        </Stack>
      ),
    }),
    columnHelper.accessor('access_level', {
      header: () => 'Access Level',
      cell: (info) => {
        const level = Number(info.getValue());
        const colorMap = {
          1: { color: '#2ca87f', bg: '#e6f4ee' },
          2: { color: '#3949ab', bg: '#e8eaf6' },
          3: { color: '#f57c00', bg: '#fff3e0' },
        };
        const config = colorMap[level] || { color: '#757575', bg: '#f5f5f5' };
        return (
          <Chip
            size="small"
            label={`Level ${level}`}
            sx={{
              bgcolor: config.bg,
              color: config.color,
              fontWeight: 600,
              borderRadius: '8px',
            }}
          />
        );
      },
    }),
    columnHelper.accessor('performance', {
      header: () => 'Performance',
      cell: (info) => (
        <Stack
          direction="row"
          spacing={0}
          sx={{ borderRadius: '4px', overflow: 'hidden', border: '1px solid #e0e0e0', width: 'fit-content' }}
        >
          <Box sx={{ bgcolor: '#f4f4f4', px: 1, py: 0.5 }}>
            <Typography variant="caption" fontWeight="600" color="textSecondary">
              School
            </Typography>
          </Box>
          <Box sx={{ bgcolor: '#b4ebc2', px: 1, py: 0.5 }}>
            <Typography variant="caption" fontWeight="700" color="#333">
              {info.row.original.tenants_count ?? 0}
            </Typography>
          </Box>
        </Stack>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => 'Status',
      cell: (info) => (
        <Chip
          sx={{
            bgcolor:
              info.getValue() === 'Active'
                ? theme.palette.success.light
                : info.getValue() === 'Inactive'
                ? theme.palette.error.light
                : theme.palette.secondary.light,
            color:
              info.getValue() === 'Active'
                ? theme.palette.success.main
                : info.getValue() === 'Inactive'
                ? theme.palette.error.main
                : theme.palette.secondary.main,
            borderRadius: '8px',
          }}
          size="small"
          label={info.getValue()}
        />
      ),
    }),
  ], [theme]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageContainer title="Analytical Dashboard" description="this is Dashboard">
      <Box mt={3}>
        {/* Row 1: Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AgentSchoolCard
              title="Total School"
              value="123"
              icon={IconSchool}
              bgcolor="#C9EBD2"
              iconBgColor="#2ca87f"
              onClick={() => setIsSchoolModalOpen(true)}
              rightContent={
                <Stack spacing={0.5}>
                  {['Primary Sch', 'Junior Sec', 'Primary Sch', 'Primary Sch'].map((label, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ minWidth: 120 }}
                    >
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontWeight="600"
                        sx={{ fontSize: '14px', color: theme.palette.mode === 'dark' ? '#1E3A5F' : '#1E3A5F' }}
                      >
                        {label} -
                      </Typography>
                      <Typography
                        variant="caption"
                        color="error"
                        fontWeight="700"
                        sx={{ fontSize: '14px' }}
                      >
                        34
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AgentSubAgentsCard
              title="Total Sub Agents"
              value="36"
              icon={IconUsers}
              bgcolor="#E8F2F3"
              iconBgColor="#2ca87f"
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AgentRevenueCard
              title="Total Transaction Value"
              value="70,234.00"
              icon={IconCurrencyNaira}
              commission="100,000,000,000"
              volume="110,344,300,000"
              onClick={() => setIsTransactionModalOpen(true)}
            />
          </Grid>
        </Grid>

        {/* Row 2: Charts and Login Activities */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card
              sx={{
                p: 0,
                height: '100%',
                borderRadius: '12px',
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h5" fontWeight="600" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#4a3aff' }}>
                  Transaction
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Select size="small" value="Year" sx={{ minWidth: 100, height: '35px' }}>
                    <MenuItem value="Year">Year</MenuItem>
                  </Select>
                  <Select size="small" value="Bank" sx={{ minWidth: 100, height: '35px' }}>
                    <MenuItem value="Bank">Bank</MenuItem>
                  </Select>
                </Stack>
              </Box>
              {/* <Box sx={{ p: 2 }}> */}
                <ReusableBarChart
                  series={revenueSeries}
                  categories={months}
                  colors={['#3949ab']}
                  height={250}
                  yAxisPrefix="N"
                  yAxisFormatter={(val) => `${val.toFixed(1)}M`}
                  xAxisTitle="Month"
                />
              {/* </Box> */}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <LoginActivitiesCard
              title="Login Activities"
              activities={loginActivities}
              onIconClick={() => setIsLoggedInUsersModalOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 3 }}>
            <Card
              sx={{
                p: '24px !important',
                height: '100%',
                borderRadius: '12px',
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F' }}>
                  Plan Distribution
                </Typography>
                <Box
                  onClick={() => setIsPlanModalOpen(true)}
                  sx={{
                    bgcolor: '#454545',
                    p: 0.5,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#333' },
                  }}
                >
                  <IconChartBar size={20} color="white" />
                </Box>
              </Box>
              <ReusablePieChart
                series={planSeries}
                labels={planLabels}
                colors={['#ff4081', '#2196f3', '#ff80ab', '#b39ddb']}
                height={200}
              />
            </Card>
          </Grid>
        </Grid>

        {/* Row 3: Top Agents Table */}
        <Grid container spacing={3}>
          <Grid size={12}>
            <ParentCard
              title={
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
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
                    <Typography variant="h5">List of top 10 performing agent</Typography>
                  </Stack>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/agent')}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Go To Agent Manager
                  </Button>
                </Stack>
              }
            >
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
        onViewUserList={() => {
          setIsLoggedInUsersModalOpen(false);
          setIsViewUsersListModalOpen(true);
        }}
      />
      <ViewUsersListModal
        open={isViewUsersListModalOpen}
        onClose={() => setIsViewUsersListModalOpen(false)}
        schoolName={selectedSchoolForUsers}
      />
      <TotalSchoolModal open={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} />
      <TotalTransactionModal
        open={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </PageContainer>
  );
}
