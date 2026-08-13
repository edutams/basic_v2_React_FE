import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  VpnKeyOutlined as PermissionIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import aclApi from '@/api/tenant/acl/aclApi';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useNotification } from '@/hooks/useNotification';
import { getFullImageUrl } from '@/helpers/ImageHelper';

const SchoolTotalUsersModal = ({ open, onClose, permission, onUserRemoved }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const notify = useNotification();

  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  // A user may hold a permission directly OR inherit it via a role.
  // Only explicit 0 means "inherited only" — missing flag (older API) is treated as direct.
  const isDirectHolder = (user) =>
    user?.direct_holder === undefined ? true : Boolean(user.direct_holder);

  useEffect(() => {
    if (open && permission) {
      setPage(0);
      setSearch('');
      setSearchInput('');
      setError(null);
    }
  }, [open, permission]);

  useEffect(() => {
    if (!open || !permission) return;
    fetchUsers();
  }, [open, permission, page, rowsPerPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search,
      };
      const res = await aclApi.getSchoolUsersByPermission(permission.id, params);

      if (res?.data) {
        const raw = res.data.data ?? res.data ?? [];
        setUsers(Array.isArray(raw) ? raw : []);
        // Use the correct total from paginated response
        setTotalRows(res.data.total ?? res.total ?? (Array.isArray(raw) ? raw.length : 0));
        setRowsPerPage(res.data.per_page ?? res.per_page ?? 10);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleClear = () => {
    setSearch('');
    setSearchInput('');
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setUsers([]);
    setSearch('');
    setSearchInput('');
    setPage(0);
    setError(null);
    setAnchorEl(null);
    setSelectedUser(null);
    setConfirmOpen(false);
    onClose();
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemovePermission = async () => {
    if (!selectedUser || !permission || removing) return;
    setRemoving(true);
    try {
      await aclApi.revokeSchoolUserDirectPermissions(selectedUser.id, [permission.name]);
      notify.success('Permission removed from user successfully!');
      handleMenuClose();
      setConfirmOpen(false);
      setSelectedUser(null);
      fetchUsers();
      onUserRemoved?.();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to remove permission from user');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PermissionIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            {permission?.id === 'all'
              ? 'Users Impacted by Permissions'
              : 'Users with this Permission'}
          </Typography>
          {totalRows > 0 && !loading && <Chip label={totalRows} size="small" color="primary" />}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder="Search by user name or email"
            value={searchInput}
            size="small"
            fullWidth
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Button variant="contained" size="small" onClick={handleSearch}>
            Search
          </Button>
          {(search || searchInput) && (
            <Button variant="outlined" color="error" size="small" onClick={handleClear}>
              Clear
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%' }}>#</TableCell>
                <TableCell sx={{ width: '40%' }}>User Details</TableCell>
                <TableCell sx={{ width: '20%' }}>Source</TableCell>
                <TableCell sx={{ width: '18%' }}>Status</TableCell>
                {permission?.id !== 'all' && (
                  <TableCell sx={{ width: '12%' }} align="center">
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={permission?.id === 'all' ? 4 : 5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((item, index) => {
                  const u = item.users || item.user || item;
                  const rawAvatar =
                    item.avatar ||
                    item.users?.avatar ||
                    item.user?.avatar ||
                    u.avatar ||
                    u.image ||
                    item.image ||
                    '';
                  const avatarSrc = rawAvatar ? getFullImageUrl(rawAvatar) : '';

                  return (
                    <TableRow key={item.id || u.id || index} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={avatarSrc}
                            alt={u.full_name || u.fname || ''}
                            sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700 }}
                          >
                            {getInitials(
                              u.full_name ||
                              `${u.fname || ''} ${u.lname || ''}`.trim() ||
                              'User'
                            )}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                              {u.full_name ||
                                `${u.fname || ''} ${u.lname || ''}`.trim() ||
                                'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {u.email || 'No email added yet'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={isDirectHolder(item) ? 'Direct' : 'Via Role'}
                          size="small"
                          color={isDirectHolder(item) ? 'primary' : 'default'}
                          variant={isDirectHolder(item) ? 'filled' : 'outlined'}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.status || u.status || 'Active'}
                          size="small"
                          color={(item.status === 'active' || u.status === 'active') ? 'success' : 'default'}
                        />
                      </TableCell>

                      {permission?.id !== 'all' && (
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={permission?.id === 'all' ? 4 : 5} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
                      {search
                        ? 'No users match your search.'
                        : permission?.id === 'all'
                          ? 'No users are impacted by permissions yet.'
                          : 'No users have this permission yet.'}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Tooltip
            title={
              selectedUser && !isDirectHolder(selectedUser)
                ? 'This permission is inherited via a role. Remove the user from the role instead.'
                : ''
            }
            placement="left"
          >
            <span>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setConfirmOpen(true);
                }}
                disabled={removing || !isDirectHolder(selectedUser)}
                sx={{ color: 'error.main' }}
              >
                Remove Permission
              </MenuItem>
            </span>
          </Tooltip>
        </Menu>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" size="small" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRemovePermission}
        title="Remove permission from user?"
        message={`Are you sure you want to remove "${permission?.description ?? permission?.name ?? ''
          }" from ${selectedUser?.full_name ?? ''}?`}
        confirmText="Remove"
        cancelText="Cancel"
        severity="error"
      />
    </Dialog>
  );
};

export default SchoolTotalUsersModal;
