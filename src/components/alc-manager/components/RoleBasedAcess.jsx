import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import ParentCard from 'src/components/shared/ParentCard';
import RoleAttachmentModal from './RoleAttachmentModal';
import ViewRoleModal from './ViewRoleModal';

const AssignmentManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      permission: 'censis.aci.index',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 2,
      permission: 'censis.aci.role.create',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 3,
      permission: 'censis.aci.role.delete',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 4,
      permission: 'censis.aci.role.update',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 5,
      permission: 'censis.aci.user.manage.permission',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 6,
      permission: 'censis.aci.user.manage.role',
      totalRole: '1',
      totalUser: '1',
    },
    {
      id: 7,
      permission: 'censis.auth.profile.edit',
      totalRole: '1',
      totalUser: '5894',
    },
    {
      id: 8,
      permission: 'censis.auth.profile.view',
      totalRole: '1',
      totalUser: '5894',
    },
    {
      id: 9,
      permission: 'censis.dashboard',
      totalRole: '1',
      totalUser: '5894',
    },
    {
      id: 9,
      permission: 'censis.users.update_user.info',
      totalRole: '1',
      totalUser: '1',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page, rowsPerPage]);

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

  const [roleAttachmentModalOpen, setRoleAttachmentModalOpen] = useState(false);
  const [viewRoleModalOpen, setViewRoleModalOpen] = useState(false);
  const [currentUserForRole, setCurrentUserForRole] = useState(null);

  const handleRoleSelection = (selectedRole) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === currentUserForRole.id) {
          if (!user.assignedRoles.includes(selectedRole)) {
            return {
              ...user,
              assignedRoles: [...user.assignedRoles, selectedRole],
            };
          }
          return user;
        }
        return user;
      }),
    );

    setRoleAttachmentModalOpen(false);
  };

  const handleAction = (action, row) => {
    if (action === 'edit') {
      setCurrentUserForRole(row);
      setRoleAttachmentModalOpen(true);
    } else if (action === 'view') {
      setCurrentUserForRole(row);
      setViewRoleModalOpen(true);
    }
    handleMenuClose();
  };

  const filteredUsers = users.filter((user) => {
    const matchesPermission = user.permission.toLowerCase().includes(nameFilter.toLowerCase());
    return matchesPermission;
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
    <Box>
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
          <TextField
            placeholder="Search by permission"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 2 }}
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
                  <TableCell sx={{ width: '10%' }}>S/N</TableCell>
                  <TableCell sx={{ width: '35%' }}>Permission</TableCell>
                  <TableCell sx={{ width: '35%' }} align="center">
                    Total Role
                  </TableCell>
                  <TableCell sx={{ width: '15%' }} align="center">
                    Total User
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFilteredUsers.length > 0 ? (
                  paginatedFilteredUsers.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{user.permission}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" align="center">
                            {user.totalRole}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" align="center">
                          {user.totalUser}
                        </Typography>
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
        currentUser={currentUserForRole}
        onRoleSelection={handleRoleSelection}
      />
      <ViewRoleModal
        open={viewRoleModalOpen}
        onClose={() => setViewRoleModalOpen(false)}
        currentUser={currentUserForRole}
      />
    </Box>
  );
};

export default AssignmentManagement;
