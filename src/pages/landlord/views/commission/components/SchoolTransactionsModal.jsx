import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
  Alert,
  Box,
  useTheme,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import { getSchoolTransactions } from '@/api/landlord/commission/commissionApi';
import useNotification from '@/hooks/useNotification';

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * "View Transactions" drill-down for one school — two separate lists,
 * since they come from two separate sources (see
 * CommissionController::getSchoolTransactions()):
 *
 * - Subscription transactions: full rows, straight from our own database.
 * - Settlements: this school's own SkoolPay settlement batches (the same
 *   data its own bursary team already sees), for the bursary/fee-payment
 *   side. The exact fields SkoolPay returns per settlement haven't been
 *   confirmed live yet, so this renders defensively and falls back to "—"
 *   for anything missing rather than breaking.
 */
const SchoolTransactionsModal = ({ open, onClose, school }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const notify = useNotification();

  const [loading, setLoading] = useState(false);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const fetchData = useCallback(async () => {
    if (!school?.id) return;
    setLoading(true);
    try {
      const res = await getSchoolTransactions(school.id);
      const data = res?.data ?? {};
      setSubscriptionTransactions(Array.isArray(data.subscriptionTransactions) ? data.subscriptionTransactions : []);
      setSettlements(Array.isArray(data.settlements) ? data.settlements : []);
    } catch (error) {
      console.error('Failed to fetch school transactions', error);
      notify.error('Failed to load transactions for this school');
      setSubscriptionTransactions([]);
      setSettlements([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school?.id]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Transactions
          </Typography>
          {school && (
            <Typography variant="body2" color="text.secondary">
              {school.tenant_name}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Subscription Transactions
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : subscriptionTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                      No subscription transactions for this school yet.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptionTransactions.map((row, index) => (
                  <TableRow key={row.trans_id ?? index} hover>
                    <TableCell>{row.trans_id ?? '—'}</TableCell>
                    <TableCell>{formatNaira(row.amount)}</TableCell>
                    <TableCell>{row.trans_status ?? '—'}</TableCell>
                    <TableCell>{row.trans_date ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Settlements (fee payments, via SkoolPay)
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Settlement ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Transactions</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : settlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                      No settlements for this school yet.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                settlements.map((row, index) => (
                  <TableRow key={row.id ?? index} hover>
                    <TableCell>{row.id ?? '—'}</TableCell>
                    <TableCell>{row.transactions ?? '—'}</TableCell>
                    <TableCell>{row.settlement_status ?? '—'}</TableCell>
                    <TableCell>{row.updated_at ?? row.created_at ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolTransactionsModal;
