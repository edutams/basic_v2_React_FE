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

const ViewRoleModal = ({ open, onClose, currentAgent }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Roles for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentAgent?.name}"
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Current roles assigned to this user:
        </Typography>
        {/* <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {currentUser?.assignedRoles?.length > 0 ? (
            currentUser.assignedRoles.map((role, index) => (
              <Chip
                key={index}
                label={role}
                size="small"
                variant="filled"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: (theme) => {
                    const roleColors = {
                      User: theme.palette.success.light,
                      Admin: theme.palette.error.light,
                      Customer: theme.palette.info.light,
                      Manager: theme.palette.warning.light,
                      Agent: theme.palette.secondary.light,
                      Super_Admin: theme.palette.primary.light,
                    };
                    return roleColors[role] || theme.palette.grey[300];
                  },
                  color: (theme) => {
                    const roleColors = {
                      User: theme.palette.success.main,
                      Admin: theme.palette.error.main,
                      Customer: theme.palette.info.main,
                      Manager: theme.palette.warning.main,
                      Agent: theme.palette.secondary.main,
                      Super_Admin: theme.palette.primary.main,
                    };
                    return roleColors[role] || theme.palette.grey[700];
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No roles assigned to this user.
            </Typography>
          )}
        </Box> */}
        <Box sx={{ mt: 1 }}>
          {currentAgent?.assignedRoles?.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {currentAgent.assignedRoles.map((role, index) => (
                <li key={index}>
                  <Typography variant="body2">
                    {typeof role === 'object' ? role.name : role}
                  </Typography>
                </li>
              ))}
            </ul>
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
