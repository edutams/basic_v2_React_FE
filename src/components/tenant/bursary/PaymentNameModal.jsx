import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  FormControl,
  FormLabel,
  Grid,
  Divider,
} from '@mui/material';
import PropTypes from 'prop-types';

const PaymentNameModal = ({ open, onClose, onSave, paymentName }) => {
  const [formData, setFormData] = useState({
    name: '',
    payOption: 'compulsory',
    settlementBank: 'gtb',
    accountNumber: '',
    accountName: '',
    feeBearer: 'client',
    modules: 'none',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paymentName) {
      setFormData({
        name: paymentName.name || '',
        payOption: paymentName.payOption || 'compulsory',
        settlementBank: paymentName.settlementBank || 'gtb',
        accountNumber: paymentName.accountNumber || '',
        accountName: paymentName.accountName || '',
        feeBearer: paymentName.feeBearer || 'client',
        modules: paymentName.modules || 'none',
        status: paymentName.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        payOption: 'compulsory',
        settlementBank: 'gtb',
        accountNumber: '',
        accountName: '',
        feeBearer: 'client',
        modules: 'none',
        status: 'active',
      });
    }
    setErrors({});
  }, [paymentName, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Payment name is required';
    }
    
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }
    
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {paymentName ? 'Edit Payment Name' : 'Add New Payment Name'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Configure payment item details and settlement account
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Payment Name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., Acceptance Fee, Tuition Fee"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Pay Option"
                  fullWidth
                  value={formData.payOption}
                  onChange={handleChange('payOption')}
                  required
                >
                  <MenuItem value="compulsory">Compulsory</MenuItem>
                  <MenuItem value="optional">Optional</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Settlement Account */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Settlement Account Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Bank"
                  fullWidth
                  value={formData.settlementBank}
                  onChange={handleChange('settlementBank')}
                  required
                >
                  <MenuItem value="gtb">GTB (Guaranty Trust Bank)</MenuItem>
                  <MenuItem value="fcmb">FCMB (First City Monument Bank)</MenuItem>
                  <MenuItem value="wema">Wema Bank</MenuItem>
                  <MenuItem value="zenith">Zenith Bank</MenuItem>
                  <MenuItem value="access">Access Bank</MenuItem>
                  <MenuItem value="uba">UBA (United Bank for Africa)</MenuItem>
                  <MenuItem value="firstbank">First Bank</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Account Number"
                  fullWidth
                  value={formData.accountNumber}
                  onChange={handleChange('accountNumber')}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber}
                  placeholder="0123456789"
                  required
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Account Name"
                  fullWidth
                  value={formData.accountName}
                  onChange={handleChange('accountName')}
                  error={!!errors.accountName}
                  helperText={errors.accountName}
                  placeholder="School Account Name"
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Additional Settings */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Additional Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Fee Bearer"
                  fullWidth
                  value={formData.feeBearer}
                  onChange={handleChange('feeBearer')}
                  helperText="Who pays the gateway charges"
                  required
                >
                  <MenuItem value="client">Client (School)</MenuItem>
                  <MenuItem value="student">Student (Parent)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Modules"
                  fullWidth
                  value={formData.modules}
                  onChange={handleChange('modules')}
                  helperText="Which module this payment applies to"
                  required
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="admission">Admission</MenuItem>
                  <MenuItem value="hostel">Hostel</MenuItem>
                  <MenuItem value="library">Library</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={formData.status}
                  onChange={handleChange('status')}
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Typography variant="caption" color="info.main">
              💡 <strong>Tip:</strong> Make sure the settlement account details are correct. All
              payments for this item will be credited to this account.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
          {paymentName ? 'Update' : 'Add'} Payment Name
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PaymentNameModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  paymentName: PropTypes.object,
};

export default PaymentNameModal;
