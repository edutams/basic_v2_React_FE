import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import useNotification from '@/hooks/useNotification';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import { makePayment } from '@/utils/paymentGateway';

/**
 * Pays for every pending term in a per_session subscription group with a
 * single gateway transaction — the bulk counterpart to
 * SubscriptionPaymentModal, which pays one subscription row at a time.
 */
const SubscriptionBulkPaymentModal = ({ open, onClose, sessionId, sessionName, onPaymentSuccess }) => {
  const notify = useNotification();

  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && sessionId) {
      fetchBreakdown();
    } else {
      setBreakdown(null);
      setError(null);
    }
  }, [open, sessionId]);

  const fetchBreakdown = async () => {
    setFetchingData(true);
    setError(null);
    try {
      const res = await subscriptionApi.getBulkTransactionData(sessionId);
      setBreakdown(res?.data || null);
    } catch (err) {
      console.error('Error fetching bulk transaction data:', err);
      setError(err.response?.data?.message || 'Failed to fetch payment details');
    } finally {
      setFetchingData(false);
    }
  };

  const handleConfirmPay = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const res = await subscriptionApi.createBulkTransaction({ session_id: sessionId });

      if (res?.success === false) {
        notify.error(res?.message || 'Payment initiation failed');
        setLoading(false);
        return;
      }

      if (res?.data) {
        notify.success('Payment initiated successfully!');

        const paymentData = res.data;
        const hash = res.xpress;
        const gatewayCode = res.gateway_code;
        const pubKey = res.pub_key;
        const revenueCode = res.revenue_code;

        const data = [
          {
            ...paymentData,
            gateway_code: gatewayCode,
            pub_key: pubKey,
            hash,
            instValue: paymentData.amount,
            paymentname: {
              name: `Subscription - ${sessionName || 'Full Session'}`,
              rev_code: revenueCode,
            },
          },
        ];

        makePayment(data, hash);
        onClose();
        onPaymentSuccess?.();
      }
    } catch (err) {
      console.error('Error creating bulk transaction:', err);
      notify.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => parseFloat(amount || 0).toLocaleString();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEnforceFocus disableAutoFocus>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Confirm Full Session Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {sessionName || breakdown?.session_name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {fetchingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !breakdown || breakdown.terms?.length === 0 ? (
          <Alert severity="info">No pending terms found for this session.</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This pays for every term below in one transaction — nothing more to pay for this
              session once it's confirmed.
            </Typography>

            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Term</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Amount (₦)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breakdown.terms.map((term) => (
                    <TableRow key={term.subscription_id}>
                      <TableCell>{term.term_name}</TableCell>
                      <TableCell>{term.plan_name}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        ₦{formatAmount(term.amount_after_discount)}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell colSpan={2}>Gateway/Subscription Charges</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₦{formatAmount(breakdown.charges)}</TableCell>
                  </TableRow>

                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      Total Amount Due
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: '#1a237e' }}>
                      ₦{formatAmount(breakdown.amount_due)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="contained" size="small" color="inherit" onClick={onClose} disabled={loading || fetchingData}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleConfirmPay}
          disabled={loading || fetchingData || !breakdown?.amount_due}
          sx={{ fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          {loading ? 'Processing...' : `Confirm & Pay ₦${formatAmount(breakdown?.amount_due)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SubscriptionBulkPaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sessionName: PropTypes.string,
  onPaymentSuccess: PropTypes.func,
};

export default SubscriptionBulkPaymentModal;
