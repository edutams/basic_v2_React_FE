import { useRef, useMemo, useEffect, useState } from 'react';
import { Box, Grid, Typography, Chip, Divider, Button, CircularProgress } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';
import { format } from 'date-fns';
import { getAdmissionPaymentReceipt } from '@/api/tenant/admission/admissionApi';
import { useNotification } from '@/hooks/useNotification';

const buildReceiptHtml = (paymentData) => {
  const { receiptMeta, feeItems, totalPaid } = paymentData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; margin: 32px; }
    h2 { margin: 0 0 4px; font-size: 16px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .meta-label { font-size: 10px; color: #888; text-transform: uppercase; }
    .meta-value { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 11px; color: #888; padding: 4px 0; border-bottom: 1px solid #ddd; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 6px 0; border-bottom: 1px solid #eee; }
    .total-row td { font-weight: 700; border-top: 2px solid #ccc; border-bottom: none; padding-top: 10px; }
    .footer { margin-top: 16px; font-size: 11px; color: #aaa; text-align: center; }
    .status { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h2>Payment Receipt</h2>
  <p style="color:#555;margin:0 0 16px">Admission Application Payment Breakdown</p>
  <div class="meta-grid">
    ${receiptMeta.map(
      ({ label, value }) => `
      <div>
        <div class="meta-label">${label}</div>
        <div class="meta-value">${value}</div>
      </div>
    `,
    ).join('')}
    <div>
      <div class="meta-label">STATUS</div>
      <span class="status">Successful</span>
    </div>
  </div>
  <table>
    <thead><tr><th>DESCRIPTION</th><th>AMOUNT</th></tr></thead>
    <tbody>
      ${feeItems.map(({ label, amount }) => `<tr><td>${label}</td><td>₦${amount.toLocaleString()}</td></tr>`).join('')}
      <tr class="total-row"><td>Total Paid</td><td>₦${totalPaid.toLocaleString()}</td></tr>
    </tbody>
  </table>
  <p class="footer">Powered by Skoolpay · This is a computer generated receipt</p>
</body>
</html>`;
};

const triggerPrintViaIframe = (html) => {
  const existing = document.getElementById('__receipt_iframe__');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = '__receipt_iframe__';
  iframe.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  iframe.contentWindow.onafterprint = () => iframe.remove();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 300);
};

const PaymentReview = ({ 
  admissionId = null,
}) => {
  const receiptRef = useRef(null);
  const notify = useNotification();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch payment receipt data on mount
  useEffect(() => {
    const fetchReceipt = async () => {
      if (!admissionId) return;
      
      setLoading(true);
      try {
        const response = await getAdmissionPaymentReceipt(admissionId);
        if (response?.status && response?.data) {
          setPaymentData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment receipt:', error);
        notify.error('Failed to load payment receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionId]);

  // Build receipt data from fetched payment data
  const receiptData = useMemo(() => {
    if (!paymentData) {
      return null;
    }

    // Extract payment items
    const feeItems = (paymentData.payment_items || []).map(payment => ({
      label: payment.name,
      amount: Number(payment.amount || 0),
    }));

    const totalPaid = paymentData.total_paid || feeItems.reduce((sum, item) => sum + item.amount, 0);

    // Build receipt metadata
    const receiptMeta = [
      { 
        label: 'Order Id', 
        value: paymentData.bulk_order_id || 'N/A' 
      },
      { 
        label: 'DATE PAID', 
        value: paymentData.payment_date 
          ? format(new Date(paymentData.payment_date), 'dd MMM yyyy, hh:mm a')
          : 'Pending'
      },
      { 
        label: 'PAYER', 
        value: paymentData.payer_name || 'N/A'
      },
      { 
        label: 'METHOD', 
        value: paymentData.payment_method || 'Online Payment' 
      },
    ];

    return {
      receiptMeta,
      feeItems,
      totalPaid,
      status: paymentData.status || 'pending',
    };
  }, [paymentData]);

  if (loading) {
    return (
      <ReviewSection
        number={3}
        title="Payment Receipt"
        subtitle="Confirmation of admission application payment"
        id="section-payment"
      >
        <Box p={3} textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Loading payment receipt...
          </Typography>
        </Box>
      </ReviewSection>
    );
  }

  if (!receiptData) {
    return (
      <ReviewSection
        number={3}
        title="Payment Receipt"
        subtitle="Confirmation of admission application payment"
        id="section-payment"
      >
        <Box p={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            No payment information available
          </Typography>
        </Box>
      </ReviewSection>
    );
  }

  const { receiptMeta, feeItems, totalPaid, status } = receiptData;

  const handlePrint = () => triggerPrintViaIframe(buildReceiptHtml(receiptData));
  const handleDownload = () => triggerPrintViaIframe(buildReceiptHtml(receiptData));

  return (
    <ReviewSection
      number={3}
      title="Payment Receipt"
      subtitle="Confirmation of admission application payment"
      id="section-payment"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        p={2}
        sx={{ bgcolor: 'success.light' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={700}>
              Payment Receipt
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admission Application Payment Breakdown
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              fontSize: 11,
              color: 'success.dark',
              borderColor: 'success.main',
              ':hover': { bgcolor: 'success.main', color: '#fff' },
            }}
          >
            Print
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              fontSize: 11,
              color: 'success.dark',
              borderColor: 'success.main',
              ':hover': { bgcolor: 'success.main', color: '#fff' },
            }}
          >
            Download
          </Button>
        </Box>
      </Box>

      <Box ref={receiptRef} sx={{ p: 2, bgcolor: '#f2fcf7' }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {receiptMeta.map(({ label, value }) => (
            <Grid key={label} size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
            </Grid>
          ))}
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              STATUS
            </Typography>
            <Chip
              label={status === 'successful' ? 'Successful' : 'Pending'}
              size="small"
              sx={{ 
                bgcolor: status === 'successful' ? '#E8F5E9' : '#FFF9C4', 
                color: status === 'successful' ? 'success.dark' : 'warning.dark', 
                fontWeight: 600, 
                fontSize: 11 
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 1 }} />

        <Box display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            DESCRIPTION
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            AMOUNT
          </Typography>
        </Box>

        {feeItems.map(({ label, amount }) => (
          <Box
            key={label}
            display="flex"
            justifyContent="space-between"
            sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              ₦{amount.toLocaleString()}
            </Typography>
          </Box>
        ))}

        <Box display="flex" justifyContent="space-between" sx={{ pt: 1.5 }}>
          <Typography variant="body2" fontWeight={700}>
            Total Paid
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₦{totalPaid.toLocaleString()}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1.5}
          textAlign="center"
        >
          Powered by Skoolpay · This is a computer generated receipt
        </Typography>
      </Box>
    </ReviewSection>
  );
};

PaymentReview.propTypes = {
  admissionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PaymentReview;
