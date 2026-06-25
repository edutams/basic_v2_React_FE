import React from 'react';
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

const ChartOfAccountModal = ({ open, onClose, mode, selectedRow }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Create Chart of Account' : 'Edit Chart of Account'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Account Code"
              defaultValue={mode === 'edit' && selectedRow ? selectedRow.code : ''}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                defaultValue={mode === 'edit' && selectedRow ? selectedRow.category : ''}
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
            <TextField
              fullWidth
              label="Account Name"
              defaultValue={mode === 'edit' && selectedRow ? selectedRow.name : ''}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Linked Bank</InputLabel>
              <Select
                label="Linked Bank"
                defaultValue={mode === 'edit' && selectedRow && selectedRow.linkedBank !== '—' ? selectedRow.linkedBank : ''}
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
        <Button variant="contained" onClick={onClose}>
          {mode === 'create' ? 'Submit' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartOfAccountModal;
