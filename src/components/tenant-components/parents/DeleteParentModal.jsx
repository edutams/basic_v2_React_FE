import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const DeleteParentModal = ({ open, onClose, parent, onConfirm }) => {
  const name = parent?.user
    ? `${parent.user.fname} ${parent.user.lname}`
    : 'this parent';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Parent</DialogTitle>

      <DialogContent dividers>
        <Typography>
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteParentModal;
