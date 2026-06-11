import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import { createPaymentSchedule, updatePaymentSchedule } from '@/api/tenant/bursary/bursarySettingsApi';

const PaymentScheduleModal = ({ open, onClose, onSave, payment, isEdit, sessionId, termId, categoryId }) => {
  const [formData, setFormData] = useState({
    amount: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment && isEdit) {
      setFormData({
        amount: payment.amount || '',
      });
    } else {
      setFormData({
        amount: '',
      });
    }
    setErrors({});
  }, [payment, isEdit, open]);

  const handleChange = (event) => {
    let value = event.target.value;

    value = value.replace(/\D/g, '');

    setFormData((prev) => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        setSaving(true);
        
        // Check if this is an edit (scheduleId exists) or create
        const isEdit = payment?.scheduleId;
        
        if (isEdit) {
          // Update existing schedule
          const payload = {
            amount: parseFloat(formData.amount),
          };

          console.log('Updating payment schedule:', payment.scheduleId, payload);

          const response = await updatePaymentSchedule(payment.scheduleId, payload);
          
          if (response.success || response.status) {
            // Pass the form data to parent to refresh the table
            onSave(formData);
            onClose();
          } else {
            setErrors({ submit: response.message || 'Failed to update payment' });
          }
        } else {
          // Create new schedule
          const payload = {
            bursary_payment_name_id: payment?.bursaryPaymentNameId,
            class_id: payment?.classId,
            session_id: sessionId,
            term_id: termId,
            bursary_payment_category_id: categoryId,
            amount: parseFloat(formData.amount),
          };

          console.log('Creating payment schedule:', payload);

          const response = await createPaymentSchedule(payload);
          
          if (response.success || response.status) {
            // Pass the form data to parent to refresh the table
            onSave(formData);
            onClose();
          } else {
            setErrors({ submit: response.message || 'Failed to save payment' });
          }
        }
      } catch (err) {
        console.error('Failed to save payment:', err);
        setErrors({ submit: err.response?.data?.message || 'Failed to save payment' });
      } finally {
        setSaving(false);
      }
    }
  };

  const modalTitle = isEdit
    ? `Edit Payment - ${payment?.className} (${payment?.paymentName})`
    : `Add Payment - ${payment?.className} (${payment?.paymentName})`;

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      subtitle="Enter the payment amount for this class"
      size="small"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            p: 2,
            bgcolor: isEdit ? 'warning.lighter' : 'info.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: isEdit ? 'warning.light' : 'info.light',
          }}
        >
          <Typography variant="caption" color={isEdit ? 'warning.main' : 'info.main'}>
            {isEdit ? '✏️ ' : '💡 '}
            <strong>{isEdit ? 'Edit Mode:' : 'Tip:'}</strong>{' '}
            {isEdit
              ? 'Update the payment amount for this class.'
              : 'Set the payment amount for this class.'}
          </Typography>
        </Box>

        <TextField
          label="Amount (NGN)"
          fullWidth
          value={formData.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={errors.amount}
          placeholder="e.g., 10000"
          required
          disabled={saving}
          slotProps={{
            input: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
          }}
        />

        {errors.submit && (
          <Alert severity="error">
            {errors.submit}
          </Alert>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            sx={{ fontWeight: 600 }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

PaymentScheduleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  payment: PropTypes.object,
  isEdit: PropTypes.bool,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  termId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PaymentScheduleModal;
