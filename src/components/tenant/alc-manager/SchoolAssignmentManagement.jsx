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
} from '@mui/icons-material';
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconUserPlus,
} from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import RoleAttachmentModal from '@/components/tenant/alc-manager/RoleAttachmentModal';
import ViewRoleModal from '@/components/tenant/alc-manager/ViewRoleModal';
import SchoolDirectPermissionModal from '@/components/tenant/alc-manager/SchoolDirectPermissionModal';
import SchoolViewDirectPermissionModal from '@/components/tenant/alc-manager/SchoolViewDirectPermissionModal';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import aclApi from '@/api/tenant/acl/aclApi';
import { useNotification } from '@/hooks/useNotification';
import { getFullImageUrl } from '@/helpers/ImageHelper';

const SchoolAssignmentManagement = () => {
  const notify = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [directPermissionModalOpen, setDirectPermissionModalOpen] = useState(false);
  const [viewDirectPermissionModalOpen, setViewDirectPermissionModalOpen] = useState(false);
  const [currentUserForRole, setCurrentUserForRole] = useState(null);
  const [statsApiData, setStatsApiData] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await aclApi.getSchoolUsers();

      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

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

  useEffect(() => {
    fetchUsers();
    fetchStats();
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
      'super admin': {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
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

  const handleToggleUserStatus = async (user) => {
    try {
      const isCurrentActive = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'active';
      await aclApi.toggleSchoolUserStatus(user.id);
      notify.success(`User "${user.name}" ${isCurrentActive ? 'deactivated' : 'activated'} successfully!`);
      handleMenuClose();
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update user status');
      handleMenuClose();
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
      await fetchUsers();

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
      fetchUsers();
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
      fetchUsers();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update permissions');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchInput) {
        const term = searchInput.toLowerCase();
        const nameMatch = user.name?.toLowerCase().includes(term);
        const emailMatch = user.email?.toLowerCase().includes(term);
        const idMatch = user.id?.toString().includes(term);
        if (!nameMatch && !emailMatch && !idMatch) return false;
      }

      if (roleFilter !== 'all') {
        const hasRole = user.assignedRoles?.some((r) => {
          const rName = typeof r === 'object' ? r.name : r;
          return rName === roleFilter;
        });
        if (!hasRole) return false;
      }

      if (statusFilter !== 'all') {
        const uStatus = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase();
        if (uStatus !== statusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [users, searchInput, roleFilter, statusFilter]);

  const paginatedFilteredUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const resetFilters = () => {
    setSearchInput('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(0);
  };

  const handleExportUsers = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      notify.error('No users available to export');
      return;
    }

    const dataToExport = filteredUsers.map((u, index) => {
      const rolesString = u.assignedRoles
        ? u.assignedRoles.map((r) => (typeof r === 'object' ? r.name : r)).join(', ')
        : 'None';
      const statusLabel = u.status || (u.is_active === false ? 'Inactive' : 'Active');
      return {
        'S/N': index + 1,
        Name: u.name,
        Email: u.email,
        'Assigned Roles': rolesString,
        Status: statusLabel,
      };
    });

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_roles_assignment_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Top Summary Stat Cards ────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
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
          <StatCard
            count={userStats.recentChanges}
            label="Recent Changes"
            subtitle="In the last 7 days"
            icon={IconUserPlus}
            colorIndex={4}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Main ParentCard Table Section ─────────────────────────────────── */}
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
        <Box sx={{ p: 0 }}>
          {/* Controls Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2.5,
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
                placeholder="Search users by name, email or ID..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 260, md: 300 } }}
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
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {allRolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              {(searchInput || roleFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="text"
                  size="small"
                  onClick={resetFilters}
                  sx={{ color: 'error.main', fontSize: '13px' }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon fontSize="small" />}
              onClick={handleExportUsers}
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

          {/* Table Container */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60, fontWeight: 700 }}>#</TableCell>
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
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => {
                    const userStatus = user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase()) : (user.is_active === false ? 'Inactive' : 'Active');

                    const lastActiveRaw = user.last_active_at || user.last_login_at || user.updated_at || user.created_at;
                    const lastActiveDate = lastActiveRaw
                      ? new Date(lastActiveRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—';
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
                                {user.email}
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
                                    label={rName}
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
                          >
                            <MenuItem onClick={() => handleAction('edit', user)}>
                              Attach Role
                            </MenuItem>
                            <MenuItem onClick={() => handleAction('view', user)}>
                              View Role
                            </MenuItem>
                            <MenuItem onClick={() => handleAction('directPermission', user)}>
                              Assign Direct Permission
                            </MenuItem>
                            <MenuItem onClick={() => handleAction('viewDirectPermission', user)}>
                              View Permission
                            </MenuItem>
                            {(() => {
                              const isCurrentActive = (user.status || (user.is_active === false ? 'inactive' : 'active')).toLowerCase() === 'active';
                              return isCurrentActive ? (
                                <MenuItem onClick={() => handleToggleUserStatus(user)} sx={{ color: 'error.main' }}>
                                  Deactivate User
                                </MenuItem>
                              ) : (
                                <MenuItem onClick={() => handleToggleUserStatus(user)} sx={{ color: 'success.main' }}>
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
            count={filteredUsers.length}
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
      </ParentCard>
    </Box>
  );
};

export default SchoolAssignmentManagement;
