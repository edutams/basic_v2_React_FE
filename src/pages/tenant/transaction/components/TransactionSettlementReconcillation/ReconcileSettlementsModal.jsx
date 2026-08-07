import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import { fetchSettlements } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const ReconcileSettlementsModal = ({ open, onClose, settlementData, onReconcile }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = useCallback(async () => {
    if (!settlementData?.bank_name || !settlementData?.account_number) return;

    setLoading(true);
    try {
      const res = await fetchSettlements({
        filters: {
          from: fromDate || settlementData.from || undefined,
          to: toDate || settlementData.to || undefined,
          search: settlementData.account_number,
          page,
          per_page: 15,
        },
      });

      if (res?.success) {
        const rows = (res.data || []).filter(
          (r) =>
            r.bank_name === settlementData.bank_name &&
            r.account_number === settlementData.account_number,
        );
        setData(rows);
        setLastPage(res.last_page || 1);
        setTotal(res.total || rows.length);
      }
    } catch (err) {
      console.error('Failed to load settlements for reconcile', err);
    } finally {
      setLoading(false);
    }
  }, [settlementData, fromDate, toDate, page]);

  useEffect(() => {
    if (open && settlementData) {
      setPage(1);
      setFromDate(settlementData.from || '');
      setToDate(settlementData.to || '');
    }
  }, [open, settlementData]);

  useEffect(() => {
    if (open && settlementData) loadData();
  }, [open, settlementData, page, loadData]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  if (!settlementData) return null;

  const expected = Number(settlementData.expected_amount || 0);
  const reconciled = Number(settlementData.reconciled_amount || 0);
  const balance = Number(settlementData.balance ?? expected - reconciled);

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`Reconcile Settlements — ${settlementData.bank_name} (${settlementData.account_number})`}
    >
      <Box sx={{ p: 3 }}>
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Settlement is the amount received from the payment gateway into this bank account.
            Compare these figures with your bank statement. Settled settlements are already
            approved; use Reconcile for those that still need attention.
          </Typography>
        </Alert>

        {/* Summary */}
        {/* <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Expected (from transactions)
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {fmt(expected)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Settled (gateway)
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {fmt(reconciled)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Balance
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color={balance > 0 ? 'error.main' : 'success.main'}
              >
                {fmt(balance)}
              </Typography>
            </Paper>
          </Grid>
        </Grid> */}

        {/* Filters */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={6} sm={2}>
            <Button variant="contained" color="success" fullWidth onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>

        {/* Settlements table */}
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
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Settlement ID</TableCell>
                  <TableCell>Amount (₦)</TableCell>
                  <TableCell>Date Paid</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Transactions</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      No settlements found for this account.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => {
                    const settled = row.is_settled === true;

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-all', maxWidth: 180 }}>
                          {row.settlement_id ?? row.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{fmt(row.amount)}</TableCell>
                        <TableCell>
                          {row.date_paid ? dayjs(row.date_paid).format('YYYY-MM-DD') : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={settled ? 'success.main' : 'warning.main'}
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {row.status}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.transaction_count ?? 0}</TableCell>
                        <TableCell>{row.revenue_count ?? 0}</TableCell>
                        <TableCell align="center">
                          {settled ? (
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              Settled
                            </Typography>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() =>
                                onReconcile?.({
                                  settlement_id: row.settlement_id,
                                  amount: row.amount,
                                  date_paid: row.date_paid,
                                  bank_name: settlementData.bank_name,
                                  account_number: settlementData.account_number,
                                })
                              }
                            >
                              Reconcile
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} of {total} settlements
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

export default ReconcileSettlementsModal;
