import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  Link,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StandardModal from '@/components/shared/StandardModal';
import { fetchRevenueAmountDetails } from '@/api/tenant/bursary/transactionApi';
import tenantApi from '@/api/tenant/tenant_api';
import dayjs from 'dayjs';

const RevenueTransactionsModal = ({ open, onClose, paymentId, revenueName }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const format = (n) => `₦${Number(n || 0).toLocaleString()}`;

  const buildFilters = useCallback(
    () => ({ from: fromDate || null, to: toDate || null, page, per_page: 15 }),
    [fromDate, toDate, page],
  );

  const loadData = useCallback(async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const res = await fetchRevenueAmountDetails({
        payment_id: paymentId,
        filters: buildFilters(),
      });
      if (res.success) {
        setData(res.data);
        setLastPage(res.last_page);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to fetch revenue transaction details', err);
    } finally {
      setLoading(false);
    }
  }, [paymentId, buildFilters]);

  useEffect(() => {
    if (open && paymentId) {
      setPage(1);
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paymentId]);

  useEffect(() => {
    if (open && paymentId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await tenantApi.post(
        '/bursary/transactions/revenue/export_csv_revenue_amount_details',
        { payment_id: paymentId, filters: buildFilters() },
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed', err);
    }
  };

  return (
    <StandardModal open={open} onClose={onClose} maxWidth="lg" fullWidth revenueName={revenueName}>
      {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {revenueName ? `Transactions — ${revenueName}` : 'Transactions'}
        </Typography>
      </Box> */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <Button variant="contained" color="success" fullWidth onClick={handleSearch}>
              Search
            </Button>
          </Grid>
          <Grid
            size={{ xs: 6, sm: 4 }}
            sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}
          >
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadCSV}>
              Download CSV
            </Button>
          </Grid>
        </Grid>

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
                  <TableCell>Wallet Account</TableCell>
                  <TableCell>Payment Type</TableCell>
                  <TableCell>Payment Description</TableCell>
                  <TableCell>Amount ₦</TableCell>
                  <TableCell>Transaction Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', maxWidth: 220 }}>
                        {row.transaction_id}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.paid_by}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.class}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          underline="hover"
                          href={`/bursary/transactions/wallet_transactions?wallet_account_no=${encodeURIComponent(row.wallet_account_no)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 1, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {row.wallet_account_no ?? 'N/A'}
                        </Link>
                      </TableCell>
                      <TableCell>{row.payment_type}</TableCell>
                      <TableCell>{row.description}</TableCell>
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

export default RevenueTransactionsModal;
