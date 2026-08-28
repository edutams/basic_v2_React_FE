import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
  Paper,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorIcon,
  Payments as PaymentsIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Refresh as RequeryIcon,
  ReceiptLong as ReceiptLongIcon,

} from '@mui/icons-material';
import tenantApi from '@/api/tenant/tenant_api';
import TransactionDetailModal from './TransactionDetailModal';

/**
 * Summary stat card used inside the student detail modal.
 */
const StatBox = ({ icon: Icon, label, value, color, isDark }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: '12px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      background: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
      flex: 1,
      minWidth: 140,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: `${color}15`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography sx={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
      {value}
    </Typography>
  </Paper>
);

/**
 * Format a number as Naira currency.
 */
const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Status chip for invoice / transaction statuses.
 */
const StatusBadge = ({ status }) => {
  const statusMap = {
    APPROVED: { label: 'Approved', color: 'success' },
    PENDING: { label: 'Pending', color: 'warning' },
    REJECTED: { label: 'Rejected', color: 'error' },
    paid: { label: 'Paid', color: 'success' },
    partially_paid: { label: 'Partial', color: 'warning' },
    pending: { label: 'Pending', color: 'warning' },
    unpaid: { label: 'Unpaid', color: 'error' },
    incomplete: { label: 'Incomplete', color: 'warning' },
  };
  const meta = statusMap[status] || { label: status || '—', color: 'default' };
  return (
    <Chip
      label={meta.label}
      size="small"
      color={meta.color}
      sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
    />
  );
};

/**
 * StudentDetailModal — a large dialog that fetches and displays all payment
 * details for a specific learner: invoices, payment history, and summary stats.
 * Includes its own session term dropdown for filtering.
 *
 * Props:
 *   open            – boolean
 *   student         – { user_id, name, admission_no, class_name, avatar } from search results
 *   onClose         – close handler
 */
const StudentDetailModal = ({ open, student, sessionTermId: activeSessionTermId, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [invoicePage, setInvoicePage] = useState(0);
  const [invoiceRowsPerPage, setInvoiceRowsPerPage] = useState(10);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(10);

  // Action menu state for payment history rows
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeTx, setActiveTx] = useState(null);
  const [checkingStatusId, setCheckingStatusId] = useState(null);

  // Transaction detail modal state
  const [viewTxId, setViewTxId] = useState(null);  const sessionTermId = activeSessionTermId ? String(activeSessionTermId) : '';

  // Fetch student detail when modal opens or session term changes
  useEffect(() => {
    if (!open || !student?.user_id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetailData(null);
    setActiveTab(0);
    setInvoicePage(0);
    setTransactionPage(0);
    setMenuAnchorEl(null);
    setActiveTx(null);

    tenantApi
      .get('/dashboard/bursary/student-detail', {
        params: {
          user_id: student.user_id,
          session_term_id: sessionTermId || undefined,
        },
      })
      .then((res) => {
        if (!cancelled) {
          if (res.data?.status) {
            setDetailData(res.data.data);
          } else {
            setError(res.data?.message || 'Failed to load student details');
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load student details');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, student?.user_id, sessionTermId]);


  // ── Transaction action handlers ──────────────────────────
  const handleRequery = async (tx) => {
    setCheckingStatusId(tx.transaction_id);
    try {
      const res = await tenantApi.get('/bursary/transactions/update_status', {
        params: { id: tx.transaction_id },
      });
      if (res.data?.status) {
        const newStatus = res.data.transaction_status;
        // Update the transaction status in the detail data
        setDetailData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            transactions: prev.transactions.map((t) =>
              t.transaction_id === tx.transaction_id
                ? { ...t, status: newStatus }
                : t
            ),
          };
        });
      }
    } catch {
      // silently fail — status unchanged
    } finally {
      setCheckingStatusId(null);
      setMenuAnchorEl(null);
    }
  };

  const handlePrintReceipt = (tx) => {
    const params = new URLSearchParams({
      order_id: tx.order_id || '',
      user_id: String(info?.user_id || ''),
      session_term_id: sessionTermId || '',
    });
    window.open(
      `/bursary/transactions/print_receipt?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    );
    setMenuAnchorEl(null);
  };

  const info = detailData?.student;
  const summary = detailData?.summary;
  const invoices = detailData?.invoices || [];
  const transactions = detailData?.transactions || [];

  // Paginated slices
  const pagedInvoices = invoices.slice(
    invoicePage * invoiceRowsPerPage,
    invoicePage * invoiceRowsPerPage + invoiceRowsPerPage,
  );
  const pagedTransactions = transactions.slice(
    transactionPage * transactionRowsPerPage,
    transactionPage * transactionRowsPerPage + transactionRowsPerPage,
  );

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '90vh',
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <PersonIcon sx={{ color: '#3B82F6' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
          Student Payment Details
        </Typography>
        {info && (
          <Chip
            label={info.full_class || '—'}
            size="small"
            sx={{ fontWeight: 700, bgcolor: '#EEF2FF', color: '#4338CA' }}
          />
        )}

      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : !info ? (
          <Alert severity="info">No data available.</Alert>
        ) : (
          <>
            {/* ── Student Profile ────────────────────────────────── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                background: isDark ? theme.palette.background.paper : '#fff',
              }}
            >
              <Avatar
                src={info.avatar || ''}
                alt={info.name}
                sx={{
                  width: 56,
                  height: 56,
                  fontSize: 22,
                  bgcolor: isDark ? theme.palette.grey[700] : '#DBEAFE',
                  color: '#2563EB',
                  fontWeight: 800,
                }}
              >
                {info.name?.charAt(0)?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>
                  {info.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.3, flexWrap: 'wrap', alignItems: 'center' }}>
                  {info.admission_no && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500 }}>
                      ID: {info.admission_no}
                    </Typography>
                  )}
                  {info.gender && (
                    <Chip
                      label={info.gender}
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }}
                    />
                  )}
                  {info.email && (
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                      {info.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              {info.phone_number && (
                <Chip
                  label={info.phone_number}
                  size="small"
                  sx={{ fontSize: '0.68rem', fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }}
                />
              )}
            </Box>

            {/* ── Summary Stats ──────────────────────────────────── */}
            {summary && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                <StatBox
                  icon={ReceiptIcon}
                  label="Expected"
                  value={formatCurrency(summary.total_expected)}
                  color="#3B82F6"
                  isDark={isDark}
                />
                <StatBox
                  icon={WalletIcon}
                  label="Paid"
                  value={formatCurrency(summary.total_paid)}
                  color="#22C55E"
                  isDark={isDark}
                />
                <StatBox
                  icon={ErrorIcon}
                  label="Outstanding"
                  value={formatCurrency(summary.total_outstanding)}
                  color="#F59E0B"
                  isDark={isDark}
                />
                <StatBox
                  icon={TrendingUpIcon}
                  label="Collection Rate"
                  value={`${summary.collection_rate}%`}
                  color="#8B5CF6"
                  isDark={isDark}
                />
                <StatBox
                  icon={PaymentsIcon}
                  label="Total Payments"
                  value={String(summary.total_payments)}
                  color="#EC4899"
                  isDark={isDark}
                />
              </Box>
            )}

            <Divider sx={{ mb: 1 }} />

            {/* ── Tabs: Invoices | Transactions ──────────────────── */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => { setActiveTab(v); setInvoicePage(0); setTransactionPage(0); }}
              sx={{ mb: 1.5, minHeight: 36 }}
            >
              <Tab
                label={`Invoices (${invoices.length})`}
                sx={{ minHeight: 36, fontWeight: 700, fontSize: '0.78rem', textTransform: 'none' }}
              />
              <Tab
                label={`Payment History (${transactions.length})`}
                sx={{ minHeight: 36, fontWeight: 700, fontSize: '0.78rem', textTransform: 'none' }}
              />
            </Tabs>

            {/* ── Invoices Table ─────────────────────────────────── */}
            {activeTab === 0 && (
              invoices.length === 0 ? (
                <Alert severity="info" sx={{ my: 2 }}>No invoices found for this student{sessionTermId ? ' in the selected term' : ''}.</Alert>
              ) : (
                <TableContainer
                  elevation={0}
                  variant="outlined"
                  sx={{ borderRadius: 2, overflowX: 'auto' }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Payment Item</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Session / Term</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">Scheduled</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">Paid</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">Balance</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedInvoices.map((inv, i) => (
                        <TableRow
                          key={inv.invoice_id || i}
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            bgcolor: (inv.balance > 0 && inv.balance < inv.schedule_amount)
                              ? 'rgba(245, 158, 11, 0.04)'
                              : 'inherit',
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                            {invoicePage * invoiceRowsPerPage + i + 1}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {inv.payment_item || '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {inv.category || '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {inv.session_name} — {inv.term_name}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {formatCurrency(inv.schedule_amount)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#22C55E' }}>
                            {formatCurrency(inv.paid_amount)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: inv.balance > 0 ? '#F59E0B' : '#22C55E',
                            }}
                          >
                            {formatCurrency(inv.balance)}
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={inv.invoice_status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          count={invoices.length}
                          rowsPerPage={invoiceRowsPerPage}
                          page={invoicePage}
                          onPageChange={(_, p) => setInvoicePage(p)}
                          onRowsPerPageChange={(e) => {
                            setInvoiceRowsPerPage(parseInt(e.target.value, 10));
                            setInvoicePage(0);
                          }}
                          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              )
            )}

            {/* ── Transactions Table ─────────────────────────────── */}
            {activeTab === 1 && (
              transactions.length === 0 ? (
                <Alert severity="info" sx={{ my: 2 }}>No payment transactions found for this student{sessionTermId ? ' in the selected term' : ''}.</Alert>
              ) : (
                <TableContainer
                  elevation={0}
                  variant="outlined"
                  sx={{ borderRadius: 2, overflowX: 'auto' }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Payment Item</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="center">Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedTransactions.map((tx, i) => (
                        <TableRow key={tx.transaction_id || i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                            {transactionPage * transactionRowsPerPage + i + 1}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {tx.trans_date
                              ? new Date(tx.trans_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {tx.payment_item || '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {tx.payment_type || '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#22C55E' }}>
                            {formatCurrency(tx.amount_paid)}
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={tx.status} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            {tx.description || '—'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              disabled={checkingStatusId === tx.transaction_id}
                              onClick={(e) => {
                                setMenuAnchorEl(e.currentTarget);
                                setActiveTx(tx);
                              }}
                            >
                              {checkingStatusId === tx.transaction_id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <MoreVertIcon fontSize="small" />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          count={transactions.length}
                          rowsPerPage={transactionRowsPerPage}
                          page={transactionPage}
                          onPageChange={(_, p) => setTransactionPage(p)}
                          onRowsPerPageChange={(e) => {
                            setTransactionRowsPerPage(parseInt(e.target.value, 10));
                            setTransactionPage(0);
                          }}
                          sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              )
            )}
          </>
        )}
      </DialogContent>

      {/* ── Transaction Action Menu ──────────────────────────── */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => { setMenuAnchorEl(null); setActiveTx(null); }}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
      >
        {activeTx?.order_id && (
          <MenuItem
            onClick={() => {
              handlePrintReceipt(activeTx);
            }}
          >
            <ReceiptLongIcon sx={{ mr: 1.5, color: '#2e7d32' }} />
            View / Print Receipt
          </MenuItem>
        )}
        <MenuItem
          disabled={checkingStatusId === activeTx?.transaction_id}
          onClick={async () => {
            await handleRequery(activeTx);
          }}
        >
          <RequeryIcon sx={{ mr: 1.5, color: '#ed6c02' }} />
          {checkingStatusId === activeTx?.transaction_id ? 'Checking...' : 'Requery Status'}
        </MenuItem>
        {activeTx?.transaction_id && (
          <MenuItem
            onClick={() => {
              setViewTxId(activeTx.transaction_id);
              setMenuAnchorEl(null);
            }}
          >
            <ViewIcon sx={{ mr: 1.5, color: '#1976d2' }} />
            View Detail
          </MenuItem>
        )}
      </Menu>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* ── Transaction Detail Sub-Modal ─────────────────────── */}
    <TransactionDetailModal
      open={Boolean(viewTxId)}
      transactionId={viewTxId}
      onClose={() => setViewTxId(null)}
    />
    </>
  );
};

export default StudentDetailModal;
