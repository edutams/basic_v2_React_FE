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
  Link,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StandardModal from '@/components/shared/StandardModal';
import { fetchSettlementReconciliationDetails } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const TransactionsModal = ({ open, onClose, rowData }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all'); // all | outstanding

  const loadData = useCallback(async () => {
    if (!rowData?.payment_name_ids?.length) return;
    setLoading(true);
    try {
      const res = await fetchSettlementReconciliationDetails({
        payment_name_ids: rowData.payment_name_ids,
        filters: {
          from: fromDate || rowData.from || undefined,
          to: toDate || rowData.to || undefined,
          status,
          page,
          per_page: 15,
        },
      });
      if (res?.success) {
        setData(res.data || []);
        setLastPage(res.last_page || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  }, [rowData, fromDate, toDate, status, page]);

  useEffect(() => {
    if (open && rowData) {
      setPage(1);
      setFromDate(rowData.from || '');
      setToDate(rowData.to || '');
      setStatus('all');
    }
  }, [open, rowData]);

  useEffect(() => {
    if (open && rowData) loadData();
  }, [open, rowData, page, status, loadData]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`All Transactions — ${rowData?.bank_name || ''} (${rowData?.account_number || ''})`}
    >
      <Box sx={{ p: 3 }}>
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
          <Grid item xs={6} sm={2}>
            <Button
              variant={status === 'outstanding' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => {
                setStatus((s) => (s === 'outstanding' ? 'all' : 'outstanding'));
                setPage(1);
              }}
            >
              {status === 'outstanding' ? 'Show All' : 'Outstanding only'}
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
                  <TableCell>Revenue</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount ₦</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', maxWidth: 180 }}>
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
                      <TableCell>{row.revenue_name}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{fmt(row.amount_paid)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={
                            row.settlement_status === 'Settled' ? 'success.main' : 'error.main'
                          }
                          fontWeight={600}
                        >
                          {row.settlement_status}
                        </Typography>
                      </TableCell>
                      <TableCell>{dayjs(row.trans_date).format('YYYY-MM-DD HH:mm')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} of {total}
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

export default TransactionsModal;
