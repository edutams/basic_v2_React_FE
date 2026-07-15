import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  ReceiptLong as ReceiptIcon,
  Paid as PaidIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNotification } from '@/hooks/useNotification';
import { fetchWardDetail } from '@/api/tenant/admission/admissionProcessingApi';
import PropTypes from 'prop-types';

const StatCard = ({ title, amount, icon, color, bgColor, currency = '₦' }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flex: 1,
      minWidth: 160,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: (t) => t.shadows[2],
      },
    }}
  >
    <Box
      sx={{
        bgcolor: bgColor,
        color,
        p: 1.5,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
        {title}
      </Typography>
      <Typography variant="body1" color={color} fontWeight={700} noWrap>
        {currency}{(amount ?? 0).toLocaleString()}
      </Typography>
    </Box>
  </Paper>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  currency: PropTypes.string,
};

const WardDetailModal = ({ open, onClose, wardId }) => {
  const theme = useTheme();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (open && wardId) {
      loadDetail();
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, wardId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const response = await fetchWardDetail(wardId);
      if (response.status) {
        setData(response.data);
      } else {
        notify.error(response.message || 'Failed to load ward details');
      }
    } catch (err) {
      console.error('Failed to load ward detail:', err);
      notify.error('Failed to load ward details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setData(null);
    onClose();
  };

  if (!open) return null;

  const feeSummary = data?.fee_summary || {};
  const ledger = data?.ledger || [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <DialogTitle sx={{ px: 3, py: 2.5, bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={data?.avatar}
              sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'primary.main' }}
            >
              {data?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {data?.name || 'Ward Details'}
              </Typography>
              {data?.admission_no && (
                <Typography variant="caption" color="text.secondary">
                  Admission No: {data.admission_no}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ flexShrink: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tags */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, ml: 0 }}>
          {data?.class_label && (
            <Chip
              icon={<SchoolIcon sx={{ fontSize: 14 }} />}
              label={data.class_label}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
          {data?.programme && (
            <Chip
              label={data.programme}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Stack>
      </DialogTitle>

      {/* ── Content ──────────────────────────────────── */}
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress size={36} />
          </Box>
        ) : !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography variant="body2" color="text.secondary">
              No data available.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* ── Fee Overview Stats ─────────────────── */}
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon fontSize="small" />
              Fee Overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <StatCard
                title="Total Bill"
                amount={feeSummary.total_payable || 0}
                icon={<ReceiptIcon />}
                color="#10b981"
                bgColor="#ecfdf5"
              />
              <StatCard
                title="Amount Paid"
                amount={feeSummary.total_paid || 0}
                icon={<PaidIcon />}
                color="#f59e0b"
                bgColor="#fffbeb"
              />
              <StatCard
                title="Outstanding Balance"
                amount={feeSummary.total_balance || 0}
                icon={<WalletIcon />}
                color={feeSummary.total_balance > 0 ? '#ef4444' : '#10b981'}
                bgColor={feeSummary.total_balance > 0 ? '#fef2f2' : '#ecfdf5'}
              />
            </Box>

            {/* ── Fee Breakdown ───────────────────────── */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Compulsory Fees
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary.main">
                  ₦{(feeSummary.total_compulsory || 0).toLocaleString()}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Optional Fees
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: '#6366f1' }}>
                  ₦{(feeSummary.total_optional || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Box>

            <Divider />

            {/* ── Payment Ledger Table ───────────────── */}
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon fontSize="small" />
              Payment Ledger
            </Typography>

            {ledger.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No payment records found for this ward.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Session/Term</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Payment Item</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Amount (₦)</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Paid (₦)</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="right">Balance (₦)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledger.map((group, gIdx) =>
                      group.items.map((item, iIdx) => (
                        <TableRow key={`${gIdx}-${iIdx}`} hover>
                          {iIdx === 0 ? (
                            <TableCell
                              rowSpan={group.items.length}
                                              sx={{
                                fontWeight: 600,
                                fontSize: 11,
                                verticalAlign: 'top',
                                borderRight: '1px solid',
                                borderColor: 'divider',
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                              }}
                              rowSpan={group.items.length + 1}
                            >
                              {group.session_term_id || '—'}
                            </TableCell>
                          ) : null}
                          <TableCell sx={{ fontSize: 12 }}>{item.payment_item || '—'}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 12 }}>
                            <Chip
                              label={item.pay_type || '—'}
                              size="small"
                              color={item.pay_type === 'compulsory' ? 'primary' : 'default'}
                              variant="outlined"
                              sx={{ fontSize: 10, fontWeight: 600, height: 20 }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>
                            {item.amount?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12 }}>
                            {item.paid?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: item.balance > 0 ? 'error.main' : 'success.main',
                            }}
                          >
                            {item.balance?.toLocaleString() || '0'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* Totals per group */}
                    {ledger.map((group, gIdx) => (
                      <TableRow
                        key={`total-${gIdx}`}
                        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}
                      >
                        {gIdx === 0 ? (
                          <TableCell
                            rowSpan={ledger.length}
                            sx={{ borderRight: '1px solid', borderColor: 'divider' }}
                          />
                        ) : null}
                        <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 12 }}>
                          Term Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          {group.total_bill?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                          {group.total_paid?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: group.total_balance > 0 ? 'error.main' : 'success.main',
                          }}
                        >
                          {group.total_balance?.toLocaleString() || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="contained" size="small" color="inherit" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

WardDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  wardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default WardDetailModal;
