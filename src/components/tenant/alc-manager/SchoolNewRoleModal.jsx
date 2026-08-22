import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const SchoolNewRoleModal = ({ open, onClose, formData, onFieldChange, onSave, isEditing = false }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          type="text"
          fullWidth
          value={formData.roleName || ''}
          onChange={(e) => onFieldChange('roleName', e.target.value)}
          sx={{ mb: 2 }}
        />
        {/* <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Guard Name</InputLabel>
          <Select
            value={formData.guardName || 'tenant'}
            label="Guard Name"
            onChange={(e) => onFieldChange('guardName', e.target.value)}
          >
            <MenuItem value="tenant">tenant</MenuItem>
            <MenuItem value="api">api</MenuItem>
          </Select>
        </FormControl> */}
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" size="small" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" color="primary" onClick={onSave}>
          {isEditing ? 'Update Role' : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolNewRoleModal;

