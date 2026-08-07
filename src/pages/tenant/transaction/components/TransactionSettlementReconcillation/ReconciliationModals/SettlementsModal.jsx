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
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import { fetchSettlements } from '@/api/tenant/bursary/transactionApi';
import dayjs from 'dayjs';

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const SettlementsModal = ({ open, onClose, rowData }) => {
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
    if (!rowData?.bank_name || !rowData?.account_number) return;

    setLoading(true);
    try {
      // Reuse existing fetchSettlements.
      // search by account_number so we only get this bank account's settlements.
      const res = await fetchSettlements({
        filters: {
          from: fromDate || rowData.from || undefined,
          to: toDate || rowData.to || undefined,
          search: rowData.account_number,
          page,
          per_page: 15,
        },
      });

      if (res?.success) {
        // Extra safety: only rows that match this bank + account
        const rows = (res.data || []).filter(
          (r) => r.bank_name === rowData.bank_name && r.account_number === rowData.account_number,
        );
        setData(rows);
        setLastPage(res.last_page || 1);
        setTotal(res.total || rows.length);
      }
    } catch (err) {
      console.error('Failed to load settlements', err);
    } finally {
      setLoading(false);
    }
  }, [rowData, fromDate, toDate, page]);

  useEffect(() => {
    if (open && rowData) {
      setPage(1);
      setFromDate(rowData.from || '');
      setToDate(rowData.to || '');
    }
  }, [open, rowData]);

  useEffect(() => {
    if (open && rowData) loadData();
  }, [open, rowData, page, loadData]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`Settlements — ${rowData?.bank_name || ''} (${rowData?.account_number || ''})`}
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
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Settlement ID</TableCell>
                  <TableCell>Amount (₦)</TableCell>
                  <TableCell>Date Paid</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>No. of Transactions</TableCell>
                  <TableCell>No. of Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No settlements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', maxWidth: 200 }}>
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
                          color="success.main"
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {row.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.transaction_count ?? '—'}</TableCell>
                      <TableCell>{row.revenue_count ?? '—'}</TableCell>
                    </TableRow>
                  ))
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

export default SettlementsModal;
