import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IconX, IconCheck, IconUsers, IconShieldCheck, IconCircleCheck } from '@tabler/icons';
import tenantApi from '@/api/tenant/tenant_api';

const validationSchema = Yup.object({
  name: Yup.string().required('Vendor name is required'),
  description: Yup.string(),
  bankCode: Yup.string(),
  accountNumber: Yup.string(),
  accountName: Yup.string(),
});

const initialValues = {
  name: '',
  description: '',
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  accountVerified: false,
};

const AddVendorModal = ({ open, onClose, onSubmit, mode = 'create', vendor = null, submitting = false }) => {
  const theme = useTheme();
  const isEdit = mode === 'edit' && vendor;

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        name: values.name,
        description: values.description,
        bank_name: values.bankName,
        bank_code: values.bankCode,
        account_number: values.accountNumber,
        account_name: values.accountName,
        account_verified: values.accountVerified,
      });
    },
  });

  useEffect(() => {
    if (open && banks.length === 0) {
      setBanksLoading(true);
      tenantApi
        .get('/vendor_manager/fetch_banks')
        .then((res) => setBanks(res.data?.data?.result || []))
        .catch(() => setBanks([]))
        .finally(() => setBanksLoading(false));
    }
  }, [open, banks.length]);

  useEffect(() => {
    if (open) {
      setResolveError('');
      formik.resetForm({
        values: isEdit
          ? {
              name: vendor.name || '',
              description: vendor.description || '',
              bankCode: vendor.bank_code || '',
              bankName: vendor.bank_name || '',
              accountNumber: vendor.account_number || '',
              accountName: vendor.account_name || '',
              accountVerified: Boolean(vendor.account_verified_at),
            }
          : initialValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, vendor]);

  const handleValidateAccount = () => {
    setResolveError('');
    setResolving(true);
    tenantApi
      .post('/vendor_manager/resolve_account', {
        account_number: formik.values.accountNumber,
        bank_code: formik.values.bankCode,
        bank_name: formik.values.bankName,
      })
      .then((res) => {
        formik.setFieldValue('accountName', res.data?.data?.account_name || '');
        formik.setFieldValue('accountVerified', true);
      })
      .catch((err) => {
        formik.setFieldValue('accountVerified', false);
        setResolveError(
          err.response?.data?.message ||
            'Could not verify this account number. Please confirm it is correct and try again.',
        );
      })
      .finally(() => setResolving(false));
  };

  const canValidate = Boolean(formik.values.bankCode) && Boolean(formik.values.accountNumber) && !resolving;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUsers size={22} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                {isEdit ? 'Edit Vendor' : 'Add Vendor'}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
                {isEdit
                  ? 'Update this supplier or service provider record.'
                  : 'Add a new supplier or service provider record.'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>
                Vendor Name <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Alpha Books Ltd"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>Description</Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="e.g., Our mango supplier for the canteen"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={12}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, color: 'text.secondary' }}>
                BANK DETAILS (optional — used for payments once enabled)
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>Bank</Typography>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  name="bankCode"
                  value={formik.values.bankCode}
                  onChange={(e) => {
                    const bank = banks.find((b) => b.bank_code === e.target.value);
                    formik.setFieldValue('bankCode', e.target.value);
                    formik.setFieldValue('bankName', bank?.bank_name || '');
                    formik.setFieldValue('accountVerified', false);
                  }}
                >
                  <MenuItem value="" disabled>
                    {banksLoading ? 'Loading banks...' : 'Select bank'}
                  </MenuItem>
                  {banks.map((bank) => (
                    <MenuItem key={bank.bank_code} value={bank.bank_code}>
                      {bank.bank_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>Account Number</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., 0123456789"
                name="accountNumber"
                value={formik.values.accountNumber}
                onChange={(e) => {
                  formik.handleChange(e);
                  formik.setFieldValue('accountVerified', false);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={handleValidateAccount}
                        disabled={!canValidate}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, minWidth: 0 }}
                      >
                        {resolving ? <CircularProgress size={14} /> : 'Validate'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={12}>
              <Typography sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}>Account Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Filled in automatically after validating the account number"
                name="accountName"
                value={formik.values.accountName}
                onChange={formik.handleChange}
                InputProps={{
                  endAdornment: formik.values.accountVerified && (
                    <InputAdornment position="end">
                      <IconShieldCheck size={16} color={theme.palette.success.main} />
                    </InputAdornment>
                  ),
                }}
              />
              {formik.values.accountVerified && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <IconCircleCheck size={13} color={theme.palette.success.main} />
                  <Typography sx={{ fontSize: 11.5, color: theme.palette.success.main }}>
                    Account verified
                  </Typography>
                </Box>
              )}
              {resolveError && (
                <Alert severity="error" sx={{ mt: 1, py: 0, fontSize: 12 }}>
                  {resolveError}
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={submitting}
            startIcon={<IconCheck size={18} />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            {isEdit ? 'Save Changes' : 'Save Vendor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddVendorModal;
