import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';

import ParentCard from '@/components/shared/ParentCard';
import ReceiptModal from '@/components/shared/subcription/ReceiptModal';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';

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

  const handleUpdateStatus = (transaction) => {
    handleMenuClose();
  };

  const handlePrintReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
    handleMenuClose();
  };

  return (
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
                    <TableRow key={transaction.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{transaction.transaction_id}</TableCell>
                      <TableCell>{transaction.payment_description}</TableCell>
                      <TableCell>{parseFloat(transaction.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{parseFloat(transaction.gateway_charges || 0).toLocaleString()}</TableCell>
                      <TableCell>{parseFloat(transaction.amount_due || transaction.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => handleMenuOpen(e, transaction)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedTransaction?.id === transaction.id}
                          onClose={handleMenuClose}
                        >
                          {transaction.status !== 'approved' && (
                            <MenuItem onClick={() => handleUpdateStatus(transaction)}>
                              <UpdateIcon fontSize="small" sx={{ mr: 1 }} />
                              Update Status
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
  );
};

export default SubscriptionHistory;
