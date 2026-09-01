import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import aclApi from '@/api/tenant/acl/aclApi';
import { groupPermissionsByModule, prettifyModuleName } from '@/utils/permissionGrouping';

const SchoolViewDirectPermissionModal = ({ open, onClose, currentUser, onPermissionSave }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [directPermissions, setDirectPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [currentPermissions, setCurrentPermissions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open, currentUser]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      // Get direct + inherited permissions for the user
      const directRes = await aclApi.getSchoolUserDirectPermissions(currentUser.id);
      const directPerms = directRes?.data?.direct || [];
      const inheritedPerms = directRes?.data?.inherited || [];

      setDirectPermissions(Array.isArray(directPerms) ? directPerms : []);
      setRolePermissions(Array.isArray(inheritedPerms) ? inheritedPerms : []);

      const allAttached = [...new Set([...directPerms, ...inheritedPerms])];
      setCurrentPermissions(allAttached);
      // Pre-select only direct permissions (role ones are shown but not editable/submittable)
      setSelectedPermissions(Array.isArray(directPerms) ? directPerms : []);

      // Fetch the full permission catalogue so we can render grouped sections
      const allRes = await aclApi.getSchoolAllPermissions();
      setPermissions(allRes?.data || []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFromRole = (permissionName) => {
    return rolePermissions.includes(permissionName) && !directPermissions.includes(permissionName);
  };

  const handleToggle = (permission) => {
    if (isFromRole(permission.name)) return;
    setSelectedPermissions((prev) => {
      const exists = prev.includes(permission.name);
      return exists ? prev.filter((p) => p !== permission.name) : [...prev, permission.name];
    });
  };

  const isSelected = (permission) => {
    return selectedPermissions.includes(permission.name);
  };

  const isChecked = (permission) => {
    // Role-inherited permissions are always shown as checked (they cannot be modified)
    return isSelected(permission) || isFromRole(permission.name);
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
    setSaving(true);
    try {
      if (onPermissionSave) {
        // selectedPermissions only ever contains direct permissions (role ones are not selectable)
        await onPermissionSave(selectedPermissions);
      }
    } catch (err) {
      console.error('Failed to save permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Permissions for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Permissions attached to this user. Uncheck to remove direct permissions or check to add
          new ones:
        </Typography>

        <TextField
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
          Attached: {currentPermissions.length} (Direct: {directPermissions.length} | From roles:{' '}
          {rolePermissions.length}) - Permissions inherited from roles cannot be modified
        </Typography>

        {loading ? (
          <Box sx={{ py: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="text" height={40} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : groupedPermissions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            No permissions available.
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
                  const isDisabled = fromRole;
                  const showCheck = isChecked(permission);

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
                      {fromRole ? (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ ml: 'auto', fontSize: 10, flexShrink: 0 }}
                        >
                          (From role)
                        </Typography>
                      ) : directPermissions.includes(permission.name) ? (
                        <Typography
                          variant="caption"
                          sx={{ ml: 'auto', fontSize: 10, color: 'primary.main', flexShrink: 0 }}
                        >
                          ✓ Direct
                        </Typography>
                      ) : null}
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
        <Button size="small" onClick={handleSave} color="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolViewDirectPermissionModal;
