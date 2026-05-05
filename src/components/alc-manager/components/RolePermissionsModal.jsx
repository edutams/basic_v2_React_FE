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
  CircularProgress,
  Alert,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  VpnKeyOutlined as PermissionIcon,
} from '@mui/icons-material';
import aclApi from '../../../api/aclApi';

/**
 * RolePermissionsModal
 *
 * Displays all permissions assigned to a specific role.
 *
 * Props:
 *   open     {boolean}
 *   onClose  {function}
 *   roleId   {number|string|null}
 */
const RolePermissionsModal = ({ open, onClose, roleId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && roleId) {
      fetchPermissions();
    }
  }, [open, roleId]);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aclApi.getRolePermissions(roleId);
      // Assuming res.data.permissions is the array of permissions
      setPermissions(res.data?.permissions || []);
    } catch (err) {
      console.error('Failed to fetch role permissions:', err);
      setError('Failed to load permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPermissions([]);
    setError(null);
    onClose();
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
            Permissions for this Role
          </Typography>
          {permissions.length > 0 && !loading && (
            <Chip label={permissions.length} size="small" color="primary" variant="outlined" />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '10%' }}>#</TableCell>
                <TableCell sx={{ width: '60%' }}>Permission Name</TableCell>
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
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {perm.description || perm.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                        {perm.name}
                      </Typography>
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Alert severity="info">No permissions assigned to this role.</Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
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
