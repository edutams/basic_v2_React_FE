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
  MenuItem as SelectMenuItem,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';
import RoleAttachmentModal from './RoleAttachmentModal';
import ViewRoleModal from './ViewRoleModal';
import DirectPermissionModal from './DirectPermissionModal';
import ViewDirectPermissionModal from './ViewDirectPermissionModal';
import aclApi from 'src/api/aclApi';
import { useNotification } from '../../../hooks/useNotification';
import useAuth from 'src/hooks/useAuth';

const AssignmentManagement = () => {
  const notify = useNotification();
  const { user: currentUser } = useAuth();
  const currentUserLevel = currentUser?.access_level;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [currentAgentForRole, setCurrentAgentForRole] = useState(null);
  const [directPermissionModalOpen, setDirectPermissionModalOpen] = useState(false);
  const [viewDirectPermissionModalOpen, setViewDirectPermissionModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await aclApi.getAgents();
      // console.log('fetchUsers response:', res);

      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      // console.log('Users data:', usersData);
      // console.log('Sample user from API:', usersData[0]);

      const normalized = (usersData || []).map((u) => ({
        ...u,
        assignedRoles: u.roles || [],
      }));
      // console.log('Normalized users:', normalized);

      setUsers(normalized);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      customer: {
        backgroundColor: (theme) => theme.palette.info.light,
        color: (theme) => theme.palette.info.main,
      },
      manager: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
      agent: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.secondary.main,
      },
      super_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
      superadmin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
    };

    return (
      roleStyles[normalizedRole] || {
        backgroundColor: (theme) => theme.palette.grey[200],
        color: (theme) => theme.palette.grey[700],
      }
    );
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
    if (!currentAgentForRole) return;

    // console.log('Current agent for role:', currentAgentForRole);
    // console.log('Agent ID being sent:', currentAgentForRole.id);
    // console.log('Role IDs being attached:', roleIds);

    // Determine if we're adding or removing roles
    const currentRoleIds = currentAgentForRole.assignedRoles?.map((r) => r.id) || [];
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
      const assignRes = await aclApi.assignAgentRole(currentAgentForRole.id, roleIds);
      // console.log('Role assignment response:', assignRes);

      const res = await aclApi.getAgents();
      // console.log('Get users response:', res);
      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }
      // console.log('Users data after assignment:', usersData);

      const normalized = (usersData || []).map((u) => ({
        ...u,
        assignedRoles: u.roles || [],
      }));

      // console.log('Sample user from API:', usersData[0]);
      // console.log('Normalized users:', normalized);

      setUsers(normalized);

      const updatedCurrentAgent = normalized.find((u) => u.id === currentAgentForRole.id);
      if (updatedCurrentAgent) {
        setCurrentAgentForRole(updatedCurrentAgent);
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
    if (!currentAgentForRole) return;

    try {
      await aclApi.assignAgentDirectPermissions(currentAgentForRole.id, permissions);
      notify.success('Direct permissions assigned successfully!');
      setDirectPermissionModalOpen(false);
      fetchUsers();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to assign direct permissions');
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setCurrentAgentForRole(row);
      setRoleAttachmentModalOpen(true);
    } else if (action === 'view') {
      setCurrentAgentForRole(row);
      setViewRoleModalOpen(true);
    } else if (action === 'directPermission') {
      setCurrentAgentForRole(row);
      setDirectPermissionModalOpen(true);
    } else if (action === 'viewDirectPermission') {
      setCurrentAgentForRole(row);
      setViewDirectPermissionModalOpen(true);
    }
    handleMenuClose();
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const term = nameFilter.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.userType?.toLowerCase().includes(term)
      );
    });

    // Any agent can see agents they created (their children)
    // Level 1 agents can see ALL agents
    const currentUserId = currentUser?.id;
    if (currentUserLevel && currentUserLevel > 1) {
      filtered = filtered.filter((user) => {
        if (user.id === currentUserId) {
          return false;
        }
        // Only include agents created by current user (their children)
        return user.parent_id === currentUserId;
      });
    }

    //level filter - only for Level 1 users
    if (levelFilter !== '') {
      filtered = filtered.filter((user) => {
        const userLevel = parseInt(user.level, 10);
        return userLevel === parseInt(levelFilter, 10);
      });
    }

    return filtered;
  }, [users, nameFilter, userTypeFilter, levelFilter, currentUserLevel, currentUser]);

  const paginatedFilteredUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const resetFilters = () => {
    setNameFilter('');
    setUserTypeFilter('');
    setLevelFilter('');
    setPage(0);
  };

  const hasFilters = nameFilter !== '' || userTypeFilter !== '' || levelFilter !== '';

  return (
    <ParentCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Assign Roles/Permission to Agents</Typography>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <TextField
            placeholder="Search by name"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Agent Level Filter - Only for Level 1 users */}
          {currentUserLevel === 1 && (
            <FormControl sx={{ mb: 2, minWidth: 150 }}>
              <InputLabel id="level-filter-label">Agent Level</InputLabel>
              <Select
                labelId="level-filter-label"
                value={levelFilter}
                label="Agent Level"
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(0);
                }}
              >
                <SelectMenuItem value="">All Levels</SelectMenuItem>
                <SelectMenuItem value="1">Level 1</SelectMenuItem>
                <SelectMenuItem value="2">Level 2</SelectMenuItem>
                <SelectMenuItem value="3">Level 3</SelectMenuItem>
                <SelectMenuItem value="4">Level 4</SelectMenuItem>
                <SelectMenuItem value="5">Level 5</SelectMenuItem>
              </Select>
            </FormControl>
          )}
          {hasFilters && (
            <Button variant="outlined" onClick={resetFilters} sx={{ height: 'fit-content', mb: 2 }}>
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>#</TableCell>
                  <TableCell sx={{ width: { xs: '40%', md: '35%' } }}>Agent Details</TableCell>
                  <TableCell sx={{ width: { xs: '35%', md: '35%' } }}>Assigned Role</TableCell>
                  <TableCell sx={{ width: '15%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                          }}
                        >
                          <img
                            src={user.image || '/src/assets/images/users/default_avatar.png'}
                            alt={user.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />

                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                            {user.level !== undefined && user.level !== null && (
                              <Chip
                                label={`Level: ${user.level}`}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: '0.7rem',
                                  ...getLevelChipSx(user.level),
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {user.assignedRoles?.map((role, i) => (
                            <Chip
                              key={i}
                              label={typeof role === 'object' ? role.name : role}
                              size="small"
                              sx={{
                                borderRadius: '8px',
                                ...getRoleSx(typeof role === 'object' ? role.name : role),
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedRow?.id === user.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleAction('edit', user)}>
                            Attach Role
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('view', user)}>View Role</MenuItem>
                          <MenuItem onClick={() => handleAction('directPermission', user)}>
                            Assign Direct Permission
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('viewDirectPermission', user)}>
                            View Direct Permission
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
                    colSpan={5}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <RoleAttachmentModal
        open={roleAttachmentModalOpen}
        onClose={() => setRoleAttachmentModalOpen(false)}
        currentAgent={currentAgentForRole}
        onRoleSelection={handleRoleSelection}
      />
      <ViewRoleModal
        open={viewRoleModalOpen}
        onClose={() => setViewRoleModalOpen(false)}
        currentUser={currentAgentForRole}
      />
      <DirectPermissionModal
        open={directPermissionModalOpen}
        onClose={() => setDirectPermissionModalOpen(false)}
        currentAgent={currentAgentForRole}
        onPermissionSave={handleDirectPermissionSave}
      />
      <ViewDirectPermissionModal
        open={viewDirectPermissionModalOpen}
        onClose={() => setViewDirectPermissionModalOpen(false)}
        currentUser={currentAgentForRole}
      />
    </ParentCard>
  );
};

export default AssignmentManagement;
