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
  Link,
  Grid,
} from '@mui/material';
import aclApi from '@/api/landlord/acl/aclApi';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import RoleAttachmentModal from './RoleAttachmentModal';
import ViewRoleModal from './ViewRoleModal';

import PermissionRolesModal from './PermissionRolesModal';
import PermissionOrganizationsModal from './PermissionOrganizationsModal';

const PermissionBased = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [nameFilterInput, setNameFilterInput] = useState('');

  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [orgsModalOpen, setOrgsModalOpen] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, [page, nameFilter]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        search: nameFilter,
      };
      const res = await aclApi.getPermissionAnalytics(params);

      if (res?.data?.data) {
        setPermissions(res.data.data || []);
        setTotalRows(res.data.total || 0);
        setRowsPerPage(res.data.per_page || 10);
      } else if (res?.current_page) {
        setPermissions(res.data || []);
        setTotalRows(res.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

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
        color: (theme) => theme.palette.primary.main,
      },
      system_admin: {
        backgroundColor: (theme) => theme.palette.secondary.light,
        color: (theme) => theme.palette.secondary.main,
      },
      support_admin: {
        backgroundColor: (theme) => theme.palette.info.light,
        color: (theme) => theme.palette.info.main,
      },
      agent: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
    };

    if (roleStyles[normalizedRole]) {
      return roleStyles[normalizedRole];
    }

    const themePalettes = [
      { backgroundColor: (theme) => theme.palette.primary.light, color: (theme) => theme.palette.primary.main },
      { backgroundColor: (theme) => theme.palette.secondary.light, color: (theme) => theme.palette.secondary.main },
      { backgroundColor: (theme) => theme.palette.success.light, color: (theme) => theme.palette.success.main },
      { backgroundColor: (theme) => theme.palette.info.light, color: (theme) => theme.palette.info.main },
      { backgroundColor: (theme) => theme.palette.warning.light, color: (theme) => theme.palette.warning.main },
      { backgroundColor: (theme) => theme.palette.error.light, color: (theme) => theme.palette.error.main },
    ];

    let hash = 0;
    for (let i = 0; i < rawRole.length; i++) {
      hash = rawRole.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % themePalettes.length;
    return themePalettes[index];
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

  const filteredUsers = permissions;

  const resetFilters = () => {
    setNameFilter('');
    setNameFilterInput('');
    setPage(0);
  };

  const handleSearch = () => {
    setNameFilter(nameFilterInput);
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasFilters = nameFilter !== '';

  return (
    <Box>
      <Box sx={{ p: 0 }}>
        <Grid container spacing={1} mb={3} alignItems="center">
          <TextField
            placeholder="Search by permission"
            value={nameFilterInput}
            onChange={(e) => setNameFilterInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" size="small" onClick={handleSearch} sx={{ height: 'fit-content', mb: 2 }}>
            Search
          </Button>
          {/* {hasFilters && (
            <Button variant="contained" size="small" onClick={resetFilters} sx={{ height: 'fit-content', mb: 2 }}>
              Clear Filters
            </Button>
          )} */}
        </Grid>

        <Box>
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>S/N</TableCell>
                  <TableCell sx={{ width: { xs: '40%', md: '35%' } }}>Permissions</TableCell>
                  <TableCell sx={{ width: { xs: '25%', md: '35%' } }} align="center">
                    Total Role
                  </TableCell>
                  <TableCell sx={{ width: { xs: '25%', md: '15%' } }} align="center">
                    Total Org. Teams
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : permissions.length > 0 ? (
                  permissions.map((user, index) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: '10px' }}
                          >
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" align="center">
                            <Link
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedPermissionId(user.id);
                                setRolesModalOpen(true);
                              }}
                            >
                              {' '}
                              {user.roles_count}
                            </Link>
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" align="center">
                          <Link
                            sx={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedPermissionId(user.id);
                              setOrgsModalOpen(true);
                            }}
                          >
                            {' '}
                            {user.users_count}
                          </Link>
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
                    rowsPerPageOptions={[10]}
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    colSpan={5}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
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

      <PermissionRolesModal
        open={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        permissionId={selectedPermissionId}
      />
      <PermissionOrganizationsModal
        open={orgsModalOpen}
        onClose={() => setOrgsModalOpen(false)}
        permissionId={selectedPermissionId}
        onUserRemoved={fetchPermissions}
      />
    </Box>
  );
};

export default PermissionBased;
