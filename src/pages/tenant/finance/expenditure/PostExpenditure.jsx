import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Checkbox,
  useTheme,
  Skeleton,
  Menu,
  MenuItem,
  Pagination,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import SessionTermFilter from '@/components/shared/filters/SessionTermFilter';
import PostingTrendChart from './components/PostingTrendChart';
import PostExpenditureModal from './components/PostExpenditureModal';
import tenantApi from '@/api/tenant/tenant_api';
import {
  IconLayersIntersect,
  IconSearch,
  IconPlus,
  IconCircleCheck,
  IconClockHour4,
  IconUsers,
  IconChartBar,
  IconInfoCircle,
  IconEye,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  STATUS_TABS,
  getEntryTabStatus,
  getPendingInstallment,
  mockPostingTrend,
  CATEGORY_DOT_COLORS,
  formatNaira,
  formatCompact,
} from './constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25, whiteSpace: 'nowrap' };
const tdCell = { py: 0.75, px: 1.25 };

const VENDOR_DOT_COLORS = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#64748B'];

const PostExpenditure = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [activeStatus, setActiveStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionTerm, setSessionTerm] = useState({ sessionId: null, termId: null });
  const [selectedIds, setSelectedIds] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [categoryDetailsOpen, setCategoryDetailsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEntries = useCallback(() => {
    setLoading(true);
    tenantApi
      .get('/expenditure/fetch_entries', {
        params: {
          ...(searchQuery ? { search: searchQuery } : {}),
          ...(sessionTerm.sessionId ? { session_id: sessionTerm.sessionId } : {}),
          ...(sessionTerm.termId ? { term_id: sessionTerm.termId } : {}),
        },
      })
      .then((res) => setEntries(res.data?.data || []))
      .catch(() => setSnackbar({ open: true, message: 'Could not load expenditure entries.', severity: 'error' }))
      .finally(() => setLoading(false));
  }, [searchQuery, sessionTerm]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const entriesWithTab = useMemo(() => entries.map((e) => ({ ...e, _tab: getEntryTabStatus(e) })), [entries]);

  const counts = useMemo(() => {
    const c = { pending: 0, outstanding: 0, full: 0, rejected: 0 };
    entriesWithTab.forEach((e) => {
      c[e._tab] = (c[e._tab] || 0) + 1;
    });
    return { ...c, all: entriesWithTab.length };
  }, [entriesWithTab]);

  const filteredData = useMemo(
    () => entriesWithTab.filter((e) => activeStatus === 'all' || e._tab === activeStatus),
    [entriesWithTab, activeStatus],
  );

  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // ===================== Stats + analytics (derived from the full, unfiltered entry list) =====================
  const stats = useMemo(() => {
    const totalExpenditure = entries.reduce((s, e) => s + Number(e.actual_amount), 0);
    const totalPaid = entries.reduce((s, e) => s + Number(e.paid_amount), 0);
    const outstandingBalance = entries
      .filter((e) => e.status === 'active')
      .reduce((s, e) => s + Number(e.balance_amount), 0);
    const vendorIds = new Set(entries.filter((e) => e.vendor_id).map((e) => e.vendor_id));
    return { totalExpenditure, totalPaid, outstandingBalance, totalVendorsInUse: vendorIds.size };
  }, [entries]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      const name = e.chart_of_account?.name || 'Uncategorized';
      map.set(name, (map.get(name) || 0) + Number(e.actual_amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const vendorConcentration = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      if (!e.vendor) return;
      const cur = map.get(e.vendor.name) || { vendor: e.vendor.name, actual: 0, paid: 0, balance: 0 };
      cur.actual += Number(e.actual_amount);
      cur.paid += Number(e.paid_amount);
      cur.balance += Number(e.balance_amount);
      map.set(e.vendor.name, cur);
    });
    const totalActual = stats.totalExpenditure || 1;
    return Array.from(map.values())
      .map((v) => ({ ...v, sharePct: Number(((v.actual / totalActual) * 100).toFixed(1)) }))
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }, [entries, stats.totalExpenditure]);

  const installmentAmountById = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => (e.installments || []).forEach((i) => map.set(i.id, Number(i.amount))));
    return map;
  }, [entries]);
  const selectedInstallmentTotal = selectedIds.reduce((s, id) => s + (installmentAmountById.get(id) || 0), 0);

  // ===================== Menu / modal / selection handlers =====================
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const openCreateModal = () => {
    setModalEntry(null);
    setModalOpen(true);
  };
  const openRowModal = (row) => {
    setModalEntry(row);
    setModalOpen(true);
    handleMenuClose();
  };

  const requestApprove = (row) => {
    const pending = getPendingInstallment(row);
    if (!pending) return;
    setConfirmAction({ type: 'approve', installmentIds: [pending.id], label: row.ref_no });
    handleMenuClose();
  };
  const requestReject = (row) => {
    const pending = getPendingInstallment(row);
    if (!pending) return;
    setRejectReason('');
    setConfirmAction({ type: 'reject', installmentIds: [pending.id], label: row.ref_no });
    handleMenuClose();
  };

  const toggleRow = (row) => {
    const pending = getPendingInstallment(row);
    if (!pending) return;
    setSelectedIds((prev) => (prev.includes(pending.id) ? prev.filter((x) => x !== pending.id) : [...prev, pending.id]));
  };
  const pendingRowsOnPage = paginatedData.filter((r) => getPendingInstallment(r));
  const toggleAllOnPage = () => {
    const ids = pendingRowsOnPage.map((r) => getPendingInstallment(r).id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => (allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]));
  };
  const clearSelection = () => setSelectedIds([]);

  const requestBulkApprove = () => setConfirmAction({ type: 'bulkApprove', installmentIds: [...selectedIds] });
  const requestBulkReject = () => {
    setRejectReason('');
    setConfirmAction({ type: 'bulkReject', installmentIds: [...selectedIds] });
  };

  const runConfirmedAction = () => {
    if (!confirmAction) return;
    const { type, installmentIds } = confirmAction;

    let request;
    if (type === 'approve') request = tenantApi.put(`/expenditure/installment/${installmentIds[0]}/approve`);
    else if (type === 'reject') request = tenantApi.put(`/expenditure/installment/${installmentIds[0]}/reject`, { rejection_reason: rejectReason || null });
    else if (type === 'bulkApprove') request = tenantApi.post('/expenditure/installments/bulk_approve', { installment_ids: installmentIds });
    else request = tenantApi.post('/expenditure/installments/bulk_reject', { installment_ids: installmentIds, rejection_reason: rejectReason || null });

    request
      .then(() => {
        setConfirmAction(null);
        setSelectedIds([]);
        setSnackbar({ open: true, message: 'Done.', severity: 'success' });
        fetchEntries();
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err.response?.data?.message || 'Something went wrong. Please try again.', severity: 'error' });
        setConfirmAction(null);
      });
  };

  const statusLabel = STATUS_TABS.find((s) => s.value === activeStatus)?.label.toLowerCase() || '';

  return (
    <PageContainer title="Post Expenditure" description="Record, approve and post school expenditure">
      <Box sx={{ mt: 1 }}>
        {/* ===================== Header ===================== */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconLayersIntersect size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Post Expenditure
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Record, approve and post school expenditure (goods, services and operational costs),
                with installment payments.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={openCreateModal}
            startIcon={<IconPlus size={18} />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Post Expenditure
          </Button>
        </Box>

        {/* ===================== Stats (full row) ===================== */}
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Expenditure (Actual Value)"
              count={formatNaira(stats.totalExpenditure)}
              icon={IconLayersIntersect}
              colorIndex={0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Paid"
              count={formatNaira(stats.totalPaid)}
              icon={IconCircleCheck}
              colorIndex={1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Outstanding Balance"
              count={formatNaira(stats.outstandingBalance)}
              icon={IconClockHour4}
              colorIndex={3}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Vendors (in Use)"
              count={stats.totalVendorsInUse}
              icon={IconUsers}
              colorIndex={2}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {/* ===================== Left: table ===================== */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <ParentCard
              sx={{
                '& .MuiCardContent-root': { p: 2, pt: 1.5, '&:last-child': { pb: 1 } },
              }}
            >
              {/* ===================== Status pills ===================== */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {STATUS_TABS.map((tab) => {
                  const active = activeStatus === tab.value;
                  return (
                    <Chip
                      key={tab.value}
                      label={`${tab.label} (${counts[tab.value] ?? 0})`}
                      onClick={() => {
                        setActiveStatus(tab.value);
                        setPage(1);
                      }}
                      sx={{
                        fontWeight: 700,
                        borderRadius: '8px',
                        bgcolor: active ? theme.palette.primary.main : 'transparent',
                        color: active ? '#fff' : 'text.secondary',
                        border: '1px solid',
                        borderColor: active ? theme.palette.primary.main : theme.palette.divider,
                        '&:hover': {
                          bgcolor: active ? theme.palette.primary.dark : theme.palette.action.hover,
                        },
                      }}
                    />
                  );
                })}
              </Box>

              {/* ===================== Search + Session/Term filter ===================== */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by ref. no. or description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <SessionTermFilter
                    autoSelectActive={false}
                    onChange={(value) => {
                      setSessionTerm(value);
                      setPage(1);
                    }}
                  />
                </Grid>
              </Grid>

              {/* ===================== Bulk selection bar ===================== */}
              {selectedIds.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.12)' : '#EFF6FF',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}`,
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCircleCheck size={16} color={theme.palette.primary.main} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      {selectedIds.length} selected
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      Total: {formatNaira(selectedInstallmentTotal)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={requestBulkApprove}
                      startIcon={<IconCircleCheck size={15} />}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Approve Selected ({selectedIds.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={requestBulkReject}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Reject Selected ({selectedIds.length})
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={clearSelection}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Clear Selection
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ===================== Table ===================== */}
              <TableContainer>
                <Table size="small" sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }} padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={pendingRowsOnPage.length > 0 && pendingRowsOnPage.every((r) => selectedIds.includes(getPendingInstallment(r).id))}
                          indeterminate={
                            pendingRowsOnPage.some((r) => selectedIds.includes(getPendingInstallment(r).id)) &&
                            !pendingRowsOnPage.every((r) => selectedIds.includes(getPendingInstallment(r).id))
                          }
                          onChange={toggleAllOnPage}
                          disabled={pendingRowsOnPage.length === 0}
                        />
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Ref. No.
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Description
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Vendor / Supplier
                      </TableCell>
                      <TableCell colSpan={3} align="center" sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>
                        Expenditure
                      </TableCell>
                      <TableCell colSpan={2} align="center" sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>
                        Payment Request
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Action
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        '& .MuiTableCell-root': { borderBottom: `2px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>Actual (₦)</TableCell>
                      <TableCell sx={thCell}>Paid (₦)</TableCell>
                      <TableCell sx={thCell}>Balance (₦)</TableCell>
                      <TableCell sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>Amount (₦)</TableCell>
                      <TableCell sx={thCell}>Instalment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: 9 }).map((__, cellIdx) => (
                            <TableCell key={cellIdx} sx={tdCell}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((row) => {
                        const pending = getPendingInstallment(row);
                        const isSelected = pending ? selectedIds.includes(pending.id) : false;
                        return (
                          <TableRow key={row.id} hover selected={isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox size="small" checked={isSelected} disabled={!pending} onChange={() => toggleRow(row)} />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700, color: theme.palette.primary.main }}>
                              {row.ref_no}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600, maxWidth: 180 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.description}</Typography>
                              <Chip
                                label={row.chart_of_account?.name || '—'}
                                size="small"
                                sx={{ bgcolor: theme.palette.action.hover, fontWeight: 700, fontSize: 10.5, height: 18, mt: 0.25 }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{row.vendor?.name || '—'}</TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{Number(row.actual_amount).toLocaleString('en-NG')}</TableCell>
                            <TableCell sx={{ ...tdCell, color: '#15803D', fontWeight: 600 }}>{Number(row.paid_amount).toLocaleString('en-NG')}</TableCell>
                            <TableCell sx={{ ...tdCell, color: Number(row.balance_amount) ? '#B45309' : 'text.disabled', fontWeight: 600 }}>
                              {Number(row.balance_amount).toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700 }}>
                              {pending ? Number(pending.amount).toLocaleString('en-NG') : '–'}
                            </TableCell>
                            <TableCell sx={tdCell}>
                              {pending ? (
                                <Chip label={`#${pending.sequence_no}`} size="small" sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, borderRadius: '8px' }} />
                              ) : (
                                '–'
                              )}
                            </TableCell>
                            <TableCell sx={tdCell} align="center">
                              <IconButton size="small" onClick={() => openRowModal(row)}>
                                <IconEye size={16} />
                              </IconButton>
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Alert severity="info" sx={{ my: 2, justifyContent: 'center' }}>
                            {searchQuery
                              ? 'No records match the current search.'
                              : `No ${statusLabel} entries found yet.`}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 1,
                  pt: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {filteredData.length === 0
                    ? `Showing 0 of 0 ${statusLabel} entries`
                    : `Showing ${(safePage - 1) * rowsPerPage + 1}–${Math.min(
                        safePage * rowsPerPage,
                        filteredData.length,
                      )} of ${filteredData.length} ${statusLabel} entries`}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={safePage}
                  onChange={(_, val) => setPage(val)}
                  shape="rounded"
                  color="primary"
                  size="small"
                />
              </Box>
            </ParentCard>
          </Grid>

          {/* ===================== Right: insights ===================== */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Expenditure by Category */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconChartBar size={18} color={theme.palette.primary.main} />
                      <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>
                        Expenditure by Category
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => setCategoryDetailsOpen(true)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}
                    >
                      View Details
                    </Button>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
                  '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 1 }}>
                  (Actual Value)
                </Typography>
                <ExpenditureByCategory data={categoryBreakdown} />
              </ParentCard>

              {/* Posting Trend */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Posting Trend</Typography>
                      <IconInfoCircle size={13} color={theme.palette.text.disabled} />
                    </Box>
                    <Chip
                      label="Last 7 Terms"
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 11.5, bgcolor: theme.palette.action.hover }}
                    />
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
                  '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
                }}
              >
                <Alert severity="info" sx={{ mb: 1, fontSize: 11.5, py: 0 }}>
                  Illustrative only — term-over-term posting trend isn&apos;t wired to real data yet.
                </Alert>
                <PostingTrendChart data={mockPostingTrend} />
              </ParentCard>

              {/* Vendor Concentration */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Vendor Concentration</Typography>
                    <IconInfoCircle size={13} color={theme.palette.text.disabled} />
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
                  '& .MuiCardContent-root': { p: 1, '&:last-child': { pb: 1 } },
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', px: 0.75, mb: 0.5 }}>
                  (Top 5 Vendors)
                </Typography>
                <Box sx={{ maxHeight: 240, overflowX: 'auto', overflowY: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 480 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...thCell, px: 0.75 }}>#</TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }}>Vendor / Supplier</TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Actual (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Paid (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Balance (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Share
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorConcentration.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ px: 0.75, py: 1, fontSize: 12, color: 'text.secondary' }}>
                            No vendor spend yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        vendorConcentration.map((v, idx) => (
                          <TableRow key={v.vendor} hover>
                            <TableCell sx={{ px: 0.75, py: 0.5 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: VENDOR_DOT_COLORS[idx % VENDOR_DOT_COLORS.length],
                                  display: 'inline-block',
                                  mr: 0.75,
                                }}
                              />
                              {idx + 1}
                            </TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 600, fontSize: 12.5 }}>
                              {v.vendor}
                            </TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5 }} align="right">
                              {v.actual.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: '#15803D' }} align="right">
                              {v.paid.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: v.balance ? '#B45309' : 'text.disabled' }} align="right">
                              {v.balance.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 12.5 }} align="right">
                              {v.sharePct}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </ParentCard>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Row action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => openRowModal(selectedRow)}>View Details</MenuItem>
        {selectedRow?._tab === 'pending' && [
          <MenuItem key="approve" onClick={() => requestApprove(selectedRow)}>Approve</MenuItem>,
          <MenuItem key="reject" onClick={() => requestReject(selectedRow)} sx={{ color: 'error.main' }}>
            Reject
          </MenuItem>,
        ]}
        {selectedRow?._tab === 'outstanding' && (
          <MenuItem onClick={() => openRowModal(selectedRow)}>Add Installment</MenuItem>
        )}
      </Menu>

      <PostExpenditureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entry={modalEntry}
        onSaved={fetchEntries}
      />

      {/* Confirmation dialog — approve / reject / bulk approve / bulk reject */}
      <ConfirmationDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
        title={
          (confirmAction?.type === 'approve' && 'Approve Payment') ||
          (confirmAction?.type === 'reject' && 'Reject Payment') ||
          (confirmAction?.type === 'bulkApprove' && `Approve ${confirmAction.installmentIds.length} Payment(s)`) ||
          (confirmAction?.type === 'bulkReject' && `Reject ${confirmAction.installmentIds.length} Payment(s)`) ||
          'Confirm Action'
        }
        message={
          (confirmAction?.type === 'approve' && `Approve the pending payment request for ${confirmAction.label}?`) ||
          (confirmAction?.type === 'reject' && `Reject the pending payment request for ${confirmAction.label}?`) ||
          (confirmAction?.type === 'bulkApprove' && `This will approve ${confirmAction?.installmentIds.length} selected payment request(s).`) ||
          (confirmAction?.type === 'bulkReject' && `This will reject ${confirmAction?.installmentIds.length} selected payment request(s).`) ||
          ''
        }
        content={
          (confirmAction?.type === 'reject' || confirmAction?.type === 'bulkReject') && (
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Rejection reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          )
        }
        severity={confirmAction?.type?.toLowerCase().includes('reject') ? 'error' : 'info'}
        confirmButtonSx={
          !confirmAction?.type?.toLowerCase().includes('reject') && {
            bgcolor: theme.palette.success.main,
            '&:hover': { bgcolor: theme.palette.success.dark },
          }
        }
      />

      {/* Expenditure by Category — full breakdown */}
      <Dialog open={categoryDetailsOpen} onClose={() => setCategoryDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Expenditure by Category</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actual (₦)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryBreakdown.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">{c.value.toLocaleString('en-NG')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

const ExpenditureByCategory = ({ data }) => {
  const total = data.reduce((sum, c) => sum + c.value, 0) || 1;
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: { xs: '100%', sm: 140 }, flexShrink: 0 }}>
        <ReusableDonutChart
          data={data.map((c, idx) => ({
            name: c.name,
            value: c.value,
            color: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length],
          }))}
          height={140}
          innerRadius={48}
          outerRadius={66}
          paddingAngle={2}
          centerValue={formatCompact(total)}
          centerTitle="Total Actual"
          valueFontSize={15}
          tooltipFormatter={(value, name) => [formatNaira(value), name]}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flexGrow: 1, minWidth: 0, width: '100%' }}>
        {data.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No expenditure posted yet.</Typography>
        ) : (
          data.map((c, idx) => {
            const pct = ((c.value / total) * 100).toFixed(0);
            return (
              <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length], flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    flexGrow: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
                  {formatCompact(c.value)} ({pct}%)
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default PostExpenditure;
