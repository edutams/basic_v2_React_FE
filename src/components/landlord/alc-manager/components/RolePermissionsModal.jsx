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
  Skeleton,
  Alert,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Close as CloseIcon,
  VpnKeyOutlined as PermissionIcon,
} from '@mui/icons-material';
import { IconTrash, IconDotsVertical } from '@tabler/icons-react';
import aclApi from '@/api/landlord/acl/aclApi';
import ReusableDialog from '@/components/shared/ReusableDialog';

const RolePermissionsModal = ({ open, onClose, roleId, roleName, role, onPermissionRemoved }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPerm, setSelectedPerm] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuPerm, setActiveMenuPerm] = useState(null);

const displayName = (roleName || role?.role || role?.name || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, char => char.toUpperCase());

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
      setPermissions(res.data?.permissions || []);
    } catch (err) {
      console.error('Failed to fetch role permissions:', err);
      setError('Failed to load permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, perm) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuPerm(perm);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuPerm(null);
  };

  const handleRemoveClick = (perm) => {
    setSelectedPerm(perm);
    handleMenuClose();
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedPerm) return;
    setRemoving(selectedPerm.id);
    setConfirmOpen(false);
    try {
      const remainingIds = permissions
        .filter((p) => p.id !== selectedPerm.id)
        .map((p) => p.id);
      await aclApi.attachPermissions(roleId, remainingIds);
      setPermissions((prev) => prev.filter((p) => p.id !== selectedPerm.id));
      setSelectedPerm(null);
      onPermissionRemoved?.();
    } catch (err) {
      console.error('Failed to remove permission:', err);
      setError('Failed to remove permission. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const handleClose = () => {
    setPermissions([]);
    setError(null);
    setSelectedPerm(null);
    setConfirmOpen(false);
    setAnchorEl(null);
    setActiveMenuPerm(null);
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
              {displayName && (
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  ({displayName})
                </Box>
              )}
            </Typography>
            {permissions.length > 0 && !loading && (
              <Chip label={permissions.length} size="small" color="primary" />
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
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
                      <TableCell>{index + 1}</TableCell>
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
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, perm)}
                        >
                          <IconDotsVertical size={18} color="#6B7280" />
                        </IconButton>
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
          <Button variant="contained" size="small" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Row Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => handleRemoveClick(activeMenuPerm)}
          disabled={removing === activeMenuPerm?.id}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
            <IconTrash size={16} />
          </ListItemIcon>
          Remove Permission
        </MenuItem>
      </Menu>

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

export default RolePermissionsModal;
