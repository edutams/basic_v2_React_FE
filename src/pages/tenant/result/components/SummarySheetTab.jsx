import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  CircularProgress,
  Chip,
  Skeleton,
  Tooltip,
  Stack,
  Menu,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  IconX,
  IconCalendar,
  IconStack2,
  IconBook2,
  IconUsers,
  IconUsersGroup,
  IconBook,
  IconChartBar,
  IconSchool,
  IconAlertTriangle,
  IconDownload,
  IconPrinter,
  IconFileAnalytics,
  IconChevronDown,
  IconChevronRight,
  IconMaximize,
  IconBulb,
  IconMedal,
  IconRefresh,
  IconFilter,
  IconChartPie,
} from '@tabler/icons-react';
import Chart from 'react-apexcharts';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions, fetchTerms, fetchProgrammes, fetchClassesByProgramme, fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';
import StatCard from '@/components/shared/StatCard';
import ReusableModal from '@/components/shared/ReusableModal';

// Trim trailing zeros: 80.00 → 80, 10.01 → 10.01
const formatScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '');
  return String(parseFloat(num.toFixed(2)));
};

// Same grade→color meaning used across the Score Sheet and Broadsheet: green
// (best) through red (worst). Keyed by the grade's first letter so an 'E'
// band (this school's settings include one) still resolves to something.
const gradeColorMap = {
  A: { bg: '#DCFCE7', color: '#16A34A' },
  B: { bg: '#DBEAFE', color: '#2563EB' },
  C: { bg: '#FEF3C7', color: '#D97706' },
  D: { bg: '#FFEDD5', color: '#EA580C' },
  E: { bg: '#FEE2E2', color: '#DC2626' },
  F: { bg: '#FECACA', color: '#991B1B' },
};
const getGradeColors = (grade) => gradeColorMap[grade?.[0]] || { bg: '#F1F5F9', color: '#64748B' };

/**
 * Section-shaped skeletons — each one mirrors the real panel it stands in
 * for (icon badge + number for a stat card, title + plot area for a chart,
 * icon + two text lines per row for Key Insights, header + grade cells for
 * the matrix table) instead of one flat placeholder box, so the page reads
 * as "this exact layout is arriving" rather than a generic loading grid.
 */
const StatCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: '14px',
      p: '14px',
      width: '100%',
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px', flexShrink: 0 }} />
    <Box sx={{ flexGrow: 1, pl: 1, textAlign: 'right' }}>
      <Skeleton variant="text" width="50%" height={28} sx={{ ml: 'auto' }} />
      <Skeleton variant="text" width="70%" height={16} sx={{ ml: 'auto' }} />
      <Skeleton variant="text" width="60%" height={14} sx={{ ml: 'auto' }} />
    </Box>
  </Paper>
);

const ChartPanelSkeleton = ({ title }) => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="text" width={title ? `${Math.min(70, title.length * 2.5)}%` : '60%'} height={22} sx={{ mb: 1.5 }} />
    <Skeleton variant="rounded" height={260} />
  </Paper>
);

const InsightsPanelSkeleton = () => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Skeleton variant="text" width="45%" height={22} />
      <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px' }} />
    </Box>
    <Stack spacing={1.5}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width={`${85 - i * 5}%`} height={16} sx={{ flexGrow: 1 }} />
        </Box>
      ))}
    </Stack>
  </Paper>
);

const TablePanelSkeleton = () => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Skeleton variant="text" width="35%" height={22} />
      <Skeleton variant="rounded" width={140} height={28} sx={{ borderRadius: '8px' }} />
    </Box>
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Skeleton variant="text" width="18%" height={20} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" width="12%" height={20} />
      ))}
    </Box>
    {Array.from({ length: 6 }).map((_, row) => (
      <Box key={row} sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Skeleton variant="text" width="18%" height={28} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width="12%" height={28} />
        ))}
      </Box>
    ))}
  </Paper>
);

const DonutPanelSkeleton = () => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="text" width="55%" height={22} sx={{ mb: 1.5 }} />
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
      <Skeleton variant="circular" width={160} height={160} />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="text" width={24} height={16} />
      ))}
    </Box>
  </Paper>
);

const TopSubjectsPanelSkeleton = () => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Skeleton variant="text" width="50%" height={22} />
      <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: '8px' }} />
    </Box>
    <Stack spacing={1.25}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton variant="text" width="55%" height={16} />
            <Skeleton variant="text" width={30} height={16} />
          </Box>
          <Skeleton variant="rounded" height={6} sx={{ borderRadius: 3 }} />
        </Box>
      ))}
    </Stack>
  </Paper>
);

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

  const defaultFilters = { session_id: '', term_id: '', programme_id: '', class_id: '', class_arm_id: '' };
  const [filters, setFilters] = useState(defaultFilters);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [breakdownDialog, setBreakdownDialog] = useState({ open: false, subject: null, grade: null });
  const [breakdown, setBreakdown] = useState({ loading: false, rows: [], total: 0, grade: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [schoolInfo, setSchoolInfo] = useState(null);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const activeSessionTermRef = useRef(null);

  useEffect(() => {
    getTenantInfo().then((d) => setSchoolInfo(d?.data || null)).catch(() => setSchoolInfo(null));
  }, []);

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

        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data) ? sessRes.data?.data || sessRes.data : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data) ? progRes.data?.data || progRes.data : [];

        setSessions(sessionsData);
        setProgrammes(programmesData);
        setSessionTermsData(stRes?.data ?? []);
        if (programmesData.length > 0) {
          setFilters((prev) => (prev.programme_id ? prev : { ...prev, programme_id: programmesData[0].id }));
        }

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

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

  useEffect(() => {
    if (!filters.session_id) {
      setTerms([]);
      return;
    }
    fetchTerms(filters.session_id)
      .then((res) => {
        const d = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(d);
        const activeSessionTerm = activeSessionTermRef.current;
        const activeTermId = activeSessionTerm?.session_id === filters.session_id ? activeSessionTerm.term_id : null;
        const active = (activeTermId && d.find((t) => t.id === activeTermId)) || d[0];
        if (active) setFilters((prev) => ({ ...prev, term_id: active.id }));
      })
      .catch(console.error);
  }, [filters.session_id]);

  const sessionTermId = useMemo(() => {
    if (!filters.session_id || !filters.term_id) return null;
    const match = sessionTermsData.find(
      (st) => String(st.session?.id) === String(filters.session_id) && String(st.term?.id) === String(filters.term_id)
    );
    return match?.id ?? null;
  }, [filters.session_id, filters.term_id, sessionTermsData]);

  useEffect(() => {
    if (!filters.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filters.programme_id)
      .then((res) => {
        const d = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(d);
        if (d.length > 0 && !d.some((c) => c.id === filters.class_id)) {
          setFilters((prev) => ({ ...prev, class_id: d[0].id, class_arm_id: '' }));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.programme_id]);

  useEffect(() => {
    if (!filters.class_id) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(filters.class_id, filters.programme_id ? { programme_id: filters.programme_id } : {})
      .then((res) => {
        const d = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(d);
        if (d.length > 0 && !d.some((a) => a.id === filters.class_arm_id)) {
          setFilters((prev) => ({ ...prev, class_arm_id: d[0].id }));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.class_id, filters.programme_id]);

  // ── Load the summary matrix via Apply ────────────────────────
  const loadSummary = useCallback(async (classArmId, stId) => {
    setLoading(true);
    setError('');
    try {
      const res = await resultSheetApi.getSummary({ class_arm_id: classArmId, session_term_id: stId });
      setData(res?.data?.data ?? null);
    } catch (err) {
      console.error('Failed to fetch summary sheet:', err);
      setData(null);
      setError(err?.response?.data?.message || 'Failed to fetch summary sheet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApply = () => {
    if (!filters.class_arm_id || !sessionTermId) {
      setError('Select Session, Term, Programme, Class and Class Arm, then click Filter.');
      return;
    }
    loadSummary(filters.class_arm_id, sessionTermId);
  };

  // Auto-fetch once the first-load defaults resolve.
  useEffect(() => {
    setData(null);
    setError('');
    if (filters.class_arm_id && sessionTermId) {
      loadSummary(filters.class_arm_id, sessionTermId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.class_arm_id, sessionTermId]);

  // ── Breakdown dialog ────────────────────────────────────────
  const handleCellClick = async (subject, grade) => {
    if (!filters.class_arm_id || !sessionTermId) return;
    setBreakdownDialog({ open: true, subject, grade });
    setBreakdown({ loading: true, rows: [], total: 0, grade, error: '' });
    try {
      const res = await resultSheetApi.getSummaryBreakdown({
        class_arm_id: filters.class_arm_id,
        session_term_id: sessionTermId,
        subject_id: subject.subject_id,
        grade: grade.grade,
      });
      const payload = res?.data?.data ?? {};
      setBreakdown({ loading: false, rows: payload.breakdown ?? [], total: payload.total ?? 0, grade: payload.grade ?? grade, error: '' });
    } catch (err) {
      console.error('Failed to fetch breakdown:', err);
      setBreakdown({ loading: false, rows: [], total: 0, grade, error: err?.response?.data?.message || 'Failed to fetch breakdown' });
    }
  };

  const closeBreakdown = () => setBreakdownDialog({ open: false, subject: null, grade: null });

  const showData = Boolean(data);
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const grades = data?.grades ?? [];
  const subjects = data?.subjects ?? [];
  const analytics = data?.analytics ?? {};

  // ══════════════════════════════════════════════════════════════
  // Derived analytics for the new charts/insights (all computed from
  // what's already fetched — no extra round trips).
  // ══════════════════════════════════════════════════════════════
  const gradeDistributionAll = useMemo(() => {
    if (!data) return [];
    return grades.map((g, gi) => ({
      grade: g.grade,
      range: `${formatScore(g.min_score)}-${formatScore(g.max_score)}`,
      count: subjects.reduce((sum, s) => sum + (data.matrix?.[s.subject_id]?.[gi] ?? 0), 0),
    }));
  }, [data, grades, subjects]);

  const totalGraded = useMemo(
    () => gradeDistributionAll.reduce((sum, g) => sum + g.count, 0),
    [gradeDistributionAll],
  );

  const subjectPerformance = useMemo(() => {
    if (!data) return [];
    return subjects
      .filter((s) => s.submitted)
      .map((s) => ({
        subject_id: s.subject_id,
        name: s.subject_name,
        average: analytics.subject_averages?.[s.subject_id] ?? null,
        // Pass count for this subject = sum of matrix counts in bands whose
        // min_score is at/above the term pass mark — lets "Top Performing
        // Subjects" sort by pass rate too, without another round trip.
        passCount: analytics.pass_mark != null
          ? grades.reduce((sum, g, gi) => (
            (parseFloat(g.min_score) >= parseFloat(analytics.pass_mark))
              ? sum + (data.matrix?.[s.subject_id]?.[gi] ?? 0)
              : sum
          ), 0)
          : null,
        total: data.totals?.[s.subject_id] ?? 0,
      }));
  }, [data, subjects, grades, analytics]);

  const [topSortMode, setTopSortMode] = useState('average');
  const topPerformingSubjects = useMemo(() => {
    const list = subjectPerformance.filter((s) => s.average !== null);
    return [...list].sort((a, b) => {
      if (topSortMode === 'pass_rate') {
        const ar = a.total > 0 ? a.passCount / a.total : 0;
        const br = b.total > 0 ? b.passCount / b.total : 0;
        return br - ar;
      }
      return (b.average ?? 0) - (a.average ?? 0);
    });
  }, [subjectPerformance, topSortMode]);

  const weakestSubject = topPerformingSubjects.length ? topPerformingSubjects[topPerformingSubjects.length - 1] : null;
  const strongestSubject = topPerformingSubjects.length ? topPerformingSubjects[0] : null;

  const studentCount = data?.student_count ?? 0;
  const pct = (n) => (studentCount > 0 ? Math.round((n / studentCount) * 1000) / 10 : 0);

  const classAverageDelta = useMemo(() => {
    const curr = analytics.class_average;
    const prev = analytics.previous_term_class_average;
    if (curr == null || prev == null) return null;
    return Math.round((curr - prev) * 10) / 10;
  }, [analytics]);

  // ── Count / Percentage toggle for the matrix table ───────────
  const [viewMode, setViewMode] = useState('count');
  const cellValue = (subjectId, gi) => {
    const count = data?.matrix?.[subjectId]?.[gi] ?? 0;
    if (viewMode === 'count') return count;
    const total = data?.totals?.[subjectId] ?? 0;
    return total > 0 ? `${Math.round((count / total) * 1000) / 10}%` : '0%';
  };

  const [insightModal, setInsightModal] = useState({ open: false, title: '', content: null });
  const [tableExpanded, setTableExpanded] = useState(false);
  const [exportAnchor, setExportAnchor] = useState(null);

  // ── Print / report helpers (same idiom as the Score Sheet redesign) ──
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
            table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
            th, td { border: 1px solid #555; padding: 4px 6px; font-size: 12px; }
            th { background: #f0f0f0; }
            .stat-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
            .stat-box { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; min-width: 120px; }
            .stat-box b { display: block; font-size: 16px; }
            @page { size: A4 landscape; margin: 10mm; }
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
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      showSnackbar('Please allow pop-ups to print', 'error');
      return;
    }
    printWindow.document.write(buildPrintHtml(title, subtitle, bodyHtml));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const subtitleLine = data
    ? `${data.class_arm?.class_name ?? ''} ${data.class_arm?.arm_name ?? ''} · ${data.session_term?.session_name ?? ''} · ${data.session_term?.term_name ?? ''}`
    : '';

  const buildMatrixTableHtml = () => `
    <table>
      <thead>
        <tr>
          <th>Subject</th>
          ${grades.map((g) => `<th>${g.grade} (${formatScore(g.min_score)}-${formatScore(g.max_score)})</th>`).join('')}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${subjects.map((s) => `
          <tr>
            <td>${s.subject_name}</td>
            ${grades.map((_, gi) => `<td style="text-align:center">${cellValue(s.subject_id, gi)}</td>`).join('')}
            <td style="text-align:center">${data?.totals?.[s.subject_id] ?? 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;

  const handlePrint = () => {
    if (!data) {
      showSnackbar('Nothing to print yet — Apply a filter first', 'warning');
      return;
    }
    openPrintWindow('Grade Distribution by Subject', subtitleLine, buildMatrixTableHtml());
  };

  const handleGenerateReport = () => {
    if (!data) {
      showSnackbar('Nothing to report yet — Apply a filter first', 'warning');
      return;
    }
    const statBoxes = `
      <div class="stat-row">
        <div class="stat-box">Total Students<b>${studentCount}</b></div>
        <div class="stat-box">Total Subjects<b>${subjects.length}</b></div>
        <div class="stat-box">Class Average<b>${analytics.class_average ?? '-'}%</b></div>
        <div class="stat-box">Pass Rate<b>${analytics.graded_students ? pct(analytics.passed_students) : '-'}%</b> (${analytics.passed_students ?? 0} of ${studentCount})</div>
        <div class="stat-box">Distinction (A)<b>${analytics.distinction_count ?? 0}</b> (${pct(analytics.distinction_count ?? 0)}%)</div>
        <div class="stat-box">At Risk (D-F)<b>${analytics.at_risk_count ?? 0}</b> (${pct(analytics.at_risk_count ?? 0)}%)</div>
      </div>`;
    const topTableHtml = `
      <table>
        <thead><tr><th>#</th><th>Subject</th><th>Average Score</th></tr></thead>
        <tbody>
          ${topPerformingSubjects.map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td style="text-align:center">${formatScore(s.average)}%</td></tr>`).join('')}
        </tbody>
      </table>`;
    openPrintWindow(
      'Summary Sheet Report',
      subtitleLine,
      statBoxes + buildMatrixTableHtml() + '<h4>Top Performing Subjects</h4>' + topTableHtml,
    );
  };

  const handleExportCsv = () => {
    setExportAnchor(null);
    if (!data) return;
    const rows = [];
    rows.push(['GRADE', ...subjects.map((s) => s.subject_name)]);
    grades.forEach((g, gi) => {
      rows.push([
        `${g.grade} (${formatScore(g.min_score)} - ${formatScore(g.max_score)})`,
        ...subjects.map((s) => data.matrix?.[s.subject_id]?.[gi] ?? 0),
      ]);
    });
    rows.push(['OUTLIER', ...subjects.map((s) => data.outliers?.[s.subject_id] ?? 0)]);
    rows.push(['TOTAL', ...subjects.map((s) => data.totals?.[s.subject_id] ?? 0)]);

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const armName = (data.class_arm?.class_name && data.class_arm?.arm_name) ? `${data.class_arm.class_name}-${data.class_arm.arm_name}` : 'class';
    link.href = url;
    link.download = `summary-sheet-${armName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Summary sheet exported');
  };

  const handleExportPdf = () => {
    setExportAnchor(null);
    handleGenerateReport();
  };

  // ── Chart configs ─────────────────────────────────────────────
  const gradeDistChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: gradeDistributionAll.map((g) => `${g.grade}\n(${g.range})`) },
    colors: ['#2563EB'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      formatter: (val, { dataPointIndex }) => {
        const pctVal = totalGraded > 0 ? Math.round((val / totalGraded) * 1000) / 10 : 0;
        return `${val}\n(${pctVal}%)`;
      },
      style: { fontSize: '10px' },
    },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const gradeDistChartSeries = [{ name: 'Students', data: gradeDistributionAll.map((g) => g.count) }];

  const subjectPerfChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: subjectPerformance.map((s) => s.name), labels: { rotate: -45, style: { fontSize: '10px' } } },
    colors: ['#16A34A'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      formatter: (val) => (val != null ? `${formatScore(val)}%` : '-'),
      style: { fontSize: '10px' },
    },
    yaxis: { max: 100, labels: { formatter: (v) => `${Math.round(v)}%` } },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const subjectPerfChartSeries = [{ name: 'Average Score', data: subjectPerformance.map((s) => s.average) }];

  const donutOptions = {
    chart: { type: 'donut' },
    labels: gradeDistributionAll.map((g) => `${g.grade} (${g.range})`),
    colors: gradeDistributionAll.map((g) => getGradeColors(g.grade).color),
    stroke: { width: 2, colors: [isDark ? theme.palette.background.paper : '#fff'] },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} student(s)` } },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            value: { fontSize: '20px', fontWeight: 700, color: isDark ? '#fff' : '#111827', offsetY: 2 },
            total: {
              show: true,
              label: 'Students',
              fontSize: '12px',
              color: isDark ? '#cbd5e1' : '#6b7280',
              formatter: () => studentCount,
            },
          },
        },
      },
    },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const donutSeries = gradeDistributionAll.map((g) => g.count);

  // ── Matrix table (reused for both the normal and expanded views) ──
  const MatrixTable = () => (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 600, borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', border: `1px solid ${borderColor}` }}>Subject</TableCell>
            {grades.map((g) => {
              const colors = getGradeColors(g.grade);
              return (
                <TableCell key={g.grade} align="center" sx={{ fontWeight: 700, bgcolor: colors.bg, color: colors.color, border: `1px solid ${borderColor}`, whiteSpace: 'nowrap' }}>
                  {g.grade} ({formatScore(g.min_score)}-{formatScore(g.max_score)})
                </TableCell>
              );
            })}
            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', border: `1px solid ${borderColor}` }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.map((s) => (
            <TableRow key={s.subject_id} hover sx={{ opacity: s.submitted ? 1 : 0.5 }}>
              <TableCell sx={{ border: `1px solid ${borderColor}`, fontWeight: 600 }}>
                {s.subject_name}{!s.submitted && (
                  <Tooltip title="Not submitted yet — scores hidden until the teacher submits">
                    <Typography component="span" variant="caption" color="text.secondary"> (Pending)</Typography>
                  </Tooltip>
                )}
              </TableCell>
              {grades.map((g, gi) => {
                const colors = getGradeColors(g.grade);
                return (
                  <TableCell
                    key={`${s.subject_id}-${g.grade}`}
                    align="center"
                    sx={{
                      border: `1px solid ${borderColor}`,
                      bgcolor: colors.bg,
                      color: colors.color,
                      fontWeight: 700,
                      cursor: s.submitted ? 'pointer' : 'default',
                      textDecoration: s.submitted ? 'underline' : 'none',
                      opacity: s.submitted ? 1 : 0.6,
                    }}
                    onClick={() => s.submitted && handleCellClick(s, g)}
                  >
                    {cellValue(s.subject_id, gi)}
                  </TableCell>
                );
              })}
              <TableCell align="center" sx={{ border: `1px solid ${borderColor}`, fontWeight: 700 }}>
                {data?.totals?.[s.subject_id] ?? 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor, overflow: 'hidden' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, borderBottom: `1px solid ${borderColor}`, bgcolor: 'background.paper' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Summary Sheet</Typography>
          <Typography variant="caption" color="text.secondary">
            Overview of grade distributions across all subjects in the class
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<IconChevronDown size={14} />}
            startIcon={<IconDownload size={16} />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            disabled={!showData}
          >
            Export
          </Button>
          <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
            <MenuItem onClick={handleExportCsv}>Export as CSV</MenuItem>
            <MenuItem onClick={handleExportPdf}>Export as PDF</MenuItem>
          </Menu>
          <Tooltip title="Print the grade distribution table">
            <span>
              <IconButton size="small" onClick={handlePrint} disabled={!showData} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <IconPrinter size={18} />
              </IconButton>
            </span>
          </Tooltip>
          <Button variant="contained" size="small" color="secondary" startIcon={<IconFileAnalytics size={16} />} onClick={handleGenerateReport} disabled={!showData}>
            Generate Report
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 2, bgcolor: isDark ? 'background.default' : '#F3F4F6' }}>
        {/* ── Filters ──────────────────────────────────────────── */}
        <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select
                value={filters.session_id}
                label="Session"
                startAdornment={<InputAdornment position="start"><IconCalendar size={16} /></InputAdornment>}
                onChange={(e) => setFilters({ ...filters, session_id: e.target.value, term_id: '' })}
              >
                <MenuItem value="">-- Select Session --</MenuItem>
                {sessions.map((s) => <MenuItem key={s.id} value={s.id}>{s.session_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Term</InputLabel>
              <Select
                value={filters.term_id}
                label="Term"
                startAdornment={<InputAdornment position="start"><IconStack2 size={16} /></InputAdornment>}
                onChange={(e) => setFilters({ ...filters, term_id: e.target.value })}
              >
                <MenuItem value="">-- Select Term --</MenuItem>
                {terms.map((t) => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select
                value={filters.programme_id}
                label="Programme"
                startAdornment={<InputAdornment position="start"><IconBook2 size={16} /></InputAdornment>}
                onChange={(e) => setFilters({ ...filters, programme_id: e.target.value, class_id: '', class_arm_id: '' })}
              >
                <MenuItem value="">-- Select Programme --</MenuItem>
                {programmes.map((p) => <MenuItem key={p.id} value={p.id}>{p.programme_name || p.programme_title}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                value={filters.class_id}
                label="Class"
                startAdornment={<InputAdornment position="start"><IconUsersGroup size={16} /></InputAdornment>}
                onChange={(e) => setFilters({ ...filters, class_id: e.target.value, class_arm_id: '' })}
              >
                <MenuItem value="">-- Select Class --</MenuItem>
                {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class Arm</InputLabel>
              <Select
                value={filters.class_arm_id}
                label="Class Arm"
                startAdornment={<InputAdornment position="start"><IconUsers size={16} /></InputAdornment>}
                onChange={(e) => setFilters({ ...filters, class_arm_id: e.target.value })}
              >
                <MenuItem value="">-- Select Arm --</MenuItem>
                {classArms.map((a) => <MenuItem key={a.id} value={a.id}>{a.class_arm_names}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              fullWidth
              startIcon={loading ? null : <IconFilter size={16} />}
              onClick={handleApply}
              disabled={loading}
              sx={{ fontWeight: 600, height: '40px' }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Filter'}
            </Button>
          </Grid>
        </Grid>

        {/* ── States ──────────────────────────────────────────── */}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {loading && (
          <>
            <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="stretch">
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}><StatCardSkeleton /></Grid>
              ))}
            </Grid>
            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={1.5}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}><ChartPanelSkeleton title="Grade Distribution (All Subjects)" /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><ChartPanelSkeleton title="Subject Performance (Average Score)" /></Grid>
                  </Grid>
                  <TablePanelSkeleton />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={1.5}>
                  <InsightsPanelSkeleton />
                  <DonutPanelSkeleton />
                  <TopSubjectsPanelSkeleton />
                </Stack>
              </Grid>
            </Grid>
          </>
        )}

        {!loading && !showData && !error && (
          <Alert severity="info">
            {filters.class_arm_id
              ? 'No summary data available for this selection. Ensure scores are uploaded and grade settings are configured for this term.'
              : 'Select Session, Term, Programme, Class and Class Arm, then click Filter to view the grade distribution summary.'}
          </Alert>
        )}

        {!loading && showData && subjects.length === 0 && (
          <Alert severity="info">No subjects registered for this class arm in the selected term.</Alert>
        )}

        {!loading && showData && subjects.length > 0 && (
          <>
            {/* ── Stat cards ──────────────────────────────────── */}
            <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="stretch">
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard count={studentCount} label="Total Students" subtitle={`In ${data.class_arm?.class_name ?? ''} ${data.class_arm?.arm_name ?? ''}`} icon={IconUsersGroup} colorIndex={0} sx={{ minHeight: 92 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard count={subjects.length} label="Total Subjects" subtitle="Across curriculum" icon={IconBook} colorIndex={1} sx={{ minHeight: 92 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard
                  count={analytics.class_average != null ? `${formatScore(analytics.class_average)}%` : '-'}
                  label="Class Average"
                  subtitle={classAverageDelta === null ? 'Overall average' : `${classAverageDelta >= 0 ? '▲' : '▼'} ${Math.abs(classAverageDelta)}% vs last term`}
                  icon={IconChartBar}
                  colorIndex={2}
                  sx={{ minHeight: 92 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard
                  count={analytics.graded_students ? `${pct(analytics.passed_students)}%` : '-'}
                  label="Pass Rate"
                  subtitle={`${analytics.passed_students ?? 0} of ${studentCount} students`}
                  icon={IconSchool}
                  colorIndex={1}
                  sx={{ minHeight: 92 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard
                  count={analytics.distinction_count ?? 0}
                  label="Distinction (A)"
                  subtitle={`${pct(analytics.distinction_count ?? 0)}% of students`}
                  icon={IconMedal}
                  colorIndex={3}
                  sx={{ minHeight: 92 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
                <StatCard
                  count={analytics.at_risk_count ?? 0}
                  label="At Risk (D-F)"
                  subtitle={`${pct(analytics.at_risk_count ?? 0)}% of students`}
                  icon={IconAlertTriangle}
                  colorIndex={4}
                  sx={{ minHeight: 92 }}
                />
              </Grid>
            </Grid>

            {/* ── Left column (charts + table) / Right column (insights + distribution)
                 are two independent Stacks inside one Grid row, so the right
                 column's cards sit flush against each other regardless of how
                 tall the left column's charts/table happen to be — no more
                 gap from a short column waiting out a taller row sibling. ── */}
            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={1.5}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Grade Distribution (All Subjects)</Typography>
                        <Chart options={gradeDistChartOptions} series={gradeDistChartSeries} type="bar" height={260} />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Subject Performance (Average Score)</Typography>
                        <Chart options={subjectPerfChartOptions} series={subjectPerfChartSeries} type="bar" height={260} />
                      </Paper>
                    </Grid>
                  </Grid>
                  <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Grade Distribution by Subject</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ToggleButtonGroup
                          size="small"
                          exclusive
                          value={viewMode}
                          onChange={(_, v) => v && setViewMode(v)}
                          sx={{
                            '& .MuiToggleButton-root.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
                          }}
                        >
                          <ToggleButton value="count" sx={{ fontSize: '0.7rem', py: 0.25 }}>Count</ToggleButton>
                          <ToggleButton value="percentage" sx={{ fontSize: '0.7rem', py: 0.25 }}>Percentage</ToggleButton>
                        </ToggleButtonGroup>
                        <Tooltip title="Expand">
                          <IconButton size="small" onClick={() => setTableExpanded(true)}>
                            <IconMaximize size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    <MatrixTable />
                  </Paper>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={1.5}>
                  <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Key Insights</Typography>
                      <Chip label="Insights" size="small" color="secondary" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Stack spacing={1}>
                      <InsightRow
                        icon={<IconChartBar size={18} color="#2563EB" />}
                        text={classAverageDelta === null
                          ? `Class average is ${formatScore(analytics.class_average)}%`
                          : `Class average ${classAverageDelta >= 0 ? 'improved' : 'declined'} by ${Math.abs(classAverageDelta)}% from ${formatScore(analytics.previous_term_class_average)}% last term to ${formatScore(analytics.class_average)}%.`}
                        onClick={() => setInsightModal({
                          open: true,
                          title: 'Class Average',
                          content: (
                            <Stack spacing={1}>
                              <Typography variant="body2">Current term average: <b>{formatScore(analytics.class_average)}%</b></Typography>
                              <Typography variant="body2">Previous term average: <b>{analytics.previous_term_class_average != null ? `${formatScore(analytics.previous_term_class_average)}%` : 'No data from a previous term'}</b></Typography>
                            </Stack>
                          ),
                        })}
                      />
                      <InsightRow
                        icon={<IconMedal size={18} color="#D97706" />}
                        text={`${analytics.distinction_count ?? 0} students (${pct(analytics.distinction_count ?? 0)}%) achieved distinction (A).`}
                        onClick={() => setInsightModal({ open: true, title: 'Distinction (A)', content: <Typography variant="body2">{analytics.distinction_count ?? 0} of {studentCount} students have an overall average in the top grade band this term.</Typography> })}
                      />
                      {strongestSubject && (
                        <InsightRow
                          icon={<IconBulb size={18} color="#16A34A" />}
                          text={`Highest performing subject: ${strongestSubject.name} (${formatScore(strongestSubject.average)}%).`}
                          onClick={() => setInsightModal({ open: true, title: 'Highest Performing Subject', content: <Typography variant="body2">{strongestSubject.name} has the highest average score this term, at {formatScore(strongestSubject.average)}%.</Typography> })}
                        />
                      )}
                      <InsightRow
                        icon={<IconAlertTriangle size={18} color="#DC2626" />}
                        text={`${analytics.at_risk_count ?? 0} students (${pct(analytics.at_risk_count ?? 0)}%) are at risk (D-F). Consider targeted intervention.`}
                        onClick={() => setInsightModal({ open: true, title: 'Students At Risk', content: <Typography variant="body2">{analytics.at_risk_count ?? 0} of {studentCount} students have an overall average in the D-F grade bands this term and may need extra support.</Typography> })}
                      />
                      {weakestSubject && (
                        <InsightRow
                          icon={<IconBulb size={18} color="#DC2626" />}
                          text={`Lowest performing subject: ${weakestSubject.name} (${formatScore(weakestSubject.average)}%).`}
                          onClick={() => setInsightModal({ open: true, title: 'Lowest Performing Subject', content: <Typography variant="body2">{weakestSubject.name} has the lowest average score this term, at {formatScore(weakestSubject.average)}%. Consider reviewing coverage or additional support for this subject.</Typography> })}
                        />
                      )}
                    </Stack>
                  </Paper>
                  <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                      <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: isDark ? 'rgba(124,58,237,0.2)' : '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconChartPie size={16} />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700}>Performance Distribution</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 150, height: 150, flexShrink: 0 }}>
                        <Chart options={donutOptions} series={donutSeries} type="donut" height={150} width={150} />
                      </Box>
                      <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                        {gradeDistributionAll.map((g) => {
                          const colors = getGradeColors(g.grade);
                          const sharePct = totalGraded > 0 ? Math.round((g.count / totalGraded) * 1000) / 10 : 0;
                          return (
                            <Box key={g.grade} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.color, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {g.grade} ({g.range})
                              </Typography>
                              <Typography variant="caption" fontWeight={700} sx={{ width: 20, textAlign: 'right' }}>{g.count}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ width: 44, textAlign: 'right' }}>{sharePct}%</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Paper>
                  <Paper elevation={1} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)', border: '1px solid', borderColor }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Top Performing Subjects</Typography>
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select value={topSortMode} onChange={(e) => setTopSortMode(e.target.value)} sx={{ fontSize: '0.75rem' }}>
                          <MenuItem value="average" sx={{ fontSize: '0.75rem' }}>By Average Score</MenuItem>
                          <MenuItem value="pass_rate" sx={{ fontSize: '0.75rem' }}>By Pass Rate</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Stack
                      spacing={1}
                      sx={{
                        maxHeight: 230,
                        overflowY: 'auto',
                        pr: 0.5,
                        '&::-webkit-scrollbar': { width: 5 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB', borderRadius: 3 },
                      }}
                    >
                      {topPerformingSubjects.map((s, i) => (
                        <Box key={s.subject_id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                            <Typography variant="caption" fontWeight={600}>{i + 1}. {s.name}</Typography>
                            <Typography variant="caption" fontWeight={700}>{formatScore(s.average)}%</Typography>
                          </Box>
                          <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB', overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${Math.min(100, s.average ?? 0)}%`, bgcolor: 'success.main', borderRadius: 3 }} />
                          </Box>
                        </Box>
                      ))}
                      {topPerformingSubjects.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No scored subjects yet.</Typography>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>

      {/* ── Expanded table dialog ──────────────────────────────── */}
      <Dialog open={tableExpanded} onClose={() => setTableExpanded(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Grade Distribution by Subject
          <IconX size={20} style={{ cursor: 'pointer' }} onClick={() => setTableExpanded(false)} />
        </DialogTitle>
        <DialogContent dividers><MatrixTable /></DialogContent>
        <DialogActions><Button onClick={() => setTableExpanded(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* ── Insight detail modal ───────────────────────────────── */}
      <ReusableModal open={insightModal.open} onClose={() => setInsightModal({ open: false, title: '', content: null })} title={insightModal.title} size="small">
        {insightModal.content}
      </ReusableModal>

      {/* ── Breakdown Dialog ────────────────────────────────── */}
      <Dialog open={breakdownDialog.open} onClose={closeBreakdown} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Summary Breakdown for {breakdownDialog.subject?.subject_name}</Typography>
            {breakdown.grade && (
              <Chip size="small" color="primary" label={`Grade ${breakdown.grade.grade} (${formatScore(breakdown.grade.min_score)} - ${formatScore(breakdown.grade.max_score)})`} sx={{ mt: 0.5 }} />
            )}
          </Box>
          <IconX size={20} style={{ cursor: 'pointer' }} onClick={closeBreakdown} />
        </DialogTitle>
        <DialogContent dividers>
          {breakdown.error && <Alert severity="error" sx={{ mb: 2 }}>{breakdown.error}</Alert>}
          {breakdown.loading ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['#', 'Photo', 'Participant ID', 'Participant Name', 'CA Score', 'Exam Score', 'Total'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', borderRight: '1px solid', borderColor: 'divider' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="text" width={16} /></TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="circular" width={28} height={28} /></TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="text" width={140} /></TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="text" width={30} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}><Skeleton variant="text" width={30} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align="center"><Skeleton variant="text" width={30} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                        <Avatar src={p.avatar} sx={{ width: 28, height: 28, fontSize: 10 }}>{!p.avatar && `${p.fname?.[0] ?? ''}${p.lname?.[0] ?? ''}`}</Avatar>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.admission_no}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontWeight: 500 }}>{p.lname} {p.fname} {p.mname}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.ca_total ?? '-'}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid', borderColor: 'divider' }}>{p.exam_score ?? '-'}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>{p.overall_total}</TableCell>
                    </TableRow>
                  ))}
                  {breakdown.rows.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No students in this range</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={closeBreakdown}>Close</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

const InsightRow = ({ icon, text, onClick }) => (
  <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.75, borderRadius: '8px', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
    {icon}
    <Typography variant="caption" sx={{ flexGrow: 1 }}>{text}</Typography>
    <IconChevronRight size={14} />
  </Box>
);

export default SummarySheetTab;
