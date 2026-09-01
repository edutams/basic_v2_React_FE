import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';

// Fallback titles until the backend returns a `title`.
const TITLES = {
  subjects: 'Subject Performance',
  results: 'Recent Results',
  attendance: 'Attendance Records',
  fees: 'My Fees',
  wallet: 'Wallet Transactions',
  assignments_submitted: 'Assignments Submitted',
  quizzes_taken: 'Quizzes Taken',
  tests_exams_taken: 'Tests / Exams Taken',
  resources_accessed: 'Resources Accessed',
  submission_rate: 'Submission Rate',
  quiz_average_score: 'Quiz Average Score',
  overall_average_score: 'Overall Average Score',
  subject_strength: 'Subject Strength',
  class_standing: 'Class Standing',
};

/**
 * Learner stat-card breakdown modal.
 *
 * Clicking a stat card opens a paginated table for that card, fetched from
 * /dashboard/learner/overview-breakdown. Supports:
 *   - `search`      → text filter sent to the backend
 *   - `sessionTerm` → optional preselected term (the stat cards reflect the
 *                     active term, so this is usually left empty and the
 *                     learner picks a term inside the modal)
 *   - `type`        → drives the column layout (see columnsFor)
 */
const LearnerBreakdownModal = ({ open, type, onClose, sessionTerm, academicOverview = {} }) => {
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

  const LOCAL_TYPES = [
    'assignments_submitted',
    'quizzes_taken',
    'tests_exams_taken',
    'resources_accessed',
    'submission_rate',
    'quiz_average_score',
    'overall_average_score',
    'subject_strength',
    'class_standing',
  ];
  const isLocal = LOCAL_TYPES.includes(type);

  const fetchBreakdown = (p = 0, rpp = rowsPerPage, termId = sessionTermId, term = search) => {
    if (!open || !type || isLocal) return () => {};

    let cancelled = false;
    setLoading(true);

    tenantApi
      .get('/dashboard/learner/overview-breakdown', {
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
        console.error('Failed to fetch learner overview breakdown:', err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  // Reset page + filters and refetch whenever the modal opens or the type changes.
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

  // ── Local breakdown rows for the Academic Overview cards (mocked data) ──
  const overviewRows = (() => {
    if (
      type !== 'assignments_submitted' &&
      type !== 'quizzes_taken' &&
      type !== 'tests_exams_taken' &&
      type !== 'resources_accessed' &&
      type !== 'submission_rate' &&
      type !== 'quiz_average_score' &&
      type !== 'overall_average_score' &&
      type !== 'subject_strength' &&
      type !== 'class_standing'
    ) {
      return [];
    }
    const subjects = Array.isArray(academicOverview.subjects) ? academicOverview.subjects : [];
    switch (type) {
      case 'assignments_submitted':
      case 'quizzes_taken':
      case 'tests_exams_taken':
      case 'resources_accessed':
        return subjects.length
          ? subjects.map((s, i) => ({
              id: `${type}_${i}`,
              subject: s.subject || `Subject ${i + 1}`,
              count: Math.max(1, Math.round((Number(s.score || 0) / 100) * 6)),
            }))
          : [1, 2, 3, 4].map((n) => ({
              id: `${type}_${n}`,
              subject: `Subject ${String.fromCharCode(64 + n)}`,
              count: n,
            }));
      case 'submission_rate':
      case 'quiz_average_score':
      case 'overall_average_score':
      case 'subject_strength':
        return subjects.length
          ? subjects.map((s, i) => ({
              id: `${type}_${i}`,
              subject: s.subject || `Subject ${i + 1}`,
              score: Number(s.score || 0),
            }))
          : [
              { id: `${type}_1`, subject: 'Civic Education', score: 90 },
              { id: `${type}_2`, subject: 'Mathematics', score: 84 },
              { id: `${type}_3`, subject: 'English Language', score: 76 },
            ];
      case 'class_standing':
        return [
          { id: 'cs_1', subject: 'Your Rank', score: 'Top 15%' },
          { id: 'cs_2', subject: 'Class Size', score: '120 students' },
        ];
      default:
        return [];
    }
  })();
  const displayRows = overviewRows.length ? overviewRows : rows;
  const displayTotal = overviewRows.length ? overviewRows.length : total;

  // ── Per-type column definition ────────────────────────────────────
  const columnsFor = () => {
    switch (type) {
      case 'subjects':
        return [
          { key: 'score', label: 'Score', numeric: true, percent: true },
          { key: 'grade', label: 'Grade', chip: true },
        ];
      case 'results':
        return [
          { key: 'type', label: 'Type' },
          { key: 'date', label: 'Date' },
          { key: 'score', label: 'Score', numeric: true, percent: true },
          { key: 'grade', label: 'Grade', chip: true },
        ];
      case 'attendance':
        return [
          { key: 'morning', label: 'Morning', chip: true },
          { key: 'afternoon', label: 'Afternoon', chip: true },
        ];
      case 'fees':
        return [
          { key: 'amount', label: 'Amount', numeric: true, currency: true },
          { key: 'paid', label: 'Paid', numeric: true, currency: true },
          { key: 'balance', label: 'Balance', numeric: true, currency: true },
          { key: 'status', label: 'Status', chip: true },
        ];
      case 'wallet':
        return [
          { key: 'amount', label: 'Amount', numeric: true, currency: true },
          { key: 'status', label: 'Status', chip: true },
          { key: 'date', label: 'Date' },
        ];
      case 'assignments_submitted':
      case 'quizzes_taken':
      case 'tests_exams_taken':
      case 'resources_accessed':
        return [
          { key: 'subject', label: 'Subject' },
          { key: 'count', label: 'Count', numeric: true },
        ];
      case 'submission_rate':
      case 'quiz_average_score':
      case 'overall_average_score':
      case 'subject_strength':
        return [
          { key: 'subject', label: 'Subject' },
          { key: 'score', label: 'Score', numeric: true, percent: true },
        ];
      case 'class_standing':
        return [
          { key: 'subject', label: 'Subject' },
          { key: 'score', label: 'Value' },
        ];
      default:
        return [];
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

  // Row label — attendance keys by its date; everything else by its name-ish
  // field so the first column never renders as a bare dash.
  const rowName = (row) =>
    row.subject || row.title || row.payment_name || row.description || row.date || '—';

  // First-column header, matching what rowName renders per type.
  const firstColLabel =
    type === 'attendance'
      ? 'Date'
      : type === 'fees'
        ? 'Payment'
        : type === 'wallet'
          ? 'Transaction'
          : type === 'subjects'
            ? 'Subject'
            : type === 'results'
              ? 'Result'
              : type === 'assignments_submitted' ||
                  type === 'quizzes_taken' ||
                  type === 'tests_exams_taken' ||
                  type === 'resources_accessed' ||
                  type === 'submission_rate' ||
                  type === 'quiz_average_score' ||
                  type === 'overall_average_score' ||
                  type === 'subject_strength' ||
                  type === 'class_standing'
                ? 'Subject'
                : 'Name';

  const chipColor = (value) => {
    const v = String(value || '').toLowerCase();
    if (['present', 'complete', 'approved', 'active', 'paid', 'a', 'b'].includes(v))
      return 'success';
    if (['absent', 'late', 'declined', 'incomplete', 'pending', 'c', 'd'].includes(v))
      return 'warning';
    if (v === 'f') return 'error';
    return 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        {title}
        <Chip
          label={`${displayTotal.toLocaleString()} records`}
          color="primary"
          size="small"
          sx={{ ml: 'auto', fontWeight: 700 }}
        />
      </DialogTitle>

      {/* Search + session term filter */}
      <Box
        sx={{
          px: 3,
          pt: 1,
          pb: 1,
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
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
              {st.session?.session_name} — {st.term?.term_name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !data && !isLocal ? (
          <Alert severity="info">No breakdown data available yet.</Alert>
        ) : displayRows.length === 0 ? (
          <Alert severity="info">No records match your search.</Alert>
        ) : (
          <TableContainer
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, overflowX: 'auto' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{firstColLabel}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRows.map((row, i) => (
                  <TableRow key={row.id || i}>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {page * rowsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                        {rowName(row)}
                      </Typography>
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                        {col.chip ? (
                          <Chip
                            label={formatValue(row, col)}
                            size="small"
                            color={chipColor(row[col.key])}
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
                    count={displayTotal}
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

export default LearnerBreakdownModal;
