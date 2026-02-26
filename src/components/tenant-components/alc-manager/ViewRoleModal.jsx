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

/**
 * Tenant-specific ViewRoleModal that fetches role details from school/tenant API
 */
const ViewRoleModal = ({ open, onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (open && currentUser) {
      fetchUserRoles();
    }
  }, [open, currentUser]);

  const fetchUserRoles = async () => {
    setLoading(true);
    try {
      // Fetch the latest user data with roles from the API
      const res = await aclApi.getSchoolUsers();

      // Find the current user in the response
      let usersData = [];
      if (Array.isArray(res.data)) {
        usersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      }

      const updatedUser = usersData.find((u) => u.id === currentUser.id);
      if (updatedUser && updatedUser.roles) {
        setUserRoles(updatedUser.roles);
      } else if (updatedUser && updatedUser.assignedRoles) {
        setUserRoles(updatedUser.assignedRoles);
      } else {
        setUserRoles([]);
      }
    } catch (err) {
      console.error('Failed to fetch user roles:', err);
      // Fallback to the roles from currentUser prop
      setUserRoles(currentUser?.assignedRoles || []);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColors = (roleName) => {
    const roleColorMap = {
      user: { bg: '#e8f5e9', color: '#2e7d32' },
      admin: { bg: '#ffebee', color: '#c62828' },
      customer: { bg: '#e3f2fd', color: '#1565c0' },
      manager: { bg: '#fff3e0', color: '#ef6c00' },
      teacher: { bg: '#fff8e1', color: '#f9a825' },
      staff: { bg: '#e3f2fd', color: '#1565c0' },
      super_admin: { bg: '#e8eaf6', color: '#3f51b5' },
      superadmin: { bg: '#e8eaf6', color: '#3f51b5' },
    };
    const normalizedRole = roleName?.toString().toLowerCase();
    return roleColorMap[normalizedRole] || { bg: '#f5f5f5', color: '#616161' };
  };

  // Use roles from API or fallback to prop
  const displayRoles = userRoles.length > 0 ? userRoles : currentUser?.assignedRoles || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Roles for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Current school roles assigned to this user:
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {displayRoles.length > 0 ? (
              displayRoles.map((role, index) => {
                const roleName = typeof role === 'object' ? role.name : role;
                const colors = getRoleColors(roleName);

                return (
                  <Chip
                    key={index}
                    label={roleName}
                    size="small"
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: colors.bg,
                      color: colors.color,
                      fontWeight: 500,
                    }}
                  />
                );
              })
            ) : (
              <Typography variant="body2" color="textSecondary">
                No roles assigned to this user.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRoleModal;
