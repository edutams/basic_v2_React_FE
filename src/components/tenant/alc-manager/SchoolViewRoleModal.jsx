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
  Skeleton,
} from '@mui/material';
import aclApi from '@/api/tenant/acl/aclApi';

const SchoolViewRoleModal = ({ open, onClose, currentAgent }) => {
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (open && currentAgent) {
      fetchUserRoles();
    }
  }, [currentAgent, open]);

  const fetchUserRoles = async () => {
    setLoading(true);
    try {
      // Get the user's roles from the currentAgent object
      setUserRoles(currentAgent?.assignedRoles || []);
    } catch (err) {
      console.error('Failed to fetch user roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleSx = (role) => {
    const normalizedRole = role?.name?.toString().toLowerCase();

    const roleStyles = {
      user: {
        backgroundColor: (theme) => theme.palette.success.light,
        color: (theme) => theme.palette.success.main,
      },
      admin: {
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.main,
      },
      teacher: {
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.main,
      },
      staff: {
        backgroundColor: (theme) => theme.palette.info.light,
        color: (theme) => theme.palette.info.main,
      },
      super_admin: {
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.main,
      },
    };

    return (
      roleStyles[normalizedRole] || {
        backgroundColor: (theme) => theme.palette.grey[200],
        color: (theme) => theme.palette.grey[700],
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Roles for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentAgent?.name}"
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rounded" width={100} height={32} sx={{ mr: 1, mb: 1, borderRadius: '8px' }} />
            ))}
          </Box>
        ) : userRoles.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {userRoles.map((role, index) => (
              <Chip
                key={index}
                label={typeof role === 'object' ? role.name : role}
                sx={{
                  borderRadius: '8px',
                  ...getRoleSx(typeof role === 'object' ? role : { name: role }),
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No roles assigned to this user.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="small" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolViewRoleModal;
