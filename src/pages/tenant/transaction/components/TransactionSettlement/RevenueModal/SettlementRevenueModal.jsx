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
import { settlementRevenueTransactions } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const SettlementRevenueModal = ({
  open,
  onClose,
  settlementId,
  bankLabel, // e.g., "GTBANK PLC - 0116062047"
}) => {
  const notify = useNotification();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadRevenue = useCallback(async () => {
    if (!settlementId) return;

    setLoading(true);
    try {
      const res = await settlementRevenueTransactions({
        settlement_id: settlementId,
        filters: { page, per_page: 15 },
      });

      if (res.success) {
        setData(res.data || []);
        setLastPage(res.last_page || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      notify.error('Failed to load revenue details');
    } finally {
      setLoading(false);
    }
  }, [settlementId, page]);

  useEffect(() => {
    if (open && settlementId) {
      loadRevenue();
    }
  }, [open, settlementId, page, loadRevenue]);

  const formatAmount = (n) => `₦${Number(n || 0).toLocaleString()}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>View Revenue for {bankLabel}</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Revenue Code</TableCell>
                  <TableCell>Revenue Name</TableCell>
                  <TableCell align="right">Total Amount ₦</TableCell>
                  <TableCell align="right">No. of Transactions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No revenue found for this settlement.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.revenue_id || index}>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell>{row.revenue_code}</TableCell>
                      <TableCell>{row.revenue_name}</TableCell>
                      <TableCell align="right">{formatAmount(row.transactions_sum)}</TableCell>
                      <TableCell align="right">{row.transactions_count}</TableCell>
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
          Showing {data.length} of {total} records
        </Typography>

        <Box display="flex" gap={1}>
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SettlementRevenueModal;
