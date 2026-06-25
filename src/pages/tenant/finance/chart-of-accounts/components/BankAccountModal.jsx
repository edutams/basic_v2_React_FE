import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from '@mui/material';

const BankAccountModal = ({ open, onClose, mode, selectedRow }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Register Bank' : 'Edit Bank'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Bank Name"
              defaultValue={mode === 'edit' && selectedRow ? selectedRow.bank : ''}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Account Name"
              defaultValue={mode === 'edit' && selectedRow ? selectedRow.accountName : ''}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Account Number"
              defaultValue={mode === 'edit' && selectedRow ? selectedRow.accountNo : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={onClose}>
          {mode === 'create' ? 'Submit' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankAccountModal;
