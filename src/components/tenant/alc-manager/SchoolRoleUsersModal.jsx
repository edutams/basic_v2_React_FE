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
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Group as UsersIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import aclApi from '@/api/tenant/acl/aclApi';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useNotification } from '@/hooks/useNotification';

const SchoolRoleUsersModal = ({ open, onClose, role, onUserRemoved }) => {
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

  useEffect(() => {
    if (open && role) {
      setPage(0);
      setSearch('');
      setSearchInput('');
      setError(null);
    }
  }, [open, role]);

  useEffect(() => {
    if (!open || !role) return;
    fetchUsers();
  }, [open, role, page, rowsPerPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search,
      };
      const res = await aclApi.getSchoolRoleUsers(role.id, params);

      if (res?.data) {
        const raw = res.data.data ?? res.data ?? [];
        setUsers(Array.isArray(raw) ? raw : []);
        setTotalRows(res.data.total ?? (Array.isArray(raw) ? raw.length : 0));
        setRowsPerPage(res.data.per_page ?? 10);
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

  const handleRemoveFromRole = async () => {
    if (!selectedUser || !role || removing) return;
    setRemoving(true);
    try {
      await aclApi.unassignSchoolUserRole(selectedUser.id, [role.id]);
      notify.success('User removed from role successfully!');
      handleMenuClose();
      setConfirmOpen(false);
      setSelectedUser(null);
      fetchUsers();
      onUserRemoved?.();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to remove user from role');
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
          <UsersIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            Users with this Role
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
            placeholder="Search by user name"
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
            }}
          />
          <Button variant="contained" size="small" onClick={handleSearch} sx={{ minWidth: '80px' }}>
            Search
          </Button>
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
                <TableCell sx={{ width: '42%' }}>User Details</TableCell>
                <TableCell sx={{ width: '20%' }}>Status</TableCell>
                <TableCell sx={{ width: '12%' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={user.avatar || user.image || ''}
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: 11,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          {!user.avatar &&
                            getInitials(user.full_name ?? `${user.fname} ${user.lname}`)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {user.full_name ?? `${user.fname} ${user.lname}`}
                          </Typography>

                          <Typography variant="small" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
                      {search ? 'No users match your search.' : 'No users have this role yet.'}
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
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setConfirmOpen(true);
            }}
            disabled={removing}
            sx={{ color: 'error.main' }}
          >
            Remove from Role
          </MenuItem>
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
        onConfirm={handleRemoveFromRole}
        title="Remove user from role?"
        message={`Are you sure you want to remove ${selectedUser?.full_name ?? ''} from the "${
          role?.role ?? ''
        }" role?`}
        confirmText="Remove"
        cancelText="Cancel"
        severity="error"
      />
    </Dialog>
  );
};

export default SchoolRoleUsersModal;
