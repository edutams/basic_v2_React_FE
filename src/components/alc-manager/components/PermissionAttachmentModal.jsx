import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Checkbox,
  ListItemText,
  ListItem,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import aclApi from 'src/api/aclApi';

const PermissionAttachmentModal = ({
  open,
  onClose,
  selectedRow,
  selectedPermissions: propSelectedPermissions = [],
  permissionSearch,
  onPermissionSearchChange,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearchLocal, setPermissionSearchLocal] = useState('');

  // Fetch all permissions when modal opens
  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open]);

  // Sync selectedPermissions when prop changes (these are the permissions already attached to the role)
  useEffect(() => {
    if (propSelectedPermissions && propSelectedPermissions.length > 0) {
      setSelectedPermissions(propSelectedPermissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [propSelectedPermissions]);

  // Sync permissionSearch when prop changes
  useEffect(() => {
    if (permissionSearch !== undefined) {
      setPermissionSearchLocal(permissionSearch);
    }
  }, [permissionSearch]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await aclApi.getAllPermissions();
      setPermissions(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permission) => {
    setSelectedPermissions((prev) => {
      const exists = prev.some(
        (p) => String(p.id) === String(permission.id) || p.name === permission.name,
      );
      return exists
        ? prev.filter((p) => String(p.id) !== String(permission.id) && p.name !== permission.name)
        : [...prev, permission];
    });
  };

  const isSelected = (permission) => {
    return selectedPermissions.some(
      (p) => String(p.id) === String(permission.id) || p.name === permission.name,
    );
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission?.name?.toLowerCase()?.includes(permissionSearchLocal?.toLowerCase() || ''),
  );

  const handleSave = () => {
    if (onSave) {
      onSave(selectedPermissions);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setPermissionSearchLocal(value);
    if (onPermissionSearchChange) {
      onPermissionSearchChange(value);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Attach Permissions to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{selectedRow?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select permissions to attach to this role:
        </Typography>

        <TextField
          autoFocus
          placeholder="Search Permissions"
          type="text"
          fullWidth
          variant="outlined"
          value={permissionSearchLocal}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
          Current permissions: {selectedPermissions.length} permissions assigned
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            {filteredPermissions.map((permission) => (
              <ListItem key={permission.id} disablePadding sx={{ padding: '4px 8px' }}>
                <ListItemButton
                  onClick={() => handleToggle(permission)}
                  sx={{
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Checkbox size="small" checked={isSelected(permission)} sx={{ marginRight: 1 }} />
                  <ListItemText
                    primary={permission.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionAttachmentModal;
