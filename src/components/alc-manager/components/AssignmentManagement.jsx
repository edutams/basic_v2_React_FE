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
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';
import RoleAttachmentModal from './RoleAttachmentModal';
import ViewRoleModal from './ViewRoleModal';
import aclApi from 'src/api/aclApi';

const AssignmentManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [currentAgentForRole, setCurrentAgentForRole] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await aclApi.getUsers();
      const normalized = (res.data || []).map((u) => ({
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
    const roleStyles = {
      User: {
        backgroundColor: (theme) => theme.palette.success.light,
        color: (theme) => theme.palette.success.main,
      },
      Admin: {
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.main,
      },
      Customer: {
        backgroundColor: (theme) => theme.palette.info.light,
        color: (theme) => theme.palette.info.main,
      },
      Manager: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
      Agent: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.secondary.main,
      },
      Super_Admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
    };
    return roleStyles[role] || {};
  };

  const handleRoleSelection = async (roleIds) => {
    if (!currentAgentForRole) return;

    try {
      await aclApi.assignAgentRole(currentAgentForRole.id, roleIds);

      // After successful assignment, fetch updated roles from response or refetch users
      const res = await aclApi.getUsers();
      const updatedAgent = res.data?.find((u) => u.id === currentAgentForRole.id);

      setUsers((prev) =>
        prev.map((agent) => {
          if (agent.id === currentAgentForRole.id) {
            return { ...agent, assignedRoles: updatedAgent?.roles || [] };
          }
          return agent;
        }),
      );

      setRoleAttachmentModalOpen(false);
    } catch (err) {
      console.error('Failed to assign roles:', err);
    }
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setCurrentAgentForRole(row);
      setRoleAttachmentModalOpen(true);
    } else if (action === 'view') {
      setCurrentAgentForRole(row);
      setViewRoleModalOpen(true);
    }
    handleMenuClose();
  };

  const filteredUsers = users.filter((user) => {
    const term = nameFilter.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.userType?.toLowerCase().includes(term)
    );
  });

  const paginatedFilteredUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const resetFilters = () => {
    setNameFilter('');
    setUserTypeFilter('');
    setPage(0);
  };

  const hasFilters = nameFilter !== '' || userTypeFilter !== '';

  return (
    <ParentCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Assign Roles/Permission to Users</Typography>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <TextField
            placeholder="Search by name, email, or user type"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2, width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {hasFilters && (
            <Button variant="outlined" onClick={resetFilters} sx={{ height: 'fit-content', mb: 2 }}>
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>#</TableCell>
                  <TableCell sx={{ width: '35%' }}>User Details</TableCell>
                  <TableCell sx={{ width: '35%' }}>Assigned Role</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <img
                            src={user.avatar || '/src/assets/images/users/default-avatar.png'}
                            alt={user.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
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
                              sx={{ borderRadius: '8px', ...getRoleSx(typeof role === 'object' ? role.name : role) }}
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
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Alert severity="info">
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
        currentAgent={currentAgentForRole}
      />
    </ParentCard>
  );
};

export default AssignmentManagement;
