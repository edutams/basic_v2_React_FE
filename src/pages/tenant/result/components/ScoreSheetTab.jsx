import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Stack,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  IconClipboardCheck,
  IconPrinter,
  IconChartBar,
  IconEye,
  IconEdit,
  IconSend,
  IconUsers,
  IconTrophy,
  IconPercentage,
  IconHourglassHigh,
  IconTrash,
  IconLock,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StatCard from '@/components/shared/StatCard';
import InputScoreDialog from './InputScoreDialog';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { encodeLinkParams, decodeLinkParams } from '@/utils/scoreLinks';
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
  const caTotal = normalizeCa(ca).reduce(
    (sum, caItem) => sum + getEntityTotal(caItem?.entities),
    0,
  );
  return caTotal + Number(exam || 0);
};

// Display value: null / undefined / '' render as '-' (matches basic v1 broadsheet style).
// Numeric 0 is a valid score, so it renders as 0.
const displayScore = (value) => (value === 0 || value ? value : '-');

// Fallback grade scale — used only when the school has no configured grade settings
const defaultGradeScale = [
  { min_score: 75, max_score: 100, grade: 'A', remark: 'Excellent' },
  { min_score: 65, max_score: 74, grade: 'B', remark: 'Good' },
  { min_score: 55, max_score: 64, grade: 'C+', remark: 'Above Average' },
  { min_score: 45, max_score: 54, grade: 'C', remark: 'Average' },
  { min_score: 35, max_score: 44, grade: 'D', remark: 'Fair' },
  { min_score: 0, max_score: 34, grade: 'F', remark: 'Fail' },
];

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const ScoreSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // This page is always reached from a specific subject's "Score Sheet"
  // button (Score Upload cards, or the Broadsheet) — it never has its own
  // filters. Session/term, class arm and subject all come from the URL, via
  // one opaque token so raw ids don't sit in the address bar.
  const linkParams = useMemo(() => decodeLinkParams(searchParams.get('t')), [searchParams]);
  const subjectId = linkParams.subject_id;
  const classArmId = linkParams.class_arm_id;
  const sessionTermId = linkParams.session_term_id;
  const hasContext = Boolean(subjectId && classArmId && sessionTermId);

  const [loading, setLoading] = useState(false);
  const [scoreSheetData, setScoreSheetData] = useState(null);
  const [students, setStudents] = useState([]);
  const [markConfig, setMarkConfig] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [caType, setCaType] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [inputScoreDialog, setInputScoreDialog] = useState({
    open: false,
    allocation: null,
    singleStudent: null,
  });
  const [purgeDialog, setPurgeDialog] = useState({ open: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Grade lookup: prefers the school's configured grade settings, falls back
  // to the default scale. No grade at all until the exam score is actually
  // entered — a CA-only total would otherwise resolve to a real (and
  // misleadingly low) band before the exam is ever recorded.
  const getGrade = useCallback(
    (score, examScore) => {
      if (examScore === null || examScore === undefined || examScore === '') return null;
      const scale =
        (scoreSheetData?.grade_settings || []).length > 0
          ? scoreSheetData.grade_settings
          : defaultGradeScale;
      const found = scale.find((g) => score >= g.min_score && score <= g.max_score);
      return found ? found.grade : null;
    },
    [scoreSheetData],
  );

  // ── Fetch score sheet data — auto-fetches as soon as the URL gives us a
  // subject/arm/term, no Fetch button needed. ────────────────────────────
  const fetchScoreSheet = useCallback(async () => {
    if (!hasContext) return;
    setLoading(true);
    try {
      const res = await scoreManagerApi.getScoreSheetData({
        subject_id: subjectId,
        session_term_id: sessionTermId,
        class_arm_id: classArmId,
      });

      const data = res?.data?.data;
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
            setCaType(Object.values(raw));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch score sheet:', err);
      showSnackbar('Failed to load score sheet', 'error');
    } finally {
      setLoading(false);
    }
  }, [hasContext, subjectId, sessionTermId, classArmId]);

  useEffect(() => {
    fetchScoreSheet();
  }, [fetchScoreSheet]);

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
    [students],
  );

  const totals = students.map((r) => getOverallTotal(r.ca, r.exam_score));
  const classAverage =
    totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const scoredCount = students.filter(
    (r) => r.exam_score !== null && r.exam_score !== undefined,
  ).length;
  const pendingExamCount = students.length - scoredCount;
  const passRate = analytics?.class_pass_rate ?? 0;

  // ── Edit/purge availability — editing and purging stay available right
  // up until the broadsheet is actually published (submitting scores alone
  // doesn't lock anything). The backend enforces the same "published" lock
  // on every write regardless of what this flag says; this only decides
  // what the UI offers.
  const editState = scoreSheetData?.edit_state || 'editable';
  const isEditable = editState === 'editable';
  const isLockedPublished = editState === 'locked_published';

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
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const esc = (v) =>
    String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  const buildStudentRowsHtml = (cellFn) =>
    students
      .map((res, i) => {
        const total = getOverallTotal(normalizeCa(res.ca), res.exam_score);
        return `<tr>
        <td>${i + 1}</td>
        <td>${esc(`${res.lname} ${res.fname} ${res.mname || ''}`)}</td>
        <td>${esc(res.student_id || res.user_id || '')}</td>
        ${cellFn(res, total)}
      </tr>`;
      })
      .join('');

  const subjectLabel = scoreSheetData?.subject?.subject_name || '';
  const classLabel = scoreSheetData?.class_arm
    ? `${scoreSheetData.class_arm.class_name} ${scoreSheetData.class_arm.arm_name}`.trim()
    : '';
  const termLabel = scoreSheetData?.session_term
    ? `${scoreSheetData.session_term.session_name} - ${scoreSheetData.session_term.term_name}`
    : '';
  const subtitle = `${termLabel} | ${subjectLabel} | ${classLabel}`;

  // Allocation for the Input Score dialog, built from the resolved context.
  const currentAllocation =
    subjectId && classArmId
      ? {
          subject_id: subjectId,
          class_arm_id: classArmId,
          subject_name: subjectLabel,
          class_name: classLabel,
        }
      : null;

  // Print the full score sheet — backend-rendered PDF (PhpSpreadsheet data,
  // Dompdf render, same as the Input/Edit dialog's own PDF export), opened
  // in a new tab so the browser's own PDF viewer can print it. No more
  // building the table twice (once for screen, once as ad hoc print HTML).
  const [printing, setPrinting] = useState(false);
  const handlePrintScoreSheet = async () => {
    if (students.length === 0) {
      showSnackbar('No student records to print', 'warning');
      return;
    }
    setPrinting(true);
    try {
      const res = await scoreManagerApi.exportScoreSheetPdf({
        subject_id: subjectId,
        class_arm_id: classArmId,
        session_term_id: sessionTermId,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to generate the score sheet PDF',
        'error',
      );
    } finally {
      setPrinting(false);
    }
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
      const value = isExam ? res.exam_score : getEntityTotal(res.ca?.[column.index]?.entities);
      return `<td style="text-align:center">${displayScore(value)}</td>`;
    });
    const html = `<table>
      <thead><tr><th>#</th><th>Student</th><th>ID</th><th>${esc(isExam ? 'Exam Score' : column.label)}</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
    openPrintWindow(colTitle, subtitle, html);
  };

  // Navigate to the performance analytics page with this subject/class
  // context, via the same opaque token this page itself was opened with.
  const handleViewAnalytics = (column = null) => {
    const token = encodeLinkParams({
      session_term_id: sessionTermId,
      class_arm_id: classArmId,
      subject_id: subjectId,
      column: column ? (column.type === 'exam' ? 'exam' : `ca:${column.index}`) : undefined,
    });
    navigate(`/result-analytics?t=${token}`);
  };

  const handleSubmitScores = async () => {
    try {
      await scoreManagerApi.submitScores({
        subject_id: subjectId,
        class_arm_id: classArmId,
        session_term_id: sessionTermId,
      });
      showSnackbar('Scores submitted successfully!');
      fetchScoreSheet();
    } catch (err) {
      console.error('Failed to submit scores:', err);
      showSnackbar('Failed to submit scores', 'error');
    }
  };

  const viewCAReport = (student) => {
    setActionMenuAnchor(null);
    if (!student) return;
    const token = encodeLinkParams({
      student_registration_id: student.student_registration_id || undefined,
      user_id: student.student_registration_id ? undefined : student.user_id,
      session_term_id: sessionTermId,
      class_arm_id: classArmId,
    });
    window.open(`/result-ca_breakdown?t=${token}`, '_blank', 'noopener,noreferrer');
  };

  const viewResult = () => {
    setActionMenuAnchor(null);
    window.open('/result-reportsheet', '_blank', 'noopener,noreferrer');
  };

  const showTable = hasContext && scoreSheetData;

  return (
    <>
      {!hasContext && (
        <Alert severity="warning" sx={{ borderRadius: '10px', mb: 2 }}>
          This page needs a subject, class arm and term to show a score sheet — open it from a
          subject's "Score Sheet" button in Score Manager instead of navigating here directly.
        </Alert>
      )}

      {hasContext && (loading || showTable) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={`${scoredCount} / ${students.length}`}
            label="Learners Scored"
            subtitle="Both CA and exam entered"
            icon={IconUsers}
            colorIndex={0}
            loading={loading}
          />
          <StatCard
            count={classAverage}
            label="Class Average"
            subtitle="Overall score"
            icon={IconTrophy}
            colorIndex={1}
            loading={loading}
          />
          <StatCard
            count={`${passRate}%`}
            label="Pass Rate"
            subtitle="Of scored learners"
            icon={IconPercentage}
            colorIndex={2}
            loading={loading}
          />
          <StatCard
            count={pendingExamCount}
            label="Pending Exam Entry"
            subtitle="No grade until entered"
            icon={IconHourglassHigh}
            colorIndex={3}
            loading={loading}
          />
        </Stack>
      )}

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
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {subjectLabel || 'Score Sheet'}
            </Typography>
            {showTable && (
              <Typography variant="caption" color="text.secondary">
                {classLabel} · {termLabel}
              </Typography>
            )}
          </Box>
          {showTable && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {isEditable && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<IconEdit size={16} />}
                    onClick={() =>
                      setInputScoreDialog({
                        open: true,
                        allocation: currentAllocation,
                        singleStudent: null,
                      })
                    }
                  >
                    Input/Edit
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<IconTrash size={16} />}
                    onClick={() => setPurgeDialog({ open: true })}
                  >
                    Purge Scores
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                size="small"
                color="info"
                startIcon={
                  printing ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <IconPrinter size={16} />
                  )
                }
                disabled={printing}
                onClick={handlePrintScoreSheet}
              >
                Print Score Sheet
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<IconChartBar size={16} />}
                onClick={() => handleViewAnalytics()}
              >
                View Analytics
              </Button>
            </Box>
          )}
        </Box>

        {/* ── Status banner — locked once published, otherwise editable
             (whether or not it's been submitted yet). No self-service
             "reverse" here any more — only an admin reversing the broadsheet
             itself brings editing back. ───────────────────────────────── */}
        {showTable && (
          <Box sx={{ px: 2, pt: 2 }}>
            {isLockedPublished && (
              <Alert severity="success" icon={<IconLock size={18} />} sx={{ borderRadius: '10px' }}>
                <Typography variant="subtitle2">Broadsheet Published</Typography>
                This class's broadsheet has been published — scores are locked and can no longer be
                edited or purged here.
              </Alert>
            )}
            {isEditable && scoreSheetData?.overall_submission_status === 'pending' && (
              <Alert
                severity="info"
                sx={{ borderRadius: '10px' }}
                action={
                  <Tooltip title={hasAnyScores ? '' : 'Upload scores before submitting'}>
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<IconSend size={14} />}
                        onClick={handleSubmitScores}
                        disabled={!hasAnyScores}
                      >
                        SUBMIT SCORES
                      </Button>
                    </span>
                  </Tooltip>
                }
              >
                <Typography variant="subtitle2">Scores Submission Status</Typography>
                {hasAnyScores
                  ? 'Scores not submitted by Subject Teacher yet'
                  : 'No scores uploaded yet — upload at least one CA or exam score to submit'}
              </Alert>
            )}
            {isEditable && scoreSheetData?.overall_submission_status === 'submitted' && (
              <Alert severity="success" sx={{ borderRadius: '10px' }}>
                <Typography variant="subtitle2">Submitted</Typography>
                Scores have been submitted. They're still editable here until the broadsheet is
                published.
              </Alert>
            )}
          </Box>
        )}

        {/* ── Table ───────────────────────────────────────────── */}
        {showTable && (
          <Box sx={{ p: 3, pt: 2 }}>
            <TableContainer
              sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                        width: '3%',
                      }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                        width: '220px',
                        minWidth: 220,
                      }}
                    >
                      Learner's Info
                    </TableCell>
                    {caColumns.map((ca, ci) => (
                      <TableCell
                        key={ca.display_name || ci}
                        sx={{
                          fontWeight: 700,
                          bgcolor: isDark ? 'grey.900' : 'grey.50',
                          ...cellBorderSx,
                          width: '10%',
                        }}
                        align="center"
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          {ca.display_name || `CA${ci + 1}`}
                          <Tooltip title={`Print ${ca.display_name || `CA${ci + 1}`} Report`}>
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() =>
                                handlePrintColumnReport({
                                  type: 'ca',
                                  index: ci,
                                  label: ca.display_name || `CA${ci + 1}`,
                                })
                              }
                            >
                              <IconPrinter size={13} color="#0288D1" />
                            </IconButton>
                          </Tooltip>
                          <Box sx={{ width: '1px', height: 14, bgcolor: 'divider' }} />
                          <Tooltip title={`View ${ca.display_name || `CA${ci + 1}`} Analytics`}>
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() =>
                                handleViewAnalytics({
                                  type: 'ca',
                                  index: ci,
                                  label: ca.display_name || `CA${ci + 1}`,
                                })
                              }
                            >
                              <IconChartBar size={13} color="#16A34A" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                        width: '10%',
                      }}
                      align="center"
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        Exam
                        <Tooltip title="Print Exam Report">
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={() => handlePrintColumnReport({ type: 'exam' })}
                          >
                            <IconPrinter size={13} color="#0288D1" />
                          </IconButton>
                        </Tooltip>
                        <Box sx={{ width: '1px', height: 14, bgcolor: 'divider' }} />
                        <Tooltip title="View Exam Analytics">
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            onClick={() => handleViewAnalytics({ type: 'exam' })}
                          >
                            <IconChartBar size={13} color="#16A34A" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                        width: '7%',
                      }}
                      align="center"
                    >
                      Total
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        ...cellBorderSx,
                        width: '6%',
                      }}
                      align="center"
                    >
                      Grade
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        bgcolor: isDark ? 'grey.900' : 'grey.50',
                        width: '4%',
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, ri) => (
                        <TableRow key={ri}>
                          {Array.from({ length: caColumns.length + 5 }).map((__, ci) => (
                            <TableCell key={ci} sx={cellBorderSx}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : students.map((res, i) => {
                        const total = getOverallTotal(normalizeCa(res.ca), res.exam_score);
                        const grade = getGrade(total, res.exam_score);
                        return (
                          <TableRow key={res.course_registration_id || i} hover>
                            <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                            <TableCell sx={{ ...cellBorderSx, width: 220, minWidth: 220 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={res.avatar}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                  }}
                                >
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
                                          res.sex === 'male'
                                            ? theme.palette.primary.main
                                            : theme.palette.success.main,
                                          isDark ? 0.28 : 0.14,
                                        ),
                                        color:
                                          res.sex === 'male'
                                            ? theme.palette.primary.main
                                            : theme.palette.success.main,
                                      }}
                                    >
                                      {res.sex === 'male' ? 'M' : 'F'}
                                    </Box>
                                  </Stack>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', lineHeight: 1.2 }}
                                    noWrap
                                  >
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
                            <TableCell align="center" sx={cellBorderSx}>
                              {displayScore(res.exam_score)}
                            </TableCell>
                            <TableCell align="center" sx={cellBorderSx}>
                              {displayScore(total)}
                            </TableCell>
                            <TableCell align="center" sx={cellBorderSx}>
                              {grade ? (
                                <Chip
                                  label={grade}
                                  size="small"
                                  sx={{ fontWeight: 700, minWidth: 36 }}
                                />
                              ) : (
                                <Tooltip title="No grade until the exam score is entered">
                                  <Chip
                                    label="Pending"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, minWidth: 36, color: 'text.secondary' }}
                                  />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setActionMenuAnchor(e.currentTarget);
                                  setActionMenuRow(res);
                                }}
                              >
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

        {/* ── Empty / loading state (no URL context yet) ──────────── */}
        {!showTable && (
          <Box sx={{ p: loading ? 3 : 5, textAlign: loading ? 'left' : 'center' }}>
            {loading ? (
              <Stack spacing={1.25}>
                <Skeleton variant="rounded" height={44} />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={36} />
                ))}
              </Stack>
            ) : (
              <>
                <IconClipboardCheck
                  size={48}
                  color={isDark ? '#fff' : '#94a3b8'}
                  style={{ marginBottom: 12 }}
                />
                <Typography variant="h6" color="text.secondary" fontWeight={600}>
                  {hasContext ? 'No score sheet data found.' : 'Open this page from Score Manager.'}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* ── Bottom Submit Button ─────────────────────────────── */}
        {showTable && isEditable && scoreSheetData?.overall_submission_status === 'pending' && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<IconSend size={14} />}
              onClick={handleSubmitScores}
            >
              SUBMIT SCORES
            </Button>
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
          {isEditable && (
            <MenuItem
              onClick={() => {
                setActionMenuAnchor(null);
                setInputScoreDialog({ open: true, allocation: null, singleStudent: actionMenuRow });
              }}
            >
              <ListItemIcon>
                <IconEdit size={18} />
              </ListItemIcon>
              <ListItemText>Edit Score</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => viewCAReport(actionMenuRow)}>
            <ListItemIcon>
              <IconEye size={18} />
            </ListItemIcon>
            <ListItemText>View CA Report</ListItemText>
          </MenuItem>
          <MenuItem onClick={viewResult}>
            <ListItemIcon>
              <IconEye size={18} />
            </ListItemIcon>
            <ListItemText>View Result</ListItemText>
          </MenuItem>
        </Menu>

        {/* ── Input Score Dialog ─────────────────────────────── */}
        <InputScoreDialog
          open={inputScoreDialog.open}
          onClose={() =>
            setInputScoreDialog({ open: false, allocation: null, singleStudent: null })
          }
          allocation={inputScoreDialog.allocation}
          filter={{
            session_term_id: sessionTermId,
          }}
          singleStudent={
            inputScoreDialog.singleStudent
              ? {
                  ...inputScoreDialog.singleStudent,
                  caType: caType,
                  settings: markConfig
                    ? { exam_max_score: markConfig.exam_max_score }
                    : { exam_max_score: 60 },
                  session_term_id: sessionTermId,
                }
              : null
          }
          onSaved={fetchScoreSheet}
        />

        {/* ── Purge Confirmation Dialog ──────────────────────── */}
        <Dialog
          open={purgeDialog.open}
          onClose={() => setPurgeDialog({ open: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Purge Scores</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to purge all scores for this class and subject? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPurgeDialog({ open: false })}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  await scoreManagerApi.purgeScores({
                    subject_id: subjectId,
                    class_arm_id: classArmId,
                    session_term_id: sessionTermId,
                  });
                  setPurgeDialog({ open: false });
                  // Clear the table immediately rather than waiting on the
                  // refetch — belt-and-suspenders on top of the cache-driver
                  // fix, so the UI never looks like nothing happened.
                  setStudents([]);
                  showSnackbar('Scores purged successfully');
                  fetchScoreSheet();
                } catch (err) {
                  console.error('Failed to purge scores:', err);
                  showSnackbar(err?.response?.data?.message || 'Failed to purge scores', 'error');
                }
              }}
            >
              Purge All Scores
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </>
  );
};

export default ScoreSheetTab;
