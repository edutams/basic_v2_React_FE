import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, useTheme, Alert,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Snackbar, CircularProgress, Chip,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions, fetchTerms, fetchProgrammes, fetchClassesByProgramme, fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

// Trim trailing zeros: 80.00 → 80, 10.01 → 10.01
const formatScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '');
  return String(parseFloat(num.toFixed(2)));
};

const SummarySheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── Dropdown data ───────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionTermsData, setSessionTermsData] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);

  const [filters, setFilters] = useState({
    session_id: '', term_id: '', programme_id: '', class_id: '', class_arm_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [breakdownDialog, setBreakdownDialog] = useState({ open: false, subject: null, grade: null });
  const [breakdown, setBreakdown] = useState({ loading: false, rows: [], total: 0, grade: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const activeSessionTermRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadDropdowns = async () => {
      try {
        const [sessRes, progRes, activeRes, stRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
          fetchSessionTerms(),
        ]);
        if (cancelled) return;

        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);
        setSessionTermsData(stRes?.data ?? []);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        // Preselect the active session (the term effect below picks its term).
        const defaultSession =
          (activeSessionTerm && sessionsData.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionsData[0];
        if (defaultSession) {
          setFilters((prev) => ({ ...prev, session_id: defaultSession.id }));
        }
      } catch (err) {
        console.error('Failed to load summary dropdowns:', err);
        if (!cancelled) showSnackbar('Failed to load filter options', 'error');
      }
    };

    loadDropdowns();
    return () => { cancelled = true; };
  }, []);

  // ── Terms for the selected session (defaults to the active term) ──
  useEffect(() => {
    if (!filters.session_id) {
      setTerms([]);
      return;
    }
    fetchTerms(filters.session_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === filters.session_id ? activeSessionTerm.term_id : null;
        const active = (activeTermId && data.find((t) => t.id === activeTermId)) || data[0];
        if (active) setFilters((prev) => ({ ...prev, term_id: active.id }));
      })
      .catch(console.error);
  }, [filters.session_id]);

  const sessionTermId = (() => {
    if (!filters.session_id || !filters.term_id) return null;
    const match = sessionTermsData.find(
      (st) => String(st.session?.id) === String(filters.session_id) && String(st.term?.id) === String(filters.term_id)
    );
    return match?.id ?? null;
  })();

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  // ── Classes for the selected programme ─────────────────────
  useEffect(() => {
    if (!filters.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filters.programme_id)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
      })
      .catch(console.error);
  }, [filters.programme_id]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!filters.class_id) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(filters.class_id, filters.programme_id ? { programme_id: filters.programme_id } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
      })
      .catch(console.error);
  }, [filters.class_id, filters.programme_id]);

  // ── Load the summary matrix via the Fetch button ─────────────
  const loadSummary = useCallback(async (classArmId, stId) => {
    setLoading(true);
    setError('');
    try {
      const res = await resultSheetApi.getSummary({
        class_arm_id: classArmId,
        session_term_id: stId,
      });
      setData(res?.data?.data ?? null);
    } catch (err) {
      console.error('Failed to fetch summary sheet:', err);
      setData(null);
      setError(err?.response?.data?.message || 'Failed to fetch summary sheet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetch = () => {
    if (!filters.class_arm_id || !sessionTermId) {
      setError('Select Session, Term, Programme, Class and Class Arm, then click Fetch.');
      return;
    }
    loadSummary(filters.class_arm_id, sessionTermId);
  };

  // Clear stale data whenever the selection changes
  useEffect(() => {
    setData(null);
    setError('');
  }, [filters.class_arm_id, sessionTermId]);

  // ── Breakdown dialog ────────────────────────────────────────
  const handleCellClick = async (subject, grade) => {
    if (!filters.class_arm_id || !sessionTermId) return;
    setBreakdownDialog({ open: true, subject, grade });
    setBreakdown({ loading: true, rows: [], total: 0, grade });
    try {
      const res = await resultSheetApi.getSummaryBreakdown({
        class_arm_id: filters.class_arm_id,
        session_term_id: sessionTermId,
        subject_id: subject.subject_id,
        grade: grade.grade,
      });
      const payload = res?.data?.data ?? {};
      setBreakdown({
        loading: false,
        rows: payload.breakdown ?? [],
        total: payload.total ?? 0,
        grade: payload.grade ?? grade,
      });
    } catch (err) {
      console.error('Failed to fetch breakdown:', err);
      setBreakdown({ loading: false, rows: [], total: 0, grade });
      showSnackbar(err?.response?.data?.message || 'Failed to fetch breakdown', 'error');
    }
  };

  const closeBreakdown = () => setBreakdownDialog({ open: false, subject: null, grade: null });

  // ── Export to CSV (opens in Excel) ──────────────────────────
  const handleExport = () => {
    if (!data) return;

    const rows = [];
    rows.push(['GRADE', ...data.subjects.map((s) => s.subject_name)]);
    (data.grades ?? []).forEach((g, gi) => {
      rows.push([
        `${g.grade} (${formatScore(g.min_score)} - ${formatScore(g.max_score)})`,
        ...data.subjects.map((s) => data.matrix?.[s.subject_id]?.[gi] ?? 0),
      ]);
    });
    rows.push(['OUTLIER', ...data.subjects.map((s) => data.outliers?.[s.subject_id] ?? 0)]);
    rows.push(['TOTAL', ...data.subjects.map((s) => data.totals?.[s.subject_id] ?? 0)]);

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const armName = (data.class_arm?.class_name && data.class_arm?.arm_name)
      ? `${data.class_arm.class_name}-${data.class_arm.arm_name}`
      : 'class';
    link.href = url;
    link.download = `summary-sheet-${armName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Summary sheet exported');
  };

  const showData = Boolean(data);
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const grades = data?.grades ?? [];
  const subjects = data?.subjects ?? [];
  const headerHeight = Math.max(280, grades.length * 49);

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="h6" fontWeight={700}>SUMMARY SHEET ON GRADE DISTRIBUTIONS.</Typography>
        {data && (
          <Typography variant="caption" color="text.secondary">
            {data.class_arm?.class_name} {data.class_arm?.arm_name} &middot; {data.session_term?.session_name} &middot; {data.session_term?.term_name}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        {/* ── Filters (inline, same card) ──────────────────────── */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select value={filters.session_id} label="Session" onChange={(e) => setFilters({ ...filters, session_id: e.target.value, term_id: '' })}>
                <MenuItem value="">-- Select Session --</MenuItem>
                {sessions.map((s) => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Term</InputLabel>
              <Select value={filters.term_id} label="Term" onChange={(e) => setFilters({ ...filters, term_id: e.target.value })}>
                <MenuItem value="">-- Select Term --</MenuItem>
                {terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select value={filters.programme_id} label="Programme" onChange={(e) => setFilters({ ...filters, programme_id: e.target.value, class_id: '', class_arm_id: '' })}>
                <MenuItem value="">-- Select Programme --</MenuItem>
                {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.programme_name || p.programme_title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={filters.class_id} label="Class" onChange={(e) => setFilters({ ...filters, class_id: e.target.value, class_arm_id: '' })}>
                <MenuItem value="">-- Select Class --</MenuItem>
                {filteredClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class Arm</InputLabel>
              <Select value={filters.class_arm_id} label="Class Arm" onChange={(e) => setFilters({ ...filters, class_arm_id: e.target.value })}>
                <MenuItem value="">-- Select Arm --</MenuItem>
                {filteredClassArms.map((a) => <MenuItem key={a.id} value={a.id}>{a.class_arm_names}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              fullWidth
              onClick={handleFetch}
              disabled={loading}
              sx={{ fontWeight: 600, height: '40px' }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Button
              variant="contained"
              size="small"
              color="success"
              fullWidth
              onClick={handleExport}
              disabled={!showData || loading}
            >
              Export to Excel
            </Button>
          </Grid>
        </Grid>

        {/* ── States ──────────────────────────────────────────── */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        {loading && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Loading summary sheet...
            </Typography>
          </Box>
        )}

        {!loading && !showData && !error && (
          <Alert severity="info">
            {filters.class_arm_id
              ? 'No summary data available for this selection. Ensure scores are uploaded and grade settings are configured for this term.'
              : 'Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the grade distribution summary.'}
          </Alert>
        )}

        {!loading && showData && (
          <>
            {subjects.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>No subjects registered for this class arm in the selected term.</Alert>
            )}

            {/* ── Table Container (scrollable) ────────────────── */}
            {subjects.length > 0 && (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 600, display: 'flex', flexDirection: 'column' }}>

                  {/* ── Main Data Row ─────────────────────────── */}
                  <Box sx={{ display: 'flex', mb: 0 }}>
                    {/* Left: GRADE header + grade labels */}
                    <Box sx={{ flexShrink: 0 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 140, height: headerHeight, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: isDark ? 'grey.900' : '#f5f5f5' }}>
                              GRADE
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {grades.map((g) => (
                            <TableRow key={`${g.grade}-${g.min_score}`}>
                              <TableCell sx={{ height: 49, fontWeight: 700, border: `1px solid ${borderColor}`, whiteSpace: 'nowrap' }}>
                                {g.grade} ({formatScore(g.min_score)} - {formatScore(g.max_score)})
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>

                    {/* Right: Subject columns */}
                    <Box sx={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
                      {subjects.map((subj) => (
                        <Box key={subj.subject_id} sx={{ flexShrink: 0, minWidth: 70 }}>
                          <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ height: headerHeight, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: isDark ? 'grey.900' : '#f5f5f5', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
                                  {subj.subject_name}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {grades.map((g, gi) => (
                                <TableRow key={`${subj.subject_id}-${g.grade}-${g.min_score}`}>
                                  <TableCell
                                    sx={{
                                      height: 49, fontWeight: 600, textAlign: 'center',
                                      border: `1px solid ${borderColor}`,
                                      cursor: 'pointer', textDecoration: 'underline',
                                    }}
                                    onClick={() => handleCellClick(subj, g)}
                                  >
                                    {data.matrix?.[subj.subject_id]?.[gi] ?? 0}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* ── OUTLIER Row ───────────────────────────── */}
                  <Box sx={{ display: 'flex', mb: 0 }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 140, height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: '#DC2626', color: '#fff' }}>
                              OUTLIER
                            </TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1 }}>
                      {subjects.map((subj) => (
                        <Box key={`outlier-${subj.subject_id}`} sx={{ flexShrink: 0, minWidth: 70 }}>
                          <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}`, bgcolor: '#DC2626', color: '#fff' }}>
                                  {data.outliers?.[subj.subject_id] ?? 0}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                          </Table>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* ── Total Row ─────────────────────────────── */}
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: 140, height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}` }}>
                              Total
                            </TableCell>
                          </TableRow>
                        </TableHead>
                      </Table>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1 }}>
                      {subjects.map((subj) => (
                        <Box key={`total-${subj.subject_id}`} sx={{ flexShrink: 0, minWidth: 70 }}>
                          <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ height: 49, fontWeight: 700, textAlign: 'center', border: `1px solid ${borderColor}` }}>
                                  {data.totals?.[subj.subject_id] ?? 0}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                          </Table>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ── Breakdown Dialog ────────────────────────────────── */}
      <Dialog open={breakdownDialog.open} onClose={closeBreakdown} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Summary Breakdown for {breakdownDialog.subject?.subject_name}
            </Typography>
            {breakdown.grade && (
              <Chip
                size="small"
                color="primary"
                label={`Grade ${breakdown.grade.grade} (${formatScore(breakdown.grade.min_score)} - ${formatScore(breakdown.grade.max_score)})`}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <IconX size={20} style={{ cursor: 'pointer' }} onClick={closeBreakdown} />
        </DialogTitle>
        <DialogContent dividers>
          {breakdown.loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={30} /></Box>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {breakdown.total} student(s) in this range{breakdown.rows.length < breakdown.total ? ` — showing first ${breakdown.rows.length}` : ''}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['#', 'Photo', 'Participant ID', 'Participant Name', 'CA Score', 'Exam Score', 'Total'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breakdown.rows.map((p, i) => (
                    <TableRow key={p.student_registration_id || i} hover>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{i + 1}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                        <Avatar src={p.avatar} sx={{ width: 28, height: 28, fontSize: 10 }}>
                          {!p.avatar && `${p.fname?.[0] ?? ''}${p.lname?.[0] ?? ''}`}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.admission_no}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontWeight: 500 }}>{p.lname} {p.fname} {p.mname}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.ca_total ?? '-'}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.exam_score ?? '-'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{p.overall_total}</TableCell>
                    </TableRow>
                  ))}
                  {breakdown.rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No students in this range</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBreakdown}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default SummarySheetTab;
