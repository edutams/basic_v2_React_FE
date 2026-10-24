import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Skeleton,
} from '@mui/material';

import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';

import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconCheck,
  IconX,
  IconBuildingBank,
  IconClock,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import ParentCard from '@/components/shared/ParentCard';
import PaymentNameModal from '@/components/tenant/bursary/PaymentNameModal';

import {
  fetchPaymentNames,
  createPaymentName,
  updatePaymentName,
  togglePaymentNameStatus,
} from '@/api/tenant/bursary/paymentNameApi';
import ReusableModal from '@/components/shared/ReusableModal';

/** Compulsory/Optional badge — pale blue for Compulsory, pale amber for
 * Optional, matching the reference design's "Requirement" column. */
const RequirementBadge = ({ value }) => {
  const isOptional = String(value).toUpperCase() === 'OPTIONAL';
  return (
    <Chip
      label={isOptional ? 'Optional' : 'Compulsory'}
      size="small"
      sx={{
        bgcolor: isOptional ? '#FEF3C7' : '#DBEAFE',
        color: isOptional ? '#92400E' : '#1D4ED8',
        fontWeight: 600,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

/** Parent/School badge for the Fee Bearer column. */
const FeeBearerBadge = ({ value }) => {
  const isParent = value === 'client';
  return (
    <Chip
      label={isParent ? 'Parent' : 'School'}
      size="small"
      sx={{
        bgcolor: isParent ? '#DCFCE7' : '#DBEAFE',
        color: isParent ? '#15803D' : '#1D4ED8',
        fontWeight: 600,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

/** Compact Active/Inactive pill with a colored dot, matching the
 * reference design's Status column. */
const StatusPill = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        px: 1.2,
        py: 0.4,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: isActive ? '#DCFCE7' : '#FEE2E2',
        color: isActive ? '#15803D' : '#B91C1C',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: isActive ? '#16A34A' : '#DC2626',
        }}
      />
      {isActive ? 'Active' : 'Inactive'}
    </Box>
  );
};

/** Verified/Unverified pill shown under a settlement account's details.
 * "Verified" reflects real data — account_name is only ever populated once
 * the account was successfully resolved against the bank's own API (see
 * PaymentNameController::resolveAccountName); a blank account_name is a
 * genuine unverified legacy account, not an omitted field. */
const VerifiedIndicator = ({ verified }) => (
  <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: verified ? 'success.main' : 'grey.400',
      }}
    />
    <Typography
      variant="caption"
      sx={{ color: verified ? 'success.main' : 'text.disabled', fontWeight: 600 }}
    >
      {verified ? 'Verified' : 'Unverified'}
    </Typography>
  </Box>
);

/** Masks a real account number as "first4 •••• last2", never fabricated —
 * purely a display transform of the real stored value. */
const maskAccountNumber = (num) => {
  if (!num) return '—';
  const digits = String(num);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 4)} •••• ${digits.slice(-2)}`;
};

/** Small labeled filter field — caption label above a compact select,
 * matching the reference design's filter toolbar. */
const FilterField = ({ label, children, sx }) => (
  <Box sx={{ minWidth: 140, ...sx }}>
    <Typography
      variant="caption"
      sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary' }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

const SettlementAccountCell = ({ payment }) => (
  <Box display="flex" alignItems="flex-start" gap={1}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '8px',
        bgcolor: payment.account_name ? '#DCFCE7' : 'grey.200',
        color: payment.account_name ? '#16A34A' : 'text.disabled',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      <IconBuildingBank size={15} />
    </Box>
    <Box minWidth={0}>
      <Typography variant="body2" fontWeight={700} noWrap>
        {payment.bank_name?.toUpperCase() || 'N/A'}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {maskAccountNumber(payment.account_number)}
      </Typography>
      <VerifiedIndicator verified={Boolean(payment.account_name)} />
    </Box>
  </Box>
);

/** Settlement-account summary row, shared between the right-column card
 * and its "View All" modal so the two stay in sync. */
const SettlementAccountRow = ({ account, index, onClick }) => (
  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onClick(account)}>
    <TableCell>{index + 1}</TableCell>
    <TableCell>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: '#DBEAFE',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBuildingBank size={16} />
        </Box>
        <Box minWidth={0}>
          <Typography variant="caption" fontWeight={700} display="block" noWrap>
            {account.bank_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {maskAccountNumber(account.account_number)}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell align="center">{account.item_count}</TableCell>
    <TableCell>
      <Chip
        label={account.verified ? 'Verified' : 'Unverified'}
        size="small"
        sx={{
          bgcolor: account.verified ? '#DCFCE7' : 'grey.200',
          color: account.verified ? '#15803D' : 'text.secondary',
          fontWeight: 600,
          fontSize: 10,
          height: 20,
        }}
      />
    </TableCell>
    <TableCell align="center">
      <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
    </TableCell>
  </TableRow>
);

const PaymentNameTab = ({ showSnackbar, onStatsRefresh, autoOpenAdd, defaultPayOption, stats }) => {
  const [paymentNames, setPaymentNames] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState({ open: false, payment: null });
  const [currentTab, setCurrentTab] = useState('bursary'); // 'bursary' or 'admission'
  const [showBanner, setShowBanner] = useState(true);
  const [viewAllAccountsOpen, setViewAllAccountsOpen] = useState(false);

  // Filters
  const [payOptionFilter, setPayOptionFilter] = useState('');
  const [settlementAccountFilter, setSettlementAccountFilter] = useState('');
  const [feeBearerFilter, setFeeBearerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setPayOptionFilter('');
    setSettlementAccountFilter('');
    setFeeBearerFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const loadPaymentNames = async (pg = 1, search = '', per_page = 10) => {
    setLoading(true);
    try {
      const res = await fetchPaymentNames({
        page: pg,
        search,
        per_page,
        pay_type: currentTab,
        pay_option: payOptionFilter || undefined,
        fee_bearer: feeBearerFilter || undefined,
        status: statusFilter || undefined,
        settlement_account: settlementAccountFilter || undefined,
      });
      setPaymentNames(res.data?.data || []);
      setMeta(res.data);
    } catch {
      showSnackbar?.('Failed to load payment names', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search-as-you-type, matching the reference's single search
  // box with no separate "Search" button.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    loadPaymentNames(page + 1, searchQuery, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    searchQuery,
    rowsPerPage,
    currentTab,
    payOptionFilter,
    feeBearerFilter,
    statusFilter,
    settlementAccountFilter,
  ]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setModalOpen(true);
  };

  // Lets a link from elsewhere (e.g. "no optional payments set up yet")
  // land here with the Add modal already open and the right type preselected,
  // instead of the admin having to find "Add New" and the dropdown themselves.
  useEffect(() => {
    if (autoOpenAdd) {
      handleAddPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAdd]);

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setModalOpen(true);
    setMenuAnchor(null);
  };

  const handleFilterAccountClick = (account) => {
    setSettlementAccountFilter(account.key);
    setPage(0);
  };

  const hasFilters = Boolean(
    searchQuery || payOptionFilter || settlementAccountFilter || feeBearerFilter || statusFilter,
  );

  const settlementAccountList = stats?.settlement_account_list || [];
  const recentUpdate = stats?.recent_update;

  return (
    <>
      {/* Tabs for Bursary/Admission + Add Payment Item — a white bar so the
       * tabs read as a distinct control group instead of floating directly
       * on the grey page background. */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: '#E5E7EB',
          borderRadius: '14px',
          px: 2,
          pt: 0.5,
          mb: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
            },
          }}
        >
          <Tab label="Bursary Payments" value="bursary" />
          <Tab label="Admission Payments" value="admission" />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={handleAddPayment}
          sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2, mb: 1 }}
        >
          Add Payment Item
        </Button>
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        {/* Left column: banner, filters, main table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ParentCard sx={{ '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}>
            {showBanner && (
              <Alert
                icon={<InfoOutlinedIcon fontSize="small" />}
                severity="info"
                onClose={() => setShowBanner(false)}
                sx={{
                  mb: 2,
                  bgcolor: '#DBEAFE',
                  color: 'text.primary',
                  fontWeight: 600,
                  '& .MuiAlert-message': { fontWeight: 600 },
                  '& .MuiAlert-icon': { color: 'primary.main' },
                }}
              >
                Each payment item is linked to a specific settlement account. All payments for that
                item will be routed to the assigned account.
              </Alert>
            )}

            <Box display="flex" gap={1} alignItems="flex-end" flexWrap="wrap" mb={2}>
              <TextField
                placeholder="Search payment items..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 160 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FilterField label="Pay Option" sx={{ minWidth: 110 }}>
                <TextField
                  select
                  size="small"
                  value={payOptionFilter}
                  onChange={(e) => {
                    setPayOptionFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: 110 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="compulsory">Compulsory</MenuItem>
                  <MenuItem value="optional">Optional</MenuItem>
                </TextField>
              </FilterField>
              <FilterField label="Settlement Account" sx={{ minWidth: 150 }}>
                <TextField
                  select
                  size="small"
                  value={settlementAccountFilter}
                  onChange={(e) => {
                    setSettlementAccountFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: 150 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All Accounts</MenuItem>
                  {settlementAccountList.map((acc) => (
                    <MenuItem key={acc.key} value={acc.key}>
                      {acc.bank_name}
                    </MenuItem>
                  ))}
                </TextField>
              </FilterField>
              <FilterField label="Fee Bearer" sx={{ minWidth: 100 }}>
                <TextField
                  select
                  size="small"
                  value={feeBearerFilter}
                  onChange={(e) => {
                    setFeeBearerFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: 100 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="client">Parent</MenuItem>
                  <MenuItem value="merchant">School</MenuItem>
                </TextField>
              </FilterField>
              <FilterField label="Status" sx={{ minWidth: 100 }}>
                <TextField
                  select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: 100 }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </FilterField>
              {hasFilters && (
                <Button variant="text" size="small" onClick={resetFilters} sx={{ height: 40 }}>
                  Clear Filters
                </Button>
              )}
            </Box>

            <TableContainer variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Item</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Requirement</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Settlement Account</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Bearer</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 70 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton variant="text" width={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={140} height={20} />
                        </TableCell>
                        <TableCell>
                          <Skeleton
                            variant="rounded"
                            width={70}
                            height={22}
                            sx={{ borderRadius: '12px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={140} height={36} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={90} height={20} />
                        </TableCell>
                        <TableCell align="center">
                          <Skeleton
                            variant="rounded"
                            width={60}
                            height={22}
                            sx={{ borderRadius: '12px', mx: 'auto' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paymentNames.length === 0 ? (
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

                        {/* Payment Item — application_stage (real data,
                         * admission payments only) shown as a secondary
                         * line instead of a fabricated description. */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {payment.name}
                          </Typography>
                          {payment.application_stage && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {payment.application_stage === 'pre-application'
                                ? 'Pre-application'
                                : 'Post-application'}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <RequirementBadge value={payment.pay_option} />
                        </TableCell>

                        <TableCell>
                          <SettlementAccountCell payment={payment} />
                        </TableCell>

                        <TableCell>
                          <FeeBearerBadge value={payment.fee_bearer} />
                        </TableCell>

                        <TableCell align="center">
                          <StatusPill status={payment.status} />
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
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 20, 25]}
              component="div"
              count={meta?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelDisplayedRows={({ from, to, count }) =>
                `Showing ${from} - ${to} of ${count !== -1 ? count : to}`
              }
              sx={{
                '& .MuiTablePagination-toolbar': { minHeight: 40, pl: 0, pr: 0 },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: 12,
                  mb: 0,
                },
              }}
            />
          </ParentCard>
        </Grid>

        {/* Right column: Recent Update + Payment Items by Settlement
         * Account. Both are deliberately unscoped across both payment
         * types (bursary + admission), since a settlement account and the
         * audit trail both span pay types rather than belonging to one tab. */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <ParentCard sx={{ '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1.25}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: '#DBEAFE',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconClock size={16} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Recent Update
                  </Typography>
                </Box>
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </Box>

              {recentUpdate ? (
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box display="flex" gap={1} minWidth={0}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        bgcolor: '#F3E8FF',
                        color: '#9333EA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconEdit size={15} />
                    </Box>
                    <Box minWidth={0}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {recentUpdate.item_name || 'Payment item'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {recentUpdate.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {dayjs(recentUpdate.created_at).format('MMM D, YYYY h:mm A')}
                    </Typography>
                    {recentUpdate.causer_name && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        by {recentUpdate.causer_name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent updates yet.
                </Typography>
              )}
            </ParentCard>

            <ParentCard sx={{ '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1.25}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: '#DBEAFE',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBuildingBank size={16} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 14 }}>
                    Payment Items by Settlement Account
                  </Typography>
                </Box>
                {settlementAccountList.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setViewAllAccountsOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                  >
                    View All
                  </Button>
                )}
              </Box>
              <Table size="small" sx={{ tableLayout: 'fixed', '& .MuiTableCell-root': { px: 1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '8%' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '50%' }}>Account</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: '14%' }}>
                      Items
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '20%' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: '8%' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settlementAccountList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No settlement accounts yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    settlementAccountList
                      .slice(0, 8)
                      .map((acc, idx) => (
                        <SettlementAccountRow
                          key={acc.key}
                          account={acc}
                          index={idx}
                          onClick={handleFilterAccountClick}
                        />
                      ))
                  )}
                </TableBody>
              </Table>
            </ParentCard>
          </Stack>
        </Grid>
      </Grid>

      <ReusableModal
        open={viewAllAccountsOpen}
        onClose={() => setViewAllAccountsOpen(false)}
        title="All Settlement Accounts"
        size="medium"
        showCloseButton
        showDivider
      >
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '8%' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '50%' }}>Settlement Account</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: '14%' }}>
                Items
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: '20%' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: '8%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {settlementAccountList.map((acc, idx) => (
              <SettlementAccountRow
                key={acc.key}
                account={acc}
                index={idx}
                onClick={(account) => {
                  handleFilterAccountClick(account);
                  setViewAllAccountsOpen(false);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </ReusableModal>

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
          <ListItemIcon>
            {selectedPayment?.status === 'active' ? <IconX size={18} /> : <IconCheck size={18} />}
          </ListItemIcon>
          <ListItemText>
            {selectedPayment?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedPayment) handleEditPayment(selectedPayment);
          }}
        >
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Payment</ListItemText>
        </MenuItem>
      </Menu>

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
            <Button
              variant="contained"
              size="small"
              onClick={() => setConfirmStatusModal({ open: false, payment: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              size="small"
              color={confirmStatusModal.payment?.status === 'active' ? 'error' : 'success'}
              onClick={handleToggleStatus}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Updating...'
                : confirmStatusModal.payment?.status === 'active'
                  ? 'Deactivate'
                  : 'Activate'}
            </Button>
          </Stack>
        </Stack>
      </ReusableModal>

      <PaymentNameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePayment}
        paymentName={editingPayment}
        defaultPayOption={!editingPayment ? defaultPayOption : undefined}
        defaultPayType={!editingPayment ? currentTab : undefined}
      />
    </>
  );
};

export default PaymentNameTab;
