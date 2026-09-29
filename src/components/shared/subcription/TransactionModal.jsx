import React, { useState, useEffect, useCallback } from 'react';
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
  Skeleton,
  Alert,
} from '@mui/material';
import { Print as PrintIcon, Update as UpdateIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import useNotification from '@/hooks/useNotification';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import ReceiptModal from './ReceiptModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
    case 'reversed':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Every gateway attempt made against this one subscription — was static
 * mock data (DUMMY_TRANSACTIONS) regardless of which row was clicked; now
 * fetched fresh per subscription via getSubscription(id), which already
 * eager-loads the real `transactions` relation.
 */
const TransactionModal = ({ open, onClose, selectedRow, onStatusChanged }) => {
  const notify = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingBulkId, setCheckingBulkId] = useState(null);
  const [receiptTransaction, setReceiptTransaction] = useState(null);

  const planDescription = selectedRow
    ? `${selectedRow.my_plans?.display_name || 'N/A'} — ${selectedRow.sessions?.session_name || ''} ${selectedRow.terms?.term_name || ''}`
    : '';

  const fetchTransactions = useCallback(async () => {
    if (!selectedRow?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getSubscription(selectedRow.id);
      setTransactions(res.data?.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [selectedRow?.id]);

  useEffect(() => {
    if (open) {
      fetchTransactions();
    }
  }, [open, fetchTransactions]);

  const handleCheckStatus = async (transaction) => {
    setCheckingBulkId(transaction.trans_bulk_id);
    try {
      const res = await subscriptionApi.checkTransactionStatus(transaction.trans_bulk_id);
      if (res.success) {
        notify.success(res.message || 'Transaction status updated', 'Success');
        fetchTransactions();
        onStatusChanged?.();
      } else {
        notify.error(res.message || 'Failed to check transaction status');
      }
    } catch (err) {
      console.error('Failed to check transaction status', err);
      notify.error(err.response?.data?.message || 'Failed to check transaction status');
    } finally {
      setCheckingBulkId(null);
    }
  };

  return (
    <>
      <ReusableModal
        open={open}
        onClose={onClose}
        title={`Transaction Details${selectedRow ? ` - ${selectedRow.sessions?.session_name || ''} / ${selectedRow.terms?.term_name || ''}` : ''}`}
        size="large"
        disableEnforceFocus
        disableAutoFocus
      >
        <Box>
          {selectedRow && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Plan:</strong> {planDescription}
              </Typography>
            </Box>
          )}

          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Transaction Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {[...Array(6)].map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width="70%" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Alert severity="error">{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <TableRow key={transaction.trans_id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{transaction.trans_id}</TableCell>
                      <TableCell>{parseFloat(transaction.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {transaction.trans_date
                          ? new Date(transaction.trans_date).toLocaleDateString('en-GB')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(transaction.trans_status || 'pending').toUpperCase()}
                          size="small"
                          color={getStatusColor(transaction.trans_status)}
                          sx={{ borderRadius: '4px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {transaction.trans_status !== 'approved' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<UpdateIcon />}
                              onClick={() => handleCheckStatus(transaction)}
                              disabled={checkingBulkId === transaction.trans_bulk_id}
                              sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                            >
                              {checkingBulkId === transaction.trans_bulk_id
                                ? 'Checking...'
                                : 'Check Status'}
                            </Button>
                          )}
                          {transaction.trans_status === 'approved' && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PrintIcon />}
                              onClick={() =>
                                setReceiptTransaction({
                                  transaction_id: transaction.trans_id,
                                  payment_description: planDescription,
                                  amount: transaction.amount,
                                  status: transaction.trans_status,
                                })
                              }
                              sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                            >
                              Print Receipt
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No transactions found for this subscription yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" size="small" color="inherit" onClick={onClose}>
              Close
            </Button>
          </Box>
        </Box>
      </ReusableModal>

      <ReceiptModal
        open={Boolean(receiptTransaction)}
        onClose={() => setReceiptTransaction(null)}
        transaction={receiptTransaction}
      />
    </>
  );
};

TransactionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  onStatusChanged: PropTypes.func,
};

export default TransactionModal;
