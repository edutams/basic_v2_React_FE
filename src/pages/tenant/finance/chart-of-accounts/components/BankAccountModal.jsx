import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from '@mui/material';

const BankAccountModal = ({ open, onClose, mode, selectedRow, onSubmit }) => {
  const [formData, setFormData] = useState({
    bank: '',
    accountName: '',
    accountNo: '',
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && selectedRow) {
        setFormData({
          bank: selectedRow.bank || '',
          accountName: selectedRow.accountName || '',
          accountNo: selectedRow.accountNo || '',
        });
      } else {
        setFormData({ bank: '', accountName: '', accountNo: '' });
      }
    }
  }, [open, mode, selectedRow]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Register Bank' : 'Edit Bank'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {mode === 'create' ? 'Submit' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankAccountModal;
