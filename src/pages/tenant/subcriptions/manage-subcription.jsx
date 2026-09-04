import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Undo as UndoIcon,
  Upgrade as UpgradeIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconFileInvoice, IconCircleCheck, IconClock, IconCash } from '@tabler/icons-react';

import ParentCard from '@/components/shared/ParentCard';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import StatCard from '@/components/shared/StatCard';
import useNotification from '@/hooks/useNotification';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import InvoiceModal from '@/components/shared/subcription/InvoiceModal';
import SubcriptionModal from '@/components/shared/subcription/SubcriptionModal';
import TransactionModal from '@/components/shared/subcription/TransactionModal';
import UpgradePlanModal from '@/components/shared/subcription/UpgradePlanModal';
import RevertPlanModal from '@/components/shared/subcription/RevertPlanModal';
import SubscriptionPaymentModal from '@/components/shared/subcription/SubscriptionPaymentModal';
import SubscriptionBulkPaymentModal from '@/components/shared/subcription/SubscriptionBulkPaymentModal';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const ManageSubscriptions = () => {
  return <ManageSubscriptionList />;
};

const ManageSubscriptionList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [rowToPay, setRowToPay] = useState(null);
  const [bulkPaymentModalOpen, setBulkPaymentModalOpen] = useState(false);
  const [sessionToPay, setSessionToPay] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeSessionTerm, setActiveSessionTerm] = useState(null);
  const [subscriptionCharges, setSubscriptionCharges] = useState('10');
  const notify = useNotification();
  const { refreshSubscriptionStatus } = useContext(TenantAuthContext);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getSubscriptions({ search: searchTerm });
      if (res.data) {
        setRows(Array.isArray(res.data) ? res.data : [res.data]);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      notify.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    const loadActiveSessionTerm = async () => {
      try {
        const res = await fetchActiveTenantSessionTerm();
        setActiveSessionTerm(res?.data || null);
      } catch (error) {
        console.error('Failed to fetch active session term:', error);
      }
    };
    loadActiveSessionTerm();
  }, []);

  useEffect(() => {
    const loadSubscriptionCharges = async () => {
      try {
        const res = await subscriptionApi.getSubscriptionCharges();
        setSubscriptionCharges(res?.data?.subscription_charges || '500');
      } catch (error) {
        console.error('Failed to fetch subscription charges:', error);
      }
    };
    loadSubscriptionCharges();
  }, []);

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Stat-card row — same reusable StatCard used elsewhere in the app
  // (handles its own skeleton via the `loading` prop). Computed from `rows`
  // directly since getAllSubscription isn't paginated server-side — `rows`
  // already is the full search-filtered set, not just the current page.
  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'active').length;
    const pending = rows.filter((r) => r.status === 'pending').length;
    const chargesNum = parseFloat(subscriptionCharges) || 0;
    const amountDue = rows
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => {
        const amountNum = parseFloat(r.amount) || 0;
        const discountNum = parseFloat(r.discount) || 0;
        return sum + (amountNum - (amountNum * discountNum) / 100) + chargesNum;
      }, 0);
    return { total, active, pending, amountDue };
  }, [rows, subscriptionCharges]);

  const statCards = (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.total}
          label="Total Subscriptions"
          icon={IconFileInvoice}
          colorIndex={0}
          loading={loading}
          tooltip="Every subscription this school has ever created, across all sessions."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.active}
          label="Active"
          icon={IconCircleCheck}
          colorIndex={1}
          loading={loading}
          tooltip="Subscriptions that are fully paid and in effect."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.pending}
          label="Pending Payment"
          icon={IconClock}
          colorIndex={3}
          loading={loading}
          tooltip="Subscriptions created but not yet paid for."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={`₦${stats.amountDue.toLocaleString()}`}
          label="Amount Due"
          icon={IconCash}
          colorIndex={4}
          loading={loading}
          tooltip="Total still owed across every pending subscription."
        />
      </Grid>
    </Grid>
  );

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
    const subscriptionMode = row.subscription_mode === 'per_session' ? 'perSession' : 'perTerm';

    const transformedRow = {
      ...row,
      session: row.session_id?.toString() || '',
      term: row.term_id?.toString() || '',
      availableplan: row.agent_plan_id?.toString() || '',
      subscriptionMode,
    };

    setSelectedRow(transformedRow);
    setModalType('update');
    setModalOpen(true);
  };

  const handleUpgradePlanClick = (row) => {
    setSelectedRow(row);
    setAnchorEl(null);
    setUpgradeModalOpen(true);
  };

  const handleViewTransactionClick = (row) => {
    setSelectedRow(row);
    setTransactionModalOpen(true);
    // Not handleMenuClose() — that also clears selectedRow, which the modal
    // needs. Just close the menu itself (anchorEl); same fix as
    // handleUpgradePlanClick/handleRevertPlanClick below.
    setAnchorEl(null);
  };

  const handleViewInvoiceClick = (row) => {
    setSelectedRow(row);
    setInvoiceModalOpen(true);
    setAnchorEl(null);
  };

  const handleRevertPlanClick = (row) => {
    setSelectedRow(row);
    setAnchorEl(null);
    setRevertModalOpen(true);
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
          plan_id: data.availableplan,
          session_id: data.session,
          term_id: data.term || null,
          subscription_mode: data.subscriptionMode,
        };

        await subscriptionApi.createSubscription(payload);
        notify.success('Subscription plan successfully initiated', 'Success');
        fetchSubscriptions();
      } else if (modalType === 'update') {
        const payload = {
          plan_id: data.availableplan,
          session_id: data.session,
          term_id: data.term || null,
          subscription_mode: data.subscriptionMode,
        };

        await subscriptionApi.updateSubscription(selectedRow.id, payload);
        notify.success('Subscription plan updated successfully', 'Success');
        fetchSubscriptions();
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error submitting subscription:', error);
      notify.error(error.response?.data?.message || 'Failed to initiate subscription');
    }
  };

  const handleUpgradeSubmit = (upgradedData) => {
    fetchSubscriptions();
    notify.success('Plan upgraded successfully', 'Success');
    setUpgradeModalOpen(false);
  };

  const handleRevertSubmit = (revertedData) => {
    fetchSubscriptions();
    notify.success('Plan reverted successfully', 'Success');
    setRevertModalOpen(false);
  };

  const handlePayNow = (row) => {
    setRowToPay(row);
    setPaymentModalOpen(true);
  };

  const handlePayFullSession = (row) => {
    setSessionToPay({ id: row.session_id, name: row.sessions?.session_name });
    setBulkPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchSubscriptions();
    // The banner/Calendar tile read from a separate, context-level snapshot
    // of the tier (not refetched on every page) — without this, they'd keep
    // showing the pre-payment tier until the next login/page reload.
    refreshSubscriptionStatus?.();
  };

  const handleDeleteConfirm = async () => {
    try {
      await subscriptionApi.deleteSubscription(rowToDelete.id);
      setRows((prev) => prev.filter((row) => row.id !== rowToDelete.id));
      notify.success('Subscription plan deleted successfully', 'Success');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      notify.error('Failed to delete subscription');
    }
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  return (
    <>
      {statCards}
      <ParentCard
        title={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="h5"></Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                placeholder="Search by session term..."
                value={searchInput}
                size="small"
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => fetchSubscriptions(searchTerm)}
              >
                Search
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                disabled={loading}
              >
                {loading ? (
                  <Skeleton width={140} height={20} animation="wave" />
                ) : (
                  'Add New Subscription'
                )}
              </Button>
            </Box>
          </Box>
        }
        sx={{ px: 0, py: 0, '& .MuiCardContent-root': { px: 3, py: 0 } }}
      >
        <Box sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              stickyHeader
              sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%', fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ width: '16%', fontWeight: 700 }}>Session/Term</TableCell>
                  <TableCell sx={{ width: '18%', fontWeight: 700 }}>Plan Details</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 700 }}>Amount (₦)</TableCell>
                  <TableCell sx={{ width: '9%', fontWeight: 700 }}>Gateway charges(₦)</TableCell>
                  <TableCell sx={{ width: '8%', fontWeight: 700 }}>Discount (%)</TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 700 }}>Amount Due (₦)</TableCell>
                  <TableCell sx={{ width: '8%', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ width: '5%', fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton variant="text" width={20} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={140} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={180} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={60} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={50} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={24}
                          sx={{ borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton variant="circular" width={32} height={32} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => {
                    const planData = row.plans?.data
                      ? typeof row.plans.data === 'string'
                        ? JSON.parse(row.plans.data)
                        : row.plans.data
                      : {};
                    const studentsLimit = planData.students_limit || 'N/A';
                    const amountNum = parseFloat(row.amount) || 0;
                    const discountNum = parseFloat(row.discount) || 0;
                    const chargesNum = parseFloat(subscriptionCharges) || 0;
                    const amountAfterDiscount = amountNum - (amountNum * discountNum) / 100;
                    const amountDue = amountAfterDiscount + chargesNum;
                    const isActiveSessionTerm =
                      activeSessionTerm &&
                      row.session_id == activeSessionTerm.session_id &&
                      row.term_id == activeSessionTerm.term_id;

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {row.sessions?.session_name} / {row.terms?.term_name}
                        </TableCell>
                        <TableCell>
                          {row.my_plans?.display_name} ({studentsLimit} Students)
                        </TableCell>
                        <TableCell>₦{amountNum.toLocaleString()}</TableCell>
                        <TableCell>₦{chargesNum.toLocaleString()}</TableCell>
                        <TableCell>{discountNum}%</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₦{amountDue.toLocaleString()}
                          </Typography>
                          {row.status === 'pending' &&
                            amountAfterDiscount > 0 &&
                            (row.subscription_mode === 'per_session' ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handlePayFullSession(row)}
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.7rem',
                                  textTransform: 'none',
                                  minWidth: 'auto',
                                  px: 1,
                                }}
                              >
                                Pay Full Session
                              </Button>
                            ) : (
                              isActiveSessionTerm && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handlePayNow(row)}
                                  sx={{
                                    mt: 0.5,
                                    fontSize: '0.7rem',
                                    textTransform: 'none',
                                    minWidth: 'auto',
                                    px: 1,
                                  }}
                                >
                                  Pay Now
                                </Button>
                              )
                            ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              bgcolor:
                                row.status === 'active'
                                  ? 'success.light'
                                  : row.status === 'pending'
                                    ? 'warning.light'
                                    : 'error.light',
                              color:
                                row.status === 'active'
                                  ? 'success.dark'
                                  : row.status === 'pending'
                                    ? 'warning.dark'
                                    : 'error.dark',
                              fontWeight: 600,
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
                                  <UndoIcon fontSize="small" sx={{ mr: 1 }} />
                                  Revert Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleUpgradePlanClick(row)}>
                                  <AddIcon fontSize="small" sx={{ mr: 1 }} />
                                  Change Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleViewTransactionClick(row)}>
                                  <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
                                  View Transaction
                                </MenuItem>
                                <MenuItem onClick={() => handleViewInvoiceClick(row)}>
                                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                                  View Invoice
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleDeleteClick(row)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                  Delete Subscription
                                </MenuItem>
                              </>
                            ) : (
                              <>
                                <MenuItem onClick={() => handleUpgradePlanClick(row)}>
                                  <UpgradeIcon fontSize="small" sx={{ mr: 1 }} />
                                  Upgrade Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleRevertPlanClick(row)}>
                                  <UndoIcon fontSize="small" sx={{ mr: 1 }} />
                                  Revert Plan
                                </MenuItem>
                                <MenuItem onClick={() => handleViewTransactionClick(row)}>
                                  <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
                                  View Transaction
                                </MenuItem>
                                <MenuItem onClick={() => handleViewInvoiceClick(row)}>
                                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                                  View Invoice
                                </MenuItem>
                              </>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                    count={rows.length}
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
      <RevertPlanModal
        open={revertModalOpen}
        onClose={() => setRevertModalOpen(false)}
        selectedRow={selectedRow}
        onRevert={handleRevertSubmit}
      />
      <TransactionModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        selectedRow={selectedRow}
        onStatusChanged={() => {
          fetchSubscriptions();
          refreshSubscriptionStatus?.();
        }}
      />
      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        selectedRow={selectedRow}
        subscriptionCharges={subscriptionCharges}
        onExtended={() => {
          fetchSubscriptions();
          refreshSubscriptionStatus?.();
        }}
      />
      <SubscriptionPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setRowToPay(null);
        }}
        selectedRow={rowToPay}
        subscriptionCharges={subscriptionCharges}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <SubscriptionBulkPaymentModal
        open={bulkPaymentModalOpen}
        onClose={() => {
          setBulkPaymentModalOpen(false);
          setSessionToPay(null);
        }}
        sessionId={sessionToPay?.id}
        sessionName={sessionToPay?.name}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${rowToDelete?.my_plans?.display_name || 'this subscription'}" plan?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
};

export default ManageSubscriptions;
