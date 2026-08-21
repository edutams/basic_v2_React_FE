import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  AccountBalance as BankIcon,
  Payment as GatewayIcon,
  Wallet as WalletIcon,
  CalendarToday as DateIcon,
  CheckCircle as ApprovedIcon,
  PendingActions as PendingIcon,
  Cancel as DeclinedIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import tenantApi from '@/api/tenant/tenant_api';

/**
 * Format a number as Naira currency.
 */
const formatCurrency = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Format a date string for display.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Status chip used in the detail view.
 */
const StatusChip = ({ status }) => {
  const map = {
    APPROVED: { icon: ApprovedIcon, color: 'success', label: 'Approved' },
    PENDING: { icon: PendingIcon, color: 'warning', label: 'Pending' },
    DECLINED: { icon: DeclinedIcon, color: 'error', label: 'Declined' },
    approved: { icon: ApprovedIcon, color: 'success', label: 'Approved' },
    pending: { icon: PendingIcon, color: 'warning', label: 'Pending' },
    declined: { icon: DeclinedIcon, color: 'error', label: 'Declined' },
  };
  const meta = map[status] || { icon: null, color: 'default', label: status || '—' };
  return (
    <Chip
      icon={meta.icon ? <meta.icon sx={{ fontSize: 14 }} /> : undefined}
      label={meta.label}
      size="small"
      color={meta.color}
      sx={{ fontSize: 11, fontWeight: 700, height: 22 }}
    />
  );
};

/**
 * A reusable info row for the detail sections.
 */
const InfoRow = ({ label, value, mono, color }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: color || '#111827',
        fontFamily: mono ? 'monospace' : 'inherit',
        textAlign: 'right',
        maxWidth: '60%',
        wordBreak: 'break-all',
      }}
    >
      {value || '—'}
    </Typography>
  </Box>
);

/**
 * Section card with icon + title.
 */
const SectionCard = ({ icon: Icon, title, color, isDark, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: '12px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
      background: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          bgcolor: `${color}15`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 15 }} />
      </Box>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

/**
 * TransactionDetailModal — shows full details for a single payment transaction
 * including gateway info, wallet account, settlement/bank details, etc.
 *
 * Props:
 *   open          – boolean
 *   transactionId – the bursary_payment_transactions.id
 *   onClose       – close handler
 */
const TransactionDetailModal = ({ open, transactionId, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txData, setTxData] = useState(null);

  useEffect(() => {
    if (!open || !transactionId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTxData(null);

    tenantApi
      .get('/dashboard/bursary/transaction-detail', {
        params: { transaction_id: transactionId },
      })
      .then((res) => {
        if (!cancelled) {
          if (res.data?.status) {
            setTxData(res.data.data);
          } else {
            setError(res.data?.message || 'Failed to load transaction details');
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load transaction details');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, transactionId]);

  const settlement = txData?.settlement;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px', maxHeight: '85vh' },
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
        }}
      >
        <ReceiptIcon sx={{ color: '#3B82F6' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
          Transaction Details
        </Typography>
        {txData && (
          <Box sx={{ ml: 'auto' }}>
            <StatusChip status={txData.status} />
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : !txData ? (
          <Alert severity="info">No data available.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* ── Amount + Status ─────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))'
                  : 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                Amount Paid
              </Typography>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827' }}>
                {formatCurrency(txData.amount_paid)}
              </Typography>
              {txData.scheduled_amount > 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', mt: 0.5 }}>
                  Scheduled: {formatCurrency(txData.scheduled_amount)}
                </Typography>
              )}
            </Paper>

            {/* ── Payment Info ────────────────────────────────────── */}
            <SectionCard icon={ReceiptIcon} title="Payment Information" color="#3B82F6" isDark={isDark}>
              <InfoRow label="Order ID" value={txData.order_id} mono />
              {txData.bulk_order_id && (
                <InfoRow label="Bulk Order ID" value={txData.bulk_order_id} mono />
              )}
              <InfoRow label="Payment Item" value={txData.payment_item} />
              <InfoRow label="Category" value={txData.category} />
              <InfoRow label="Payment Type" value={txData.payment_type} />
              <InfoRow label="Description" value={txData.description} />
              <InfoRow label="Date" value={formatDate(txData.trans_date)} />
            </SectionCard>

            {/* ── Session / Term ──────────────────────────────────── */}
            <SectionCard icon={DateIcon} title="Session & Term" color="#8B5CF6" isDark={isDark}>
              <InfoRow label="Session" value={txData.session_name} />
              <InfoRow label="Term" value={txData.term_name} />
              {txData.percent && (
                <InfoRow label="Percent" value={`${txData.percent}%`} />
              )}
            </SectionCard>

            {/* ── Gateway Details ─────────────────────────────────── */}
            {(txData.gateway || txData.raw_response) && (
              <SectionCard icon={GatewayIcon} title="Gateway Details" color="#2563EB" isDark={isDark}>
                <InfoRow label="Gateway" value={txData.gateway} />
                {txData.raw_response && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 600, mb: 0.5 }}>
                      Raw Response
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                        background: isDark ? 'rgba(0,0,0,0.2)' : '#F3F4F6',
                        maxHeight: 120,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography
                        component="pre"
                        sx={{
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          color: '#374151',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          m: 0,
                        }}
                      >
                        {txData.raw_response}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </SectionCard>
            )}

            {/* ── Wallet Details ──────────────────────────────────── */}
            {txData.wallet_account_no && (
              <SectionCard icon={WalletIcon} title="Wallet Details" color="#059669" isDark={isDark}>
                <InfoRow label="Wallet Account No." value={txData.wallet_account_no} mono />
              </SectionCard>
            )}

            {/* ── Settlement / Bank Details ────────────────────────── */}
            {settlement && (
              <SectionCard icon={BankIcon} title="Settlement / Bank Details" color="#D97706" isDark={isDark}>
                <InfoRow label="Settlement ID" value={settlement.settlement_id} mono />
                <InfoRow label="Bank Name" value={settlement.bank_name} />
                <InfoRow label="Account Number" value={settlement.account_number} mono />
                <InfoRow label="Amount" value={formatCurrency(settlement.amount)} />
                <InfoRow label="Date Paid" value={formatDate(settlement.date_paid)} />
                <InfoRow
                  label="Status"
                  value={
                    settlement.bank_status ? (
                      <StatusChip status={settlement.bank_status} />
                    ) : (
                      '—'
                    )
                  }
                />
              </SectionCard>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailModal;
