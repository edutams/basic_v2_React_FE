import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import StaffForm from './StaffForm';

const StaffModal = ({ open, onClose, onSave, isLoading, mode, initialValues }) => {
  const handleSave = async (values) => {
    await onSave(values);
  };

  const handleSubmit = () => {
    if (window.staffFormSubmit) {
      window.staffFormSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === 'edit' ? 'Edit Teacher' : 'Add New Teacher'}
      </DialogTitle>
      <DialogContent dividers>
        <StaffForm
          initialValues={initialValues}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ textTransform: 'none' }}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffModal;
