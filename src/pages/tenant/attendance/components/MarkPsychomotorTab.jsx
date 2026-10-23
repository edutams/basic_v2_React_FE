import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  TablePagination,
  Skeleton,
  useTheme,
  useMediaQuery,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  alpha,
  Checkbox,
  IconButton,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as ClearRowIcon,
  Visibility as ViewDetailsIcon,
  ViewList as TableViewIcon,
  ViewModule as CardViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import debounce from 'lodash/debounce';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchAcademicInfo } from '@/api/tenant/tenant_api';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import ReusableDialog from '@/components/shared/ReusableDialog';
import MarkPsychomotorStatCards from './MarkPsychomotorStatCards';
import MarkPsychomotorSidebar from './MarkPsychomotorSidebar';

const STORAGE_KEY = 'psychomotor_assessments';

/**
 * Whether a "YYYY-MM-DD" date string is strictly after today — same helper
 * as Mark Attendance, used to lock out weeks that haven't started yet.
 * Parsed as a local midnight Date, not `new Date(str)` directly (which
 * reads "YYYY-MM-DD" as UTC and can shift a day off depending on timezone).
 */
const isFutureDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const datePart = dateStr.slice(0, 10);
  if (!datePart.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  const date = new Date(datePart + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
};

/**
 * Whether a trait's stored value is a real 1-5 rating. The rating dialog
 * only ever offers 1-5, but a learner fetched from the backend can carry a
 * stored `0` (e.g. from a prior submit that zero-filled untouched traits) —
 * without this check, `0` reads as "valid" (it's not null/undefined/''),
 * so every untouched trait would show as already rated and get resubmitted
 * as a real score, corrupting Completion/Average/Needs-Attention forever.
 */
const hasValidRating = (v) => v !== null && v !== undefined && v !== '' && Number(v) > 0;

/**
 * Case-insensitive gender check — the API sends `sex` lowercase
 * ('male'/'female'), so comparing against the literal 'MALE' always fell
 * through to "female" regardless of the actual value.
 */
const isMaleGender = (gender) => String(gender || '').toLowerCase() === 'male';

const MarkPsychomotorTab = ({ metrics, onFilter }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { roles } = useTenantAuth();
  const isClassTeacher =
    Array.isArray(roles) &&
    roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'class_teacher');

  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [weeks, setWeeks] = useState([]);

  const [pSession, setPSession] = useState('');
  const [pTerm, setPTerm] = useState('');
  const [pTermId, setPTermId] = useState('');
  const [pProgramme, setPProgramme] = useState('');
  const [pClass, setPClass] = useState('');
  const [pArm, setPArm] = useState('');
  const [pWeek, setPWeek] = useState('');

  // ── Domain traits from API ───────────────────────────────
  const [affectiveTraits, setAffectiveTraits] = useState([]);
  const [psychomotorTraits, setPsychomotorTraits] = useState([]);

  // ── Assessment Data ───────────────────────────────────────
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  const [alertSnackbar, setAlertSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [activeWeekId, setActiveWeekId] = useState(null);

  const [filterApplied, setFilterApplied] = useState(false);
  const [learners, setLearners] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── New-design state: selection, trait breakdown, dialogs ──
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [traitBreakdown, setTraitBreakdown] = useState({ affective: [], psychomotor: [] });
  // Snapshot of which learners already had a persisted (submitted) average
  // at the moment we last fetched — "Completed" in Today's Summary means
  // actually submitted, not just fully rated in the local draft; "Pending"
  // is fully rated in the draft but not yet submitted. Captured once per
  // fetch so editing the draft afterward doesn't retroactively change who
  // counts as "already submitted this week."
  const [submittedSnapshot, setSubmittedSnapshot] = useState({});
  const [ratingDialog, setRatingDialog] = useState({
    open: false,
    studentId: null,
    domain: null,
    trait: null,
    learnerName: '',
    value: '',
  });
  const [applyScoreDialog, setApplyScoreDialog] = useState({
    open: false,
    domain: '',
    trait: '',
    value: '',
  });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState({ anchorEl: null, learner: null });
  const [learnerDetailOpen, setLearnerDetailOpen] = useState(false);

  // ── Table View / Card View + search (new) ───────────────────
  // "Table View" is the new per-trait-column grid; "Card View" is the
  // original stacked-list-per-domain layout this tab had before the
  // redesign — kept as an alternate view rather than removed.
  const [viewMode, setViewMode] = useState('table');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce((val) => setSearch(val), 400), []);
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  // Load saved assessments from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setAssessments((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error('Failed to load saved assessments:', e);
    }
  }, []);

  // Persist assessments to localStorage on every change
  useEffect(() => {
    if (Object.keys(assessments).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
      } catch (e) {
        console.error('Failed to save assessments:', e);
      }
    }
  }, [assessments]);

  // ── Pagination ────────────────────────────────────────────
  const [pPage, setPPage] = useState(0);
  const [pRowsPerPage, setPRowsPerPage] = useState(10);

  // Guards the one-time auto "Filter" trigger below so a teacher/admin sees
  // real data on first paint instead of an empty state requiring a manual
  // click — never re-fires once the viewer starts changing filters.
  const autoFilterAppliedRef = useRef(false);

  // ── Load Filters and auto-select active session/term ────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes, activeStRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveSessionTerm(),
        ]);
        const sessions = sessRes.data?.data || sessRes.data || [];
        setSessions(sessions);
        const programmesData = progRes.data?.data || progRes.data || [];
        setProgrammes(programmesData);

        // Auto-select session from active SessionTerm
        const activeStData = activeStRes.data?.data || activeStRes.data;
        if (activeStData?.session_id) {
          setPSession(activeStData.session_id);
          // Also pre-set term_id from the active SessionTerm
          if (activeStData.term_id) {
            setPTermId(activeStData.term_id);
          }
        } else if (sessions.length > 0) {
          setPSession(sessions[0].id);
        }

        // Fetch academic_week_id for week preselection
        try {
          const ackRes = await fetchAcademicInfo();
          if (ackRes?.academic_week_id) {
            setActiveWeekId(String(ackRes.academic_week_id));
          }
        } catch (e) {
          /* best-effort */
        }

        // Class teacher: auto-populate their own programme/class/arm, same
        // as Mark Attendance. Admin: preselect the first programme so the
        // Class/Arm chain (below) resolves without a manual pick.
        if (isClassTeacher) {
          try {
            const tcRes = await attendanceApi.getTeacherClass();
            const tcData = tcRes.data?.data;
            if (tcData?.programme_id) {
              setPProgramme(tcData.programme_id);
              const clsRes = await fetchClassesByProgramme(tcData.programme_id);
              const classesData = clsRes.data?.data || clsRes.data || [];
              setClasses(Array.isArray(classesData) ? classesData : []);
              if (tcData.class_id) {
                setPClass(tcData.class_id);
                const armRes = await fetchClassArmsByClass(tcData.class_id, {
                  programme_id: tcData.programme_id || undefined,
                });
                const armsData = armRes.data || [];
                setArms(Array.isArray(armsData) ? armsData : []);
                if (tcData.class_arm_id) {
                  setPArm(tcData.class_arm_id);
                }
              }
            }
          } catch (e) {
            console.error('Failed to load teacher class:', e);
          }
        } else if (programmesData.length > 0) {
          setPProgramme(programmesData[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pSession) return;
    fetchTerms(pSession)
      .then((r) => {
        const termsData = r.data?.data || r.data || [];
        setTerms(termsData);
        // Try to preselect the term matching the active SessionTerm's term_id
        if (Array.isArray(termsData) && termsData.length > 0) {
          const match = termsData.find((t) => String(t.id) === String(pTermId));
          if (match) {
            setPTerm(match.id);
          } else {
            setPTerm(termsData[0].id);
          }
        }
      })
      .catch(console.error);
  }, [pSession]);

  useEffect(() => {
    if (!pProgramme || isClassTeacher) return;
    fetchClassesByProgramme(pProgramme)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        const list = Array.isArray(d) ? d : [];
        setClasses(list);
        if (list.length > 0 && !list.some((c) => String(c.id) === String(pClass))) {
          setPClass(list[0].id);
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pProgramme, isClassTeacher]);

  useEffect(() => {
    if (!pClass || isClassTeacher) return;
    fetchClassArmsByClass(pClass, { programme_id: pProgramme || undefined })
      .then((r) => {
        const d = r.data || [];
        const list = Array.isArray(d) ? d : [];
        setArms(list);
        if (list.length > 0 && !list.some((a) => String(a.id) === String(pArm))) {
          setPArm(list[0].id);
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pClass, pProgramme, isClassTeacher]);

  // ── Auto-apply the filter the first time Arm + Week resolve ──
  useEffect(() => {
    if (autoFilterAppliedRef.current) return;
    if (!pArm || !pWeek) return;
    autoFilterAppliedRef.current = true;
    handleApplyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pArm, pWeek]);

  // ── Fetch Weeks when session or term changes ──────────────
  useEffect(() => {
    if (!pSession || !pTermId) return;
    attendanceApi
      .getWeeksBySessionTerm({
        session_id: pSession,
        term_id: pTermId,
      })
      .then((r) => {
        const d = r.data?.data || [];
        const weeks = Array.isArray(d) ? d : [];
        setWeeks(weeks);
        const match = activeWeekId ? weeks.find((w) => String(w.week_id) === activeWeekId) : null;
        if (match) {
          setPWeek(match.wk_id ?? match.week_id ?? match.id);
        } else {
          const fallback =
            weeks.find((w) => w.status === 'active') ||
            (weeks.length > 0 ? weeks[weeks.length - 1] : null);
          if (fallback) {
            setPWeek(fallback.wk_id ?? fallback.week_id ?? fallback.id);
          }
        }
      })
      .catch(console.error);
  }, [pSession, pTermId, activeWeekId]);

  // ── Load domain traits from API ───────────────────────────
  useEffect(() => {
    attendanceApi
      .getPsychomotorDomains({
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      })
      .then((r) => {
        const d = r.data?.data;
        if (d) {
          if (Array.isArray(d.affective_traits)) setAffectiveTraits(d.affective_traits);
          if (Array.isArray(d.psychomotor_traits)) setPsychomotorTraits(d.psychomotor_traits);
        }
      })
      .catch(console.error);
  }, [pSession, pTermId]);

  // ── Fetch Learners ────────────────────────────────────────
  const fetchLearners = useCallback(async () => {
    if (!pArm || !pWeek) return;
    setLoading(true);
    setError('');
    try {
      const res = await attendanceApi.getPsychomotorLearners({
        class_arm_id: pArm,
        week_term_id: pWeek,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      if (res.data?.status && res.data?.data) {
        const payload = res.data.data;
        const students = payload.students || payload;

        // Update domain traits from response payload
        if (Array.isArray(payload.affective_traits)) setAffectiveTraits(payload.affective_traits);
        if (Array.isArray(payload.psychomotor_traits))
          setPsychomotorTraits(payload.psychomotor_traits);

        setLearners(students);
        // Build assessments map
        const assMap = {};
        const snapshot = {};
        students.forEach((l) => {
          assMap[l.student_registration_id] = {
            affective: l.affective || {},
            psychomotor: l.psychomotor || {},
          };
          snapshot[l.student_registration_id] =
            l.average_domain !== null && l.average_domain !== undefined;
        });
        setAssessments(assMap);
        setSubmittedSnapshot(snapshot);
        setSelectedIds(new Set());
      }

      // Trait-level averages for the Top/Lowest Domain stat cards — one
      // extra call, reused endpoint, no N+1.
      attendanceApi
        .getTraitBreakdown({
          class_arm_id: pArm,
          week_term_id: pWeek,
          session_id: pSession || undefined,
          term_id: pTermId || undefined,
        })
        .then((bres) => {
          const bd = bres.data?.data;
          if (bd) {
            setTraitBreakdown({
              affective: Array.isArray(bd.affective) ? bd.affective : [],
              psychomotor: Array.isArray(bd.psychomotor) ? bd.psychomotor : [],
            });
          }
        })
        .catch(() => {});
    } catch (e) {
      console.error('Failed to fetch learners:', e);
      setError('Failed to load learners.');
    } finally {
      setLoading(false);
    }
  }, [pArm, pWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────
  const setRating = (studentRegId, domain, trait, value) => {
    setAssessments((prev) => ({
      ...prev,
      [studentRegId]: {
        ...(prev[studentRegId] || { affective: {}, psychomotor: {} }),
        [domain]: {
          ...(prev[studentRegId]?.[domain] || {}),
          [trait]: value,
        },
      },
    }));
  };

  const handleApplyFilter = () => {
    fetchLearners();
    setFilterApplied(true);
    // A new filter can return a shorter list — reset to page 1 so the
    // table never lands on a now-out-of-range page.
    setPPage(0);
    // Pass programme/class too — matches MarkAttendanceTab's onFilter shape,
    // so the parent's selectedProgrammeId/selectedClassId (used as fallback
    // preselects in the Psychomotor stat-card modal filters) stay in sync.
    if (onFilter) onFilter(pArm, pSession, pTermId, pWeek, pProgramme, pClass);
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      // A cleared or never-touched trait is dropped here rather than
      // submitted — see hasValidRating's doc comment for why `0` must be
      // excluded too, not just null/undefined/''.
      const assessmentData = Object.entries(assessments)
        .map(([studentId, data]) => ({
          student_registration_id: Number(studentId),
          affective: Object.entries(data.affective || {})
            .filter(([, rating]) => hasValidRating(rating))
            .map(([trait, rating]) => ({ trait, rating })),
          psychomotor: Object.entries(data.psychomotor || {})
            .filter(([, rating]) => hasValidRating(rating))
            .map(([trait, rating]) => ({ trait, rating })),
        }))
        .filter((entry) => entry.affective.length > 0 || entry.psychomotor.length > 0);

      await attendanceApi.submitAssessments({
        class_arm_id: Number(pArm),
        week_term_id: Number(pWeek),
        session_id: Number(pSession) || undefined,
        term_id: Number(pTermId) || undefined,
        assessments: assessmentData,
      });

      setAlertSnackbar({
        open: true,
        message: `Assessments submitted successfully — ${assessmentData.length} learner(s) saved.`,
        severity: 'success',
      });

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);

      // Refresh the stat cards now that real data changed — was only ever
      // triggered by the Filter button or a tab switch.
      if (onFilter) onFilter(pArm, pSession, pTermId, pWeek, pProgramme, pClass);
    } catch (e) {
      console.error('Failed to submit assessments:', e);
      setAlertSnackbar({
        open: true,
        message: e.response?.data?.message || 'Failed to submit assessments.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const res = await attendanceApi.exportPsychomotorReport({
        class_arm_id: pArm || undefined,
        week_term_id: pWeek || undefined,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'psychomotor-report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel export failed:', e);
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    try {
      const res = await attendanceApi.exportPsychomotorPdf({
        class_arm_id: pArm || undefined,
        week_term_id: pWeek || undefined,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        'psychomotor-report-' + new Date().toISOString().slice(0, 10) + '.pdf',
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  // ── Derived progress/stat data (new design) ─────────────────
  const allTraits = useMemo(
    () => [
      ...affectiveTraits.map((trait) => ({ domain: 'affective', trait })),
      ...psychomotorTraits.map((trait) => ({ domain: 'psychomotor', trait })),
    ],
    [affectiveTraits, psychomotorTraits],
  );
  const totalTraitSlots = allTraits.length;

  const filteredLearners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter(
      (l) => (l.name || '').toLowerCase().includes(q) || (l.admission_no || '').toLowerCase().includes(q),
    );
  }, [learners, search]);

  useEffect(() => {
    setPPage(0);
  }, [search]);

  /**
   * Per-learner rated-count/average/status, recomputed live as the draft
   * changes. "completed" = already submitted to the backend for this week
   * (per submittedSnapshot, captured at fetch time) AND still fully rated;
   * "pending" = fully rated in the draft but not yet submitted; "in_progress"
   * = partially rated; "not_started" = nothing rated yet.
   */
  const progressStats = useMemo(() => {
    const map = {};
    learners.forEach((learner) => {
      const id = learner.student_registration_id;
      const data = assessments[id] || { affective: {}, psychomotor: {} };
      let ratedCount = 0;
      let sum = 0;
      allTraits.forEach(({ domain, trait }) => {
        const val = data[domain]?.[trait];
        if (hasValidRating(val)) {
          ratedCount++;
          sum += Number(val);
        }
      });
      const avg = ratedCount > 0 ? Math.round((sum / ratedCount) * 100) / 100 : null;
      let status = 'not_started';
      if (ratedCount > 0 && ratedCount < totalTraitSlots) status = 'in_progress';
      else if (ratedCount > 0 && ratedCount === totalTraitSlots) {
        status = submittedSnapshot[id] ? 'completed' : 'pending';
      }
      map[id] = { ratedCount, avg, status };
    });
    return map;
  }, [learners, assessments, allTraits, totalTraitSlots, submittedSnapshot]);

  const todaySummary = useMemo(() => {
    const total = learners.length;
    let completed = 0;
    let pending = 0;
    let inProgress = 0;
    let notStarted = 0;
    Object.values(progressStats).forEach((p) => {
      if (p.status === 'completed') completed++;
      else if (p.status === 'pending') pending++;
      else if (p.status === 'in_progress') inProgress++;
      else notStarted++;
    });
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
    return {
      total,
      completed,
      pending,
      inProgress,
      notStarted,
      completedPct: pct(completed),
      pendingPct: pct(pending),
      inProgressPct: pct(inProgress),
      notStartedPct: pct(notStarted),
    };
  }, [learners.length, progressStats]);

  const classAverage = useMemo(() => {
    const avgs = Object.values(progressStats)
      .map((p) => p.avg)
      .filter((v) => v !== null);
    if (avgs.length === 0) return 0;
    return Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10;
  }, [progressStats]);

  // Approximation: no single blended "class average vs last term" exists
  // server-side (only separate affective/psychomotor changes), so this
  // averages the two real computed trends as a reasonable stand-in.
  const classAverageChange = useMemo(() => {
    const a = metrics?.affectiveChange;
    const p = metrics?.psychoChange;
    if (a === null || a === undefined || p === null || p === undefined) return null;
    return Math.round(((a + p) / 2) * 10) / 10;
  }, [metrics]);

  const needsAttentionCount = useMemo(
    () => Object.values(progressStats).filter((p) => p.avg !== null && p.avg < 3.0).length,
    [progressStats],
  );

  const { topDomain, lowestDomain } = useMemo(() => {
    const combined = [
      ...traitBreakdown.affective.map((t) => ({ ...t, domain: 'affective' })),
      ...traitBreakdown.psychomotor.map((t) => ({ ...t, domain: 'psychomotor' })),
    ].filter((t) => t.rated_count > 0);
    if (combined.length === 0) return { topDomain: null, lowestDomain: null };
    const top = combined.reduce((a, b) => (b.avg_rating > a.avg_rating ? b : a));
    const lowest = combined.reduce((a, b) => (b.avg_rating < a.avg_rating ? b : a));
    return {
      topDomain: { name: top.trait, avg: top.avg_rating },
      lowestDomain: { name: lowest.trait, avg: lowest.avg_rating },
    };
  }, [traitBreakdown]);

  // Rule-based ("AI") insights — deterministic templates over real computed
  // numbers, no LLM call, same convention as the Mark Attendance redesign.
  const aiInsights = useMemo(() => {
    const items = [];
    if (needsAttentionCount > 0) {
      items.push({
        text: `${needsAttentionCount} learner${needsAttentionCount > 1 ? 's' : ''} scored below 3.0 average`,
        detail: 'Consider additional support and guidance.',
      });
    }
    if (topDomain) {
      items.push({
        text: `${topDomain.name} is the strongest trait`,
        detail: `Avg. ${topDomain.avg} this week.`,
      });
    }
    if (lowestDomain) {
      items.push({
        text: `${lowestDomain.name} is the weakest trait`,
        detail: `Avg. ${lowestDomain.avg} this week.`,
      });
    }
    if (classAverageChange !== null && classAverageChange !== 0) {
      const up = classAverageChange > 0;
      items.push({
        text: `Class average is ${Math.abs(classAverageChange)} ${up ? 'higher' : 'lower'} than last term`,
        detail: up ? 'Good improvement — keep it up!' : 'Worth a closer look at what changed.',
      });
    }
    return items;
  }, [needsAttentionCount, topDomain, lowestDomain, classAverageChange]);

  // ── Selection handlers ───────────────────────────────────────
  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === learners.length
        ? new Set()
        : new Set(learners.map((l) => l.student_registration_id)),
    );
  };
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Rating dialog (checkbox → pick 1-5) ─────────────────────
  const openRatingDialog = (learner, domain, trait) => {
    const current = assessments[learner.student_registration_id]?.[domain]?.[trait] ?? '';
    setRatingDialog({
      open: true,
      studentId: learner.student_registration_id,
      domain,
      trait,
      learnerName: learner.name,
      value: current,
    });
  };
  const closeRatingDialog = () => setRatingDialog((p) => ({ ...p, open: false }));
  const confirmRatingDialog = () => {
    const { studentId, domain, trait, value } = ratingDialog;
    if (studentId && value) {
      setRating(studentId, domain, trait, Number(value));
    }
    closeRatingDialog();
  };
  const clearRatingFromDialog = () => {
    const { studentId, domain, trait } = ratingDialog;
    if (studentId) setRating(studentId, domain, trait, null);
    closeRatingDialog();
  };

  // ── Row action: clear this learner's draft ratings ──────────
  const handleClearLearner = (studentId) => {
    setAssessments((prev) => ({ ...prev, [studentId]: { affective: {}, psychomotor: {} } }));
    setRowMenu({ anchorEl: null, learner: null });
  };

  // ── Quick Actions ────────────────────────────────────────────
  const previousWeekOption = useMemo(() => {
    if (!pWeek || weeks.length === 0) return null;
    const sorted = [...weeks].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    const idx = sorted.findIndex((w) => String(w.wk_id ?? w.week_id ?? w.id) === String(pWeek));
    for (let i = idx - 1; i >= 0; i--) {
      if (!isFutureDate(sorted[i].start_date)) return sorted[i];
    }
    return null;
  }, [weeks, pWeek]);

  const handleAutoFillFromPrevious = async () => {
    if (!previousWeekOption || !pArm) return;
    const prevWeekId =
      previousWeekOption.wk_id ?? previousWeekOption.week_id ?? previousWeekOption.id;
    try {
      const res = await attendanceApi.getPsychomotorLearners({
        class_arm_id: pArm,
        week_term_id: prevWeekId,
        session_id: pSession || undefined,
        term_id: pTermId || undefined,
      });
      const students = res.data?.data?.students || [];
      const byId = {};
      students.forEach((s) => {
        byId[s.student_registration_id] = {
          affective: s.affective || {},
          psychomotor: s.psychomotor || {},
        };
      });
      setAssessments((prev) => {
        const next = { ...prev };
        learners.forEach((l) => {
          const id = l.student_registration_id;
          const prior = byId[id];
          if (!prior) return;
          const current = next[id] || { affective: {}, psychomotor: {} };
          const fill = (domain) => {
            const merged = { ...(current[domain] || {}) };
            Object.entries(prior[domain] || {}).forEach(([trait, val]) => {
              if (!hasValidRating(merged[trait]) && hasValidRating(val)) {
                merged[trait] = val;
              }
            });
            return merged;
          };
          next[id] = { affective: fill('affective'), psychomotor: fill('psychomotor') };
        });
        return next;
      });
      setAlertSnackbar({
        open: true,
        message: `Filled in blank ratings from ${previousWeekOption.week_name || 'the previous assessed week'}.`,
        severity: 'success',
      });
    } catch (e) {
      setAlertSnackbar({
        open: true,
        message: 'Failed to auto-fill from the previous week.',
        severity: 'error',
      });
    }
  };

  const handleOpenApplyScoreDialog = () => {
    if (allTraits.length === 0) return;
    setApplyScoreDialog({
      open: true,
      domain: allTraits[0].domain,
      trait: allTraits[0].trait,
      value: '',
    });
  };
  const handleConfirmApplyScore = () => {
    const { domain, trait, value } = applyScoreDialog;
    if (domain && trait && value) {
      selectedIds.forEach((id) => setRating(id, domain, trait, Number(value)));
      setAlertSnackbar({
        open: true,
        message: `Applied a score of ${value} for "${trait}" to ${selectedIds.size} learner(s).`,
        severity: 'success',
      });
    }
    setApplyScoreDialog((p) => ({ ...p, open: false }));
  };

  const handleClearSelected = () => {
    setAssessments((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = { affective: {}, psychomotor: {} };
      });
      return next;
    });
    setAlertSnackbar({
      open: true,
      message: `Cleared ratings for ${selectedIds.size} learner(s).`,
      severity: 'success',
    });
  };

  const classArmLabel = learners[0]?.class_arm_name || null;

  return (
    <Box>
      {/* ── New stats row ───────────────────────────────── */}
      <MarkPsychomotorStatCards
        loading={loading && learners.length === 0}
        totalLearners={learners.length}
        contextLabel={classArmLabel}
        completion={{ completed: todaySummary.completed, total: todaySummary.total }}
        classAverage={classAverage}
        classAverageChange={classAverageChange}
        needsAttention={needsAttentionCount}
        topDomain={topDomain}
        lowestDomain={lowestDomain}
      />

      {/* ── Two-column layout: filters/table on the left, the
          Today's Summary/AI Insights/Quick Actions sidebar on the
          right starting at the top, matching the design. ── */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 9.5 }}>
          {/* ── Filters Row ─────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 1 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={pSession}
                  label="Session"
                  onChange={(e) => setPSession(e.target.value)}
                >
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session_name || s.name || s.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Term</InputLabel>
                <Select
                  value={pTerm}
                  label="Term"
                  onChange={(e) => {
                    const val = e.target.value;
                    setPTerm(val);
                    const term = terms.find((t) => t.id === val);
                    if (term) setPTermId(term.id);
                  }}
                >
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.term_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Week</InputLabel>
                <Select value={pWeek} label="Week" onChange={(e) => setPWeek(e.target.value)}>
                  {weeks.map((w) => {
                    const weekId = w.wk_id ?? w.week_id ?? w.id;
                    // A week that hasn't started yet has nothing to assess —
                    // only weeks up to and including the current one are
                    // selectable. Past weeks stay open for catch-up.
                    const notReachedYet = isFutureDate(w.start_date);
                    return (
                      <MenuItem key={weekId} value={weekId} disabled={notReachedYet}>
                        {w.week_name || `Week ${weekId}`}
                        {notReachedYet ? ' (upcoming)' : ''}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={pProgramme}
                  label="Programme"
                  onChange={(e) => setPProgramme(e.target.value)}
                  disabled={isClassTeacher}
                >
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name || p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={pClass}
                  label="Class"
                  onChange={(e) => setPClass(e.target.value)}
                  disabled={isClassTeacher}
                >
                  {classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class/Arm</InputLabel>
                <Select
                  value={pArm}
                  label="Class/Arm"
                  onChange={(e) => setPArm(e.target.value)}
                  disabled={isClassTeacher}
                >
                  {arms.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.class_arm_names}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.6 }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<FilterIcon />}
                onClick={handleApplyFilter}
              >
                Filter
              </Button>
            </Grid>
          </Grid>

          {/* ── Action Bar (Counts on left, Filter & Actions on right) ── */}
          <Box
            sx={{
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {/* Left Side: Learner Count (only shown when filterApplied is true) */}
            <Box>
              {filterApplied && (
                <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    {search.trim()
                      ? `${filteredLearners.length} of ${learners.length} Learners`
                      : `${learners.length} Learners`}
                  </Box>{' '}
                  Loaded
                </Typography>
              )}
            </Box>

            {/* Middle: Table View / Card View + debounced search ── */}
            {filterApplied && (
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  size="small"
                  onChange={(_, val) => val && setViewMode(val)}
                >
                  <ToggleButton value="table" sx={{ textTransform: 'none', px: 1.5 }}>
                    <TableViewIcon fontSize="small" sx={{ mr: 0.5 }} /> Table View
                  </ToggleButton>
                  <ToggleButton value="card" sx={{ textTransform: 'none', px: 1.5 }}>
                    <CardViewIcon fontSize="small" sx={{ mr: 0.5 }} /> Card View
                  </ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  size="small"
                  placeholder="Search learners by name, admission no..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  sx={{ minWidth: 260 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}

            {/* Right Side: Export + Submit Final Assessments (Filter Results now sits next to the Class/Arm filter above) */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
              {filterApplied && (
                <>
                  {/* Export Dropdown */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={(e) => setExportAnchorEl(e.currentTarget)}
                  >
                    Export Report
                  </Button>
                  <Menu
                    anchorEl={exportAnchorEl}
                    open={exportMenuOpen}
                    onClose={() => setExportAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={handleExportExcel} dense>
                      <ListItemIcon>
                        <ExcelIcon fontSize="small" />
                      </ListItemIcon>
                      Export to Excel
                    </MenuItem>
                    <MenuItem onClick={handleExportPdf} dense>
                      <ListItemIcon>
                        <PdfIcon fontSize="small" />
                      </ListItemIcon>
                      Export to PDF
                    </MenuItem>
                  </Menu>

                  {/* Submit Final Assessments Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleSubmitFinal}
                    disabled={submitting || learners.length === 0}
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT FINAL ASSESSMENTS'}
                  </Button>
                </>
              )}
            </Stack>
          </Box>

          {filterApplied && learners.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your ratings are saved <strong>locally</strong>. Click{' '}
              <strong>Submit Final Assessments</strong> to permanently save them to the system —
              navigating away before submitting will lose them.
            </Alert>
          )}

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1.5px solid rgba(255, 255, 255, 0.15)'
                  : '1.5px solid #cbd5e1',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.35)'
                  : '0 4px 16px rgba(15, 23, 42, 0.05)',
              overflow: 'hidden',
            }}
          >
            <TableContainer
              sx={{
                overflowX: 'auto',
                overflowY: 'auto',
                height: { xs: '420px', md: '600px' },
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #1e293b 268px, rgba(255, 255, 255, 0.18) 268px, rgba(255, 255, 255, 0.18) 270px, #121827 270px)'
                    : 'linear-gradient(90deg, #f1f5f9 268px, #cbd5e1 268px, #cbd5e1 270px, #ffffff 270px)',
                '& .MuiTableHead-root .MuiTableCell-root': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc'),
                  fontWeight: 700,
                  color: (theme) => (theme.palette.mode === 'dark' ? '#f1f5f9' : '#0f172a'),
                  borderBottom: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.12)'
                      : '2px solid #cbd5e1',
                },
                '& .MuiTableCell-root': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                },
              }}
            >
              <Table
                sx={{
                  minWidth: 800,
                  // 'auto' (not 'fixed') so trait header columns grow to fit
                  // their full label text instead of clipping it — the
                  // sticky checkbox/S-N/Name columns stay pinned to an exact
                  // width via matching width/minWidth/maxWidth, so this
                  // doesn't affect their sticky offsets.
                  tableLayout: 'auto',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
                stickyHeader
              >
                {viewMode === 'table' ? (
                <>
                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      padding="checkbox"
                      sx={{
                        width: 44,
                        minWidth: 44,
                        maxWidth: 44,
                        ...(!isMobile && { position: 'sticky', left: 0, zIndex: 3, top: 0 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      }}
                    >
                      <Checkbox
                        size="small"
                        indeterminate={selectedIds.size > 0 && selectedIds.size < learners.length}
                        checked={learners.length > 0 && selectedIds.size === learners.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        width: 50,
                        minWidth: 50,
                        maxWidth: 50,
                        fontWeight: 700,
                        ...(!isMobile && { position: 'sticky', left: 44, zIndex: 3, top: 0 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid #cbd5e1',
                      }}
                    >
                      S/N
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        width: 220,
                        minWidth: 220,
                        maxWidth: 220,
                        fontWeight: 700,
                        ...(!isMobile && { position: 'sticky', left: 94, zIndex: 3, top: 0 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '2px solid rgba(255, 255, 255, 0.18)'
                            : '2px solid #cbd5e1',
                      }}
                    >
                      Learner's Name
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={Math.max(affectiveTraits.length, 1)}
                      sx={{
                        height: 40,
                        py: 0.5,
                        top: 0,
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                        borderRight: (theme) =>
                          `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : '#94a3b8'}`,
                      }}
                    >
                      Personal &amp; Social Skills
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={Math.max(psychomotorTraits.length, 1)}
                      sx={{
                        height: 40,
                        py: 0.5,
                        top: 0,
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                      }}
                    >
                      Creative &amp; Practical Skills
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ minWidth: 60, top: 0 }}>
                      Avg.
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ minWidth: 60, top: 0 }}>
                      Action
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {affectiveTraits.length > 0 ? (
                      affectiveTraits.map((trait, i) => (
                        <TableCell
                          key={`aff-h-${trait}`}
                          align="center"
                          sx={{
                            minWidth: 130,
                            px: 1.5,
                            fontSize: 11.5,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            top: 41,
                            ...(i === affectiveTraits.length - 1 && {
                              borderRight: (theme) =>
                                `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : '#94a3b8'}`,
                            }),
                          }}
                        >
                          {trait}
                        </TableCell>
                      ))
                    ) : (
                      <TableCell
                        align="center"
                        sx={{
                          minWidth: 130,
                          fontSize: 11.5,
                          whiteSpace: 'nowrap',
                          top: 41,
                          borderRight: (theme) =>
                            `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : '#94a3b8'}`,
                        }}
                      >
                        —
                      </TableCell>
                    )}
                    {psychomotorTraits.length > 0 ? (
                      psychomotorTraits.map((trait) => (
                        <TableCell
                          key={`psy-h-${trait}`}
                          align="center"
                          sx={{
                            minWidth: 130,
                            px: 1.5,
                            fontSize: 11.5,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            top: 41,
                          }}
                        >
                          {trait}
                        </TableCell>
                      ))
                    ) : (
                      <TableCell
                        align="center"
                        sx={{ minWidth: 130, fontSize: 11.5, whiteSpace: 'nowrap', top: 41 }}
                      >
                        —
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    // Skeleton rows matching the new column layout — checkbox +
                    // S/N + Name + one trait-column block — instead of a
                    // generic centered spinner.
                    Array.from({ length: 6 }).map((_, rowIdx) => (
                      <TableRow key={`skeleton-row-${rowIdx}`}>
                        <TableCell
                          sx={{
                            width: 44,
                            ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                          }}
                        >
                          <Skeleton variant="rounded" width={18} height={18} />
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 50,
                            minWidth: 50,
                            maxWidth: 50,
                            ...(!isMobile && { position: 'sticky', left: 44, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.12)'
                                : '1px solid #cbd5e1',
                          }}
                        >
                          <Skeleton variant="text" width={16} />
                        </TableCell>
                        <TableCell
                          sx={{
                            width: 220,
                            minWidth: 220,
                            maxWidth: 220,
                            ...(!isMobile && { position: 'sticky', left: 94, zIndex: 2 }),
                            bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                            borderRight: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '2px solid rgba(255, 255, 255, 0.18)'
                                : '2px solid #cbd5e1',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="text" width="60%" />
                          </Stack>
                        </TableCell>
                        <TableCell colSpan={totalTraitSlots + 2} align="center">
                          <Skeleton variant="rounded" height={26} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredLearners.length === 0 ? (
                    <TableRow>
                      <TableCell
                        sx={{
                          width: 44,
                          ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      />
                      <TableCell
                        sx={{
                          width: 50,
                          minWidth: 50,
                          maxWidth: 50,
                          ...(!isMobile && { position: 'sticky', left: 44, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                          borderRight: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid #cbd5e1',
                        }}
                      />
                      <TableCell
                        sx={{
                          width: 220,
                          minWidth: 220,
                          maxWidth: 220,
                          ...(!isMobile && { position: 'sticky', left: 94, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                          borderRight: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '2px solid rgba(255, 255, 255, 0.18)'
                              : '2px solid #cbd5e1',
                        }}
                      />
                      <TableCell colSpan={totalTraitSlots + 2} align="center" sx={{ py: 6, px: 2 }}>
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          {learners.length > 0
                            ? 'No learners match your search.'
                            : pArm && pWeek
                              ? 'No learners found for the selected filters.'
                              : 'Select class/arm and week, then click Filter.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLearners
                      .slice(pPage * pRowsPerPage, pPage * pRowsPerPage + pRowsPerPage)
                      .map((learner, sliceIdx) => {
                        const idx = pPage * pRowsPerPage + sliceIdx;
                        const studentAssess = assessments[learner.student_registration_id] || {
                          affective: {},
                          psychomotor: {},
                        };
                        const rowProgress = progressStats[learner.student_registration_id] || {
                          avg: null,
                          status: 'not_started',
                        };
                        const isSelected = selectedIds.has(learner.student_registration_id);
                        // The row currently being rated (rating dialog open
                        // for this learner) gets an orange highlight so the
                        // teacher can see where they are in a long roster.
                        const isBeingMarked =
                          ratingDialog.open && ratingDialog.studentId === learner.student_registration_id;
                        return (
                          <TableRow
                            key={learner.student_registration_id}
                            hover
                            selected={isSelected}
                            sx={{
                              verticalAlign: 'middle',
                              ...(isBeingMarked && {
                                bgcolor: (theme) => alpha(theme.palette.warning.main, isDark ? 0.22 : 0.14),
                                '& .MuiTableCell-root': {
                                  borderTop: '1px solid',
                                  borderTopColor: 'warning.main',
                                  borderBottom: '1px solid',
                                  borderBottomColor: 'warning.main',
                                },
                              }),
                            }}
                          >
                            <TableCell
                              padding="checkbox"
                              sx={{
                                width: 44,
                                ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                                bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(learner.student_registration_id)}
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                width: 50,
                                minWidth: 50,
                                maxWidth: 50,
                                ...(!isMobile && { position: 'sticky', left: 44, zIndex: 2 }),
                                bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                                borderRight: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.12)'
                                    : '1px solid #cbd5e1',
                              }}
                            >
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: 220,
                                minWidth: 220,
                                maxWidth: 220,
                                ...(!isMobile && { position: 'sticky', left: 94, zIndex: 2 }),
                                bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                                borderRight: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.18)'
                                    : '2px solid #cbd5e1',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={learner.avatar || undefined}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                  }}
                                >
                                  {(learner.name || '?').charAt(0)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                      {learner.name}
                                    </Typography>
                                    {/* Single-letter M/F badge, after the name now — the old
                                    chip compared gender against the literal 'MALE', but
                                    the API sends it lowercase, so it always fell through
                                    to the female icon regardless of actual gender. */}
                                    <Box
                                      title={learner.gender}
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
                                          isMaleGender(learner.gender)
                                            ? theme.palette.primary.main
                                            : theme.palette.success.main,
                                          isDark ? 0.28 : 0.14,
                                        ),
                                        color: isMaleGender(learner.gender)
                                          ? theme.palette.primary.main
                                          : theme.palette.success.main,
                                      }}
                                    >
                                      {isMaleGender(learner.gender) ? 'M' : 'F'}
                                    </Box>
                                  </Stack>
                                  {learner.admission_no && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: 'block', lineHeight: 1.2 }}
                                      noWrap
                                    >
                                      {learner.admission_no}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            {/* Per-trait checkbox cells — tap to open the 1-5 rating dialog */}
                            {affectiveTraits.map((trait, i) => {
                              const val = studentAssess.affective[trait];
                              const rated = hasValidRating(val);
                              const isLast = i === affectiveTraits.length - 1;
                              return (
                                <TableCell
                                  key={`aff-${trait}`}
                                  align="center"
                                  sx={
                                    isLast
                                      ? {
                                          borderRight: (theme) =>
                                            `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : '#94a3b8'}`,
                                        }
                                      : undefined
                                  }
                                >
                                  <Tooltip
                                    title={
                                      rated
                                        ? `${trait}: ${val}/5 — click to change`
                                        : `${trait}: not yet rated`
                                    }
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={rated}
                                      onClick={() => openRatingDialog(learner, 'affective', trait)}
                                      onChange={() => {}}
                                    />
                                  </Tooltip>
                                </TableCell>
                              );
                            })}
                            {psychomotorTraits.map((trait) => {
                              const val = studentAssess.psychomotor[trait];
                              const rated = hasValidRating(val);
                              return (
                                <TableCell key={`psy-${trait}`} align="center">
                                  <Tooltip
                                    title={
                                      rated
                                        ? `${trait}: ${val}/5 — click to change`
                                        : `${trait}: not yet rated`
                                    }
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={rated}
                                      onClick={() =>
                                        openRatingDialog(learner, 'psychomotor', trait)
                                      }
                                      onChange={() => {}}
                                    />
                                  </Tooltip>
                                </TableCell>
                              );
                            })}
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={700}>
                                {rowProgress.avg ?? '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => setRowMenu({ anchorEl: e.currentTarget, learner })}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
                </>
                ) : (
                <>
                {/* ── Card View: the original stacked-list-per-domain layout ── */}
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        width: 50,
                        minWidth: 50,
                        maxWidth: 50,
                        fontWeight: 700,
                        ...(!isMobile && { position: 'sticky', left: 0, zIndex: 3 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid #cbd5e1',
                      }}
                    >
                      S/N
                    </TableCell>
                    <TableCell
                      sx={{
                        width: 220,
                        minWidth: 220,
                        maxWidth: 220,
                        fontWeight: 700,
                        ...(!isMobile && { position: 'sticky', left: 50, zIndex: 3 }),
                        bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        borderRight: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '2px solid rgba(255, 255, 255, 0.18)'
                            : '2px solid #cbd5e1',
                      }}
                    >
                      Learner's Name
                    </TableCell>
                    <TableCell sx={{ minWidth: 280 }}>Mark Affective Domain</TableCell>
                    <TableCell sx={{ minWidth: 280 }}>Mark Psychomotor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, rowIdx) => (
                      <TableRow key={`card-skeleton-${rowIdx}`}>
                        <TableCell sx={{ width: 50, ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }), bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important` }}>
                          <Skeleton variant="text" width={16} />
                        </TableCell>
                        <TableCell sx={{ width: 220, ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }), bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important` }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="text" width="60%" />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ minWidth: 280 }}>
                          <Stack spacing={1}>
                            {Array.from({ length: 3 }).map((__, i) => (
                              <Skeleton key={i} variant="rounded" height={26} />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ minWidth: 280 }}>
                          <Stack spacing={1}>
                            {Array.from({ length: 3 }).map((__, i) => (
                              <Skeleton key={i} variant="rounded" height={26} />
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredLearners.length === 0 ? (
                    <TableRow>
                      <TableCell sx={{ width: 50, ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }), bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important` }} />
                      <TableCell sx={{ width: 220, ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }), bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important` }} />
                      <TableCell colSpan={2} align="center" sx={{ py: 6, px: 2 }}>
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          {learners.length > 0
                            ? 'No learners match your search.'
                            : pArm && pWeek
                              ? 'No learners found for the selected filters.'
                              : 'Select class/arm and week, then click Filter.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLearners
                      .slice(pPage * pRowsPerPage, pPage * pRowsPerPage + pRowsPerPage)
                      .map((learner, sliceIdx) => {
                        const idx = pPage * pRowsPerPage + sliceIdx;
                        const studentAssess = assessments[learner.student_registration_id] || {
                          affective: {},
                          psychomotor: {},
                        };
                        return (
                          <TableRow key={learner.student_registration_id} hover sx={{ verticalAlign: 'top' }}>
                            <TableCell
                              sx={{
                                width: 50,
                                minWidth: 50,
                                maxWidth: 50,
                                ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                                bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                                borderRight: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.12)'
                                    : '1px solid #cbd5e1',
                              }}
                            >
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              sx={{
                                width: 220,
                                minWidth: 220,
                                maxWidth: 220,
                                ...(!isMobile && { position: 'sticky', left: 50, zIndex: 2 }),
                                bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                                borderRight: (theme) =>
                                  theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 255, 255, 0.18)'
                                    : '2px solid #cbd5e1',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  src={learner.avatar || undefined}
                                  sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main', flexShrink: 0 }}
                                >
                                  {(learner.name || '?').charAt(0)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                      {learner.name}
                                    </Typography>
                                    <Box
                                      title={learner.gender}
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
                                          isMaleGender(learner.gender) ? theme.palette.primary.main : theme.palette.success.main,
                                          isDark ? 0.28 : 0.14,
                                        ),
                                        color: isMaleGender(learner.gender) ? theme.palette.primary.main : theme.palette.success.main,
                                      }}
                                    >
                                      {isMaleGender(learner.gender) ? 'M' : 'F'}
                                    </Box>
                                  </Stack>
                                  {learner.admission_no && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }} noWrap>
                                      {learner.admission_no}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            {/* Affective domain */}
                            <TableCell>
                              <Stack spacing={1}>
                                {affectiveTraits.length > 0 ? (
                                  affectiveTraits.map((trait) => (
                                    <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                                      <Typography variant="caption" sx={{ width: 140, flexShrink: 0, color: 'text.secondary', fontWeight: 500 }}>
                                        {trait}
                                      </Typography>
                                      <RadioGroup
                                        row
                                        value={studentAssess.affective[trait] ?? ''}
                                        onChange={(e) =>
                                          setRating(learner.student_registration_id, 'affective', trait, Number(e.target.value))
                                        }
                                      >
                                        {[1, 2, 3, 4, 5].map((val) => (
                                          <FormControlLabel
                                            key={val}
                                            value={val}
                                            control={<Radio size="small" sx={{ p: 0.5 }} />}
                                            label={val}
                                            labelPlacement="bottom"
                                            sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                          />
                                        ))}
                                      </RadioGroup>
                                    </Stack>
                                  ))
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    No affective domains configured.
                                  </Typography>
                                )}
                              </Stack>
                            </TableCell>
                            {/* Psychomotor domain */}
                            <TableCell>
                              <Stack spacing={1}>
                                {psychomotorTraits.length > 0 ? (
                                  psychomotorTraits.map((trait) => (
                                    <Stack key={trait} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1}>
                                      <Typography variant="caption" sx={{ width: 140, flexShrink: 0, color: 'text.secondary', fontWeight: 500 }}>
                                        {trait}
                                      </Typography>
                                      <RadioGroup
                                        row
                                        value={studentAssess.psychomotor[trait] ?? ''}
                                        onChange={(e) =>
                                          setRating(learner.student_registration_id, 'psychomotor', trait, Number(e.target.value))
                                        }
                                      >
                                        {[1, 2, 3, 4, 5].map((val) => (
                                          <FormControlLabel
                                            key={val}
                                            value={val}
                                            control={<Radio size="small" sx={{ p: 0.5 }} />}
                                            label={val}
                                            labelPlacement="bottom"
                                            sx={{ mx: 0.25, '& .MuiFormControlLabel-label': { fontSize: '10px' } }}
                                          />
                                        ))}
                                      </RadioGroup>
                                    </Stack>
                                  ))
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    No psychomotor domains configured.
                                  </Typography>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
                </>
                )}
              </Table>
            </TableContainer>

            {/* ── Pagination embedded inside Paper container ──── */}
            <TablePagination
              component="div"
              count={filteredLearners.length}
              page={pPage}
              onPageChange={(_, newPage) => setPPage(newPage)}
              rowsPerPage={pRowsPerPage}
              onRowsPerPageChange={(e) => {
                setPRowsPerPage(parseInt(e.target.value, 10));
                setPPage(0);
              }}
              sx={{
                borderTop: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid #cbd5e1',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc'),
              }}
            />
          </Paper>

          {/* ── Per-row action menu ──────────────────────────── */}
          <Menu
            anchorEl={rowMenu.anchorEl}
            open={Boolean(rowMenu.anchorEl)}
            onClose={() => setRowMenu({ anchorEl: null, learner: null })}
          >
            <MenuItem
              dense
              onClick={() => {
                setRowMenu((p) => ({ anchorEl: null, learner: p.learner }));
                setLearnerDetailOpen(true);
              }}
            >
              <ListItemIcon>
                <ViewDetailsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem
              dense
              onClick={() =>
                rowMenu.learner && handleClearLearner(rowMenu.learner.student_registration_id)
              }
            >
              <ListItemIcon>
                <ClearRowIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Clear Ratings</ListItemText>
            </MenuItem>
          </Menu>

          {/* ── Learner detail dialog (row "View Details") ──────── */}
          <ReusableDialog
            open={learnerDetailOpen}
            onClose={() => setLearnerDetailOpen(false)}
            title={rowMenu.learner?.name || 'Learner Details'}
            content={
              <Box sx={{ py: 1, minWidth: { sm: 360 } }}>
                {rowMenu.learner && (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase' }}
                      >
                        Personal & Social Skills
                      </Typography>
                      {affectiveTraits.map((trait) => (
                        <Stack
                          key={trait}
                          direction="row"
                          justifyContent="space-between"
                          sx={{ py: 0.3 }}
                        >
                          <Typography variant="body2">{trait}</Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {hasValidRating(
                              assessments[rowMenu.learner.student_registration_id]?.affective?.[
                                trait
                              ],
                            )
                              ? assessments[rowMenu.learner.student_registration_id].affective[
                                  trait
                                ]
                              : '—'}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase' }}
                      >
                        Creative & Practical Skills
                      </Typography>
                      {psychomotorTraits.map((trait) => (
                        <Stack
                          key={trait}
                          direction="row"
                          justifyContent="space-between"
                          sx={{ py: 0.3 }}
                        >
                          <Typography variant="body2">{trait}</Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {hasValidRating(
                              assessments[rowMenu.learner.student_registration_id]?.psychomotor?.[
                                trait
                              ],
                            )
                              ? assessments[rowMenu.learner.student_registration_id].psychomotor[
                                  trait
                                ]
                              : '—'}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Average
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {progressStats[rowMenu.learner.student_registration_id]?.avg ?? '—'}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Box>
            }
            actions={
              <Button variant="outlined" size="small" onClick={() => setLearnerDetailOpen(false)}>
                Close
              </Button>
            }
          />
        </Grid>

        {/* ── Right sidebar: Today's Summary / AI Insights / Quick Actions ── */}
        <Grid size={{ xs: 12, lg: 2.5 }}>
          <MarkPsychomotorSidebar
            summary={todaySummary}
            insights={aiInsights}
            onViewAllInsights={() => setInsightsModalOpen(true)}
            onAutoFillFromPrevious={handleAutoFillFromPrevious}
            autoFillAvailable={Boolean(previousWeekOption) && learners.length > 0}
            onApplyScoreToSelected={handleOpenApplyScoreDialog}
            onClearSelected={handleClearSelected}
            selectedCount={selectedIds.size}
            onExportClick={(e) => setExportAnchorEl(e.currentTarget)}
            onViewHistory={() => setHistoryModalOpen(true)}
            submitting={submitting}
            canSubmit={Object.keys(assessments).length > 0}
            onSubmit={handleSubmitFinal}
            learnersCount={learners.length}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={alertSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={alertSnackbar.severity}
          onClose={() => setAlertSnackbar((p) => ({ ...p, open: false }))}
          variant="filled"
        >
          {alertSnackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Rating dialog: tap a trait's checkbox → pick 1-5 ──── */}
      <ReusableDialog
        open={ratingDialog.open}
        onClose={closeRatingDialog}
        title={`Rate "${ratingDialog.trait}"`}
        content={
          <Box sx={{ py: 1, minWidth: { sm: 360 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {ratingDialog.learnerName} — select a rating from 1 (lowest) to 5 (highest).
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              {[1, 2, 3, 4, 5].map((val) => (
                <Button
                  key={val}
                  variant={Number(ratingDialog.value) === val ? 'contained' : 'outlined'}
                  onClick={() => setRatingDialog((p) => ({ ...p, value: val }))}
                  sx={{ minWidth: 48, height: 48, borderRadius: '50%', fontWeight: 700 }}
                >
                  {val}
                </Button>
              ))}
            </Stack>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1} sx={{ width: '100%' }} justifyContent="space-between">
            <Button
              size="small"
              color="error"
              onClick={clearRatingFromDialog}
              disabled={!ratingDialog.studentId}
            >
              Clear
            </Button>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={closeRatingDialog}>
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={confirmRatingDialog}
                disabled={!ratingDialog.value}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        }
      />

      {/* ── Apply Score to Selected ─────────────────────────── */}
      <ReusableDialog
        open={applyScoreDialog.open}
        onClose={() => setApplyScoreDialog((p) => ({ ...p, open: false }))}
        title="Apply Score to Selected Learners"
        content={
          <Box sx={{ py: 1, minWidth: { sm: 360 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set the same rating for one trait across all {selectedIds.size} selected learner(s).
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Trait</InputLabel>
              <Select
                label="Trait"
                value={
                  applyScoreDialog.trait
                    ? `${applyScoreDialog.domain}:${applyScoreDialog.trait}`
                    : ''
                }
                onChange={(e) => {
                  const [domain, trait] = e.target.value.split(':');
                  setApplyScoreDialog((p) => ({ ...p, domain, trait }));
                }}
              >
                {allTraits.map(({ domain, trait }) => (
                  <MenuItem key={`${domain}:${trait}`} value={`${domain}:${trait}`}>
                    {trait} ({domain === 'affective' ? 'Affective' : 'Psychomotor'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="center">
              {[1, 2, 3, 4, 5].map((val) => (
                <Button
                  key={val}
                  variant={Number(applyScoreDialog.value) === val ? 'contained' : 'outlined'}
                  onClick={() => setApplyScoreDialog((p) => ({ ...p, value: val }))}
                  sx={{ minWidth: 48, height: 48, borderRadius: '50%', fontWeight: 700 }}
                >
                  {val}
                </Button>
              ))}
            </Stack>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setApplyScoreDialog((p) => ({ ...p, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleConfirmApplyScore}
              disabled={!applyScoreDialog.value}
            >
              Apply
            </Button>
          </Stack>
        }
      />

      {/* ── View Assessment History (term comparison — real data, no
          per-week trend endpoint exists yet to build a fuller view) ──── */}
      <ReusableDialog
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Assessment History"
        content={
          <Box sx={{ py: 1, minWidth: { sm: 360 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Affective average</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {metrics?.avgAffective ?? 0}/5{' '}
                  {metrics?.affectiveChange
                    ? `(${metrics.affectiveChange > 0 ? '+' : ''}${metrics.affectiveChange} vs last term)`
                    : ''}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Psychomotor average</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {metrics?.avgPsychomotor ?? 0}/5{' '}
                  {metrics?.psychoChange
                    ? `(${metrics.psychoChange > 0 ? '+' : ''}${metrics.psychoChange} vs last term)`
                    : ''}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
              A full week-by-week trend isn't available yet — this shows the current term's averages
              against last term's.
            </Typography>
          </Box>
        }
        actions={
          <Button variant="outlined" size="small" onClick={() => setHistoryModalOpen(false)}>
            Close
          </Button>
        }
      />

      {/* ── View Full Insights ───────────────────────────────── */}
      <ReusableDialog
        open={insightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        title="Detailed Insights"
        content={
          <Box sx={{ py: 1, minWidth: { sm: 360 } }}>
            {aiInsights.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notable changes detected this week.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {aiInsights.map((insight, i) => (
                  <Box key={i}>
                    <Typography variant="body2" fontWeight={600}>
                      {insight.text}
                    </Typography>
                    {insight.detail && (
                      <Typography variant="caption" color="text.secondary">
                        {insight.detail}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        }
        actions={
          <Button variant="outlined" size="small" onClick={() => setInsightsModalOpen(false)}>
            Close
          </Button>
        }
      />
    </Box>
  );
};

export default MarkPsychomotorTab;
