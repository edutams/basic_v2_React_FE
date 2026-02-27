import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';

const ViewRoleModal = ({ open, onClose, currentUser }) => {
  const getRoleColors = (roleName) => {
    const roleColorMap = {
      user: { bg: '#e8f5e9', color: '#2e7d32' },
      admin: { bg: '#ffebee', color: '#c62828' },
      customer: { bg: '#e3f2fd', color: '#1565c0' },
      manager: { bg: '#fff3e0', color: '#ef6c00' },
      agent: { bg: '#f3e5f5', color: '#7b1fa2' },
      super_admin: { bg: '#e8eaf6', color: '#3f51b5' },
      superadmin: { bg: '#e8eaf6', color: '#3f51b5' },
    };
    const normalizedRole = roleName?.toLowerCase();
    return roleColorMap[normalizedRole] || { bg: '#f5f5f5', color: '#616161' };
  };

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
          Current roles assigned to this user:
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {currentUser?.assignedRoles?.length > 0 ? (
            currentUser.assignedRoles.map((role, index) => {
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
