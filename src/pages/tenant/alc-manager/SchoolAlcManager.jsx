import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useNotification } from '@/hooks/useNotification';

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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  InputLabel,
  Avatar,
  Tooltip,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

import {
  IconAdjustmentsHorizontal,
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconShieldLock,
  IconShield,
} from '@tabler/icons-react';

import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import FilterSideDrawer from '@/components/shared/FilterSideDrawer';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import PermissionAttachmentModal from '@/components/tenant/alc-manager/SchoolPermissionAttachmentModal';
import ViewPermissionModal from '@/components/tenant/alc-manager/SchoolViewPermissionModal';
import NewRoleModal from '@/components/tenant/alc-manager/SchoolNewRoleModal';
import SchoolRoleUsersModal from '@/components/tenant/alc-manager/SchoolRoleUsersModal';
import SchoolAssignmentManagement from '@/components/tenant/alc-manager/SchoolAssignmentManagement';
import SchoolAccessAnalysis from '@/components/tenant/alc-manager/SchoolAccessAnalysis';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';

import aclApi from '@/api/tenant/acl/aclApi';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'ACL Manager' }];

// Avatar colors for role icons in table
const avatarColors = [
  { bg: '#E6F4EA', color: '#10B981' },
  { bg: '#F3E8FF', color: '#8B5CF6' },
  { bg: '#FEF3C7', color: '#F59E0B' },
  { bg: '#EFF6FF', color: '#3B82F6' },
  { bg: '#FCE7F3', color: '#EC4899' },
];

// ── Tour steps ────────────────────────────────────────────────────────────────
const roleTourSteps = [
  {
    selector: '[data-tour="acl-role-heading"]',
    content: (
      <StepContent
        title="Role Management"
        body="Create and manage roles here. Use the New Role button to add a role, and the action menu on each row to attach or view its permissions."
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
        body="Each row shows a role, description, assigned users, and status. Use the action buttons or menu (⋮) to attach/view permissions or view users."
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
        body="Assign roles and permissions to users. Search for a user, then use the columns to assign roles or direct permissions."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-search"]',
    content: (
      <StepContent
        title="Search"
        body="Search for a user by name to quickly find the one you want to manage."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-direct"]',
    content: (
      <StepContent
        title="Assign Direct Permission"
        body="Open the ⋮ (More) menu on any row and choose 'Assign Direct Permission'. Permissions are grouped by module — tick the ones to assign directly to the user."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-view"]',
    content: (
      <StepContent
        title="View Permission"
        body="In the same ⋮ (More) menu, choose 'View Permission' to see all permissions attached to the user. Check or uncheck permissions, then submit your changes."
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
        body="Analyze access across your school using the Role Based or Permission Based views."
      />
    ),
  },
  {
    selector: '[data-tour="acl-analysis-content"]',
    content: (
      <StepContent
        title="Analysis Views"
        body="Role Based shows each role with its total permissions and the users assigned to it. Permission Based shows each permission with the roles and users that use it. Click the numbers to drill down."
      />
    ),
  },
];

const SchoolAlcManager = () => {
  const notify = useNotification();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('Role Management');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [viewPermissionModalOpen, setViewPermissionModalOpen] = useState(false);
  const [permissionsToView, setPermissionsToView] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [roleUsersModalOpen, setRoleUsersModalOpen] = useState(false);
  const [selectedRoleForUsers, setSelectedRoleForUsers] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [totalRoles, setTotalRoles] = useState(0);
  const [roleStats, setRoleStats] = useState(null);
  const [allSystemRoles, setAllSystemRoles] = useState([]);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const schoolFilterDefs = [
    { key: 'name', label: 'Role Name', type: 'text', placeholder: 'Search by role name…' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Search description…' },
  ];

  const [newRoleForm, setNewRoleForm] = useState({
    roleName: '',
    guardName: 'web',
    description: '',
  });

  const handleNewRoleFieldChange = (field, value) => {
    setNewRoleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };

      // Add filter parameters
      Object.keys(activeFilters).forEach((key) => {
        if (activeFilters[key]) {
          params[key] = activeFilters[key];
        }
      });

      const [res, analyticsRes, allRolesRes, summaryStatsRes] = await Promise.allSettled([
        aclApi.getSchoolRoles(params),
        aclApi.getSchoolRoleAnalytics({ per_page: 100 }),
        aclApi.getSchoolRoles({ without_pagination: true }),
        aclApi.getSchoolRoleSummaryStats(),
      ]);

      const rolesResponse = res.status === 'fulfilled' ? res.value : null;
      const analyticsResponse = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null;
      const allRolesResponse = allRolesRes.status === 'fulfilled' ? allRolesRes.value : null;
      const summaryStatsResponse = summaryStatsRes.status === 'fulfilled' ? summaryStatsRes.value : null;

      if (summaryStatsResponse?.data) {
        setRoleStats(summaryStatsResponse.data);
      }

      let rolesArray = rolesResponse?.data?.data ?? rolesResponse?.data ?? [];
      const total = rolesResponse?.data?.total ?? (Array.isArray(rolesArray) ? rolesArray.length : 0);

      if (!Array.isArray(rolesArray)) rolesArray = [];

      let fetchedAllRoles = allRolesResponse?.data?.data ?? allRolesResponse?.data ?? [];
      if (!Array.isArray(fetchedAllRoles)) fetchedAllRoles = [];
      setAllSystemRoles(fetchedAllRoles);

      const analyticsData = analyticsResponse?.data?.data ?? analyticsResponse?.data ?? [];
      const analyticsMap = {};
      if (Array.isArray(analyticsData)) {
        analyticsData.forEach((item) => {
          if (item.id) analyticsMap[item.id] = item;
          if (item.role) analyticsMap[item.role.toLowerCase()] = item;
          if (item.name) analyticsMap[item.name.toLowerCase()] = item;
        });
      }

      const enrichedRoles = rolesArray.map((role) => {
        const match =
          analyticsMap[role.id] ||
          (role.name ? analyticsMap[role.name.toLowerCase()] : null);

        const count =
          role.users_count ??
          role.totalUsers ??
          role.total_users ??
          role.user_count ??
          role.assigned_users_count ??
          match?.totalUsers ??
          match?.users_count ??
          match?.total_users ??
          (Array.isArray(role.users) ? role.users.length : 0);

        return {
          ...role,
          users_count: count,
          totalUsers: count,
        };
      });

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
    fetchAllPermissions();
  }, [page, rowsPerPage, activeFilters]);

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
      const res = await aclApi.getSchoolAllRolePermissions(row.id);
      setSelectedPermissions(res?.data ?? []);

      setPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load attached permissions');
    }
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => {
      if (!Array.isArray(prev)) {
        return [permission];
      }
      const exists = prev.some((p) => p.id === permission.id);

      return exists ? prev.filter((p) => p.id !== permission.id) : [...prev, permission];
    });
  };

  const handleSavePermissions = async () => {
    try {
      if (!selectedPermissions || selectedPermissions.length === 0) {
        notify.error('Please select at least one permission');
        return;
      }

      const response = await aclApi.attachSchoolRolePermissions(
        selectedRow.id,
        selectedPermissions.map((p) => p.name),
      );

      if (response.status) {
        notify.success('Permissions updated successfully!');
        setPermissionModalOpen(false);
        fetchRoles();
      } else {
        if (response.errors) {
          notify.error(
            response.errors.permissions?.[0] || response.message || 'Failed to update permissions',
          );
        } else {
          notify.error(response.message || 'Failed to update permissions');
        }
      }
    } catch (err) {
      console.error('Save permissions error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        notify.error(errorMessages[0] || 'Validation failed');
      } else {
        notify.error(err.response?.data?.message || 'Permission update failed');
      }
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await aclApi.getSchoolAllPermissions();
      setAllPermissions(res?.data ?? []);
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleViewPermissions = async (row) => {
    try {
      setSelectedRow(row);
      const res = await aclApi.getSchoolAllRolePermissions(row.id);
      setPermissionsToView(res.data ?? []);
      setViewPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleViewUsers = (row) => {
    setSelectedRoleForUsers(row);
    setRoleUsersModalOpen(true);
    handleMenuClose();
  };

  const handleToggleRoleStatus = async (row) => {
    const isCurrentlyActive = row.status !== 'Inactive' && row.status !== 'inactive';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const assignedUsers = Number(row.users_count ?? row.totalUsers ?? row.total_users ?? (Array.isArray(row.users) ? row.users.length : 0));

    if (isCurrentlyActive && assignedUsers > 0) {
      notify.error(`Cannot deactivate "${row.name}". Please remove all assigned users from this role first.`);
      handleMenuClose();
      return;
    }

    try {
      if (row.id) {
        await aclApi.updateSchoolRole(row.id, {
          name: row.name,
          status: newStatus.toLowerCase(),
          is_active: !isCurrentlyActive,
        });
      }
      notify.success(`Role ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully!`);
      await fetchRoles();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update role status');
    } finally {
      handleMenuClose();
    }
  };

  const [convertConfirmOpen, setConvertConfirmOpen] = useState(false);
  const [roleToConvert, setRoleToConvert] = useState(null);
  const [converting, setConverting] = useState(false);

  const handleOpenConvertConfirm = (row) => {
    setRoleToConvert(row);
    setConvertConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmConvertToSystem = async () => {
    if (!roleToConvert || converting) return;
    setConverting(true);
    try {
      await aclApi.updateSchoolRole(roleToConvert.id, {
        name: roleToConvert.name,
        is_sys: 'yes',
      });
      notify.success(`Role "${roleToConvert.name}" converted to System Role successfully!`);
      setConvertConfirmOpen(false);
      setRoleToConvert(null);
      await fetchRoles();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to convert role to System Role');
    } finally {
      setConverting(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      await aclApi.createSchoolRole({
        name: newRoleForm.roleName,
        guard_name: newRoleForm.guardName,
        description: newRoleForm.description,
      });

      notify.success('Role created successfully!');

      setNewRoleModalOpen(false);

      setNewRoleForm({
        roleName: '',
        guardName: 'web',
        description: '',
      });

      fetchRoles();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to create role');
    }
  };

  // ── Stat calculations ──────────────────────────────────────────────────────
  const statsData = useMemo(() => {
    if (roleStats) {
      return roleStats;
    }

    const source = allSystemRoles.length > 0 ? allSystemRoles : rows;
    const total = totalRoles || source.length || 0;

    const active = source.filter(
      (r) => r.status === 'Active' || r.status === 'active' || r.is_active === true || (r.status === undefined && r.is_active === undefined),
    ).length;

    const inactive = source.filter(
      (r) => r.status === 'Inactive' || r.status === 'inactive' || r.is_active === false,
    ).length;

    const custom = source.filter(
      (r) => r.guard_name === 'web' || r.type === 'Custom' || r.is_system === false,
    ).length;

    const protectedCount = source.filter(
      (r) =>
        r.is_protected ||
        r.is_system ||
        ['super admin', 'admin', 'school admin', 'bursar', 'teacher', 'student', 'parent'].some((p) => r.name?.toLowerCase()?.includes(p)),
    ).length;

    return {
      total,
      active,
      inactive,
      custom,
      protectedCount,
    };
  }, [roleStats, allSystemRoles, rows, totalRoles]);

  // ── Filtered Rows ──────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!rows || !Array.isArray(rows)) return [];

    return rows.filter((row) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = row?.name?.toLowerCase()?.includes(q);
        const descMatch = row?.description?.toLowerCase()?.includes(q);
        if (!nameMatch && !descMatch) return false;
      }

      if (statusFilter !== 'all') {
        const rowStatus = (row?.status || (row?.is_active === false ? 'inactive' : 'active')).toLowerCase();
        if (rowStatus !== statusFilter.toLowerCase()) return false;
      }

      if (typeFilter !== 'all') {
        const isSystem = row?.is_sys === 'yes' || row?.is_system === true;
        const isCustom = row?.is_sys === 'no' || (!isSystem && (row?.guard_name === 'web' || row?.type === 'Custom' || row?.is_system === false));

        if (typeFilter === 'custom' && !isCustom) return false;
        if (typeFilter === 'system' && !isSystem) return false;
      }

      return true;
    });
  }, [rows, searchQuery, statusFilter, typeFilter]);

  const handleExportRoles = () => {
    if (!filteredRows || filteredRows.length === 0) {
      notify.error('No roles available to export');
      return;
    }

    const dataToExport = filteredRows.map((row, index) => {
      const isCustom = row.guard_name === 'web' || row.type === 'Custom' || row.is_system === false;
      const uCount = row.users_count ?? (Array.isArray(row.users) ? row.users.length : row.total_users ?? 0);
      const rStatus = row.status || (row.is_active === false ? 'Inactive' : 'Active');
      const uDate = row.updated_at
        ? new Date(row.updated_at).toLocaleDateString()
        : row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : '—';

      return {
        'S/N': index + 1,
        'Role Name': row.name,
        Description: row.description || '—',
        Type: isCustom ? 'Custom' : 'System',
        Users: uCount,
        Status: rStatus,
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
    link.setAttribute('download', `roles_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Roles exported successfully!');
  };

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setPage(0);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(0);
  };

  const hasFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all' || activeFilterCount > 0;

  return (
    <PageContainer title="Acl Manager" description="Access Control List Management for School">
      <Breadcrumb title="ACL Manager" items={BCrumb} />

      {/* Top Header with Tabs & Primary Actions */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
          pb: 0.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '15px',
              textTransform: 'none',
              minHeight: 44,
            },
          }}
        >
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Permission Assignment" />
          <Tab label="Access Analysis" value="Access Analysis" />
        </Tabs>

        {activeTab === 'Role Management' && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <ShowTourGuideButton />
            <Button
              variant="contained"
              size="small"
              color="primary"
              data-tour="acl-role-new"
              onClick={() => setNewRoleModalOpen(true)}
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 0.8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              New Role
            </Button>
          </Box>
        )}
      </Box>

      {activeTab === 'Role Management' && (
        <AclTourProvider steps={roleTourSteps} autoPlay storageKey="acl_role_tour_seen">
          {/* Analysis / Summary Metric Cards */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={statsData.total}
                  label="Total Roles"
                  subtitle="All system roles"
                  icon={IconUsers}
                  colorIndex={0}
                  loading={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={statsData.active}
                  label="Active Roles"
                  subtitle="Currently active"
                  icon={IconUserCheck}
                  colorIndex={1}
                  loading={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={statsData.inactive}
                  label="Inactive Roles"
                  subtitle="Temp. disabled"
                  icon={IconUserOff}
                  colorIndex={2}
                  loading={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={statsData.custom}
                  label="Custom Roles"
                  subtitle="Created by school"
                  icon={IconUserPlus}
                  colorIndex={3}
                  loading={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <StatCard
                  count={statsData.protectedCount}
                  label="Protected Roles"
                  subtitle="System roles"
                  icon={IconShieldLock}
                  colorIndex={4}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>

          <ParentCard>
            {/* Table Header Filter & Action Toolbar */}
            <Box
              sx={{
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  flexGrow: 1,
                }}
              >
                <TextField
                  placeholder="Search roles by name or description..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    minWidth: { xs: '100%', sm: 280, md: 320 },
                    '& .MuiOutlinedInput-root': {
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Status: All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">Type: All</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>

                {/* <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconAdjustmentsHorizontal size={18} />}
                  onClick={() => setFilterDrawerOpen(true)}
                  data-tour="acl-role-filter"
                  sx={{
                    px: 2,
                    py: 0.8,
                    color: 'text.primary',
                    borderColor: 'divider',
                    fontWeight: activeFilterCount > 0 ? 700 : 500,
                  }}
                >
                  More Filters
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
                </Button> */}

                {hasFilters && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleFilterReset}
                  >
                    Clear Filter
                  </Button>
                )}

              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<IconUserPlus size={18} />}
                  onClick={() => setNewRoleModalOpen(true)}
                  data-tour="acl-role-create"
                  sx={{
                    px: 2,
                    py: 0.8,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                  }}
                >
                  New Role
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExportIcon fontSize="small" />}
                  onClick={handleExportRoles}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Export
                </Button>

              </Box>
            </Box>

            {/* Table Container */}
            <Box data-tour="acl-role-table">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 60, fontWeight: 700 }}>S/N</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Updated</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : filteredRows.length > 0 ? (
                      filteredRows.map((row, index) => {
                        const isSystemRole = row.is_sys === 'yes' || row.is_system === true;
                        const isProtectedRole =
                          isSystemRole ||
                          row.is_protected ||
                          ['super admin', 'admin', 'bursar', 'school admin', 'teacher', 'student', 'parent'].some((p) => row.name?.toLowerCase()?.includes(p));

                        const isCustomRole = row.is_sys === 'no' || (!isSystemRole && (row.guard_name === 'web' || row.type === 'Custom' || row.is_system === false));
                        const colorTheme = avatarColors[index % avatarColors.length];
                        const userCount = row.users_count ?? (Array.isArray(row.users) ? row.users.length : row.total_users ?? 0);
                        const roleStatusLabel = row.status ? (row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()) : (row.is_active === false ? 'Inactive' : 'Active');

                        const dateFormatted = row.updated_at
                          ? new Date(row.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                          : row.created_at
                            ? new Date(row.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                            : '—';

                        const rawUpdater = row.updated_by || row.created_by || row.updater?.name || row.updater_role;
                        const updatedByPerson = rawUpdater
                          ? (rawUpdater.toLowerCase().startsWith('by ') ? rawUpdater.slice(3) : rawUpdater)
                          : 'Super Admin';

                        return (
                          <TableRow key={row.id || index} hover>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: colorTheme.bg,
                                    color: colorTheme.color,
                                  }}
                                >
                                  <IconUsers size={20} />
                                </Avatar>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                    {row.name}
                                  </Typography>
                                  {isProtectedRole && (
                                    <Chip
                                      label="Protected"
                                      size="small"
                                      sx={{
                                        bgcolor: '#E6F7F0',
                                        color: '#059669',
                                        fontSize: '11px',
                                        height: '20px',
                                        fontWeight: 700,
                                        borderRadius: '6px',
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ maxWidth: 280 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.5,
                                }}
                              >
                                {row.description || '—'}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={row.is_sys === 'yes' ? 'System' : (row.is_sys === 'no' ? 'Custom' : (isCustomRole ? 'Custom' : 'System'))}
                                size="small"
                                sx={{
                                  bgcolor: (row.is_sys === 'no' || isCustomRole) ? '#EFF6FF' : '#E6F7F0',
                                  color: (row.is_sys === 'no' || isCustomRole) ? '#2563EB' : '#059669',
                                  fontWeight: 600,
                                  borderRadius: '12px',
                                  px: 1,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <IconUsers size={16} style={{ color: '#6B7280' }} />
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {userCount}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                  onClick={() => handleViewUsers(row)}
                                >
                                  View users
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={roleStatusLabel}
                                size="small"
                                sx={{
                                  bgcolor: roleStatusLabel === 'Inactive' ? '#FEF2F2' : '#DCFCE7',
                                  color: roleStatusLabel === 'Inactive' ? '#DC2626' : '#16A34A',
                                  fontWeight: 600,
                                  borderRadius: '12px',
                                  px: 1,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {dateFormatted}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  by {updatedByPerson}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell align="center">
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>

                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedRow?.id === row.id}
                                onClose={handleMenuClose}
                              >
                                <MenuItem onClick={() => handleAttachPermission(row)}>
                                  Attach Permission
                                </MenuItem>
                                <MenuItem onClick={() => handleViewPermissions(row)}>
                                  View Permission
                                </MenuItem>
                                <MenuItem onClick={() => handleViewUsers(row)}>
                                  View Users
                                </MenuItem>
                                {isCustomRole && (
                                  <MenuItem onClick={() => handleOpenConvertConfirm(row)} sx={{ color: 'error.main' }}>
                                    Make System Role
                                  </MenuItem>
                                )}
                                {row.status === 'Inactive' || row.status === 'inactive' ? (
                                  <MenuItem onClick={() => handleToggleRoleStatus(row)} sx={{ color: 'success.main' }}>
                                    Activate Role
                                  </MenuItem>
                                ) : (
                                  <MenuItem onClick={() => handleToggleRoleStatus(row)} sx={{ color: 'error.main' }}>
                                    Deactivate Role
                                  </MenuItem>
                                )}
                              </Menu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Alert
                            severity="info"
                            sx={{
                              mb: 3,
                              justifyContent: 'center',
                              textAlign: 'center',
                              '& .MuiAlert-icon': {
                                mr: 1.5,
                              },
                            }}
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
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        count={hasFilters ? filteredRows.length : totalRoles}
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
        </AclTourProvider>
      )}

      {activeTab === 'Permission Assignment' && (
        <AclTourProvider steps={assignTourSteps} autoPlay storageKey="acl_assign_tour_seen">
          <SchoolAssignmentManagement />
        </AclTourProvider>
      )}

      {activeTab === 'Access Analysis' && (
        <AclTourProvider steps={analysisTourSteps} autoPlay storageKey="acl_analysis_tour_seen">
          <SchoolAccessAnalysis />
        </AclTourProvider>
      )}

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

      <SchoolRoleUsersModal
        open={roleUsersModalOpen}
        onClose={() => setRoleUsersModalOpen(false)}
        role={selectedRoleForUsers}
        onUserRemoved={fetchRoles}
      />

      <NewRoleModal
        open={newRoleModalOpen}
        onClose={() => setNewRoleModalOpen(false)}
        formData={newRoleForm}
        onFieldChange={handleNewRoleFieldChange}
        onSave={handleCreateRole}
      />

      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={schoolFilterDefs}
        activeFilters={activeFilters}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />

      <ConfirmationDialog
        open={convertConfirmOpen}
        onClose={() => {
          setConvertConfirmOpen(false);
          setRoleToConvert(null);
        }}
        onConfirm={handleConfirmConvertToSystem}
        title="Convert to System Role?"
        message={
          <Typography component="span" variant="body2" color="text.secondary">
            Are you sure you want to convert{' '}
            <Typography component="span" variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
              {roleToConvert?.name} Role
            </Typography>{' '}
            to a System Role? This action cannot be undone.
          </Typography>
        }
        confirmText="Make System Role"
        cancelText="Cancel"
        severity="error"
        cancelButtonSx={{
          border: '1px solid #D1D5DB',
          bgcolor: 'transparent',
          color: '#374151',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#F9FAFB',
            borderColor: '#9CA3AF',
            boxShadow: 'none',
          },
        }}
        confirmButtonSx={{
          bgcolor: 'error.main',
          color: '#ffffff',
          '&:hover': {
            bgcolor: 'error.dark',
          },
        }}
        loading={converting}
      />
    </PageContainer>
  );
};

export default SchoolAlcManager;

