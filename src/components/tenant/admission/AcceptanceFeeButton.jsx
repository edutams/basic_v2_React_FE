import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

import { initiateAdmissionPayment } from '@/api/tenant/admission/admissionApi';
import { makePayment } from '@/utils/paymentGateway';
import { useNotification } from '@/hooks/useNotification';

/**
 * "Pay Acceptance Fee" button for an admitted ward's card — the
 * post-application-fee counterpart of the pre-application payment flow in
 * PaymentStep.jsx, reusing the exact same initiate → gateway → confirm →
 * `paymentCompleted` event round trip, just scoped to stage:
 * 'post-application' and triggered from the ward card instead of the
 * application wizard. On success, calls `onPaid()` so the card can switch
 * straight to its "Accept Admission Offer" button without a full reload.
 */
const AcceptanceFeeButton = ({ admission, feeItems, onPaid }) => {
  const notify = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const totalPayable = feeItems.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const handleConfirmPayment = async () => {
    setConfirmOpen(false);
    setProcessing(true);

    const handlePaid = () => {
      notify.success('Acceptance fee payment successful!');
      onPaid?.();
    };
    window.addEventListener('paymentCompleted', handlePaid, { once: true });

    try {
      const payload = {
        admission_id: admission.id,
        stage: 'post-application',
        fee_items: feeItems.map((f) => ({
          bursary_schedule_id: f.bursary_schedule_id,
          amount: f.amount,
        })),
      };

      const res = await initiateAdmissionPayment(payload);

      if (res?.success) {
        const { data: paymentData, xpress: hash, gateway_code: gatewayCode, pub_key: pubKey } = res;
        const data = paymentData.map((item) => ({ ...item, gateway_code: gatewayCode, pub_key: pubKey, hash }));
        makePayment(data, hash);
      } else {
        window.removeEventListener('paymentCompleted', handlePaid);
        notify.error(res?.message || 'Payment initiation failed');
      }
    } catch (err) {
      window.removeEventListener('paymentCompleted', handlePaid);
      notify.error(err?.response?.data?.message || 'Payment initiation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        fullWidth
        startIcon={<WalletIcon sx={{ fontSize: '16px !important' }} />}
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        disabled={processing}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#EF9146', '&:hover': { bgcolor: '#d97f3a' } }}
      >
        {processing ? 'Processing...' : `Pay Acceptance Fee · ₦${totalPayable.toLocaleString()}`}
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={(e) => {
          e?.stopPropagation?.();
          setConfirmOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Acceptance Fee Payment</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to pay the acceptance fee to confirm this admission offer:
            </Typography>
            {feeItems.map((fee) => (
              <Box key={fee.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {fee.name}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ₦{Number(fee.amount || 0).toLocaleString()}
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
                bgcolor: '#EF914610',
              }}
            >
              <Typography variant="body1" fontWeight={700} sx={{ color: '#EF9146' }}>
                You will pay
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#EF9146', lineHeight: 1 }}>
                ₦{totalPayable.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(false);
            }}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmPayment();
            }}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AcceptanceFeeButton.propTypes = {
  admission: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }).isRequired,
  feeItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      bursary_schedule_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onPaid: PropTypes.func,
};

export default AcceptanceFeeButton;
