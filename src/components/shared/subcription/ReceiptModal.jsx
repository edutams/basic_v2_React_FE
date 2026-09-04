import React, { useState } from 'react';
import { Box, Typography, Button, Divider, Chip, Stack, CircularProgress } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import useNotification from '@/hooks/useNotification';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';

/**
 * The actual receipt is generated server-side (Dompdf, real tenant/
 * transaction data — see SubscriptionController::exportReceiptPdf()), so
 * this is just a lightweight preview + action dialog, not a duplicate
 * rendering of the receipt itself. It used to render its own full receipt
 * layout client-side with hardcoded placeholder data ("EduTAMS", a fixed
 * Tai Solarin school name, camelCase fields the real transaction object
 * never had) — none of that reflected what was actually being viewed.
 */
const ReceiptModal = ({ open, onClose, transaction }) => {
  const notify = useNotification();
  // Separate loading flags per button — sharing one made it look like both
  // had been clicked together, since neither showed which action was
  // actually the one in flight.
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const pdfLoading = downloadLoading || printLoading;

  const transId = transaction?.transaction_id;
  const isApproved = transaction?.status === 'approved';

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      await subscriptionApi.downloadReceiptPdf(transId);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to download receipt');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      await subscriptionApi.printReceiptPdf(transId);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to open receipt');
    } finally {
      setPrintLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <ReusableModal open={open} onClose={onClose} title="Payment Receipt" size="small">
      <Box sx={{ p: 2 }}>
        {!isApproved ? (
          <Typography color="text.secondary">
            A receipt is only available once a transaction is approved — this one is currently
            "{transaction.status}".
          </Typography>
        ) : (
          <>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Transaction Ref.
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {transId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {transaction.payment_description}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Amount Paid
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  ₦{parseFloat(transaction.amount || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip label="APPROVED" color="success" size="small" />
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Download or print the full receipt — it's generated fresh from your school's real
              details each time.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={downloadLoading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                onClick={handleDownload}
                disabled={pdfLoading}
                sx={{ borderRadius: '8px' }}
              >
                {downloadLoading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={printLoading ? <CircularProgress size={14} color="inherit" /> : <PrintIcon />}
                onClick={handlePrint}
                disabled={pdfLoading}
                sx={{ borderRadius: '8px', bgcolor: '#1a237e' }}
              >
                {printLoading ? 'Opening...' : 'Print Receipt'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </ReusableModal>
  );
};

ReceiptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transaction: PropTypes.object,
};

export default ReceiptModal;
