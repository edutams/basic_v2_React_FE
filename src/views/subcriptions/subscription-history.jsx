import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';

import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import ReceiptModal from '../../components/subcription/ReceiptModal';

// Dummy transaction data
const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    transactionId: 'TXN-2024-001',
    paymentDescription: 'OBASIC++ Subscription - 2023/2024 First Term',
    amount: '155,000',
    gatewaycharges: '500',
    amountdue: '155,500',
    transactionDate: '2024-01-15',
    status: 'approved',
  },
  {
    id: 2,
    transactionId: 'TXN-2024-002',
    paymentDescription: 'Gateway Charges',
    amount: '500',
    gatewaycharges: '0',
    amountdue: '500',
    transactionDate: '2024-01-15',
    status: 'approved',
  },
  {
    id: 3,
    transactionId: 'TXN-2024-003',
    paymentDescription: 'OBASIC++ Subscription - 2023/2024 Second Term',
    amount: '205,000',
    gatewaycharges: '500',
    amountdue: '205,500',
    transactionDate: '2024-02-20',
    status: 'pending',
  },
  {
    id: 4,
    transactionId: 'TXN-2024-004',
    paymentDescription: 'Gateway Charges',
    amount: '500',
    gatewaycharges: '0',
    amountdue: '500',
    transactionDate: '2024-02-20',
    status: 'pending',
  },
  {
    id: 5,
    transactionId: 'TXN-2024-005',
    paymentDescription: 'OBASIC++ Subscription - 2023/2024 Third Term',
    amount: '205,000',
    gatewaycharges: '500',
    amountdue: '205,500',
    transactionDate: '2024-04-10',
    status: 'approved',
  },
  {
    id: 6,
    transactionId: 'TXN-2024-006',
    paymentDescription: 'Deployment/Training Fee',
    amount: '50,000',
    gatewaycharges: '0',
    amountdue: '50,000',
    transactionDate: '2024-04-10',
    status: 'approved',
  },
];

const SubscriptionHistory = () => {
  return (
    <SubscriptionHistoryList />
  );
};

const SubscriptionHistoryList = () => {
  const [transactions, setTransactions] = useState(DUMMY_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentDescription.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleUpdateStatus = (transaction) => {
    // Handle update status action
    console.log('Update status for:', transaction);
    handleMenuClose();
  };

  const handlePrintReceipt = (transaction) => {
    // Handle print receipt action
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
    handleMenuClose();
  };

  return (
    <ParentCard title="Subscription History">
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by transaction ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        <Paper variant="outlined">
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
                  <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>
                    Transaction Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>{transaction.paymentDescription}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.gatewaycharges}</TableCell>
                      <TableCell>{transaction.amountdue}</TableCell>
                      <TableCell>{transaction.transactionDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status.toUpperCase()}
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
                          {transaction.status === 'pending' ? (
                            <>
                              <MenuItem onClick={() => handleUpdateStatus(transaction)}>
                                Update Status
                              </MenuItem>
                            </>
                          ) : (
                            <>
                              <MenuItem onClick={() => handleUpdateStatus(transaction)}>
                                Update Status
                              </MenuItem>
                              <MenuItem onClick={() => handlePrintReceipt(transaction)}>
                                Print Receipt
                              </MenuItem>
                            </>
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
