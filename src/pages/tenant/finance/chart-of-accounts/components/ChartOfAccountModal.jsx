import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ChartOfAccountModal = ({ open, onClose, mode, selectedRow, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    linkedBank: '',
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && selectedRow) {
        setFormData({
          code: selectedRow.code || '',
          name: selectedRow.name || '',
          category: selectedRow.category || '',
          linkedBank: selectedRow.linkedBank !== '—' ? selectedRow.linkedBank : '',
        });
      } else {
        setFormData({ code: '', name: '', category: '', linkedBank: '' });
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
        <DialogTitle>{mode === 'create' ? 'Create Chart of Account' : 'Edit Chart of Account'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Account Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <MenuItem value="Asset">Asset</MenuItem>
                  <MenuItem value="Liability">Liability</MenuItem>
                  <MenuItem value="Equity">Equity</MenuItem>
                  <MenuItem value="Revenue">Revenue</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Linked Bank</InputLabel>
                <Select
                  label="Linked Bank"
                  name="linkedBank"
                  value={formData.linkedBank}
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Zenith Bank">Zenith Bank</MenuItem>
                  <MenuItem value="GTBank">GTBank</MenuItem>
                </Select>
              </FormControl>
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

export default ChartOfAccountModal;
