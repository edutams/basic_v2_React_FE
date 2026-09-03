import React, { useState, useEffect, useContext } from 'react';
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
  Stack,
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
import { TenantAuthContext } from 'src/context/TenantContext/auth';

const SubscriptionPaymentModal = ({ open, onClose, selectedRow, subscriptionCharges, onPaymentSuccess }) => {
  const notify = useNotification();
  const { tenantInfo } = useContext(TenantAuthContext);

  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transaction data when modal opens
  useEffect(() => {
    if (open && selectedRow?.id) {
      fetchTransactionData();
    } else {
      // Reset state when modal closes
      setPaymentData(null);
      setError(null);
    }
  }, [open, selectedRow?.id]);

  const fetchTransactionData = async () => {
    setFetchingData(true);
    setError(null);
    try {
      const res = await subscriptionApi.getTransactionData(selectedRow.id);
      if (res?.data) {
        setPaymentData(res.data);
      }
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      setError(err.response?.data?.message || 'Failed to fetch payment details');
    } finally {
      setFetchingData(false);
    }
  };

  const handleConfirmPay = async () => {
    if (!selectedRow?.id) {
      notify.error('No subscription selected');
      return;
    }

    setLoading(true);
    try {
      const res = await subscriptionApi.createTransaction({
        subscription_id: selectedRow.id,
      });

      if (res?.success === false) {
        notify.error(res?.message || 'Payment initiation failed');
        setLoading(false);
        return;
      }

      if (res?.data) {
        notify.success('Payment initiated successfully!');

        // Trigger Payment Gateway Directly === (same as PayInvoice.jsx)
        const paymentData = res.data;
        const hash = res.xpress;
        const gatewayCode = res.gateway_code;
        const pubKey = res.pub_key;
        const revenueCode = res.revenue_code;

        const data = paymentData.map
          ? paymentData.map((item) => ({
              ...item,
              gateway_code: gatewayCode,
              pub_key: pubKey,
              hash: hash,
              paymentname: {
                name: 'Subscription',
                rev_code: revenueCode,
              },
            }))
          : [
              {
                ...paymentData,
                gateway_code: gatewayCode,
                pub_key: pubKey,
                hash: hash,
                instValue: paymentData.amount,
                paymentname: {
                  name: 'Subscription',
                  rev_code: revenueCode,
                },
              },
            ];

        makePayment(data, hash);
        onClose();
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      notify.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString();
  };

  const amount = paymentData?.amount || parseFloat(selectedRow?.amount) || 0;
  const discountPercent = paymentData?.discount_percent || parseFloat(selectedRow?.discount) || 0;
  const discountAmount = paymentData?.discount_amount || (amount * discountPercent) / 100;
  const amountAfterDiscount = paymentData?.amount_after_discount || amount - discountAmount;
  const charges = paymentData?.charges || parseFloat(subscriptionCharges) || 0;
  const totalPaid = paymentData?.total_paid || 0;
  const balanceDue = paymentData?.balance_due || amountAfterDiscount + charges - totalPaid;

  if (!selectedRow) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 700,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Confirm Subscription Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedRow.sessions?.session_name} / {selectedRow.terms?.term_name}
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
        ) : (
          <>
            {/* Plan Info */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Plan:</strong> {selectedRow.my_plans?.display_name}
            </Typography>

            {/* Payment Breakdown Table */}
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Amount (₦)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Subscription Amount</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₦{formatAmount(amount)}</TableCell>
                  </TableRow>

                  {discountPercent > 0 && (
                    <TableRow>
                      <TableCell>Discount ({discountPercent}%)</TableCell>
                      <TableCell sx={{ textAlign: 'right', color: 'success.main' }}>
                        -₦{formatAmount(discountAmount)}
                      </TableCell>
                    </TableRow>
                  )}

                  {discountPercent > 0 && (
                    <TableRow>
                      <TableCell>Amount After Discount</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>₦{formatAmount(amountAfterDiscount)}</TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell>Gateway/Subscription Charges</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₦{formatAmount(charges)}</TableCell>
                  </TableRow>

                  {totalPaid > 0 && (
                    <TableRow>
                      <TableCell sx={{ color: 'success.main' }}>Already Paid</TableCell>
                      <TableCell sx={{ textAlign: 'right', color: 'success.main' }}>
                        -₦{formatAmount(totalPaid)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Amount Due</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: '#1a237e' }}>
                      ₦{formatAmount(balanceDue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          color="inherit"
          onClick={onClose}
          disabled={loading || fetchingData}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleConfirmPay}
          disabled={loading || fetchingData || balanceDue <= 0}
          sx={{ fontWeight: 600 }}
        >
          {loading ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : null}
          {loading ? 'Processing...' : `Confirm & Pay ₦${formatAmount(balanceDue)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SubscriptionPaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  subscriptionCharges: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPaymentSuccess: PropTypes.func,
};

export default SubscriptionPaymentModal;
