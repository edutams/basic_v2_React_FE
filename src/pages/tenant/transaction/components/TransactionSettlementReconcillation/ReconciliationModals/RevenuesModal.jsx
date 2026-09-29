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
import StandardModal from '@/components/shared/StandardModal';
import { fetchSettlementReconciliationRevenues } from '@/api/tenant/bursary/transactionApi';

const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

const RevenuesModal = ({ open, onClose, rowData, onOpenRevenueTransactions }) => {
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
    if (!rowData?.payment_name_ids?.length) return;

    setLoading(true);
    try {
      const res = await fetchSettlementReconciliationRevenues({
        payment_name_ids: rowData.payment_name_ids,
        filters: {
          from: fromDate || rowData.from || undefined,
          to: toDate || rowData.to || undefined,
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
      console.error('Failed to load revenues', err);
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
    if (open && rowData) {
      loadData();
    }
  }, [open, rowData, page, loadData]);

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  /* Shared compact cell styles */
  const thCell = { fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 0.75, px: 1.5 };
  const tdCell = { py: 0.5, px: 1.5 };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={`Revenues — ${rowData?.bank_name || ''} (${rowData?.account_number || ''})`}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
                  <TableCell sx={thCell}>#</TableCell>
                  <TableCell sx={thCell}>Revenue Code</TableCell>
                  <TableCell sx={thCell}>Revenue Name</TableCell>
                  <TableCell sx={thCell}>No. of Transactions</TableCell>
                  <TableCell sx={thCell}>Expected (₦)</TableCell>
                  <TableCell sx={thCell}>Settled (₦)</TableCell>
                  <TableCell sx={thCell}>Outstanding (₦)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ ...tdCell, py: 3 }}>
                      No revenues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={tdCell}>{(page - 1) * 15 + index + 1}</TableCell>
                      <TableCell sx={tdCell}>{row.revenue_code ?? '—'}</TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.revenue_name}</TableCell>
                      <TableCell sx={tdCell}>
                        {onOpenRevenueTransactions ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={() =>
                              onOpenRevenueTransactions({
                                paymentId: row.id,
                                revenueName: row.revenue_name,
                                from: fromDate || rowData.from,
                                to: toDate || rowData.to,
                              })
                            }
                            sx={{ fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            {row.transaction_count}
                          </Link>
                        ) : (
                          row.transaction_count
                        )}
                      </TableCell>
                      <TableCell sx={tdCell}>{fmt(row.expected_amount)}</TableCell>
                      <TableCell sx={{ ...tdCell, color: 'success.main', fontWeight: 600 }}>
                        {fmt(row.settled_amount)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...tdCell,
                          color: Number(row.outstanding_amount) > 0 ? 'error.main' : 'success.main',
                          fontWeight: 600,
                        }}
                      >
                        {fmt(row.outstanding_amount)}
                      </TableCell>
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
            mt: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} of {total} revenues
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

export default RevenuesModal;
