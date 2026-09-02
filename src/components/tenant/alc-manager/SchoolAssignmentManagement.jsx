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
  ListItemIcon,
  Alert,
  Skeleton,
  Avatar,
  Grid,
  FormControl,
  Select,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  FileDownload as ExportIcon,
  ArrowDropDown as ArrowDropDownIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
  IconShieldLock,
  IconShieldCheck,
  IconEye,
} from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import RoleAttachmentModal from '@/components/tenant/alc-manager/RoleAttachmentModal';
import ViewRoleModal from '@/components/tenant/alc-manager/ViewRoleModal';
import SchoolDirectPermissionModal from '@/components/tenant/alc-manager/SchoolDirectPermissionModal';
import SchoolViewDirectPermissionModal from '@/components/tenant/alc-manager/SchoolViewDirectPermissionModal';
import SchoolRecentChangesModal from '@/components/tenant/alc-manager/SchoolRecentChangesModal';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import aclApi from '@/api/tenant/acl/aclApi';
import { useNotification } from '@/hooks/useNotification';
import { usePermissions } from '@/context/TenantContext/permissions';
import { getFullImageUrl } from '@/helpers/ImageHelper';
import { formatRoleName } from '@/pages/tenant/alc-manager/SchoolAlcManager';

const SchoolAssignmentManagement = () => {
  const notify = useNotification();
  const { can } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availableRoles, setAvailableRoles] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [directPermissionModalOpen, setDirectPermissionModalOpen] = useState(false);
  const [viewDirectPermissionModalOpen, setViewDirectPermissionModalOpen] = useState(false);
  const [recentChangesModalOpen, setRecentChangesModalOpen] = useState(false);
  const [currentUserForRole, setCurrentUserForRole] = useState(null);
  const [statsApiData, setStatsApiData] = useState(null);

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: appliedFilters.search || undefined,
        role: appliedFilters.role !== 'all' ? appliedFilters.role : undefined,
        status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
        exclude_super_admin: true,
      };

      const res = await aclApi.getSchoolUsers(params);

      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      const meta = res.meta || res.data?.meta || {};
      setTotalRows(meta.total ?? (Array.isArray(usersData) ? usersData.length : 0));

      const normalized = (usersData || []).map((u) => ({
        ...u,
        assignedRoles: u.roles || [],
      }));

      setUsers(normalized);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await aclApi.getSchoolAssignmentSummaryStats();
      if (res?.data) {
        setStatsApiData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch assignment summary stats:', err);
    }
  };

  const fetchRolesList = async () => {
    try {
      const res = await aclApi.getSchoolRolesList({ exclude_super_admin: true });
      if (res?.data && Array.isArray(res.data)) {
        setAvailableRoles(
          res.data
            .map((r) => r.name)
            .filter((name) => name !== 'super_admin'),
        );
      }
    } catch (err) {
      console.error('Failed to fetch roles list:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [appliedFilters, page, rowsPerPage]);

  useEffect(() => {
    fetchStats();
    fetchRolesList();
  }, []);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleSx = (role) => {
    const normalizedRole = role?.toString().toLowerCase();

    const roleStyles = {
      user: {
        backgroundColor: (theme) => theme.palette.success.light,
        color: (theme) => theme.palette.success.main,
      },
      admin: {
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.main,
      },
      teacher: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
      staff: {
        backgroundColor: (theme) => theme.palette.info.light,
        color: (theme) => theme.palette.info.main,
      },
      super_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
      school_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
      school_head: {
        backgroundColor: '#EDE9FE',
        color: '#7C3AED',
      },
      school_owner: {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
      },
      subject_teacher: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.secondary.main,
      },
      student: {
        backgroundColor: (theme) => theme.palette.purple?.A50 || '#F3E8FF',
        color: (theme) => theme.palette.purple?.A100 || '#7C3AED',
      },
      bursar: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.dark,
      },
      lesson_note_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.dark,
      },
      prospective: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.primary.dark,
      },
    };

    return (
      roleStyles[normalizedRole] || {
        backgroundColor: (theme) => theme.palette.grey[200],
        color: (theme) => theme.palette.grey[700],
      }
    );
  };

  const userStats = useMemo(() => {
    if (statsApiData) {
      return {
        total: statsApiData.total ?? 0,
        assigned: statsApiData.assigned ?? 0,
        unassigned: statsApiData.unassigned ?? 0,
        multiRole: statsApiData.multi_role ?? statsApiData.multiRole ?? 0,
        recentChanges: statsApiData.recent_changes ?? statsApiData.recentChanges ?? 0,
      };
    }

    const total = users.length;
    const assigned = users.filter((u) => u.assignedRoles && u.assignedRoles.length > 0).length;
    const unassigned = total - assigned;
    const multiRole = users.filter((u) => u.assignedRoles && u.assignedRoles.length > 1).length;
    const recentChanges = 24;

    return {
      total,
      assigned,
      unassigned,
      multiRole,
      recentChanges,
    };
  }, [statsApiData, users]);

  const handleOpenStatusConfirm = (user) => {
    setUserToToggleStatus(user);
    setStatusConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmToggleUserStatus = async () => {
    if (!userToToggleStatus || togglingStatus) return;
    setTogglingStatus(true);
    try {
      const isCurrentActive = (userToToggleStatus.status || (userToToggleStatus.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'active';
      await aclApi.toggleSchoolUserStatus(userToToggleStatus.id);
      notify.success(`User "${userToToggleStatus.name}" ${isCurrentActive ? 'deactivated' : 'activated'} successfully!`);
      setStatusConfirmOpen(false);
      setUserToToggleStatus(null);
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const allRolesList = useMemo(() => {
    const rolesSet = new Set();
    users.forEach((u) => {
      if (Array.isArray(u.assignedRoles)) {
        u.assignedRoles.forEach((r) => {
          const rName = typeof r === 'object' ? r.name : r;
          if (rName) rolesSet.add(rName);
        });
      }
    });
    return Array.from(rolesSet);
  }, [users]);

  const handleRoleSelection = async (roleIds) => {
    if (!currentUserForRole) return;

    const currentRoleIds = currentUserForRole.assignedRoles?.map((r) => r.id) || [];
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
      await aclApi.assignSchoolUserRole(currentUserForRole.id, roleIds);
      await Promise.all([fetchUsers(), fetchStats()]);

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
      notify.error(err?.response?.data?.message || 'Failed to update roles');
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setCurrentUserForRole(row);
      setRoleAttachmentModalOpen(true);
    } else if (action === 'view') {
      setCurrentUserForRole(row);
      setViewRoleModalOpen(true);
    } else if (action === 'directPermission') {
      setCurrentUserForRole(row);
      setDirectPermissionModalOpen(true);
    } else if (action === 'viewDirectPermission') {
      setCurrentUserForRole(row);
      setViewDirectPermissionModalOpen(true);
    }
    handleMenuClose();
  };

  const handleDirectPermissionSave = async (permissions) => {
    if (!currentUserForRole) return;

    try {
      await aclApi.assignSchoolUserDirectPermissions(currentUserForRole.id, permissions);
      notify.success('Direct permissions assigned successfully!');
      setDirectPermissionModalOpen(false);
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to assign direct permissions');
    }
  };

  const handleViewDirectPermissionSave = async (permissions) => {
    if (!currentUserForRole) return;

    try {
      await aclApi.assignSchoolUserDirectPermissions(currentUserForRole.id, permissions);
      notify.success('Permissions updated successfully!');
      setViewDirectPermissionModalOpen(false);
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update permissions');
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(0);
    setAppliedFilters({
      search: searchInput,
      role: roleFilter,
      status: statusFilter,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(0);
    setAppliedFilters({
      search: '',
      role: 'all',
      status: 'all',
    });
  };

  const filteredUsers = users;
  const paginatedFilteredUsers = users;

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const params = { exclude_super_admin: true };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.role !== 'all') params.role = appliedFilters.role;
      if (appliedFilters.status !== 'all') params.status = appliedFilters.status;

      const res = await aclApi.exportSchoolAssignmentsExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_role_assignments_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('User assignments exported to Excel successfully!');
    } catch (err) {
      console.error('Failed to export assignments excel:', err);
      notify.error('Failed to export Excel');
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    try {
      const params = { exclude_super_admin: true };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.role !== 'all') params.role = appliedFilters.role;
      if (appliedFilters.status !== 'all') params.status = appliedFilters.status;

      const res = await aclApi.exportSchoolAssignmentsPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_role_assignments_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('User assignments exported as PDF successfully!');
    } catch (err) {
      console.error('Failed to export assignments pdf:', err);
      notify.error('Failed to export PDF');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ py: 1, px: 0.5, mb: 1 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={userStats.total}
              label="Total Users"
              subtitle="All registered users"
              icon={IconUsers}
              colorIndex={0}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={userStats.assigned}
              label="Roles Assigned"
              subtitle="Assigned Users"
              icon={IconUserCheck}
              colorIndex={1}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={userStats.unassigned}
              label="Unassigned Users"
              subtitle="No role assigned"
              icon={IconUserOff}
              colorIndex={2}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={userStats.multiRole}
              label="Multi-role"
              subtitle="Users with multiple roles"
              icon={IconUsers}
              colorIndex={3}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Tooltip title="Click to view breakdown of recent changes" placement="top">
              <Box
                onClick={() => setRecentChangesModalOpen(true)}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <StatCard
                  count={userStats.recentChanges}
                  label="Recent Changes"
                  subtitle="In the last 7 days"
                  icon={IconUserPlus}
                  colorIndex={4}
                  loading={loading}
                />
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="h5" data-tour="acl-assign-heading" fontWeight={700}>
              Users and Their Roles
            </Typography>
            <ShowTourGuideButton />
          </Box>
        }
      >
        <Box sx={{ p: 0, mt: -1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                flexGrow: 1,
              }}
            >
              <TextField
                placeholder="Search users by name, email or ID..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 240, md: 280 } }}
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {availableRoles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {formatRoleName(r)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                size="small"
                type="submit"
                sx={{ px: 2.5, py: 0.8, textTransform: 'none', fontWeight: 600 }}
              >
                Search
              </Button>

              {(appliedFilters.search || appliedFilters.role !== 'all' || appliedFilters.status !== 'all' || searchInput || roleFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ px: 2, py: 0.8, textTransform: 'none', fontWeight: 600 }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon fontSize="small" />}
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
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

            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={() => setExportAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
            >
              <MenuItem onClick={handleExportExcel}>
                <TableChartIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
                Export Excel
              </MenuItem>
              <MenuItem onClick={handleExportPdf}>
                <PictureAsPdfIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                Export PDF
              </MenuItem>
            </Menu>
          </Box>

          {/* Table Container */}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60, fontWeight: 700 }}>S/N</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Roles</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Active</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width={j === 0 ? 30 : 80} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => {
                    const userStatus = user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()) : (user.is_active === false ? 'Inactive' : 'Active');

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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={getFullImageUrl(user.avatar || user.image || user.profile_picture || '')}
                              alt={user.name}
                              sx={{ width: 36, height: 36 }}
                            >
                              {user.name?.[0]?.toUpperCase() ?? '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email || 'No email added yet'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {user.assignedRoles && user.assignedRoles.length > 0 ? (
                              user.assignedRoles.map((role, i) => {
                                const rName = typeof role === 'object' ? role.name : role;
                                return (
                                  <Chip
                                    key={i}
                                    label={formatRoleName(rName)}
                                    size="small"
                                    sx={{
                                      borderRadius: '12px',
                                      fontWeight: 600,
                                      px: 0.5,
                                      ...getRoleSx(rName),
                                    }}
                                  />
                                );
                              })
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No Role
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={userStatus}
                            size="small"
                            sx={{
                              bgcolor: userStatus === 'Inactive' ? '#FEF2F2' : '#DCFCE7',
                              color: userStatus === 'Inactive' ? '#DC2626' : '#16A34A',
                              fontWeight: 600,
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

                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === user.id}
                            onClose={handleMenuClose}
                            PaperProps={{
                              sx: {
                                '& .MuiMenuItem-root:hover': {
                                  bgcolor: 'primary.light',
                                },
                              },
                            }}
                          >
                            {can('acl.roles.assignments.assign') && (
                              <MenuItem onClick={() => handleAction('edit', user)}>
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                  <IconUserPlus size={18} />
                                </ListItemIcon>
                                Attach Role
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => handleAction('view', user)}>
                              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                <IconShieldCheck size={18} />
                              </ListItemIcon>
                              View Role
                            </MenuItem>
                            {can('acl.user.manage.permission') && (
                              <MenuItem onClick={() => handleAction('directPermission', user)}>
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                  <IconShieldLock size={18} />
                                </ListItemIcon>
                                Assign Direct Permission
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => handleAction('viewDirectPermission', user)}>
                              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                <IconEye size={18} />
                              </ListItemIcon>
                              View Permission
                            </MenuItem>
                            {can('acl.roles.toggle_status') && (() => {
                              const isCurrentActive = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'active';
                              return isCurrentActive ? (
                                <MenuItem onClick={() => handleOpenStatusConfirm(user)} sx={{ color: 'error.main' }}>
                                  <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                    <IconUserOff size={18} />
                                  </ListItemIcon>
                                  Deactivate User
                                </MenuItem>
                              ) : (
                                <MenuItem onClick={() => handleOpenStatusConfirm(user)} sx={{ color: 'success.main' }}>
                                  <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                    <IconUserCheck size={18} />
                                  </ListItemIcon>
                                  Activate User
                                </MenuItem>
                              );
                            })()}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
                        {searchInput || roleFilter !== 'all' || statusFilter !== 'all'
                          ? 'No users match the current filters.'
                          : 'No users available.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
        </Box>

        <RoleAttachmentModal
          open={roleAttachmentModalOpen}
          onClose={() => setRoleAttachmentModalOpen(false)}
          currentUser={currentUserForRole}
          onRoleSelection={handleRoleSelection}
        />
        <ViewRoleModal
          open={viewRoleModalOpen}
          onClose={() => setViewRoleModalOpen(false)}
          currentUser={currentUserForRole}
        />
        <SchoolDirectPermissionModal
          open={directPermissionModalOpen}
          onClose={() => setDirectPermissionModalOpen(false)}
          currentUser={currentUserForRole}
          onPermissionSave={handleDirectPermissionSave}
        />
        <SchoolViewDirectPermissionModal
          open={viewDirectPermissionModalOpen}
          onClose={() => setViewDirectPermissionModalOpen(false)}
          currentUser={currentUserForRole}
          onPermissionSave={handleViewDirectPermissionSave}
        />

        {(() => {
          const isTargetActive = (userToToggleStatus?.status || (userToToggleStatus?.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'active';

          return (
            <ConfirmationDialog
              open={statusConfirmOpen}
              onClose={() => {
                setStatusConfirmOpen(false);
                setUserToToggleStatus(null);
              }}
              onConfirm={handleConfirmToggleUserStatus}
              title={isTargetActive ? 'Deactivate User?' : 'Activate User?'}
              message={
                <Typography component="span" variant="body2" color="text.secondary">
                  Are you sure you want to {isTargetActive ? 'deactivate' : 'activate'}{' '}
                  <Typography component="span" variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                    {userToToggleStatus?.name}
                  </Typography>?
                </Typography>
              }
              confirmText={isTargetActive ? 'Deactivate' : 'Activate'}
              cancelText="Cancel"
              severity={isTargetActive ? 'error' : 'info'}
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
                bgcolor: isTargetActive ? 'error.main' : 'primary.main',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: isTargetActive ? 'error.dark' : 'primary.dark',
                },
              }}
              loading={togglingStatus}
            />
          );
        })()}

        <SchoolRecentChangesModal
          open={recentChangesModalOpen}
          onClose={() => setRecentChangesModalOpen(false)}
        />
      </ParentCard>
    </Box>
  );
};

export default SchoolAssignmentManagement;
