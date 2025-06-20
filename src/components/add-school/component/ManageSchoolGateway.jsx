import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
} from '@mui/material';

const banks = ['Access Bank', 'GTBank', 'Zenith Bank', 'UBA'];
const gateways = ['Auto_credit'];
const currencies = ['NGN'];

const ManageSchoolGateway = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    gateway: 'Auto_credit',
    bank: '',
    accountNumber: '',
    currency: 'NGN',
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    console.log('Submitting:', formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Manage School Gateway
        </Typography>

<Box component="hr" sx={{ mt: 3, mb: 3 }} />


        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6, md: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Select Gateway</InputLabel>
              <Select value={formData.gateway} disabled label="Select Gateway">
                {gateways.map((gateway) => (
                  <MenuItem key={gateway} value={gateway}>
                    {gateway}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ color: '#f90', fontWeight: 600 }}>
              Already have an Auto_credit Account? Click Here
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                value={formData.bank}
                onChange={handleChange('bank')}
                label="Select Bank"
              >
                {banks.map((bank) => (
                  <MenuItem key={bank} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 12 }}>
            <TextField
              fullWidth
              label="Account Number"
              value={formData.accountNumber}
              onChange={handleChange('accountNumber')}
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={handleChange('currency')}
                label="Currency"
              >
                {currencies.map((cur) => (
                  <MenuItem key={cur} value={cur}>
                    {cur}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button onClick={onClose} sx={{ color: '#8BC34A' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#8BC34A' }}
            onClick={handleSubmit}
          >
            Create Payment Gateway Account
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ManageSchoolGateway;
