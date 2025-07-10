import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const availableGateways = [
  { id: 'paystack', name: 'Paystack', description: 'Popular Nigerian payment gateway' },
  { id: 'flutterwave', name: 'Flutterwave', description: 'Pan-African payment platform' },
  { id: 'stripe', name: 'Stripe', description: 'Global payment processing' },
  { id: 'paypal', name: 'PayPal', description: 'International payment system' },
  { id: 'interswitch', name: 'Interswitch', description: 'Nigerian payment gateway' },
  { id: 'remita', name: 'Remita', description: 'Nigerian payment platform' },
  { id: 'auto_credit', name: 'Auto_credit', description: 'School payment gateway' },
];

const availableBanks = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank Nigeria Plc' },
  { code: '023', name: 'Citibank Nigeria Limited' },
  { code: '050', name: 'Ecobank Nigeria Plc' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

const availableCurrencies = [
  { code: 'NGN', name: 'Nigerian Naira (₦)', symbol: '₦' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
];

const gatewayValidationSchema = yup.object({
  gateway: yup.string().required('Please select a payment gateway'),
  bank: yup.string().required('Please select a bank'),
  accountNumber: yup
    .string()
    .matches(/^\d{10}$/, 'Account number must be exactly 10 digits')
    .required('Account number is required'),
  currency: yup.string().required('Please select a currency'),
});

const ManageSchoolGateway = ({ selectedSchool, onSave, onClose }) => {
  const [currentGateway, setCurrentGateway] = useState(null);

  const formik = useFormik({
    initialValues: {
      gateway: selectedSchool?.gateway || '',
      bank: selectedSchool?.bank || '',
      accountNumber: selectedSchool?.accountNumber || '',
      currency: selectedSchool?.currency || 'NGN',
    },
    validationSchema: gatewayValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  useEffect(() => {
    if (selectedSchool) {
      const gateway = availableGateways.find(
        g => g.id === selectedSchool?.gateway || g.name === selectedSchool?.gateway
      ) || null;
      setCurrentGateway(gateway);
    }
  }, [selectedSchool]);

  const handleSave = (values) => {
    const selectedGateway = availableGateways.find(g => g.id === values.gateway);
    const selectedBank = availableBanks.find(b => b.code === values.bank);
    const selectedCurrency = availableCurrencies.find(c => c.code === values.currency);
    
    const updatedSchool = {
      ...selectedSchool,
      gateway: values.gateway,
      gatewayName: selectedGateway?.name || values.gateway,
      bank: values.bank,
      bankName: selectedBank?.name || values.bank,
      accountNumber: values.accountNumber,
      currency: values.currency,
      currencyName: selectedCurrency?.name || values.currency,
      currencySymbol: selectedCurrency?.symbol || values.currency,
      lastGatewayUpdate: new Date().toISOString(),
    };
    
    onSave(updatedSchool);
    onClose();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure your school payment gateway settings to receive payments from registrations and transactions.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {currentGateway && (
            <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="primary" mb={2}>
                  Current Gateway
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body1" fontWeight="medium">
                    {currentGateway.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({currentGateway.description})
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Account: {selectedSchool?.accountNumber || 'Not set'} | 
                  Currency: {selectedSchool?.currency || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Grid item size={{ xs: 12}}>
            <FormControl fullWidth>
              <InputLabel>Select Gateway</InputLabel>
              <Select
                name="gateway"
                value={formik.values.gateway}
                label="Select Gateway"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gateway && Boolean(formik.errors.gateway)}
              >
                <MenuItem value="">-- Select Gateway --</MenuItem>
                {availableGateways.map((gateway) => (
                  <MenuItem key={gateway.id} value={gateway.id}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {gateway.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {gateway.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.gateway && formik.errors.gateway && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.gateway}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12}}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                name="bank"
                value={formik.values.bank}
                label="Select Bank"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bank && Boolean(formik.errors.bank)}
              >
                <MenuItem value="">-- Select Bank --</MenuItem>
                {availableBanks.map((bank) => (
                  <MenuItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.bank && formik.errors.bank && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.bank}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12}}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              value={formik.values.accountNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
            />
          </Grid>

          <Grid item size={{ xs: 12}}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                name="currency"
                value={formik.values.currency}
                label="Currency"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currency && Boolean(formik.errors.currency)}
              >
                <MenuItem value="">-- Select Currency --</MenuItem>
                {availableCurrencies.map((cur) => (
                  <MenuItem key={cur.code} value={cur.code}>
                    {cur.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.currency && formik.errors.currency && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.currency}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ManageSchoolGateway;
