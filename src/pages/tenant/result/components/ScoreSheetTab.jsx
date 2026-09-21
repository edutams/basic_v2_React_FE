import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Alert, useTheme,
  IconButton, Menu, ListItemIcon, ListItemText, Avatar, Tooltip, Stack, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar,
} from '@mui/material';
import {
  IconClipboardCheck, IconPrinter, IconChartBar, IconEye, IconEdit, IconSend,
  IconUsers, IconTrophy, IconArrowUp, IconArrowDown, IconCloudUpload, IconTrash,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/shared/StatCard';
import InputScoreDialog from './InputScoreDialog';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchClassStructures } from '@/api/tenant/class-structure/classStructureApi';
import { fetchCurrentSession } from '@/api/tenant/session-term/sessionTermApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';

const getEntityTotal = (entities) => {
  if (!entities) return 0;
  const list = Array.isArray(entities) ? entities : Object.values(entities);
  return list.reduce((sum, e) => sum + Number(e.score || 0), 0);
};

// Stored `ca` JSON may be an array (manual entry) or a keyed object
// ({ca1: {...}} — combined upload); normalize to an array for rendering.
const normalizeCa = (ca) => {
  if (Array.isArray(ca)) return ca;
  if (ca && typeof ca === 'object') return Object.values(ca);
  return [];
};

const getOverallTotal = (ca, exam) => {
  const caTotal = normalizeCa(ca).reduce((sum, caItem) => sum + getEntityTotal(caItem?.entities), 0);
  return caTotal + Number(exam || 0);
};

// Display value: null / undefined / '' render as '-' (matches basic v1 broadsheet style).
// Numeric 0 is a valid score, so it renders as 0.
const displayScore = (value) => (value === 0 || value ? value : '-');

// Fallback grade scale — used only when the school has no configured grade settings
const defaultGradeScale = [
  { min: 75, max: 100, grade: 'A', remark: 'Excellent' },
  { min: 65, max: 74, grade: 'B', remark: 'Good' },
  { min: 55, max: 64, grade: 'C+', remark: 'Above Average' },
  { min: 45, max: 54, grade: 'C', remark: 'Average' },
  { min: 35, max: 44, grade: 'D', remark: 'Fair' },
  { min: 0, max: 34, grade: 'F', remark: 'Fail' },
];

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const ScoreSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [sessionTermsData, setSessionTermsData] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassArm, setSelectedClassArm] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [inputScoreDialog, setInputScoreDialog] = useState({ open: false, allocation: null, singleStudent: null });
  const [purgeDialog, setPurgeDialog] = useState({ open: false, allocation: null });
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const [loading, setLoading] = useState(false);
  const [scoreSheetData, setScoreSheetData] = useState(null);
  const [students, setStudents] = useState([]);
  const [markConfig, setMarkConfig] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [caType, setCaType] = useState([]);

  // Grade lookup: prefers the school's configured grade settings, falls back to the default scale
  const getGrade = useCallback((score) => {
    const scale = (scoreSheetData?.grade_settings || []).length > 0
      ? scoreSheetData.grade_settings
      : defaultGradeScale;
    const found = scale.find((g) => score >= g.min_score && score <= g.max_score);
    return found ? found.grade : '-';
  }, [scoreSheetData]);

  // Build lookup: session_id + term_id → session_term_id
  const sessionTermId = useMemo(() => {
    if (!selectedSession || !selectedTerm) return null;
    const match = sessionTermsData.find(
      (st) => String(st.session?.id) === String(selectedSession) && String(st.term?.id) === String(selectedTerm)
    );
    return match?.id || null;
  }, [selectedSession, selectedTerm, sessionTermsData]);

  const showTable = selectedClassArm && selectedSubject && selectedSession && selectedTerm;

  // ── Fetch dropdown data on mount ──────────────────────────
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [sessionTermsRes, classStructuresRes] = await Promise.all([
          fetchSessionTerms(),
          fetchClassStructures(),
        ]);

        const stData = sessionTermsRes?.data || [];
        setSessionTermsData(stData);
        const sessionsMap = new Map();
        const termsMap = new Map();
        stData.forEach((st) => {
          if (st.session) sessionsMap.set(st.session.id, st.session);
          if (st.term) termsMap.set(st.term.id, st.term);
        });
        setSessions(Array.from(sessionsMap.values()));
        setTerms(Array.from(termsMap.values()));

        const csData = classStructuresRes?.data || [];
        const programmesMap = new Map();
        const classesMap = new Map();
        const armsList = [];
        csData.forEach((division) => {
          if (division.programmes) {
            division.programmes.forEach((prog) => {
              programmesMap.set(prog.id, prog);
              if (prog.classes) {
                prog.classes.forEach((cls) => {
                  classesMap.set(cls.id, { ...cls, programme_id: prog.id });
                  if (cls.class_arms) {
                    cls.class_arms.forEach((arm) => {
                      armsList.push({ ...arm, programme_id: prog.id, class_id: cls.id });
                    });
                  }
                });
              }
            });
          }
        });
        setProgrammes(Array.from(programmesMap.values()));
        setClasses(Array.from(classesMap.values()));
        setClassArms(armsList);
      } catch (err) {
        console.error('Failed to load dropdowns:', err);
      }
    };
    loadDropdowns();
  }, []);

  const filteredClasses = selectedProgramme
    ? classes.filter((c) => c.programme_id === selectedProgramme)
    : classes;

  const filteredClassArms = (() => {
    let arms = classArms;
    if (selectedProgramme) arms = arms.filter((arm) => arm.programme_id === selectedProgramme);
    if (selectedClass) arms = arms.filter((arm) => arm.class_id === selectedClass);
    return arms;
  })();

  // ── Fetch curriculums when class arm changes ────────────────
  useEffect(() => {
    if (!selectedClassArm || !selectedSession || !selectedTerm) {
      setCurriculums([]);
      return;
    }
    const loadCurriculums = async () => {
      try {
        const res = await scoreManagerApi.getClassCurriculums({
          class_arm_id: selectedClassArm,
          session_id: selectedSession,
          term_id: selectedTerm,
        });
        setCurriculums(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch curriculums:', err);
      }
    };
    loadCurriculums();
  }, [selectedClassArm, selectedSession, selectedTerm]);

  // ── Fetch subjects when class arm or curriculum changes ──────
  useEffect(() => {
    if (!selectedClassArm || !selectedSession || !selectedTerm) {
      setSubjects([]);
      return;
    }
    const loadSubjects = async () => {
      try {
        const params = {
          class_arm_id: selectedClassArm,
          session_id: selectedSession,
          term_id: selectedTerm,
        };
        if (selectedCurriculum) params.curriculum_id = selectedCurriculum;
        const res = await scoreManagerApi.getClassSubjects(params);
        setSubjects(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      }
    };
    loadSubjects();
  }, [selectedClassArm, selectedSession, selectedTerm, selectedCurriculum]);

  // ── Fetch score sheet data ─────────────────────────────────
  const fetchScoreSheet = useCallback(async () => {
    if (!selectedSubject || !selectedSession || !selectedTerm || !selectedClassArm) return;
    setLoading(true);
    try {
      const sessionTermRes = await scoreManagerApi.getScoreSheetData({
        subject_id: selectedSubject,
        session_term_id: sessionTermId,
        class_arm_id: selectedClassArm,
      });

      const data = sessionTermRes?.data?.data;
      if (data) {
        setScoreSheetData(data);
        setStudents(data.students || []);
        setMarkConfig(data.mark_config);
        setAnalytics(data.analytics);

        // Parse CA type from mark config
        // The API may return ca_content as an object (keyed by ca1, ca2, etc.) or as an array
        if (data.mark_config?.ca_content) {
          const raw = data.mark_config.ca_content;
          if (Array.isArray(raw)) {
            setCaType(raw);
          } else if (typeof raw === 'object') {
            // Convert { ca1: { display_name: 'CA1', entities: [...] }, ... } to array
            setCaType(Object.values(raw));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch score sheet:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, sessionTermId, selectedClassArm]);

  useEffect(() => {
    if (showTable) fetchScoreSheet();
  }, [showTable, fetchScoreSheet]);

  // Fetch tenant school info once for print headers
  useEffect(() => {
    getTenantInfo()
      .then((data) => setSchoolInfo(data?.data || null))
      .catch(() => setSchoolInfo(null));
  }, []);

  // Dynamic CA columns from the mark configuration (same parsing as InputScoreDialog)
  const caColumns = useMemo(() => {
    if (!markConfig?.ca_content) return [];
    const raw = markConfig.ca_content;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [markConfig]);

  // Any uploaded data in the sheet? Used to disable submit + show '-' placeholders
  const hasAnyScores = useMemo(
    () => students.some((r) => getOverallTotal(r.ca, r.exam_score) > 0),
    [students]
  );

  const totals = students.map(r => getOverallTotal(r.ca, r.exam_score));
  const classAverage = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const highestScore = totals.length > 0 ? Math.max(...totals) : 0;
  const lowestScore = totals.length > 0 ? Math.min(...totals) : 0;

  // ── Print helpers ───────────────────────────────────────
  const buildPrintHtml = (title, subtitle, bodyHtml) => {
    const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';
    const schoolAddress = schoolInfo?.address || '';
    return `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 16px; }
            .print-header { text-align: center; margin-bottom: 4px; }
            .print-header h2 { margin: 0; }
            .print-header .addr { font-size: 12px; color: #444; }
            .print-title { text-align: center; font-weight: 700; margin: 10px 0 2px; text-decoration: underline; }
            .print-sub { text-align: center; font-size: 12px; margin-bottom: 12px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #555; padding: 4px 6px; font-size: 12px; }
            th { background: #f0f0f0; }
            @page { size: A4 ${bodyHtml.includes('<table') ? 'portrait' : 'landscape'}; margin: 10mm; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${schoolName ? `<div class="print-header"><h2>${schoolName}</h2><div class="addr">${schoolAddress}</div></div>` : ''}
          <div class="print-title">${title}</div>
          <div class="print-sub">${subtitle}</div>
          ${bodyHtml}
        </body>
      </html>`;
  };

  const openPrintWindow = (title, subtitle, bodyHtml) => {
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      showSnackbar('Please allow pop-ups to print the report', 'error');
      return;
    }
    printWindow.document.write(buildPrintHtml(title, subtitle, bodyHtml));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const esc = (v) => String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const buildStudentRowsHtml = (cellFn) =>
    students.map((res, i) => {
      const total = getOverallTotal(normalizeCa(res.ca), res.exam_score);
      return `<tr>
        <td>${i + 1}</td>
        <td>${esc(`${res.lname} ${res.fname} ${res.mname || ''}`)}</td>
        <td>${esc(res.student_id || res.user_id || '')}</td>
        ${cellFn(res, total)}
      </tr>`;
    }).join('');

  const termLabel = `${sessionTermsData.find((st) => String(st.session?.id) === String(selectedSession))?.session?.session_name || ''} - ${terms.find((t) => String(t.id) === String(selectedTerm))?.term_name || ''}`;
  const subjectLabel = subjects.find((s) => String(s.id) === String(selectedSubject))?.subject_name || '';
  const armLabel = classArms.find((a) => String(a.id) === String(selectedClassArm))?.class_arm_names || '';
  const subtitle = `${termLabel} | ${subjectLabel} | ${armLabel}`;

  // Print the full score sheet (CA columns + exam + total + grade)
  const handlePrintScoreSheet = () => {
    if (students.length === 0) {
      showSnackbar('No student records to print', 'warning');
      return;
    }
    const caHead = caColumns.map((ca) => `<th>${esc(ca.display_name || 'CA')}</th>`).join('');
    const bodyRows = buildStudentRowsHtml((res, total) => `
      ${caColumns.map((_, ci) => {
        const entityTotal = getEntityTotal(res.ca?.[ci]?.entities);
        return `<td style="text-align:center">${entityTotal > 0 ? entityTotal : '-'}</td>`;
      }).join('')}
      <td style="text-align:center">${displayScore(res.exam_score)}</td>
      <td style="text-align:center"><strong>${total > 0 ? total : '-'}</strong></td>
      <td style="text-align:center">${getGrade(total)}</td>
    `);
    const html = `<table>
      <thead><tr><th>#</th><th>Student</th><th>ID</th>${caHead}<th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
    openPrintWindow('Score Sheet', subtitle, html);
  };

  // Print a single column report (one CA type or the exam)
  const handlePrintColumnReport = (column) => {
    if (students.length === 0) {
      showSnackbar('No student records to print', 'warning');
      return;
    }
    const isExam = column.type === 'exam';
    const colTitle = isExam ? 'Exam Report' : `${column.label} Report`;
    const bodyRows = buildStudentRowsHtml((res) => {
      const value = isExam
        ? res.exam_score
        : getEntityTotal(res.ca?.[column.index]?.entities);
      return `<td style="text-align:center">${displayScore(value)}</td>`;
    });
    const html = `<table>
      <thead><tr><th>#</th><th>Student</th><th>ID</th><th>${esc(isExam ? 'Exam Score' : column.label)}</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
    openPrintWindow(colTitle, subtitle, html);
  };

  // Navigate to the performance analytics page with this subject/class context
  const handleViewAnalytics = (column = null) => {
    const params = new URLSearchParams({
      session_id: selectedSession,
      term_id: selectedTerm,
      programme_id: selectedProgramme,
      class_id: selectedClass,
      class_arm_id: selectedClassArm,
      subject_id: selectedSubject,
    });
    if (column) params.set('column', column.type === 'exam' ? 'exam' : `ca:${column.index}`);
    navigate(`/result-analytics?${params.toString()}`);
  };

  const handleReverseSubmission = async () => {
    try {
      await scoreManagerApi.reverseSubmission({
        subject_id: selectedSubject,
        class_arm_id: selectedClassArm,
        session_term_id: sessionTermId,
      });
      fetchScoreSheet();
    } catch (err) {
      console.error('Failed to reverse submission:', err);
    }
  };

  const handleSubmitScores = async () => {
    try {
      await scoreManagerApi.submitScores({
        subject_id: selectedSubject,
        class_arm_id: selectedClassArm,
        session_term_id: sessionTermId,
      });
      fetchScoreSheet();
    } catch (err) {
      console.error('Failed to submit scores:', err);
    }
  };

  const viewCAReport = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-cabreakdown', '_blank', 'noopener,noreferrer');
  };

  const viewResult = (student) => {
    setActionMenuAnchor(null);
    window.open('/result-reportsheet', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {showTable && !loading && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard count={students.length} label="Total Students" subtitle="In selected class" icon={IconUsers} colorIndex={0} loading={false} />
          <StatCard count={classAverage} label="Class Average" subtitle="Overall score" icon={IconTrophy} colorIndex={1} loading={false} />
          <StatCard count={highestScore} label="Highest Score" subtitle="Top performer" icon={IconArrowUp} colorIndex={2} loading={false} />
          <StatCard count={lowestScore} label="Lowest Score" subtitle="Needs attention" icon={IconArrowDown} colorIndex={3} loading={false} />
        </Stack>
      )}

      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      {/* ── Card Header ─────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {/* {showTable
            ? `Score Sheet — ${dummyClasses.find(c => c.id === selectedClass)?.name} • ${dummySubjects.find(s => s.id === selectedSubject)?.name} • ${dummySessions.find(s => s.id === selectedSession)?.label} - ${dummyTerms.find(t => t.id === selectedTerm)?.label}`
            : 'View Score Sheet'} */}
        </Typography>
        {showTable && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="contained" size="small" color="info" startIcon={<IconCloudUpload size={16} />}
              onClick={() => setInputScoreDialog({ open: true, allocation: null, singleStudent: null })}>
              Upload Scores
            </Button>
            <Button variant="contained" size="small" color="primary" startIcon={<IconEdit size={16} />}
              onClick={() => setInputScoreDialog({ open: true, allocation: null, singleStudent: null })}>
              Edit Scores
            </Button>
            <Button variant="contained" size="small" color="error" startIcon={<IconTrash size={16} />}
              onClick={() => setPurgeDialog({ open: true, allocation: null })}>
              Purge Scores
            </Button>
            <Button variant="contained" size="small" color="info" startIcon={<IconPrinter size={16} />} onClick={handlePrintScoreSheet}>
              Print Score Sheet
            </Button>
            <Button variant="contained" size="small" color="success" startIcon={<IconChartBar size={16} />}
              onClick={() => handleViewAnalytics()}>
              View Analytics
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Filters ─────────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: showTable ? 1 : 0, borderColor: 'divider' }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select value={selectedSession} label="Session"
                onChange={e => { setSelectedSession(e.target.value); setSelectedProgramme(''); setSelectedClass(''); setSelectedClassArm(''); setSelectedCurriculum(''); setSelectedSubject(''); }}>
                <MenuItem value="">-- Select Session --</MenuItem>
                {sessions.map(s => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Term</InputLabel>
              <Select value={selectedTerm} label="Term"
                onChange={e => { setSelectedTerm(e.target.value); setSelectedProgramme(''); setSelectedClass(''); setSelectedClassArm(''); setSelectedCurriculum(''); setSelectedSubject(''); }}>
                <MenuItem value="">-- Select Term --</MenuItem>
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select value={selectedProgramme} label="Programme"
                onChange={e => { setSelectedProgramme(e.target.value); setSelectedClass(''); setSelectedClassArm(''); setSelectedCurriculum(''); setSelectedSubject(''); }}>
                <MenuItem value="">-- Select Programme --</MenuItem>
                {programmes.map(p => <MenuItem key={p.id} value={p.id}>{p.programme_name || p.programme_title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class"
                onChange={e => { setSelectedClass(e.target.value); setSelectedClassArm(''); setSelectedCurriculum(''); setSelectedSubject(''); }}>
                <MenuItem value="">-- Select Class --</MenuItem>
                {filteredClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class Arm</InputLabel>
              <Select value={selectedClassArm} label="Class Arm"
                onChange={e => { setSelectedClassArm(e.target.value); setSelectedCurriculum(''); setSelectedSubject(''); }}>
                <MenuItem value="">-- Select Class Arm --</MenuItem>
                {filteredClassArms.map(c => <MenuItem key={c.id} value={c.id}>{c.class_arm_names}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Curriculum</InputLabel>
              <Select value={selectedCurriculum} label="Curriculum"
                onChange={e => { setSelectedCurriculum(e.target.value); setSelectedSubject(''); }}>
                <MenuItem value="">-- All --</MenuItem>
                {curriculums.map(c => <MenuItem key={c.id} value={c.id}>{c.curriculum_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select value={selectedSubject} label="Subject"
                onChange={e => setSelectedSubject(e.target.value)}>
                <MenuItem value="">-- Select Subject --</MenuItem>
                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.subject_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* ── Submission Status ────────────────────────────────── */}
      {showTable && (
        <Box sx={{ px: 2, pt: 2 }}>
          {scoreSheetData?.overall_submission_status === 'pending' && (
            <Alert severity="info" sx={{ borderRadius: '10px' }}
              action={
                <Tooltip title={hasAnyScores ? '' : 'Upload scores before submitting'}>
                  <span>
                    <Button size="small" variant="contained" color="success" startIcon={<IconSend size={14} />} onClick={handleSubmitScores} disabled={!hasAnyScores}>
                      SUBMIT SCORES
                    </Button>
                  </span>
                </Tooltip>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              {hasAnyScores ? 'Scores not submitted by Subject Teacher yet' : 'No scores uploaded yet — upload at least one CA or exam score to submit'}
            </Alert>
          )}
          {scoreSheetData?.overall_submission_status === 'submitted' && scoreSheetData?.result_publish?.spa_publish === 'no' && (
            <Alert severity="warning" sx={{ borderRadius: '10px' }}
              action={
                <Button size="small" variant="contained" color="warning" onClick={handleReverseSubmission}>
                  Reverse Submission
                </Button>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              Result submitted awaiting SPA approval. Should you wish to alter this result, click Reverse Submission.
            </Alert>
          )}
          {scoreSheetData?.result_publish?.spa_publish === 'yes' && scoreSheetData?.result_publish?.head_of_school_publish === 'no' && (
            <Alert severity="success" sx={{ borderRadius: '10px' }}
              action={
                <Button size="small" variant="contained" color="warning" onClick={handleSubmitScores}>
                  Re-Submit
                </Button>
              }>
              <Typography variant="subtitle2">Scores Submission Status</Typography>
              Result submitted and approved by SPA
            </Alert>
          )}
        </Box>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      {showTable && (
        <Box sx={{ p: 3, pt: 2 }}>
          <TableContainer sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '3%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '220px', minWidth: 220 }}>Learner's Info</TableCell>
                  {caColumns.map((ca, ci) => (
                    <TableCell key={ca.display_name || ci} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '10%' }} align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {ca.display_name || `CA${ci + 1}`}
                        <Tooltip title={`Print ${ca.display_name || `CA${ci + 1}`} Report`}>
                          <IconButton size="small" sx={{ p: 0.25 }} onClick={() => handlePrintColumnReport({ type: 'ca', index: ci, label: ca.display_name || `CA${ci + 1}` })}>
                            <IconPrinter size={13} color="#0288D1" />
                          </IconButton>
                        </Tooltip>
                        <Box sx={{ width: '1px', height: 14, bgcolor: 'divider' }} />
                        <Tooltip title={`View ${ca.display_name || `CA${ci + 1}`} Analytics`}>
                          <IconButton size="small" sx={{ p: 0.25 }} onClick={() => handleViewAnalytics({ type: 'ca', index: ci, label: ca.display_name || `CA${ci + 1}` })}>
                            <IconChartBar size={13} color="#16A34A" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '10%' }} align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Exam
                      <Tooltip title="Print Exam Report">
                        <IconButton size="small" sx={{ p: 0.25 }} onClick={() => handlePrintColumnReport({ type: 'exam' })}>
                          <IconPrinter size={13} color="#0288D1" />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ width: '1px', height: 14, bgcolor: 'divider' }} />
                      <Tooltip title="View Exam Analytics">
                        <IconButton size="small" sx={{ p: 0.25 }} onClick={() => handleViewAnalytics({ type: 'exam' })}>
                          <IconChartBar size={13} color="#16A34A" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '7%' }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '6%' }} align="center">Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', width: '4%' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>Loading score sheet...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : students.map((res, i) => {
                  const total = getOverallTotal(normalizeCa(res.ca), res.exam_score);
                  const grade = getGrade(total);
                  return (
                    <TableRow key={res.course_registration_id || i} hover>
                      <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                      <TableCell sx={{ ...cellBorderSx, width: 220, minWidth: 220 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={res.avatar} sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main', flexShrink: 0 }}>
                            {(!res.avatar && `${res.fname?.[0]}${res.lname?.[0]}`) || '?'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {res.lname} {res.fname} {res.mname}
                              </Typography>
                              <Box
                                title={res.sex}
                                sx={{
                                  width: 18, height: 18, borderRadius: '5px', flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '10px', fontWeight: 700,
                                  bgcolor: alpha(res.sex === 'Male' ? theme.palette.primary.main : theme.palette.success.main, isDark ? 0.28 : 0.14),
                                  color: res.sex === 'Male' ? theme.palette.primary.main : theme.palette.success.main,
                                }}
                              >
                                {res.sex === 'Male' ? 'M' : 'F'}
                              </Box>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }} noWrap>
                              {res.student_id || res.user_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {caColumns.map((_, ci) => (
                        <TableCell key={ci} align="center" sx={cellBorderSx}>
                          {displayScore(getEntityTotal(res.ca?.[ci]?.entities) || null)}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={cellBorderSx}>{displayScore(res.exam_score)}</TableCell>
                      <TableCell align="center" sx={cellBorderSx}>{displayScore(total)}</TableCell>
                      <TableCell align="center" sx={cellBorderSx}>
                        <Chip label={grade} size="small" sx={{ fontWeight: 700, minWidth: 36 }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => { setActionMenuAnchor(e.currentTarget); setActionMenuRow(res); }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {!showTable && (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <IconClipboardCheck size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Select a session, term, class and subject to view the score sheet
          </Typography>
        </Box>
      )}

      {/* ── Bottom Submit Button ─────────────────────────────── */}
      {showTable && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
          {scoreSheetData?.overall_submission_status === 'pending' && (
            <Button variant="contained" color="success" size="small" startIcon={<IconSend size={14} />} onClick={handleSubmitScores}>
              SUBMIT SCORES
            </Button>
          )}
          {scoreSheetData?.overall_submission_status === 'submitted' && scoreSheetData?.result_publish?.spa_publish === 'no' && (
            <Button variant="contained" color="warning" size="small" onClick={handleReverseSubmission}>
              Reverse Submission
            </Button>
          )}
          {scoreSheetData?.result_publish?.spa_publish === 'yes' && scoreSheetData?.result_publish?.head_of_school_publish === 'no' && (
            <Button variant="contained" color="warning" size="small" onClick={handleSubmitScores}>
              Re-Submit
            </Button>
          )}
        </Box>
      )}

      {/* ── Row Action Menu ─────────────────────────────────── */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => { setActionMenuAnchor(null); setActionMenuRow(null); }}>
        <MenuItem onClick={() => { setActionMenuAnchor(null); setInputScoreDialog({ open: true, allocation: null, singleStudent: actionMenuRow }); }}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText>Edit Score</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => viewCAReport(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View CA Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => viewResult(actionMenuRow)}>
          <ListItemIcon><IconEye size={18} /></ListItemIcon>
          <ListItemText>View Result</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Input Score Dialog ─────────────────────────────── */}
      <InputScoreDialog
        open={inputScoreDialog.open}
        onClose={() => setInputScoreDialog({ open: false, allocation: null, singleStudent: null })}
        allocation={inputScoreDialog.allocation}
        filter={{
          session_id: selectedSession,
          term_id: selectedTerm,
          programme_id: scoreSheetData?.subject?.programme_id,
          session_term_id: sessionTermId,
        }}
        singleStudent={inputScoreDialog.singleStudent ? {
          ...inputScoreDialog.singleStudent,
          caType: caType,
          settings: markConfig ? { exam_max_score: markConfig.exam_max_score } : { exam_max_score: 60 },
          session_term_id: sessionTermId,
        } : null}
      />

      {/* ── Purge Confirmation Dialog ──────────────────────── */}
      <Dialog open={purgeDialog.open} onClose={() => setPurgeDialog({ open: false, allocation: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Purge Scores</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to purge all scores for this class and subject? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurgeDialog({ open: false, allocation: null })}>Cancel</Button>          <Button variant="contained" color="error" onClick={async () => {
                try {
                  await scoreManagerApi.purgeScores({
                    subject_id: selectedSubject,
                    class_arm_id: selectedClassArm,
                    session_term_id: sessionTermId,
                  });
                  setPurgeDialog({ open: false, allocation: null });
                  fetchScoreSheet();
                } catch (err) {
                  console.error('Failed to purge scores:', err);
                }
              }}>
              Purge All Scores
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
    </>
  );
};

export default ScoreSheetTab;
