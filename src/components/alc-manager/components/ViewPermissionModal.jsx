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

const ViewPermissionModal = ({
  open,
  onClose,
  selectedRow,
  permissionsToView,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Permissions for{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{selectedRow?.roleName}"
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Permissions attached to this role:
        </Typography>
        <Box sx={{ mt: 1 }}>
          {permissionsToView && permissionsToView.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {permissionsToView.map((permission, index) => (
                <li key={index}>
                  <Typography variant="body2">{permission}</Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No permissions attached to this role.
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

export default ViewPermissionModal;