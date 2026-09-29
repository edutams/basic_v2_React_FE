import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, Stack, Tooltip, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconPrinter, IconClipboardCheck, IconArrowLeft, IconEye, IconFolder, IconUsers, IconMan, IconWoman, IconChartBar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import { getResultTemplate } from './templates';
import StatCard from '@/components/shared/StatCard';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions, fetchTerms, fetchProgrammes, fetchClassesByProgramme, fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';
import {
  displayScore, buildReportProp, gradeScaleFor, printNode,
} from './reportCardUtils';

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

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
      (st) => String(st.session?.id) === String(selectedSession) && String(st.term?.id) === String(selectedTerm)
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
  // view: { mode: 'list' } | { mode: 'single', student } | { mode: 'class' }
  const [view, setView] = useState({ mode: 'list' });
  const [reportCache, setReportCache] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      })
      .catch(console.error);
  }, [selectedProgramme]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!selectedClass) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(selectedClass, selectedProgramme ? { programme_id: selectedProgramme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
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
      showSnackbar(
        err?.response?.data?.message || 'Failed to fetch class students',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = () => {
    if (!selectedClassArm || !selectedSessionTerm) {
      showSnackbar('Select Session, Term, Programme, Class and Class Arm, then click Fetch', 'warning');
      return;
    }
    fetchClassStudents();
  };

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

  const openClassDossier = async () => {
    setReportLoading(true);
    try {
      // Preload all reports so the print output is complete
      await Promise.all(
        students
          .filter((s) => s.has_result)
          .map((s) => loadStudentReport(s.student_registration_id).catch(() => null))
      );
      setView({ mode: 'class' });
    } catch (err) {
      console.error('Failed to load class dossier:', err);
      showSnackbar('Failed to load class dossiers', 'error');
    } finally {
      setReportLoading(false);
    }
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
          closing_date: report.session_term?.end_date || '',
          resumption_date: '',
        }}
        className={cls}
        gradeScale={gradeScaleFor(report)}
      />
    );
  };

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';

  /* ── Dossier (single / class) view ─────────────────────── */
  if (view.mode === 'single' || view.mode === 'class') {
    const studentsForView =
      view.mode === 'single'
        ? [view.student]
        : students.filter((s) => s.has_result);

    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" startIcon={<IconArrowLeft size={16} />} onClick={() => setView({ mode: 'list' })}>
              Back to Class List
            </Button>
            <Typography variant="h6" fontWeight={600}>
              {view.mode === 'single'
                ? `Student Dossier — ${view.student?.lname} ${view.student?.fname}`
                : `Class Dossier — ${[classInfo?.class_name, classInfo?.arm_name].filter(Boolean).join(' ')} (${studentsForView.length})`}
            </Typography>
            {reportLoading && <CircularProgress size={18} />}
          </Box>
          {studentsForView.length > 0 && (
            <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
              Print Dossier
            </Button>
          )}
        </Box>

        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%', maxWidth: '100%' }} ref={printRef}>
          {studentsForView.length > 0 ? (
            studentsForView.map((s, i) => {
              const report = reportCache[s.student_registration_id];
              return (
                <Box key={s.student_registration_id} sx={{ mb: 2, '@media print': { pageBreakAfter: 'always' } }}>
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
                  {report && view.mode === 'class' && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <Chip size="small" label={`${report.summary?.average_score ?? '-'} avg • ${report.summary?.overall_position || '-'} in class`} variant="outlined" />
                    </Box>
                  )}
                  {i < studentsForView.length - 1 && <Divider sx={{ my: 4 }} />}
                </Box>
              );
            })
          ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <IconClipboardCheck size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
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

      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>

      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Students List — {selectedClassArm ? (className || 'Selected class') : 'Select a class'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedClassArm && (
            <Tooltip title="Open the performance analytics for this class arm">
              <Button
                variant="outlined"
                size="small"
                color="info"
                startIcon={<IconChartBar size={16} />}
                onClick={() => navigate(`/result-analytics?session_term_id=${selectedSessionTerm}&class_arm_id=${selectedClassArm}`)}
              >
                Analytics
              </Button>
            </Tooltip>
          )}
          {students.filter((s) => s.has_result).length > 0 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPrinter size={16} />}
              onClick={openClassDossier}
              disabled={reportLoading}
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
                  <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>
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
                  <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>
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
                  <MenuItem key={p.id} value={p.id}>{p.programme_name}</MenuItem>
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
                  <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>
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
                  <MenuItem key={a.id} value={a.id}>{a.class_arm_names}</MenuItem>
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

      {/* ── Students Table ──────────────────────────────────── */}
      {selectedClassArm && selectedSessionTerm ? (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                {['#', 'Student', 'Sex', 'Subjects', 'Average', 'Position',  'Action'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}
                    align={h === 'Student' ? 'left' : 'center'}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              ) : (
              <>
              {students.map((s, i) => (
                <TableRow key={s.student_registration_id} hover>
                  <TableCell align="center" sx={cellBorderSx}>{i + 1}</TableCell>
                  <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={s.avatar || undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        {!s.avatar && `${s.fname?.[0] || ''}${s.lname?.[0] || ''}`}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{s.lname} {s.fname} {s.mname}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.admission_no || s.user_id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={cellBorderSx}>{s.sex ? s.sex.toUpperCase() : '-'}</TableCell>
                  <TableCell align="center" sx={cellBorderSx}>
                    {s.subjects_scored}/{s.subjects_taken}
                  </TableCell>
                  <TableCell align="center" sx={cellBorderSx}>{displayScore(s.average_score)}</TableCell>
                  <TableCell align="center" sx={cellBorderSx}>
                    {s.average_score !== null && s.computed_position ? s.computed_position : '-'}
                  </TableCell>
                  {/* <TableCell align="center" sx={cellBorderSx}>
                    <Chip
                      size="small"
                      label={s.paid ? 'Paid' : 'Not Paid'}
                      color={s.paid ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell> */}
                  <TableCell align="center" sx={cellBorderSx}>
                    <Tooltip title={s.has_result ? 'View dossier (report card)' : 'No scores uploaded yet for this student'}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={!s.has_result || reportLoading}
                          onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(s); }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <IconFolder size={44} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 8 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        {dataFetched
                          ? 'No students registered in this class arm for the selected term'
                          : 'Click Fetch to load the student list'}
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
          <IconFolder size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the student list
          </Typography>
        </Box>
      )}

      {/* ── Student Count ───────────────────────────────────── */}
      {students.length > 0 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`${students.length} student(s) found`} size="small" color="primary" variant="outlined" />
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
        onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}
      >
        <MenuItem
          onClick={() => {
            const row = actionMenuRow;
            setActionMenuAnchor(null);
            setActionMenuRow(null);
            if (row) {
              navigate(
                `/result-cabreakdown?student_registration_id=${row.student_registration_id}` +
                `&session_term_id=${selectedSessionTerm}&class_arm_id=${selectedClassArm}`
              );
            }
          }}
        >
          <ListItemIcon><IconChartBar size={18} /></ListItemIcon>
          <ListItemText>View C.A Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openSingleDossier(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
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
