import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const PaymentScheduleModal = ({ open, onClose, onSave, payment, isEdit }) => {
  const [formData, setFormData] = useState({
    amount: '',
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
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
          slotProps={{
            input: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
          }}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
            Save
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
};

export default PaymentScheduleModal;
