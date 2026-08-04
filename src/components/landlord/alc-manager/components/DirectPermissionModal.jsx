import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import aclApi from '@/api/landlord/acl/aclApi';
import { groupPermissionsByModule, prettifyModuleName } from '@/utils/permissionGrouping';

const DirectPermissionModal = ({ open, onClose, currentAgent, onPermissionSave }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [directPermissions, setDirectPermissions] = useState([]);

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
      // Get direct and inherited permissions in one call
      const res = await aclApi.getAgentDirectPermissions(currentAgent.id);

      const directPerms = res?.data?.direct || [];
      const inheritedPerms = res?.data?.inherited || [];

      setDirectPermissions(directPerms);

      // All permissions for the user (direct + inherited)
      const allPermissions = [...new Set([...directPerms, ...inheritedPerms])];
      setCurrentPermissions(allPermissions);

      // For the checklist, we only pre-select direct permissions
      setSelectedPermissions(directPerms);
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
    }
  };

  const isFromRole = (permissionName) => {
    return (
      currentPermissions.includes(permissionName) && !directPermissions.includes(permissionName)
    );
  };

  const handleToggle = (permission) => {
    // Don't allow toggling if permission comes from a role (only direct permissions can be modified)
    if (isFromRole(permission.name)) {
      return;
    }
    setSelectedPermissions((prev) => {
      const exists = prev.includes(permission.name);
      return exists ? prev.filter((p) => p !== permission.name) : [...prev, permission.name];
    });
  };

  const isSelected = (permission) => {
    return selectedPermissions.includes(permission.name);
  };

  const filteredPermissions = useMemo(() => {
    const term = permissionSearch?.toLowerCase() || '';
    return permissions.filter(
      (permission) =>
        permission?.name?.toLowerCase()?.includes(term) ||
        permission?.description?.toLowerCase()?.includes(term),
    );
  }, [permissions, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByModule(filteredPermissions);
  }, [filteredPermissions]);

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
          Permissions are grouped by module. Select the ones to assign directly to this agent:
        </Typography>

        <TextField
          autoFocus
          placeholder="Search Permissions"
          type="text"
          fullWidth
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
          Current permissions: {currentPermissions.length} (Direct: {directPermissions.length}) -
          Permissions from roles cannot be modified
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : groupedPermissions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            No permissions found.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 420, overflow: 'auto', pr: 0.5 }}>
{groupedPermissions.map((group) => (
              <Box
                key={group.module}
                sx={{
                  mb: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
                }}
              >
                {/* Group header (group name) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
                    >
                      {prettifyModuleName(group.module)}
                    </Typography>
                  </Box>
                  <Chip label={`${group.permissions.length}`} size="small" variant="outlined" />
                </Box>

                {/* Permissions of this group */}
                {group.permissions.map((permission, index) => {
                  const fromRole = isFromRole(permission.name);
                  const alreadyHasDirect = directPermissions.includes(permission.name);
                  const isDisabled = fromRole;
                  const showCheck = isSelected(permission) || fromRole;

                  return (
                    <Box
                      key={permission.id}
                      onClick={() => handleToggle(permission)}
                      sx={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        backgroundColor: showCheck ? 'primary.light' : 'transparent',
                        ...(index > 0 && {
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }),
                        '&:hover': {
                          backgroundColor: showCheck ? 'primary.light' : 'action.hover',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '4px',
                          border: '2px solid',
                          borderColor: showCheck ? 'primary.main' : 'grey.400',
                          backgroundColor: showCheck ? 'primary.main' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5,
                          flexShrink: 0,
                          '&::after': showCheck
                            ? {
                              content: '"✓"',
                              color: '#fff',
                              fontSize: '12px',
                            }
                            : {},
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
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
                      {fromRole && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ ml: 'auto', fontSize: 10, flexShrink: 0 }}
                        >
                          (From role)
                        </Typography>
                      )}
                      {!fromRole && alreadyHasDirect && (
                        <Typography
                          variant="caption"
                          sx={{ ml: 'auto', fontSize: 10, color: 'primary.main', flexShrink: 0 }}
                        >
                          ✓ Direct
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="contained" size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button size="small" onClick={handleSave} color="primary">
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DirectPermissionModal;
