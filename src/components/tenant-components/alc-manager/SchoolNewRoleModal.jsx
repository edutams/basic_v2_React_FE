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

const SchoolNewRoleModal = ({ open, onClose, formData, onFieldChange, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.roleName || ''}
          onChange={(e) => onFieldChange('roleName', e.target.value)}
          sx={{ mb: 2 }}
        />
        {/* <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Guard Name</InputLabel>
          <Select
            value={formData.guardName || 'web'}
            label="Guard Name"
            onChange={(e) => onFieldChange('guardName', e.target.value)}
          >
            <MenuItem value="web">web</MenuItem>
            <MenuItem value="api">api</MenuItem>
          </Select>
        </FormControl> */}
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={formData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onSave}>
          Create Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolNewRoleModal;
