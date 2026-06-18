import { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import gatewayApi from '@/api/landlord/gateway/gatewayApi';
import { fetchSkoolPayBanks } from '@/api/landlord/bank-service/bankService';

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
  const [gateways, setGateways] = useState([]);
  const [banks, setBanks] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [currentGateway, setCurrentGateway] = useState(null);

  useEffect(() => {
    loadGateways();
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedAgent && gateways.length > 0) {
      const gateway =
        gateways.find(
          (g) => g.id === selectedAgent?.gateway || g.name === selectedAgent?.gateway,
        ) || null;
      setCurrentGateway(gateway);
    }
  }, [selectedAgent, gateways]);

  const loadGateways = async () => {
    setGatewaysLoading(true);
    try {
      const res = await gatewayApi.getAll();
      setGateways(res.data?.data || []);
    } catch {
      // fallback silently
    } finally {
      setGatewaysLoading(false);
    }
  };

  const loadBanks = async () => {
    setBanksLoading(true);
    try {
      const res = await fetchSkoolPayBanks();
      setBanks(res.data?.result || []);
    } catch {
      // fallback silently
    } finally {
      setBanksLoading(false);
    }
  };

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
      const selectedGateway = gateways.find((g) => g.id === values.gateway);
      const selectedBank = banks.find((b) => b.code === values.bank);
      const selectedCurrency = availableCurrencies.find((c) => c.code === values.currency);

      onSave({
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
      });
      onClose();
    },
  });

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure your payment gateway settings to receive payments from school registrations and
        transactions.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={5} direction="column">
          {/* {currentGateway && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="primary" mb={2}>
                  Current Gateway
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body1" fontWeight="medium">
                    {currentGateway.gateway_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({currentGateway.gateway_code})
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Account: {selectedAgent?.accountNumber || 'Not set'} | Currency:{' '}
                  {selectedAgent?.currency || 'Not set'}
                </Typography>
              </Paper>
            </Grid>
          )} */}

          {/* Gateway */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Gateway</InputLabel>
              <Select
                name="gateway"
                value={formik.values.gateway}
                label="Select Gateway"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gateway && Boolean(formik.errors.gateway)}
                disabled={gatewaysLoading}
              >
                <MenuItem value="">-- Select Gateway --</MenuItem>
                {gatewaysLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                  </MenuItem>
                ) : (
                  gateways.map((gateway) => (
                    <MenuItem key={gateway.id} value={gateway.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {gateway.gateway_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {gateway.gateway_code}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.gateway && formik.errors.gateway && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.gateway}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Bank */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                name="bank"
                value={formik.values.bank}
                label="Select Bank"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bank && Boolean(formik.errors.bank)}
                disabled={banksLoading}
              >
                <MenuItem value="">-- Select Bank --</MenuItem>
                {banksLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                  </MenuItem>
                ) : (
                  banks.map((bank) => (
                    <MenuItem key={bank.bankCode} value={bank.bankCode}>
                      {bank.bankName}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.bank && formik.errors.bank && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {formik.errors.bank}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Account Number */}
          <Grid item xs={12}>
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
              inputProps={{ maxLength: 10, pattern: '[0-9]*' }}
            />
          </Grid>

          {/* Currency */}
          <Grid item xs={12}>
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
                      <Typography variant="body2">{currency.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Summary */}
          {formik.values.gateway && formik.values.bank && formik.values.accountNumber && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'success.light' }}>
                <Typography variant="h6" color="success.dark" mb={2}>
                  Gateway Configuration Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Gateway:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {gateways.find((g) => g.id === formik.values.gateway)?.gateway_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Bank:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {banks.find((b) => b.bankCode === formik.values.bank)?.bankName}
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
                      {availableCurrencies.find((c) => c.code === formik.values.currency)?.name}
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
            disabled={!formik.isValid || formik.isSubmitting || gatewaysLoading || banksLoading}
          >
            {formik.isSubmitting ? 'Saving...' : 'Create Payment Gateway'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ManageGateway;
