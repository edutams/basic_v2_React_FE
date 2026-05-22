import { useRef } from 'react';
import { Box, Grid, Typography, Chip, Divider, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';

const FEE_ITEMS = [
  { label: 'Application Form Fee',     amount: '₦15,000' },
  { label: 'Registration Fee',         amount: '₦500'    },
  { label: 'Processing Fee',           amount: '₦5,000'  },
  { label: 'Entrance Examination Fee', amount: '₦1,000'  },
  { label: 'Administrative Charges',   amount: '₦1,000'  },
  { label: 'ICT/Portal Access Fee',    amount: '₦2,000'  },
  { label: 'Bank Charge',              amount: '₦500'    },
];

const RECEIPT_META = [
  { label: 'RECEIPT NO', value: 'SKRC-2025-00491'            },
  { label: 'DATE PAID',  value: '04 May 2025, 11:24 AM'      },
  { label: 'REFERENCE',  value: 'TRX-29273645'               },
  { label: 'PAYER',      value: 'Mrs. Adetola Ademola'       },
  { label: 'METHOD',     value: 'Bank Transfer - Globus Bank' },
];

// Builds a self-contained HTML string of just the receipt
const buildReceiptHtml = (totalPaid) => `
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
    ${RECEIPT_META.map(({ label, value }) => `
      <div>
        <div class="meta-label">${label}</div>
        <div class="meta-value">${value}</div>
      </div>
    `).join('')}
    <div>
      <div class="meta-label">STATUS</div>
      <span class="status">Successful</span>
    </div>
  </div>
  <table>
    <thead><tr><th>DESCRIPTION</th><th>AMOUNT</th></tr></thead>
    <tbody>
      ${FEE_ITEMS.map(({ label, amount }) => `<tr><td>${label}</td><td>${amount}</td></tr>`).join('')}
      <tr class="total-row"><td>Total Paid</td><td>${totalPaid}</td></tr>
    </tbody>
  </table>
  <p class="footer">Powered by Skoolpay · This is a computer generated receipt</p>
</body>
</html>`;

const triggerPrintViaIframe = (html) => {
  const existing = document.getElementById('__receipt_iframe__');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = '__receipt_iframe__';
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
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

const PaymentReview = ({ totalPaid = '₦25,500' }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => triggerPrintViaIframe(buildReceiptHtml(totalPaid));
  const handleDownload = () => triggerPrintViaIframe(buildReceiptHtml(totalPaid));

  return (
    <ReviewSection
      number={3}
      title="Payment Receipt"
      subtitle="Confirmation of admission application payment"
      id="section-payment"
    >
      {/* Receipt header bar */}
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
            <Typography variant="body2" fontWeight={700}>Payment Receipt</Typography>
            <Typography variant="caption" color="text.secondary">
              Admission Application Payment Breakdown
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            size="small"
            startIcon={<PrintIcon />}
            variant="outlined"
            onClick={handlePrint}
            sx={{ fontSize: 11, color: 'success.dark', borderColor: 'success.main', ':hover': { bgcolor: 'success.main', color: '#fff' } }}
          >
            Print
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleDownload}
            sx={{ fontSize: 11, color: 'success.dark', borderColor: 'success.main', ':hover': { bgcolor: 'success.main', color: '#fff' } }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Receipt body */}
      <Box ref={receiptRef} sx={{ p: 2, bgcolor: '#f2fcf7' }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {RECEIPT_META.map(({ label, value }) => (
            <Grid key={label} size={{ xs: 6, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
              <Typography variant="body2" fontWeight={600}>{value}</Typography>
            </Grid>
          ))}
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" color="text.secondary" display="block">STATUS</Typography>
            <Chip
              label="Successful"
              size="small"
              sx={{ bgcolor: '#E8F5E9', color: 'success.dark', fontWeight: 600, fontSize: 11 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 1 }} />

        <Box display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>DESCRIPTION</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>AMOUNT</Typography>
        </Box>

        {FEE_ITEMS.map(({ label, amount }) => (
          <Box
            key={label}
            display="flex"
            justifyContent="space-between"
            sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{amount}</Typography>
          </Box>
        ))}

        <Box display="flex" justifyContent="space-between" sx={{ pt: 1.5 }}>
          <Typography variant="body2" fontWeight={700}>Total Paid</Typography>
          <Typography variant="body2" fontWeight={700}>{totalPaid}</Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mt={1.5} textAlign="center">
          Powered by Skoolpay · This is a computer generated receipt
        </Typography>
      </Box>
    </ReviewSection>
  );
};

PaymentReview.propTypes = {
  totalPaid: PropTypes.string,
};

export default PaymentReview;
