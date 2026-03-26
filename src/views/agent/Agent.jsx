import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from '../../context/AgentContext/auth';

import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button,
  Badge,
  Card,
  useTheme,
  TablePagination,
} from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';
import AgentModal from '../../components/add-agent/components/AgentModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import EmptyTableState from '../../components/shared/EmptyTableState';
import useTableEmptyState from '../../hooks/useTableEmptyState';
import agentApi from '../../api/agent';

import HowToRegIcon from '@mui/icons-material/HowToReg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { IconUsers, IconSchool, IconCurrencyNaira, IconChartBar } from '@tabler/icons-react';

import DashboardStatCard from '../../components/shared/cards/DashboardStatCard';
import AgentSubAgentsCard from './components/AgentSubAgentsCard';
import AgentRevenueCard from './components/AgentRevenueCard';
import AgentSchoolCard from './components/AgentSchoolCard';
import LoginActivitiesCard from './components/LoginActivitiesCard';
import PlanDistributionModal from './components/PlanDistributionModal';
import LoggedInUsersModal from './components/LoggedInUsersModal';
import ViewUsersListModal from './components/ViewUsersListModal';
import TotalSchoolModal from './components/TotalSchoolModal';
import TotalTransactionModal from './components/TotalTransactionModal';
import ReusableBarChart from '../../components/shared/charts/ReusableBarChart';
import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Agent',
  },
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const columnHelper = createColumnHelper();

import locationApi from '../../api/location';

const Agent = () => {
  const { user, impersonateAgent } = useContext(AuthContext);
  const theme = useTheme();

  // Revenue Trend Mock Data
  const revenueSeries = [
    {
      name: 'Revenue',
      data: [3.0, 0.5, 0.2, 4.5, 4.0, 2.7, 6.0, 2.3, 0.5, 4.5, 4.0, 5.5],
    },
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

  const [agentLevel, setAgentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [status, setStatus] = useState('');

  // Modal States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLoggedInUsersModalOpen, setIsLoggedInUsersModalOpen] = useState(false);
  const [isViewUsersListModalOpen, setIsViewUsersListModalOpen] = useState(false);
  const [selectedSchoolForUsers, setSelectedSchoolForUsers] = useState('');
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const loginActivities = [
    { label: 'Teacher', value: 12 },
    { label: 'SPA', value: 45 },
    { label: 'Student', value: 23 },
    { label: 'Parent', value: 12 },
  ];
  // const [referer, setReferer] = useState(''); // Removed
  const [search, setSearch] = useState('');

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const navigate = useNavigate();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalAgents: 0,
    totalSubAgents: 0,
    totalSchools: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          state: state || undefined,
          lga: lga || undefined,
          status: status || undefined,
          search: search || undefined,
          access_level: agentLevel || undefined,
          page: page + 1, // Laravel paginates 1-indexed, MUI is 0-indexed
          per_page: rowsPerPage,
        };
        const response = await agentApi.getAll(params);
        if (response.success) {
          const mappedData = response.data.map((agent, index) => {
            let parsedColor = agent.color;
            if (typeof agent.color === 'string') {
              try {
                parsedColor = JSON.parse(agent.color);
              } catch (e) {
                console.error('Error parsing color JSON', e);
                parsedColor = {};
              }
            }

            return {
              s_n: index + 1,
              id: agent.id,
              // agentDetails: agent.name,
              organizationName: agent.org_name,
              // organizationTitle: agent.org_title,
              contactDetails: agent.email,
              phoneNumber: agent.phone,
              contactAddress: agent.address,
              imgsrc: agent.image,
              performance: 'School: ' + (agent.tenants_count || 0),
              tenants_count: agent.tenants_count || 0,
              sub_agents_count: agent.children_count || 0,
              access_level: agent.access_level,
              headerColor: parsedColor?.headcolor,
              sidebarColor: parsedColor?.sidecolor,
              bodyColor: parsedColor?.bodycolor,
              status: agent.status
                ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
                : 'Inactive',
              lga: agent.lga_id,
              state_name: agent.state_name,
              state_id: agent.state_id,
              lga_name: agent.lga_name,
              lga_id: agent.lga_id,
            };
          });
          setData(mappedData);

          if (response.meta) {
            setTotalRows(response.meta.total || 0);
          }

          if (response.analytics) {
            setAnalytics({
              totalAgents: response.analytics.totalAgents || 0,
              totalSubAgents: response.analytics.totalSubAgents || 0,
              totalSchools: response.analytics.totalSchools || 0,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch agents', error);
      }
    };
    fetchData();
  }, [refreshKey, page, rowsPerPage]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const [hasFiltered, setHasFiltered] = useState(false);

  const applyFilters = () => {
    setPage(0); // Reset to first page
    setRefreshKey((prev) => prev + 1);
    setHasFiltered(true);
  };

  // Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await locationApi.getStates();
        setStates(response);
      } catch (error) {
        console.error('Failed to fetch states', error);
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when State changes
  useEffect(() => {
    setLga('');
    const fetchLgas = async () => {
      if (state) {
        try {
          // Find state object to get ID if state is stored as name, or use state directly if ID
          // The API likely returns objects with id and name.
          // The filters currently use state name (string).
          // Verify what locationApi returns. Assume it returns list of objects {id, name...}.
          // Based on previous code, state filter uses names.
          const selectedState = states.find((s) => (s.stname || s.name) === state);
          if (selectedState) {
            const response = await locationApi.getLgas(selectedState.id);
            setLgas(response);
          } else {
            setLgas([]);
          }
        } catch (error) {
          console.error('Failed to fetch LGAs', error);
          setLgas([]);
        }
      } else {
        setLgas([]);
        setLga('');
      }
    };
    fetchLgas();
  }, [state, states]);

  const hasActiveFilters = useMemo(() => {
    return agentLevel || country || state || lga || search;
  }, [agentLevel, country, state, lga, search]);

  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  const emptyState = useTableEmptyState(filteredData, hasActiveFilters, !!search, search, {
    defaultMessage: 'No agents found',
    defaultDescription:
      "No agents have been registered yet. Click 'Register Agent' to add your first agent.",
    filterMessage: 'No agents match your filters',
    filterDescription:
      'No agents match your current filters. Try adjusting your search criteria or clearing the filters.',
    searchMessage: `No agents found for "${search}"`,
    searchDescription: 'Try adjusting your search terms or clearing the search to see all agents.',
  });

  const handleAddAgent = (newAgent) => {
    setData((prevData) => [...prevData, newAgent]);
    // console.log('New Agent Added:', newAgent);

    setHeaderColor(newAgent.headerColor);
    setSidebarColor(newAgent.sidebarColor);
    setBodyColor(newAgent.bodyColor);
  };

  const handleRefresh = (newData) => {
    setData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.s_n === newData.s_n);

      if (existingIndex !== -1) {
        const updatedData = [...prevData];
        updatedData[existingIndex] = newData;
        return updatedData;
      } else {
        return [...prevData, newData];
      }
    });
    setRefreshKey((prevData) => prevData + 1);
  };

  const handleUpdateAgent = (agentData, actionType) => {
    // console.log('Selected Agent Data:', agentData);
    setSelectedAgent(agentData);
    setActionType(actionType);
    setIsModalOpen(true);
  };

  const handleViewSchools = (agentData) => {
    // console.log('Selected Agent Data:', agentData);
    setSelectedAgent(agentData);
    setActionType('viewSchools');
    setIsModalOpen(true);
  };

  const handleManagePermissions = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('managePermissions');
    setIsModalOpen(true);
  };

  const handleSetCommission = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('setCommission');
    setIsModalOpen(true);
  };

  const handleManageReferral = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('manageReferral');
    setIsModalOpen(true);
  };

  const handleManageGateway = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('manageGateway');
    setIsModalOpen(true);
  };

  const handleChangeColorScheme = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('changeColorScheme');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = (agentData) => {
    setAgentToDelete(agentData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (agentToDelete) {
      const updatedData = data.filter((agent) => agent.s_n !== agentToDelete.s_n);
      setData(updatedData);

      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  const handleImpersonate = async (agent) => {
    try {
      const result = await impersonateAgent(agent.id);
      if (result.success) {
       localStorage.setItem('impersonator_id', agent?.id);
        localStorage.setItem('isImpersonating', 'true');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Impersonation failed', error);
    }
  };

  const handleAgentUpdate = (updatedAgent) => {
    setData((prevData) =>
      prevData.map((agent) => (agent.s_n === updatedAgent.s_n ? updatedAgent : agent)),
    );
  };

  const [editRowId, setEditRowId] = useState(null);
  const [editedData, setEditedData] = useState(null);

  const columns = [
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
        return editRowId === agent.s_n ? (
          <TextField
            variant="outlined"
            value={editedData?.[info.column.id] || ''}
            onChange={(e) => handleChange(e, info.column.id)}
            fullWidth
          />
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              src={agent.imgsrc}
              alt={agent.organizationName}
              sx={{
                width: 36,
                height: 36,
                fontSize: '12px',
                fontWeight: 700,
                bgcolor: '#3949ab',
                flexShrink: 0,
              }}
            >
              {!agent.imgsrc && initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1.3, color: 'text.primary' }}>
                {agent.organizationName || 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                {agent.phoneNumber || 'N/A'} | {agent.state_name || 'N/A'} Region
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                {agent.contactDetails || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        );
      },
    }),
    columnHelper.accessor('gateway', {
      header: () => 'Gateway',
      cell: () => (
        <Typography variant="subtitle2" fontWeight="500">
          -
        </Typography>
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
            label={`${level}`}
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
    columnHelper.accessor('subAgent', {
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
          {info.row.original.sub_agents_count ?? 0}
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
      cell: (info) =>
        editRowId === info.row.original.s_n ? (
          <Select
            value={editedData?.status || ''}
            onChange={(e) => handleChange(e, 'status')}
            variant="outlined"
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Chip
            sx={{
              bgcolor:
                info.getValue() === 'Active'
                  ? '#dcfee6'
                  : info.getValue() === 'Inactive'
                    ? '#ffe4e6'
                    : '#f3f4f6',
              color:
                info.getValue() === 'Active'
                  ? '#16a34a'
                  : info.getValue() === 'Inactive'
                    ? '#e11d48'
                    : '#4b5563',
              borderRadius: '6px',
              fontWeight: 600,
              px: 2,
            }}
            size="small"
            label={info.getValue()}
          />
        ),
    }),
    columnHelper.accessor('action', {
      header: () => 'Action',
      cell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        return (
          <div>
            <IconButton
              aria-label="more"
              id={`action-menu-button-${row.original.s_n}`}
              aria-controls={open ? `action-menu-${row.original.s_n}` : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={`action-menu-${row.original.s_n}`}
              MenuListProps={{
                'aria-labelledby': `action-menu-button-${row.original.s_n}`,
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: 48 * 4.5,
                  width: '20ch',
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate(`/agent/view/${row.original.id}`);
                }}
              >
                View Agent Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleImpersonate(row.original);
                }}
              >
                Login As Agent
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleUpdateAgent(row.original, 'update');
                }}
              >
                Update Agent Info
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleViewSchools(row.original, 'view');
                }}
              >
                View School
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManagePermissions(row.original);
                }}
              >
                Manage Permission
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleSetCommission(row.original);
                }}
              >
                Update Commission
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManageReferral(row.original);
                }}
              >
                Manage Referral
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManageGateway(row.original);
                }}
              >
                Manage Payment Gateway
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleClose();
                  handleDeleteAgent(row.original);
                }}
              >
                Delete Agent
              </MenuItem>
            </Menu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowVirtualization: true,
  });

  const handleEdit = (row) => {
    setEditRowId(row.s_n);
    setEditedData({ ...row });
  };

  const handleSave = (rowId) => {
    if (editedData) {
      setData(data.map((item) => (item.s_n === editedData.s_n ? editedData : item)));
      setEditRowId(null);
      setEditedData(null);
    }
  };

  const handleChange = (e, field) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: e.target.value,
      });
    }
  };

  return (
    <PageContainer title="Agent Page" description="This is the Agent page">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Agent" items={BCrumb} />
      </Box>

      {/* Analytics Section */}
      <Grid container spacing={2} mb={3} mt={2} sx={{ alignItems: 'stretch' }}>
        {/* Card 1: Total School */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <DashboardStatCard
            compact
            title="Total School"
            value={analytics.totalSchools || '2,050'}
            valueColor="#2ca87f"
            valueBg={theme.palette.mode === 'dark' ? '#0d2e1e' : '#d6f5eb'}
            subStats={[
              { label: 'Active School', value: '3,010' },
              { label: 'Inactive School', value: '304' },
            ]}
            onIconClick={() => setIsSchoolModalOpen(true)}
            sx={{ width: '100%' }}
          />
        </Grid>

        {/* Card 2: Subscriptions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <DashboardStatCard
            compact
            title="Subscriptions"
            value={analytics.totalAgents || '503'}
            valueColor="#4a3aff"
            valueBg={theme.palette.mode === 'dark' ? '#1e2a4a' : '#e8e6ff'}
            subStats={[
              { label: 'Primary School', value: '300' },
              { label: 'Senior Secondary', value: '203' },
            ]}
            sx={{ width: '100%' }}
          />
        </Grid>

        {/* Card 3: Login Activities */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              width: '100%',
              borderRadius: '16px',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#f0f0f0'}`,
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
            }}
          >
            <Box sx={{ p: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: theme.palette.mode === 'dark' ? '#ccc' : '#444', fontSize: '12px' }}>
                  Login Activities
                </Typography>
                <Box
                  onClick={() => setIsLoggedInUsersModalOpen(true)}
                  sx={{ bgcolor: '#3d3d3d', p: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#111' } }}
                >
                  <IconChartBar size={13} color="white" />
                </Box>
              </Box>
              <Stack spacing={1} sx={{ flex: 1, justifyContent: 'center' }}>
                {loginActivities.map((item, i) => (
                  <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? '#bbb' : '#555', fontSize: '13px' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#e11d48', fontSize: '13px' }}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Card 4: Plan Distribution donut */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Card
            sx={{
              width: '100%',
              borderRadius: '16px',
              overflow: 'visible',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
              border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : '#f0f0f0'}`,
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
            }}
          >
            <Box sx={{ p: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: theme.palette.mode === 'dark' ? '#ccc' : '#444', fontSize: '12px' }}>
                  Total School
                </Typography>
                <Box
                  onClick={() => setIsPlanModalOpen(true)}
                  sx={{ bgcolor: '#3d3d3d', p: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#111' } }}
                >
                  <IconChartBar size={13} color="white" />
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <ReusablePieChart
                  series={planSeries}
                  labels={planLabels}
                  colors={['#3949ab', '#2ca87f', '#ff4081', '#9c27b0']}
                  height={150}
                />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
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
                <Typography variant="h5">List of Agents</Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsRegisterModalOpen(true)}
                sx={{ bgcolor: '#3949ab', '&:hover': { bgcolor: '#303f9f' } }}
              >
                Add New Agent
              </Button>
            </Stack>
          }
        >
          <Grid container spacing={3} mb={3} alignItems="center">
            <Grid size={{ xs: 12, md: 3, sm: 4 }}>
              <TextField
                fullWidth
                label="Agent Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2, sm: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Agent Level</InputLabel>
                <Select
                  value={agentLevel}
                  label="Agent Level"
                  onChange={(e) => setAgentLevel(e.target.value)}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="1">Level 1</MenuItem>
                  <MenuItem value="2">Level 2</MenuItem>
                  <MenuItem value="3">Level 3</MenuItem>
                  <MenuItem value="4">Level 4</MenuItem>
                  <MenuItem value="5">Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 2, sm: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 2, sm: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>State</InputLabel>
                <Select value={state} label="State" onChange={(e) => setState(e.target.value)}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.stname || s.name}>
                      {s.stname || s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 2, sm: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>LGA</InputLabel>
                <Select
                  value={lga}
                  label="LGA"
                  onChange={(e) => setLga(e.target.value)}
                  disabled={!state}
                >
                  <MenuItem value="">-- Choose LGA --</MenuItem>
                  {lgas.map((l) => (
                    <MenuItem key={l.id} value={l.lganame || l.name}>
                      {l.lganame || l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 1, sm: 4 }}>
              <Button fullWidth variant="contained" onClick={() => applyFilters()} color="primary">
                Search
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
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
                {!emptyState.isEmpty ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableState
                    colSpan={table.getHeaderGroups()[0]?.headers.length || 7}
                    message={emptyState.message}
                    description={emptyState.description}
                    type={emptyState.type}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </ParentCard>
        <AgentModal
          open={isRegisterModalOpen || isModalOpen}
          onClose={() => {
            setIsRegisterModalOpen(false);
            setIsModalOpen(false);
            if (actionType === 'update') {
              setSelectedAgent(null);
            }
          }}
          handleRefresh={handleRefresh}
          selectedAgent={selectedAgent}
          actionType={isModalOpen ? actionType : 'create'}
        />

        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Agent"
          message="Are you sure you want to delete this agent? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          severity="error"
        />
        <TotalSchoolModal open={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} />
        <TotalTransactionModal
          open={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
        />
        <LoggedInUsersModal
          open={isLoggedInUsersModalOpen}
          onClose={() => setIsLoggedInUsersModalOpen(false)}
          onViewUserList={() => setIsViewUsersListModalOpen(true)}
        />
        <ViewUsersListModal
          open={isViewUsersListModalOpen}
          onClose={() => setIsViewUsersListModalOpen(false)}
        />
        <PlanDistributionModal open={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      </Box>
    </PageContainer>
  );
};

export default Agent;
