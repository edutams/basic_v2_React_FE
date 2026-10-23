import { useState, useEffect, useCallback, useContext, useMemo, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Popover,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

import ParentCard from '@/components/shared/ParentCard';
import ReceiptModal from '@/components/shared/subcription/ReceiptModal';
import InfoCard from '@/components/shared/subcription/InfoCard';
import { STATUS_STYLE, cardRowSx } from '@/components/shared/subcription/subscriptionStyles';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';
import useNotification from '@/hooks/useNotification';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const CARD_COLOR = {
  total: '#2563EB',
  approved: '#16A34A',
  pending: '#D97706',
  declined: '#DC2626',
};

const SubscriptionHistory = forwardRef((_props, ref) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listFilters, setListFilters] = useState({ session: '', term: '', plan: '', status: '' });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [draftDateRange, setDraftDateRange] = useState({ from: '', to: '' });
  const [filterOptions, setFilterOptions] = useState({ sessions: [], terms: [], plans: [] });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState({ total: 0 });
  const [checkingStatusId, setCheckingStatusId] = useState(null);
  const [stats, setStats] = useState(null);
  const notify = useNotification();
  const { refreshSubscriptionStatus } = useContext(TenantAuthContext);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getHistory({
        page: page + 1,
        per_page: rowsPerPage,
        search: debouncedSearch || undefined,
        status: listFilters.status || undefined,
        session_id: listFilters.session || undefined,
        term_id: listFilters.term || undefined,
        plan_id: listFilters.plan || undefined,
        date_from: dateRange.from || undefined,
        date_to: dateRange.to || undefined,
      });
      if (res.status) {
        setTransactions(res.data);
        setMeta({ total: res.meta?.total || 0 });
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
  }, [page, rowsPerPage, debouncedSearch, listFilters, dateRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    subscriptionApi
      .getHistoryFilterOptions()
      .then((res) => setFilterOptions(res?.data || { sessions: [], terms: [], plans: [] }))
      .catch(() => setFilterOptions({ sessions: [], terms: [], plans: [] }));
  }, []);

  // Reset to page 1 whenever the visible set changes shape, so a filter
  // change never strands the user on a now-empty page.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilters, debouncedSearch, dateRange, rowsPerPage]);

  useImperativeHandle(ref, () => ({
    /** Client-side CSV export of the currently loaded (filtered) page —
     * history is paginated server-side, so this exports what's on screen,
     * same scope as every other "Export Report" action in this app. */
    exportCsv: () => {
      const header = ['#', 'Transaction ID', 'Description', 'Plan', 'Amount', 'Date', 'Status', 'Reference'];
      const rows = transactions.map((t, i) => [
        page * rowsPerPage + i + 1,
        t.transaction_id,
        t.payment_description,
        t.plan_name,
        t.amount,
        t.transaction_date,
        t.status,
        t.bulk_order_id || '',
      ]);
      const csv = [header, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'subscription-payments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  }));

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

  const handleViewReceipt = (transaction) => {
    handleMenuClose();
    setSelectedTransaction(transaction);
    setReceiptModalOpen(true);
  };

  const handleDownloadReceipt = async (transaction) => {
    handleMenuClose();
    try {
      await subscriptionApi.downloadReceiptPdf(transaction.transaction_id);
    } catch (err) {
      console.error('Failed to download receipt', err);
      notify.error('Failed to download receipt');
    }
  };

  const handleOpenDateRange = (e) => {
    setDraftDateRange(dateRange);
    setDateAnchorEl(e.currentTarget);
  };

  const handleApplyDateRange = () => {
    setDateRange(draftDateRange);
    setDateAnchorEl(null);
  };

  const handleClearDateRange = () => {
    setDraftDateRange({ from: '', to: '' });
    setDateRange({ from: '', to: '' });
    setDateAnchorEl(null);
  };

  const dateRangeLabel = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return 'Custom Range';
    return `${dateRange.from || '…'} – ${dateRange.to || '…'}`;
  }, [dateRange]);

  const statCards = (
    <Box sx={cardRowSx}>
      <InfoCard
        icon={ReceiptIcon}
        color={CARD_COLOR.total}
        title="Total Transactions"
        tooltip="Every subscription payment transaction since you joined."
        value={stats?.total ?? 0}
        loading={loading && !stats}
      >
        <Typography variant="caption" color="text.disabled">
          All subscription payment transactions since you joined.
        </Typography>
      </InfoCard>
      <InfoCard
        icon={CheckCircleIcon}
        color={CARD_COLOR.approved}
        title="Successful Payments"
        tooltip="Transactions confirmed as paid by the gateway."
        value={stats?.approved ?? 0}
        loading={loading && !stats}
      >
        <Typography variant="caption" color="text.disabled">
          Payments completed successfully.
        </Typography>
      </InfoCard>
      <InfoCard
        icon={HourglassEmptyIcon}
        color={CARD_COLOR.pending}
        title="Pending Payments"
        tooltip="Transactions awaiting gateway confirmation."
        value={stats?.pending ?? 0}
        loading={loading && !stats}
      >
        <Typography variant="caption" color="text.disabled">
          Payments awaiting confirmation.
        </Typography>
      </InfoCard>
      <InfoCard
        icon={CancelIcon}
        color={CARD_COLOR.declined}
        title="Failed Payments"
        tooltip="Transactions the gateway declined."
        value={stats?.declined ?? 0}
        loading={loading && !stats}
      >
        <Typography variant="caption" color="text.disabled">
          Payments that could not be completed.
        </Typography>
      </InfoCard>
    </Box>
  );

  return (
    <>
      {statCards}
      <ParentCard
        title={
          <Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
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
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  label="Payment Status"
                  value={listFilters.status}
                  onChange={(e) => setListFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DateRangeIcon fontSize="small" />}
                onClick={handleOpenDateRange}
                sx={{ height: 40, textTransform: 'none' }}
              >
                {dateRangeLabel}
              </Button>
              <Popover
                open={Boolean(dateAnchorEl)}
                anchorEl={dateAnchorEl}
                onClose={() => setDateAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <Stack spacing={1.5} sx={{ p: 2, width: 260 }}>
                  <TextField
                    label="From"
                    type="date"
                    size="small"
                    value={draftDateRange.from}
                    onChange={(e) => setDraftDateRange((prev) => ({ ...prev, from: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="To"
                    type="date"
                    size="small"
                    value={draftDateRange.to}
                    onChange={(e) => setDraftDateRange((prev) => ({ ...prev, to: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={handleClearDateRange}>
                      Clear
                    </Button>
                    <Button size="small" variant="contained" onClick={handleApplyDateRange}>
                      Apply
                    </Button>
                  </Stack>
                </Stack>
              </Popover>
              <TextField
                size="small"
                placeholder="Search by transaction ID or description..."
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
                  <TableCell sx={{ fontWeight: 700 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date &amp; Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
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
                      <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction, index) => {
                    const statusStyle = STATUS_STYLE[transaction.status] || STATUS_STYLE.pending;
                    const isApproved = transaction.status === 'approved';
                    const isChecking = checkingStatusId === transaction.bulk_order_id;

                    return (
                      <TableRow
                        key={transaction.transaction_id}
                        hover
                        sx={isApproved ? { bgcolor: 'rgba(22, 163, 74, 0.04)' } : undefined}
                      >
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-all', minWidth: 140 }}>
                          {transaction.transaction_id}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', minWidth: 160 }}>
                          {transaction.payment_description}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.plan_name || 'N/A'}
                            size="small"
                            sx={{ bgcolor: 'action.hover', fontWeight: 600, borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>₦{parseFloat(transaction.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {transaction.transaction_date
                            ? new Date(transaction.transaction_date).toLocaleString(undefined, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isChecking ? (
                            <Chip
                              icon={<Skeleton variant="circular" width={10} height={10} />}
                              label="CHECKING..."
                              size="small"
                              sx={{ bgcolor: 'info.light', color: 'info.main', borderRadius: '8px' }}
                            />
                          ) : (
                            <Chip
                              label={(transaction.status || 'pending').toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 600,
                                borderRadius: '8px',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-all', minWidth: 120 }}>
                          {transaction.bulk_order_id || '—'}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isChecking ? 'Checking status…' : ''}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, transaction)}
                                disabled={isChecking}
                              >
                                {isChecking ? (
                                  <Skeleton variant="circular" width={20} height={20} />
                                ) : (
                                  <MoreVertIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Menu
                            anchorEl={anchorEl}
                            open={
                              Boolean(anchorEl) &&
                              selectedTransaction?.transaction_id === transaction.transaction_id
                            }
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleViewReceipt(transaction)} disabled={!isApproved}>
                              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                              View Receipt
                            </MenuItem>
                            <MenuItem onClick={() => handleDownloadReceipt(transaction)} disabled={!isApproved}>
                              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                              Download Receipt
                            </MenuItem>
                            {!isApproved && (
                              <MenuItem onClick={() => handleCheckStatus(transaction)}>
                                <UpdateIcon fontSize="small" sx={{ mr: 1 }} />
                                Check Status
                              </MenuItem>
                            )}
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
});
SubscriptionHistory.displayName = 'SubscriptionHistory';

export default SubscriptionHistory;
