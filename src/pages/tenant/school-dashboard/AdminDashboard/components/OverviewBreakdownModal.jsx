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

/**
 * Admin dashboard stat card breakdown modal.
 *
 * Fetches a paginated list for the clicked stat card and renders it as a
 * table. Supports:
 *   - `search`      → text filter sent to the backend
 *   - `sessionTerm` → dropdown of subscribed session terms sent as
 *                     session_term_id (all types honor it where applicable)
 *   - `type`        → drives the column layout (see columnsFor)
 */
const OverviewBreakdownModal = ({ open, type, extra = {}, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionTermId, setSessionTermId] = useState('');
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
      .get('/dashboard/admin/overview-breakdown', {
        params: {
          type,
          page: p + 1,
          per_page: rpp,
          search: term || undefined,
          session_term_id: termId || undefined,
          ...extra,
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data?.status ? res.data.data : null);
      })
      .catch((err) => {
        console.error('Failed to fetch overview breakdown:', err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  };

  // Reset page + refetch whenever the modal opens or the type changes.
  useEffect(() => {
    if (!open || !type) return;
    setPage(0);
    setSearch('');
    setSearchInput('');
    setSessionTermId('');
    return fetchBreakdown(0, rowsPerPage, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

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
  const title = data?.title || 'Breakdown';
  const total = data?.total || 0;

  // ── Per-type column definition ────────────────────────────────────
  const columnsFor = () => {
    switch (type) {
      case 'teaching_staff':
      case 'non_teaching_staff':
        return [
          { key: 'staff_id', label: 'Staff ID' },
          { key: 'staff_type', label: 'Type' },
          { key: 'staff_status', label: 'Status' },
          { key: 'sex', label: 'Gender' },
        ];
      case 'applicants':
      case 'admitted':
      case 'accepted':
        return [
          { key: 'form_number', label: 'Form No.' },
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender' },
          { key: 'status', label: 'Status' },
        ];
      case 'batches':
        return [
          { key: 'batch_name', label: 'Batch' },
          { key: 'applicants', label: 'Applicants', numeric: true },
          { key: 'admitted', label: 'Admitted', numeric: true },
          { key: 'status', label: 'Status' },
        ];
      case 'bursary_students':
        return [
          { key: 'class', label: 'Class' },
          { key: 'expected_fees', label: 'Expected', numeric: true, currency: true },
          { key: 'collected_fees', label: 'Collected', numeric: true, currency: true },
          { key: 'outstanding_fees', label: 'Outstanding', numeric: true, currency: true },
          { key: 'efficiency', label: 'Rate', numeric: true, percent: true },
        ];
      case 'collection_matrix':
        return [
          { key: 'status', label: 'Status' },
          { key: 'expected_fees', label: 'Expected', numeric: true, currency: true },
          { key: 'collected_fees', label: 'Collected', numeric: true, currency: true },
          { key: 'outstanding_fees', label: 'Outstanding', numeric: true, currency: true },
          { key: 'efficiency', label: 'Rate', numeric: true, percent: true },
        ];
      case 'expected_income':
        return [
          { key: 'student_name', label: 'Student' },
          { key: 'class_name', label: 'Class' },
          { key: 'expected_amount', label: 'Expected', numeric: true, currency: true },
          { key: 'term_label', label: 'Term' },
        ];
      case 'collected_income':
        return [
          { key: 'student_name', label: 'Student' },
          { key: 'class_name', label: 'Class' },
          { key: 'amount_paid', label: 'Amount Paid', numeric: true, currency: true },
          { key: 'payment_date', label: 'Date' },
        ];
      case 'outstanding_balance':
        return [
          { key: 'student_name', label: 'Student' },
          { key: 'class_name', label: 'Class' },
          { key: 'total_expected', label: 'Expected', numeric: true, currency: true },
          { key: 'total_paid', label: 'Paid', numeric: true, currency: true },
          { key: 'balance', label: 'Outstanding', numeric: true, currency: true },
        ];
      case 'collection_efficiency':
        return [
          { key: 'class_name', label: 'Class' },
          { key: 'expected', label: 'Expected', numeric: true, currency: true },
          { key: 'collected', label: 'Collected', numeric: true, currency: true },
          { key: 'outstanding', label: 'Outstanding', numeric: true, currency: true },
          { key: 'efficiency', label: 'Rate', numeric: true, percent: true },
        ];
      case 'lesson_plans':
        return [
          { key: 'creator', label: 'Teacher' },
          { key: 'class', label: 'Class' },
          { key: 'status', label: 'Status' },
        ];
      case 'quizzes':
        return [
          { key: 'creator', label: 'Created By' },
          { key: 'class', label: 'Class' },
          { key: 'subject', label: 'Subject' },
          { key: 'questions', label: 'Questions', numeric: true },
          { key: 'status', label: 'Status' },
        ];
      case 'assignments':
        return [
          { key: 'creator', label: 'Created By' },
          { key: 'class', label: 'Class' },
          { key: 'subject', label: 'Subject' },
          { key: 'due_date', label: 'Due Date' },
          { key: 'status', label: 'Status' },
        ];
      case 'video_resources':
        return [
          { key: 'class', label: 'Class' },
          { key: 'status', label: 'Status' },
        ];
      case 'resources':
        return [
          { key: 'resource_type', label: 'Type' },
          { key: 'creator', label: 'Created By' },
          { key: 'class', label: 'Class' },
          { key: 'status', label: 'Status' },
        ];
      case 'attendance_rate':
        return [
          { key: 'class', label: 'Class' },
          { key: 'present', label: 'Present', numeric: true },
          { key: 'absent', label: 'Absent', numeric: true },
          { key: 'attendance_rate', label: 'Rate', numeric: true, percent: true },
        ];
      case 'assignment_completion':
        return [
          { key: 'class', label: 'Class' },
          { key: 'submissions', label: 'Submissions', numeric: true },
          { key: 'due_date', label: 'Due Date' },
          { key: 'status', label: 'Status' },
        ];
      case 'exam_performance':
        return [
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender' },
          { key: 'exams_taken', label: 'Exams', numeric: true },
          { key: 'avg_score', label: 'Avg %', numeric: true, percent: true },
        ];
      case 'underperforming_learners':
      case 'at_risk_grade':
      case 'drop_out_risk':
        return [
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender' },
          { key: 'attendance_rate', label: 'Attendance', numeric: true, percent: true },
          { key: 'avg_score', label: 'Avg Score', numeric: true, percent: true },
        ];
      case 'enrollment_by_class':
        return [
          { key: 'user_id', label: 'User ID' },
          { key: 'student_name', label: 'Name' },
          { key: 'sex', label: 'Gender' },
          { key: 'class_name', label: 'Class' },
        ];
      case 'students':
      default:
        return [
          { key: 'admission_no', label: 'Admission No.' },
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender' },
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

  const isStatusChip = (col) => col.key === 'staff_status' || col.key === 'status';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {title}
        <Chip
          label={`${total.toLocaleString()} ${type === 'batches' ? 'batches' : type === 'collection_matrix' ? 'classes' : type === 'enrollment_by_class' ? 'students' : 'records'}`}
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
                          alt={row.name || row.student_name || row.class || row.batch_name}
                          sx={{ width: 34, height: 34, fontSize: 14, bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300] }}
                        >
                          {(row.name || row.student_name || row.class || row.batch_name || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                            {row.name || row.student_name || row.class || row.batch_name || '—'}
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

export default OverviewBreakdownModal;
