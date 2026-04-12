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
  Chip,
  InputAdornment,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  VpnKeyOutlined as PermissionIcon,
} from '@mui/icons-material';
import aclApi from 'src/api/aclApi';

/**
 * PermissionRolesModal
 *
 * Shows all roles that include the selected permission.
 *
 * Props:
 *   open         {boolean}
 *   onClose      {function}
 *   permissionId {number|string|null}
 */
const PermissionRolesModal = ({ open, onClose, permissionId }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && permissionId) {
      setPage(0);
      setSearch('');
      setError(null);
    }
  }, [open, permissionId]);

  useEffect(() => {
    if (!open || !permissionId) return;
    fetchRoles();
  }, [open, permissionId, page, search]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/permissions/:permissionId/roles?page=&search=
      const res = await aclApi.getPermissionRoles(permissionId, {
        page: page + 1,
        search,
      });

      if (res?.data) {
        const raw = res.data.data ?? res.data ?? [];
        setRoles(Array.isArray(raw) ? raw : []);
        setTotalRows(res.data.total ?? (Array.isArray(raw) ? raw.length : 0));
        setRowsPerPage(res.data.per_page ?? 10);
      }
    } catch (err) {
      console.error('Failed to fetch permission roles:', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoles([]);
    setSearch('');
    setPage(0);
    setError(null);
    onClose();
  };

  // Colour-code role chips the same way the rest of the app does
  const roleChipColor = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('admin')) return 'error';
    if (lower.includes('manager')) return 'warning';
    if (lower.includes('agent')) return 'secondary';
    if (lower.includes('member')) return 'info';
    return 'default';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PermissionIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="span">
            Roles with this Permission
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
        <TextField
          placeholder="Search by role name"
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%' }}>#</TableCell>
                <TableCell sx={{ width: '50%' }}>Role</TableCell>
                <TableCell sx={{ width: '25%' }} align="center">
                  Guard
                </TableCell>
                <TableCell sx={{ width: '17%' }} align="center">
                  Users
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
              ) : roles.length > 0 ? (
                roles.map((role, index) => (
                  <TableRow key={role.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>
                      <Chip
                        label={role.name}
                        size="small"
                        color={roleChipColor(role.name)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {role.guard_name ?? '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={(role.users_count ?? role.pivot?.model_type) ? 1 : '—'}
                        size="small"
                        variant="filled"
                        color="primary"
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
                      {search
                        ? 'No roles match your search.'
                        : 'No roles have this permission yet.'}
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

export default PermissionRolesModal;
