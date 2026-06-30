import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';

const NewRoleModal = ({ open, onClose, formData, onFieldChange, onSave, isEditing, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            size="small"
            fullWidth
            value={formData.roleName}
            onChange={(e) => onFieldChange('roleName', e.target.value)}
          />

          <TextField
            margin="dense"
            label="Description"
            type="text"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="small" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={onSave} color="primary" disabled={loading}>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Add Role'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewRoleModal;
