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
  Checkbox,
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
  Pagination,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  IconPrinter,
  IconClipboardCheck,
  IconArrowLeft,
  IconEye,
  IconFolder,
  IconUsers,
  IconChartBar,
  IconSearch,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconCalendar,
  IconStack2,
  IconBook2,
  IconUsersGroup,
  IconBook,
  IconAlertTriangle,
  IconMedal,
  IconDownload,
  IconChevronDown,
  IconFileAnalytics,
  IconFilter,
  IconLayoutColumns,
  IconTrophy,
  IconUserFilled,
} from '@tabler/icons-react';
import Chart from 'react-apexcharts';
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

// Same grade→color meaning used across the Score Sheet, Broadsheet and
// Summary Sheet: green (best) through red (worst).
const gradeColorMap = {
  A: { bg: '#DCFCE7', color: '#16A34A' },
  B: { bg: '#DBEAFE', color: '#2563EB' },
  C: { bg: '#FEF3C7', color: '#D97706' },
  D: { bg: '#FFEDD5', color: '#EA580C' },
  E: { bg: '#FEE2E2', color: '#DC2626' },
  F: { bg: '#FECACA', color: '#991B1B' },
};
const getGradeColors = (grade) => gradeColorMap[grade?.[0]] || { bg: '#F1F5F9', color: '#64748B' };

/** Section-shaped skeletons — each mirrors the real panel it stands in for. */
const StatCardSkeleton = () => (
  <Paper elevation={0} sx={{ borderRadius: '14px', p: '14px', width: '100%', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px', flexShrink: 0 }} />
    <Box sx={{ flexGrow: 1, pl: 1, textAlign: 'right' }}>
      <Skeleton variant="text" width="50%" height={28} sx={{ ml: 'auto' }} />
      <Skeleton variant="text" width="70%" height={16} sx={{ ml: 'auto' }} />
      <Skeleton variant="text" width="60%" height={14} sx={{ ml: 'auto' }} />
    </Box>
  </Paper>
);

const ChartPanelSkeleton = ({ height = 240 }) => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Skeleton variant="text" width="55%" height={22} sx={{ mb: 1.5 }} />
    <Skeleton variant="rounded" height={height} />
  </Paper>
);

const TopPerformersSkeleton = () => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
      <Skeleton variant="text" width="50%" height={22} />
      <Skeleton variant="text" width={50} height={18} />
    </Box>
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" />
          </Box>
          <Skeleton variant="text" width={30} />
        </Box>
      ))}
    </Stack>
  </Paper>
);

const TableRowSkeleton = () => (
  <TableRow>
    <TableCell padding="checkbox"><Skeleton variant="rounded" width={18} height={18} /></TableCell>
    <TableCell align="center"><Skeleton variant="text" width={16} /></TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={140} />
      </Box>
    </TableCell>
    <TableCell align="center"><Skeleton variant="text" width={80} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="text" width={24} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="text" width={36} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="rounded" width={32} height={22} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="text" width={28} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="rounded" width={70} height={22} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="rounded" width={70} height={22} sx={{ mx: 'auto' }} /></TableCell>
    <TableCell align="center"><Skeleton variant="rounded" width={90} height={26} sx={{ mx: 'auto' }} /></TableCell>
  </TableRow>
);

const ALL_COLUMNS = [
  { key: 'admission_no', label: 'Admission No.' },
  { key: 'gender', label: 'Gender' },
  { key: 'subjects', label: 'No. of Subjects' },
  { key: 'average', label: 'Average Score' },
  { key: 'grade', label: 'Grade' },
  { key: 'position', label: 'Class Position' },
  { key: 'status', label: 'Status' },
];

const ReportSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { getTemplateIndexForSample } = useResultTemplate();
  const printRef = useRef(null);
  const tableAnchorRef = useRef(null);

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
  const [view, setView] = useState({ mode: 'list' });
  const [reportCache, setReportCache] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportAnchor, setExportAnchor] = useState(null);
  const [bulkAnchor, setBulkAnchor] = useState(null);
  const [columnsAnchor, setColumnsAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(() => ALL_COLUMNS.map((c) => c.key));
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Table search / sort / filter ─────────────────────────
  const [searchText, setSearchText] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'average' | 'position'
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
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

  const isColumnVisible = (key) => visibleColumns.includes(key);
  const toggleColumn = (key) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const statusOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.status).filter(Boolean))),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    let rows = students;
    if (text) {
      rows = rows.filter((s) => {
        const name = `${s.lname || ''} ${s.fname || ''} ${s.mname || ''}`.toLowerCase();
        const admNo = String(s.admission_no || s.user_id || '').toLowerCase();
        return name.includes(text) || admNo.includes(text);
      });
    }
    if (gradeFilter) {
      rows = rows.filter((s) => s.grade === gradeFilter);
    }
    if (statusFilter) {
      rows = rows.filter((s) => s.status === statusFilter);
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
  }, [students, searchText, gradeFilter, statusFilter, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const displayedStudents = useMemo(
    () => filteredStudents.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredStudents, page, rowsPerPage],
  );

  useEffect(() => setPage(1), [searchText, gradeFilter, statusFilter, rowsPerPage, students]);

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

  // Auto-fetch exactly once — when the page's own prefilled defaults first
  // resolve on load — so the list isn't empty on arrival. Every filter
  // change after that is deliberately inert: the old list stays on screen
  // until Fetch is clicked again, it never refetches on its own.
  const autoFetchedRef = useRef(false);
  useEffect(() => {
    if (!autoFetchedRef.current && selectedClassArm && selectedSessionTerm) {
      autoFetchedRef.current = true;
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

  // Opens the standalone Class Dossier page in a new tab (sidebar and all) —
  // that page loads and prints independently, so this list is never disturbed.
  // Also what "Bulk Actions → View/Print Class Dossier" triggers — a bulk
  // action here always means the whole class, not whichever rows happen to
  // be checked, so it reuses this exact handler rather than a second one.
  const openClassDossier = () => {
    setBulkAnchor(null);
    const params = new URLSearchParams({
      class_arm_id: selectedClassArm,
      session_term_id: selectedSessionTerm,
    });
    window.open(`/result-class_dossier?${params}`, '_blank', 'noopener,noreferrer');
  };

  const openClassBroadsheet = () => {
    const token = encodeLinkParams({
      session_id: selectedSession,
      term_id: selectedTerm,
      programme_id: selectedProgramme,
      class_id: selectedClass,
      class_arm_id: selectedClassArm,
    });
    window.open(`/result-sheet?t=${token}`, '_blank', 'noopener,noreferrer');
  };

  // ── Print ────────────────────────────────────────────────
  const handlePrint = () => {
    if (!printNode(printRef.current, 'Print Dossier')) {
      showSnackbar('Pop-up blocked. Allow pop-ups to print the dossier.', 'warning');
    }
  };

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';
  const className = [classInfo?.class_name, classInfo?.arm_name].filter(Boolean).join(' ');

  // ── Print / export helpers for the class list ─────────────
  const buildListPrintHtml = (title, subtitle, bodyHtml) => `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 16px; }
          .print-header { text-align: center; margin-bottom: 4px; }
          .print-header h2 { margin: 0; }
          .print-title { text-align: center; font-weight: 700; margin: 10px 0 2px; text-decoration: underline; }
          .print-sub { text-align: center; font-size: 12px; margin-bottom: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #555; padding: 4px 6px; font-size: 12px; }
          th { background: #f0f0f0; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        ${schoolName ? `<div class="print-header"><h2>${schoolName}</h2></div>` : ''}
        <div class="print-title">${title}</div>
        <div class="print-sub">${subtitle}</div>
        ${bodyHtml}
      </body>
    </html>`;

  const buildListTableHtml = () => `
    <table>
      <thead>
        <tr><th>#</th><th>Student</th><th>Admission No.</th><th>Average</th><th>Grade</th><th>Position</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${filteredStudents.map((s, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${s.lname} ${s.fname} ${s.mname || ''}</td>
            <td>${s.admission_no || s.user_id}</td>
            <td style="text-align:center">${displayScore(s.average_score)}</td>
            <td style="text-align:center">${s.grade || '-'}</td>
            <td style="text-align:center">${s.computed_position || '-'}</td>
            <td style="text-align:center">${s.status || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;

  const handlePrintList = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      showSnackbar('Please allow pop-ups to print', 'error');
      return;
    }
    const subtitle = `${className || ''} · ${termInfo?.session_name || ''} ${termInfo?.term_name || ''}`;
    printWindow.document.write(buildListPrintHtml('Student Dossier — Class List', subtitle, buildListTableHtml()));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExportCsv = () => {
    setExportAnchor(null);
    if (students.length === 0) return;
    const rows = [
      ['#', 'Student', 'Admission No.', 'Gender', 'No. of Subjects', 'Average Score', 'Grade', 'Class Position', 'Status'],
      ...filteredStudents.map((s, i) => [
        i + 1,
        `${s.lname} ${s.fname} ${s.mname || ''}`.trim(),
        s.admission_no || s.user_id,
        s.sex || '',
        `${s.subjects_scored}/${s.subjects_taken}`,
        s.average_score ?? '',
        s.grade ?? '',
        s.computed_position ?? '',
        s.status ?? '',
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-dossier-${(className || 'class').replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Class list exported');
  };

  const handleExportPdf = () => {
    setExportAnchor(null);
    handlePrintList();
  };

  // ── Dossier rendering ────────────────────────────────────
  const renderDossier = (student) => {
    const report = reportCache[student.student_registration_id];
    if (!report) return null;
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
  const classAverageDelta = computeDelta(stats?.class_average, stats?.previous_term_class_average);
  const totalSubjects = students.length ? Math.max(...students.map((s) => s.subjects_taken || 0)) : (stats?.total_subjects ?? 0);
  const showData = Boolean(stats);
  const hasScores = (stats?.with_results ?? 0) > 0;

  const gradeChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: (stats?.grade_distribution || []).map((g) => `${g.grade}\n(${displayScore(g.min_score)}-${displayScore(g.max_score)})`) },
    colors: (stats?.grade_distribution || []).map((g) => getGradeColors(g.grade).color),
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', distributed: true, dataLabels: { position: 'top' } } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      formatter: (val) => {
        const total = stats?.total || 0;
        const pct = total > 0 ? Math.round((val / total) * 1000) / 10 : 0;
        return `${val} (${pct}%)`;
      },
      style: { fontSize: '10px' },
    },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const gradeChartSeries = [{ name: 'Students', data: (stats?.grade_distribution || []).map((g) => g.count) }];

  const genderGaugeOptions = (color, trackColor) => ({
    chart: { type: 'radialBar' },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: '48%' },
        track: { background: trackColor, strokeWidth: '100%' },
        dataLabels: {
          name: { show: false },
          value: { fontSize: '19px', fontWeight: 700, color: isDark ? '#fff' : '#111827', offsetY: 6 },
        },
      },
    },
    stroke: { lineCap: 'round' },
    theme: { mode: isDark ? 'dark' : 'light' },
  });

  const genderInsight = (sex) => {
    const g = stats?.gender_performance?.[sex];
    if (!g || g.average === null || stats?.class_average == null) return null;
    const diff = Math.round((g.average - stats.class_average) * 10) / 10;
    const direction = diff === 0 ? 'the same as' : diff > 0 ? 'higher than' : 'lower than';
    return `${sex === 'male' ? 'Male' : 'Female'} students have an average score of ${g.average}%, computed from ${g.count} student${g.count === 1 ? '' : 's'}, which is ${Math.abs(diff)}% ${direction} the class average of ${stats.class_average}%.`;
  };

  return (
    <>
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', overflow: 'hidden', mb: 2 }}>
        {/* ── Header ──────────────────────────────────────────── */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Student Dossier</Typography>
            <Typography variant="caption" color="text.secondary">
              Class list and student dossiers with performance overview
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" endIcon={<IconChevronDown size={14} />} startIcon={<IconDownload size={16} />} onClick={(e) => setExportAnchor(e.currentTarget)} disabled={!showData}>
              Export
            </Button>
            <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
              <MenuItem onClick={handleExportCsv}>Export as CSV</MenuItem>
              <MenuItem onClick={handleExportPdf}>Export as PDF</MenuItem>
            </Menu>
            <Tooltip title="Print class list">
              <span>
                <IconButton size="small" onClick={handlePrintList} disabled={!showData} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <IconPrinter size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Button variant="contained" size="small" color="secondary" startIcon={<IconFileAnalytics size={16} />} onClick={openClassBroadsheet}>
              View Class Broadsheet
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: 2, bgcolor: isDark ? 'background.default' : '#F3F4F6' }}>
          {/* ── Filters ──────────────────────────────────────────── */}
          <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={selectedSession}
                  label="Session"
                  startAdornment={<InputAdornment position="start"><IconCalendar size={16} /></InputAdornment>}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setSelectedTerm('');
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Session --</MenuItem>
                  {sessions.map((s) => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Term"
                  startAdornment={<InputAdornment position="start"><IconStack2 size={16} /></InputAdornment>}
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Term --</MenuItem>
                  {terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={selectedProgramme}
                  label="Programme"
                  startAdornment={<InputAdornment position="start"><IconBook2 size={16} /></InputAdornment>}
                  onChange={(e) => {
                    setSelectedProgramme(e.target.value);
                    setSelectedClass('');
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- All Programmes --</MenuItem>
                  {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.programme_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  startAdornment={<InputAdornment position="start"><IconUsersGroup size={16} /></InputAdornment>}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedClassArm('');
                  }}
                >
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {filteredClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
              <FormControl fullWidth size="small" disabled={!selectedClass}>
                <InputLabel>Class Arm</InputLabel>
                <Select
                  value={selectedClassArm}
                  label="Class Arm"
                  startAdornment={<InputAdornment position="start"><IconUsers size={16} /></InputAdornment>}
                  onChange={(e) => setSelectedClassArm(e.target.value)}
                >
                  <MenuItem value="">-- Select Arm --</MenuItem>
                  {filteredClassArms.map((a) => <MenuItem key={a.id} value={a.id}>{a.class_arm_names}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button fullWidth variant="contained" color="primary" startIcon={loading ? null : <IconFilter size={16} />} onClick={handleFetch} disabled={loading} sx={{ fontWeight: 600, height: '40px' }}>
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
              </Button>
            </Grid>
          </Grid>

          {loading && !showData && (
            <Grid container spacing={1.5}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}><StatCardSkeleton /></Grid>
              ))}
            </Grid>
          )}

          {!loading && !showData && (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <IconFolder size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the student list
              </Typography>
            </Box>
          )}

          {showData && (
            <>
              {/* ── Stat cards ──────────────────────────────────── */}
              <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="stretch">
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
                  <StatCard count={stats.total ?? 0} label="Total Students" subtitle={`${stats.male ?? 0} Male  ${stats.female ?? 0} Female`} icon={IconUsers} colorIndex={0} loading={loading} sx={{ minHeight: 92 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
                  <StatCard count={totalSubjects} label="Subjects" subtitle="All students registered" icon={IconBook} colorIndex={1} loading={loading} sx={{ minHeight: 92 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
                  <StatCard
                    count={stats.class_average != null ? `${displayScore(stats.class_average)}%` : '-'}
                    label="Class Average"
                    subtitle={classAverageDelta === null ? 'Overall average' : `${classAverageDelta >= 0 ? '▲' : '▼'} ${Math.abs(classAverageDelta)}% vs last term`}
                    icon={IconChartBar}
                    colorIndex={2}
                    loading={loading}
                    sx={{ minHeight: 92 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
                  <StatCard
                    count={stats.distinction_count ?? 0}
                    label="Students with Distinction"
                    subtitle={stats.pass_rate != null ? `${stats.pass_rate}% pass rate` : `Grade ${stats.distinction_grade || ''}`}
                    icon={IconMedal}
                    colorIndex={3}
                    loading={loading}
                    sx={{ minHeight: 92 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} sx={{ display: 'flex' }}>
                  <StatCard
                    count={stats.at_risk_count ?? 0}
                    label="At Risk Students"
                    subtitle={stats.at_risk_threshold != null ? `Below ${Math.ceil(stats.at_risk_threshold)} average` : `Grade ${stats.at_risk_grade || ''}`}
                    icon={IconAlertTriangle}
                    colorIndex={4}
                    loading={loading}
                    sx={{ minHeight: 92 }}
                  />
                </Grid>
              </Grid>

              {/* ── Grade Distribution + Gender Performance + Top Performers ──
                   Deliberately "stretch", unlike the other card rows on this
                   page — these three are meant to read as one even band
                   regardless of content length, so each Paper fills the row's
                   full height and centers/anchors its content within it
                   instead of hugging its own height. ── */}
              <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="stretch">
                <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
                  {loading ? <ChartPanelSkeleton /> : (
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor: 'divider', width: '100%', height: '100%' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Grade Distribution (All Subjects)</Typography>
                      <Chart options={gradeChartOptions} series={gradeChartSeries} type="bar" height={260} />
                    </Paper>
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex' }}>
                  {loading ? <ChartPanelSkeleton /> : (
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor: 'divider', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Gender Performance</Typography>
                      {!hasScores ? (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 1 }}>
                          <IconUserFilled size={32} color={isDark ? '#475569' : '#CBD5E1'} />
                          <Typography variant="body2" color="text.secondary">
                            No scores yet — gender performance will appear once results are entered for this class.
                          </Typography>
                        </Box>
                      ) : (
                      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                      <Grid container spacing={1.5}>
                        <Grid size={6}>
                          <Stack spacing={1.25}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 112, height: 112, flexShrink: 0 }}>
                                <Chart options={genderGaugeOptions('#2563EB', isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE')} series={[stats.gender_performance?.male?.average ?? 0]} type="radialBar" height={112} width={112} />
                              </Box>
                              <Stack spacing={0.25} alignItems="flex-start">
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconUserFilled size={15} />
                                </Box>
                                <Typography variant="body2" fontWeight={700}>Male</Typography>
                                <Typography variant="caption" color="text.secondary">{stats.gender_performance?.male?.count ?? 0} students</Typography>
                              </Stack>
                            </Box>
                            {genderInsight('male') && (
                              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF' }}>
                                <Typography variant="caption">{genderInsight('male')}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Grid>
                        <Grid size={6}>
                          <Stack spacing={1.25}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 112, height: 112, flexShrink: 0 }}>
                                <Chart options={genderGaugeOptions('#DB2777', isDark ? 'rgba(219,39,119,0.18)' : '#FCE7F3')} series={[stats.gender_performance?.female?.average ?? 0]} type="radialBar" height={112} width={112} />
                              </Box>
                              <Stack spacing={0.25} alignItems="flex-start">
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#DB2777', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconUserFilled size={15} />
                                </Box>
                                <Typography variant="body2" fontWeight={700}>Female</Typography>
                                <Typography variant="caption" color="text.secondary">{stats.gender_performance?.female?.count ?? 0} students</Typography>
                              </Stack>
                            </Box>
                            {genderInsight('female') && (
                              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: isDark ? 'rgba(219,39,119,0.1)' : '#FDF2F8' }}>
                                <Typography variant="caption">{genderInsight('female')}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                      </Box>
                      )}
                    </Paper>
                  )}
                </Grid>
                <Grid size={{ xs: 12, lg: 3 }} sx={{ display: 'flex' }}>
                  {loading ? <TopPerformersSkeleton /> : (
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor: 'divider', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>Top Performers</Typography>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight={600}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSortBy('average');
                            setSortDir('desc');
                            tableAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          View All
                        </Typography>
                      </Box>
                      {(stats.top_performers || []).length === 0 ? (
                        <Box sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 1, flexGrow: 1 }}>
                          <IconMedal size={32} color={isDark ? '#475569' : '#CBD5E1'} />
                          <Typography variant="body2" color="text.secondary">
                            No scores yet — top performers will appear once results are entered for this class.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
                          {(stats.top_performers || []).map((p, i) => {
                            const medalColor = ['#F59E0B', '#94A3B8', '#B45309'][i] || '#94A3B8';
                            return (
                              <Box key={p.student_registration_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconMedal size={18} color={medalColor} />
                                <Avatar src={p.avatar || undefined} sx={{ width: 32, height: 32, fontSize: 12 }}>
                                  {!p.avatar && p.name?.[0]}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={600} noWrap display="block">{p.name}</Typography>
                                </Box>
                                <Typography variant="caption" fontWeight={700}>{displayScore(p.average_score)}</Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconTrophy size={16} color="#D97706" />
                        <Typography variant="caption" fontWeight={600}>
                          Class Average: {stats.class_average != null ? `${displayScore(stats.class_average)}%` : '-'}
                          {classAverageDelta !== null && (
                            <> {classAverageDelta >= 0 ? '▲' : '▼'} {Math.abs(classAverageDelta)}% vs last term</>
                          )}
                        </Typography>
                      </Stack>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Paper>

      {showData && (
      <Paper
        elevation={1}
        ref={tableAnchorRef}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          bgcolor: 'background.paper',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)',
        }}
      >
        {/* ── Search / grade / status filters + Columns + Bulk Actions ── */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              size="small"
              placeholder="Search by name or admission number…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: { xs: '100%', sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select value={gradeFilter} displayEmpty onChange={(e) => setGradeFilter(e.target.value)}>
                <MenuItem value="">All Grades</MenuItem>
                {(stats?.grade_distribution || []).map((g) => (
                  <MenuItem key={g.grade} value={g.grade}>{g.grade}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" startIcon={<IconLayoutColumns size={16} />} onClick={(e) => setColumnsAnchor(e.currentTarget)}>
              Columns
            </Button>
            <Menu anchorEl={columnsAnchor} open={Boolean(columnsAnchor)} onClose={() => setColumnsAnchor(null)}>
              {ALL_COLUMNS.map((col) => (
                <MenuItem key={col.key} onClick={() => toggleColumn(col.key)} dense>
                  <Checkbox size="small" checked={isColumnVisible(col.key)} />
                  <ListItemText>{col.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" size="small" endIcon={<IconChevronDown size={14} />} onClick={(e) => setBulkAnchor(e.currentTarget)}>
              Bulk Actions
            </Button>
            <Menu anchorEl={bulkAnchor} open={Boolean(bulkAnchor)} onClose={() => setBulkAnchor(null)}>
              <MenuItem onClick={openClassDossier} disabled={students.filter((s) => s.has_result).length === 0}>
                <ListItemIcon><IconPrinter size={18} /></ListItemIcon>
                <ListItemText>View / Print Class Dossier</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

        {/* ── Students Table ──────────────────────────────────── */}
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                    <Checkbox
                      size="small"
                      indeterminate={selectedIds.length > 0 && selectedIds.length < displayedStudents.length}
                      checked={displayedStudents.length > 0 && selectedIds.length === displayedStudents.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? displayedStudents.map((s) => s.student_registration_id) : [])}
                    />
                  </TableCell>
                  {['#', 'Student', ...ALL_COLUMNS.filter((c) => isColumnVisible(c.key)).map((c) => c.label), 'Action'].map((h) => {
                    const sortKey = h === 'Average Score' ? 'average' : h === 'Class Position' ? 'position' : null;
                    return (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', cursor: sortKey ? 'pointer' : 'default', userSelect: 'none' }}
                        align={h === 'Student' ? 'left' : 'center'}
                        onClick={sortKey ? () => toggleSort(sortKey) : undefined}
                      >
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          {h}
                          {sortKey && (sortBy === sortKey ? (sortDir === 'asc' ? <IconArrowUp size={13} /> : <IconArrowDown size={13} />) : <IconArrowsSort size={13} opacity={0.4} />)}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading || filtering ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={`sk-${i}`} />)
                ) : (
                  <>
                    {displayedStudents.map((s, i) => (
                      <TableRow
                        key={s.student_registration_id}
                        hover
                        selected={selectedIds.includes(s.student_registration_id)}
                        sx={{ bgcolor: i % 2 === 1 ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)') : 'transparent' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selectedIds.includes(s.student_registration_id)}
                            onChange={(e) => setSelectedIds((prev) => (e.target.checked ? [...prev, s.student_registration_id] : prev.filter((id) => id !== s.student_registration_id)))}
                          />
                        </TableCell>
                        <TableCell align="center">{(page - 1) * rowsPerPage + i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={s.avatar || undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                              {!s.avatar && `${s.fname?.[0] || ''}${s.lname?.[0] || ''}`}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {s.lname} {s.fname} {s.mname}
                            </Typography>
                          </Box>
                        </TableCell>
                        {isColumnVisible('admission_no') && <TableCell align="center">{s.admission_no || s.user_id}</TableCell>}
                        {isColumnVisible('gender') && (
                          <TableCell align="center">
                            {s.sex && (
                              <Box
                                title={s.sex}
                                sx={{
                                  width: 22, height: 22, borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '11px', fontWeight: 700, mx: 'auto',
                                  bgcolor: alpha(isMaleGender(s.sex) ? theme.palette.primary.main : theme.palette.success.main, isDark ? 0.28 : 0.14),
                                  color: isMaleGender(s.sex) ? theme.palette.primary.main : theme.palette.success.main,
                                }}
                              >
                                {isMaleGender(s.sex) ? 'M' : 'F'}
                              </Box>
                            )}
                          </TableCell>
                        )}
                        {isColumnVisible('subjects') && <TableCell align="center">{s.subjects_scored}/{s.subjects_taken}</TableCell>}
                        {isColumnVisible('average') && <TableCell align="center" sx={{ fontWeight: 700 }}>{displayScore(s.average_score)}</TableCell>}
                        {isColumnVisible('grade') && (
                          <TableCell align="center">
                            {s.grade ? (
                              <Chip label={s.grade} size="small" sx={{ bgcolor: getGradeColors(s.grade).bg, color: getGradeColors(s.grade).color, fontWeight: 700 }} />
                            ) : '-'}
                          </TableCell>
                        )}
                        {isColumnVisible('position') && (
                          <TableCell align="center">{s.average_score !== null && s.computed_position ? s.computed_position : '-'}</TableCell>
                        )}
                        {isColumnVisible('status') && (
                          <TableCell align="center">
                            {s.status ? (
                              <Chip label={s.status} size="small" variant="outlined" sx={{ borderColor: getGradeColors(s.grade).color, color: getGradeColors(s.grade).color, fontWeight: 600 }} />
                            ) : '-'}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            disabled={reportLoading}
                            onClick={(e) => {
                              setActionMenuAnchor(e.currentTarget);
                              setActionMenuRow(s);
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayedStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4 + visibleColumns.length} align="center" sx={{ py: 5 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <IconFolder size={44} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 8 }} />
                            <Typography variant="h6" color="text.secondary" fontWeight={600}>
                              {searchText || gradeFilter || statusFilter
                                ? 'No students match your filters'
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

        {/* ── Pagination ───────────────────────────────────────── */}
        {filteredStudents.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {(page - 1) * rowsPerPage + 1} – {Math.min(page * rowsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                  {[10, 20, 50, 100].map((n) => <MenuItem key={n} value={n}>{n} / page</MenuItem>)}
                </Select>
              </FormControl>
              <Pagination size="small" count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
            </Stack>
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
          <MenuItem onClick={() => openSingleDossier(actionMenuRow)} disabled={!actionMenuRow?.has_result}>
            <ListItemIcon>
              <IconEye size={18} />
            </ListItemIcon>
            <ListItemText>View Result</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
      )}

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

function computeDelta(current, previous) {
  if (current == null || previous == null) return null;
  return Math.round((current - previous) * 10) / 10;
}

export default ReportSheetTab;
