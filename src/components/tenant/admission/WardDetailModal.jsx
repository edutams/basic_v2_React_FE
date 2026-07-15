import React, { useState, useEffect, useMemo } from 'react';
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
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNotification } from '@/hooks/useNotification';
import { fetchWardDetail } from '@/api/tenant/admission/admissionProcessingApi';
import PropTypes from 'prop-types';

const StatCard = ({ title, amount, icon, color, bgColor }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      border: '1px solid',
      borderColor: 'divider',
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
      <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
        {title}
      </Typography>
      <Typography variant="h6" color={color} fontWeight={700} noWrap>
        NGN {amount.toLocaleString()}
      </Typography>
    </Box>
  </Box>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
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

  const handlePrint = () => {
    const printContent = document.getElementById('ward-ledger-print-area');
    if (printContent) {
      const printHtml = `
        <html>
          <head>
            <title>Payment Ledger - ${data?.name || 'Student'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
              .summary { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${data?.name || 'Student'}'s Payment Ledger</h2>
            </div>
            <div class="summary">
              <div>Total Bill: NGN ${totals.bill.toLocaleString()}</div>
              <div>Amount Paid: NGN ${totals.paid.toLocaleString()}</div>
              <div>Balance: NGN ${totals.balance.toLocaleString()}</div>
            </div>
            ${printContent.querySelector('table').outerHTML}
          </body>
        </html>
      `;
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  // Transform the nested ledger data from fetchWardDetail into a flat format
  // matching the StudentLedgerModal data structure
  const { groupedData, totals } = useMemo(() => {
    const groups = {};
    let totalBill = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let cumulative = 0;

    const flatItems = [];
    (data?.ledger || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        flatItems.push({
          session_term_id: group.session_term_id,
          session_name: group.session_term_id || '—',
          payment_item: item.payment_item || '—',
          sched_amount: item.amount || 0,
          amount_paid: item.paid || 0,
          balance_amount: item.balance || 0,
        });
      });
    });

    flatItems.forEach((item) => {
      // If the backend provides a proper label, use it; otherwise fallback to session_term_id
      const termLabel = `${item.session_name || 'Unknown'}`;
      if (!groups[termLabel]) {
        groups[termLabel] = [];
      }
      groups[termLabel].push(item);

      totalBill += parseFloat(item.sched_amount || 0);
      totalPaid += parseFloat(item.amount_paid || 0);
      totalBalance += parseFloat(item.balance_amount || 0);
    });

    const sortedTerms = Object.keys(groups).sort((a, b) => {
      return (groups[b][0]?.session_term_id || 0) - (groups[a][0]?.session_term_id || 0);
    });

    const finalGroups = sortedTerms.map(term => {
      const items = groups[term];
      return {
        term,
        items: items.map(item => {
          cumulative += parseFloat(item.sched_amount || 0);
          return { ...item, cumulative };
        })
      };
    });

    return {
      groupedData: finalGroups,
      totals: {
        bill: totalBill,
        paid: totalPaid,
        balance: totalBalance,
      }
    };
  }, [data]);

  if (!open) return null;

  const isLoading = loading;

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
        {isLoading ? (
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
          <Box id="ward-ledger-print-area">
            {/* ── Fee Overview Stats ─────────────────── (StudentLedgerModal-style) */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <StatCard
                title="Total Bill"
                amount={totals.bill}
                icon={<ReceiptIcon />}
                color="#10b981"
                bgColor="#ecfdf5"
              />
              <StatCard
                title="Amount Paid"
                amount={totals.paid}
                icon={<PaidIcon />}
                color="#f59e0b"
                bgColor="#fffbeb"
              />
              <StatCard
                title="Balance"
                amount={totals.balance}
                icon={<WalletIcon />}
                color="#ef4444"
                bgColor="#fef2f2"
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* ── Payment Ledger ─────────────────────── (StudentLedgerModal-style) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon fontSize="small" />
                {data?.name ? `${data.name?.toUpperCase()}'s Payment Ledger` : 'Payment Ledger'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  bgcolor: '#1e293b',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0f172a' }
                }}
                size="small"
              >
                Print Payment Ledger
              </Button>
            </Box>

            {groupedData.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No payment records found for this ward.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Sessn/Term</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Payment Items</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Amount Paid (NGN)</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Balance</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Cumulative</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedData.map((group, gIndex) => (
                      <React.Fragment key={gIndex}>
                        {group.items.map((item, iIndex) => (
                          <TableRow key={`${gIndex}-${iIndex}`} hover>
                            {iIndex === 0 ? (
                              <TableCell
                                rowSpan={group.items.length}
                                sx={{
                                  verticalAlign: 'top',
                                  fontWeight: 600,
                                  borderRight: '1px solid',
                                  borderColor: 'divider',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {group.term}
                              </TableCell>
                            ) : null}
                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.payment_item}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{parseFloat(item.sched_amount || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{parseFloat(item.amount_paid || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{parseFloat(item.balance_amount || 0).toLocaleString()}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{item.cumulative.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* Totals Row */}
                    {groupedData.length > 0 && (
                      <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                        <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.bill.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.paid.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.balance.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{/* cumulative total */}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
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
