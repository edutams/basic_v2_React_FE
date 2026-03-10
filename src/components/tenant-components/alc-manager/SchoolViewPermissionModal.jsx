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
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              {permissionsToView.map((permission) => (
                <li key={permission.id}>
                  <Typography variant="body2">{permission.name}</Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No permissions attached to this role.
            </Typography>
          )}
        </Box>
        {/* {permissionsToView.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {permissionsToView.map((permission, index) => (
              <Chip
                key={index}
                label={permission.name || permission}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No permissions attached to this role.
          </Typography>
        )} */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolViewPermissionModal;
