import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  TableContainer,
  Select,
  MenuItem,
  Button,
  TextField,
  Paper,
  Stack,
  useTheme,
  TablePagination,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Menu,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { IconUsers } from '@tabler/icons-react';
import agentApi from '@/api/landlord/organizations/agent';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AgentContext/auth.jsx';
import AgentModal from '@/components/landlord/add-agent/components/AgentModal';

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
  isViewingProfile = false,
}) => {
  const [anchor, setAnchor] = useState(null);

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <Typography variant="body2" fontWeight={700} color="textSecondary">
          ···
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: '8px', minWidth: 160 } }}
      >
        {isViewingProfile ? (
          // When viewing profile, only show "Login As Agent"
          <MenuItem
            onClick={() => {
              handleClose();
              handleImpersonate(agent);
            }}
          >
            Login As Agent
          </MenuItem>
        ) : (
          // When not viewing profile, show all menu items
          <>
            <MenuItem
              onClick={() => {
                handleClose();
                navigate(`/agent/view/${agent.id}`);
              }}
            >
              View Profile
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
                handleDeleteAgent(agent);
              }}
            >
              Delete Agent
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

const TeamTab = ({
  onAddAgent,
  isDashboard = false,
  accessLevel,
  isViewingProfile = false,
  organizationId = null,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useContext(AuthContext);
  const userAccessLevel = user?.organization?.access_level ?? 1;

  // Filter state
  const [search, setSearch] = useState('');
  const [agentLevel, setAgentLevel] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Data states
  const [data, setData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const handleAction = (agent, type) => {
    setSelectedAgent(agent);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (agentToDelete) {
      // Add delete logic here if needed
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  const confirmImpersonate = async (agent) => {
    try {
      // Add impersonation logic here if needed
    } catch (error) {
      console.error('Impersonation failed', error);
    }
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

  const handleDeleteAgent = (agentData) => {
    setAgentToDelete(agentData);
    setDeleteDialogOpen(true);
  };

  // Get available agent levels based on user access level
  const getAvailableLevels = () => {
    switch (userAccessLevel) {
      case 1:
        return [1, 2, 3, 4, 5]; // Show all levels
      case 2:
        return [3, 4, 5]; // Show level 3 downward
      case 3:
        return [4, 5]; // Show level 4 downward
      case 4:
        return [5]; // Show level 5 only
      case 5:
        return []; // Don't show the filter
      default:
        return [1, 2, 3, 4, 5]; // Default to all levels
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      try {
        const params = {
          page: page + 1,
          per_page: rowsPerPage,
        };

        let response;
        if (isViewingProfile && organizationId) {
          // When viewing a specific organization's profile, get only its sub-organizations
          params.parent_id = organizationId;
          response = await agentApi.getSubOrganizations(params);
        } else {
          // When on the main organizations page, get all organizations
          response = await agentApi.getAll(params);
        }

        // Handle Laravel Paginator structure
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
  }, [page, rowsPerPage, isViewingProfile, organizationId]);

  // Handle search button click
  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    const fetchData = async () => {
      setTableLoading(true);
      try {
        const params = {
          state: state || undefined,
          lga: lga || undefined,
          status: status || undefined,
          search: search || undefined,
          access_level: agentLevel || undefined,
          page: 1,
          per_page: rowsPerPage,
        };

        let response;
        if (isViewingProfile && organizationId) {
          // When viewing a specific organization's profile, get only its sub-organizations
          params.parent_id = organizationId;
          response = await agentApi.getSubOrganizations(params);
        } else {
          // When on the main organizations page, get all organizations
          response = await agentApi.getAll(params);
        }

        // Handle Laravel Paginator structure
        const paginator = response.status === true ? response.data : response;
        const agentsArray = paginator.data || [];

        const mappedData = agentsArray.map((agent, index) => {
          const leadUser = agent.users && agent.users.length > 0 ? agent.users[0] : {};
          return {
            ...agent,
            ...leadUser,
            s_n: index + 1, // Reset S/N for new search
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
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
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
            <IconUsers size={16} />
          </Box>
          <Typography variant="h5">
            {isViewingProfile ? 'Sub Organizations' : 'List of Organization'}
          </Typography>
        </Stack>
        {!isViewingProfile && (
          <Button startIcon={<IconUsers size={16} />} onClick={onAddAgent}>
            Add New Organization
          </Button>
        )}
      </Stack>

      {/* Filters */}
      <Grid container spacing={2} mb={3} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        {getAvailableLevels().length > 0 && (
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Agent Level</InputLabel>
              <Select
                value={agentLevel}
                label="Agent Level"
                onChange={(e) => setAgentLevel(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {getAvailableLevels().map((l) => (
                  <MenuItem key={l} value={l}>
                    Level {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button fullWidth size="small" onClick={handleSearch}>
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
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
                <Typography variant="h6">Access Level</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Sub Org.</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Total School</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Status</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Primary Color</Typography>
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
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((agent) => {
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
                      <Typography color="textSecondary" variant="h6" fontWeight={400}>
                        {agent.s_n}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                            fontWeight={700}
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
                            fontWeight={700}
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
                          <Typography variant="caption" fontWeight="700" sx={{ color: '#fff' }}>
                            {agent.tenants_count ?? 0}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        sx={{
                          bgcolor:
                            agent.status == 'active'
                              ? '#dcfee6'
                              : agent.status == 'inactive'
                                ? '#ffe4e6'
                                : '#f3f4f6',
                          color:
                            agent.status == 'active'
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
                        handleDeleteAgent={handleDeleteAgent}
                        isViewingProfile={isViewingProfile}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      <AgentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgent(null);
        }}
        handleRefresh={() => {}}
        selectedAgent={selectedAgent}
        actionType={actionType}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete {agentToDelete?.organizationName || 'this agent'}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamTab;
