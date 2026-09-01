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
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  VpnKeyOutlined as PermissionIcon,
} from '@mui/icons-material';
import aclApi from '@/api/tenant/acl/aclApi';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useNotification } from '@/hooks/useNotification';

const formatRoleName = (name) => {
  if (!name) return '—';
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const SchoolRolePermissionsModal = ({ open, onClose, role, onPermissionRemoved }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedPermForRevoke, setSelectedPermForRevoke] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuPerm, setActiveMenuPerm] = useState(null);

  const notify = useNotification();

  const handleMenuOpen = (event, perm) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuPerm(perm);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuPerm(null);
  };

  const handleRemoveClick = () => {
    if (!activeMenuPerm) return;
    setSelectedPermForRevoke(activeMenuPerm);
    handleMenuClose();
    setConfirmOpen(true);
  };

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
    fetchPermissions();
  }, [open, role, page, rowsPerPage, search]);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search,
      };
      const res = await aclApi.getSchoolRolePermissions(role.id, params);

      if (res?.data) {
        const raw = res.data.data ?? res.data ?? [];
        setPermissions(Array.isArray(raw) ? raw : []);
        setTotalRows(res.data.total ?? (Array.isArray(raw) ? raw.length : 0));
        setRowsPerPage(res.data.per_page ?? 10);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setError('Failed to load permissions. Please try again.');
      setPermissions([]);
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
    setPermissions([]);
    setSearch('');
    setSearchInput('');
    setPage(0);
    setError(null);
    setSelectedPermForRevoke(null);
    setConfirmOpen(false);
    onClose();
  };

  const handleRemovePermission = async () => {
    if (!selectedPermForRevoke || !role || removing) return;
    setRemoving(true);
    try {
      await aclApi.revokeSchoolRolePermissions(role.id, [selectedPermForRevoke.name]);
      notify.success('Permission removed from role successfully!');
      setConfirmOpen(false);
      setSelectedPermForRevoke(null);
      fetchPermissions();
      onPermissionRemoved?.();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to remove permission from role');
    } finally {
      setRemoving(false);
    }
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
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Permissions for {role?.name ? <Box component="span" sx={{ color: 'primary.main' }}>{formatRoleName(role.name)}</Box> : 'this Role'}
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
            placeholder="Search by permission name"
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
                <TableCell sx={{ width: '10%' }}>#</TableCell>
                <TableCell sx={{ width: '70%' }}>Permission Name</TableCell>
                <TableCell sx={{ width: '20%' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : permissions.length > 0 ? (
                permissions.map((perm, index) => (
                  <TableRow key={perm.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {perm.description || perm.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                        {perm.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove permission from role">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPermForRevoke(perm);
                            setConfirmOpen(true);
                          }}
                          disabled={removing}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Alert
                      severity="info"
                      sx={{
                        justifyContent: 'center',
                        textAlign: 'center',
                        '& .MuiAlert-icon': { mr: 1 },
                      }}
                    >
                      {search
                        ? 'No permissions match your search.'
                        : 'No permissions assigned to this role.'}
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
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" size="small" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedPermForRevoke(null);
        }}
        onConfirm={handleRemovePermission}
        title="Remove permission from role?"
        message={
          <Typography component="span" variant="body2" color="text.secondary">
            Are you sure you want to remove permission{' '}
            <Typography component="span" variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
              "{selectedPermForRevoke?.description || selectedPermForRevoke?.name}"
            </Typography>{' '}
            from the "
            <Typography component="span" variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
              {formatRoleName(role?.name || role?.role)}
            </Typography>
            " role?
          </Typography>
        }
        confirmText="Remove"
        cancelText="Cancel"
        severity="error"
      />
    </Dialog>
  );
};

export default SchoolRolePermissionsModal;