import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  CircularProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { IconFileInvoice, IconCircleCheck, IconClock, IconCash } from '@tabler/icons-react';

import ParentCard from '@/components/shared/ParentCard';
import ReceiptModal from '@/components/shared/subcription/ReceiptModal';
import StatCard from '@/components/shared/StatCard';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import useNotification from '@/hooks/useNotification';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const SubscriptionHistory = () => {
  return <SubscriptionHistoryList />;
};

const SubscriptionHistoryList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [checkingStatusId, setCheckingStatusId] = useState(null);
  const [stats, setStats] = useState(null);
  const notify = useNotification();
  const { refreshSubscriptionStatus } = useContext(TenantAuthContext);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getHistory({
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm || undefined,
      });
      if (res.status) {
        setTransactions(res.data);
        setTotalRows(res.meta?.total || 0);
        setStats(res.stats || null);
      } else {
        setError(res.message || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Failed to fetch subscription history', err);
      setError(err.response?.data?.message || 'Failed to fetch subscription history');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleCheckStatus = async (transaction) => {
    handleMenuClose();
    setCheckingStatusId(transaction.bulk_order_id);
    try {
      const res = await subscriptionApi.checkTransactionStatus(transaction.bulk_order_id);
      if (res.success) {
        notify.success(res.message || 'Transaction status updated', 'Success');
        fetchHistory();
        // Same reasoning as manage-subcription.jsx's handlePaymentSuccess —
        // the banner/Calendar tile read a separate context snapshot that
        // only refreshes on login otherwise.
        refreshSubscriptionStatus?.();
      } else {
        notify.error(res.message || 'Failed to check transaction status');
      }
    } catch (err) {
      console.error('Failed to check transaction status', err);
      notify.error(err.response?.data?.message || 'Failed to check transaction status');
    } finally {
      setCheckingStatusId(null);
    }
  };

  const handlePrintReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
    handleMenuClose();
  };

  // Stat-card row — same reusable StatCard used elsewhere in the app.
  // Sourced from the backend's `stats`, not the current page of
  // `transactions` — getHistory() is paginated server-side, so summing just
  // the visible rows would be misleading (e.g. "Total Paid: ₦500" because
  // only 10 of 200 transactions are on this page).
  const statCards = (
    <Grid container spacing={1.5} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats?.total ?? 0}
          label="Total Transactions"
          icon={IconFileInvoice}
          colorIndex={0}
          loading={loading && !stats}
          tooltip="Every payment attempt ever made for this school's subscriptions."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats?.approved ?? 0}
          label="Approved"
          icon={IconCircleCheck}
          colorIndex={1}
          loading={loading && !stats}
          tooltip="Transactions confirmed as paid by the gateway."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats?.pending ?? 0}
          label="Pending"
          icon={IconClock}
          colorIndex={3}
          loading={loading && !stats}
          tooltip="Transactions awaiting gateway confirmation."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={`₦${(stats?.total_paid ?? 0).toLocaleString()}`}
          label="Total Paid"
          icon={IconCash}
          colorIndex={2}
          loading={loading && !stats}
          tooltip="Sum of every approved transaction, all time."
        />
      </Grid>
    </Grid>
  );

  return (
    <>
      {statCards}
      <ParentCard title="">
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by transaction ID or description..."
            value={searchTerm}
            size="small"
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 360 } }}
          />
        </Box>

        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Transaction Id</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>
                    Payment Description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Amount (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Gateway (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Amount Due (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>Transaction Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(9)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width="80%" height={24} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <TableRow key={transaction.transaction_id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{transaction.transaction_id}</TableCell>
                      <TableCell>{transaction.payment_description}</TableCell>
                      <TableCell>{parseFloat(transaction.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{parseFloat(transaction.gateway_charges || 0).toLocaleString()}</TableCell>
                      <TableCell>{parseFloat(transaction.amount_due || transaction.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        {checkingStatusId === transaction.bulk_order_id ? (
                          <Chip
                            icon={<CircularProgress size={12} sx={{ color: 'inherit' }} />}
                            label="CHECKING..."
                            size="small"
                            sx={{
                              bgcolor: (theme) => theme.palette.info.light,
                              color: (theme) => theme.palette.info.main,
                              borderRadius: '8px',
                            }}
                          />
                        ) : (
                          <Chip
                            label={(transaction.status || 'pending').toUpperCase()}
                            size="small"
                            color={getStatusColor(transaction.status)}
                            sx={{
                              bgcolor:
                                transaction.status === 'approved'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.warning.light,
                              color:
                                transaction.status === 'approved'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.warning.main,
                              borderRadius: '8px',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={checkingStatusId === transaction.bulk_order_id ? 'Checking status…' : ''}>
                          <span>
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, transaction)}
                              disabled={checkingStatusId === transaction.bulk_order_id}
                            >
                              {checkingStatusId === transaction.bulk_order_id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <MoreVertIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedTransaction?.transaction_id === transaction.transaction_id}
                          onClose={handleMenuClose}
                        >
                          {transaction.status !== 'approved' && (
                            <MenuItem onClick={() => handleCheckStatus(transaction)}>
                              <UpdateIcon fontSize="small" sx={{ mr: 1 }} />
                              Check Status
                            </MenuItem>
                          )}
                          {transaction.status === 'approved' && (
                            <MenuItem onClick={() => handlePrintReceipt(transaction)}>
                              <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                              Print Receipt
                            </MenuItem>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        transaction={selectedTransaction}
      />
      </ParentCard>
    </>
  );
};

export default SubscriptionHistory;
