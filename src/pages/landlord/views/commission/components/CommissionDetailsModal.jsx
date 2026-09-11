import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
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
  IconButton,
  useTheme,
  TablePagination,
  Alert,
  Skeleton,
} from '@mui/material';
import { IconX, IconDownload } from '@tabler/icons-react';
import { getTransactions } from '@/api/landlord/commission/commissionApi';
import { useNotification } from '@/hooks/useNotification';

const CommissionDetailsModal = ({ open, onClose, agent }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const notify = useNotification();

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!agent?.id) return;
    setLoading(true);
    try {
      const res = await getTransactions({
        organizationId: agent.id,
        from: fromDate || undefined,
        to: toDate || undefined,
        search: transactionId || undefined,
      });
      const list = res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch commission transactions', err);
      notify.error('Failed to load transaction details');
      setRows([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id]);

  useEffect(() => {
    if (open) {
      setPage(0);
      fetchTransactions();
    }
  }, [open, fetchTransactions]);

  const filteredData = rows;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilter = () => {
    setPage(0);
    fetchTransactions();
  };

  const handleExport = () => {
    // Export functionality would go here
    alert('Export functionality would download the filtered data');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Subscription Commission Details
          </Typography>
          {agent && (
            <Typography variant="body2" color="text.secondary">
              Organization: {agent.agentName} ({agent.email})
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Filters Section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
            />
            <TextField
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1, minWidth: { xs: '100%', sm: 140 } }}
            />
            <TextField
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              size="small"
              placeholder="Enter transaction ID"
              sx={{ flex: 2, minWidth: { xs: '100%', sm: 180 } }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleFilter}
              sx={{
                bgcolor: '#3949ab',
                textTransform: 'none',
                borderRadius: '8px',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { bgcolor: '#303f9f' },
              }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconDownload />}
              onClick={handleExport}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDarkMode ? theme.palette.action.hover : '#F3F4F6',
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Session ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transaction Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow
                        key={row.id ?? row.trans_id ?? index}
                        sx={{
                          '&:hover': {
                            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          },
                        }}
                      >
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.transaction_id ?? row.trans_id ?? row.id ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.session_id ?? row.sessionId ?? '—'}</TableCell>
                        <TableCell>{row.narration ?? row.description ?? '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ₦{Number(row.amount ?? 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.credit_type ?? row.creditType ?? row.payment_type ?? '—'}</TableCell>
                        <TableCell>{row.created_at ?? row.transaction_date ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                          No records found
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          component="Box"
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          variant="contained"
          size="small"
          onClick={onClose}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommissionDetailsModal;
