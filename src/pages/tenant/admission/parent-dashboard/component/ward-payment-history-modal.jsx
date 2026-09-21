import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import dayjs from 'dayjs';
import { getParentWardPayments } from '@/api/tenant/admission/admissionApi';

const naira = (n) => `₦${(Number(n) || 0).toLocaleString()}`;

/**
 * "View Receipt" per past payment, from a parent's own dashboard — opens
 * the exact same /bursary/transactions/print_receipt page staff use,
 * authorized because the viewer is a guardian of this specific ward (see
 * BursaryController::printReceipt()).
 */
const WardPaymentHistoryModal = ({ open, onClose, ward }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const load = useCallback(
    async (pageNumber) => {
      if (!ward?.id) return;

      setLoading(true);
      setError('');
      try {
        const res = await getParentWardPayments(ward.id, pageNumber + 1);
        if (res?.status) {
          setPayments(res.payments || []);
          setTotalRows(res.total || 0);
        } else {
          setError(res?.message || 'Failed to load payment history');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    },
    [ward?.id],
  );

  useEffect(() => {
    if (open) {
      setPage(0);
      load(0);
    }
  }, [open, load]);

  const viewReceipt = (payment) => {
    const params = new URLSearchParams({
      bulk_order_id: payment.bulk_order_id,
      user_id: payment.user_id,
      session_term_id: payment.session_term_id,
    });
    window.open(`/bursary/transactions/print_receipt?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Payment History{ward?.name ? ` — ${ward.name}` : ''}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ py: 1 }}>
            <Skeleton variant="rounded" height={200} />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">
                      Receipt
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No payments made yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((row) => (
                      <TableRow key={row.bulk_order_id} hover>
                        <TableCell sx={{ fontSize: '0.78rem' }}>
                          {row.trans_date ? dayjs(row.trans_date).format('MMM D, YYYY') : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{row.description || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{row.payment_type || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }} align="right">
                          {naira(row.amount)}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<ReceiptOutlinedIcon fontSize="small" />}
                            onClick={() => viewReceipt(row)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalRows > 0 && (
              <TablePagination
                component="div"
                count={totalRows}
                page={page}
                onPageChange={(_, newPage) => {
                  setPage(newPage);
                  load(newPage);
                }}
                rowsPerPage={10}
                rowsPerPageOptions={[10]}
                sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.72rem' } }}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WardPaymentHistoryModal;
