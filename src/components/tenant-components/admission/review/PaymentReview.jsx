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
  { label: 'RECEIPT NO', value: 'SKRC-2025-00491'       },
  { label: 'DATE PAID',  value: '04 May 2025, 11:24 AM' },
  { label: 'REFERENCE',  value: 'TRX-29273645'          },
  { label: 'PAYER',      value: 'Mrs. Adetola Ademola'  },
  { label: 'METHOD',     value: 'Bank Transfer - Globus Bank' },
];

const PaymentReview = ({ totalPaid = '₦25,500' }) => (
  <ReviewSection
    number={3}
    title="Payment Receipt"
    subtitle="Confirmation of admission application payment"
    id="section-payment"
  >
    {/* Receipt header bar */}
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" p={2} sx={{ bgcolor: 'success.light' }}>
      <Box display="flex" alignItems="center" gap={1}>
        <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 20 }} />
        <Box>
          <Typography variant="body2" fontWeight={700}>Payment Receipt</Typography>
          <Typography variant="caption" color="text.secondary">Admission Application Payment Breakdown</Typography>
        </Box>
      </Box>
      <Box display="flex" gap={1}>
        <Button size="small" startIcon={<PrintIcon />} variant="outlined"
          sx={{ fontSize: 11, color: 'success.dark', borderColor: 'success.main', ':hover': { bgcolor: 'success.main', color: '#fff' } }}>
          Print
        </Button>
        <Button size="small" startIcon={<DownloadIcon />} variant="outlined"
          sx={{ fontSize: 11, color: 'success.dark', borderColor: 'success.main', ':hover': { bgcolor: 'success.main', color: '#fff' } }}>
          Download
        </Button>
      </Box>
    </Box>

    {/* Receipt body */}
    <Box sx={{ p: 2, bgcolor: '#f2fcf7' }}>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {RECEIPT_META.map(({ label, value }) => (
          <Grid key={label} size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
            <Typography variant="body2" fontWeight={600}>{value}</Typography>
          </Grid>
        ))}
        <Grid size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary" display="block">STATUS</Typography>
          <Chip label="Successful" size="small"
            sx={{ bgcolor: '#E8F5E9', color: 'success.dark', fontWeight: 600, fontSize: 11 }} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 1 }} />

      <Box display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>DESCRIPTION</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>AMOUNT</Typography>
      </Box>

      {FEE_ITEMS.map(({ label, amount }) => (
        <Box key={label} display="flex" justifyContent="space-between"
          sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
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

PaymentReview.propTypes = {
  totalPaid: PropTypes.string,
};

export default PaymentReview;
