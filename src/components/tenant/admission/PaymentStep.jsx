import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { initiateAdmissionPayment } from '@/api/tenant/admission/admissionApi';
import { makePayment } from '@/utils/paymentGateway';
import { useNotification } from '@/hooks/useNotification';

const PaymentStep = ({ onNext, onBack, isLoading = false, selectedBatch, admissionId }) => {
  const notify = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const applicationFee = Number(selectedBatch?.application_fee || 0);
  const acceptanceFee = Number(selectedBatch?.acceptance_fee || 0);

  const feeItems = [];
  if (applicationFee > 0) feeItems.push({ label: 'Application Fee', amount: applicationFee });
  if (acceptanceFee > 0) feeItems.push({ label: 'Acceptance Fee', amount: acceptanceFee });

  const totalPayable = feeItems.reduce((sum, f) => sum + f.amount, 0);

  useEffect(() => {
    const handler = () => {
      notify.success('Payment successful!');
      onNext();
    };
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
  }, [onNext, notify]);

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
          fee_type: f.label.toLowerCase().replace(' ', '_'),
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
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Admission Payment Breakdown
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        {feeItems.map((fee, i) => (
          <Box
            key={fee.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2.5,
              py: 1.5,
              borderBottom: i < feeItems.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {fee.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ₦{fee.amount.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ borderRadius: 2, px: 2.5, py: 2, bgcolor: '#FAFAFA' }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight={700} color="error.main">
            Total Payable
          </Typography>
          <Typography variant="h6" fontWeight={800} color="error.main">
            ₦ {totalPayable.toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={handlePayNow}
          disabled={isLoading || processing || totalPayable <= 0}
          sx={{
            bgcolor: '#8B0000',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            py: 1.5,
            maxWidth: 480,
            '&:hover': { bgcolor: '#6B0000' },
          }}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="small"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={isLoading || processing}
        >
          Back
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Payment</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              You are about to make an admission payment for:
            </Typography>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Admission Batch
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {selectedBatch?.batch_name || 'N/A'}
              </Typography>
            </Box>
            {feeItems.map((fee) => (
              <Box key={fee.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {fee.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₦{fee.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                ₦{totalPayable.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmPayment}
            sx={{ fontWeight: 600 }}
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
};

export default PaymentStep;
