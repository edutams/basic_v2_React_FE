import { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  Skeleton,
  Tooltip,
  Stack,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
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
  Article as ArticleIcon,
  Layers as LayersIcon,
  AccessTime as AccessTimeIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

import ParentCard from '@/components/shared/ParentCard';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
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
import HowSubscriptionsWorkModal from '@/components/shared/subcription/HowSubscriptionsWorkModal';
import InfoCard from '@/components/shared/subcription/InfoCard';
import { STATUS_STYLE, PLAN_BAR_COLORS, cardRowSx } from '@/components/shared/subcription/subscriptionStyles';
import { TenantAuthContext } from '@/context/TenantContext/auth';

// Fixed per-metric colors — matches the CEO mockup and this app's existing
// convention (same icon-badge/color pairing already established for the
// Admission Dashboard's stat cards) rather than the app's generic blue
// theme primary, which the mockup doesn't use on this page.
const CARD_COLOR = {
  total: '#2563EB',
  active: '#16A34A',
  outstanding: '#D97706',
  plans: '#7C3AED',
};

const ManageSubscriptions = () => {
  return <ManageSubscriptionList />;
};

const ManageSubscriptionList = () => {
  // ─── Overview cards (independent of the table's own filters) ──────────
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // ─── Table data ─────────────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0 });
  const [filterOptions, setFilterOptions] = useState({ sessions: [], terms: [], plans: [] });
  const [listFilters, setListFilters] = useState({ session: '', term: '', plan: '', status: '' });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [activeSessionTerm, setActiveSessionTerm] = useState(null);
  // Real value always comes from getSubscriptionCharges() below (itself
  // reading SUBSCRIPTION_CHARGES from .env) — this is just a neutral
  // placeholder for the brief window before that resolves, not a guess at
  // today's configured amount (which would go stale the moment .env changes).
  const [subscriptionCharges, setSubscriptionCharges] = useState('0');
  const notify = useNotification();
  const { refreshSubscriptionStatus } = useContext(TenantAuthContext);
  const listSectionRef = useRef(null);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await subscriptionApi.getOverviewStats();
      setOverview(res?.data || null);
    } catch (error) {
      console.error('Failed to fetch subscription overview:', error);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionApi.getSubscriptions({
        status: listFilters.status || undefined,
        session_id: listFilters.session || undefined,
        term_id: listFilters.term || undefined,
        plan_id: listFilters.plan || undefined,
        search: debouncedSearch || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      });
      setRows(Array.isArray(res.data) ? res.data : []);
      setMeta({ total: res.meta?.total ?? 0 });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      notify.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [listFilters, debouncedSearch, page, rowsPerPage, notify]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    subscriptionApi
      .getSubscriptionsFilterOptions()
      .then((res) => setFilterOptions(res?.data || { sessions: [], terms: [], plans: [] }))
      .catch(() => setFilterOptions({ sessions: [], terms: [], plans: [] }));
  }, []);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever the filtered set changes shape, so a filter
  // change never strands the user on a now-empty page.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilters, debouncedSearch, rowsPerPage]);

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

  // A mutation (create/upgrade/revert/delete/pay) can change both the
  // table's current page and the overview cards — refresh both rather than
  // patching either's local state, so totals/breakdowns never go stale.
  const refreshAll = useCallback(() => {
    fetchSubscriptions();
    fetchOverview();
  }, [fetchSubscriptions, fetchOverview]);

  // ─── Overview-card derived data ─────────────────────────────────────────
  const chargesNum = parseFloat(subscriptionCharges) || 0;
  const pendingSubscriptions = overview?.pending_subscriptions || [];

  const amountDue = useMemo(
    () =>
      pendingSubscriptions.reduce((sum, s) => {
        const amountAfterDiscount = s.amount - (s.amount * s.discount) / 100;
        return sum + amountAfterDiscount + chargesNum;
      }, 0),
    [pendingSubscriptions, chargesNum],
  );

  const nextDueDate = useMemo(() => {
    const dates = pendingSubscriptions.map((s) => s.extended_due_date).filter(Boolean).sort();
    return dates[0] || null;
  }, [pendingSubscriptions]);

  // Mirrors the inline "Pay Now" rule exactly: a per_session subscription
  // can always be paid via "Pay Full Session"; a per_term one only once its
  // session/term is the one the school is actually in right now.
  const hasPayableNow = useMemo(
    () =>
      pendingSubscriptions.some((s) => {
        const amountAfterDiscount = s.amount - (s.amount * s.discount) / 100;
        if (amountAfterDiscount <= 0) return false;
        if (s.subscription_mode === 'per_session') return true;

        return (
          activeSessionTerm &&
          s.session_id == activeSessionTerm.session_id &&
          s.term_id == activeSessionTerm.term_id
        );
      }),
    [pendingSubscriptions, activeSessionTerm],
  );

  const handleMakePaymentClick = () => {
    setListFilters((prev) => ({ ...prev, status: 'pending' }));
    listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        refreshAll();
      } else if (modalType === 'update') {
        const payload = {
          plan_id: data.availableplan,
          session_id: data.session,
          term_id: data.term || null,
          subscription_mode: data.subscriptionMode,
        };

        await subscriptionApi.updateSubscription(selectedRow.id, payload);
        notify.success('Subscription plan updated successfully', 'Success');
        refreshAll();
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error submitting subscription:', error);
      notify.error(error.response?.data?.message || 'Failed to initiate subscription');
    }
  };

  const handleUpgradeSubmit = () => {
    refreshAll();
    notify.success('Plan upgraded successfully', 'Success');
    setUpgradeModalOpen(false);
  };

  const handleRevertSubmit = () => {
    refreshAll();
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
    refreshAll();
    // The banner/Calendar tile read from a separate, context-level snapshot
    // of the tier (not refetched on every page) — without this, they'd keep
    // showing the pre-payment tier until the next login/page reload.
    refreshSubscriptionStatus?.();
  };

  // The payment modals hand off to an external gateway widget and have no
  // way to know when it actually finishes — paymentGateway.js dispatches
  // this once the gateway itself confirms success and our backend accepts
  // it, so the table only refreshes once there's really something new to
  // show (same pattern PayInvoice.jsx uses for class-ledger payments).
  useEffect(() => {
    const handler = () => {
      notify.success('Payment successful and confirmed!');
      handlePaymentSuccess();
    };
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    try {
      await subscriptionApi.deleteSubscription(rowToDelete.id);
      notify.success('Subscription plan deleted successfully', 'Success');
      refreshAll();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      notify.error('Failed to delete subscription');
    }
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  return (
    <>
      {/* ── Overview cards ───────────────────────────────────────────── */}
      <Box sx={cardRowSx}>
        <InfoCard
          icon={ArticleIcon}
          color={CARD_COLOR.total}
          title="Total Subscriptions"
          tooltip="Every subscription this school has ever created, across all sessions."
          value={overview?.total ?? 0}
          loading={overviewLoading}
        >
          {!overviewLoading && (
            <>
              <Typography variant="caption" color="text.secondary" display="block">
                {overview?.earliest_session_name
                  ? `From ${overview.earliest_session_name} to date`
                  : 'No subscriptions yet'}
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>
                All term subscriptions since you joined
              </Typography>
              <Stack direction="row" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_STYLE.active.color }} />
                  <Typography variant="caption" fontWeight={700}>
                    {overview?.active ?? 0} Active
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_STYLE.pending.color }} />
                  <Typography variant="caption" fontWeight={700}>
                    {overview?.pending ?? 0} Pending
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}
        </InfoCard>

        <InfoCard
          icon={LayersIcon}
          color={CARD_COLOR.active}
          title="Active Subscriptions"
          tooltip="Subscriptions that are fully paid and in effect."
          value={overview?.active ?? 0}
          loading={overviewLoading}
        >
          {!overviewLoading && (
            <>
              <Typography variant="caption" color="text.secondary" display="block">
                {activeSessionTerm ? `Current session: ${activeSessionTerm.session_name}` : '—'}
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>
                Active plan(s) for this session
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {(overview?.active_plans || []).length > 0 ? (
                  overview.active_plans.map((p) => (
                    <Stack key={p.name} direction="row" alignItems="center" spacing={0.5}>
                      <LayersIcon sx={{ fontSize: 14, color: CARD_COLOR.active }} />
                      <Typography variant="caption" fontWeight={700}>
                        {p.name} {p.count}
                      </Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    None active yet
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </InfoCard>

        <InfoCard
          icon={AccessTimeIcon}
          color={CARD_COLOR.outstanding}
          title="Outstanding Amount"
          tooltip="Total still owed across every pending subscription."
          value={`₦${amountDue.toLocaleString()}`}
          loading={overviewLoading}
        >
          {!overviewLoading && (
            <>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Across all pending subscriptions
              </Typography>
              {nextDueDate && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.disabled">
                    Due Date
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {new Date(nextDueDate).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                </Stack>
              )}
              <Tooltip
                title={
                  hasPayableNow
                    ? ''
                    : 'A per-term subscription can only be paid once its session/term is the one your school is currently in.'
                }
              >
                <span>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    disabled={!hasPayableNow}
                    onClick={handleMakePaymentClick}
                    sx={{ bgcolor: CARD_COLOR.plans, '&:hover': { bgcolor: '#6D28D9' } }}
                  >
                    Make Payment
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </InfoCard>

        <InfoCard
          icon={LayersIcon}
          color={CARD_COLOR.plans}
          title="Subscription Plans"
          tooltip="How your subscriptions are distributed across available plans."
          value=""
          loading={overviewLoading}
        >
          {!overviewLoading && (
            <>
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.75 }}>
                Across all subscriptions
              </Typography>
              <Stack spacing={0.75}>
                {(overview?.all_plans || []).length > 0 ? (
                  overview.all_plans.map((p, index) => (
                    <Box key={p.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                        <Typography variant="caption" fontWeight={600}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.count} ({p.pct}%)
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${p.pct}%`,
                            bgcolor: PLAN_BAR_COLORS[index % PLAN_BAR_COLORS.length],
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    No subscriptions yet
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </InfoCard>
      </Box>

      {/* ── Subscriptions List ───────────────────────────────────────── */}
      <ParentCard
        title={
          <Box ref={listSectionRef}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Subscriptions List
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  View and manage all termly subscriptions for your school.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<HelpOutlineIcon fontSize="small" />}
                  onClick={() => setHowItWorksOpen(true)}
                >
                  How Subscriptions Work?
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddClick}
                  disabled={overviewLoading}
                  sx={{ bgcolor: CARD_COLOR.plans, '&:hover': { bgcolor: '#6D28D9' } }}
                >
                  {overviewLoading ? <Skeleton width={140} height={20} animation="wave" /> : 'Add New Subscription'}
                </Button>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Academic Session</InputLabel>
                <Select
                  label="Academic Session"
                  value={listFilters.session}
                  onChange={(e) => setListFilters((prev) => ({ ...prev, session: e.target.value }))}
                >
                  <MenuItem value="">All Sessions</MenuItem>
                  {filterOptions.sessions.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Term</InputLabel>
                <Select
                  label="Term"
                  value={listFilters.term}
                  onChange={(e) => setListFilters((prev) => ({ ...prev, term: e.target.value }))}
                >
                  <MenuItem value="">All Terms</MenuItem>
                  {filterOptions.terms.map((t) => (
                    <MenuItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Plan Details</InputLabel>
                <Select
                  label="Plan Details"
                  value={listFilters.plan}
                  onChange={(e) => setListFilters((prev) => ({ ...prev, plan: e.target.value }))}
                >
                  <MenuItem value="">All Plans</MenuItem>
                  {filterOptions.plans.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={listFilters.status}
                  onChange={(e) => setListFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="Search by session, term, plan or status..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ flex: 1, minWidth: 220 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        }
        sx={{
          px: 0,
          py: 0,
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { px: 1.5, py: 0 },
        }}
      >
        <Box sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              stickyHeader
              sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Session / Term</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Plan Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gateway Fee (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Discount (%)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Due (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
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
                        <Skeleton variant="text" width={80} />
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
                        <Skeleton variant="rounded" width={80} height={28} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rows.length > 0 ? (
                  rows.map((row, index) => {
                    const amountNum = parseFloat(row.amount) || 0;
                    const discountNum = parseFloat(row.discount) || 0;
                    const amountAfterDiscount = amountNum - (amountNum * discountNum) / 100;
                    const amountDueRow = amountAfterDiscount + chargesNum;
                    const isActiveSessionTerm =
                      activeSessionTerm &&
                      row.session_id == activeSessionTerm.session_id &&
                      row.term_id == activeSessionTerm.term_id;
                    const statusStyle = STATUS_STYLE[row.status] || STATUS_STYLE.pending;

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={row.status === 'active' ? { bgcolor: 'rgba(22, 163, 74, 0.04)' } : undefined}
                      >
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {row.sessions?.session_name} / {row.terms?.term_name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.my_plans?.display_name || 'N/A'}
                            size="small"
                            sx={{ bgcolor: 'action.hover', fontWeight: 600, borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>₦{amountNum.toLocaleString()}</TableCell>
                        <TableCell>₦{chargesNum.toLocaleString()}</TableCell>
                        <TableCell>{discountNum}%</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₦{amountDueRow.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 600,
                              borderRadius: '8px',
                              textTransform: 'capitalize',
                            }}
                          />
                          {row.extended_due_date && (
                            <Tooltip title="This plan was set up for your school after your free trial ended, so you wouldn't be locked out while deciding. You're not required to keep it — use Change Plan below to switch to a different one at any time before paying.">
                              <Chip
                                label="Grace Extended"
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ ml: 0.5, fontWeight: 600, borderRadius: '8px' }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            {row.status === 'pending' && amountAfterDiscount > 0 ? (
                              row.subscription_mode === 'per_session' ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handlePayFullSession(row)}
                                  sx={{
                                    textTransform: 'none',
                                    bgcolor: CARD_COLOR.plans,
                                    '&:hover': { bgcolor: '#6D28D9' },
                                  }}
                                >
                                  Pay Full Session
                                </Button>
                              ) : (
                                isActiveSessionTerm && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handlePayNow(row)}
                                    sx={{
                                      textTransform: 'none',
                                      bgcolor: CARD_COLOR.plans,
                                      '&:hover': { bgcolor: '#6D28D9' },
                                    }}
                                  >
                                    Pay Now
                                  </Button>
                                )
                              )
                            ) : null}
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
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
                                <MenuItem onClick={() => handleViewInvoiceClick(row)}>
                                  <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                                  View Details
                                </MenuItem>
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
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={meta.total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Per page"
          />
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
          refreshAll();
          refreshSubscriptionStatus?.();
        }}
      />
      <InvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        selectedRow={selectedRow}
        subscriptionCharges={subscriptionCharges}
      />
      <SubscriptionPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setRowToPay(null);
        }}
        selectedRow={rowToPay}
        subscriptionCharges={subscriptionCharges}
      />
      <SubscriptionBulkPaymentModal
        open={bulkPaymentModalOpen}
        onClose={() => {
          setBulkPaymentModalOpen(false);
          setSessionToPay(null);
        }}
        sessionId={sessionToPay?.id}
        sessionName={sessionToPay?.name}
      />
      <HowSubscriptionsWorkModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
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
