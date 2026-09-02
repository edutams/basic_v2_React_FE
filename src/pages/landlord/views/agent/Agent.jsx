import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AgentContext/auth';

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Skeleton,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import FilterSideDrawer from '@/components/shared/FilterSideDrawer';
import AgentModal from '@/components/landlord/add-agent/components/AgentModal';
import EmptyTableState from '@/components/shared/EmptyTableState';
import useTableEmptyState from '@/hooks/useTableEmptyState';
import agentApi from '@/api/landlord/organizations/agent';
import activityLogApi from '@/api/landlord/activity-log/activityLogApi';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconSchool, IconChartBar, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { IconEye, IconLogin, IconEdit, IconBuilding, IconCreditCard, IconBuildingBank } from '@tabler/icons-react';
import PlanDistributionModal from './components/PlanDistributionModal';
import LoggedInUsersModal from './components/LoggedInUsersModal';
import ViewUsersListModal from './components/ViewUsersListModal';
import TotalSchoolModal from './components/TotalSchoolModal';
import TotalTransactionModal from './components/TotalTransactionModal';
import ReusablePieChart from '@/components/shared/charts/ReusablePieChart';

import ManageTeamTab from './components/ManageTeamTab';
import { IconFilter } from '@tabler/icons-react';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

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
  handleManageBankService,
  handleDeleteAgent,
  handleDeleteOrganization,
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
            width: '24ch',
          },
        }}
      >
        <MenuItem
          component="a"
          href={`/agent/view/${agent.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClose}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText primary="View Agent Profile" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleImpersonate(agent);
          }}
        >
          <ListItemIcon>
            <IconLogin size={18} />
          </ListItemIcon>
          <ListItemText primary="Login As Agent" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleUpdateAgent(agent, 'update');
          }}
        >
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText primary="Update Agent Info" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleViewSchools(agent, 'view');
          }}
        >
          <ListItemIcon>
            <IconBuilding size={18} />
          </ListItemIcon>
          <ListItemText primary="View School" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleManageGateway(agent);
          }}
        >
          <ListItemIcon>
            <IconCreditCard size={18} />
          </ListItemIcon>
          <ListItemText primary="Manage Payment Gateway" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleManageBankService(agent);
          }}
        >
          <ListItemIcon>
            <IconBuildingBank size={18} />
          </ListItemIcon>
          <ListItemText primary="Manage Bank Service" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleDeleteOrganization(agent);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Delete Organization" />
        </MenuItem>
        {/* <MenuItem
          onClick={() => {
            handleClose();
            handleManagePermissions(agent);
          }}
        >
          Manage Permission
        </MenuItem> */}
        {/* <MenuItem
          onClick={() => {
            handleClose();
            handleSetCommission(agent);
          }}
        >
          Update Commission
        </MenuItem> */}
        {/* <MenuItem
          onClick={() => {
            handleClose();
            handleManageReferral(agent);
          }}
        >
          Manage Referral
        </MenuItem>
    */}
      </Menu>
    </>
  );
};

import locationApi from '@/api/landlord/location/location';
import useNotification from '@/hooks/useNotification';

const Agent = () => {
  const { user, impersonateAgent } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const schemeMap = [
    { bg: '#DBEAFE', color: '#2563EB' },
    { bg: '#DCFCE7', color: '#16A34A' },
    { bg: '#F3E8FF', color: '#9333EA' },
    { bg: '#FEF3C7', color: '#D97706' },
    { bg: '#FEE2E2', color: '#DC2626' },
  ];
  const s0 = schemeMap[0];
  const s1 = schemeMap[1];
  const s2 = schemeMap[2];
  const s3 = schemeMap[3];
  const notify = useNotification();

  const [tab, setTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const [impersonateConfirmOpen, setImpersonateConfirmOpen] = useState(false);
  const [agentToImpersonate, setAgentToImpersonate] = useState(null);

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
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState(null);
  const [selectedSchoolForUsers, setSelectedSchoolForUsers] = useState('');
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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
  const [loginActivities, setLoginActivities] = useState([]);
  const [loginActivitiesLoading, setLoginActivitiesLoading] = useState(true);
  const [selectedUserFilters, setSelectedUserFilters] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalAgents: 0,
    totalSubAgents: 0,
    totalSchools: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const response = await agentApi.getAnalytics();
        if (response.status === true && response.data) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [refreshKey]);

  useEffect(() => {
    const fetchLoginActivities = async () => {
      try {
        const res = await activityLogApi.getLoginActivities30Days();
        if (res.status) {
          setLoginActivities(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch login activities', error);
      } finally {
        setLoginActivitiesLoading(false);
      }
    };
    fetchLoginActivities();
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
            status: agent.status,
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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

  const handleDeleteOrganization = (agentData) => {
    setSelectedAgent(agentData);
    setDeleteConfirmOpen(true);
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

  const handleManageBankService = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('manageBankService');
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

  const handleConfirmDeleteOrganization = async () => {
    if (!selectedAgent) return;

    try {
      const res = await agentApi.deleteOrganization(selectedAgent.id);
      if (res.status) {
        notify.success('Organization deleted successfully!');
        // Refresh the data
        setRefreshKey((prevData) => prevData + 1);
      } else {
        notify.error(res.message || 'Failed to delete organization');
      }
    } catch (e) {
      // Check if the error response contains a message from the backend
      if (e.response && e.response.data && e.response.data.message) {
        notify.error(e.response.data.message);
      } else {
        notify.error('Failed to delete organization');
      }
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedAgent(null);
    }
  };

  const handleCancelDeleteOrganization = () => {
    setDeleteConfirmOpen(false);
    setSelectedAgent(null);
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

  const confirmImpersonate = (agent) => {
    setAgentToImpersonate(agent);
    setImpersonateConfirmOpen(true);
  };

  const handleConfirmedImpersonate = async () => {
    if (!agentToImpersonate) return;

    try {
      const result = await impersonateAgent(agentToImpersonate.id);
      if (result.success) {
        localStorage.setItem('impersonator_id', agentToImpersonate.id);
        localStorage.setItem('isImpersonating', 'true');

        notify.success(
          'Impersonation successful',
          `You are now impersonating ${agentToImpersonate.organization_name}`,
        );
        navigate('/agent');
      } else {
        alert(result.error || 'Impersonation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Impersonation failed');
    } finally {
      setImpersonateConfirmOpen(false);
      setAgentToImpersonate(null);
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
      <Breadcrumb title="Organization" items={BCrumb} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          // mb: 3,
        }}
      >
        {analyticsLoading ? (
          [...Array(4)].map((_, i) => (
            <Paper key={i} elevation={0} sx={{ p: '10px', borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
              </Box>
              <Skeleton variant="rounded" width={60} height={36} sx={{ borderRadius: 1, mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[...Array(3)].map((_, j) => (
                  <Box key={j} sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={14} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                ))}
              </Box>
            </Paper>
          ))
        ) : (
        <>
        {/* Total School */}
        <Paper
          elevation={0}
          sx={{
            p: '10px !important',
            borderRadius: '14px',
            bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            cursor: 'pointer',
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
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Total School
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s0.bg,
                color: isDark ? '#fff' : s0.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setIsSchoolModalOpen(true)}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box
            sx={{
              background: isDark ? 'rgba(255,255,255,0.08)' : s0.bg,
              borderRadius: 1,
              px: 2,
              py: 0.75,
              display: 'inline-flex',
              alignItems: 'center',
              mb:5
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                color: isDark ? '#ffffff' : s0.color,
              }}
            >
              {analytics.totalSchools ?? 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Approved
              </Typography>
              <Typography fontWeight={600}>{analytics.activeSchools ?? 0}</Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: '#E5E7EB', mx: 1.5 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
              <Typography fontWeight={600}>{analytics.pendingSchools ?? 0}</Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: '#E5E7EB', mx: 1.5 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Rejected
              </Typography>
              <Typography fontWeight={600}>{analytics.rejectedSchools ?? 0}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Subscriptions */}
        <Paper
          elevation={0}
          sx={{
                  p: '10px !important',
            borderRadius: '14px',
            bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            cursor: 'pointer',
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
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Subscriptions
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s1.bg,
                color: isDark ? '#fff' : s1.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box
            sx={{
              background: isDark ? 'rgba(255,255,255,0.08)' : s1.bg,
              borderRadius: 1,
              px: 2,
              py: 0.75,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 5,
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                color: isDark ? '#ffffff' : s1.color,
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
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Primary
              </Typography>
              <Typography fontWeight={600}>{schoolSummary.primary}</Typography>
            </Box>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: '#E5E7EB', mx: 2 }}
            />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Secondary
              </Typography>
              <Typography fontWeight={600}>{schoolSummary.secondary}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Login Activities */}
        <Paper
          elevation={0}
          sx={{
                   p: '10px !important',
            borderRadius: '14px',
            bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            cursor: 'pointer',
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
              alignItems: 'center',
              mb: 5,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Login Activities
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s2.bg,
                color: isDark ? '#fff' : s2.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setIsLoggedInUsersModalOpen(true)}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box sx={{ pb: 0 }}>
            {loginActivitiesLoading ? (
              <Box sx={{ py: 1 }}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="text" height={30} sx={{ mb: 0.5 }} />
                ))}
              </Box>
            ) : (
              (loginActivities.length > 0
                ? loginActivities
                : [
                    { label: 'Staffs', value: 0 },
                    { label: 'Agents', value: 0 },
                    { label: 'Total', value: 0 },
                  ]
              ).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.5,
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: isDark ? '#ffffff' : s2.color }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>

        {/* Plan Distribution */}
        <Paper
          elevation={0}
          sx={{
                  p: '10px !important',
            borderRadius: '14px',
            bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
            cursor: 'pointer',
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
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Plan Distribution
            </Typography>

            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s3.bg,
                color: isDark ? '#fff' : s3.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={18} color="currentColor" />
            </Box>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                height: 150,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <ReusablePieChart
                series={planSeries}
                colors={planColors}
                labels={planLabels}
                height={150}
                width="100%"
                hideCard
              />
            </Box>
          </Box>
        </Paper>  
        </>
        )}
      </Box>

      <Box >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="agent management tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Organizations"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Manage Team"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          <ParentCard
            title={
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ width: '100%' }}
              >
               
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setIsRegisterModalOpen(true)}
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                    },

                    px: {
                      xs: 1.5,
                      sm: 2,
                    },

                    whiteSpace: 'nowrap',
                  }}
                >
                  Add New Organization
                </Button>
                 <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconAdjustmentsHorizontal />}
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2.5,
                    borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
                    fontWeight: activeFilterCount > 0 ? 700 : 400,
                  }}
                >
                  Filters
                  {activeFilterCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 0.8,
                        py: 0.1,
                        bgcolor: 'primary.main',
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
              </Stack>
            }
              sx={{ px: 0, py: 0, '& .MuiCardContent-root': { px: 3,py:0 } }}

            >
            <TableContainer>
              <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
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
                      <Typography variant="h6">Access Level</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Sub Organization</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Total School</Typography>
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
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(10)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" width={j === 0 ? 30 : 60} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
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
                        2: { color: theme.palette.primary.main, bg: theme.palette.primary.light },
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
                                value={editedData?.organizationName || ''}
                                onChange={(e) => handleChange(e, 'organizationName', agent)}
                                fullWidth
                              />
                            ) : (
                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Avatar
                                  src={agent.imgsrc}
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
                                  {!agent.imgsrc && initials}
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
                                    {agent.phoneNumber || 'N/A'} | {agent.state_name || 'N/A'}{' '}
                                    Region
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
                              <Box sx={{ bgcolor: 'primary.main', px: 1.5, py: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  fontWeight="700"
                                  sx={{ color: '#fff' }}
                                >
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
                                bgcolor: agent.primaryColor || theme.palette.primary.main,
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
                                    agent.status == 'active'
                                      ? '#dcfee6'
                                      : agent.status == 'inactive'
                                        ? '#ffe4e6'
                                        : '#f3f4f6',
                                  color:
                                    agent.status === 'active'
                                      ? '#16a34a'
                                      : agent.status == 'inactive'
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
                              handleImpersonate={confirmImpersonate}
                              handleUpdateAgent={handleUpdateAgent}
                              handleViewSchools={handleViewSchools}
                              handleManagePermissions={handleManagePermissions}
                              handleSetCommission={handleSetCommission}
                              handleManageReferral={handleManageReferral}
                              handleManageGateway={handleManageGateway}
                              handleManageBankService={handleManageBankService}
                              handleDeleteAgent={handleDeleteAgent}
                              handleDeleteOrganization={handleDeleteOrganization}
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
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <ManageTeamTab
            organizationId={user?.organization?.id}
            accessLevel={user?.organization?.access_level ?? 1}
          />
        </TabPanel>
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

        {/* Impersonate Confirmation */}
        <Dialog
          open={impersonateConfirmOpen}
          onClose={() => {
            setImpersonateConfirmOpen(false);
            setAgentToImpersonate(null);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Login as Agent</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to login as{' '}
              <strong>{agentToImpersonate?.organizationName || 'this agent'}</strong>? You will be
              able to return to your account at any time.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="inherit"
              onClick={() => {
                setImpersonateConfirmOpen(false);
                setAgentToImpersonate(null);
              }}
            >
              Cancel
            </Button>
            <Button size="small" onClick={handleConfirmedImpersonate}>
              Yes, Login As
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Delete Agent</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete{' '}
              <strong>{agentToDelete?.organizationName || 'this agent'}</strong>? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button variant="contained" size="small" color="inherit" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button size="small" color="error" onClick={handleConfirmDelete}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Organization Delete Confirmation */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleCancelDeleteOrganization}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Delete Organization</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete{' '}
              <strong>{selectedAgent?.organizationName || 'this organization'}</strong>? This action
              cannot be undone. This can only be done if no schools are attached to this
              organization.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="inherit"
              onClick={handleCancelDeleteOrganization}
            >
              Cancel
            </Button>
            <Button size="small" color="error" onClick={handleConfirmDeleteOrganization}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        <TotalSchoolModal
          open={isSchoolModalOpen}
          onClose={() => setIsSchoolModalOpen(false)}
          stats={analytics}
        />
        <TotalTransactionModal
          open={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
        />
        <LoggedInUsersModal
          open={isLoggedInUsersModalOpen}
          onClose={() => setIsLoggedInUsersModalOpen(false)}
          onViewUserList={(row, filters) => {
            setSelectedTenantForUsers(row);
            setSelectedUserFilters(filters);
            setIsViewUsersListModalOpen(true);
          }}
          stats={loginActivities}
          usersData={data.flatMap((agent) =>
            (agent.tenants || []).map((tenant) => ({
              id: tenant.id,
              school: tenant.tenant_name,
              url:
                agent.organization_domain || agent.organizationDomain
                  ? `https://${tenant.tenant_short_name}.${agent.organization_domain || agent.organizationDomain}`
                  : tenant.tenant_short_name
                    ? `https://${tenant.tenant_short_name}`
                    : '',
              agent: agent.organizationName || agent.organization_name,
              accessLevel: 'Level ' + (agent.access_level || 2),
              date: tenant.created_at,
              stats: tenant.login_activities || {
                Teacher: 0,
                Student: 0,
                SPA: 0,
                Total: 0,
              },
            })),
          )}
        />
        <ViewUsersListModal
          open={isViewUsersListModalOpen}
          onClose={() => setIsViewUsersListModalOpen(false)}
          schoolId={selectedTenantForUsers?.id}
          schoolName={selectedTenantForUsers?.school}
          filters={selectedUserFilters}
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
