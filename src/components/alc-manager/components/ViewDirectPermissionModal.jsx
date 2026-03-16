import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import aclApi from 'src/api/aclApi';

const ViewDirectPermissionModal = ({ open, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [directPermissions, setDirectPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);

  useEffect(() => {
    if (open && currentUser) {
      fetchPermissions();
    }
  }, [open, currentUser]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      // Get direct permissions
      const directRes = await aclApi.getAgentDirectPermissions(currentUser.id);
      setDirectPermissions(directRes?.data || []);

      // Get permissions from roles
      const rolesRes = await aclApi.getAgents();
      let agentData = null;

      if (Array.isArray(rolesRes.data)) {
        agentData = rolesRes.data.find((a) => a.id === currentUser.id);
      } else if (rolesRes.data?.data) {
        agentData = rolesRes.data.data.find((a) => a.id === currentUser.id);
      }

      let rolePerms = [];
      if (agentData?.roles) {
        for (const role of agentData.roles) {
          try {
            const rolePermsRes = await aclApi.getRolePermissions(role.id);
            if (rolePermsRes?.data) {
              rolePerms = [...rolePerms, ...rolePermsRes.data.map((p) => p.name)];
            }
          } catch (err) {
            console.error('Failed to fetch role permissions:', err);
          }
        }
      }
      setRolePermissions(rolePerms);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChipColor = (permissionName) => {
    // Check if it's a direct permission
    if (directPermissions.includes(permissionName)) {
      return 'primary';
    }
    return 'default';
  };

  const getChipSx = (permissionName) => {
    if (directPermissions.includes(permissionName)) {
      return {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      };
    }
    return {
      backgroundColor: (theme) => theme.palette.grey[200],
      color: (theme) => theme.palette.grey[700],
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Permissions for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {/* Direct Permissions Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Direct Permissions ({directPermissions.length})
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Permissions assigned directly to this agent
              </Typography>
              {directPermissions.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {directPermissions.map((permission, index) => (
                    <Chip
                      key={index}
                      label={permission}
                      size="small"
                      sx={{
                        backgroundColor: (theme) => theme.palette.primary.light,
                        color: (theme) => theme.palette.primary.main,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                  No direct permissions assigned
                </Typography>
              )}
            </Box>

            {/* Role Permissions Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Role Permissions ({rolePermissions.length})
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Permissions inherited from assigned roles
              </Typography>
              {rolePermissions.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {rolePermissions.map((permission, index) => (
                    <Chip
                      key={index}
                      label={permission}
                      size="small"
                      sx={{
                        backgroundColor: (theme) => theme.palette.grey[200],
                        color: (theme) => theme.palette.grey[700],
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" fontStyle="italic">
                  No role permissions
                </Typography>
              )}
            </Box>

            {/* Total Summary */}
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Total Permissions: {directPermissions.length + rolePermissions.length} (
                {directPermissions.length} direct + {rolePermissions.length} from roles)
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDirectPermissionModal;
