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

const ManageGateway = ({ selectedAgent, onSave, onClose }) => {
  const [currentGateway, setCurrentGateway] = useState(null);

  const formik = useFormik({
    initialValues: {
      gateway: selectedAgent?.gateway || '',
      bank: selectedAgent?.bank || '',
      accountNumber: selectedAgent?.accountNumber || '',
      currency: selectedAgent?.currency || 'NGN',
    },
    validationSchema: gatewayValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  useEffect(() => {
    if (selectedAgent) {
      const gateway = availableGateways.find(
        g => g.id === selectedAgent?.gateway || g.name === selectedAgent?.gateway
      ) || null;
      setCurrentGateway(gateway);
    }
  }, [selectedAgent]);

  const handleSave = (values) => {
    const selectedGateway = availableGateways.find(g => g.id === values.gateway);
    const selectedBank = availableBanks.find(b => b.code === values.bank);
    const selectedCurrency = availableCurrencies.find(c => c.code === values.currency);
    
    const updatedAgent = {
      ...selectedAgent,
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
    
    onSave(updatedAgent);
    onClose();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure your payment gateway settings to receive payments from school registrations and transactions.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Current Gateway Display */}
          {currentGateway && (
            <Grid item xs={12}>
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
                  Account: {selectedAgent?.accountNumber || 'Not set'} | 
                  Currency: {selectedAgent?.currency || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
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

          <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
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

          <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="accountNumber"
              label="Account Number"
              placeholder="Enter 10-digit account number"
              value={formik.values.accountNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
              helperText={formik.touched.accountNumber && formik.errors.accountNumber}
              inputProps={{
                maxLength: 10,
                pattern: '[0-9]*',
              }}
            />
          </Grid>

          <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
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
                {availableCurrencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="medium">
                        {currency.symbol}
                      </Typography>
                      <Typography variant="body2">
                        {currency.name}
                      </Typography>
                    </Box>
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

          {formik.values.gateway && formik.values.bank && formik.values.accountNumber && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.light' }}>
                <Typography variant="h6" color="success.dark" mb={2}>
                  Gateway Configuration Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Gateway:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {availableGateways.find(g => g.id === formik.values.gateway)?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Bank:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {availableBanks.find(b => b.code === formik.values.bank)?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Account:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formik.values.accountNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Currency:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {availableCurrencies.find(c => c.code === formik.values.currency)?.name}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            Create Payment Gateway
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ManageGateway;
