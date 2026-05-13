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
  availablePermissions = [],
  selectedPermissions: propSelectedPermissions = [],
  permissionSearch,
  onPermissionSearchChange,
  onPermissionChange,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearchLocal, setPermissionSearchLocal] = useState('');

  const displayPermissions =
    availablePermissions.length > 0 ? availablePermissions : permissions;

  useEffect(() => {
    if (availablePermissions.length > 0) {
      setLoading(false);
    }
  }, [availablePermissions]);

  useEffect(() => {
    if (open && availablePermissions.length === 0) {
      fetchPermissions();
    }
  }, [open, availablePermissions]);

  useEffect(() => {
    if (propSelectedPermissions && propSelectedPermissions.length > 0) {
      setSelectedPermissions(propSelectedPermissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [propSelectedPermissions]);

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
    if (onPermissionChange) {
      onPermissionChange(permission);
    }

    setSelectedPermissions((prev) => {
      const exists = prev.some(
        (p) =>
          String(p.id) === String(permission.id) ||
          p.name === permission.name,
      );

      return exists
        ? prev.filter(
          (p) =>
            String(p.id) !== String(permission.id) &&
            p.name !== permission.name,
        )
        : [...prev, permission];
    });
  };

  const isSelected = (permission) => {
    return selectedPermissions.some(
      (p) =>
        String(p.id) === String(permission.id) ||
        p.name === permission.name,
    );
  };

  const filteredPermissions = displayPermissions.filter((permission) =>
    permission?.name
      ?.toLowerCase()
      ?.includes(permissionSearchLocal?.toLowerCase() || ''),
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

      {/* 🔥 Custom structured content */}
      <DialogContent dividers sx={{ p: 0 }}>
        {/* Top description */}
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">
            Select permissions to attach to this role:
          </Typography>
        </Box>

        {/* 🔥 Sticky Search Section */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'background.paper',
            p: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <TextField
            autoFocus
            placeholder="Search Permissions"
            fullWidth
            variant="outlined"
            value={permissionSearchLocal}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />

          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Current permissions: {selectedPermissions.length} permissions assigned
          </Typography>
        </Box>

        {/* 🔽 Scrollable Permissions List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              maxHeight: 400,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
            }}
          >
            {filteredPermissions.map((permission) => (
              <ListItem
                key={permission.id}
                disablePadding
                sx={{ padding: '4px 8px' }}
              >
                <ListItemButton
                  onClick={() => handleToggle(permission)}
                  sx={{
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isSelected(permission)}
                    sx={{ marginRight: 1 }}
                  />
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {permission.description || permission.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: '10px' }}
                        >
                          {permission.name}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionAttachmentModal;