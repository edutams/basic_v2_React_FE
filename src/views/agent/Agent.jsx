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
import FilterSideDrawer from '../../components/shared/FilterSideDrawer';
import AgentModal from '../../components/add-agent/components/AgentModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import EmptyTableState from '../../components/shared/EmptyTableState';
import useTableEmptyState from '../../hooks/useTableEmptyState';
import agentApi from '../../api/agent';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import {
  IconUsers,
  IconSchool,
  IconCurrencyNaira,
  IconChartBar,
  IconAdjustmentsHorizontal,
} from '@tabler/icons-react';

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
const schoolSummary = {
  total: 350,
  active: 200,
  inactive: 100,
  subAgents: 0,

  primary: 30,

  secondary: 900,
};
const planSeries = [40, 15, 35, 10];

const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];

const planData = [
  { name: 'Freemium', value: 40, color: '#EC468C' },
  { name: 'Basic', value: 15, color: '#7987FF' },
  { name: 'Basic +', value: 35, color: '#FFA5CB' },
  { name: 'Basic ++', value: 10, color: '#8B48E3' },
];

const planColors = planData.map((p) => p.color);

// Separate component for action menu to avoid hooks in loops
const ActionMenuCell = ({
  agent,
  navigate,
  handleImpersonate,
  handleUpdateAgent,
  handleViewSchools,
  handleManagePermissions,
  handleSetCommission,
  handleManageReferral,
  handleManageGateway,
  handleDeleteAgent,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id={`action-menu-button-${agent.s_n}`}
        aria-controls={open ? `action-menu-${agent.s_n}` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`action-menu-${agent.s_n}`}
        MenuListProps={{
          'aria-labelledby': `action-menu-button-${agent.s_n}`,
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
            navigate(`/agent/view/${agent.id}`);
          }}
        >
          View Agent Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleImpersonate(agent);
          }}
        >
          Login As Agent
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleUpdateAgent(agent, 'update');
          }}
        >
          Update Agent Info
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleViewSchools(agent, 'view');
          }}
        >
          View School
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleManagePermissions(agent);
          }}
        >
          Manage Permission
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleSetCommission(agent);
          }}
        >
          Update Commission
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleManageReferral(agent);
          }}
        >
          Manage Referral
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleManageGateway(agent);
          }}
        >
          Manage Payment Gateway
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleDeleteAgent(agent);
          }}
        >
          Delete Agent
        </MenuItem>
      </Menu>
    </>
  );
};

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

  // Filter Drawer States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  const navigate = useNavigate();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalAgents: 0,
    totalSubAgents: 0,
    totalSchools: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await agentApi.getAnalytics();
        if (response.status === true && response.data) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      }
    };
    fetchAnalytics();
  }, [refreshKey]);

  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      try {
        const params = {
          state: state || undefined,
          lga: lga || undefined,
          status: status || undefined,
          search: search || undefined,
          access_level: agentLevel || undefined,
          page: page + 1,
          per_page: rowsPerPage,
        };
        const response = await agentApi.getAll(params);

        // Handle Laravel Paginator structure (possibly wrapped in {data: ..., status: true})
        const paginator = response.status === true ? response.data : response;
        const agentsArray = paginator.data || [];

        const mappedData = agentsArray.map((agent, index) => {
          const leadUser = agent.users && agent.users.length > 0 ? agent.users[0] : {};
          return {
            ...agent,
            ...leadUser,
            s_n: page * rowsPerPage + index + 1,
            id: agent.id,
            organizationName: agent.organization_name,
            contactDetails: agent.organization_email,
            phoneNumber: agent.organization_phone,
            contactAddress: agent.organization_address,
            imgsrc: agent.organization_logo || agent.image || null,
            performance: 'School: ' + (agent.tenants_count || 0),
            tenants_count: agent.tenants_count || 0,
            sub_agents_count: agent.sub_organizations_count || 0,
            access_level: agent.access_level,
            primaryColor: agent.primary_color || null,
            status: agent.status
              ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
              : 'Inactive',
            lga: agent.lga_id || agent.state_lga_id,
            state_name: agent.state_lga?.state?.state_name || agent.state_name,
            state_id: agent.state_lga?.state_id || agent.state_id,
            lga_name: agent.state_lga?.lga_name || agent.lga_name,
            lga_id: agent.lga_id || agent.state_lga_id,
          };
        });
        setData(mappedData);
        setTotalRows(paginator.total || 0);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      } finally {
        setTableLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, page, rowsPerPage]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const handleFilterApply = (filterValues) => {
    // Map filter values to component state
    if (filterValues.search !== undefined) setSearch(filterValues.search);
    if (filterValues.agentLevel !== undefined) setAgentLevel(filterValues.agentLevel);
    if (filterValues.status !== undefined) setStatus(filterValues.status);
    if (filterValues.state !== undefined) {
      setState(filterValues.state);
    }
    if (filterValues.lga !== undefined) setLga(filterValues.lga);

    setActiveFilters(filterValues);
    setPage(0); // Reset to first page
    setRefreshKey((prev) => prev + 1); // Trigger data refresh
  };

  const handleFilterChange = (key, value) => {
    // When state changes in the filter drawer, fetch LGAs immediately
    if (key === 'state') {
      setState(value);
      // Clear LGA when state changes
      setLga('');

      // Fetch LGAs for the selected state
      if (value) {
        const selectedState = states.find((s) => (s.state_name || s.name) === value);
        if (selectedState) {
          locationApi
            .getLgas(selectedState.id)
            .then((response) => {
              setLgas(response);
            })
            .catch((error) => {
              console.error('❌ Failed to fetch LGAs', error);
              setLgas([]);
            });
        }
      } else {
        setLgas([]);
      }
    }
  };

  const handleFilterReset = () => {
    setSearch('');
    setAgentLevel('');
    setStatus('');
    setState('');
    setLga('');
    setActiveFilters({});
    setPage(0);
    setRefreshKey((prev) => prev + 1); // Trigger data refresh
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
          const selectedState = states.find((s) => (s.state_name || s.name) === state);

          if (selectedState) {
            const response = await locationApi.getLgas(selectedState.id);
            setLgas(response);
          } else {
            setLgas([]);
          }
        } catch (error) {
          console.error('❌ Failed to fetch LGAs', error);
          setLgas([]);
        }
      } else {
        setLgas([]);
        setLga('');
      }
    };
    fetchLgas();
  }, [state, states]);

  // Sync activeFilters.lga when states/lgas change
  useEffect(() => {
    if (activeFilters.state && !activeFilters.lga) {
      // State changed, LGA should be reset in filter drawer
    }
  }, [states, lgas]);

  // Update agentFilterDefs dynamically based on states and lgas
  const agentFilterDefs = useMemo(
    () => [
      {
        key: 'search',
        label: 'Agent Name',
        type: 'text',
        placeholder: 'Search by agent name…',
      },
      {
        key: 'agentLevel',
        label: 'Agent Level',
        type: 'select',
        options: [
          // { value: '1', label: 'Level 1' },
          { value: '2', label: 'Level 2' },
          { value: '3', label: 'Level 3' },
          { value: '4', label: 'Level 4' },
          { value: '5', label: 'Level 5' },
        ],
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ],
      },
      {
        key: 'state',
        label: 'State',
        type: 'select',
        options: states.map((s) => ({
          value: s.state_name || s.name,
          label: s.state_name || s.name,
        })),
      },
      {
        key: 'lga',
        label: 'LGA',
        type: 'select',
        options: lgas.map((l) => ({
          value: l.lga_name,
          label: l.lga_name,
        })),
      },
    ],
    [states, lgas],
  );

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
    setSelectedAgent(agentData);
    setActionType(actionType);
    setIsModalOpen(true);
  };

  const handleViewSchools = (agentData) => {
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

  const handleChange = (e, field, row) => {
    setEditedData({
      ...editedData,
      [field]: e.target.value,
    });
  };

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

  return (
    <PageContainer title="Organization Page" description="This is the Organization page">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Organization" items={BCrumb} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total School
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsSchoolModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#E6F7F1',
              borderRadius: 1,
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2CA87F' }}>
              {analytics.totalSchools ?? 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="text.primary">Active School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{analytics.activeSchools ?? 0}</Typography>
            </Box>
            <Box sx={{ width: '1px', height: 40, background: '#E5E7EB' }} />
            <Box>
              <Typography variant="h6" color="text.primary">Pending School</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{analytics.pendingSchools ?? 0}</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Subscriptions
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#EEF2FF',
              borderRadius: 1,
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#4A3AFF',
              }}
            >
              {schoolSummary.total}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Primary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {schoolSummary.primary}
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Secondary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {schoolSummary.secondary}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            // px: 3,
            // py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            // mb={2}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.primary">
              Login Activities
            </Typography>

            <Box
              sx={{
                bgcolor: '#3d3d3d',
                p: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#111' },
              }}
              onClick={() => setIsLoggedInUsersModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box sx={{ px: 3, mt: 1 }}>
            {(analytics.loginActivities ?? [
              { label: 'Teachers', value: 0 },
              { label: 'Agents',   value: 0 },
              { label: 'Total',    value: 0 },
            ]).map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="h5" color="text.primary">{item.label}</Typography>
                <Typography variant="h5" sx={{ color: theme.palette.error.main }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper
          sx={{
            // px: 3,
            // py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            // mb={2}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.primary">
              Plan Distribution
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                height: 170,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <ReusablePieChart
                series={planSeries}
                colors={planColors}
                labels={planLabels}
                height={180}
                hideCard
              />
            </Box>
          </Box>
        </Paper>
      </Box>

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
                <Typography variant="h5">List of Organizations</Typography>
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
          {/* Filter Button */}
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<IconAdjustmentsHorizontal size={18} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                borderColor: activeFilterCount > 0 ? '#3949ab' : 'divider',
                color: activeFilterCount > 0 ? '#3949ab' : 'text.secondary',
                fontWeight: activeFilterCount > 0 ? 700 : 400,
                '&:hover': { borderColor: '#3949ab', color: '#fff' },
              }}
            >
              Show Filters
              {activeFilterCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.1,
                    bgcolor: '#3949ab',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">S/N</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Organization Details</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Admin Details</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Gateway</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Access Level</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Sub Agent</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Performance</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Primary Color</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Status</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Action</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading organizations...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !emptyState.isEmpty ? (
                  filteredData.map((agent) => {
                    const initials = (agent.organizationName || 'NA')
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();
                    const fullName = `${agent.fname || ''} ${agent.lname || ''}`.trim();
                    const adminInitials = fullName
                      ? fullName
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()
                      : 'NA';
                    const level = Number(agent.access_level);
                    const colorMap = {
                      1: { color: '#2ca87f', bg: '#e6f4ee' },
                      2: { color: '#3949ab', bg: '#e8eaf6' },
                      3: { color: '#f57c00', bg: '#fff3e0' },
                    };
                    const levelConfig = colorMap[level] || { color: '#757575', bg: '#f5f5f5' };

                    return (
                      <TableRow key={agent.id} hover>
                        <TableCell>
                          <Typography color="textSecondary" variant="h6" fontWeight="400">
                            {agent.s_n}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {editRowId === agent.s_n ? (
                            <TextField
                              variant="outlined"
                              value={editedData?.organizationName || ''}
                              onChange={(e) => handleChange(e, 'organizationName', agent)}
                              fullWidth
                            />
                          ) : (
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Avatar
                                src={agent.avatar || agent.admin_avatar}
                                alt={agent.organizationName}
                                sx={{
                                  width: 50,
                                  height: 50,
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  bgcolor: '#2196f3',
                                  flexShrink: 0,
                                }}
                              >
                                {!(agent.avatar || agent.admin_avatar) && initials}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="700"
                                  sx={{ lineHeight: 1.3, color: 'text.primary' }}
                                >
                                  {agent.organizationName || 'N/A'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ display: 'block', lineHeight: 1.4 }}
                                >
                                  {agent.phoneNumber || 'N/A'} | {agent.state_name || 'N/A'} Region
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ display: 'block', lineHeight: 1.4 }}
                                >
                                  {agent.contactDetails || 'N/A'}
                                </Typography>
                              </Box>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Avatar
                              src={agent.avatar || agent.admin_avatar}
                              alt={fullName}
                              sx={{
                                width: 50,
                                height: 50,
                                fontSize: '12px',
                                fontWeight: 700,
                                bgcolor: '#2196f3',
                                flexShrink: 0,
                              }}
                            >
                              {!(agent.avatar || agent.admin_avatar) && adminInitials}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight="700"
                                sx={{ lineHeight: 1.3, color: 'text.primary' }}
                              >
                                {fullName || 'N/A'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: 'block', lineHeight: 1.4 }}
                              >
                                {agent.phone || 'N/A'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: 'block', lineHeight: 1.4 }}
                              >
                                {agent.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="500">
                            -
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${level}`}
                            sx={{
                              bgcolor: levelConfig.bg,
                              color: levelConfig.color,
                              fontWeight: 600,
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
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
                            {agent.sub_agents_count ?? 0}
                          </Box>
                        </TableCell>
                        <TableCell>
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
                            <Box sx={{ bgcolor: '#3949ab', px: 1.5, py: 0.5 }}>
                              <Typography variant="caption" fontWeight="700" sx={{ color: '#fff' }}>
                                {agent.tenants_count ?? 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: agent.primaryColor || '#3949ab',
                              border: '2px solid rgba(255,255,255,0.8)',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {editRowId === agent.s_n ? (
                            <Select
                              value={editedData?.status || ''}
                              onChange={(e) => handleChange(e, 'status', agent)}
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
                                  agent.status === 'Active'
                                    ? '#dcfee6'
                                    : agent.status === 'Inactive'
                                      ? '#ffe4e6'
                                      : '#f3f4f6',
                                color:
                                  agent.status === 'Active'
                                    ? '#16a34a'
                                    : agent.status === 'Inactive'
                                      ? '#e11d48'
                                      : '#4b5563',
                                borderRadius: '6px',
                                fontWeight: 600,
                                px: 2,
                              }}
                              size="small"
                              label={agent.status}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <ActionMenuCell
                            agent={agent}
                            navigate={navigate}
                            handleImpersonate={handleImpersonate}
                            handleUpdateAgent={handleUpdateAgent}
                            handleViewSchools={handleViewSchools}
                            handleManagePermissions={handleManagePermissions}
                            handleSetCommission={handleSetCommission}
                            handleManageReferral={handleManageReferral}
                            handleManageGateway={handleManageGateway}
                            handleDeleteAgent={handleDeleteAgent}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <EmptyTableState
                    colSpan={10}
                    message={emptyState.message}
                    description={emptyState.description}
                    type={emptyState.type}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
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

        {/* Filter Side Drawer */}
        <FilterSideDrawer
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={agentFilterDefs}
          title="Filter Agents"
          onApply={handleFilterApply}
          onReset={handleFilterReset}
          onFilterChange={handleFilterChange}
        />
      </Box>
    </PageContainer>
  );
};

export default Agent;
