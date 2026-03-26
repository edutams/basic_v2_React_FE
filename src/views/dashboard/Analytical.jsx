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

// Shared reusable stat card
import DashboardStatCard from '../../components/shared/cards/DashboardStatCard';

// Agent Analytics Components
import LoginActivitiesCard from '../agent/components/LoginActivitiesCard';
import { IconSchool, IconListTree, IconSearch } from '@tabler/icons-react';
import { IconChartBar } from '@tabler/icons-react';

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
  const isDark = theme.palette.mode === 'dark';

  // Revenue Trend Mock Data
  const revenueSeries = [
    { name: 'Revenue', data: [3.0, 0.5, 0.2, 4.5, 4.0, 2.7, 6.0, 2.3, 0.5, 4.5, 4.0, 5.5] },
  ];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Plan Distribution Mock Data
  const planSeries = [65, 52, 39, 25];
  const planLabels = ['Freemium', 'Basic', 'Basic+', 'Basic++'];

  const loginActivities = [
    { label: 'Teacher', value: 12 },
    { label: 'SPA', value: 45 },
    { label: 'Student', value: 23 },
    { label: 'Parent', value: 12 },
    { label: 'Agents', value: 72 },
  ];

  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLoggedInUsersModalOpen, setIsLoggedInUsersModalOpen] = useState(false);
  const [isViewUsersListModalOpen, setIsViewUsersListModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedSchoolForUsers] = useState('');

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
        if (response.success) {
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
            primaryColor: agent.primary_color || '#4a3aff',
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
              sx={{ width: 36, height: 36, fontSize: '12px', fontWeight: 700, bgcolor: '#3949ab', flexShrink: 0 }}
            >
              {!agent.imgsrc && initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.3 }}>
                {agent.organizationName}
              </Typography>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', lineHeight: 1.4 }}>
                {agent.phoneNumber || 'N/A'} | Region
              </Typography>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', lineHeight: 1.4 }}>
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
        <Typography variant="subtitle2" fontWeight="500" color="textSecondary">-</Typography>
      ),
    }),
    columnHelper.accessor('sub_agents_count', {
      header: () => 'Sub Agent',
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
          sx={{ borderRadius: '6px', overflow: 'hidden',fontWeight:"800", width: 'fit-content' }}
        >
          <Box sx={{ px: 1.5, py: 0.5 }}>
            <Typography  variant="subtitle3" fontWeight="800" color="#333333">School</Typography>
          </Box>
          <Box sx={{ bgcolor: '#3949ab', px: 1.5, py: 0.5 }}>
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
        const color = info.getValue() || '#3949ab';
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
              info.getValue() === 'Active' ? '#dcfee6'
              : info.getValue() === 'Inactive' ? '#ffe4e6'
              : '#f3f4f6',
            color:
              info.getValue() === 'Active' ? '#16a34a'
              : info.getValue() === 'Inactive' ? '#e11d48'
              : '#4b5563',
            borderRadius: '6px',
            fontWeight: 600,
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
        {/* Row 1: Stat Cards — new design */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardStatCard
              title="Total School"
              value="459"
              valueColor="#4a3aff"
              valueBg={isDark ? '#1e2a4a' : '#EEF2FF'}
              subStats={[
                { label: 'Primary School', value: '300' },
                { label: 'Senior Secondary', value: '30' },
              ]}
              onIconClick={() => setIsSchoolModalOpen(true)}
              onClick={() => setIsSchoolModalOpen(true)}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardStatCard
              title="Total Transaction Value"
              value="₦7,000,234.00"
              valueColor="#2ca87f"
              valueBg={isDark ? '#0d2e1e' : '#E6F7F1'}
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
              title="Total Sub Agents"
              value="32"
              valueColor="#f59e0b"
              valueBg={isDark ? '#2e1e00' : '#FEF3C7'}
              subStats={[
                { label: 'Lv2', value: '35' },
                { label: 'Lv3', value: '32' },
                { label: 'Lv4', value: '21' },
                { label: 'Lv5', value: '43' },
              ]}
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
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600" sx={{ color: isDark ? '#fff' : '#4a3aff' }}>
                  Transaction
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Select size="small" value="year" sx={{ minWidth: 100, height: '35px' }}>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                  <Select size="small" value="gateway" sx={{ minWidth: 100, height: '35px' }}>
                    <MenuItem value="gateway">Gateway</MenuItem>
                  </Select>
                </Stack>
              </Box>
              <ReusableBarChart
                series={revenueSeries}
                categories={months}
                colors={['#3949ab']}
                height={250}
                yAxisPrefix="N"
                yAxisFormatter={(val) => `${val.toFixed(1)}M`}
                xAxisTitle="Month"
              />
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: isDark ? '#fff' : '#1E3A5F' }}>
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
                colors={['#3949ab', '#2196f3', '#ff4081', '#9c27b0']}
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
                    <Typography variant="h5">List of Agents</Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/agent')}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      bgcolor: '#DCE0F0',
                      color: '#4E67CE',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#c8cfe8', boxShadow: 'none' },
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
                  mt: 2,
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: isDark ? theme.palette.background.default : '#f8fafc',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
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
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#4a3aff',
                      color: '#fff',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 3,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#3929ee', boxShadow: 'none' },
                    }}
                  >
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
