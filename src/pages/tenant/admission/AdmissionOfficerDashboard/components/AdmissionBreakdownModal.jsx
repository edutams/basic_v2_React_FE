import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import tenantApi from '@/api/tenant/tenant_api';

// Fallback titles used until the backend returns a `title` for the payload —
// keeps the dialog header meaningful for every admission card type.
const TITLES = {
  applicants: 'Total Applicants',
  batches: 'Total Batches Created',
  admitted: 'Total Admitted',
  accepted: 'Total Accepted',
  pending_review: 'Pending Review',
  pre_application_fees: 'Pre-Application Fees',
  post_application_fees: 'Post-Application Fees',
  total_fees: 'Total Fees Collected',
};

/**
 * Admission dashboard stat card breakdown modal.
 *
 * Mirrors the AdminDashboard OverviewBreakdownModal: clicking a stat card
 * opens a paginated table for that card, fetched from
 * /dashboard/admission/overview-breakdown. Supports:
 *   - `search`       → text filter sent to the backend
 *   - `sessionTerm`  → dropdown of subscribed session terms sent as
 *                      session_term_id; defaults to the dashboard's selected
 *                      session term (honored where applicable)
 *   - `type`         → drives the column layout (see columnsFor)
 *
 * Expected payload shape (same as admin): { status, data: { title, total, rows } }.
 * Fee rows should carry `class` (rendered as the row name) plus the numeric keys
 * below; applicant/admitted/accepted rows carry form_number/class/gender/status;
 * batch rows carry batch_name/applicants/admitted/status.
 */
const AdmissionBreakdownModal = ({ open, type, onClose, sessionTerm }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const fetchBreakdown = (p = 0, rpp = rowsPerPage, term = search) => {
    if (!open || !type) return;

    let cancelled = false;
    setLoading(true);

    tenantApi
      .get('/dashboard/admission/overview-breakdown', {
        params: {
          type,
          page: p + 1,
          per_page: rpp,
          search: term || undefined,
          session_term_id: sessionTerm || undefined,
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data?.status ? res.data.data : null);
      })
      .catch((err) => {
        console.error('Failed to fetch admission overview breakdown:', err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  // Auto-fetch on open/type change; reset filters.
  useEffect(() => {
    if (!open || !type) return;
    setPage(0);
    setSearch('');
    setSearchInput('');
    return fetchBreakdown(0, rowsPerPage, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, sessionTerm]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleFetch = () => {
    setSearch(searchInput);
    setPage(0);
    fetchBreakdown(0, rowsPerPage, searchInput);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchBreakdown(newPage, rowsPerPage, search);
  };

  const handleChangeRowsPerPage = (e) => {
    const rpp = parseInt(e.target.value, 10);
    setRowsPerPage(rpp);
    setPage(0);
    fetchBreakdown(0, rpp, search);
  };

  const rows = data?.rows || [];
  const title = data?.title || TITLES[type] || 'Breakdown';
  const total = data?.total || 0;

  // ── Per-type column definition ────────────────────────────────────
  const columnsFor = () => {
    switch (type) {
      case 'applicants':
      case 'admitted':
      case 'accepted':
      case 'pending_review':
        return [
          { key: 'form_number', label: 'Form No.', badge: true },
          { key: 'name', label: 'Name' },
          { key: 'class', label: 'Class' },
          { key: 'gender', label: 'Gender' },
          { key: 'status', label: 'Status' },
        ];
      case 'batches':
        return [
          { key: 'batch_name', label: 'Batch' },
          { key: 'applicants', label: 'Applicants', numeric: true },
          { key: 'admitted', label: 'Admitted', numeric: true },
          { key: 'status', label: 'Status' },
        ];
      case 'pre_application_fees':
        return [
          { key: 'forms', label: 'Forms', numeric: true },
          { key: 'amount', label: 'Amount', numeric: true, currency: true },
        ];
      case 'post_application_fees':
        return [
          { key: 'acceptances', label: 'Accepted', numeric: true },
          { key: 'amount', label: 'Amount', numeric: true, currency: true },
        ];
      case 'total_fees':
        return [
          { key: 'amount', label: 'Amount', numeric: true, currency: true },
        ];
      default:
        return [
          { key: 'class', label: 'Class' },
          { key: 'gender', label: 'Gender' },
          { key: 'status', label: 'Status' },
        ];
    }
  };
  const columns = columnsFor();

  const formatValue = (row, col) => {
    const v = row[col.key];
    if (col.currency) return `₦${Number(v || 0).toLocaleString('en-NG')}`;
    if (col.percent) return `${Number(v || 0).toFixed(1)}%`;
    if (col.numeric) return Number(v || 0).toLocaleString();
    return v || '—';
  };

  const isStatusChip = (col) => col.key === 'status';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {title}
        <Chip
          label={`${total.toLocaleString()} ${type === 'batches' ? 'batches' : 'records'}`}
          color="primary"
          size="small"
          sx={{ ml: 'auto', fontWeight: 700 }}
        />
      </DialogTitle>

      {/* Search + Fetch */}
      <Box sx={{ px: 3, pt: 1, pb: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleFetch(); }}
          sx={{ flex: '1 1 220px', maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          disableRipple
          onClick={handleFetch}
        >
          Fetch
        </Button>
      </Box>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !data ? (
          <Alert severity="info">No breakdown data available yet.</Alert>
        ) : rows.length === 0 ? (
          <Alert severity="info">No records match your search.</Alert>
        ) : (
          <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.user_id || row.form_number || row.batch_name || row.id || i}>
                    <TableCell sx={{ color: 'text.secondary' }}>{page * rowsPerPage + i + 1}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                        {col.badge ? (
                          <Chip
                            label={formatValue(row, col)}
                            size="small"
                            color="primary"
                            sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                          />
                        ) : isStatusChip(col) ? (
                          <Chip
                            label={formatValue(row, col)}
                            size="small"
                            color={
                              String(row[col.key]).toLowerCase() === 'active' ||
                              String(row[col.key]).toLowerCase() === 'admitted' ||
                              String(row[col.key]).toLowerCase() === 'accepted' ||
                              String(row[col.key]).toLowerCase() === 'open' ||
                              String(row[col.key]).toLowerCase() === 'graded'
                                ? 'success'
                                : String(row[col.key]).toLowerCase() === 'pending' ||
                                    String(row[col.key]).toLowerCase() === 'scheduled'
                                  ? 'warning'
                                  : 'default'
                            }
                            sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                          />
                        ) : (
                          formatValue(row, col)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdmissionBreakdownModal;
