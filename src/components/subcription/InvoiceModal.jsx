import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';

const SCHOOL_INFO = {
  name: 'Tai Solarin University of Education Secondary School',
  address: 'Igbeba Road, Ijebu Ode',
  phone: '2348140304580',
  email: 'support@edutams.com',
};

const ACCOUNT_DETAILS = {
  accountNumber: '0123940564',
  accountName: 'EduTAMS',
  bank: 'Bank',
};

const InvoiceModal = ({ open, onClose, selectedRow }) => {
  const rate = selectedRow?.amount || '205,000';
  const qty = 1;
  const discount = selectedRow?.discount || '0';
  const amount = selectedRow?.amountdue || '205,000';

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return `₦${value}`;
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="School Invoice"
      size="large"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src={EduTAMSLogo}
            alt="School Logo"
            sx={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              borderRadius: 1,
              border: '1px solid #eee',
              mb: 2,
            }}
          />

          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 0.5 }}>
            {SCHOOL_INFO.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {SCHOOL_INFO.address}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Phone: {SCHOOL_INFO.phone}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            p: 2,
            bgcolor: '#f8f9fa',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="body2" color="textSecondary">
              <strong>Invoice Date:</strong> {new Date().toLocaleDateString('en-GB')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Session/Term:</strong> {selectedRow?.sessionterm || '2025/2026 Second Term'}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Status:</strong>{' '}
              <Box
                component="span"
                sx={{
                  color: selectedRow?.status === 'active' ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                }}
              >
                {selectedRow?.status?.toUpperCase() || 'PENDING'}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>DESCRIPTION</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>RATE (₦)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>QTY</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Discount (₦)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>AMOUNT (₦)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    EDUTAMS school portal (
                    {selectedRow?.plandetails || 'OBASIC++ 200 and above Students'})
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Subscription Fee ({selectedRow?.sessionterm || '2025/2026 Second Term'})
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{rate}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{qty}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{discount}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>{amount}</TableCell>
              </TableRow>

              {/* Gateway Charges Row */}
              {selectedRow?.gatewaycharges && selectedRow.gatewaycharges !== '0' && (
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      Gateway Charges
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{selectedRow.gatewaycharges}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>1</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>0</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{selectedRow.gatewaycharges}</TableCell>
                </TableRow>
              )}

              {/* Total Row */}
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell
                  colSpan={4}
                  sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}
                >
                  TOTAL AMOUNT (₦)
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: '#1a237e',
                  }}
                >
                  {selectedRow?.amountdue || amount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Account Details:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">
              <strong>Account Number:</strong> {ACCOUNT_DETAILS.accountNumber}
            </Typography>
            <Typography variant="body2">
              <strong>Account Name:</strong> {ACCOUNT_DETAILS.accountName}
            </Typography>
            <Typography variant="body2">
              <strong>Bank:</strong> {ACCOUNT_DETAILS.bank}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1, borderLeft: '4px solid #ff9800' }}
        >
          <Typography variant="body2" color="textSecondary">
            <strong>Note:</strong> Please make payment within 7 days to avoid service interruption.
            For any inquiries, contact support@edutams.com
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
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
            Print Invoice
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

InvoiceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
};

export default InvoiceModal;
