import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useNotification } from '@/hooks/useNotification';
import { usePermissions } from '@/context/AgentContext/permissions';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Grid,
  Stack,
  Avatar,
  Tooltip,
  FormControl,
  Select,
  InputAdornment,
  Alert,
} from '@mui/material';

import { MoreVert as MoreVertIcon, Search as SearchIcon } from '@mui/icons-material';
import { IconShield, IconShieldLock, IconUsers, IconX, IconDownload } from '@tabler/icons-react';

import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import PermissionAttachmentModal from '@/components/landlord/alc-manager/components/PermissionAttachmentModal';
import ViewPermissionModal from '@/components/landlord/alc-manager/components/ViewPermissionModal';
import NewRoleModal from '@/components/landlord/alc-manager/components/NewRoleModal';
import RoleOrganizationModal from '@/components/landlord/alc-manager/components/RoleOrganizationModal';
import AssignmentManagement from '@/components/landlord/alc-manager/components/AssignmentManagement';
import AccessAnalysis from '@/components/landlord/alc-manager/components/AccessAnalysis';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';

import aclApi from '@/api/landlord/acl/aclApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'ACL Manager' }];

// Avatar colors for role icons in table
const avatarColors = [
  { bg: '#E6F4EA', color: '#10B981' },
  { bg: '#F3E8FF', color: '#8B5CF6' },
  { bg: '#FEF3C7', color: '#F59E0B' },
  { bg: '#EFF6FF', color: '#3B82F6' },
  { bg: '#FCE7F3', color: '#EC4899' },
];

export const formatRoleName = (name) => {
  if (!name) return '—';
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ── Tour steps ────────────────────────────────────────────────────────────────
const roleTourSteps = [
  {
    selector: '[data-tour="acl-role-heading"]',
    content: (
      <StepContent
        title="Role Management"
        body="Create and manage landlord roles here. Use the New Role button to add a role, and the action menu on each row to edit roles or attach/view their permissions."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-new"]',
    content: (
      <StepContent
        title="New Role"
        body="Click 'New Role' to create a new role with a name and description."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-filter"]',
    content: (
      <StepContent
        title="Filters"
        body="Use the search bar, status & type filters, or More Filters to narrow down roles."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-table"]',
    content: (
      <StepContent
        title="Roles Table"
        body="Each row shows a role, description, assigned organizations/members, and status. Use the action buttons or menu (⋮) to attach/view permissions or view assigned organizations."
      />
    ),
  },
];

const assignTourSteps = [
  {
    selector: '[data-tour="acl-assign-heading"]',
    content: (
      <StepContent
        title="Permission Assignment"
        body="Assign roles and permissions to organizations. Search for an organization, then use the columns to assign roles or direct permissions."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-search"]',
    content: (
      <StepContent
        title="Search"
        body="Search for an organization by name to quickly find the one you want to manage."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-direct"]',
    content: (
      <StepContent
        title="Assign Direct Permission"
        body="Open the ⋮ (More) menu on any row and choose 'Assign Direct Permission'. Permissions are grouped by module — tick the ones to assign directly to the organization."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-view"]',
    content: (
      <StepContent
        title="View Permission"
        body="In the same ⋮ (More) menu, choose 'View Permission' to see all permissions attached to the organization. Check or uncheck permissions, then submit your changes."
      />
    ),
  },
];

const analysisTourSteps = [
  {
    selector: '[data-tour="acl-analysis-tabs"]',
    content: (
      <StepContent
        title="Access Analysis"
        body="Analyze access across your system using the Role Based or Permission Based views."
      />
    ),
  },
  {
    selector: '[data-tour="acl-analysis-content"]',
    content: (
      <StepContent
        title="Analysis Views"
        body="Role Based shows each role with its total permissions and the organizations assigned to it. Permission Based shows each permission with the roles and organization teams that use it. Click the numbers to drill down."
      />
    ),
  },
];

const AlcManager = () => {
  const notify = useNotification();
  const { can } = usePermissions();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('Role Management');

  // Modal States
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [viewPermissionModalOpen, setViewPermissionModalOpen] = useState(false);
  const [permissionsToView, setPermissionsToView] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [roleOrgsModalOpen, setRoleOrgsModalOpen] = useState(false);
  const [selectedRoleForOrgs, setSelectedRoleForOrgs] = useState(null);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    type: 'all',
  });

  const [totalRoles, setTotalRoles] = useState(0);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newRoleForm, setNewRoleForm] = useState({
    roleName: '',
    guardName: 'landlord',
    description: '',
  });

  const handleNewRoleFieldChange = (field, value) => {
    setNewRoleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [summaryData, setSummaryData] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };

      if (appliedFilters.search) params.name = appliedFilters.search;
      if (appliedFilters.type !== 'all') {
        params.is_sys = appliedFilters.type === 'system' ? 'yes' : 'no';
      }

      const res = await aclApi.getRoles(params);

      let rolesArray = [];
      if (Array.isArray(res?.data)) {
        rolesArray = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rolesArray = res.data.data;
      }

      if (res?.data?.summary) {
        setSummaryData(res.data.summary);
      }

      const total = res?.data?.total ?? (Array.isArray(rolesArray) ? rolesArray.length : 0);

      const enrichedRoles = (Array.isArray(rolesArray) ? rolesArray : []).map((role) => ({
        ...role,
        users_count: role.users_count ?? role.users?.length ?? 0,
        totalUsers: role.users_count ?? role.users?.length ?? 0,
      }));

      setRows(enrichedRoles);
      setTotalRoles(total);
    } catch (error) {
      setRows([]);
      notify.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, appliedFilters]);

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  // Stat summary calculations
  const stats = useMemo(() => {
    if (summaryData) {
      return {
        totalRoles: summaryData.total_roles ?? totalRoles,
        systemRoles: summaryData.system_roles ?? 0,
        customRoles: summaryData.custom_roles ?? 0,
        totalUsersAssigned: summaryData.total_users_assigned ?? 0,
      };
    }
    const totalCount = totalRoles || rows.length;
    const systemCount = rows.filter((r) => r.is_sys === 'yes' || r.is_system).length;
    const customCount = rows.filter((r) => r.is_sys !== 'yes' && !r.is_system).length;
    const totalUsersAssigned = rows.reduce((acc, r) => acc + (r.users_count || 0), 0);

    return {
      totalRoles: totalCount,
      systemRoles: systemCount,
      customRoles: customCount,
      totalUsersAssigned,
    };
  }, [rows, totalRoles, summaryData]);

  const handleApplySearch = () => {
    setAppliedFilters({
      search: searchInput.trim(),
      type: typeFilter,
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setTypeFilter('all');
    setAppliedFilters({ search: '', type: 'all' });
    setPage(0);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAttachPermission = async (row) => {
    try {
      setSelectedRow(row);
      const res = await aclApi.getRolePermissions(row.id);

      setSelectedPermissions(res?.data?.permissions ?? []);
      setAllPermissions(res?.data?.available_permissions ?? []);

      setPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load attached permissions');
    }
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => {
      const exists = prev.some((p) => p.id === permission.id);
      return exists ? prev.filter((p) => p.id !== permission.id) : [...prev, permission];
    });
  };

  const handleSavePermissions = async (permissions) => {
    try {
      const permissionsToSave = permissions || selectedPermissions;

      await aclApi.attachPermissions(
        selectedRow.id,
        permissionsToSave.map((p) => p.id),
      );

      notify.success('Permissions updated successfully!');
      setPermissionModalOpen(false);
      fetchRoles();
    } catch (err) {
      notify.error('Permission update failed');
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await aclApi.getAllPermissions();
      setAllPermissions(res?.data ?? []);
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleViewPermission = async (row) => {
    try {
      const res = await aclApi.getRolePermissions(row.id);
      setPermissionsToView(res.data?.permissions ?? []);
      setViewPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleOpenOrgsModal = (row) => {
    setSelectedRoleForOrgs(row);
    setRoleOrgsModalOpen(true);
    handleMenuClose();
  };

  const handleCreateRole = async () => {
    try {
      setSaveLoading(true);
      if (isEditing) {
        await aclApi.updateRole(selectedRow.id, {
          name: newRoleForm.roleName,
          description: newRoleForm.description,
        });
        notify.success('Role updated successfully!');
      } else {
        await aclApi.createRole({
          name: newRoleForm.roleName,
          guard_name: 'landlord',
          description: newRoleForm.description,
        });
        notify.success('Role created successfully!');
      }

      setNewRoleModalOpen(false);
      setNewRoleForm({
        roleName: '',
        guardName: 'landlord',
        description: '',
      });
      fetchRoles();
    } catch (err) {
      notify.error(
        err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} role`,
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditRole = (row) => {
    setSelectedRow(row);
    setIsEditing(true);
    setNewRoleForm({
      roleName: row.name,
      description: row.description || '',
      guardName: row.guard_name || 'landlord',
    });
    setNewRoleModalOpen(true);
    handleMenuClose();
  };

  const handleExportRoles = () => {
    if (!rows || rows.length === 0) {
      notify.error('No roles available to export');
      return;
    }

    const dataToExport = rows.map((row, index) => {
      const isCustom = row.is_sys !== 'yes' && !row.is_system;
      const uCount = row.users_count ?? row.totalUsers ?? 0;
      const uDate = row.updated_at
        ? new Date(row.updated_at).toLocaleDateString()
        : row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : '—';

      return {
        'S/N': index + 1,
        'Role Name': formatRoleName(row.name),
        Description: row.description || '—',
        Type: isCustom ? 'Custom Role' : 'System Role',
        'Assigned Users': uCount,
        'Last Updated': uDate,
      };
    });

    const headers = Object.keys(dataToExport[0]).join(',');
    const csvRows = dataToExport.map((r) =>
      Object.values(r)
        .map((val) => `"${val}"`)
        .join(','),
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `landlord_roles_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Roles exported successfully!');
  };

  const hasFilters = appliedFilters.search || appliedFilters.type !== 'all';

  return (
    <PageContainer title="ACL Manager" description="Access Control List Management Dashboard">
      <Breadcrumb title="ACL Manager" items={BCrumb} />

      {/* ── Navigation Tabs ── */}
      <Box
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          '& .MuiTabs-root': {
            minWidth: '300px',
          },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
        >
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Assignment Management" />
          <Tab label="Access Analysis" value="Analysis Report" />
        </Tabs>
      </Box>

      {activeTab === 'Assignment Management' && (
        <AclTourProvider steps={assignTourSteps} autoPlay storageKey="acl_assign_tour_seen">
          <AssignmentManagement />
        </AclTourProvider>
      )}
      {activeTab === 'Analysis Report' && (
        <AclTourProvider steps={analysisTourSteps} autoPlay storageKey="acl_analysis_tour_seen">
          <AccessAnalysis />
        </AclTourProvider>
      )}

      {activeTab === 'Role Management' && (
        <AclTourProvider steps={roleTourSteps} autoPlay storageKey="acl_role_tour_seen">
          <Box>
            {/* ── Summary Stat Cards ── */}
            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Total Roles"
                  title="Total Roles"
                  count={stats.totalRoles}
                  icon={IconShield}
                  color="primary"
                  subtitle="All defined roles"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="System Roles"
                  title="System Roles"
                  count={stats.systemRoles}
                  icon={IconShieldLock}
                  color="success"
                  subtitle="Platform default roles"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Custom Roles"
                  title="Custom Roles"
                  count={stats.customRoles}
                  icon={IconShield}
                  color="warning"
                  subtitle="Custom created roles"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  label="Assigned Users"
                  title="Assigned Users"
                  count={stats.totalUsersAssigned}
                  icon={IconUsers}
                  color="info"
                  subtitle="Users with roles"
                />
              </Grid>
            </Grid>

            <ParentCard
              title={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography variant="h5" data-tour="acl-role-heading">
                    Manage Roles
                  </Typography>
                  <ShowTourGuideButton />
                </Box>
              }
            >
              <Box sx={{ mb: 3 }} data-tour="acl-role-filter">
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems="center"
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                  >
                    <TextField
                      placeholder="Search role by name or description…"
                      size="small"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplySearch()}
                      sx={{ width: { xs: '100%', sm: 300, md: 340 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="system">System Roles</MenuItem>
                        <MenuItem value="custom">Custom Roles</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={handleApplySearch}
                      sx={{ px: 2.5, height: 40 }}
                    >
                      Search
                    </Button>

                    {hasFilters && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<IconX size={16} />}
                        onClick={handleClearFilters}
                        sx={{ height: 40, px: 2, textTransform: 'none' }}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}
                  >
                    {can('landlord.acl.roles.create') && (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        data-tour="acl-role-new"
                        onClick={() => {
                          setIsEditing(false);
                          setNewRoleForm({ roleName: '', guardName: 'landlord', description: '' });
                          setNewRoleModalOpen(true);
                        }}
                        sx={{ height: 40, px: 2.5, textTransform: 'none' }}
                      >
                        New Role
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<IconDownload size={18} />}
                      onClick={handleExportRoles}
                      sx={{ height: 40, px: 2, textTransform: 'none' }}
                    >
                      Export
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              {/* ── Roles Table ── */}
              <Box data-tour="acl-role-table">
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>S/N</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Assigned Users</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <CircularProgress size={28} />
                          </TableCell>
                        </TableRow>
                      ) : rows.length > 0 ? (
                        rows.map((row, index) => {
                          const isSysRole = row.is_sys === 'yes' || row.is_system;
                          const colorScheme = avatarColors[index % avatarColors.length];

                          return (
                            <TableRow key={row.id} hover>
                              <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Avatar
                                    sx={{
                                      bgcolor: colorScheme.bg,
                                      color: colorScheme.color,
                                      width: 34,
                                      height: 34,
                                    }}
                                  >
                                    {isSysRole ? (
                                      <IconShieldLock size={18} />
                                    ) : (
                                      <IconShield size={18} />
                                    )}
                                  </Avatar>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                      {formatRoleName(row.name)}
                                    </Typography>
                                    {isSysRole && (
                                      <Chip
                                        label="Protected"
                                        size="small"
                                        sx={{
                                          bgcolor: '#E6F4EA',
                                          color: '#10B981',
                                          fontSize: '10px',
                                          height: '18px',
                                          fontWeight: 700,
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ maxWidth: 280 }}
                                >
                                  {row.description || 'No description provided'}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={isSysRole ? 'System Role' : 'Custom Role'}
                                  size="small"
                                  sx={{
                                    bgcolor: isSysRole ? 'success.light' : 'secondary.light',
                                    color: isSysRole ? 'success.dark' : 'secondary.dark',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    borderRadius: '12px',
                                    px: 0.5,
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Tooltip title="Click to view assigned organizations & users">
                                  <Typography
                                    variant="body2"
                                    onClick={() => handleOpenOrgsModal(row)}
                                    sx={{
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      color: 'primary.main',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    <IconUsers size={16} />
                                    {row.users_count ?? row.totalUsers ?? 0} Users
                                  </Typography>
                                </Tooltip>
                              </TableCell>

                              <TableCell align="center">
                                <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                                  <MoreVertIcon />
                                </IconButton>

                                <Menu
                                  anchorEl={anchorEl}
                                  open={Boolean(anchorEl) && selectedRow?.id === row.id}
                                  onClose={handleMenuClose}
                                >
                                  <MenuItem onClick={() => handleViewPermission(row)}>
                                    View Permissions
                                  </MenuItem>
                                  {can('landlord.acl.roles.attach_permissions') && (
                                    <MenuItem onClick={() => handleAttachPermission(row)}>
                                      Attach Permissions
                                    </MenuItem>
                                  )}
                                  {!isSysRole && can('landlord.acl.roles.update') && (
                                    <MenuItem onClick={() => handleEditRole(row)}>
                                      Edit Role
                                    </MenuItem>
                                  )}
                                  <MenuItem onClick={() => handleOpenOrgsModal(row)}>
                                    View Assigned Users
                                  </MenuItem>
                                </Menu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Alert
                              severity="info"
                              sx={{ justifyContent: 'center', textAlign: 'center' }}
                            >
                              {hasFilters
                                ? 'No roles match the current filters.'
                                : 'No roles available. Create a new role to get started.'}
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>

                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          rowsPerPageOptions={[10, 20, 50]}
                          count={totalRoles}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={(_, newPage) => setPage(newPage)}
                          onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                          }}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              </Box>
            </ParentCard>
          </Box>
        </AclTourProvider>
      )}

      {/* ── Modals ── */}
      <PermissionAttachmentModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        selectedRow={selectedRow}
        availablePermissions={allPermissions}
        selectedPermissions={selectedPermissions || []}
        permissionSearch={permissionSearch}
        onPermissionSearchChange={setPermissionSearch}
        onPermissionChange={handlePermissionChange}
        onSave={handleSavePermissions}
      />

      <ViewPermissionModal
        open={viewPermissionModalOpen}
        onClose={() => setViewPermissionModalOpen(false)}
        selectedRow={selectedRow}
        permissionsToView={permissionsToView}
      />

      <NewRoleModal
        open={newRoleModalOpen}
        onClose={() => setNewRoleModalOpen(false)}
        formData={newRoleForm}
        onFieldChange={handleNewRoleFieldChange}
        onSave={handleCreateRole}
        isEditing={isEditing}
        loading={saveLoading}
      />

      <RoleOrganizationModal
        open={roleOrgsModalOpen}
        onClose={() => setRoleOrgsModalOpen(false)}
        roleId={selectedRoleForOrgs?.id}
        roleName={selectedRoleForOrgs?.name}
      />
    </PageContainer>
  );
};

export default AlcManager;
