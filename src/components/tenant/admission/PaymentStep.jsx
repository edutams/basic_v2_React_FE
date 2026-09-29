import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

import {
  initiateAdmissionPayment,
  checkAdmissionPaymentStatus,
} from '@/api/tenant/admission/admissionApi';
import { makePayment } from '@/utils/paymentGateway';
import { useNotification } from '@/hooks/useNotification';

// Flat, bordered card shell — matches the card language used across the
// rest of the reworked admission flow instead of MUI's default elevation.
const cardSx = {
  borderRadius: '8px',
  border: '1px solid',
  borderColor: '#e2e8f0',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
};

const BackButton = (props) => (
  <Button
    variant="outlined"
    size="small"
    color="inherit"
    startIcon={<ArrowBackIcon />}
    sx={{ textTransform: 'none' }}
    {...props}
  >
    Back
  </Button>
);

// Loud, unmistakable "real money" total — big amount, colored border, wallet
// icon — instead of a plain h6 that reads no differently from any other row.
const TotalBox = ({ label, amount, color }) => (
  <Paper
    elevation={0}
    sx={{
      ...cardSx,
      borderColor: color,
      borderWidth: '1.5px',
      px: 2,
      py: 1.75,
      bgcolor: `${color}10`,
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5}>
      <Box display="flex" alignItems="center" gap={1}>
        <WalletIcon sx={{ color, fontSize: 22 }} />
        <Typography variant="body2" fontWeight={700} sx={{ color }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>
        ₦{amount.toLocaleString()}
      </Typography>
    </Box>
  </Paper>
);

const FeeBreakdown = ({ feeItems }) => (
  <Paper elevation={0} sx={{ ...cardSx, overflow: 'hidden', mb: 1.5 }}>
    {feeItems.map((fee, i) => (
      <Box
        key={fee.label}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          borderBottom: i < feeItems.length - 1 ? '1px solid' : 'none',
          borderColor: '#e2e8f0',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {fee.label}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          ₦{fee.amount.toLocaleString()}
        </Typography>
      </Box>
    ))}
  </Paper>
);

const PaymentStep = ({
  onNext,
  onBack,
  isLoading = false,
  selectedBatch,
  admissionId,
  intendingClassId,
}) => {
  const notify = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(true);

  // Use pre-application payments from the batch
  const preAppPayments = selectedBatch?.pre_application_payments || [];

  // A fee row with class_id === null applies to every class in the batch;
  // otherwise, only keep the row matching this applicant's own class.
  const applicableFees = preAppPayments.filter(
    (payment) => payment.class_id === null || Number(payment.class_id) === Number(intendingClassId),
  );
  const feeItems = applicableFees.map((payment) => ({
    label: payment.name,
    amount: Number(payment.amount || 0),
    bursary_schedule_id: payment.bursary_schedule_id,
  }));

  const totalPayable = feeItems.reduce((sum, f) => sum + f.amount, 0);

  // Check payment status on mount
  useEffect(() => {
    const checkPayment = async () => {
      if (!admissionId) {
        setCheckingPayment(false);
        return;
      }

      try {
        const response = await checkAdmissionPaymentStatus(admissionId);
        if (response?.status && response?.data) {
          setPaymentStatus(response.data);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      } finally {
        setCheckingPayment(false);
      }
    };

    checkPayment();
  }, [admissionId]);

  useEffect(() => {
    const handler = () => {
      notify.success('Payment successful!');
      onNext();
    };
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
  }, [onNext, notify]);

  const isPaymentDataLoading =
    !selectedBatch ||
    (selectedBatch.require_payment && selectedBatch.pre_application_payments === undefined) ||
    checkingPayment;

  if (isPaymentDataLoading) {
    return (
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }} mb={0.25}>
          Pre-Application Payment Breakdown
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Paper elevation={0} sx={{ ...cardSx, p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {checkingPayment ? 'Checking payment status...' : 'Loading payment details...'}
          </Typography>
        </Paper>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <BackButton onClick={onBack} />
        </Box>
      </Box>
    );
  }

  // If payment has already been made, show a continue button
  const hasAlreadyPaid = paymentStatus?.has_paid === true;

  if (hasAlreadyPaid) {
    return (
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }} mb={0.25}>
          Pre-Application Payment
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: '8px' }}>
          <Typography variant="body2" fontWeight={600}>
            Payment Already Completed
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You have already paid for this admission application. Click continue to proceed with
            your application.
          </Typography>
        </Alert>

        <FeeBreakdown feeItems={feeItems} />

        <TotalBox label="Total Paid" amount={totalPayable} color="#16a34a" />

        <Box
          display="flex"
          flexDirection={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
          sx={{ mt: 2 }}
        >
          <BackButton onClick={onBack} disabled={isLoading} sx={{ width: { xs: '100%', sm: 'auto' } }} />
          <Button
            variant="contained"
            size="small"
            onClick={onNext}
            disabled={isLoading}
            sx={{ fontWeight: 700, textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    );
  }

  const handlePayNow = async () => {
    if (totalPayable <= 0) {
      notify.error('No fees to pay');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    setConfirmOpen(false);
    setProcessing(true);

    try {
      const payload = {
        admission_id: admissionId,
        fee_items: feeItems.map((f) => ({
          bursary_schedule_id: f.bursary_schedule_id,
          amount: f.amount,
        })),
      };

      const res = await initiateAdmissionPayment(payload);

      if (res?.success) {
        notify.success('Payment initiated successfully!');

        const paymentData = res?.data;
        const hash = res.xpress;
        const gatewayCode = res.gateway_code;
        const pubKey = res.pub_key;

        const data = paymentData.map((item) => ({
          ...item,
          gateway_code: gatewayCode,
          pub_key: pubKey,
          hash,
        }));

        makePayment(data, hash);
      } else {
        notify.error(res?.message || 'Payment initiation failed');
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Payment initiation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }} mb={0.25}>
        Pre-Application Payment Breakdown
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <FeeBreakdown feeItems={feeItems} />

      <TotalBox label="Total Payable" amount={totalPayable} color="#dc2626" />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handlePayNow}
          disabled={isLoading || processing || totalPayable <= 0}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1.05rem',
            py: 1.5,
            maxWidth: 480,
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
          }}
        >
          {processing ? 'Processing...' : `Pay ₦${totalPayable.toLocaleString()} Now`}
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <BackButton onClick={onBack} disabled={isLoading || processing} />
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Payment</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to make an admission payment for:
            </Typography>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: '8px', p: 1.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Admission Batch
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>
                {selectedBatch?.batch_name || 'N/A'}
              </Typography>
            </Box>
            {feeItems.map((fee) => (
              <Box key={fee.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {fee.label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ₦{fee.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.25,
                borderRadius: '8px',
                bgcolor: '#dc262610',
              }}
            >
              <Typography variant="body1" fontWeight={700} sx={{ color: '#dc2626' }}>
                You will pay
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#dc2626', lineHeight: 1 }}>
                ₦{totalPayable.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmPayment}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

PaymentStep.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  selectedBatch: PropTypes.object,
  admissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  intendingClassId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PaymentStep;
