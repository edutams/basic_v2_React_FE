import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import gatewayApi from '@/api/landlord/gateway/gatewayApi';

const ManageSchoolGateway = ({ open, onClose, school, onSave }) => {
  const [gateways, setGateways] = useState([]);
  const [banks, setBanks] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // mode: 'create' = new gateway account, 'existing' = already have credentials
  const [mode, setMode] = useState('create');

  const [formData, setFormData] = useState({
    gateway_id: '',
    gateway_merchant_id: '',
    gateway_public_key: '',
    gateway_private_key: '',
    bank: '',
    account_number: '',
    currency: '₦',
  });

  const selectedGateway = gateways.find((g) => g.id === formData.gateway_id);

  useEffect(() => {
    if (open) {
      loadGateways();
      loadBanks();
      setMode('create');
      setError('');
      setFormData({
        gateway_id: '',
        gateway_merchant_id: '',
        gateway_public_key: '',
        gateway_private_key: '',
        bank: '',
        account_number: '',
        currency: '₦',
      });
    }
  }, [open]);

  const loadGateways = async () => {
    setGatewaysLoading(true);
    try {
      const res = await gatewayApi.getAll({ per_page: 100 });
      setGateways(res.data?.data || res.data || []);
    } catch {
      setError('Failed to load gateways');
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
      // silently fail
    } finally {
      setBanksLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!formData.gateway_id) return 'Please select a gateway';
    if (!formData.currency) return 'Please select a currency';
    if (mode === 'existing') {
      if (!formData.gateway_merchant_id) return 'Merchant ID is required';
      if (!formData.gateway_public_key) return 'Public key is required';
      if (!formData.gateway_private_key) return 'Private key is required';
    } else {
      if (!formData.bank) return 'Please select a bank';
      if (!formData.account_number || !/^\d{10}$/.test(formData.account_number))
        return 'Valid 10-digit account number is required';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        tenant_id: school?.id,
        gtcode: mode === 'existing' ? 'DontCreateGateway' : 'CreateGateway',
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Manage School Gateway"
      size="small"
      showCloseButton
      showDivider
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="info" sx={{ fontSize: 12 }}>
          Configure the payment gateway for <strong>{school?.tenant_name}</strong>.
        </Alert>

        {/* Gateway Select */}
        <TextField
          select
          label="Select Gateway"
          fullWidth
          value={formData.gateway_id}
          onChange={handleChange('gateway_id')}
          disabled={gatewaysLoading}
        >
          <MenuItem value="">-- choose --</MenuItem>
          {gatewaysLoading ? (
            <MenuItem disabled>
              <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
            </MenuItem>
          ) : (
            gateways.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.gateway_name}
              </MenuItem>
            ))
          )}
        </TextField>

        {/* Mode toggle — only show when gateway is selected */}
        {formData.gateway_id && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: mode === 'existing' ? 'info.light' : 'warning.light',
              borderRadius: 2,
              cursor: 'pointer',
            }}
            onClick={() => setMode(mode === 'existing' ? 'create' : 'existing')}
          >
            <Typography variant="body2" color={mode === 'existing' ? 'info.dark' : 'warning.dark'}>
              {mode === 'existing' ? (
                <>
                  Don't have a <strong>{selectedGateway?.gateway_name}</strong> account?{' '}
                  <strong style={{ textDecoration: 'underline' }}>Click here</strong>
                </>
              ) : (
                <>
                  Already have a <strong>{selectedGateway?.gateway_name}</strong> account?{' '}
                  <strong style={{ textDecoration: 'underline' }}>Click here</strong>
                </>
              )}
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Existing credentials mode */}
        {mode === 'existing' && formData.gateway_id && (
          <Stack spacing={2}>
            <TextField
              label="Merchant ID"
              fullWidth
              value={formData.gateway_merchant_id}
              onChange={handleChange('gateway_merchant_id')}
              placeholder="Enter your merchant ID"
            />
            <TextField
              label="Public Key"
              fullWidth
              value={formData.gateway_public_key}
              onChange={handleChange('gateway_public_key')}
              placeholder="Enter your public key"
            />
            <TextField
              label="Private Key"
              fullWidth
              value={formData.gateway_private_key}
              onChange={handleChange('gateway_private_key')}
              placeholder="Enter your private key"
              type="password"
            />
          </Stack>
        )}

        {/* Create new gateway account mode */}
        {mode === 'create' && formData.gateway_id && (
          <Stack spacing={2}>
            <TextField
              select
              label="Select Bank"
              fullWidth
              value={formData.bank}
              onChange={handleChange('bank')}
              disabled={banksLoading}
            >
              <MenuItem value="">-- Choose Bank --</MenuItem>
              {banksLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                </MenuItem>
              ) : (
                banks.map((bank, i) => (
                  <MenuItem key={i} value={`${bank.bankCode}, ${bank.bankName}`}>
                    {bank.bankName}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              label="Account Number"
              fullWidth
              value={formData.account_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData((prev) => ({ ...prev, account_number: value }));
              }}
              inputProps={{ maxLength: 10, inputMode: 'numeric' }}
              placeholder="10-digit account number"
            />
          </Stack>
        )}

        {/* Currency — always shown */}
        {formData.gateway_id && (
          <TextField
            select
            label="Currency"
            fullWidth
            value={formData.currency}
            onChange={handleChange('currency')}
          >
            <MenuItem value="₦">₦</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </TextField>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" size="small" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit} disabled={saving || gatewaysLoading} sx={{ fontWeight: 600 }}>
            {saving ? 'Saving...' : mode === 'existing' ? 'Save' : 'Create Payment Gateway Account'}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

ManageSchoolGateway.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  school: PropTypes.object,
  onSave: PropTypes.func,
};

export default ManageSchoolGateway;
