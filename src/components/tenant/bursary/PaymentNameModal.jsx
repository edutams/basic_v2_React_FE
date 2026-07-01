import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import { fetchSkoolPayBanks } from '@/api/tenant/bursary/paymentNameApi';
import { fetchGatewayChargeBearer } from '@/api/tenant/bursary/bursarySettingsApi';

const PaymentNameModal = ({ open, onClose, onSave, paymentName }) => {
  const [formData, setFormData] = useState({
    name: '',
    pay_type: 'bursary',
    pay_option: 'compulsory',
    application_stage: 'pre-application',
    bank: '',
    account_number: '',
    fee_bearer: 'school',
    modules: [],
    status: 'active',
  });

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      loadBanks();
      if (paymentName) {
        setFormData({
          name: paymentName.name || '',
          pay_type: paymentName.pay_type || 'bursary',
          pay_option: paymentName.pay_option?.toLowerCase() || 'compulsory',
          application_stage: paymentName.application_stage || 'pre-application',
          bank: paymentName.bank_code ? `${paymentName.bank_code}, ${paymentName.bank_name}` : '',
          account_number: paymentName.account_number || '',
          fee_bearer: paymentName.fee_bearer?.toLowerCase() || 'client',
          modules: paymentName.modules ? JSON.parse(paymentName.modules) : [],
          status: paymentName.status || 'active',
        });
      } else {
        setFormData({
          name: '',
          pay_type: 'bursary',
          pay_option: 'compulsory',
          application_stage: 'pre-application',
          bank: '',
          account_number: '',
          fee_bearer: 'client',
          modules: [],
          status: 'active',
        });

        loadGatewayChargeBearer();
      }
      setErrors({});
    }
  }, [paymentName, open]);

  const loadGatewayChargeBearer = async () => {
    try {
      const res = await fetchGatewayChargeBearer();

      setFormData((prev) => ({
        ...prev,
        fee_bearer: res.data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const loadBanks = async () => {
    setBanksLoading(true);
    try {
      const res = await fetchSkoolPayBanks();
      setBanks(res.data?.result || []);
    } catch {
      // banks failed to load
    } finally {
      setBanksLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));

    // clear account name if bank or account number changes
    if (field === 'bank' || field === 'account_number') {
      setFormData((prev) => ({ ...prev, [field]: value, account_name: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Payment name is required';
    if (!formData.bank) newErrors.bank = 'Bank is required';
    if (!formData.account_number || !/^\d{10}$/.test(formData.account_number))
      newErrors.account_number = 'Valid 10-digit account number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={paymentName ? 'Edit Payment Name' : 'Add New Payment Name'}
      subtitle="Configure payment item details and settlement account"
      size="large"
      showCloseButton
      showDivider
    >
      <Stack spacing={3}>
       <Alert severity="info" sx={{ fontSize: 14 }}>
  <ol style={{ margin: 0, paddingLeft: "16px" }}>
    <li>
      Select the payment type you want to configure, either <strong>Bursary</strong> or <strong>Admission</strong>.
    </li>
    <li>
      Ensure the settlement account details are correct. All payments made for the selected payment type will be credited to this account.
    </li>
  </ol>
</Alert>

        {/* Name + Pay Option */}
        <Grid container spacing={2}>
           <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Payment Type"
              fullWidth
              value={formData.pay_type}
              onChange={(e) => {
                const newPayType = e.target.value;
                handleChange('pay_type')(e);
                // Auto-set pay_option to compulsory when admission is selected
                if (newPayType === 'admission') {
                  setFormData((prev) => ({ ...prev, pay_type: newPayType, pay_option: 'compulsory' }));
                }
              }}
              helperText={
                formData.pay_type === 'bursary'
                  ? 'For regular school fees and charges'
                  : 'For admission-related payments'
              }
            >
              <MenuItem value="bursary">Bursary</MenuItem>
              <MenuItem value="admission">Admission</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Payment Name"
              fullWidth
              value={formData.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="e.g., Acceptance Fee, Tuition Fee"
            />
          </Grid>
         
        </Grid>

        {/* Conditional Pay Option or Application Stage */}
        {formData.pay_type === 'bursary' ? (
          <TextField
            select
            label="Pay Option"
            fullWidth
            value={formData.pay_option}
            onChange={handleChange('pay_option')}
          >
            <MenuItem value="compulsory">Compulsory</MenuItem>
            <MenuItem value="optional">Optional</MenuItem>
          </TextField>
        ) : (
          <TextField
            select
            label="Application Stage"
            fullWidth
            value={formData.application_stage}
            onChange={handleChange('application_stage')}
            helperText="Select when this payment should be made during admission"
          >
            <MenuItem value="pre-application">Pre-Application</MenuItem>
            <MenuItem value="post-application">Post-Application</MenuItem>
          </TextField>
        )}

        {/* Bank + Account Number */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Bank"
              fullWidth
              value={formData.bank}
              onChange={handleChange('bank')}
              error={!!errors.bank}
              helperText={errors.bank || ''}
              disabled={banksLoading}
            >
              {banksLoading ? (
                <MenuItem disabled>Loading banks...</MenuItem>
              ) : (
                banks.map((bank, i) => (
                  <MenuItem key={i} value={`${bank.bank_code}, ${bank.bank_name}`}>
                    {' '}
                    {bank.bank_name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Account Number"
              fullWidth
              value={formData.account_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData((prev) => ({ ...prev, account_number: value }));
                if (errors.account_number) setErrors((prev) => ({ ...prev, account_number: '' }));
              }}
              // onBlur={handleValidateAccount}
              error={!!errors.account_number}
              // helperText={errors.account_number || 'Account name will auto-fill on blur'}
              inputProps={{ maxLength: 10, inputMode: 'numeric' }}
            />
          </Grid>
        </Grid>

        {/* Account Name (auto-filled) */}
        {/* <Box sx={{ position: 'relative' }}>
          <TextField
            label="Account Name"
            fullWidth
            value={formData.account_name}
            error={!!errors.account_name}
            helperText={errors.account_name || 'Auto-filled after account validation'}
            InputProps={{
              readOnly: true,
              endAdornment: validating ? <CircularProgress size={18} /> : null,
            }}
          />
        </Box> */}

        {/* Fee Bearer + Modules + Status */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              label="Gateway Charges Bearer"
              fullWidth
              value={formData.fee_bearer}
              onChange={handleChange('fee_bearer')}
              helperText="Who pays the gateway charges"
            >
              <MenuItem value="client">Parent</MenuItem>
              <MenuItem value="merchant">School</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={handleChange('status')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button variant="contained" size="small" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit} disabled={loading} sx={{ fontWeight: 600 }}>
            {loading ? 'Saving...' : `${paymentName ? 'Update' : 'Add'} Payment Name`}
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
