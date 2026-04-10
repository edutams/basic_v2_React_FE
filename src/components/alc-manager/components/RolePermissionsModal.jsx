import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  TableContainer,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Avatar,
  Chip,
  InputAdornment,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import aclApi from '../../../api/aclApi';

/**
 * RolePermissionsModal
 *
 * Props:
 *   open     {boolean}  — controls dialog visibility
 *   onClose  {function} — called when the dialog should close
 *   roleId   {number|string|null} — the role ID to fetch users for
 */
const RolePermissionsModal = ({ open, onClose, roleId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');

  // Reset state whenever the modal opens with a new roleId
  useEffect(() => {
    if (open && roleId) {
      setPage(0);
      setSearch('');
      setError(null);
    }
  }, [open, roleId]);

  // Fetch users whenever open, roleId, page, or search changes
  useEffect(() => {
    if (!open || !roleId) return;
    fetchUsers();
  }, [open, roleId, page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        search,
      };

      const res = await aclApi.getRoleUsers(roleId, params);

      if (res?.data) {
        setUsers(res.data || []);
        setTotalRows(res.data.total || 0);
        setRowsPerPage(res.data.per_page || 10);
      }
    } catch (err) {
      console.error('Failed to fetch role users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsers([]);
    setSearch('');
    setPage(0);
    setError(null);
    onClose();
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

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
          <LockIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            Users with this Role
          </Typography>
          {totalRows > 0 && !loading && (
            <Chip label={totalRows} size="small" color="primary" variant="outlined" />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Search */}
        <TextField
          placeholder="Search by name or email"
          value={search}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer sx={{ maxHeight: 420 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>#</TableCell>
                <TableCell sx={{ width: '40%' }}>Name</TableCell>
                <TableCell sx={{ width: '35%' }}>Email</TableCell>
                <TableCell sx={{ width: '20%' }} align="center">
                  Status
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
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                          {getInitials(user.full_name)}
                        </Avatar>
                        <Typography variant="body2">{user.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.status ?? 'Active'}
                        size="small"
                        color={user.status === 'Inactive' ? 'default' : 'success'}
                        variant="outlined"
                      />
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
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10]}
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  colSpan={4}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RolePermissionsModal;
