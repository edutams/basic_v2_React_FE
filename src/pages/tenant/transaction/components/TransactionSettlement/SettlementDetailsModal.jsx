import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StandardModal from '@/components/shared/StandardModal';
import { fetchSettlementDetails } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const SettlementDetailsModal = ({ open, onClose, settlementId, bankLabel }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const format = (n) => `₦${Number(n || 0).toLocaleString()}`;

  const loadData = useCallback(async () => {
    if (!settlementId) return;
    setLoading(true);
    try {
      const res = await fetchSettlementDetails({
        settlement_id: settlementId,
        filters: { page, per_page: 15 },
      });
      if (res.success) {
        setData(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch settlement details', err);
    } finally {
      setLoading(false);
    }
  }, [settlementId, page]);

  useEffect(() => {
    if (open && settlementId) {
      setPage(1);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, settlementId]);

  useEffect(() => {
    if (open && settlementId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <StandardModal open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {bankLabel ? `Settlement Details — ${bankLabel}` : 'Settlement Details'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Paid By</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Amount (₦)</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', maxWidth: 200 }}>
                        {row.transaction_id}
                      </TableCell>
                      <TableCell>{row.paid_by}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.revenue_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.revenue_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{format(row.amount_paid)}</TableCell>
                      <TableCell>{dayjs(row.trans_date).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} of {total} transactions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="small" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </StandardModal>
  );
};

export default SettlementDetailsModal;
