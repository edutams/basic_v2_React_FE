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
  Chip,
  Avatar,
  Skeleton,
  Alert,
  TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { fetchLearnerWalletTransactions } from '@/api/tenant/bursary/transactionApi';

const naira = (n) => `₦${(Number(n) || 0).toLocaleString()}`;

/**
 * "Wallet Transaction" row action on the Class Ledger table — this
 * learner's wallet balance plus the bursary payments settled from it.
 * Mirrors the parent-dashboard WalletTransactionsModal, fed by the
 * user_id-scoped lookup instead of the parent's own wallet.
 */
const LearnerWalletTransactionsModal = ({ open, onClose, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const load = useCallback(
    async (pageNumber) => {
      if (!userId) return;

      setLoading(true);
      setError('');
      try {
        const res = await fetchLearnerWalletTransactions(userId, pageNumber + 1);
        if (res?.success) {
          setWallet(res.wallet || null);
          setTransactions(res.transactions || []);
          setTotalRows(res.total || 0);
        } else {
          setError(res?.message || 'Failed to load wallet transactions');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load wallet transactions');
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (open) {
      setPage(0);
      load(0);
    }
  }, [open, load]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Wallet Transactions
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
            {wallet && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={wallet.avatar || undefined} sx={{ width: 44, height: 44 }}>
                    {(wallet.name || '?')[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{wallet.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[wallet.learner_id, wallet.class].filter(Boolean).join(' • ')}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    Wallet Balance
                  </Typography>
                  <Typography fontWeight={700} color="success.main">
                    {naira(wallet.balance)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {wallet.wallet_account_no}
                  </Typography>
                </Box>
              </Box>
            )}

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No wallet transactions yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontSize: '0.78rem' }}>
                          {row.created_at ? dayjs(row.created_at).format('MMM D, YYYY') : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }}>{row.description || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.78rem' }} align="right">
                          {naira(row.amount)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.status}
                            color={
                              row.status === 'APPROVED' || row.status === 'SUCCESS'
                                ? 'success'
                                : row.status === 'PENDING'
                                  ? 'warning'
                                  : 'error'
                            }
                            sx={{ fontSize: '0.62rem', height: 20 }}
                          />
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
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
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

export default LearnerWalletTransactionsModal;
