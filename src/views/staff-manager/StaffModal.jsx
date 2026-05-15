import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import StaffForm from './StaffForm';

const StaffModal = ({ open, onClose, onSave, isLoading, mode, initialValues }) => {
  const handleSave = async (values) => {
    await onSave(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === 'edit' ? 'Edit Teaching Staff' : 'Add New Teaching Staff'}
      </DialogTitle>
      <DialogContent dividers>
        <StaffForm 
          initialValues={initialValues} 
          onSubmit={handleSave} 
          onCancel={onClose}
          isLoading={isLoading} 
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StaffModal;
