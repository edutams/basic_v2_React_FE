import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  InputAdornment,
  MenuItem,
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
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';

// Fallback titles used until the backend returns a `title` for the payload —
// keeps the dialog header meaningful for every admission card type.
const TITLES = {
  applicants: 'Total Applicants',
  batches: 'Total Batches Created',
  admitted: 'Total Admitted',
  accepted: 'Total Accepted',
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
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionTermId, setSessionTermId] = useState(sessionTerm || '');
  const searchTimer = useRef(null);

  // Load session terms once (for the dropdown).
  useEffect(() => {
    let mounted = true;
    fetchSessionTerms()
      .then((res) => {
        if (mounted && res?.status) setSessionTerms(res.data || []);
      })
      .catch((err) => console.error('Failed to fetch session terms:', err));
    return () => {
      mounted = false;
    };
  }, []);

  const fetchBreakdown = (p = 0, rpp = rowsPerPage, termId = sessionTermId, term = search) => {
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
          session_term_id: termId || undefined,
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

  // Reset page + filters and refetch whenever the modal opens or the type
  // changes. Defaults the session term to the dashboard's current selection.
  useEffect(() => {
    if (!open || !type) return;
    setPage(0);
    setSearch('');
    setSearchInput('');
    setSessionTermId(sessionTerm || '');
    return fetchBreakdown(0, rowsPerPage, sessionTerm || '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, sessionTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
      fetchBreakdown(0, rowsPerPage, sessionTermId, value);
    }, 400);
  };

  const handleTermChange = (e) => {
    const value = e.target.value;
    setSessionTermId(value);
    setPage(0);
    fetchBreakdown(0, rowsPerPage, value, search);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchBreakdown(newPage, rowsPerPage, sessionTermId, search);
  };

  const handleChangeRowsPerPage = (e) => {
    const rpp = parseInt(e.target.value, 10);
    setRowsPerPage(rpp);
    setPage(0);
    fetchBreakdown(0, rpp, sessionTermId, search);
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
        return [
          { key: 'form_number', label: 'Form No.' },
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

  // Row label — fee rows are keyed by class; applicant/batch rows by name/batch.
  const rowName = (row) => row.name || row.class || row.batch_name || '—';

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

      {/* Search + session term filter */}
      <Box sx={{ px: 3, pt: 1, pb: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={searchInput}
          onChange={handleSearchChange}
          sx={{ flex: '1 1 220px', maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Session Term"
          value={sessionTermId}
          onChange={handleTermChange}
          sx={{ flex: '1 1 200px', maxWidth: 260 }}
        >
          <MenuItem value="">
            <em>All session terms</em>
          </MenuItem>
          {sessionTerms.map((st) => (
            <MenuItem key={st.id} value={String(st.id)}>
              {st.session?.sesname} — {st.display_term?.display_name}
            </MenuItem>
          ))}
        </TextField>
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
                  <TableCell>Name</TableCell>
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={row.avatar || ''}
                          alt={rowName(row)}
                          sx={{ width: 34, height: 34, fontSize: 14, bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300] }}
                        >
                          {rowName(row).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                            {rowName(row)}
                          </Typography>
                          {row.email && (
                            <Typography variant="caption" color="text.secondary">
                              {row.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                        {isStatusChip(col) ? (
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
