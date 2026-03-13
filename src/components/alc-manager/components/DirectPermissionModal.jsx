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
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import aclApi from 'src/api/aclApi';

const DirectPermissionModal = ({ open, onClose, currentAgent, onPermissionSave }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchPermissions();
      fetchCurrentPermissions();
    }
  }, [open, currentAgent]);

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

  const fetchCurrentPermissions = async () => {
    if (!currentAgent?.id) return;

    try {
      const res = await aclApi.getAgentDirectPermissions(currentAgent.id);
      setCurrentPermissions(res?.data || []);
      setSelectedPermissions(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch current permissions:', err);
    }
  };

  const handleToggle = (permission) => {
    setSelectedPermissions((prev) => {
      const exists = prev.includes(permission.name);
      return exists ? prev.filter((p) => p !== permission.name) : [...prev, permission.name];
    });
  };

  const isSelected = (permission) => {
    return selectedPermissions.includes(permission.name);
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission?.name?.toLowerCase()?.includes(permissionSearch?.toLowerCase() || ''),
  );

  const handleSave = async () => {
    if (onPermissionSave) {
      onPermissionSave(selectedPermissions);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Assign Direct Permissions to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentAgent?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select permissions to assign directly to this agent:
        </Typography>

        <TextField
          autoFocus
          placeholder="Search Permissions"
          type="text"
          fullWidth
          variant="outlined"
          value={permissionSearch}
          onChange={(e) => setPermissionSearch(e.target.value)}
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
          Current direct permissions: {selectedPermissions.length} permissions assigned
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
              <Box
                key={permission.id}
                onClick={() => handleToggle(permission)}
                sx={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isSelected(permission) ? 'primary.main' : 'divider',
                  backgroundColor: isSelected(permission) ? 'primary.light' : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected(permission) ? 'primary.light' : 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '4px',
                    border: '2px solid',
                    borderColor: isSelected(permission) ? 'primary.main' : 'grey.400',
                    backgroundColor: isSelected(permission) ? 'primary.main' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                    '&::after': isSelected(permission)
                      ? {
                          content: '"✓"',
                          color: '#fff',
                          fontSize: '12px',
                        }
                      : {},
                  }}
                />
                <Typography variant="body2">{permission.name}</Typography>
              </Box>
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

export default DirectPermissionModal;
