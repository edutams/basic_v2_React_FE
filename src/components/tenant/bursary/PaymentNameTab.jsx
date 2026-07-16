import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  TextField,
  Stack,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import { IconPlus, IconDotsVertical, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import PaymentNameModal from '@/components/tenant/bursary/PaymentNameModal';

import {
  fetchPaymentNames,
  createPaymentName,
  updatePaymentName,
  togglePaymentNameStatus,
} from '@/api/tenant/bursary/paymentNameApi';
import ReusableModal from '@/components/shared/ReusableModal';

const PaymentNameTab = ({ showSnackbar, onStatsRefresh }) => {
  const [paymentNames, setPaymentNames] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState({ open: false, payment: null });
  const [currentTab, setCurrentTab] = useState('bursary'); // 'bursary' or 'admission'

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await updatePaymentName(editingPayment.id, paymentData);
        showSnackbar?.('Payment name updated successfully');
      } else {
        await createPaymentName(paymentData);
        showSnackbar?.('Payment name added successfully');
      }

      // Switch to the tab matching the payment type that was just saved
      if (paymentData.pay_type && paymentData.pay_type !== currentTab) {
        setCurrentTab(paymentData.pay_type);
      }

      setModalOpen(false);
      setEditingPayment(null);
      setPage(0);

      // Reload payment names for the appropriate tab
      await loadPaymentNames(1, searchQuery, rowsPerPage);
      onStatsRefresh?.();
    } catch (err) {
      showSnackbar?.(err?.response?.data?.message || 'Failed to save payment name', 'error');
    }
  };

  const handleToggleStatus = async () => {
    const payment = confirmStatusModal.payment;
    if (!payment) return;
    setActionLoading(true);
    try {
      const res = await togglePaymentNameStatus(payment.id);
      setPaymentNames((prev) => prev.map((p) => (p.id === payment.id ? res.data : p)));
      showSnackbar?.(
        `Payment name ${res.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      );
      onStatsRefresh?.();
      setConfirmStatusModal({ open: false, payment: null });
    } catch {
      showSnackbar?.('Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const loadPaymentNames = async (pg = 1, search = '', per_page = 10) => {
    setLoading(true);
    try {
      const res = await fetchPaymentNames({
        page: pg,
        search,
        per_page,
        pay_type: currentTab
      });
      setPaymentNames(res.data?.data || []);
      setMeta(res.data);
    } catch {
      showSnackbar?.('Failed to load payment names', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentNames(page + 1, searchQuery, rowsPerPage);
  }, [page, searchQuery, rowsPerPage, currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
    setSearchInput('');
    setSearchQuery('');
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setModalOpen(true);
    setMenuAnchor(null);
  };

  const hasFilters = searchQuery !== '';

  return (
    <>
      <Stack spacing={3}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Payment Name
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Every fee items a parent can pay for
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<IconPlus />}
                onClick={handleAddPayment}
                sx={{ fontWeight: 600 }}
              >
                Add New
              </Button>
            </Box>
          }
        >
          {/* Tabs for Bursary and Admission */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab
                label="Bursary Payments"
                value="bursary"
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
              <Tab
                label="Admission Payments"
                value="admission"
                sx={{ fontWeight: 600, textTransform: 'none' }}
              />
            </Tabs>
          </Box>

          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              placeholder="Search Payment Items"
              size="small"
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                if (value === '') {
                  setSearchQuery('');
                  setPage(0);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ minWidth: 100, width: { xs: '100%', sm: 'auto' } }}
            >
              Search
            </Button>
            {hasFilters && (
              <Button
                variant="contained"
                size="small"
                onClick={resetFilters}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow >
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {currentTab === 'bursary' ? 'Pay Option' : 'Application Stage'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Settlement Account</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fee Bearer</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentNames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 3,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': { mr: 1.5 },
                        }}
                      >
                        {hasFilters
                          ? 'No payment names found matching your search'
                          : `No ${currentTab} payment names added yet`}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentNames.map((payment, index) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{(meta?.from || 0) + index}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{payment.name}</TableCell>

                      {/* Pay Option or Application Stage */}
                      <TableCell>
                        {currentTab === 'bursary' ? (
                          <Chip
                            label={payment.pay_option?.toUpperCase() || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor:
                                payment.pay_option === 'OPTIONAL' ? 'warning.light' : 'primary.light',
                              color:
                                payment.pay_option === 'OPTIONAL' ? 'warning.dark' : 'primary.dark',
                              fontWeight: 600,
                              fontSize: 10,
                            }}
                          />
                        ) : (
                          <Chip
                            label={payment.application_stage?.replace('-', ' ').toUpperCase() || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor:
                                payment.application_stage === 'pre-application'
                                  ? 'info.light'
                                  : 'success.light',
                              color:
                                payment.application_stage === 'pre-application'
                                  ? 'info.dark'
                                  : 'success.dark',
                              fontWeight: 600,
                              fontSize: 10,
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Settlement Account */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {payment.bank_name?.toUpperCase() || 'N/A'}
                          </Typography>
                          <Chip
                            label={payment.account_number || '—'}
                            size="small"
                            sx={{ bgcolor: 'error.light', fontSize: 10 }}
                          />
                          <Typography variant="caption" display="block" color="textSecondary">
                            {payment.rev_code}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Fee Bearer */}
                      <TableCell>
                        <Chip
                          label={(payment.fee_bearer === 'client' ? 'Parent' : 'School').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              payment.fee_bearer === 'client' ? 'success.light' : 'warning.light',
                            color:
                              payment.fee_bearer === 'client' ? 'success.dark' : 'warning.dark',
                            fontWeight: 600,
                            fontSize: 10,
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center">
                        <Chip
                          label={payment.status === 'active' ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: payment.status === 'active' ? 'success.light' : 'error.light',
                            color: payment.status === 'active' ? 'success.dark' : 'error.dark',
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget);
                            setSelectedPayment(payment);
                          }}
                        >
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 15, 20, 25]}
                    count={meta?.total || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </ParentCard>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedPayment(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setConfirmStatusModal({ open: true, payment: selectedPayment });
            setMenuAnchor(null);
          }}
          sx={{ color: selectedPayment?.status === 'active' ? 'error.main' : 'success.main' }}
        >
          <ReusableModal
            open={confirmStatusModal.open}
            onClose={() => setConfirmStatusModal({ open: false, payment: null })}
            title={
              confirmStatusModal.payment?.status === 'active'
                ? 'Deactivate Payment Name'
                : 'Activate Payment Name'
            }
            size="small"
            showCloseButton
            showDivider
          >
            <Stack spacing={3}>
              <Typography variant="body2">
                Are you sure you want to{' '}
                <strong>
                  {confirmStatusModal.payment?.status === 'active' ? 'deactivate' : 'activate'}
                </strong>{' '}
                <strong>"{confirmStatusModal.payment?.name}"</strong>?
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="contained" size="small" onClick={() => setConfirmStatusModal({ open: false, payment: null })}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button size="small" color={confirmStatusModal.payment?.status === 'active' ? 'error' : 'success'} onClick={handleToggleStatus} disabled={actionLoading}>
                  {actionLoading
                    ? 'Updating...'
                    : confirmStatusModal.payment?.status === 'active'
                      ? 'Deactivate'
                      : 'Activate'}
                </Button>
              </Stack>
            </Stack>
          </ReusableModal>
        </MenuItem>
        <MenuItem onClick={() => selectedPayment && handleEditPayment(selectedPayment)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Payment</ListItemText>
        </MenuItem>
      </Menu>

      <PaymentNameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePayment}
        paymentName={editingPayment}
      />
    </>
  );
};

export default PaymentNameTab;
