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
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolViewRoleModal;
