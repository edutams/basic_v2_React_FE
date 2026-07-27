import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNotification } from '@/hooks/useNotification';
import { settlementTransactions } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const SettlementTransactionsModal = ({ open, onClose, settlementId, bankLabel }) => {
  const notify = useNotification();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Stable load function
  const loadTransactions = useCallback(
    async (currentPage) => {
      if (!settlementId || !open) return;

      setLoading(true);
      try {
        const payload = {
          settlement_id: settlementId,
          filters: {
            page: currentPage,
            per_page: 15,
          },
        };

        const res = await settlementTransactions(payload);

        if (res.success) {
          const transactionsData = res.data?.data || res.data || [];
          setData(transactionsData);
          setLastPage(res.data?.last_page || res.last_page || 1);
          setTotal(res.data?.total || res.total || 0);
        } else {
          notify.error(res.message || 'Failed to load transactions');
        }
      } catch (err) {
        console.error('Settlement Transactions Error:', err);
        notify.error('Failed to load transactions. Server error (500).');
      } finally {
        setLoading(false);
      }
    },
    [settlementId, open],
  );

  // Reset page when modal opens with new settlement
  useEffect(() => {
    if (open && settlementId) {
      setPage(1);
    }
  }, [open, settlementId]);

  // Load data when page or settlement changes
  useEffect(() => {
    if (open && settlementId) {
      loadTransactions();
    }
  }, [page, loadTransactions]);

  const formatAmount = (n) => `₦${Number(n || 0).toLocaleString()}`;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>View Transactions for {bankLabel}</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Paid By</TableCell>
                  <TableCell>Payment Description</TableCell>
                  <TableCell align="right">Amount ₦</TableCell>
                  <TableCell>Transaction Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      No transactions found for this settlement.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id || row.bulk_order_id || index}>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell>{row.bulk_order_id || row.order_id}</TableCell>
                      <TableCell>
                        {`${row.fname || ''} ${row.mname || ''} ${row.lname || ''}`.trim() || 'N/A'}
                        <Typography variant="body2" color="text.secondary">
                          {row.class_name} - {row.arm_names}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.description || '—'}</TableCell>
                      <TableCell align="right">{formatAmount(row.amount_paid)}</TableCell>
                      <TableCell>
                        {row.trans_date ? dayjs(row.trans_date).format('YYYY-MM-DD HH:mm:ss') : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Page {page} of {lastPage} | Total: {total}
        </Typography>

        <Box display="flex" gap={1}>
          <Button disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
            Previous
          </Button>
          <Button disabled={page >= lastPage} onClick={() => handlePageChange(page + 1)}>
            Next
          </Button>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SettlementTransactionsModal;
