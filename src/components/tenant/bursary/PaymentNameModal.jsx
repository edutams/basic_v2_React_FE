import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

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
    let value = event.target.value;
    
    if (field === 'accountNumber') {
      value = value.replace(/\D/g, '');
    }
    
    if (field === 'accountName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <ReusableModal
      open={open}
      onClose={onClose}
      title={paymentName ? 'Edit Payment Name' : 'Add New Payment Name'}
      subtitle="Configure payment item details and settlement account"
      size="large"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>

          {/* Info Box */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'info.light',
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
        <Box>
          <Grid container spacing={2}>
            <Grid size= {{ xs: 12, md:6 }}>
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
            <Grid size= {{ xs: 12, md:6 }}>
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

        <Box>
          <Grid container spacing={2}>
            <Grid size= {{ xs: 12, md: 6 }}>
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
            <Grid size= {{ xs: 12, md:6 }}>
              <TextField
                label="Account Number"
                fullWidth
                value={formData.accountNumber}
                onChange={handleChange('accountNumber')}
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                placeholder="0123456789"
                required
                inputProps={{ 
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
              />
            </Grid>
            <Grid size= {{ xs: 12, md: 6 }}>
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
            <Grid size= {{ xs: 12, md:6 }}>
              <TextField
                select
                label="Fee Bearer"
                fullWidth
                value={formData.feeBearer}
                onChange={handleChange('feeBearer')}
                helperText="Who pays the gateway charges"
                required
              >
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="student">Student</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Grid container spacing={2}>
            <Grid size= {{ xs: 12, md: 6 }}>
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
            <Grid size= {{ xs: 12, md: 6 }}>
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

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
            {paymentName ? 'Update' : 'Add'} Payment Name
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

PaymentNameModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  paymentName: PropTypes.object,
};

export default PaymentNameModal;
