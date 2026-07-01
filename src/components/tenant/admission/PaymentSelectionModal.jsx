import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  Box,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { fetchPaymentNames } from '@/api/tenant/bursary/paymentNameApi';

const PaymentSelectionModal = ({ open, onClose, onSave, applicationType, selectedPayments = [] }) => {
  const [paymentNames, setPaymentNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  
  // Use ref to get the latest selectedPayments
  const selectedPaymentsRef = useRef(selectedPayments);
  
  useEffect(() => {
    selectedPaymentsRef.current = selectedPayments;
  }, [selectedPayments]);

  useEffect(() => {
    if (open) {
      loadPaymentNames();
      
      // Initialize selections from existing selectedPayments or reset
      const currentSelectedPayments = selectedPaymentsRef.current;
      if (currentSelectedPayments.length > 0) {
        const initialSelections = {};
        currentSelectedPayments.forEach((payment) => {
          initialSelections[payment.id] = {
            checked: true,
            amount: payment.amount || 0,
          };
        });
        setSelections(initialSelections);
      } else {
        setSelections({});
      }
      
      setErrors({});
    } else {
      // Reset when modal closes
      setSelections({});
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, applicationType]);

  const loadPaymentNames = async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentNames({
        pay_type: 'admission',
        application_stage: applicationType,
        per_page: 100,
      });
      setPaymentNames(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load payment names', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (paymentId) => {
    setSelections((prev) => {
      const isCurrentlyChecked = prev[paymentId]?.checked;
      return {
        ...prev,
        [paymentId]: {
          checked: !isCurrentlyChecked,
          amount: isCurrentlyChecked ? 0 : prev[paymentId]?.amount || 0, // Clear amount when unchecking
        },
      };
    });
  };

  const handleClose = () => {
    // Reset selections and errors when closing without saving
    setSelections({});
    setErrors({});
    onClose();
  };

  const handleAmountChange = (paymentId, value) => {
    const numValue = parseFloat(value) || 0;
    setSelections((prev) => ({
      ...prev,
      [paymentId]: {
        ...prev[paymentId],
        amount: numValue,
      },
    }));
    
    // Clear error when user starts typing
    if (errors[paymentId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[paymentId];
        return newErrors;
      });
    }
  };

  const validateSelections = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(selections).forEach((paymentId) => {
      if (selections[paymentId]?.checked) {
        const amount = selections[paymentId]?.amount || 0;
        if (amount <= 0) {
          newErrors[paymentId] = 'Amount is required and must be greater than 0';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateSelections()) {
      return;
    }

    const selected = paymentNames
      .filter((payment) => selections[payment.id]?.checked)
      .map((payment) => ({
        id: payment.id,
        name: payment.name,
        amount: selections[payment.id]?.amount || 0,
        bank_name: payment.bank_name,
        account_number: payment.account_number,
        rev_code: payment.rev_code,
      }));

    onSave(selected);
    setSelections({});
    setErrors({});
    onClose();
  };

  const totalAmount = Object.keys(selections)
    .filter((key) => selections[key]?.checked)
    .reduce((sum, key) => sum + (selections[key]?.amount || 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Select {applicationType === 'pre-application' ? 'Pre-Application' : 'Post-Application'}{' '}
            Payments
          </Typography>
          <IconButton onClick={onClose} size="small">
            <IconX size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : paymentNames.length === 0 ? (
          <Alert severity="info">
            No payment names found for {applicationType}. Please create payment names first.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {paymentNames.map((payment) => (
              <Box
                key={payment.id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: selections[payment.id]?.checked ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selections[payment.id]?.checked ? 'primary.50' : 'background.paper',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Checkbox
                    checked={selections[payment.id]?.checked || false}
                    onChange={() => handleCheckboxChange(payment.id)}
                  />
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {payment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.bank_name} - {payment.account_number}
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="0"
                    value={selections[payment.id]?.amount || ''}
                    onChange={(e) => handleAmountChange(payment.id, e.target.value)}
                    disabled={!selections[payment.id]?.checked}
                    error={Boolean(errors[payment.id])}
                    helperText={errors[payment.id]}
                    sx={{ width: 200 }}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                      },
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
              </Box>
            ))}
            <Divider />
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <Typography variant="h6" fontWeight={700}>
                Total Amount:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                ₦{totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={loading || Object.keys(selections).filter((key) => selections[key]?.checked).length === 0}
          sx={{ fontWeight: 600 }}
        >
          Add Selected Payments
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PaymentSelectionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  applicationType: PropTypes.oneOf(['pre-application', 'post-application']).isRequired,
  selectedPayments: PropTypes.array,
};

export default PaymentSelectionModal;
