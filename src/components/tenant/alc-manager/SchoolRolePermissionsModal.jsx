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
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  VpnKeyOutlined as PermissionIcon,
} from '@mui/icons-material';
import { IconTrash } from '@tabler/icons-react';
import aclApi from '@/api/tenant/acl/aclApi';
import ReusableDialog from '@/components/shared/ReusableDialog';

const SchoolRolePermissionsModal = ({ open, onClose, role }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [removing, setRemoving] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPerm, setSelectedPerm] = useState(null);

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

  const handleRemoveClick = (perm) => {
    setSelectedPerm(perm);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedPerm) return;
    setRemoving(selectedPerm.id);
    setConfirmOpen(false);
    try {
      const currentPermNames = permissions
        .filter((p) => p.id !== selectedPerm.id)
        .map((p) => p.name);
      await aclApi.attachSchoolRolePermissions(role.id, currentPermNames);
      setPermissions((prev) => prev.filter((p) => p.id !== selectedPerm.id));
      setTotalRows((prev) => prev - 1);
      setSelectedPerm(null);
    } catch (err) {
      console.error('Failed to remove permission:', err);
      setError('Failed to remove permission. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const handleClose = () => {
    setPermissions([]);
    setSearch('');
    setSearchInput('');
    setPage(0);
    setError(null);
    setSelectedPerm(null);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
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
              Permissions for this Role{' '}
              {role?.name && (
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  ({role.name.replace(/_/g, ' ')
  .replace(/\b\w/g, char => char.toUpperCase())})
                </Box>
              )}
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
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ minWidth: '80px' }}
            >
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
                  <TableCell sx={{ width: '57%' }}>Permission Name</TableCell>
                  <TableCell sx={{ width: '10%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(3)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width={j === 0 ? 30 : 100} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : permissions.length > 0 ? (
                  permissions.map((perm, index) => (
                    <TableRow key={perm.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {perm.description || perm.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: '10px' }}
                        >
                          {perm.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove permission">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveClick(perm)}
                              disabled={removing === perm.id}
                            >
                              {removing === perm.id ? (
                                <Skeleton variant="text" width={16} height={16} />
                              ) : (
                                <IconTrash size={16} />
                              )}
                            </IconButton>
                          </span>
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
      </Dialog>

      <ReusableDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove Permission"
        content={
          <Typography variant="body2">
            Are you sure you want to remove{' '}
            <strong>{selectedPerm?.description || selectedPerm?.name}</strong> from this role?
          </Typography>
        }
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" size="small" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </Box>
        }
      />
    </>
  );
};

export default SchoolRolePermissionsModal;
