import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';

const SCHOOL_INFO = {
  name: 'EduTAMS',
  address: '10, Prince C.O Adenubi Street, Igbomoku Quarters, Ijebu Ife, Ogun State, Nigeria.',
  phone: '(+234)-701-1123-736',
  website: 'https://tasuess.basic.test',
};

const ReceiptModal = ({ open, onClose, transaction }) => {
  const receiptNo = transaction ? `00000${transaction.id}` : '0000041';

  const receiptDate = transaction?.transactionDate
    ? new Date(transaction.transactionDate).toLocaleDateString('en-GB')
    : '26-05-2021';

  const handlePrint = () => {
    window.print();
  };

  const convertNumberToWords = (num) => {
    if (!num) return 'Zero';
    const amountStr = String(num);
    const amount = parseInt(amountStr.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    if (amount < 10) return ones[amount];
    if (amount < 20) return ones[amount - 10] + 'teen';
    if (amount < 100)
      return tens[Math.floor(amount / 10)] + (amount % 10 ? ' ' + ones[amount % 10] : '');
    if (amount < 1000)
      return (
        ones[Math.floor(amount / 100)] +
        ' hundred' +
        (amount % 100 ? ' ' + convertNumberToWords(amount % 100) : '')
      );
    if (amount < 1000000)
      return (
        convertNumberToWords(Math.floor(amount / 1000)) +
        ' thousand' +
        (amount % 1000 ? ' ' + convertNumberToWords(amount % 1000) : '')
      );
    return String(amount);
  };

  const discountPercent =
    transaction?.discount && transaction.discount !== '0'
      ? Math.round(
          (parseInt(String(transaction.discount).replace(/,/g, ''), 10) /
            parseInt(String(transaction.amountdue || '0').replace(/,/g, ''), 10)) *
            100,
        )
      : 0;

  const discountAmount = transaction?.discount || '0';
  const amountPaid = transaction?.amountdue || '0';
  const planName = transaction?.paymentDescription?.includes('OBASIC++')
    ? 'OBASIC++'
    : transaction?.paymentDescription?.includes('BASIC++')
    ? 'BASIC++'
    : 'BASIC++';

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Print Receipt"
      size="medium"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box
        id="receipt-content"
        sx={{
          p: 3,
          bgcolor: 'white',
          maxWidth: 500,
          mx: 'auto',
          border: '1px solid #ddd',
          borderRadius: 1,
        }}
      >
        {/* Header with Logo and Company Info */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="School Logo"
            sx={{
              width: 60,
              height: 60,
              objectFit: 'contain',
              mb: 1,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            {SCHOOL_INFO.name}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#666' }}>
            {SCHOOL_INFO.address}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#666' }}>
            Phone: {SCHOOL_INFO.phone}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Receipt Number and Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            NO: {receiptNo}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Date: {receiptDate}
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
          Subscription Payment Receipt
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Receipt Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Name:
            </Typography>
            <Typography variant="body2">
              Tai Solarin University of Education Secondary School
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Plan:
            </Typography>
            <Typography variant="body2">{planName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Amount Paid (₦):
            </Typography>
            <Typography variant="body2">{amountPaid}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Discount(%) / Amount (₦):
            </Typography>
            <Typography variant="body2">
              {discountPercent} / {discountAmount}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Amount in Words:
            </Typography>
            <Typography variant="body2">{convertNumberToWords(amountPaid)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Description:
            </Typography>
          </Box>
          <Typography variant="body2">
            Being payment for{' '}
            {transaction?.paymentDescription || '2020/2021 - First Term Subscription Plan'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
            Thank you for your patronage...
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {SCHOOL_INFO.website}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: '8px' }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: '8px', bgcolor: '#1a237e' }}
          >
            Print Receipt
          </Button>
        </Box>
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
