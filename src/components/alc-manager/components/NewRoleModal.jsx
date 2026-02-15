import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

const NewRoleModal = ({ open, onClose, formData, onFieldChange, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.roleName}
            onChange={(e) => onFieldChange('roleName', e.target.value)}
            // required
          />
          <TextField
            margin="dense"
            label="Guard Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.guardName}
            onChange={(e) => onFieldChange('guardName', e.target.value)}
            // required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Add Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRoleModal;
