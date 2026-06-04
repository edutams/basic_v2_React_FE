import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const PaymentScheduleModal = ({ open, onClose, onSave, payment, isEdit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    installmentNumber: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payment && isEdit) {
      setFormData({
        amount: payment.amount || '',
        dueDate: payment.dueDate || '',
        installmentNumber: payment.installmentNumber || '',
        description: payment.description || '',
      });
    } else {
      setFormData({
        amount: '',
        dueDate: '',
        installmentNumber: '1',
        description: '',
      });
    }
    setErrors({});
  }, [payment, isEdit, open]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    // Only allow numbers for amount
    if (field === 'amount') {
      value = value.replace(/\D/g, '');
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.installmentNumber.trim()) {
      newErrors.installmentNumber = 'Installment number is required';
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
      subtitle="Configure payment schedule details for this class"
      size="medium"
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
              ? 'Update the payment schedule details below. Changes will affect all students in this class.'
              : 'Set the payment amount and due date for this class. You can configure multiple installments if needed.'}
          </Typography>
        </Box>

        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Amount (NGN)"
                fullWidth
                value={formData.amount}
                onChange={handleChange('amount')}
                error={!!errors.amount}
                helperText={errors.amount}
                placeholder="e.g., 10000"
                required
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={formData.dueDate}
                onChange={handleChange('dueDate')}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Installment Number"
                fullWidth
                value={formData.installmentNumber}
                onChange={handleChange('installmentNumber')}
                error={!!errors.installmentNumber}
                helperText={errors.installmentNumber || 'Which installment is this payment for'}
                required
              >
                <MenuItem value="1">1st Installment</MenuItem>
                <MenuItem value="2">2nd Installment</MenuItem>
                <MenuItem value="3">3rd Installment</MenuItem>
                <MenuItem value="4">4th Installment</MenuItem>
                <MenuItem value="full">Full Payment</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Description (Optional)"
                fullWidth
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="e.g., First term payment"
                multiline
                rows={1}
              />
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
            {isEdit ? 'Update' : 'Add'} Payment
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
