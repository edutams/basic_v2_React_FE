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

const OverviewBreakdownModal = ({ open, type, extra = {}, onClose }) => {
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
      .get('/dashboard/admin/overview-breakdown', {
        params: {
          type,
          page: p + 1,
          per_page: rpp,
          search: term || undefined,
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

    return () => { cancelled = true; };
  };

  useEffect(() => {
    if (!open || !type) return;
    setPage(0);
    setSearch('');
    setSearchInput('');
    return fetchBreakdown(0, rowsPerPage, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleFetch = () => {
    setPage(0);
    setSearch(searchInput);
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
  const baseTitle = data?.title || 'Breakdown';
  const title = type === 'enrollment_by_class' && extra.class_code
    ? `Enrollment by Class for ${extra.class_code}`
    : baseTitle;
  const total = data?.total || 0;

  const headerBg = isDark ? '#1e293b' : '#f1f5f9';
  const headerColor = isDark ? 'rgba(255,255,255,0.7)' : '#475569';

  const columnsFor = () => {
    switch (type) {
      case 'teaching_staff':
      case 'non_teaching_staff':
        return [
          { key: 'staff_id', label: 'Staff ID', badge: true },
          { key: 'staff_status', label: 'Employment Status' },
          { key: 'sex', label: 'Gender', badge: true },
        ];
      case 'applicants':
      case 'admitted':
      case 'accepted':
        return [
          { key: 'form_number', label: 'Form Number', badge: true },
          { key: 'class', label: 'Intending Class' },
          { key: 'sex', label: 'Gender', badge: true },
          { key: 'status', label: 'Admission Status' },
        ];
      case 'batches':
        return [
          { key: 'batch_name', label: 'Batch Name' },
          { key: 'applicants', label: 'Total Applicants', numeric: true },
          { key: 'admitted', label: 'Admitted Count', numeric: true },
          { key: 'status', label: 'Batch Status' },
        ];
      case 'bursary_students':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class', label: 'Class' },
          { key: 'expected_fees', label: 'Expected Fees', numeric: true, currency: true },
          { key: 'collected_fees', label: 'Collected Fees', numeric: true, currency: true },
          { key: 'outstanding_fees', label: 'Outstanding Fees', numeric: true, currency: true },
          { key: 'efficiency', label: 'Collection Rate', numeric: true, percent: true },
        ];
      case 'collection_matrix':
        return [
          { key: 'status', label: 'Status' },
          { key: 'expected_fees', label: 'Expected Fees', numeric: true, currency: true },
          { key: 'collected_fees', label: 'Collected Fees', numeric: true, currency: true },
          { key: 'outstanding_fees', label: 'Outstanding Fees', numeric: true, currency: true },
          { key: 'efficiency', label: 'Collection Rate', numeric: true, percent: true },
        ];
      case 'expected_income':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class_code', label: 'Class' },
          { key: 'expected_amount', label: 'Expected Amount', numeric: true, currency: true },
        ];
      case 'collected_income':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class_code', label: 'Class' },
          { key: 'amount_paid', label: 'Amount Paid', numeric: true, currency: true },
        ];
      case 'outstanding_balance':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class_code', label: 'Class' },
          { key: 'total_expected', label: 'Expected Amount', numeric: true, currency: true },
          { key: 'total_paid', label: 'Amount Paid', numeric: true, currency: true },
          { key: 'balance', label: 'Outstanding Balance', numeric: true, currency: true },
        ];
      case 'collection_efficiency':
        return [
          { key: 'class_name', label: 'Class' },
          { key: 'expected', label: 'Expected Fees', numeric: true, currency: true },
          { key: 'collected', label: 'Collected Fees', numeric: true, currency: true },
          { key: 'outstanding', label: 'Outstanding Fees', numeric: true, currency: true },
          { key: 'efficiency', label: 'Collection Rate', numeric: true, percent: true },
        ];
      case 'lesson_plans':
        return [
          { key: 'creator', label: 'Created By (Teacher)' },
          { key: 'class', label: 'Class' },
          { key: 'status', label: 'Status' },
        ];
      case 'quizzes':
        return [
          { key: 'creator', label: 'Created By (Teacher)' },
          { key: 'class', label: 'Class' },
          { key: 'subject', label: 'Subject' },
          { key: 'questions', label: 'Total Questions', numeric: true },
          { key: 'status', label: 'Status' },
        ];
      case 'assignments':
        return [
          { key: 'creator', label: 'Created By (Teacher)' },
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
          { key: 'resource_type', label: 'Resource Type' },
          { key: 'creator', label: 'Created By' },
          { key: 'class', label: 'Class' },
          { key: 'status', label: 'Status' },
        ];
      case 'attendance':
      case 'attendance_rate':
        return [
          { key: 'class', label: 'Class' },
          { key: 'total_students', label: 'Total Students', numeric: true },
          { key: 'present', label: 'Total Present Marks', numeric: true },
          { key: 'absent', label: 'Total Absent Marks', numeric: true },
          { key: 'attendance_rate', label: 'Attendance Rate (%)', numeric: true, percent: true },
        ];
      case 'assignment_completion':
        return [
          { key: 'class', label: 'Class' },
          { key: 'submissions', label: 'Total Submissions', numeric: true },
          { key: 'due_date', label: 'Due Date' },
          { key: 'status', label: 'Status' },
        ];
      case 'exam_performance':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender', badge: true },
          { key: 'exams_taken', label: 'Exams Taken', numeric: true },
          { key: 'avg_score', label: 'Average Score (%)', numeric: true, percent: true },
        ];
      case 'underperforming_learners':
      case 'at_risk_grade':
      case 'drop_out_risk':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender', badge: true },
          { key: 'attendance_rate', label: 'Attendance Rate (%)', numeric: true, percent: true },
          { key: 'avg_score', label: 'Average Score (%)', numeric: true, percent: true },
        ];
      case 'enrollment_by_class':
        return [
          { key: 'user_id', label: 'Student ID', badge: true },
          { key: 'class_code', label: 'Class' },
          { key: 'sex', label: 'Gender', badge: true },
        ];
      case 'students':
      default:
        return [
          { key: 'admission_no', label: 'Admission No.', badge: true },
          { key: 'class', label: 'Class' },
          { key: 'sex', label: 'Gender', badge: true },
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

  const isBadgeChip = (col) => col.badge;

  const getBadgeColor = (col, value) => {
    const v = String(value || '').toLowerCase();
    if (col.key === 'sex') return v === 'male' ? 'info' : v === 'female' ? 'secondary' : 'default';
    if (col.key === 'admission_no' || col.key === 'user_id' || col.key === 'staff_id' || col.key === 'form_number') return 'primary';
    return 'default';
  };

  const showNameColumn = type !== 'attendance' && type !== 'attendance_rate'
    && type !== 'collection_matrix'
    && type !== 'collection_efficiency'
    && type !== 'batches';

  const idKeyForType = {
    teaching_staff: 'staff_id',
    non_teaching_staff: 'staff_id',
    applicants: 'form_number',
    admitted: 'form_number',
    accepted: 'form_number',
    students: 'admission_no',
    enrollment_by_class: 'user_id',
    bursary_students: 'user_id',
    expected_income: 'user_id',
    collected_income: 'user_id',
    outstanding_balance: 'user_id',
    underperforming_learners: 'user_id',
    at_risk_grade: 'user_id',
    drop_out_risk: 'user_id',
    exam_performance: 'user_id',
  };
  const idKey = idKeyForType[type] || null;
  const firstCol = idKey ? columns.find((c) => c.key === idKey) : null;
  const restCols = idKey ? columns.filter((c) => c.key !== idKey) : columns;

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

      <Box sx={{ px: 2, pt: 0.75, pb: 0.75, display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by name, ID, gender…"
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
          size="small"
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
          <Alert severity="info">No breakdown data available yet. Select filters and click Fetch.</Alert>
        ) : rows.length === 0 ? (
          <Alert severity="info">No records match your search.</Alert>
        ) : (
          <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: headerBg, color: headerColor, fontWeight: 700, fontSize: '11px' }}>#</TableCell>
                  {firstCol && (
                    <TableCell
                      align={firstCol.numeric ? 'right' : 'left'}
                      sx={{ bgcolor: headerBg, color: headerColor, fontWeight: 700, fontSize: '11px' }}
                    >
                      {firstCol.label}
                    </TableCell>
                  )}
                  {showNameColumn && (
                    <TableCell sx={{ bgcolor: headerBg, color: headerColor, fontWeight: 700, fontSize: '11px' }}>Name</TableCell>
                  )}
                  {restCols.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.numeric ? 'right' : 'left'}
                      sx={{ bgcolor: headerBg, color: headerColor, fontWeight: 700, fontSize: '11px' }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.user_id || row.form_number || row.batch_name || row.id || i}>
                    <TableCell sx={{ color: 'text.secondary' }}>{page * rowsPerPage + i + 1}</TableCell>
                    {firstCol && (
                      <TableCell align={firstCol.numeric ? 'right' : 'left'}>
                        {isStatusChip(firstCol) ? (
                          <Chip
                            label={formatValue(row, firstCol)}
                            size="small"
                            color={
                              String(row[firstCol.key]).toLowerCase() === 'active' ||
                              String(row[firstCol.key]).toLowerCase() === 'admitted' ||
                              String(row[firstCol.key]).toLowerCase() === 'accepted' ||
                              String(row[firstCol.key]).toLowerCase() === 'open' ||
                              String(row[firstCol.key]).toLowerCase() === 'graded'
                                ? 'success'
                                : String(row[firstCol.key]).toLowerCase() === 'pending' ||
                                    String(row[firstCol.key]).toLowerCase() === 'scheduled'
                                  ? 'warning'
                                  : 'default'
                            }
                            sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                          />
                        ) : isBadgeChip(firstCol) ? (
                          <Chip
                            label={formatValue(row, firstCol)}
                            size="small"
                            color={getBadgeColor(firstCol, row[firstCol.key])}
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20, fontWeight: 700 }}
                          />
                        ) : (
                          formatValue(row, firstCol)
                        )}
                      </TableCell>
                    )}
                    {showNameColumn && (
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
                    )}
                    {restCols.map((col) => (
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
                        ) : isBadgeChip(col) ? (
                          <Chip
                            label={formatValue(row, col)}
                            size="small"
                            color={getBadgeColor(col, row[col.key])}
                            variant="outlined"
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
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button disableRipple onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverviewBreakdownModal;
