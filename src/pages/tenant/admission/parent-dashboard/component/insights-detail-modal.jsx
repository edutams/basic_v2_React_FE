import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Alert,
  TablePagination,
  Button,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import {
  EditOutlined,
  QuizOutlined,
  AssignmentOutlined,
  MenuBookOutlined,
  WarningAmberOutlined,
  InsightsOutlined,
  AccountBalanceWalletOutlined,
  CreditCardOutlined,
  AccessTimeOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material';
import { getParentInsightsDetail } from '@/api/tenant/admission/admissionApi';

// Config per card: modal title, icon, accent color, and table columns.
const CONFIGS = {
  academic: {
    title: 'Academic Report',
    icon: EditOutlined,
    color: '#2563EB',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'kind', label: 'Type' },
      { key: 'title', label: 'Title' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'score', label: 'Score' },
    ],
  },
  attendance: {
    title: 'Attendance Details',
    icon: WarningAmberOutlined,
    color: '#D97706',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'date', label: 'Date' },
      { key: 'morning', label: 'Morning' },
      { key: 'afternoon', label: 'Afternoon' },
      { key: 'status', label: 'Day Status' },
    ],
  },
  performance: {
    title: 'Performance Snapshot',
    icon: AssignmentOutlined,
    color: '#DC2626',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'absent_days', label: 'Absent Days' },
      { key: 'marked', label: 'Marked Days' },
      { key: 'present_pct', label: 'Present %' },
      { key: 'risk', label: 'Risk' },
    ],
  },
  engagement: {
    title: 'Engagement Analytics',
    icon: InsightsOutlined,
    color: '#7C3AED',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'submitted', label: 'Assignments Submitted' },
      { key: 'assignments', label: 'Assignment %' },
      { key: 'quizzes', label: 'Quiz Avg %' },
    ],
  },
  outstanding: {
    title: 'Outstanding Fees Breakdown',
    icon: AccountBalanceWalletOutlined,
    color: '#DC2626',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'payment_name', label: 'Fee' },
      { key: 'amount', label: 'Amount', money: true },
      { key: 'due_date', label: 'Due Date' },
      { key: 'status', label: 'Status' },
    ],
  },
  payments: {
    title: 'This Term Payments Breakdown',
    icon: CreditCardOutlined,
    color: '#16A34A',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'payment_name', label: 'Fee' },
      { key: 'amount', label: 'Amount Paid', money: true },
      { key: 'paid_date', label: 'Date' },
      { key: 'status', label: 'Status' },
    ],
  },
  pending: {
    title: 'Pending Payments Breakdown',
    icon: AccessTimeOutlined,
    color: '#D97706',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'payment_name', label: 'Fee' },
      { key: 'amount', label: 'Amount', money: true },
      { key: 'due_date', label: 'Due Date' },
      { key: 'status', label: 'Status' },
    ],
  },
  history: {
    title: 'Payment History Breakdown',
    icon: ReceiptLongOutlined,
    color: '#2563EB',
    columns: [
      { key: 'ward', label: 'Ward' },
      { key: 'payment_name', label: 'Fee' },
      { key: 'amount', label: 'Amount', money: true },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
    ],
  },
};

const riskColor = (risk) =>
  risk === 'At Risk' ? '#DC2626' : risk === 'Moderate' ? '#D97706' : '#16A34A';

/**
 * Detail modal for the parent analytics cards. On open it calls
 * /admission/parent-insights/detail?type=… and renders the rows in a table.
 */
const InsightsDetailModal = ({ open, onClose, type = 'academic' }) => {
  const cfg = CONFIGS[type] || CONFIGS.academic;
  const Icon = cfg.icon;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showAll, setShowAll] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');
    try {
      const res = await getParentInsightsDetail(type);
      if (res?.status) setRows(res.data || []);
      else setError(res?.message || 'Failed to load details');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [open, type]);

  useEffect(() => {
    if (open) {
      setPage(0);
      setRowsPerPage(8);
      setShowAll(false);
      fetchDetail();
    }
  }, [open, fetchDetail]);

  // Reset pagination whenever new data arrives
  useEffect(() => {
    setPage(0);
  }, [rows]);

  const visibleRows = showAll
    ? rows
    : rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px' } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          pr: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: `${cfg.color}1A`,
              color: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {cfg.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 2 }}>
            <Skeleton variant="rounded" height={200} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
              No records yet
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.25 }}>
              Details will appear here once data is available.
            </Typography>
          </Box>
        ) : (
          <>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  {cfg.columns.map((col) => (
                    <TableCell key={col.key} sx={{ fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row, i) => (
                  <TableRow key={i} hover>
                    {cfg.columns.map((col) => (
                      <TableCell key={col.key} sx={{ fontSize: '0.75rem' }}>
                        {col.key === 'risk' ? (
                          <Chip
                            label={row[col.key]}
                            size="small"
                            sx={{
                              fontSize: '0.62rem',
                              height: 20,
                              bgcolor: `${riskColor(row[col.key])}1A`,
                              color: riskColor(row[col.key]),
                              fontWeight: 700,
                            }}
                          />
                        ) : col.money ? (
                          `₦${(Number(row[col.key]) || 0).toLocaleString()}`
                        ) : (
                          row[col.key] ?? '—'
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Footer: View-all toggle + pagination ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {rows.length > rowsPerPage && (
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setShowAll((prev) => !prev);
                  setPage(0);
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: cfg.color }}
              >
                {showAll ? 'Show Less' : `View All (${rows.length})`}
              </Button>
            )}

            {!showAll && rows.length > rowsPerPage && (
              <TablePagination
                component="div"
                count={rows.length}
                page={Math.min(page, totalPages - 1)}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[8, 15, 25]}
                labelRowsPerPage="Rows"
                sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.72rem' } }}
              />
            )}
          </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InsightsDetailModal;
