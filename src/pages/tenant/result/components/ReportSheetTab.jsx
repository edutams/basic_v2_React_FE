import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  IconPrinter,
  IconClipboardCheck,
  IconArrowLeft,
  IconEye,
  IconFolder,
  IconUsers,
  IconMan,
  IconWoman,
  IconChartBar,
  IconSearch,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import { getResultTemplate } from './templates';
import StatCard from '@/components/shared/StatCard';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import {
  fetchSessionTerms,
  fetchActiveTenantSessionTerm,
} from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';
import { encodeLinkParams } from '@/utils/scoreLinks';
import { displayScore, buildReportProp, gradeScaleFor, printNode } from './reportCardUtils';

// API sends sex lowercase ('male'/'female') — case-insensitive check so
// either casing renders correctly.
const isMaleGender = (sex) => String(sex || '').toLowerCase() === 'male';

const ReportSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { getTemplateIndexForSample } = useResultTemplate();
  const printRef = useRef(null);

  // ── Filters ──────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassArm, setSelectedClassArm] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  const activeSessionTermRef = useRef(null);

  // session_id + term_id → session_term_id (the session_terms row id)
  const selectedSessionTerm = useMemo(() => {
    if (!selectedSession || !selectedTerm) return null;
    const match = sessionTerms.find(
      (st) =>
        String(st.session?.id) === String(selectedSession) &&
        String(st.term?.id) === String(selectedTerm),
    );
    return match?.id ?? null;
  }, [selectedSession, selectedTerm, sessionTerms]);

  // ── Data ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [termInfo, setTermInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);

  // ── UI state ─────────────────────────────────────────────
  // view: { mode: 'list' } | { mode: 'single', student } — the class dossier
  // prints straight from a hidden container instead of being a view mode.
  const [view, setView] = useState({ mode: 'list' });
  const [reportCache, setReportCache] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── Table search / sort ──────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'average' | 'position'
  const [sortDir, setSortDir] = useState('asc');
  // Flashes the table skeleton for a beat after a sort click — the data is
  // already in memory and re-renders instantly, but a control with zero
  // visual feedback reads as decorative rather than interactive.
  const [filtering, setFiltering] = useState(false);
  const filterFeedbackRef = useRef(null);

  useEffect(() => () => window.clearTimeout(filterFeedbackRef.current), []);

  const flashFiltering = () => {
    setFiltering(true);
    window.clearTimeout(filterFeedbackRef.current);
    filterFeedbackRef.current = setTimeout(() => setFiltering(false), 450);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    flashFiltering();
  };

  const displayedStudents = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    let rows = students;
    if (text) {
      rows = rows.filter((s) => {
        const name = `${s.lname || ''} ${s.fname || ''} ${s.mname || ''}`.toLowerCase();
        const admNo = String(s.admission_no || s.user_id || '').toLowerCase();
        return name.includes(text) || admNo.includes(text);
      });
    }
    if (sortBy) {
      const dir = sortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = sortBy === 'average' ? a.average_score : a.computed_position;
        const bv = sortBy === 'average' ? b.average_score : b.computed_position;
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        return (av - bv) * dir;
      });
    }
    return rows;
  }, [students, searchText, sortBy, sortDir]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Load dropdowns once (Class Register endpoints) ────────
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [sessRes, progRes, activeRes, stRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
          fetchSessionTerms(),
        ]);

        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);
        setSessionTerms(stRes?.data || []);

        if (programmesData[0]) setSelectedProgramme(programmesData[0].id);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        // Default to the active session-term (the term effect picks its term)
        const defaultSession =
          (activeSessionTerm && sessionsData.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionsData[0];
        if (defaultSession) setSelectedSession(defaultSession.id);
      } catch (err) {
        console.error('Failed to load dropdowns:', err);
      }
    };
    loadDropdowns();

    getTenantInfo()
      .then((data) => setSchoolInfo(data?.data || null))
      .catch(() => setSchoolInfo(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Terms for the selected session (defaults to the active term) ──
  useEffect(() => {
    if (!selectedSession) {
      setTerms([]);
      return;
    }
    fetchTerms(selectedSession)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId =
          activeSessionTerm?.session_id === selectedSession ? activeSessionTerm.term_id : null;
        const active = (activeTermId && data.find((t) => t.id === activeTermId)) || data[0];
        if (active) setSelectedTerm(active.id);
      })
      .catch(console.error);
  }, [selectedSession]);

  // ── Classes for the selected programme ─────────────────────
  useEffect(() => {
    if (!selectedProgramme) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(selectedProgramme)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
        setSelectedClass((prev) => (data.some((c) => c.id === prev) ? prev : (data[0]?.id ?? '')));
      })
      .catch(console.error);
  }, [selectedProgramme]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!selectedClass) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(
      selectedClass,
      selectedProgramme ? { programme_id: selectedProgramme } : {},
    )
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
        setSelectedClassArm((prev) =>
          data.some((a) => a.id === prev) ? prev : (data[0]?.id ?? ''),
        );
      })
      .catch(console.error);
  }, [selectedClass, selectedProgramme]);

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  // Clear stale students whenever the selection changes
  useEffect(() => {
    setDataFetched(false);
    setStudents([]);
    setStats(null);
    setClassInfo(null);
    setTermInfo(null);
    setSearchText('');
    setSortBy(null);
  }, [selectedSession, selectedTerm, selectedProgramme, selectedClass, selectedClassArm]);

  // ── Fetch class students (list + stat cards) — manual via Fetch ──
  const fetchClassStudents = async () => {
    if (!selectedClassArm || !selectedSessionTerm) return;
    setLoading(true);
    try {
      const res = await resultDossierApi.getClassStudents({
        class_arm_id: selectedClassArm,
        session_term_id: selectedSessionTerm,
      });
      // tenantApi returns the raw axios response: body is res.data = { status, data: {...} }
      const body = res?.data;
      if (body?.status) {
        setStudents(body.data?.students || []);
        setClassInfo(body.data?.class_arm || null);
        setTermInfo(body.data?.session_term || null);
        setStats(body.data?.stats || null);
        setDataFetched(true);
      } else {
        showSnackbar(body?.message || 'Failed to fetch students', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch class students:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to fetch class students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = () => {
    if (!selectedClassArm || !selectedSessionTerm) {
      showSnackbar(
        'Select Session, Term, Programme, Class and Class Arm, then click Fetch',
        'warning',
      );
      return;
    }
    fetchClassStudents();
  };

  // ── Auto-fetch once filters resolve (they preselect on load) ──
  useEffect(() => {
    if (selectedClassArm && selectedSessionTerm) {
      fetchClassStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassArm, selectedSessionTerm]);

  // ── Report card loading (single / class dossier) ─────────
  const loadStudentReport = async (studentRegistrationId) => {
    if (reportCache[studentRegistrationId]) return reportCache[studentRegistrationId];
    const res = await resultDossierApi.getStudentReport({
      student_registration_id: studentRegistrationId,
    });
    // Raw axios response: payload lives at res.data.data
    const body = res?.data;
    if (!body?.status) throw new Error(body?.message || 'Failed to fetch report');
    const report = body.data;
    setReportCache((prev) => ({ ...prev, [studentRegistrationId]: report }));
    return report;
  };

  const openSingleDossier = async (student) => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
    setReportLoading(true);
    try {
      await loadStudentReport(student.student_registration_id);
      setView({ mode: 'single', student });
    } catch (err) {
      console.error('Failed to load report:', err);
      showSnackbar(err?.message || 'Failed to load student report', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const openDossierById = (studentRegistrationId) => {
    const student = students.find((s) => s.student_registration_id === studentRegistrationId);
    if (!student) return;
    if (!student.has_result) {
      showSnackbar('No scores uploaded yet for this student', 'warning');
      return;
    }
    openSingleDossier(student);
  };

  // Opens the standalone Class Dossier page in a new tab (sidebar and all) —
  // that page loads and prints independently, so this list is never disturbed.
  const openClassDossier = () => {
    const params = new URLSearchParams({
      class_arm_id: selectedClassArm,
      session_term_id: selectedSessionTerm,
    });
    window.open(`/result-class_dossier?${params}`, '_blank', 'noopener,noreferrer');
  };

  // ── Print ────────────────────────────────────────────────
  const handlePrint = () => {
    if (!printNode(printRef.current, 'Print Dossier')) {
      showSnackbar('Pop-up blocked. Allow pop-ups to print the dossier.', 'warning');
    }
  };

  // ── Dossier rendering ────────────────────────────────────
  const renderDossier = (student) => {
    const report = reportCache[student.student_registration_id];
    if (!report) return null;
    // Prefer the division-scoped template returned by the dossier API;
    // fall back to the school-wide active template from context.
    const sample = report.result_template?.result_sample;
    const TemplateComponent = getResultTemplate(getTemplateIndexForSample(sample));
    const cls = classInfo
      ? `${classInfo.class_name || ''} ${classInfo.arm_name || ''}`.trim()
      : student.class_name;
    return (
      <TemplateComponent
        student={{
          ...student,
          user_id: student.admission_no || student.user_id,
          class_name: cls,
        }}
        report={buildReportProp(report)}
        sessionTerm={{
          label: `${termInfo?.session_name || report.session_term?.session_name || ''} - ${termInfo?.term_name || report.session_term?.term_name || ''}`,
          term_id: termInfo?.term_id ?? report.session_term?.term_id ?? null,
          closing_date: report.session_term?.end_date || '',
          resumption_date: '',
        }}
        className={cls}
        gradeScale={gradeScaleFor(report)}
      />
    );
  };

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';

  /* ── Dossier (single student) view ─────────────────────── */
  if (view.mode === 'single') {
    const studentsForView = [view.student];

    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconArrowLeft size={16} />}
              onClick={() => setView({ mode: 'list' })}
            >
              Back to Class List
            </Button>
            <Typography variant="h6" fontWeight={600}>
              Student Dossier — {view.student?.lname} {view.student?.fname}
            </Typography>
            {reportLoading && <CircularProgress size={18} />}
          </Box>
          {studentsForView.length > 0 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPrinter size={16} />}
              onClick={handlePrint}
            >
              Print Dossier
            </Button>
          )}
        </Box>

        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%', maxWidth: '100%' }}
          ref={printRef}
        >
          {studentsForView.length > 0 ? (
            studentsForView.map((s, i) => {
              const report = reportCache[s.student_registration_id];
              return (
                <Box
                  key={s.student_registration_id}
                  sx={{ mb: 2, '@media print': { pageBreakAfter: 'always' } }}
                >
                  {report ? (
                    renderDossier(s)
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CircularProgress size={22} />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Loading dossier for {s.lname} {s.fname}…
                      </Typography>
                    </Box>
                  )}
                  {i < studentsForView.length - 1 && <Divider sx={{ my: 4 }} />}
                </Box>
              );
            })
          ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <IconClipboardCheck
                size={48}
                color={isDark ? '#fff' : '#94a3b8'}
                style={{ marginBottom: 12 }}
              />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No dossiers available
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                There are no students with results to display for the selected class.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  /* ── Class list (dossier landing) view ─────────────────── */
  const className = [classInfo?.class_name, classInfo?.arm_name].filter(Boolean).join(' ');

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <StatCard
          count={stats?.total ?? 0}
          label="Total Students"
          subtitle={selectedClassArm ? `In ${className || 'selected class'}` : 'Select a class'}
          icon={IconUsers}
          colorIndex={0}
          loading={loading || (!selectedClassArm && true)}
        />
        <StatCard
          count={stats?.male ?? 0}
          label="Male Students"
          subtitle="Boys in class"
          icon={IconMan}
          colorIndex={1}
          loading={loading}
        />
        <StatCard
          count={stats?.female ?? 0}
          label="Female Students"
          subtitle="Girls in class"
          icon={IconWoman}
          colorIndex={2}
          loading={loading}
        />
        <StatCard
          count={stats ? `${stats.with_results}/${stats.total}` : '0/0'}
          label="Results Ready"
          subtitle={stats?.class_average !== null && stats?.class_average !== undefined ? `Class avg: ${stats.class_average}` : 'Students with scores'}
          icon={IconClipboardCheck}
          colorIndex={3}
          loading={loading}
        />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        {/* ── Card Header ─────────────────────────────────────── */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Students List — {selectedClassArm ? className || 'Selected class' : 'Select a class'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {students.filter((s) => s.has_result).length > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<IconPrinter size={16} />}
                onClick={openClassDossier}
              >
                View / Print Class Dossier
                <Chip
                  label={students.filter((s) => s.has_result).length}
                  size="small"
                  sx={{ ml: 1, bgcolor: 'success.main', color: '#fff', fontWeight: 700 }}
                />
              </Button>
            )}
          </Box>
        </Box>

        {/* ── Filters ─────────────────────────────────────────── */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={selectedSession}
                  label="Session"
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setSelectedTerm('');
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Session --</MenuItem>
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Term"
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Term --</MenuItem>
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.term_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={selectedProgramme}
                  label="Programme"
                  onChange={(e) => {
                    setSelectedProgramme(e.target.value);
                    setSelectedClass('');
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- All Programmes --</MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {filteredClasses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth size="small" disabled={!selectedClass}>
                <InputLabel>Class Arm</InputLabel>
                <Select
                  value={selectedClassArm}
                  label="Class Arm"
                  onChange={(e) => setSelectedClassArm(e.target.value)}
                >
                  <MenuItem value="">-- Select Arm --</MenuItem>
                  {filteredClassArms.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.class_arm_names}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleFetch}
                disabled={loading || !selectedClassArm || !selectedSessionTerm}
                sx={{ fontWeight: 600, height: '40px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* ── Search ──────────────────────────────────────────── */}
        {selectedClassArm && selectedSessionTerm && (dataFetched || loading) && (
          <Box sx={{ px: 2, pt: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name or admission no…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* ── Students Table ──────────────────────────────────── */}
        {selectedClassArm && selectedSessionTerm ? (
          <TableContainer sx={{ overflowX: 'auto', mt: 1 }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  {['#', 'Student', 'Subjects', 'Average', 'Position', 'Action'].map(
                    (h) => {
                      const sortKey =
                        h === 'Average' ? 'average' : h === 'Position' ? 'position' : null;
                      return (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            bgcolor: isDark ? 'grey.900' : 'grey.50',
                            cursor: sortKey ? 'pointer' : 'default',
                            userSelect: 'none',
                          }}
                          align={h === 'Student' ? 'left' : 'center'}
                          onClick={sortKey ? () => toggleSort(sortKey) : undefined}
                        >
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                            {h}
                            {sortKey &&
                              (sortBy === sortKey ? (
                                sortDir === 'asc' ? (
                                  <IconArrowUp size={13} />
                                ) : (
                                  <IconArrowDown size={13} />
                                )
                              ) : (
                                <IconArrowsSort size={13} opacity={0.4} />
                              ))}
                          </Box>
                        </TableCell>
                      );
                    },
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading || filtering ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell align="center">
                        <Skeleton variant="text" width={16} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width={140} />
                            <Skeleton variant="text" width={80} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton variant="text" width={36} sx={{ mx: 'auto' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton variant="text" width={28} sx={{ mx: 'auto' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {displayedStudents.map((s, i) => (
                      <TableRow
                        key={s.student_registration_id}
                        hover
                        sx={{
                          bgcolor:
                            i % 2 === 1
                              ? isDark
                                ? 'rgba(255,255,255,0.02)'
                                : 'rgba(0,0,0,0.015)'
                              : 'transparent',
                        }}
                      >
                        <TableCell align="center">{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={s.avatar || undefined}
                              sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}
                            >
                              {!s.avatar && `${s.fname?.[0] || ''}${s.lname?.[0] || ''}`}
                            </Avatar>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {s.lname} {s.fname} {s.mname}
                                </Typography>
                                {s.sex && (
                                  <Box
                                    title={s.sex}
                                    sx={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: '5px',
                                      flexShrink: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      bgcolor: alpha(
                                        isMaleGender(s.sex)
                                          ? theme.palette.primary.main
                                          : theme.palette.success.main,
                                        isDark ? 0.28 : 0.14,
                                      ),
                                      color: isMaleGender(s.sex)
                                        ? theme.palette.primary.main
                                        : theme.palette.success.main,
                                    }}
                                  >
                                    {isMaleGender(s.sex) ? 'M' : 'F'}
                                  </Box>
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {s.admission_no || s.user_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {s.subjects_scored}/{s.subjects_taken}
                        </TableCell>
                        <TableCell align="center">{displayScore(s.average_score)}</TableCell>
                        <TableCell align="center">
                          {s.average_score !== null && s.computed_position
                            ? s.computed_position
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip
                            title={
                              s.has_result
                                ? 'View dossier (report card)'
                                : 'No scores uploaded yet for this student'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={!s.has_result || reportLoading}
                                onClick={(e) => {
                                  setActionMenuAnchor(e.currentTarget);
                                  setActionMenuRow(s);
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayedStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <IconFolder
                              size={44}
                              color={isDark ? '#fff' : '#94a3b8'}
                              style={{ marginBottom: 8 }}
                            />
                            <Typography variant="h6" color="text.secondary" fontWeight={600}>
                              {!dataFetched
                                ? 'Click Fetch to load the student list'
                                : searchText
                                  ? 'No students match your search'
                                  : 'No students registered in this class arm for the selected term'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <IconFolder
              size={48}
              color={isDark ? '#fff' : '#94a3b8'}
              style={{ marginBottom: 12 }}
            />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the
              student list
            </Typography>
          </Box>
        )}

        {/* ── Student Count ───────────────────────────────────── */}
        {students.length > 0 && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Chip
              label={
                searchText
                  ? `${displayedStudents.length} of ${students.length} student(s) shown`
                  : `${students.length} student(s) found`
              }
              size="small"
              color="primary"
              variant="outlined"
            />
            {termInfo && (
              <Typography variant="caption" color="text.secondary">
                {termInfo.session_name} — {termInfo.term_name}
                {schoolName ? ` • ${schoolName}` : ''}
              </Typography>
            )}
          </Box>
        )}

        {/* ── Row Action Menu ─────────────────────────────────── */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => {
            setActionMenuAnchor(null);
            setActionMenuRow(null);
          }}
        >
          <MenuItem
            onClick={() => {
              const row = actionMenuRow;
              setActionMenuAnchor(null);
              setActionMenuRow(null);
              if (row) {
                const token = encodeLinkParams({
                  student_registration_id: row.student_registration_id,
                  session_term_id: selectedSessionTerm,
                  class_arm_id: selectedClassArm,
                });
                navigate(`/result-ca_breakdown?t=${token}`);
              }
            }}
          >
            <ListItemIcon>
              <IconChartBar size={18} />
            </ListItemIcon>
            <ListItemText>View C.A Report</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => openSingleDossier(actionMenuRow)}>
            <ListItemIcon>
              <IconEye size={18} />
            </ListItemIcon>
            <ListItemText>View Result</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportSheetTab;
