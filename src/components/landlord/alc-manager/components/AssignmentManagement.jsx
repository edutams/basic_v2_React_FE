import React, { useState, useMemo, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  MenuItem as SelectMenuItem,
  ListItemIcon,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconShieldCheck,
  IconEye,
  IconKey,
  IconLock,
} from '@tabler/icons-react';
import RoleAttachmentModal from './RoleAttachmentModal';
import ViewRoleModal from './ViewRoleModal';
import DirectPermissionModal from './DirectPermissionModal';
import ViewDirectPermissionModal from './ViewDirectPermissionModal';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import aclApi from '@/api/landlord/acl/aclApi';
import { useNotification } from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import { usePermissions } from '@/context/AgentContext/permissions';
import { formatRoleName } from './PermissionBased';

const AssignmentManagement = () => {
  const notify = useNotification();
  const { can } = usePermissions();
  const { user: currentUser } = useAuth();
  const currentUserLevel = currentUser?.access_level;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [currentOrganizationForRole, setCurrentOrganizationForRole] = useState(null);
  const [directPermissionModalOpen, setDirectPermissionModalOpen] = useState(false);
  const [viewDirectPermissionModalOpen, setViewDirectPermissionModalOpen] = useState(false);

  const [nameFilterInput, setNameFilterInput] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    role: 'all',
    status: 'all',
    level: '',
  });

  const [summaryData, setSummaryData] = useState(null);

  const fetchUsers = async (customFilters = appliedFilters) => {
    try {
      setLoading(true);
      const params = {};
      if (customFilters.name) params.search = customFilters.name;
      if (customFilters.role && customFilters.role !== 'all') params.role = customFilters.role;
      if (customFilters.status && customFilters.status !== 'all') params.status = customFilters.status;
      if (customFilters.level) params.level = customFilters.level;

      const res = await aclApi.getAgents(params);

      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      if (res.data?.summary) {
        setSummaryData(res.data.summary);
      }

      const normalized = (usersData || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image || '/src/assets/images/users/default_avatar.png',
        organization_name: u.organization_name,
        organization_code: u.organization_code,
        organization_logo: u.organization_logo,
        organization_email: u.organization_email,
        level: u.level || null,
        parent_id: u.parent_id || null,
        status: u.status || 'active',
        assignedRoles: u.roles || [],
        last_active_at: u.last_active_at || null,
      }));

      setUsers(normalized);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesList = async () => {
    try {
      const res = await aclApi.getRolesList();
      const fetched = res?.data?.data || res?.data || res || [];
      if (Array.isArray(fetched)) {
        setAvailableRoles(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch roles list:', err);
    }
  };

  useEffect(() => {
    fetchUsers({ name: '', role: 'all', status: 'all', level: '' });
    fetchRolesList();
  }, []);

  const userStats = useMemo(() => {
    if (summaryData) {
      return {
        total: summaryData.total ?? users.length,
        assigned: summaryData.assigned ?? 0,
        unassigned: summaryData.unassigned ?? 0,
        multiRole: summaryData.multiRole ?? 0,
      };
    }
    const total = users.length;
    const assigned = users.filter((u) => u.assignedRoles && u.assignedRoles.length > 0).length;
    const unassigned = total - assigned;
    const multiRole = users.filter((u) => u.assignedRoles && u.assignedRoles.length > 1).length;

    return {
      total,
      assigned,
      unassigned,
      multiRole,
    };
  }, [users, summaryData]);
  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleSx = (role) => {
    const rawRole = role?.toString() || '';
    const normalizedRole = rawRole.toLowerCase().trim().replace(/[\s_]+/g, '_');

    const roleStyles = {
      super_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.dark,
      },
      agent: {
        backgroundColor: (theme) => theme.palette.success.light,
        color: (theme) => theme.palette.success.dark,
      },
      team_member: {
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.dark,
      },
    };

    if (roleStyles[normalizedRole]) {
      return roleStyles[normalizedRole];
    }

    // Theme palette generator for ANY newly created role
    const themePalettes = [
      { backgroundColor: (theme) => theme.palette.primary.light, color: (theme) => theme.palette.primary.dark },
      { backgroundColor: (theme) => theme.palette.secondary.light, color: (theme) => theme.palette.secondary.dark },
      { backgroundColor: (theme) => theme.palette.success.light, color: (theme) => theme.palette.success.dark },
      { backgroundColor: (theme) => theme.palette.info.light, color: (theme) => theme.palette.info.dark },
      { backgroundColor: (theme) => theme.palette.warning.light, color: (theme) => theme.palette.warning.dark },
      { backgroundColor: (theme) => theme.palette.error.light, color: (theme) => theme.palette.error.dark },
    ];

    let hash = 0;
    for (let i = 0; i < rawRole.length; i++) {
      hash = rawRole.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % themePalettes.length;
    return themePalettes[index];
  };

  const getLevelChipSx = (level) => {
    const levelNum = parseInt(level, 10);

    const levelStyles = {
      1: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
      2: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.secondary.main,
      },
      3: {
        backgroundColor: (theme) => theme.palette.success.light,
        color: (theme) => theme.palette.success.main,
      },
      4: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
      5: {
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.main,
      },
    };

    return (
      levelStyles[levelNum] || {
        backgroundColor: (theme) => theme.palette.grey[300],
        color: (theme) => theme.palette.grey[700],
      }
    );
  };

  const handleRoleSelection = async (roleIds) => {
    if (!currentOrganizationForRole) return;

    const getCurrentRoleIds = () => {
      const roles = currentOrganizationForRole.assignedRoles || [];
      return roles.map((r) => {
        if (typeof r === 'object' && r.id !== undefined) {
          return r.id;
        }
        return r;
      });
    };

    const currentRoleIds = getCurrentRoleIds();
    const addedRoles = roleIds.filter((id) => !currentRoleIds.includes(id));
    const removedRoles = currentRoleIds.filter((id) => !roleIds.includes(id));

    let actionType = '';
    if (addedRoles.length > 0 && removedRoles.length > 0) {
      actionType = 'updated';
    } else if (removedRoles.length > 0) {
      actionType = 'removed';
    } else {
      actionType = 'added';
    }

    try {
      const assignRes = await aclApi.assignAgentRole(currentOrganizationForRole.id, roleIds);

      const res = await aclApi.getAgents();
      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      // Map organization data to user format for the UI (same as fetchUsers)
      const normalized = (usersData || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image || '/src/assets/images/users/default_avatar.png',
        organization_name: u.organization_name,
        organization_code: u.organization_code,
        organization_logo: u.organization_logo,
        organization_email: u.organization_email,
        level: u.level || null,
        parent_id: u.parent_id || null,
        status: u.status || 'active',
        assignedRoles: u.roles || [],
        last_active_at: u.last_active_at || null,
      }));

      setUsers(normalized);

      const updatedCurrentAgent = normalized.find((u) => u.id === currentOrganizationForRole.id);
      if (updatedCurrentAgent) {
        setCurrentOrganizationForRole(updatedCurrentAgent);
      }

      if (actionType === 'added') {
        notify.success('Role(s) attached successfully!');
      } else if (actionType === 'removed') {
        notify.success('Role(s) removed successfully!');
      } else {
        notify.success('Roles updated successfully!');
      }
      setRoleAttachmentModalOpen(false);
    } catch (err) {
      console.error('Failed to assign roles:', err);
      if (actionType === 'removed') {
        notify.error(err?.response?.data?.message || 'Failed to remove role(s)');
      } else {
        notify.error(err?.response?.data?.message || 'Failed to attach role(s)');
      }
    }
  };

  const handleDirectPermissionSave = async (permissions) => {
    if (!currentOrganizationForRole) return;

    try {
      await aclApi.assignAgentDirectPermissions(currentOrganizationForRole.id, permissions);
      notify.success('Direct permissions assigned successfully!');
      setDirectPermissionModalOpen(false);
      fetchUsers();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to assign direct permissions');
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setCurrentOrganizationForRole(row);
      setRoleAttachmentModalOpen(true);
    } else if (action === 'view') {
      setCurrentOrganizationForRole(row);
      setViewRoleModalOpen(true);
    } else if (action === 'directPermission') {
      setCurrentOrganizationForRole(row);
      setDirectPermissionModalOpen(true);
    } else if (action === 'viewDirectPermission') {
      setCurrentOrganizationForRole(row);
      setViewDirectPermissionModalOpen(true);
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (user) => {
    try {
      handleMenuClose();
      await aclApi.toggleAgentStatus(user.id);
      const actionText = user.status?.toLowerCase() === 'active' ? 'deactivated' : 'activated';
      notify.success(`User successfully ${actionText}!`);
      fetchUsers();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleViewDirectPermissionSave = async (permissions) => {
    if (!currentOrganizationForRole) return;

    try {
      await aclApi.assignAgentDirectPermissions(currentOrganizationForRole.id, permissions);
      notify.success('Permissions updated successfully!');
      setViewDirectPermissionModalOpen(false);
      fetchUsers();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update permissions');
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const term = appliedFilters.name.toLowerCase();
      const matchesName =
        !appliedFilters.name ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.organization_name?.toLowerCase().includes(term) ||
        user.organization_code?.toLowerCase().includes(term);

      let matchesRole = true;
      if (appliedFilters.role && appliedFilters.role !== 'all') {
        matchesRole = user.assignedRoles?.some((r) => {
          const rName = typeof r === 'object' ? r.name : r;
          const rId = typeof r === 'object' ? r.id : r;
          return (
            String(rId).toLowerCase() === String(appliedFilters.role).toLowerCase() ||
            String(rName).toLowerCase() === String(appliedFilters.role).toLowerCase()
          );
        });
      }

      let matchesStatus = true;
      if (appliedFilters.status && appliedFilters.status !== 'all') {
        const uStatus = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase();
        matchesStatus = uStatus === appliedFilters.status.toLowerCase();
      }

      return matchesName && matchesRole && matchesStatus;
    });

    const currentUserId = currentUser?.id;
    if (currentUserLevel && currentUserLevel > 1) {
      filtered = filtered.filter((user) => {
        if (user.id === currentUserId) {
          return false;
        }
        return user.parent_id === currentUserId;
      });
    }

    if (appliedFilters.level !== '') {
      filtered = filtered.filter((user) => {
        const userLevel = parseInt(user.level, 10);
        return userLevel === parseInt(appliedFilters.level, 10);
      });
    }

    return filtered;
  }, [users, appliedFilters, currentUserLevel, currentUser]);

  const paginatedFilteredUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const resetFilters = () => {
    setNameFilterInput('');
    setRoleFilter('all');
    setStatusFilter('all');
    setLevelFilter('');
    const emptyFilters = { name: '', role: 'all', status: 'all', level: '' };
    setAppliedFilters(emptyFilters);
    setPage(0);
    fetchUsers(emptyFilters);
  };

  const handleSearch = () => {
    const newFilters = {
      name: nameFilterInput,
      role: roleFilter,
      status: statusFilter,
      level: levelFilter,
    };
    setAppliedFilters(newFilters);
    setPage(0);
    fetchUsers(newFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasFilters =
    nameFilterInput !== '' ||
    roleFilter !== 'all' ||
    statusFilter !== 'all' ||
    levelFilter !== '' ||
    appliedFilters.name !== '' ||
    appliedFilters.role !== 'all' ||
    appliedFilters.status !== 'all' ||
    appliedFilters.level !== '';

  return (
    <Box>
      {/* ── Summary Stat Cards ── */}
      <Grid container spacing={2} mb={3} data-tour="acl-assign-stats">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Users"
            count={userStats.total}
            icon={IconUsers}
            color="primary"
            subtitle="All registered accounts"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Assigned Users"
            count={userStats.assigned}
            icon={IconUserCheck}
            color="success"
            subtitle="Accounts with roles"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Unassigned Users"
            count={userStats.unassigned}
            icon={IconUserOff}
            color="warning"
            subtitle="Accounts without roles"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Multi-Role Users"
            count={userStats.multiRole}
            icon={IconShieldCheck}
            color="info"
            subtitle="Accounts with multiple roles"
          />
        </Grid>
      </Grid>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="h5" data-tour="acl-assign-heading">
              Assign Roles/Permission to Organizations
            </Typography>
            <ShowTourGuideButton />
          </Box>
        }
      >

        <Grid container spacing={1.5} mb={3} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Search by Name"
              value={nameFilterInput}
              onChange={(e) => setNameFilterInput(e.target.value)}
              onKeyPress={handleKeyPress}
              data-tour="acl-assign-search"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Role</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <SelectMenuItem value="all">All Roles</SelectMenuItem>
                {availableRoles.map((r) => (
                  <SelectMenuItem key={typeof r === 'object' ? (r.id || r.name) : r} value={typeof r === 'object' ? (r.name || r.id) : r}>
                    {formatRoleName(typeof r === 'object' ? (r.name || r.role || r) : r)}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectMenuItem value="all">All Status</SelectMenuItem>
                <SelectMenuItem value="active">Active</SelectMenuItem>
                <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
              </Select>
            </FormControl>
          </Grid>

          {currentUserLevel === 1 && (
            <Grid size={{ xs: 12, md: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="level-filter-label">Organization Level</InputLabel>
                <Select
                  labelId="level-filter-label"
                  value={levelFilter}
                  label="Organization Level"
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <SelectMenuItem value="">All Levels</SelectMenuItem>
                  <SelectMenuItem value="1">Level 1</SelectMenuItem>
                  <SelectMenuItem value="2">Level 2</SelectMenuItem>
                  <SelectMenuItem value="3">Level 3</SelectMenuItem>
                  <SelectMenuItem value="4">Level 4</SelectMenuItem>
                  <SelectMenuItem value="5">Level 5</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid size="auto">
            <Button variant="contained" size="small" onClick={handleSearch} sx={{ height: 40, px: 2 }}>
              Search
            </Button>
          </Grid>

          {hasFilters && (
            <Grid size="auto">
              <Button variant="outlined" color="error" size="small" onClick={resetFilters} sx={{ height: 40, px: 2 }}>
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>
        <Box sx={{ p: 0 }}>
          {/* <Paper> */}
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%' }}>#</TableCell>
                  <TableCell sx={{ width: { xs: '20%', md: '18%' } }}>User Details</TableCell>
                  <TableCell sx={{ width: { xs: '18%', md: '16%' } }}>Organization</TableCell>
                  <TableCell sx={{ width: { xs: '20%', md: '18%' } }}>Assigned Role</TableCell>
                  <TableCell sx={{ width: '10%' }}>Status</TableCell>
                  <TableCell sx={{ width: { xs: '15%', md: '15%' } }}>Last Active</TableCell>
                  <TableCell sx={{ width: '10%' }} align="center" data-tour="acl-assign-direct">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => {
                    const userStatus = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
                    const lastActiveRaw = user.last_active_at;
                    const lastActiveDate = lastActiveRaw
                      ? new Date(lastActiveRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'No activity yet';
                    const lastActiveTime = lastActiveRaw
                      ? new Date(lastActiveRaw).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <TableRow key={user.id || index} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={user.image}
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                              }}
                            >
                              {!user.image && getInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500} noWrap>
                                {user.name}
                              </Typography>
                              <Typography variant="small" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={user?.organization_logo}
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: 11,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                              }}
                            >
                              {!user?.organization_logo && getInitials(user?.organization_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500} noWrap>
                                {user?.organization_name}
                              </Typography>
                              <Typography variant="body2">{user.organization_email}</Typography>

                              <Typography variant="body2" color="text.secondary">
                                {user?.organization_code}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {user.assignedRoles?.map((role, i) => (
                              <Chip
                                key={i}
                                label={formatRoleName(typeof role === 'object' ? role.name : role)}
                                size="small"
                                sx={{
                                  borderRadius: '8px',
                                  ...getRoleSx(typeof role === 'object' ? role.name : role),
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userStatus}
                            size="small"
                            sx={{
                              bgcolor: userStatus === 'Inactive' ? '#FEF2F2' : '#E6F4EA',
                              color: userStatus === 'Inactive' ? '#DC2626' : '#10B981',
                              fontWeight: 700,
                              borderRadius: '12px',
                              px: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {lastActiveDate}
                            </Typography>
                            {lastActiveTime && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {lastActiveTime}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center" data-tour="acl-assign-view">
                          <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === user.id}
                            onClose={handleMenuClose}
                          >
                            {can('landlord.acl.user.assign_role') && (
                              <MenuItem onClick={() => handleAction('edit', user)}>
                                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>
                                  <IconShieldCheck size={18} />
                                </ListItemIcon>
                                Assign Role
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => handleAction('view', user)}>
                              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>
                                <IconEye size={18} />
                              </ListItemIcon>
                              View Assigned Roles
                            </MenuItem>
                            {can('landlord.acl.user.assign_permission') && (
                              <MenuItem onClick={() => handleAction('directPermission', user)}>
                                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>
                                  <IconKey size={18} />
                                </ListItemIcon>
                                Assign Direct Permission
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => handleAction('viewDirectPermission', user)}>
                              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>
                                <IconLock size={18} />
                              </ListItemIcon>
                              View Permission
                            </MenuItem>
                            {can('landlord.acl.user.toggle_status') && (
                              <MenuItem
                                onClick={() => handleToggleStatus(user)}
                                sx={{ color: user.status?.toLowerCase() === 'active' ? 'error.main' : 'success.main' }}
                              >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                  {user.status?.toLowerCase() === 'active' ? <IconUserOff size={18} /> : <IconUserCheck size={18} />}
                                </ListItemIcon>
                                {user.status?.toLowerCase() === 'active' ? 'Deactivate User' : 'Activate User'}
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
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
                          ? 'No users match the current filters.'
                          : 'No users available. Add new users or adjust filters.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    colSpan={6}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {/* </Paper> */}
        </Box>

        <RoleAttachmentModal
          open={roleAttachmentModalOpen}
          onClose={() => setRoleAttachmentModalOpen(false)}
          currentAgent={currentOrganizationForRole}
          onRoleSelection={handleRoleSelection}
        />
        <ViewRoleModal
          open={viewRoleModalOpen}
          onClose={() => setViewRoleModalOpen(false)}
          currentUser={currentOrganizationForRole}
        />
        <DirectPermissionModal
          open={directPermissionModalOpen}
          onClose={() => setDirectPermissionModalOpen(false)}
          currentAgent={currentOrganizationForRole}
          onPermissionSave={handleDirectPermissionSave}
        />
        <ViewDirectPermissionModal
          open={viewDirectPermissionModalOpen}
          onClose={() => setViewDirectPermissionModalOpen(false)}
          currentUser={currentOrganizationForRole}
          onPermissionSave={handleViewDirectPermissionSave}
        />
      </ParentCard>
    </Box>
  );
};

export default AssignmentManagement;
