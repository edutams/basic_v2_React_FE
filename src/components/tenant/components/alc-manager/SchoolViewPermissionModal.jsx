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

const SchoolViewPermissionModal = ({ open, onClose, selectedRow, permissionsToView = [] }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Permissions for Role{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{selectedRow?.name}"
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Permissions attached to this role:
        </Typography>
        <Box sx={{ mt: 1 }}>
          {permissionsToView && permissionsToView.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {permissionsToView.map((permission, index) => {
                const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
                const color = colors[index % colors.length];
                
                return (
                  <Chip
                    key={permission.id || index}
                    label={permission.name || permission}
                    color={color}
                    variant="outlined"
                    size="small"
                  />
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No permissions attached to this role.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolViewPermissionModal;
