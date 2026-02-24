import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
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
  Menu,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import SubcriptionModal from '../../components/subcription/SubcriptionModal';
import UpgradePlanModal from '../../components/subcription/UpgradePlanModal';
import TransactionModal from '../../components/subcription/TransactionModal';
import InvoiceModal from '../../components/subcription/InvoiceModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import useNotification from 'src/hooks/useNotification';
import tenantApi from 'src/api/tenant_api';

const DUMMY_ROWS = [
  {
    id: 1,
    sessionterm: '2023/2024 - First Term',
    plandetails: 'OBASIC++ (200 and above Students)',
    amount: '155,000',
    gatewaycharges: '500',
    discount: '0',
    amountdue: '155,500',
    status: 'inactive',
  },
  {
    id: 2,
    sessionterm: '2023/2024 - First Term',
    plandetails: 'OBASIC++ (200 and above Students)',
    amount: '155,000',
    gatewaycharges: '500',
    discount: '0',
    amountdue: '155,500',
    status: 'active',
  },
  {
    id: 3,
    sessionterm: '2023/2024 - First Term',
    plandetails: 'OBASIC++ (200 and above Students)',
    amount: '155,000',
    gatewaycharges: '500',
    discount: '0',
    amountdue: '155,500',
    status: 'active',
  },
];

const ManageSubscriptions = () => {
  return (
    <ManageSubscriptionList />
  );
};

const ManageSubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const notify = useNotification();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await tenantApi.get('/subscription-status');
      // For now, status endpoint returns current subscription. 
      // If we want history, we might need another endpoint, but let's adapt to what we have.
      if (res.data.data) {
        setRows([res.data.data]);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      notify.error('Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredRows = rows.filter((row) =>
    row.sessionterm.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAddClick = () => {
    setSelectedRow(null);
    setModalType('create');
    setModalOpen(true);
  };

  const handleEditClick = (row) => {
    const sessionTermParts = row.sessionterm ? row.sessionterm.split(' - ') : ['', ''];
    const session = sessionTermParts[0] || '';
    const term = sessionTermParts[1] || '';

    const planDetails = row.plandetails || '';
    const planMatch = planDetails.match(/^(OBASIC\+*)\s*\(([^)]+)\)/);
    const availableplan = planMatch ? planMatch[1] : '';
    const studentpopulation = planMatch ? planMatch[2] : '';

    const subscriptionMode = term ? 'perTerm' : 'perSession';

    const transformedRow = {
      ...row,
      session,
      term,
      availableplan,
      studentpopulation,
      subscriptionMode,
    };

    setSelectedRow(transformedRow);
    setModalType('update');
    setModalOpen(true);
  };

  const handleUpgradePlanClick = (row) => {
    setSelectedRow(row);
    setUpgradeModalOpen(true);
    handleMenuClose();
  };

  const handleViewTransactionClick = (row) => {
    setSelectedRow(row);
    setTransactionModalOpen(true);
    handleMenuClose();
  };

  const handleViewInvoiceClick = (row) => {
    setSelectedRow(row);
    setInvoiceModalOpen(true);
    handleMenuClose();
  };

  const handleRevertPlanClick = (row) => {
    // Handle revert plan action
    console.log('Revert plan for:', row);
    handleMenuClose();
  };

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        const payload = {
          agent_plan_id: data.availableplan,
          session_id: data.session,
          term_id: data.term,
          subscription_mode: data.subscriptionMode === 'perSession' ? 'online' : 'online', // adapt as needed
        };
        
        await tenantApi.post('/subscribe', payload);
        notify.success('Subscription plan successfully initiated', 'Success');
        fetchSubscriptions();
      } else if (modalType === 'update') {
        // Handle update if implemented on backend
        notify.success('Subscription plan updated successfully', 'Success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error submitting subscription:', error);
      notify.error(error.response?.data?.message || 'Failed to initiate subscription');
    }
  };

  const handleUpgradeSubmit = (upgradedData) => {
    setRows((prev) => prev.map((row) => (row.id === upgradedData.id ? upgradedData : row)));
    notify.success('Plan upgraded successfully', 'Success');
    setUpgradeModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    setRows((prev) => prev.filter((row) => row.id !== rowToDelete.id));
    setConfirmOpen(false);
    setRowToDelete(null);
    notify.success('Subcription plan deleted successfully', 'Success');
  };

  const handleSimulationUpdate = (data, action) => {
    if (action === 'create') {
    } else if (action === 'update') {
    } else if (action === 'delete') {
    }
  };

  return (
    <>
      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Manage Subcription</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddClick}
              sx={{
                minWidth: 120,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              Add New Subcription
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Search by session term..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '5%' }}>#</TableCell>
                    <TableCell sx={{ width: '18%' }}>Session/Term</TableCell>
                    <TableCell sx={{ width: '20%' }}>Plan Details</TableCell>
                    <TableCell sx={{ width: '12%' }}> Amount (₦)</TableCell>
                    <TableCell sx={{ width: '11%' }}>Gateway charges(₦)</TableCell>
                    <TableCell sx={{ width: '10%' }}>Discount (%)</TableCell>
                    <TableCell sx={{ width: '10%' }}>Amount Due (₦)</TableCell>
                    <TableCell sx={{ width: '10%' }}>Status</TableCell>
                    <TableCell sx={{ width: '5%' }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {row.sessions?.sesname} / {row.terms?.term_name}
                        </TableCell>
                        <TableCell>
                          {row.my_plans?.display_name} ({row.plans?.description})
                        </TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>{row.discount}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor:
                                row.status === 'active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                              color:
                                row.status === 'active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            {row.status === 'pending' ? (
                              <>
                                <MenuItem onClick={() => handleRevertPlanClick(row)}>
                                  Revert Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleUpgradePlanClick(row)}>
                                  Change Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleViewTransactionClick(row)}>
                                  View Transaction
                                </MenuItem>
                                <MenuItem onClick={() => handleViewInvoiceClick(row)}>
                                  View Invoice
                                </MenuItem>
                                <MenuItem onClick={() => handleDeleteClick(row)}>
                                  Delete Subscription
                                </MenuItem>
                              </>
                            ) : (
                              <>
                                <MenuItem onClick={() => handleUpgradePlanClick(row)}>
                                  Upgrade Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleViewTransactionClick(row)}>
                                  View Transaction
                                </MenuItem>
                                <MenuItem onClick={() => handleViewInvoiceClick(row)}>
                                  View Invoice
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
                        <Alert
                          severity="info"
                          sx={{
                            mb: 3,
                            width: '100%',
                            justifyContent: 'center',
                            textAlign: 'center',
                            '& .MuiAlert-icon': {
                              mr: 1.5,
                            },
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            No records found
                          </Typography>
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      colSpan={9}
                      count={filteredRows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      sx={{
                        '& .MuiTablePagination-actions': {
                          marginLeft: 'auto',
                        },
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </ParentCard>
      <SubcriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalType}
        selectedSimulation={selectedRow}
        onSimulationUpdate={handleModalSubmit}
      />
      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        selectedRow={selectedRow}
        onUpgrade={handleUpgradeSubmit}
      />
      <TransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        selectedRow={selectedRow}
      />
      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        selectedRow={selectedRow}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subcription plan"
        message={`Are you sure you want to delete "${rowToDelete?.sessionterm}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
};

export default ManageSubscriptions;
