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
  Chip,
  Typography,
} from '@mui/material';
import { Print as PrintIcon, Update as UpdateIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';

// Dummy transaction data
const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    transactionId: 'TXN-2024-001',
    paymentDescription: 'OBASIC++ Subscription - 2023/2024 First Term',
    amount: '155,000',
    transactionDate: '2024-01-15',
    status: 'success',
  },
  {
    id: 2,
    transactionId: 'TXN-2024-002',
    paymentDescription: 'Gateway Charges',
    amount: '500',
    transactionDate: '2024-01-15',
    status: 'success',
  },
  {
    id: 3,
    transactionId: 'TXN-2024-003',
    paymentDescription: 'OBASIC++ Subscription - 2023/2024 First Term',
    amount: '155,000',
    transactionDate: '2024-02-20',
    status: 'pending',
  },
  {
    id: 4,
    transactionId: 'TXN-2024-004',
    paymentDescription: 'Gateway Charges',
    amount: '500',
    transactionDate: '2024-02-20',
    status: 'failed',
  },
];

const TransactionModal = ({ open, onClose, selectedRow }) => {
  const transactions = selectedRow ? DUMMY_TRANSACTIONS : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleUpdateStatus = (transaction) => {
    // Handle update status action
    console.log('Update status for:', transaction);
  };

  const handlePrintReceipt = (transaction) => {
    // Handle print receipt action
    console.log('Print receipt for:', transaction);
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Transaction Details - ${selectedRow?.sessionterm || ''}`}
      size="large"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box>
        {selectedRow && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Plan:</strong> {selectedRow.plandetails}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Amount Due:</strong> ₦{selectedRow.amountdue}
            </Typography>
          </Box>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount (₦)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Transaction Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{transaction.transactionId}</TableCell>
                    <TableCell>{transaction.paymentDescription}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.transactionDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(transaction.status)}
                        sx={{ borderRadius: '4px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<UpdateIcon />}
                          onClick={() => handleUpdateStatus(transaction)}
                          sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                        >
                          Update Status
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrintReceipt(transaction)}
                          sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                        >
                          Print Receipt
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button color="inherit" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

TransactionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
};

export default TransactionModal;
