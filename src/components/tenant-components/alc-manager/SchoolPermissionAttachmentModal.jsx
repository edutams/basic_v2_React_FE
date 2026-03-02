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

const SchoolPermissionAttachmentModal = ({
  open,
  onClose,
  selectedRow,
  availablePermissions,
  selectedPermissions = [],
  permissionSearch,
  onPermissionSearchChange,
  onPermissionChange,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (open && availablePermissions.length === 0) {
      fetchPermissions();
    } else if (availablePermissions.length > 0) {
      setPermissions(availablePermissions);
    }
  }, [open, availablePermissions]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await aclApi.getSchoolAllPermissions();
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
  };

  const isSelected = (permission) => {
    return selectedPermissions.some((p) => p.id === permission.id || p.name === permission.name);
  };

  const filteredPermissions = permissions.filter((perm) =>
    perm.name?.toLowerCase().includes(permissionSearch?.toLowerCase() || ''),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Attach Permissions to Role{' '}
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
          sx={{ mb: 2 }}
          value={permissionSearch}
          onChange={(e) => onPermissionSearchChange && onPermissionSearchChange(e.target.value)}
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
        <Button variant="contained" color="primary" onClick={onSave}>
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolPermissionAttachmentModal;
