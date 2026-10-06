import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Tabs,
  Tab,
  Checkbox,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
  Popover,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Divider,
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
  IconSearch,
  IconDeviceFloppy,
  IconSettings,
  IconDownload,
  IconUpload,
  IconShare2,
  IconFileAnalytics,
  IconBulb,
  IconAlertTriangle,
  IconMedal,
  IconCircleCheck,
  IconClockHour4,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconX,
  IconRefresh,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import Chart from 'react-apexcharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StatCard from '@/components/shared/StatCard';
import ReusableModal from '@/components/shared/ReusableModal';
import InputScoreDialog from './InputScoreDialog';
import DownloadCombinedDialog from './DownloadCombinedDialog';
import UploadCombinedDialog from './UploadCombinedDialog';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { encodeLinkParams, decodeLinkParams } from '@/utils/scoreLinks';
import { getTenantInfo } from '@/api/tenant/tenant_api';

const getEntityTotal = (entities) => {
  if (!entities) return 0;
  const list = Array.isArray(entities) ? entities : Object.values(entities);
  return list.reduce((sum, e) => sum + Number(e.score || 0), 0);
};

// Sum of each entity's configured max_score — the column header's "(20)" in
// "CA1 (20)", distinct from getEntityTotal which sums the actual scores.
const getEntityMaxTotal = (entities) => {
  if (!entities) return 0;
  const list = Array.isArray(entities) ? entities : Object.values(entities);
  return list.reduce((sum, e) => sum + Number(e.max_score || 0), 0);
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

// Grade-letter → chip color, keyed by first character so "A", "A+" etc. all match
const gradeColorMap = {
  A: { bg: '#DCFCE7', color: '#16A34A' },
  B: { bg: '#DBEAFE', color: '#2563EB' },
  C: { bg: '#FEF3C7', color: '#D97706' },
  D: { bg: '#FFE4CC', color: '#C2410C' },
  F: { bg: '#FEE2E2', color: '#DC2626' },
};
const getGradeColors = (grade) => gradeColorMap[grade?.[0]] || { bg: '#F1F5F9', color: '#64748B' };

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const SCORE_BANDS = [
  { label: '0-39', min: 0, max: 39 },
  { label: '40-49', min: 40, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70-79', min: 70, max: 79 },
  { label: '80-100', min: 80, max: 100 },
];

const ScoreSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL context — this page is reached from Upload Scores' subject cards
  // via an opaque token carrying both the resolved context (subject/arm/term)
  // AND the raw filter ids (session/term/programme/class/arm) so the filter
  // bar below can be prefilled without reverse-resolving anything. ─────────
  const linkParams = useMemo(() => decodeLinkParams(searchParams.get('t')), [searchParams]);

  // `appliedContext` is what's actually fetched — only changes when
  // "Switch Class/Subject" is clicked, never on every dropdown tick.
  const [appliedContext, setAppliedContext] = useState({
    subjectId: linkParams.subject_id,
    classArmId: linkParams.class_arm_id,
    sessionTermId: linkParams.session_term_id,
  });
  const { subjectId, classArmId, sessionTermId } = appliedContext;
  const hasContext = Boolean(subjectId && classArmId && sessionTermId);

  // Student search is resolved on the backend — typing alone changes nothing;
  // `appliedSearch` (set by the Fetch button next to the field, or Enter) is
  // what's actually sent with the next score-sheet request.
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // ── Filter bar state (mirrors Upload Scores' own filter) ───────────────
  const [filter, setFilter] = useState({
    session_id: linkParams.session_id || '',
    term_id: linkParams.term_id || '',
    programme_id: linkParams.programme_id || '',
    class_id: linkParams.class_id || '',
    class_arm_id: linkParams.class_arm_id || '',
    subject_id: linkParams.subject_id || '',
  });
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);

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
  const [activeTab, setActiveTab] = useState(0);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Dropdown data — same cascading pattern as Upload Scores ─────────────
  useEffect(() => {
    fetchSessions()
      .then((res) =>
        setSessions(Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : []),
      )
      .catch(() => setSessions([]));
    fetchProgrammes()
      .then((res) =>
        setProgrammes(Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : []),
      )
      .catch(() => setProgrammes([]));
    fetchSessionTerms()
      .then((res) => setSessionTerms(res?.data || []))
      .catch(() => setSessionTerms([]));
  }, []);

  useEffect(() => {
    if (!filter.session_id) {
      setTerms([]);
      return;
    }
    fetchTerms(filter.session_id)
      .then((res) =>
        setTerms(Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : []),
      )
      .catch(() => setTerms([]));
  }, [filter.session_id]);

  useEffect(() => {
    if (!filter.programme_id) {
      setClasses([]);
      return;
    }
    fetchClassesByProgramme(filter.programme_id)
      .then((res) =>
        setClasses(Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : []),
      )
      .catch(() => setClasses([]));
  }, [filter.programme_id]);

  useEffect(() => {
    if (!filter.class_id) {
      setClassArms([]);
      return;
    }
    scoreManagerApi
      .getMyClassArms({ class_id: filter.class_id, programme_id: filter.programme_id || undefined })
      .then((res) => setClassArms(res?.data?.data || []))
      .catch(() => setClassArms([]));
  }, [filter.class_id, filter.programme_id]);

  useEffect(() => {
    if (!filter.class_arm_id || !filter.session_id || !filter.term_id) {
      setSubjects([]);
      return;
    }
    scoreManagerApi
      .getClassSubjects({
        class_arm_id: filter.class_arm_id,
        session_id: filter.session_id,
        term_id: filter.term_id,
      })
      .then((res) => setSubjects(res?.data?.data || []))
      .catch(() => setSubjects([]));
  }, [filter.class_arm_id, filter.session_id, filter.term_id]);

  const resolvedSessionTermId = useMemo(() => {
    if (!filter.session_id || !filter.term_id) return null;
    const match = sessionTerms.find(
      (st) =>
        String(st.session_id) === String(filter.session_id) &&
        String(st.term_id) === String(filter.term_id),
    );
    return match?.id ?? null;
  }, [filter.session_id, filter.term_id, sessionTerms]);

  const canSwitch = Boolean(
    filter.session_id &&
    filter.term_id &&
    filter.programme_id &&
    filter.class_id &&
    filter.class_arm_id &&
    filter.subject_id,
  );

  const handleSwitchClassSubject = () => {
    if (!canSwitch || !resolvedSessionTermId) {
      showSnackbar('Pick a session, term, programme, class, arm and subject first', 'warning');
      return;
    }
    setAppliedContext({
      subjectId: filter.subject_id,
      classArmId: filter.class_arm_id,
      sessionTermId: resolvedSessionTermId,
    });
    // Keep the URL in sync so refresh/share/back-button still work.
    setSearchParams({
      t: encodeLinkParams({
        subject_id: filter.subject_id,
        class_arm_id: filter.class_arm_id,
        session_term_id: resolvedSessionTermId,
        session_id: filter.session_id,
        term_id: filter.term_id,
        programme_id: filter.programme_id,
        class_id: filter.class_id,
      }),
    });
  };

  // Grade/remark lookup: prefers the school's configured grade settings,
  // falls back to the default scale. No grade at all until the exam score is
  // actually entered — a CA-only total would otherwise resolve to a real
  // (and misleadingly low) band before the exam is ever recorded.
  const getGradeInfo = useCallback(
    (score, examScore) => {
      if (examScore === null || examScore === undefined || examScore === '') return null;
      const scale =
        (scoreSheetData?.grade_settings || []).length > 0
          ? scoreSheetData.grade_settings
          : defaultGradeScale;
      return scale.find((g) => score >= g.min_score && score <= g.max_score) || null;
    },
    [scoreSheetData],
  );

  // ── Fetch score sheet data — fires whenever the applied context changes
  // (page load, or "Switch Class/Subject"). ──────────────────────────────
  const fetchScoreSheet = useCallback(async () => {
    if (!hasContext) return;
    setLoading(true);
    try {
      const res = await scoreManagerApi.getScoreSheetData({
        subject_id: subjectId,
        session_term_id: sessionTermId,
        class_arm_id: classArmId,
        search: appliedSearch || undefined,
      });

      const data = res?.data?.data;
      if (data) {
        setScoreSheetData(data);
        setStudents(data.students || []);
        setMarkConfig(data.mark_config);
        setAnalytics(data.analytics);

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
  }, [hasContext, subjectId, sessionTermId, classArmId, appliedSearch]);

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

  // ── Edit/purge availability — editing and purging stay available right
  // up until the broadsheet is actually published. ───────────────────────
  const editState = scoreSheetData?.edit_state || 'editable';
  const isEditable = editState === 'editable';
  const isLockedPublished = editState === 'locked_published';

  // ══════════════════════════════════════════════════════════════════════
  // Inline editing (Score Entry table)
  // ══════════════════════════════════════════════════════════════════════
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState([]); // editable working copy of `students`
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [savingIds, setSavingIds] = useState(new Set());

  // Seed/reset the editable copy whenever fresh data arrives.
  useEffect(() => {
    setRows(
      students.map((s) => ({
        ...s,
        ca: caColumns.map((ca, ci) => {
          const savedCa = normalizeCa(s.ca)[ci] || {};
          const entities = Array.isArray(ca.entities)
            ? ca.entities
            : Object.values(ca.entities || {});
          const savedEntityList = Array.isArray(savedCa.entities)
            ? savedCa.entities
            : Object.values(savedCa.entities || {});
          return {
            ...ca,
            entities: entities.map((ent, ei) => ({
              ...ent,
              score: savedEntityList[ei]?.score ?? '',
            })),
          };
        }),
      })),
    );
    setDirtyIds(new Set());
  }, [students, caColumns]);

  const getCaValue = (row, caIndex) => {
    const entities = row.ca?.[caIndex]?.entities;
    if (!entities || !entities.length) return '';
    return entities[0]?.score ?? '';
  };

  const setCaValue = (rowId, caIndex, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    setRows((prev) =>
      prev.map((r) => {
        if (r.course_registration_id !== rowId) return r;
        const ca = [...(r.ca || [])];
        const entities = Array.isArray(ca[caIndex]?.entities) ? [...ca[caIndex].entities] : [];
        entities[0] = { ...(entities[0] || {}), score: numeric };
        ca[caIndex] = { ...ca[caIndex], entities };
        return { ...r, ca };
      }),
    );
    setDirtyIds((prev) => new Set(prev).add(rowId));
  };

  const setExamValue = (rowId, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    setRows((prev) =>
      prev.map((r) => (r.course_registration_id === rowId ? { ...r, exam_score: numeric } : r)),
    );
    setDirtyIds((prev) => new Set(prev).add(rowId));
  };

  const saveRow = async (row) => {
    setSavingIds((prev) => new Set(prev).add(row.course_registration_id));
    try {
      await scoreManagerApi.manualUpload({
        student: {
          user_id: row.user_id,
          course_registration_id: row.course_registration_id,
          ca_details: row.ca,
          examScores: row.exam_score,
        },
        session_term_id: sessionTermId,
        session_id: filter.session_id || undefined,
        term_id: filter.term_id || undefined,
      });
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(row.course_registration_id);
        return next;
      });
      return true;
    } catch (err) {
      console.error('Failed to save row:', err);
      showSnackbar(
        err?.response?.data?.message || `Failed to save scores for ${row.fname} ${row.lname}`,
        'error',
      );
      return false;
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(row.course_registration_id);
        return next;
      });
    }
  };

  const handleSaveAllScores = async () => {
    const dirtyRows = rows.filter((r) => dirtyIds.has(r.course_registration_id));
    if (dirtyRows.length === 0) {
      showSnackbar('Nothing to save — no scores were changed', 'info');
      setEditMode(false);
      return;
    }
    const results = await Promise.all(dirtyRows.map(saveRow));
    const successCount = results.filter(Boolean).length;
    if (successCount > 0) {
      showSnackbar(`Saved scores for ${successCount} student(s)`);
    }
    if (successCount === dirtyRows.length) {
      setEditMode(false);
      fetchScoreSheet();
    }
  };

  const toggleEditMode = () => {
    if (!isEditable) return;
    if (editMode && dirtyIds.size > 0) {
      showSnackbar('Save or discard your changes before exiting edit mode', 'warning');
      return;
    }
    setEditMode((v) => !v);
  };

  // ── Row selection (checkboxes) ──────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());
  const toggleSelectAll = (checked) => {
    setSelected(checked ? new Set(pagedRows.map((r) => r.course_registration_id)) : new Set());
  };
  const toggleSelectOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Sort (client-side — the search itself is resolved on the backend) ──
  const [sortAsc, setSortAsc] = useState(true);

  const filteredRows = useMemo(() => {
    const list = [...rows].sort((a, b) => {
      const an = `${a.lname} ${a.fname}`.toLowerCase();
      const bn = `${b.lname} ${b.fname}`.toLowerCase();
      return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    return list;
  }, [rows, sortAsc]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  useEffect(() => setPage(0), [appliedSearch, rows.length]);
  const pagedRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );

  // ── Fill / Apply to selected ─────────────────────────────────────────────
  const [fillAnchor, setFillAnchor] = useState(null);
  const [fillColumn, setFillColumn] = useState('');
  const [fillValue, setFillValue] = useState('');
  const fillOptions = [
    ...caColumns.map((ca, ci) => ({ key: `ca:${ci}`, label: ca.display_name || `CA${ci + 1}` })),
    { key: 'exam', label: 'Exam' },
  ];
  const applyFillToSelected = () => {
    if (!fillColumn || fillValue === '' || selected.size === 0) return;
    selected.forEach((id) => {
      if (fillColumn === 'exam') {
        setExamValue(id, String(fillValue));
      } else {
        const ci = Number(fillColumn.split(':')[1]);
        setCaValue(id, ci, String(fillValue));
      }
    });
    showSnackbar(`Applied to ${selected.size} selected student(s) — remember to Save Scores`);
    setFillAnchor(null);
    setFillValue('');
    setFillColumn('');
  };

  // ── Table settings popover (column visibility) ──────────────────────────
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [showRemark, setShowRemark] = useState(true);

  // ── Print helpers ───────────────────────────────────────
  const esc = (v) =>
    String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

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

  const currentAllocation =
    subjectId && classArmId
      ? {
          subject_id: subjectId,
          class_arm_id: classArmId,
          subject_name: subjectLabel,
          class_name: classLabel,
        }
      : null;

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

  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const handleDownloadScoreSheet = async () => {
    if (students.length === 0) {
      showSnackbar('No student records to download', 'warning');
      return;
    }
    setDownloadingExcel(true);
    try {
      const res = await scoreManagerApi.exportScoreSheetExcel({
        subject_id: subjectId,
        class_arm_id: classArmId,
        session_term_id: sessionTermId,
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subjectLabel || 'score-sheet'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to download the score sheet', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

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

  // ══════════════════════════════════════════════════════════════════════
  // Stats, distributions & insights
  // ══════════════════════════════════════════════════════════════════════
  const totalsWithNames = useMemo(
    () =>
      students.map((r) => ({
        id: r.course_registration_id,
        name: `${r.fname} ${r.lname}`.trim(),
        total: getOverallTotal(r.ca, r.exam_score),
        hasExam: r.exam_score !== null && r.exam_score !== undefined && r.exam_score !== '',
        hasCa: normalizeCa(r.ca).some((ca) =>
          (Array.isArray(ca.entities) ? ca.entities : Object.values(ca.entities || {})).some(
            (e) => e.score !== '' && e.score !== null && e.score !== undefined,
          ),
        ),
      })),
    [students],
  );

  const totalStudents = students.length;
  const completedCount = totalsWithNames.filter((s) => s.hasCa && s.hasExam).length;
  const pendingCount = totalStudents - completedCount;
  const completedPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
  const pendingPct = totalStudents > 0 ? 100 - completedPct : 0;
  const classAverage =
    totalsWithNames.length > 0
      ? Math.round(
          (totalsWithNames.reduce((a, b) => a + b.total, 0) / totalsWithNames.length) * 10,
        ) / 10
      : 0;
  const highest = totalsWithNames.reduce(
    (best, s) => (s.total > (best?.total ?? -Infinity) ? s : best),
    null,
  );
  const lowest = totalsWithNames.reduce(
    (worst, s) => (s.total < (worst?.total ?? Infinity) ? s : worst),
    null,
  );
  // null when there's no previous term, or nothing scored in it yet — the
  // Class Average card falls back to its plain "Overall score" subtitle then.
  const previousTermAverage = analytics?.previous_term_class_average ?? null;

  const scoreDistribution = useMemo(
    () =>
      SCORE_BANDS.map((band) => ({
        ...band,
        count: totalsWithNames.filter((s) => s.total >= band.min && s.total <= band.max).length,
      })),
    [totalsWithNames],
  );

  const gradeDistribution = useMemo(() => {
    const scale =
      (scoreSheetData?.grade_settings || []).length > 0
        ? scoreSheetData.grade_settings
        : defaultGradeScale;
    return scale.map((band) => ({
      grade: band.grade,
      count: students.filter((r) => {
        const total = getOverallTotal(r.ca, r.exam_score);
        return (
          r.exam_score !== null &&
          r.exam_score !== undefined &&
          r.exam_score !== '' &&
          total >= band.min_score &&
          total <= band.max_score
        );
      }).length,
    }));
  }, [students, scoreSheetData]);

  const [distributionMode, setDistributionMode] = useState('score');
  const distChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: {
      categories: (distributionMode === 'score' ? scoreDistribution : gradeDistribution).map((d) =>
        distributionMode === 'score' ? d.label : d.grade,
      ),
    },
    colors: [distributionMode === 'score' ? '#2563eb' : '#16a34a'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: true },
    theme: { mode: isDark ? 'dark' : 'light' },
  };
  const distChartSeries = [
    {
      name: 'Students',
      data: (distributionMode === 'score' ? scoreDistribution : gradeDistribution).map(
        (d) => d.count,
      ),
    },
  ];

  // Weakest-performing CA column (lowest average relative to its max) — used
  // by the "common weak areas" insight below.
  const weakestColumn = useMemo(() => {
    if (!caColumns.length) return null;
    const stats = caColumns.map((ca, ci) => {
      const maxScore = getEntityMaxTotal(ca.entities) || 1;
      const scores = students
        .map((s) => getEntityTotal(normalizeCa(s.ca)?.[ci]?.entities))
        .filter((v) => v > 0);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { label: ca.display_name || `CA${ci + 1}`, avgPct: avg / maxScore };
    });
    return stats.reduce((worst, s) => (s.avgPct < (worst?.avgPct ?? Infinity) ? s : worst), null);
  }, [caColumns, students]);

  const belowFifty = totalsWithNames.filter((s) => s.hasExam && s.total < 50);
  const aboveEighty = totalsWithNames.filter((s) => s.hasExam && s.total >= 80);

  const [insightModal, setInsightModal] = useState({ open: false, title: '', content: null });

  // ══════════════════════════════════════════════════════════════════════
  // Import Scores modal (chooser → reuses Upload Scores' own Download/Upload)
  // ══════════════════════════════════════════════════════════════════════
  const [importChooser, setImportChooser] = useState(false);
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const combinedAllocations = currentAllocation
    ? [
        {
          subject_id: currentAllocation.subject_id,
          subject_name: subjectLabel,
          class_name: classLabel,
        },
      ]
    : [];
  const combinedFilter = {
    session_id: filter.session_id,
    term_id: filter.term_id,
    programme_id: filter.programme_id,
    class_arm_id: classArmId,
  };

  const showTable = hasContext && scoreSheetData;

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Session</InputLabel>
              <Select
                value={filter.session_id}
                label="Session"
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    session_id: e.target.value,
                    programme_id: '',
                    class_id: '',
                    class_arm_id: '',
                    subject_id: '',
                  })
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.session_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Term</InputLabel>
              <Select
                value={filter.term_id}
                label="Term"
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    term_id: e.target.value,
                    programme_id: '',
                    class_id: '',
                    class_arm_id: '',
                    subject_id: '',
                  })
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Programme</InputLabel>
              <Select
                value={filter.programme_id}
                label="Programme"
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    programme_id: e.target.value,
                    class_id: '',
                    class_arm_id: '',
                    subject_id: '',
                  })
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {programmes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.programme_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                value={filter.class_id}
                label="Class"
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    class_id: e.target.value,
                    class_arm_id: '',
                    subject_id: '',
                  })
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class Arm</InputLabel>
              <Select
                value={filter.class_arm_id}
                label="Class Arm"
                onChange={(e) =>
                  setFilter({ ...filter, class_arm_id: e.target.value, subject_id: '' })
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {classArms.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.class_arm_names}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                value={filter.subject_id}
                label="Subject"
                onChange={(e) => setFilter({ ...filter, subject_id: e.target.value })}
              >
                <MenuItem value="">-- Choose --</MenuItem>
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.3 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSwitchClassSubject}
              disabled={loading || !canSwitch}
              startIcon={loading ? null : <IconRefresh size={16} />}
              sx={{ fontWeight: 600, height: '40px' }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {!hasContext && (
        <Alert severity="warning" sx={{ borderRadius: '10px', mb: 2 }}>
          This page needs a subject, class arm and term to show a score sheet — open it from a
          subject's "Score Sheet" button in Score Manager, or pick one above and click "Switch
          Class/Subject".
        </Alert>
      )}

      {hasContext && (loading || showTable) && (
        <Grid container spacing={1.25} sx={{ mb: 1.5 }} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={totalStudents}
              label="Students"
              subtitle="In this class"
              icon={IconUsers}
              colorIndex={0}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={completedCount}
              label="Completed"
              subtitle={`${completedPct}% submission`}
              progress={completedPct}
              icon={IconCircleCheck}
              colorIndex={1}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={pendingCount}
              label="Pending"
              subtitle={`${pendingPct}% remaining`}
              progress={pendingPct}
              icon={IconClockHour4}
              colorIndex={3}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={classAverage}
              label="Class Average"
              subtitle={
                previousTermAverage === null
                  ? 'Overall score'
                  : `${classAverage >= previousTermAverage ? '▲' : '▼'} ${Math.abs(
                      Math.round((classAverage - previousTermAverage) * 10) / 10,
                    )} vs last term`
              }
              icon={IconTrophy}
              colorIndex={2}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={highest ? highest.total : '-'}
              label="Highest Score"
              subtitle={highest?.name || '—'}
              icon={IconMedal}
              colorIndex={1}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} sx={{ display: 'flex' }}>
            <StatCard
              count={lowest ? lowest.total : '-'}
              label="Lowest Score"
              subtitle={lowest?.name || '—'}
              icon={IconPercentage}
              colorIndex={4}
              loading={loading}
              sx={{ minHeight: 92 }}
            />
          </Grid>
        </Grid>
      )}

      {showTable && (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 9.25 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '14px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  pt: 1.5,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {subjectLabel || 'Score Sheet'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {classLabel} · {termLabel}
                </Typography>
                {isEditable && scoreSheetData?.overall_submission_status === 'submitted' && (
                  <Tooltip title="Scores have been submitted — still editable here until the broadsheet is published">
                    <Chip
                      icon={<IconCircleCheck size={14} />}
                      label="Submitted"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Tooltip>
                )}
              </Box>

              <Box
                sx={{
                  px: 2,
                  mt: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                  <Tab label="Score Entry" />
                  {/* <Tab label="Class Analytics" disabled />
                  <Tab label="Item Analysis" disabled /> */}
                </Tabs>
                {activeTab === 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pb: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconUpload size={16} />}
                      onClick={() => setImportChooser(true)}
                    >
                      Import Scores
                    </Button>
                    {isEditable && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<IconTrash size={16} />}
                        onClick={() => setPurgeDialog({ open: true })}
                      >
                        Purge Scores
                      </Button>
                    )}
                    {editMode && (
                      <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        startIcon={<IconDeviceFloppy size={16} />}
                        onClick={handleSaveAllScores}
                      >
                        Save Scores {dirtyIds.size > 0 ? `(${dirtyIds.size})` : ''}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>

              {activeTab === 0 && (
                <>
                  {/* ── Status banners ─────────────────────────────── */}
                  <Box sx={{ px: 2, pt: 1 }}>
                    {isLockedPublished && (
                      <Alert
                        severity="success"
                        icon={<IconLock size={18} />}
                        sx={{ borderRadius: '10px' }}
                      >
                        <Typography variant="subtitle2">Broadsheet Published</Typography>
                        This class's broadsheet has been published — scores are locked and can no
                        longer be edited or purged here.
                      </Alert>
                    )}
                    {isEditable && scoreSheetData?.overall_submission_status === 'pending' && (
                      <Alert
                        severity="info"
                        sx={{ borderRadius: '10px' }}
                        action={
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<IconSend size={14} />}
                            onClick={handleSubmitScores}
                          >
                            SUBMIT SCORES
                          </Button>
                        }
                      >
                        <Typography variant="subtitle2">Scores Submission Status</Typography>
                        Scores not submitted by Subject Teacher yet
                      </Alert>
                    )}
                  </Box>

                  {/* ── Toolbar ─────────────────────────────────────── */}
                  <Box
                    sx={{
                      px: 2,
                      pt: 1,
                      pb: 0.5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Search for a student..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setAppliedSearch(searchInput.trim());
                      }}
                      sx={{ minWidth: 220, flexGrow: 1, maxWidth: 320 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconSearch size={16} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Tooltip title="Search">
                      <IconButton
                        size="small"
                        onClick={() => setAppliedSearch(searchInput.trim())}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <IconSearch size={16} color={theme.palette.primary.main} />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip
                      title={
                        isEditable
                          ? "Turn this on to edit every student's scores directly in the table"
                          : 'Editing is disabled — this broadsheet has been published'
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={editMode}
                              onChange={toggleEditMode}
                              disabled={!isEditable}
                              color="warning"
                            />
                          }
                          label={<Typography variant="body2">Edit Scores</Typography>}
                        />
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color={editMode ? 'warning.main' : 'text.secondary'}
                        >
                          {editMode ? 'On' : 'Off'}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip
                      title={
                        selected.size === 0
                          ? 'Select students with the row checkboxes first'
                          : !editMode
                            ? 'Turn on Edit Scores first'
                            : `Apply a value to ${selected.size} selected student(s)`
                      }
                    >
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={selected.size === 0 || !editMode}
                          onClick={(e) => setFillAnchor(e.currentTarget)}
                        >
                          Fill / Apply to All
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title="Table settings">
                      <IconButton size="small" onClick={(e) => setSettingsAnchor(e.currentTarget)}>
                        <IconSettings size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* ── Table ───────────────────────────────────────── */}
                  <Box
                    sx={{
                      px: 1.5,
                      pb: 0.75,
                      ...(editMode && {
                        '& .MuiTableContainer-root': {
                          border: '2px dashed',
                          borderColor: 'warning.main',
                          bgcolor: alpha(theme.palette.warning.main, isDark ? 0.08 : 0.04),
                        },
                      }),
                    }}
                  >
                    {editMode && (
                      <Chip
                        label="Editing — changes aren't saved yet"
                        color="warning"
                        size="small"
                        sx={{ mb: 1, fontWeight: 600 }}
                      />
                    )}
                    <TableContainer
                      sx={{
                        overflowX: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                        '& tbody tr:nth-of-type(odd)': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        },
                        '& tbody tr:nth-of-type(even)': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#F1F5F9',
                        },
                      }}
                    >
                      <Table
                        stickyHeader
                        size="small"
                        sx={{
                          whiteSpace: 'nowrap',
                          '& .MuiTableCell-root': { py: 0.5 },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell
                              padding="checkbox"
                              sx={{ bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}
                            >
                              <Checkbox
                                size="small"
                                indeterminate={
                                  selected.size > 0 && selected.size < pagedRows.length
                                }
                                checked={pagedRows.length > 0 && selected.size === pagedRows.length}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                              />
                            </TableCell>
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
                                width: 220,
                                minWidth: 220,
                                cursor: 'pointer',
                              }}
                              onClick={() => setSortAsc((v) => !v)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                Student Name
                                {sortAsc ? <IconArrowUp size={13} /> : <IconArrowDown size={13} />}
                              </Box>
                            </TableCell>
                            {caColumns.map((ca, ci) => (
                              <TableCell
                                key={ca.display_name || ci}
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: isDark ? 'grey.900' : 'grey.50',
                                  ...cellBorderSx,
                                  width: 100,
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
                                  {ca.display_name || `CA${ci + 1}`} (
                                  {getEntityMaxTotal(ca.entities) || 0})
                                  <Tooltip
                                    title={`Print ${ca.display_name || `CA${ci + 1}`} Report`}
                                  >
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
                                </Box>
                              </TableCell>
                            ))}
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                bgcolor: isDark ? 'grey.900' : 'grey.50',
                                ...cellBorderSx,
                                width: 100,
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
                                Exam ({markConfig?.exam_max_score || 0})
                                <Tooltip title="Print Exam Report">
                                  <IconButton
                                    size="small"
                                    sx={{ p: 0.25 }}
                                    onClick={() => handlePrintColumnReport({ type: 'exam' })}
                                  >
                                    <IconPrinter size={13} color="#0288D1" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                bgcolor: isDark ? 'grey.900' : 'grey.50',
                                ...cellBorderSx,
                                width: 70,
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
                                width: 70,
                              }}
                              align="center"
                            >
                              Grade
                            </TableCell>
                            {showRemark && (
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: isDark ? 'grey.900' : 'grey.50',
                                  ...cellBorderSx,
                                  width: 110,
                                }}
                              >
                                Remark
                              </TableCell>
                            )}
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
                                  {Array.from({ length: caColumns.length + 6 }).map((__, ci) => (
                                    <TableCell key={ci} sx={cellBorderSx}>
                                      <Skeleton variant="text" />
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            : pagedRows.map((res, i) => {
                                const total = getOverallTotal(res.ca, res.exam_score);
                                const gradeInfo = getGradeInfo(total, res.exam_score);
                                const colors = getGradeColors(gradeInfo?.grade);
                                const isSelected = selected.has(res.course_registration_id);
                                const isSaving = savingIds.has(res.course_registration_id);
                                return (
                                  <TableRow
                                    key={res.course_registration_id || i}
                                    hover
                                    selected={isSelected}
                                  >
                                    <TableCell padding="checkbox" sx={cellBorderSx}>
                                      <Checkbox
                                        size="small"
                                        checked={isSelected}
                                        onChange={() => toggleSelectOne(res.course_registration_id)}
                                      />
                                    </TableCell>
                                    <TableCell sx={cellBorderSx}>
                                      {page * rowsPerPage + i + 1}
                                    </TableCell>
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
                                          {(!res.avatar && `${res.fname?.[0]}${res.lname?.[0]}`) ||
                                            '?'}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                          <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                              {res.lname} {res.fname} {res.mname}
                                            </Typography>
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
                                    {caColumns.map((ca, ci) => (
                                      <TableCell
                                        key={ci}
                                        align="center"
                                        sx={{ ...cellBorderSx, width: 100 }}
                                      >
                                        {editMode ? (
                                          <TextField
                                            size="small"
                                            variant="outlined"
                                            value={getCaValue(res, ci)}
                                            onChange={(e) =>
                                              setCaValue(
                                                res.course_registration_id,
                                                ci,
                                                e.target.value,
                                              )
                                            }
                                            sx={{
                                              width: 64,
                                              '& input': {
                                                textAlign: 'center',
                                                py: 0.5,
                                                fontWeight: 700,
                                              },
                                            }}
                                          />
                                        ) : (
                                          <Typography variant="body2" fontWeight={700}>
                                            {displayScore(
                                              getEntityTotal(res.ca?.[ci]?.entities) || null,
                                            )}
                                          </Typography>
                                        )}
                                      </TableCell>
                                    ))}
                                    <TableCell align="center" sx={{ ...cellBorderSx, width: 100 }}>
                                      {editMode ? (
                                        <TextField
                                          size="small"
                                          variant="outlined"
                                          value={res.exam_score ?? ''}
                                          onChange={(e) =>
                                            setExamValue(res.course_registration_id, e.target.value)
                                          }
                                          sx={{
                                            width: 64,
                                            '& input': {
                                              textAlign: 'center',
                                              py: 0.5,
                                              fontWeight: 700,
                                            },
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label={displayScore(res.exam_score)}
                                          size="small"
                                          sx={{
                                            fontWeight: 700,
                                            minWidth: 44,
                                            bgcolor: gradeInfo ? colors.bg : 'action.selected',
                                            color: gradeInfo ? colors.color : 'text.secondary',
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell align="center" sx={{ ...cellBorderSx, width: 70 }}>
                                      {isSaving ? (
                                        <CircularProgress size={14} />
                                      ) : (
                                        <Typography variant="body2" fontWeight={700}>
                                          {displayScore(total)}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell align="center" sx={{ ...cellBorderSx, width: 70 }}>
                                      {gradeInfo ? (
                                        <Chip
                                          label={gradeInfo.grade}
                                          size="small"
                                          sx={{
                                            fontWeight: 700,
                                            minWidth: 36,
                                            bgcolor: colors.bg,
                                            color: colors.color,
                                          }}
                                        />
                                      ) : (
                                        <Tooltip title="No grade until the exam score is entered">
                                          <Chip
                                            label="Pending"
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                              fontWeight: 600,
                                              minWidth: 36,
                                              color: 'text.secondary',
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                    {showRemark && (
                                      <TableCell sx={{ ...cellBorderSx, width: 110 }}>
                                        <Typography
                                          variant="caption"
                                          fontWeight={700}
                                          color="text.secondary"
                                        >
                                          {gradeInfo?.remark || '-'}
                                        </Typography>
                                      </TableCell>
                                    )}
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

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        px: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {selected.size} of {filteredRows.length} selected
                      </Typography>
                      <TablePagination
                        component="div"
                        count={filteredRows.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                      />
                    </Box>
                  </Box>

                  {!editMode &&
                    isEditable &&
                    scoreSheetData?.overall_submission_status === 'pending' && (
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
                </>
              )}

              {activeTab !== 0 && (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">Coming soon.</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ── Right sidebar ─────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 2.75 }}>
            <Stack spacing={1.25}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Class Performance
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={distributionMode}
                  onChange={(_, v) => v && setDistributionMode(v)}
                  fullWidth
                  sx={{
                    mb: 1.5,
                    '& .MuiToggleButton-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                      },
                    },
                  }}
                >
                  <ToggleButton value="score">Score Distribution</ToggleButton>
                  <ToggleButton value="grade">Grade Distribution</ToggleButton>
                </ToggleButtonGroup>
                <Chart
                  options={distChartOptions}
                  series={distChartSeries}
                  type="bar"
                  height={175}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Performance Insights
                  </Typography>
                  <Chip label="Insights" size="small" color="secondary" sx={{ fontWeight: 700 }} />
                </Box>
                <Stack spacing={1}>
                  <InsightRow
                    icon={<IconChartBar size={18} color="#2563EB" />}
                    text={
                      previousTermAverage === null
                        ? `Class average is ${classAverage}`
                        : `Class average is ${classAverage}, ${
                            classAverage >= previousTermAverage ? '↑' : '↓'
                          } ${Math.abs(
                            Math.round((classAverage - previousTermAverage) * 10) / 10,
                          )} points ${classAverage >= previousTermAverage ? 'higher' : 'lower'} than last term`
                    }
                    onClick={() =>
                      setInsightModal({
                        open: true,
                        title: 'Class Average Breakdown',
                        content: (
                          <Stack spacing={1}>
                            {caColumns.map((ca, ci) => {
                              const scores = students
                                .map((s) => getEntityTotal(normalizeCa(s.ca)?.[ci]?.entities))
                                .filter((v) => v > 0);
                              const avg = scores.length
                                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                                : '-';
                              return (
                                <Typography key={ci} variant="body2">
                                  {ca.display_name || `CA${ci + 1}`} average: <b>{avg}</b>
                                </Typography>
                              );
                            })}
                            <Typography variant="body2">
                              Overall class average: <b>{classAverage}</b>
                            </Typography>
                          </Stack>
                        ),
                      })
                    }
                  />
                  <InsightRow
                    icon={<IconMedal size={18} color="#D97706" />}
                    text={`${aboveEighty.length} student(s) scored 80 and above`}
                    onClick={() =>
                      setInsightModal({
                        open: true,
                        title: 'Top Performers (80 and above)',
                        content: (
                          <Stack spacing={0.5}>
                            {aboveEighty.length === 0 && (
                              <Typography variant="body2">None yet.</Typography>
                            )}
                            {aboveEighty.map((s) => (
                              <Typography key={s.id} variant="body2">
                                {s.name} — {s.total}
                              </Typography>
                            ))}
                          </Stack>
                        ),
                      })
                    }
                  />
                  <InsightRow
                    icon={<IconAlertTriangle size={18} color="#DC2626" />}
                    text={`${belowFifty.length} student(s) are below 50`}
                    onClick={() =>
                      setInsightModal({
                        open: true,
                        title: 'Students Below 50',
                        content: (
                          <Stack spacing={0.5}>
                            {belowFifty.length === 0 && (
                              <Typography variant="body2">None — nice work.</Typography>
                            )}
                            {belowFifty.map((s) => (
                              <Typography key={s.id} variant="body2">
                                {s.name} — {s.total}
                              </Typography>
                            ))}
                          </Stack>
                        ),
                      })
                    }
                  />
                  <InsightRow
                    icon={<IconBulb size={18} color="#D97706" />}
                    text={
                      weakestColumn
                        ? `Common weak area: ${weakestColumn.label}`
                        : 'Not enough data yet'
                    }
                    onClick={() =>
                      setInsightModal({
                        open: true,
                        title: 'Common Weak Areas',
                        content: (
                          <Typography variant="body2">
                            {weakestColumn
                              ? `${weakestColumn.label} has the lowest average relative to its max score (${Math.round(weakestColumn.avgPct * 100)}%). Consider additional support or revision on this component.`
                              : 'Not enough scored entries yet to identify a weak area.'}
                          </Typography>
                        ),
                      })
                    }
                  />
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={
                        downloadingExcel ? (
                          <CircularProgress size={14} />
                        ) : (
                          <IconDownload size={16} />
                        )
                      }
                      onClick={handleDownloadScoreSheet}
                      disabled={downloadingExcel}
                     sx={{ fontSize: '0.75rem', px: 0.5 }}>
                      Download
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={
                        printing ? <CircularProgress size={14} /> : <IconPrinter size={16} />
                      }
                      onClick={handlePrintScoreSheet}
                      disabled={printing}
                     sx={{ fontSize: '0.75rem', px: 0.5 }}>
                      Print
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Tooltip title="Coming soon">
                      <span>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<IconShare2 size={16} />}
                          disabled
                         sx={{ fontSize: '0.75rem', px: 0.5 }}>
                          Share
                        </Button>
                      </span>
                    </Tooltip>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<IconFileAnalytics size={16} />}
                      onClick={viewResult}
                     sx={{ fontSize: '0.75rem', px: 0.5 }}>
                      Reports
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {!showTable && hasContext && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
            p: loading ? 3 : 5,
            textAlign: loading ? 'left' : 'center',
          }}
        >
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
                No score sheet data found.
              </Typography>
            </>
          )}
        </Paper>
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

      {/* ── Fill / Apply to selected popover ──────────────────── */}
      <Popover
        open={Boolean(fillAnchor)}
        anchorEl={fillAnchor}
        onClose={() => setFillAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 260 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Apply to {selected.size} selected
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>Column</InputLabel>
            <Select
              value={fillColumn}
              label="Column"
              onChange={(e) => setFillColumn(e.target.value)}
            >
              {fillOptions.map((o) => (
                <MenuItem key={o.key} value={o.key}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Value"
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value.replace(/[^0-9.]/g, ''))}
            sx={{ mb: 1.5 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={applyFillToSelected}
            disabled={!fillColumn || fillValue === ''}
          >
            Apply
          </Button>
        </Box>
      </Popover>

      {/* ── Table settings popover ─────────────────────────────── */}
      <Popover
        open={Boolean(settingsAnchor)}
        anchorEl={settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
      >
        <Box sx={{ p: 2, width: 220 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Table Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showRemark}
                onChange={(e) => setShowRemark(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Show Remark column</Typography>}
          />
        </Box>
      </Popover>

      {/* ── Insight detail modal ───────────────────────────────── */}
      <ReusableModal
        open={insightModal.open}
        onClose={() => setInsightModal({ open: false, title: '', content: null })}
        title={insightModal.title}
        size="large"
      >
        {insightModal.content}
      </ReusableModal>

      {/* ── Import Scores chooser modal ────────────────────────── */}
      <ReusableModal
        open={importChooser}
        onClose={() => setImportChooser(false)}
        title="Import Scores"
        subtitle={`${subjectLabel} — ${classLabel}`}
        size="small"
      >
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<IconDownload size={18} />}
            onClick={() => {
              setImportChooser(false);
              setDownloadDialog(true);
            }}
          >
            Download Score Sheet
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<IconUpload size={18} />}
            onClick={() => {
              setImportChooser(false);
              setUploadDialog(true);
            }}
          >
            Upload Filled Score Sheet
          </Button>
        </Stack>
      </ReusableModal>

      <DownloadCombinedDialog
        open={downloadDialog}
        onClose={() => setDownloadDialog(false)}
        allocations={combinedAllocations}
        filter={combinedFilter}
      />
      <UploadCombinedDialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        allocations={combinedAllocations}
        filter={combinedFilter}
        subjectName={subjectLabel}
        onUploaded={() => {
          setUploadDialog(false);
          fetchScoreSheet();
        }}
      />

      {/* ── Input Score Dialog (single-student edit from row menu) ─ */}
      <InputScoreDialog
        open={inputScoreDialog.open}
        onClose={() => setInputScoreDialog({ open: false, allocation: null, singleStudent: null })}
        allocation={inputScoreDialog.allocation}
        filter={{ session_term_id: sessionTermId }}
        singleStudent={
          inputScoreDialog.singleStudent
            ? {
                ...inputScoreDialog.singleStudent,
                caType,
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
            Are you sure you want to purge all scores for this class and subject? This action cannot
            be undone.
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
                setStudents([]);
                showSnackbar('Scores purged successfully');
                fetchScoreSheet();
              } catch (err) {
                console.error('Failed to purge scores:', err);
                showSnackbar(err?.response?.data?.message || 'Failed to purge scores', 'error');
              }
            }}
          >
            Purge Scores
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
    </>
  );
};

const InsightRow = ({ icon, text, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1,
      borderRadius: '8px',
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    {icon}
    <Typography variant="body2" sx={{ flexGrow: 1 }}>
      {text}
    </Typography>
    <IconChevronRight size={16} />
  </Box>
);

export default ScoreSheetTab;
