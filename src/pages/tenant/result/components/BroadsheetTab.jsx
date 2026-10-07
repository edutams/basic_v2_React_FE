import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeLinkParams } from '@/utils/scoreLinks';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Alert,
  useTheme,
  Tooltip,
  Tabs,
  Tab,
  Card,
  Button,
  Avatar,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  Stack,
  CircularProgress,
  Skeleton,
  Chip,
  Checkbox,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  IconCheck,
  IconX,
  IconMessage,
  IconEdit,
  IconArrowsHorizontal,
  IconUsers,
  IconBook,
  IconChartBar,
  IconAward,
  IconSend,
  IconLock,
  IconChevronRight,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconSearch,
  IconDownload,
  IconPrinter,
  IconChevronDown,
  IconFileText,
} from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
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
import { fetchClassStructures } from '@/api/tenant/class-structure/classStructureApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';
import { usePermissions } from '@/context/TenantContext/permissions';

// Confirmation copy for the three publish actions.
const PUBLISH_CONFIRM = {
  remarks: {
    title: 'Generate remarks for this class?',
    body: "This creates each student's class-teacher and HoS comments from your comment bank, based on their average and affective/psychomotor domain. Existing comments will be overwritten.",
    confirm: 'Generate',
    color: 'primary',
  },
  positioning: {
    title: 'Generate positioning for this class?',
    body: "This computes and saves each student's class and arm position. Safe to re-run — it only fills in whoever's missing a position.",
    confirm: 'Generate',
    color: 'primary',
  },
  spa: {
    title: 'Approve this broadsheet?',
    body: 'Acting as the School Portal Admin: totals, positions and points are frozen onto the student records. Any later score change will revoke this approval.',
    confirm: 'Approve',
    color: 'primary',
  },
  hos: {
    title: 'Publish this broadsheet?',
    body: 'Acting as the Head of School: report cards and the class dossier become visible as published. Only unpublishing can undo this.',
    confirm: 'Publish',
    color: 'success',
  },
  unpublish: {
    title: 'Unpublish this broadsheet?',
    body: 'Both the SPA approval and the Head of School publish are cleared, and the broadsheet goes back to awaiting approval.',
    confirm: 'Unpublish',
    color: 'error',
  },
};

// Display value: null / undefined / '' render as '-' (0 is a valid score).
const displayScore = (value) => (value === 0 || value ? value : '-');

// Same grade→color meaning used across the Score Sheet and Summary Sheet:
// green (best) through red (worst).
const gradeColorMap = {
  A: { bg: '#DCFCE7', color: '#16A34A' },
  B: { bg: '#DBEAFE', color: '#2563EB' },
  C: { bg: '#FEF3C7', color: '#D97706' },
  D: { bg: '#FFEDD5', color: '#EA580C' },
  E: { bg: '#FEE2E2', color: '#DC2626' },
  F: { bg: '#FECACA', color: '#991B1B' },
};
const getGradeColors = (grade) => gradeColorMap[grade?.[0]] || { bg: '#F1F5F9', color: '#64748B' };

// One distinct pastel band per subject column group, cycling if there are
// more subjects than colors — same idea as the grade palette, just for
// telling subject columns apart at a glance instead of one flat color.
const SUBJECT_BAND_COLORS = [
  { bg: '#DBEAFE', dark: '#BFDBFE' }, // blue
  { bg: '#DCFCE7', dark: '#BBF7D0' }, // green
  { bg: '#FCE7F3', dark: '#FBCFE8' }, // pink
  { bg: '#FEE2E2', dark: '#FECACA' }, // red
  { bg: '#EDE9FE', dark: '#DDD6FE' }, // purple
  { bg: '#FEF3C7', dark: '#FDE68A' }, // amber
];
const subjectBandColor = (index) => SUBJECT_BAND_COLORS[index % SUBJECT_BAND_COLORS.length];

// Stored `ca` JSON may be an array (manual entry) or a keyed object
// (combined upload) — normalize to an array of CA groups for rendering.
const normalizeCa = (ca) => {
  if (Array.isArray(ca)) return ca;
  if (ca && typeof ca === 'object') return Object.values(ca);
  return [];
};

const normalizeEntities = (entities) => {
  if (Array.isArray(entities)) return entities;
  if (entities && typeof entities === 'object') return Object.values(entities);
  return [];
};

// Grade/remark for an average against the school's configured scale.
// The backend already returns a resolved `remark` per row (term + division
// scoped) — this stays as the fallback for cached payloads.
const remarkFor = (average, gradeSettings = []) => {
  if (average === null || average === undefined || !gradeSettings.length) return '-';
  const found = gradeSettings.find((g) => average >= g.min_score && average <= g.max_score);
  return found ? found.remark : '-';
};

// Short on-screen comment; full text is shown via Tooltip.
const COMMENT_PREVIEW_LEN = 28;
const truncateComment = (text) => {
  if (!text) return '';
  return text.length > COMMENT_PREVIEW_LEN ? `${text.slice(0, COMMENT_PREVIEW_LEN)}…` : text;
};

// Comment cell: truncated preview + click/hover tooltip with the full text.
/* eslint-disable react/prop-types */
const CommentCell = ({ value }) => {
  const full = value || '';
  return (
    <TableCell
      sx={{
        minWidth: { xs: 80, sm: 96 },
        maxWidth: 140,
        fontSize: 12,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <Tooltip
        title={full || 'No comment yet — use Add/Edit'}
        placement="top"
        arrow
        enterDelay={200}
      >
        <Box
          component="span"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: full ? 'pointer' : 'default',
          }}
        >
          {truncateComment(full) || '-'}
        </Box>
      </Tooltip>
    </TableCell>
  );
};
/* eslint-enable react/prop-types */

const BroadsheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { can } = usePermissions();
  const [searchParams] = useSearchParams();
  // Prefill from a Student Dossier / Score Sheet "View Class Broadsheet"
  // link — a one-time read; consumed by each dropdown-loading effect below
  // as its preferred default instead of that effect's own "pick the first
  // one" fallback, so it never fights the user's own later selections.
  const linkParams = useMemo(() => decodeLinkParams(searchParams.get('t')), [searchParams]);

  // ── Dropdown data ───────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [sessionTermsData, setSessionTermsData] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [allArms, setAllArms] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const activeSessionTermRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    session_id: '',
    term_id: '',
    programme_id: '',
    class_id: '',
    class_arm_id: '',
    perf_range: '',
  });

  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [showData, setShowData] = useState(false);
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [commentDialog, setCommentDialog] = useState({
    open: false,
    student: null,
    mode: 'teacher',
  });
  const [commentForm, setCommentForm] = useState({ teacher_comment: '', hos_comment: '' });
  const [addEditMenu, setAddEditMenu] = useState({ rowId: null, anchorEl: null });
  const [editScoresDialog, setEditScoresDialog] = useState({ open: false, student: null });
  const [scoreForm, setScoreForm] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterError, setFilterError] = useState('');
  const [generatingComments, setGeneratingComments] = useState(false);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Load dropdowns + school info on mount ───────────────────
  useEffect(() => {
    let cancelled = false;

    const loadDropdowns = async () => {
      try {
        // NOTE: fetchClassStructures() deliberately runs OUTSIDE this
        // Promise.all — it requires the `class.structure.index` permission
        // (admins only), so for teachers it 403s and would otherwise reject
        // the whole batch and leave every filter dropdown empty.
        const [sessRes, progRes, activeRes, stRes] = await Promise.all([
          fetchSessions(),
          fetchProgrammes(),
          fetchActiveTenantSessionTerm(),
          fetchSessionTerms(),
        ]);

        if (cancelled) return;

        const sessionList = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        setSessions(sessionList);

        const stData = stRes?.data ?? [];
        setSessionTermsData(stData);

        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];
        setProgrammes(programmesData);
        if (programmesData.length > 0) {
          const preferredProgramme =
            linkParams.programme_id && programmesData.some((p) => p.id === linkParams.programme_id)
              ? linkParams.programme_id
              : programmesData[0].id;
          setFilters((prev) =>
            prev.programme_id ? prev : { ...prev, programme_id: preferredProgramme },
          );
        }

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        activeSessionTermRef.current = activeSessionTerm;

        // Preselect the active session (the term effect below picks its term),
        // unless a prefill link named a specific one.
        const defaultSession =
          (linkParams.session_id && sessionList.find((s) => s.id === linkParams.session_id)) ||
          (activeSessionTerm && sessionList.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionList[0];
        if (defaultSession) {
          setFilters((prev) => ({ ...prev, session_id: defaultSession.id }));
        }
      } catch (err) {
        console.error('Failed to load broadsheet dropdowns:', err);
        if (!cancelled) showSnackbar('Failed to load filter options', 'error');
      }
    };

    // Every arm in the school — only used by the promotion "Next Class"
    // picker, which admins see. Teachers lack `class.structure.index`, so
    // the 403 is expected and handled: the picker just stays empty for them.
    fetchClassStructures()
      .then((res) => {
        if (cancelled) return;
        const armsList = [];
        (res?.data ?? []).forEach((division) => {
          (division.programmes ?? []).forEach((prog) => {
            (prog.classes ?? []).forEach((cls) => {
              (cls.class_arms ?? []).forEach((arm) => {
                armsList.push({
                  ...arm,
                  programme_id: prog.id,
                  class_id: cls.id,
                  class_name: cls.class_name,
                });
              });
            });
          });
        });
        setAllArms(armsList);
      })
      .catch((err) => {
        // 403 for non-admin roles is normal here — don't alert the user.
        console.warn('Class structure not available for this role:', err?.response?.status ?? err);
      });

    loadDropdowns();
    getTenantInfo()
      .then((data) => {
        if (!cancelled) setSchoolInfo(data?.data || null);
      })
      .catch(() => {
        if (!cancelled) setSchoolInfo(null);
      });

    return () => {
      cancelled = true;
    };
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
        const active =
          (linkParams.term_id && data.find((t) => t.id === linkParams.term_id)) ||
          (activeTermId && data.find((t) => t.id === activeTermId)) ||
          data[0];
        if (active) setFilters((prev) => ({ ...prev, term_id: active.id }));
      })
      .catch(console.error);
  }, [filters.session_id]);

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
        if (data.length > 0 && !data.some((c) => c.id === filters.class_id)) {
          const preferredClass =
            linkParams.class_id && data.some((c) => c.id === linkParams.class_id)
              ? linkParams.class_id
              : data[0].id;
          setFilters((prev) => ({ ...prev, class_id: preferredClass, class_arm_id: '' }));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.programme_id]);

  // ── Class arms for the selected class ──────────────────────
  useEffect(() => {
    if (!filters.class_id) {
      setClassArms([]);
      return;
    }
    fetchClassArmsByClass(
      filters.class_id,
      filters.programme_id ? { programme_id: filters.programme_id } : {},
    )
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClassArms(data);
        if (data.length > 0 && !data.some((a) => a.id === filters.class_arm_id)) {
          const preferredArm =
            linkParams.class_arm_id && data.some((a) => a.id === linkParams.class_arm_id)
              ? linkParams.class_arm_id
              : data[0].id;
          setFilters((prev) => ({ ...prev, class_arm_id: preferredArm }));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.class_id, filters.programme_id]);

  const filteredClasses = classes;
  const filteredClassArms = classArms;

  const sessionTermId = (() => {
    if (!filters.session_id || !filters.term_id) return null;
    const match = sessionTermsData.find(
      (st) =>
        String(st.session?.id) === String(filters.session_id) &&
        String(st.term?.id) === String(filters.term_id),
    );
    return match?.id ?? null;
  })();

  // ── Data loading ────────────────────────────────────────────
  const loadSheet = useCallback(async (payload, mode) => {
    setLoading(true);
    setFilterError('');
    try {
      const res =
        mode === 'term'
          ? await resultSheetApi.getBroadsheet(payload)
          : await resultSheetApi.getTermCumulative(payload);
      const data = res?.data?.data;
      if (!data) throw new Error('Empty response');
      setSheet({ ...data, mode });
      setLoadedQuery({ payload, mode });
      setShowData(true);
      setPage(0);
    } catch (err) {
      console.error('Failed to fetch broadsheet:', err);
      setShowData(false);
      setSheet(null);
      setFilterError(
        err?.response?.data?.message || 'Failed to fetch broadsheet data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (loadedQuery) loadSheet(loadedQuery.payload, loadedQuery.mode);
  }, [loadedQuery, loadSheet]);

  // ── Publishing ──────────────────────────────────────────────
  const [publishing, setPublishing] = useState(null);
  const [publishConfirm, setPublishConfirm] = useState({ open: false, action: null });

  const closePublishConfirm = () => setPublishConfirm({ open: false, action: null });

  // Routes the single publish-confirm dialog to the right handler — the
  // remarks/positioning stages reuse this same confirm flow instead of
  // firing immediately, matching the other two (destructive/irreversible)
  // workflow actions.
  const handleWorkflowConfirm = async (action) => {
    if (action === 'remarks') {
      await handleGenerateComments();
      closePublishConfirm();
      return;
    }
    if (action === 'positioning') {
      await handleGeneratePositioning();
      closePublishConfirm();
      return;
    }
    handlePublishAction(action);
  };

  const handlePublishAction = async (action) => {
    const payload = {
      class_arm_id: Number(filters.class_arm_id),
      session_term_id: Number(sessionTermId),
    };

    setPublishing(action);
    try {
      const res =
        action === 'spa'
          ? await resultSheetApi.publishSpa(payload)
          : action === 'hos'
            ? await resultSheetApi.publishHos(payload)
            : await resultSheetApi.unpublish(payload);

      showSnackbar(res?.data?.message || 'Broadsheet publish status updated');
      refetch();
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || 'Failed to update broadsheet publish status',
        'error',
      );
    } finally {
      setPublishing(null);
      closePublishConfirm();
    }
  };

  // Auto-fetch once every required filter has resolved — they're all
  // preselected now (active session/term, first programme/class/arm), so
  // the sheet loads immediately instead of waiting for a manual Fetch
  // click. Silent (no error banner) when something's still missing, since
  // that's just the cascade not having settled yet, not a user mistake.
  useEffect(() => {
    if (activeTab === 0) {
      if (
        filters.session_id &&
        filters.term_id &&
        filters.programme_id &&
        filters.class_id &&
        filters.class_arm_id &&
        sessionTermId
      ) {
        loadSheet({ class_arm_id: filters.class_arm_id, session_term_id: sessionTermId }, 'term');
      }
    } else if (
      filters.session_id &&
      filters.programme_id &&
      filters.class_id &&
      filters.class_arm_id
    ) {
      loadSheet(
        { class_arm_id: filters.class_arm_id, session_id: filters.session_id },
        'cumulative',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    filters.session_id,
    filters.term_id,
    filters.programme_id,
    filters.class_id,
    filters.class_arm_id,
    sessionTermId,
  ]);

  const handleFilter = () => {
    if (activeTab === 0) {
      if (
        !filters.session_id ||
        !filters.term_id ||
        !filters.programme_id ||
        !filters.class_id ||
        !filters.class_arm_id
      ) {
        setFilterError('Select Session, Term, Programme, Class and Class Arm, then click Fetch.');
        return;
      }
      if (!sessionTermId) {
        setFilterError('No session-term found for the selected session and term.');
        return;
      }
      loadSheet({ class_arm_id: filters.class_arm_id, session_term_id: sessionTermId }, 'term');
    } else {
      if (
        !filters.session_id ||
        !filters.programme_id ||
        !filters.class_id ||
        !filters.class_arm_id
      ) {
        setFilterError('Select Session, Programme, Class and Class Arm, then click Fetch.');
        return;
      }
      loadSheet(
        { class_arm_id: filters.class_arm_id, session_id: filters.session_id },
        'cumulative',
      );
    }
  };

  // ── Table toolbar: client-side filters over the already-fetched roster
  // (classroom-sized lists — no round trip needed for instant filtering) ──
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);

  // ── Derived rows ────────────────────────────────────────────
  const visibleStudents = (() => {
    if (!sheet?.students) return [];
    let rows = sheet.students;
    if (filters.perf_range) {
      const count = parseInt(filters.perf_range, 10);
      rows = rows.filter((s) => {
        const pos = activeTab === 0 ? s.position : s.all_term_overall_class_position;
        return pos !== null && pos !== undefined && pos <= count;
      });
    }
    if (tableSearch.trim()) {
      const q = tableSearch.trim().toLowerCase();
      rows = rows.filter((s) => {
        const name =
          `${s.user?.lname ?? ''} ${s.user?.fname ?? ''} ${s.user?.mname ?? ''}`.toLowerCase();
        const admNo = String(s.user?.user_id ?? '').toLowerCase();
        return name.includes(q) || admNo.includes(q);
      });
    }
    if (statusFilter === 'incomplete') {
      rows = rows.filter((s) => s.subjects_scored < s.total_subjects);
    } else if (statusFilter === 'remarks_pending') {
      rows = rows.filter((s) => !s.class_teachers_comment);
    } else if (statusFilter === 'position_missing') {
      rows = rows.filter((s) => s.persisted_class_position === null);
    }
    if (atRiskOnly) {
      const passMark = sheet?.stats?.pass_mark;
      rows = rows.filter(
        (s) => passMark != null && s.student_average != null && s.student_average < passMark,
      );
    }
    return rows;
  })();

  const showPromotionButtons = activeTab === 0 && showData && Boolean(sheet?.is_third_term);
  const stats = sheet?.stats ?? {};
  const gradeSettings = sheet?.grade_settings ?? [];
  const markConfig = sheet?.mark_config;
  const caMax = markConfig?.ca_max_score ?? 20;
  const examMax = markConfig?.exam_max_score ?? 60;
  const totalMax = caMax + examMax;
  const subjects = sheet?.subjects ?? [];

  // When a single subject is picked in the toolbar, narrow the table to just
  // that subject's CA/Exam/Grade columns instead of every subject at once —
  // genuinely useful for "how did the class do in Mathematics" at a glance,
  // not just a cosmetic filter.
  const visibleSubjects = subjectFilter
    ? subjects.filter((s) => String(s.subject_id) === String(subjectFilter))
    : subjects;

  const summaryColSpan = activeTab === 1 ? 11 : showPromotionButtons ? 10 : 7;

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  // ── Comments ────────────────────────────────────────────────
  const handleOpenComment = (student, mode = 'teacher') => {
    setCommentForm({
      teacher_comment: student.class_teachers_comment || '',
      hos_comment: student.hos_comment || '',
    });
    setCommentDialog({ open: true, student, mode });
  };

  const closeCommentDialog = () =>
    setCommentDialog({ open: false, student: null, mode: 'teacher' });

  // One-click comment generation for the whole class arm: the backend
  // picks a template from the current user's OWN comment bank (student
  // average → score-range grade, domain average → band, gender-aware) and
  // writes it to student_registrations. Which field it fills (class
  // teacher's vs school admin's) is resolved server-side from the caller's
  // role, never from here — a class teacher and a school admin each keep a
  // separate, private comment bank. Existing manual comments are
  // overwritten — the button lives next to the comment column it fills.
  const handleGenerateComments = async () => {
    if (!sheet?.class_arm?.id || !sheet?.session_term?.id) return;
    setGeneratingComments(true);
    try {
      const res = await resultSheetApi.generateComments({
        class_arm_id: sheet.class_arm.id,
        session_term_id: sheet.session_term.id,
      });
      if (res.data?.status) {
        // Refetch so the new comments show in the grid immediately.
        refetch();
        showSnackbar(res.data?.message || 'Comments generated successfully');
      } else {
        showSnackbar(res.data?.message || 'Failed to generate comments', 'error');
      }
    } catch (err) {
      console.error('Failed to generate comments:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to generate comments', 'error');
    } finally {
      setGeneratingComments(false);
    }
  };

  const [generatingPositioning, setGeneratingPositioning] = useState(false);
  const [checksModalOpen, setChecksModalOpen] = useState(false);

  const handleGeneratePositioning = async () => {
    if (!sheet?.class_arm?.id || !sheet?.session_term?.id) return;
    setGeneratingPositioning(true);
    try {
      const res = await resultSheetApi.generatePositioning({
        class_arm_id: sheet.class_arm.id,
        session_term_id: sheet.session_term.id,
      });
      if (res.data?.status) {
        refetch();
        showSnackbar(res.data?.message || 'Positioning generated successfully');
      } else {
        showSnackbar(res.data?.message || 'Failed to generate positioning', 'error');
      }
    } catch (err) {
      console.error('Failed to generate positioning:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to generate positioning', 'error');
    } finally {
      setGeneratingPositioning(false);
    }
  };

  const handleSaveComment = async () => {
    const { student, mode } = commentDialog;
    if (!student) return;
    const comment = mode === 'hos' ? commentForm.hos_comment : commentForm.teacher_comment;
    try {
      await resultSheetApi.saveComment({
        student_registration_id: student.student_registration_id,
        type: mode === 'hos' ? 'hos' : 'teacher',
        comment,
      });
      setSheet(
        (prev) =>
          prev && {
            ...prev,
            students: prev.students.map((row) => {
              if (row.student_registration_id !== student.student_registration_id) return row;
              return mode === 'hos'
                ? { ...row, hos_comment: comment }
                : { ...row, class_teachers_comment: comment };
            }),
          },
      );
      showSnackbar('Comment saved successfully');
      closeCommentDialog();
    } catch (err) {
      console.error('Failed to save comment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to save comment', 'error');
    }
  };

  // ── Score editing ───────────────────────────────────────────
  const isScoreInvalid = (value, max) => {
    if (value === '' || value === null || value === undefined) return true;
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return true;
    if (max !== null && max !== undefined && n > max) return true;
    return false;
  };

  const handleAddEditClick = (e, row) => {
    setAddEditMenu({ rowId: row.student_registration_id, anchorEl: e.currentTarget });
  };

  const closeAddEditMenu = () => setAddEditMenu({ rowId: null, anchorEl: null });

  const handleOpenEditScores = (row) => {
    const form = (row.results || [])
      .filter((r) => r.course_registration_id)
      .map((r) => {
        let groups = normalizeCa(r.ca).map((g) => ({
          display_name: g.display_name || g.name || 'CA',
          entities: normalizeEntities(g.entities).map((e) => ({
            display_name: e.display_name || e.name || 'Test',
            max_score: e.max_score ?? g.max_score ?? null,
            score: String(e.score ?? 0),
          })),
        }));

        // No stored CA JSON yet — synthesize the groups from the mark config.
        if (groups.length === 0 && markConfig?.ca_content?.length) {
          groups = markConfig.ca_content.map((g) => ({
            display_name: g.display_name || 'CA',
            entities: normalizeEntities(g.entities).map((e) => ({
              display_name: e.display_name || 'Test',
              max_score: e.max_score ?? null,
              score: '0',
            })),
          }));
        }

        return {
          subject_id: r.subject_id,
          subject_name: r.subject_name,
          course_registration_id: r.course_registration_id,
          ca_breakdown: groups,
          exam_score: String(r.exam_score ?? ''),
        };
      });

    setScoreForm(form);
    setEditScoresDialog({ open: true, student: row });
  };

  const handleCloseEditScores = () => {
    setEditScoresDialog({ open: false, student: null });
    setScoreForm([]);
  };

  const handleScoreChange = (subjectIdx, groupIdx, entityIdx, value) => {
    setScoreForm((prev) =>
      prev.map((subj, i) => {
        if (i !== subjectIdx) return subj;
        return {
          ...subj,
          ca_breakdown: subj.ca_breakdown.map((g, gi) =>
            gi !== groupIdx
              ? g
              : {
                  ...g,
                  entities: g.entities.map((e, ei) =>
                    ei !== entityIdx ? e : { ...e, score: value },
                  ),
                },
          ),
        };
      }),
    );
  };

  const handleExamChange = (subjectIdx, value) => {
    setScoreForm((prev) =>
      prev.map((subj, i) => (i !== subjectIdx ? subj : { ...subj, exam_score: value })),
    );
  };

  const handleSaveScoreRow = async (subjectIdx) => {
    const subj = scoreForm[subjectIdx];
    const student = editScoresDialog.student;
    if (!subj || !student) return;

    const invalidEntity = subj.ca_breakdown.some((g) =>
      g.entities.some((e) => isScoreInvalid(e.score, e.max_score)),
    );
    const invalidExam = subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax);
    if (invalidEntity || invalidExam) {
      showSnackbar('Fix invalid scores before saving', 'error');
      return;
    }

    const caTotal = subj.ca_breakdown.reduce(
      (sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0),
      0,
    );
    const examScore = Number(subj.exam_score) || 0;

    try {
      await scoreManagerApi.editResult({
        user_id: student.user_id,
        course_registration_id: subj.course_registration_id,
        ca_total: caTotal,
        exam_score: examScore,
        session_term_id: loadedQuery?.payload?.session_term_id,
      });
      showSnackbar(`${subj.subject_name} score updated`);
      handleCloseEditScores();
      // Refetch so grades, averages and positions are recomputed server-side.
      refetch();
    } catch (err) {
      console.error('Failed to save score:', err);
      showSnackbar(
        err?.response?.data?.message || err?.response?.data?.error || 'Failed to save score',
        'error',
      );
    }
  };

  // ── Promotion ───────────────────────────────────────────────
  const [recMenu, setRecMenu] = useState({ rowId: null, anchorEl: null });

  const handleRecommendPromotions = async () => {
    setLoading(true);
    try {
      const res = await resultSheetApi.recommendPromotions({
        class_arm_id: filters.class_arm_id,
        session_id: filters.session_id,
      });
      showSnackbar(res?.data?.message || 'Recommendations computed');
      await refetch();
    } catch (err) {
      console.error('Failed to recommend promotions:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to compute recommendations', 'error');
      setLoading(false);
    }
  };

  const handlePostRecommendations = async () => {
    setLoading(true);
    try {
      const res = await resultSheetApi.postRecommendations({
        class_arm_id: filters.class_arm_id,
        session_id: filters.session_id,
      });
      showSnackbar(res?.data?.message || 'Recommendations posted');
      await refetch();
    } catch (err) {
      console.error('Failed to post recommendations:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to post recommendations', 'error');
      setLoading(false);
    }
  };

  const handleSetRecommendation = async (row, recommendation) => {
    setRecMenu({ rowId: null, anchorEl: null });
    try {
      await resultSheetApi.savePromotion({
        student_registration_id: row.student_registration_id,
        promotion_recommendation: recommendation,
      });
      setSheet(
        (prev) =>
          prev && {
            ...prev,
            students: prev.students.map((r) =>
              r.student_registration_id === row.student_registration_id
                ? { ...r, promotion_recommendation: recommendation }
                : r,
            ),
          },
      );
      showSnackbar('Recommendation updated');
    } catch (err) {
      console.error('Failed to save recommendation:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to update recommendation', 'error');
    }
  };

  const handleSetNextClass = async (row, nextClassArmId) => {
    if (!nextClassArmId) return;
    try {
      await resultSheetApi.savePromotion({
        student_registration_id: row.student_registration_id,
        next_class_arm_id: nextClassArmId,
      });
      setSheet(
        (prev) =>
          prev && {
            ...prev,
            students: prev.students.map((r) =>
              r.student_registration_id === row.student_registration_id
                ? { ...r, next_class_arm_id: nextClassArmId }
                : r,
            ),
          },
      );
      showSnackbar('Next class updated');
    } catch (err) {
      console.error('Failed to save next class:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to update next class', 'error');
    }
  };

  // ── CSV export (opens in Excel) ──────────────────────────────
  const handleExport = () => {
    if (!sheet || visibleStudents.length === 0) {
      showSnackbar('No broadsheet data to export', 'warning');
      return;
    }

    const isCumulative = sheet.mode === 'cumulative';
    const header = [
      'S/N',
      'Student ID',
      'Name',
      'Sex',
      ...subjects.flatMap((s) => [
        `${s.subject_name} CA (${caMax})`,
        `${s.subject_name} EXAM (${examMax})`,
        `${s.subject_name} TOTAL (${totalMax})`,
        `${s.subject_name} GRADE`,
      ]),
      ...(isCumulative ? ['1ST TERM', '2ND TERM', '3RD TERM', 'CUM AVG'] : []),
      'CWA',
      'POSITION',
      'NO. SUBJ',
      'REMARK',
      ...(showPromotionButtons ? ['RECOMMENDATION', 'NEXT CLASS'] : []),
      'CLASS TEACHER COMMENT',
      'HEAD OF SCHOOL COMMENT',
    ];

    const rows = visibleStudents.map((row, index) => {
      const resultMap = {};
      (row.results || []).forEach((r) => {
        resultMap[r.subject_id] = r;
      });
      const cwa = isCumulative ? row.all_term_average : row.student_average;
      const armName = allArms.find((a) => a.id === row.next_class_arm_id)?.class_arm_names || '';

      return [
        index + 1,
        row.user?.user_id ?? '',
        `${row.user?.lname ?? ''} ${row.user?.fname ?? ''} ${row.user?.mname ?? ''}`.trim(),
        row.user?.sex === 'female' ? 'F' : 'M',
        ...subjects.flatMap((s) => {
          const result = resultMap[s.subject_id];
          return [
            result?.ca_total ?? '',
            result?.exam_score ?? '',
            result?.overall_total ?? '',
            result?.grade ?? '',
          ];
        }),
        ...(isCumulative
          ? [
              row.first_term_average ?? '',
              row.second_term_average ?? '',
              row.third_term_average ?? '',
              row.all_term_average ?? '',
            ]
          : []),
        cwa ?? '',
        isCumulative ? (row.all_term_overall_class_position ?? '') : (row.position ?? ''),
        row.total_subjects ?? '',
        row.remark ?? remarkFor(cwa, gradeSettings),
        ...(showPromotionButtons ? [row.promotion_recommendation || '', armName] : []),
        row.class_teachers_comment || '',
        row.hos_comment || '',
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      `broadsheet-${isCumulative ? 'cumulative' : 'termly'}-${sheet.class_arm?.class_name ?? 'class'}-${sheet.class_arm?.arm_name ?? ''}.csv`.replace(
        /\s+/g,
        '-',
      );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('Broadsheet exported');
  };

  const promotionIcon = (recommendation) => {
    if (recommendation === 'promoted')
      return <IconCheck size={18} color="#16A34A" style={{ cursor: 'pointer' }} />;
    if (recommendation === 'promoted on trial')
      return <IconCheck size={18} color="#D97706" style={{ cursor: 'pointer' }} />;
    if (recommendation === 'graduated')
      return <IconCheck size={18} color="#2563EB" style={{ cursor: 'pointer' }} />;
    return <IconX size={18} color="#DC2626" style={{ cursor: 'pointer' }} />;
  };

  const avatarInitials = (user) => `${user?.lname?.[0] ?? ''}${user?.fname?.[0] ?? ''}`;

  return (
    <Box>
      {activeTab === 1 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <StatCard
            count={stats.total_students ?? 0}
            label="Total Students"
            subtitle="In this class"
            icon={IconUsers}
            colorIndex={0}
            loading={loading}
          />
          <StatCard
            count={stats.total_subjects ?? subjects.length}
            label="Total Subjects"
            subtitle="Across all departments"
            icon={IconBook}
            colorIndex={1}
            loading={loading}
          />
          <StatCard
            count={`${stats.class_average ?? 0}%`}
            label="Average Score"
            subtitle="Class average"
            icon={IconChartBar}
            colorIndex={2}
            loading={loading}
          />
          <StatCard
            count={
              stats.pass_rate !== null && stats.pass_rate !== undefined
                ? `${stats.pass_rate}%`
                : '—'
            }
            label="Pass Rate"
            subtitle={stats.pass_mark ? `Students at/above ${stats.pass_mark}%` : 'Pass mark not set'}
            icon={IconAward}
            colorIndex={3}
            loading={loading}
          />
        </Stack>
      )}

      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, borderRadius: 1 }}>
        {/* ── Nested Tabs + broadsheet header (right-aligned, same row) ── */}
        <Box
          sx={{
            px: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              setShowData(false);
              setFilterError('');
            }}
            sx={{ borderBottom: 0, minHeight: 0 }}
          >
            <Tab label="Termly" sx={{ py: 1.25 }} />
            <Tab label="Term Cummulative" sx={{ py: 1.25 }} />
          </Tabs>

          {activeTab === 0 && showData && (sheet || loading) && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              {loading ? (
                <>
                  <Skeleton variant="text" width={200} height={22} sx={{ ml: { sm: 'auto' } }} />
                  <Skeleton variant="text" width={160} height={16} sx={{ ml: { sm: 'auto' } }} />
                </>
              ) : (
                <>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    Broadsheet Results for {sheet.class_arm?.class_name} ·{' '}
                    {sheet.class_arm?.arm_name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                    flexWrap="wrap"
                  >
                    <Chip
                      label={
                        sheet.result_publish?.head_of_school_publish === 'yes'
                          ? 'Published'
                          : 'Not published'
                      }
                      size="small"
                      color={
                        sheet.result_publish?.head_of_school_publish === 'yes'
                          ? 'success'
                          : 'warning'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                    />
                    {sheet.result_publish?.last_updated_at && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}
                      >
                        <IconClock size={12} />
                        Last updated:{' '}
                        {new Date(sheet.result_publish.last_updated_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {sheet.result_publish.last_updated_by
                          ? ` by ${sheet.result_publish.last_updated_by}`
                          : ''}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* ── Shared Filters ─────────────────────────────────── */}
        <Box sx={{ px: 2, pt: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session</InputLabel>
                <Select
                  value={filters.session_id}
                  label="Session"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      session_id: e.target.value,
                      term_id: activeTab === 0 ? '' : filters.term_id,
                    })
                  }
                >
                  <MenuItem value="">-- choose --</MenuItem>
                  {sessions.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {activeTab === 0 && (
              <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Term</InputLabel>
                  <Select
                    value={filters.term_id}
                    label="Term"
                    onChange={(e) => setFilters({ ...filters, term_id: e.target.value })}
                  >
                    <MenuItem value="">-- choose --</MenuItem>
                    {terms.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.term_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={filters.programme_id}
                  label="Programme"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      programme_id: e.target.value,
                      class_id: '',
                      class_arm_id: '',
                    })
                  }
                >
                  <MenuItem value="">--Select Programme--</MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name || p.programme_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={filters.class_id}
                  label="Class"
                  onChange={(e) =>
                    setFilters({ ...filters, class_id: e.target.value, class_arm_id: '' })
                  }
                >
                  <MenuItem value="">-- Select Class --</MenuItem>
                  {filteredClasses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class Arm</InputLabel>
                <Select
                  value={filters.class_arm_id}
                  label="Class Arm"
                  onChange={(e) => setFilters({ ...filters, class_arm_id: e.target.value })}
                >
                  <MenuItem value="">-- Select Arm --</MenuItem>
                  {filteredClassArms.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.class_arm_names}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {showData && (
              <Box sx={{ flex: '1 1 0', minWidth: 150 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Performance</InputLabel>
                  <Select
                    value={filters.perf_range}
                    label="Performance"
                    onChange={(e) => {
                      setFilters({ ...filters, perf_range: e.target.value });
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">-- Select Range --</MenuItem>
                    <MenuItem value="3">Best 3</MenuItem>
                    <MenuItem value="5">Best 5</MenuItem>
                    <MenuItem value="10">Best 10</MenuItem>
                    <MenuItem value="15">Best 15</MenuItem>
                    <MenuItem value="20">Best 20</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            {/* Fetch / Export — narrow and pushed right once every filter (incl. Performance) is on screen */}
            <Box
              sx={{
                flex: showData ? '0 0 auto' : '0 0 auto',
                minWidth: 0,
                ml: showData ? 'auto' : 0,
                display: 'flex',
                gap: 1,
                flexWrap: 'nowrap',
              }}
            >
              <Button
                variant="contained"
                onClick={handleFilter}
                disabled={loading}
                sx={{ minWidth: 0, width: showData ? 'auto' : 96, px: 1.5, whiteSpace: 'nowrap' }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : 'Fetch'}
              </Button>
              {showData && (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleExport}
                  disabled={loading}
                  sx={{ minWidth: 0, width: 'auto', px: 1.5, whiteSpace: 'nowrap' }}
                >
                  Export CSV
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Results Workflow (real) ──────────────────────────
              4 sequential stages an SPA works through for a termly
              broadsheet. Each stage's completion and stats are derived from
              sheet.workflow (computed server-side in broadsheetData()) and
              sheet.result_publish — nothing here is a placeholder. ── */}
          {activeTab === 0 &&
            showData &&
            (sheet || loading) &&
            (() => {
              // While (re)fetching, shape-match this whole section instead of
              // either freezing on stale numbers or showing nothing — same
              // convention as the table body's skeleton rows below.
              if (loading) {
                return (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                      Results Workflow
                    </Typography>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.5}
                      sx={{ alignItems: 'stretch' }}
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Skeleton variant="circular" width={26} height={26} />
                          <Skeleton variant="text" width="70%" height={22} />
                          <Skeleton variant="text" width="90%" height={16} />
                          <Skeleton
                            variant="rounded"
                            height={32}
                            sx={{ mt: 'auto', borderRadius: '8px' }}
                          />
                        </Box>
                      ))}
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      sx={{ mt: 1.5, alignItems: 'stretch' }}
                    >
                      {[IconUsers, IconChartBar, IconBook, IconAlertTriangle].map((Icon, i) => (
                        <StatCard key={i} icon={Icon} label="" loading />
                      ))}
                    </Stack>
                  </Box>
                );
              }

              const workflow = sheet.workflow || {};
              const checks = workflow.checks || {
                missing_scores: 0,
                remarks_pending: 0,
                positions_missing: 0,
              };
              const checksTotal = workflow.checks_total ?? 0;
              const remarksDone = (checks.remarks_pending ?? 0) === 0;
              const positioningDone = (checks.positions_missing ?? 0) === 0;
              const spaDone = sheet.result_publish?.spa_publish === 'yes';
              const hosDone = sheet.result_publish?.head_of_school_publish === 'yes';

              // ── Colour scheme per stage state, matching the approved design
              // exactly: green = done, blue = active/in-progress, gray = locked.
              const stageScheme = (status) => {
                if (status === 'done') {
                  return {
                    cardBg: isDark ? 'rgba(22,163,74,0.2)' : '#DCFCE7',
                    cardBorder: isDark ? 'rgba(22,163,74,0.45)' : '#86EFAC',
                    circleBg: '#16A34A',
                    circleColor: '#fff',
                    textColor: '#15803D',
                    buttonBg: '#16A34A',
                    buttonHoverBg: '#15803D',
                    buttonColor: '#fff',
                  };
                }
                if (status === 'active') {
                  return {
                    cardBg: isDark ? 'rgba(37,99,235,0.22)' : '#DBEAFE',
                    cardBorder: isDark ? 'rgba(37,99,235,0.5)' : '#93C5FD',
                    circleBg: '#2563EB',
                    circleColor: '#fff',
                    textColor: '#1D4ED8',
                    buttonBg: '#2563EB',
                    buttonHoverBg: '#1D4ED8',
                    buttonColor: '#fff',
                  };
                }
                return {
                  cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  cardBorder: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
                  circleBg: isDark ? 'rgba(255,255,255,0.14)' : '#E2E8F0',
                  circleColor: isDark ? '#fff' : '#64748B',
                  textColor: '#64748B',
                  buttonBg: '#94A3B8',
                  buttonHoverBg: '#64748B',
                  buttonColor: '#fff',
                };
              };

              const stageStatusLabel = { done: 'Complete', active: 'In progress', locked: 'Locked' };

              const stages = [
                {
                  step: 1,
                  status: remarksDone ? 'done' : 'active',
                  title: 'Remarks',
                  subtitle: `${workflow.remarks?.complete ?? 0}/${workflow.remarks?.total ?? 0} students have remarks`,
                  buttonIcon: IconFileText,
                  action: 'Generate remarks',
                  onAction: () => setPublishConfirm({ open: true, action: 'remarks' }),
                  loading: generatingComments,
                },
                {
                  step: 2,
                  status: !remarksDone ? 'locked' : positioningDone ? 'done' : 'active',
                  title: 'Positioning',
                  subtitle: !remarksDone
                    ? 'Complete remarks first'
                    : `${workflow.positioning?.complete ?? 0} positioned · ${
                        (workflow.positioning?.total ?? 0) - (workflow.positioning?.complete ?? 0)
                      } missing`,
                  buttonIcon: IconUsers,
                  action: 'Generate positioning',
                  onAction: () => setPublishConfirm({ open: true, action: 'positioning' }),
                  loading: generatingPositioning,
                },
                {
                  step: 3,
                  status:
                    !positioningDone || checksTotal > 0 ? 'locked' : spaDone ? 'done' : 'active',
                  title: 'Approval',
                  subtitle: !positioningDone
                    ? 'Complete positioning first'
                    : checksTotal > 0
                      ? 'Resolve all checks to enable'
                      : spaDone
                        ? 'Approved'
                        : 'Ready for approval',
                  buttonIcon: IconLock,
                  action: 'Approve results',
                  onAction: () => setPublishConfirm({ open: true, action: 'spa' }),
                  loading: publishing === 'spa',
                },
                {
                  step: 4,
                  status: !spaDone ? 'locked' : hosDone ? 'done' : 'active',
                  title: 'Publish',
                  subtitle: !spaDone
                    ? 'Requires approval first'
                    : hosDone
                      ? 'Published'
                      : 'Ready to publish',
                  buttonIcon: IconSend,
                  action: 'Publish results',
                  onAction: () => setPublishConfirm({ open: true, action: 'hos' }),
                  loading: publishing === 'hos',
                  secondaryAction: spaDone || hosDone ? 'Reverse publication' : null,
                  onSecondaryAction: () => setPublishConfirm({ open: true, action: 'unpublish' }),
                },
              ];

              const totalStudents = stats.total_students ?? sheet.students?.length ?? 0;
              const subjectsComplete = workflow.subjects_complete ?? 0;
              const statCards = [
                {
                  icon: IconUsers,
                  colorIndex: 0,
                  count: totalStudents,
                  label: 'Students',
                  subtitle:
                    `${sheet.class_arm?.class_name ?? ''} ${sheet.class_arm?.arm_name ?? ''}`.trim() ||
                    'This class',
                },
                {
                  icon: IconChartBar,
                  colorIndex: 1,
                  count: `${stats.class_average ?? 0}%`,
                  label: 'Class Average',
                  subtitle: 'This term',
                },
                {
                  icon: IconBook,
                  colorIndex: 1,
                  count: subjectsComplete,
                  label: 'Subjects Complete',
                  subtitle:
                    subjectsComplete >= subjects.length
                      ? 'All subjects have scores'
                      : `${subjects.length - subjectsComplete} subject(s) missing scores`,
                },
                {
                  icon: checksTotal > 0 ? IconAlertTriangle : IconCircleCheck,
                  colorIndex: checksTotal > 0 ? 3 : 1,
                  count: checksTotal,
                  label: 'Checks to Resolve',
                  subtitle: checksTotal > 0 ? 'Review before approval' : 'All clear',
                  onClick: checksTotal > 0 ? () => setChecksModalOpen(true) : undefined,
                  tooltip: checksTotal > 0 ? 'Click to review what needs fixing' : undefined,
                },
              ];

              return (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Results Workflow
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    sx={{ alignItems: 'stretch' }}
                  >
                    {stages.map((stage, idx, arr) => {
                      const isLocked = stage.status === 'locked';
                      const isDone = stage.status === 'done';
                      const scheme = stageScheme(stage.status);
                      // Generate Remarks (step 1) is SPA/super_admin-only — it
                      // pulls both the class teacher's AND the SPA's comment
                      // bank in one go, so a class teacher viewing the
                      // broadsheet can watch progress but not trigger it.
                      // Positioning (step 2) stays open to anyone who can view
                      // the broadsheet, same as before.
                      const canAct = can('result.admin.spa_approve_broadsheet') || stage.step === 2;
                      const ButtonIcon = stage.buttonIcon;
                      return (
                        <Box
                          key={stage.step}
                          sx={{ display: 'flex', flex: 1, alignItems: 'stretch' }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: scheme.cardBg,
                              border: '1.5px solid',
                              borderColor: scheme.cardBorder,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  bgcolor: scheme.circleBg,
                                  color: scheme.circleColor,
                                  flexShrink: 0,
                                }}
                              >
                                {isDone ? <IconCheck size={15} /> : stage.step}
                              </Box>
                              {isLocked && (
                                <IconLock size={16} color={theme.palette.text.secondary} />
                              )}
                            </Box>

                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {stage.title}
                              <Typography
                                component="span"
                                sx={{ color: 'text.secondary', fontWeight: 700 }}
                              >
                                {' '}
                                ·{' '}
                              </Typography>
                              <Typography
                                component="span"
                                sx={{ color: scheme.textColor, fontWeight: 700 }}
                              >
                                {stageStatusLabel[stage.status]}
                              </Typography>
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1.4 }}
                            >
                              {stage.subtitle}
                            </Typography>

                            <Box sx={{ mt: 'auto', pt: 0.5 }}>
                              <Button
                                fullWidth
                                size="small"
                                disabled={isLocked || stage.loading || !canAct}
                                onClick={stage.onAction}
                                startIcon={
                                  stage.loading ? null : ButtonIcon ? <ButtonIcon size={15} /> : null
                                }
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  bgcolor: scheme.buttonBg,
                                  color: scheme.buttonColor,
                                  '&:hover': { bgcolor: scheme.buttonHoverBg },
                                  '&.Mui-disabled': {
                                    bgcolor: scheme.buttonBg,
                                    color: scheme.buttonColor,
                                    opacity: 0.85,
                                  },
                                }}
                              >
                                {stage.loading ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : (
                                  stage.action
                                )}
                              </Button>
                              {stage.secondaryAction && (
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="text"
                                  color="warning"
                                  disabled={
                                    publishing === 'unpublish' ||
                                    !can('result.admin.unpublish_broadsheet')
                                  }
                                  onClick={stage.onSecondaryAction}
                                  sx={{ fontSize: '0.7rem', mt: 0.5, textTransform: 'none' }}
                                >
                                  {stage.secondaryAction}
                                </Button>
                              )}
                            </Box>
                          </Box>
                          {idx < arr.length - 1 && (
                            <Box
                              sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                flexShrink: 0,
                              }}
                            >
                              <IconChevronRight size={18} color={theme.palette.text.secondary} />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ mt: 1.5, alignItems: 'stretch' }}
                  >
                    {statCards.map((card) => (
                      <StatCard
                        key={card.label}
                        count={card.count}
                        label={card.label}
                        subtitle={card.subtitle}
                        icon={card.icon}
                        colorIndex={card.colorIndex}
                        onClick={card.onClick}
                        tooltip={card.tooltip}
                      />
                    ))}
                  </Stack>

                  {checksTotal > 0 && (
                    <Alert
                      severity="warning"
                      icon={<IconAlertTriangle size={20} color="#D97706" />}
                      sx={{
                        mt: 1.5,
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(217,119,6,0.16)' : '#FEF3C7',
                        color: '#92400E',
                        alignItems: 'center',
                        '& .MuiAlert-icon': { color: '#D97706' },
                      }}
                      action={
                        <Button
                          size="small"
                          variant="contained"
                          disableElevation
                          onClick={() => setChecksModalOpen(true)}
                          endIcon={<IconChevronRight size={14} />}
                          sx={{
                            bgcolor: '#D97706',
                            color: '#fff',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#B45309' },
                          }}
                        >
                          Review checks
                        </Button>
                      }
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#D97706' }}>
                        {checks.missing_scores} missing scores | {checks.remarks_pending} remarks
                        pending | {checks.positions_missing} positions missing
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#92400E' }}>
                        Please review and complete the highlighted items before approval.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              );
            })()}

          {showData && showPromotionButtons && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleRecommendPromotions}
                disabled={loading}
              >
                Recommend Promotion
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={handlePostRecommendations}
                disabled={loading}
              >
                Post Recommendation
              </Button>
            </Box>
          )}

          {/* ── Broadsheet Table ───────────────────────────────── */}
          {showData && sheet && (
            <>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <TextField
                    size="small"
                    placeholder="Search student name or admission no."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 240 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={16} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 } }}>
                    <InputLabel id="broadsheet-status-filter-label">Status</InputLabel>
                    <Select
                      labelId="broadsheet-status-filter-label"
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">All students</MenuItem>
                      <MenuItem value="incomplete">Missing scores</MenuItem>
                      <MenuItem value="remarks_pending">Remarks pending</MenuItem>
                      <MenuItem value="position_missing">Positions missing</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 } }}>
                    <InputLabel id="broadsheet-subject-filter-label">Subject</InputLabel>
                    <Select
                      labelId="broadsheet-subject-filter-label"
                      label="Subject"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                      <MenuItem value="">All subjects</MenuItem>
                      {subjects.map((subj) => (
                        <MenuItem key={subj.subject_id} value={subj.subject_id}>
                          {subj.subject_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    sx={{ ml: { xs: 0, sm: 0.5 }, mr: 0 }}
                    control={
                      <Switch
                        size="small"
                        checked={atRiskOnly}
                        onChange={(e) => setAtRiskOnly(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        At risk only
                      </Typography>
                    }
                  />
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<IconChevronDown size={16} />}
                  disabled={selectedRowIds.length === 0}
                  onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                >
                  Bulk Actions{selectedRowIds.length > 0 ? ` (${selectedRowIds.length})` : ''}
                </Button>
                <Menu
                  anchorEl={bulkMenuAnchor}
                  open={Boolean(bulkMenuAnchor)}
                  onClose={() => setBulkMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setBulkMenuAnchor(null);
                      showSnackbar(
                        'Export is not available yet for a selected set of students.',
                        'info',
                      );
                    }}
                  >
                    <IconDownload size={16} style={{ marginRight: 8 }} /> Export selected
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setBulkMenuAnchor(null);
                      showSnackbar(
                        'Print is not available yet for a selected set of students.',
                        'info',
                      );
                    }}
                  >
                    <IconPrinter size={16} style={{ marginRight: 8 }} /> Print selected
                  </MenuItem>
                </Menu>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 0.5, mb: 1 }}
              >
                <IconArrowsHorizontal size={14} /> Swipe horizontally to view all columns
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  sx={{
                    '& .MuiTableCell-root': { py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } },
                    whiteSpace: 'nowrap',
                    minWidth: 1200,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          bgcolor: '#fc9d49',
                          color: '#fff',
                          fontWeight: 700,
                          minWidth: { xs: 150, sm: 250 },
                          verticalAlign: 'middle',
                          borderRight: `1px solid ${borderColor}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Checkbox
                            size="small"
                            sx={{ color: '#fff', p: 0.5, '&.Mui-checked': { color: '#fff' } }}
                            checked={
                              visibleStudents.length > 0 &&
                              visibleStudents.every((s) =>
                                selectedRowIds.includes(s.student_registration_id),
                              )
                            }
                            indeterminate={
                              visibleStudents.some((s) =>
                                selectedRowIds.includes(s.student_registration_id),
                              ) &&
                              !visibleStudents.every((s) =>
                                selectedRowIds.includes(s.student_registration_id),
                              )
                            }
                            onChange={(e) => {
                              const visibleIds = visibleStudents.map(
                                (s) => s.student_registration_id,
                              );
                              setSelectedRowIds((prev) =>
                                e.target.checked
                                  ? Array.from(new Set([...prev, ...visibleIds]))
                                  : prev.filter((id) => !visibleIds.includes(id)),
                              );
                            }}
                          />
                          Student Info
                        </Box>
                      </TableCell>
                      {visibleSubjects.map((subj, subjIdx) => (
                        <TableCell
                          key={subj.subject_id}
                          colSpan={4}
                          align="center"
                          sx={{
                            bgcolor: subjectBandColor(subjIdx).dark,
                            fontWeight: 700,
                            borderRight: `1px solid ${borderColor}`,
                            minWidth: 200,
                          }}
                        >
                          {subj.subject_name}
                        </TableCell>
                      ))}
                      <TableCell
                        colSpan={summaryColSpan}
                        align="center"
                        sx={{
                          bgcolor: '#ffcb15',
                          fontWeight: 700,
                          borderRight: `1px solid ${borderColor}`,
                        }}
                      >
                        SUMMARY
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {visibleSubjects.map((subj, subjIdx) => (
                        <Fragment key={`sub-${subj.subject_id}`}>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 40, sm: 48 },
                              borderLeft: `2px solid ${subjectBandColor(subjIdx).dark}`,
                              borderRight: `1px solid ${borderColor}`,
                            }}
                          >
                            CA ({caMax})
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 40, sm: 48 },
                              borderRight: `1px solid ${borderColor}`,
                            }}
                          >
                            EXAM ({examMax})
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 44, sm: 56 },
                              borderRight: `1px solid ${borderColor}`,
                            }}
                          >
                            TOTAL ({totalMax})
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              minWidth: { xs: 44, sm: 56 },
                              borderRight: `2px solid ${subjectBandColor(subjIdx).dark}`,
                            }}
                          >
                            GRADE
                          </TableCell>
                        </Fragment>
                      ))}
                      {activeTab === 1 && (
                        <>
                          {['1ST TERM', '2ND TERM', '3RD TERM', 'CUM AVG'].map((label) => (
                            <TableCell
                              key={label}
                              align="center"
                              sx={{
                                bgcolor: '#ffcb15',
                                fontWeight: 700,
                                minWidth: { xs: 44, sm: 60 },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  display: 'inline-block',
                                }}
                              >
                                {label}
                              </Typography>
                            </TableCell>
                          ))}
                        </>
                      )}
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 44, sm: 60 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          Cumulative Weighted Average (CWA)
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          POSITION
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          NO. SUBJ
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 40, sm: 50 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          REMARK
                        </Typography>
                      </TableCell>
                      {showPromotionButtons && (
                        <>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: '#ffcb15',
                              fontWeight: 700,
                              minWidth: { xs: 40, sm: 50 },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                display: 'inline-block',
                              }}
                            >
                              RECOMMENDATION
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: '#ffcb15',
                              fontWeight: 700,
                              minWidth: { xs: 40, sm: 50 },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                display: 'inline-block',
                              }}
                            >
                              PROMOTION
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              bgcolor: '#0ca6e8',
                              fontWeight: 700,
                              color: '#fff',
                              minWidth: { xs: 72, sm: 80 },
                            }}
                          >
                            NEXT CLASS
                          </TableCell>
                        </>
                      )}
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 80, sm: 96 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          CLASS TEACHER COMMENT
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 80, sm: 96 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          HEAD OF SCHOOL COMMENT
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ bgcolor: '#ffcb15', fontWeight: 700, minWidth: { xs: 96, sm: 100 } }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            display: 'inline-block',
                          }}
                        >
                          ACTION
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      // Shaped like a real row (sticky avatar+name cell, then
                      // a run of score-cell-sized placeholders spanning the
                      // rest) rather than a single centered spinner — the
                      // real column count is dynamic (one set per subject),
                      // so this approximates it instead of matching exactly.
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              bgcolor: 'background.paper',
                              borderRight: `1px solid ${borderColor}`,
                              minWidth: { xs: 150, sm: 250 },
                              p: { xs: 0.5, sm: 1 },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Skeleton variant="circular" width={32} height={32} />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="40%" />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell colSpan={7 + summaryColSpan}>
                            <Stack direction="row" spacing={1.5}>
                              {Array.from({ length: 8 }).map((__, j) => (
                                <Skeleton key={j} variant="rounded" width={36} height={24} />
                              ))}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : visibleStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8 + summaryColSpan} align="center" sx={{ py: 5 }}>
                          <Typography variant="body2" color="text.secondary">
                            No students match this filter for the selected class arm.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleStudents
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, idx) => {
                          const rowNumber = page * rowsPerPage + idx + 1;
                          const resultMap = {};
                          (row.results || []).forEach((r) => {
                            resultMap[r.subject_id] = r;
                          });
                          // No uploaded scores yet → comments can't be written, so
                          // the Add/Edit menu is disabled (scores first, then comments).
                          const hasNoResults =
                            (row.results || []).length === 0 ||
                            (row.results || []).every((r) => !r.has_result);
                          return (
                            <TableRow key={row.student_registration_id} hover>
                              <TableCell
                                sx={{
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 2,
                                  bgcolor: 'background.paper',
                                  borderRight: `1px solid ${borderColor}`,
                                  minWidth: { xs: 150, sm: 250 },
                                  p: { xs: 0.5, sm: 1 },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 1, sm: 1.5 },
                                  }}
                                >
                                  <Checkbox
                                    size="small"
                                    sx={{ p: 0.5 }}
                                    checked={selectedRowIds.includes(row.student_registration_id)}
                                    onChange={(e) => {
                                      setSelectedRowIds((prev) =>
                                        e.target.checked
                                          ? [...prev, row.student_registration_id]
                                          : prev.filter((id) => id !== row.student_registration_id),
                                      );
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ minWidth: 16, textAlign: 'right', flexShrink: 0 }}
                                  >
                                    {rowNumber}
                                  </Typography>
                                  <Avatar
                                    src={row.user?.avatar}
                                    sx={{
                                      width: { xs: 28, sm: 36 },
                                      height: { xs: 28, sm: 36 },
                                      bgcolor: 'primary.main',
                                      fontSize: { xs: 12, sm: 14 },
                                    }}
                                  >
                                    {avatarInitials(row.user)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{
                                        fontSize: { xs: 12, sm: 14 },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {row.user?.lname} {row.user?.fname} {row.user?.mname}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: { xs: 'none', sm: 'block' } }}
                                    >
                                      {row.user?.sex === 'female' ? 'F' : 'M'} &middot;{' '}
                                      {row.user?.user_id}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              {visibleSubjects.map((subj, subjIdx) => {
                                const result = resultMap[subj.subject_id];
                                const gradeColors = getGradeColors(result?.grade);
                                return (
                                  <Fragment key={`sub-${subj.subject_id}`}>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        bgcolor: subjectBandColor(subjIdx).bg,
                                        fontWeight: 600,
                                        minWidth: { xs: 40, sm: 48 },
                                        borderLeft: `2px solid ${subjectBandColor(subjIdx).dark}`,
                                        borderRight: `1px solid ${borderColor}`,
                                      }}
                                    >
                                      {displayScore(result?.ca_total ?? null)}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        bgcolor: subjectBandColor(subjIdx).bg,
                                        fontWeight: 600,
                                        minWidth: { xs: 40, sm: 48 },
                                        borderRight: `1px solid ${borderColor}`,
                                      }}
                                    >
                                      {displayScore(result?.exam_score ?? null)}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: 700,
                                        minWidth: { xs: 44, sm: 56 },
                                        borderRight: `1px solid ${borderColor}`,
                                      }}
                                    >
                                      {displayScore(result?.overall_total ?? null)}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        bgcolor: result?.grade ? gradeColors.bg : undefined,
                                        color: result?.grade ? gradeColors.color : undefined,
                                        fontWeight: 700,
                                        minWidth: { xs: 44, sm: 56 },
                                        borderRight: `2px solid ${subjectBandColor(subjIdx).dark}`,
                                      }}
                                    >
                                      {result?.grade ?? '-'}
                                    </TableCell>
                                  </Fragment>
                                );
                              })}
                              {activeTab === 1 && (
                                <>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      bgcolor: '#ffcb15',
                                      fontWeight: 600,
                                      minWidth: { xs: 44, sm: 60 },
                                    }}
                                  >
                                    {displayScore(row.first_term_average ?? null)}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      bgcolor: '#ffcb15',
                                      fontWeight: 600,
                                      minWidth: { xs: 44, sm: 60 },
                                    }}
                                  >
                                    {displayScore(row.second_term_average ?? null)}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      bgcolor: '#ffcb15',
                                      fontWeight: 600,
                                      minWidth: { xs: 44, sm: 60 },
                                    }}
                                  >
                                    {displayScore(row.third_term_average ?? null)}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      bgcolor: '#ffcb15',
                                      fontWeight: 600,
                                      minWidth: { xs: 44, sm: 60 },
                                    }}
                                  >
                                    {displayScore(row.all_term_average ?? null)}
                                  </TableCell>
                                </>
                              )}
                              <TableCell
                                align="center"
                                sx={{
                                  bgcolor: '#ffcb15',
                                  fontWeight: 600,
                                  minWidth: { xs: 44, sm: 60 },
                                }}
                              >
                                {displayScore(
                                  activeTab === 0 ? row.student_average : row.all_term_average,
                                )}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  bgcolor: '#ffcb15',
                                  fontWeight: 600,
                                  minWidth: { xs: 40, sm: 50 },
                                }}
                              >
                                {activeTab === 0
                                  ? (row.position ?? '-')
                                  : (row.all_term_overall_class_position ?? '-')}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  bgcolor: '#ffcb15',
                                  fontWeight: 600,
                                  minWidth: { xs: 40, sm: 50 },
                                }}
                              >
                                {row.total_subjects ?? '-'}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 600, minWidth: { xs: 40, sm: 50 } }}
                              >
                                {row.remark ??
                                  remarkFor(
                                    activeTab === 0 ? row.student_average : row.all_term_average,
                                    gradeSettings,
                                  )}
                              </TableCell>
                              {showPromotionButtons && (
                                <>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontWeight: 600,
                                      minWidth: { xs: 40, sm: 50 },
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {row.promotion_recommendation || '-'}
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: { xs: 40, sm: 50 } }}>
                                    <Tooltip title="Click to change recommendation">
                                      <Box
                                        component="span"
                                        onClick={(e) =>
                                          setRecMenu({
                                            rowId: row.student_registration_id,
                                            anchorEl: e.currentTarget,
                                          })
                                        }
                                        sx={{ display: 'inline-flex', cursor: 'pointer' }}
                                      >
                                        {promotionIcon(row.promotion_recommendation)}
                                      </Box>
                                    </Tooltip>
                                    <Menu
                                      anchorEl={recMenu.anchorEl}
                                      open={
                                        Boolean(recMenu.anchorEl) &&
                                        recMenu.rowId === row.student_registration_id
                                      }
                                      onClose={() => setRecMenu({ rowId: null, anchorEl: null })}
                                    >
                                      {[
                                        'promoted',
                                        'promoted on trial',
                                        'not promoted',
                                        'advised to repeat',
                                      ].map((opt) => (
                                        <MenuItem
                                          key={opt}
                                          dense
                                          selected={row.promotion_recommendation === opt}
                                          onClick={() => handleSetRecommendation(row, opt)}
                                        >
                                          {opt}
                                        </MenuItem>
                                      ))}
                                    </Menu>
                                  </TableCell>
                                  <TableCell align="center" sx={{ minWidth: { xs: 72, sm: 80 } }}>
                                    {row.promotion_recommendation === 'promoted' ||
                                    row.promotion_recommendation === 'promoted on trial' ||
                                    row.promotion_recommendation === 'graduated' ? (
                                      <FormControl size="small" fullWidth>
                                        <Select
                                          value={row.next_class_arm_id || ''}
                                          onChange={(e) => handleSetNextClass(row, e.target.value)}
                                          sx={{ fontSize: 12 }}
                                        >
                                          <MenuItem value="">
                                            <em>-</em>
                                          </MenuItem>
                                          {allArms.map((arm) => (
                                            <MenuItem key={arm.id} value={arm.id}>
                                              {arm.class_name
                                                ? `${arm.class_name} - ${arm.class_arm_names}`
                                                : arm.class_arm_names}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                </>
                              )}
                              <CommentCell value={row.class_teachers_comment} />
                              <CommentCell value={row.hos_comment} />
                              <TableCell sx={{ minWidth: { xs: 96, sm: 100 } }}>
                                <Tooltip
                                  title={
                                    hasNoResults
                                      ? 'No scores uploaded for this student yet — upload scores before adding comments'
                                      : 'Add or edit comments and scores'
                                  }
                                >
                                  <span>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      sx={{
                                        fontSize: 12,
                                        px: 1,
                                        minWidth: 0,
                                        textTransform: 'none',
                                      }}
                                      onClick={(e) => handleAddEditClick(e, row)}
                                      disabled={hasNoResults}
                                    >
                                      Add/Edit
                                    </Button>
                                  </span>
                                </Tooltip>
                                <Menu
                                  anchorEl={addEditMenu.anchorEl}
                                  open={
                                    Boolean(addEditMenu.anchorEl) &&
                                    addEditMenu.rowId === row.student_registration_id
                                  }
                                  onClose={closeAddEditMenu}
                                >
                                  <MenuItem
                                    dense
                                    onClick={() => {
                                      closeAddEditMenu();
                                      handleOpenComment(row, 'teacher');
                                    }}
                                  >
                                    <IconMessage size={16} style={{ marginRight: 8 }} /> Class
                                    Teacher
                                  </MenuItem>
                                  <MenuItem
                                    dense
                                    onClick={() => {
                                      closeAddEditMenu();
                                      handleOpenComment(row, 'hos');
                                    }}
                                  >
                                    <IconMessage size={16} style={{ marginRight: 8 }} /> HoS Comment
                                  </MenuItem>
                                  {activeTab === 0 &&
                                    sheet?.result_publish?.head_of_school_publish !== 'yes' && (
                                      <MenuItem
                                        dense
                                        onClick={() => {
                                          closeAddEditMenu();
                                          handleOpenEditScores(row);
                                        }}
                                      >
                                        <IconEdit size={16} style={{ marginRight: 8 }} /> Edit
                                        Scores
                                      </MenuItem>
                                    )}
                                </Menu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={visibleStudents.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    gap: 0.5,
                  },
                  '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
                }}
              />
            </>
          )}

          {!showData && !loading && (
            <Alert
              severity={filterError ? 'error' : 'info'}
              sx={{ mt: 1 }}
              onClose={filterError ? () => setFilterError('') : undefined}
            >
              {filterError ||
                (activeTab === 0
                  ? 'Select Session, Term, Programme, Class and Class Arm, then click Fetch to view the broadsheet.'
                  : 'Select Session, Programme, Class and Class Arm, then click Fetch to view the term cumulative broadsheet.')}
            </Alert>
          )}
        </Box>
      </Card>

      {/* ── Review checks ───────────────────────────────────── */}
      <Dialog
        open={checksModalOpen}
        onClose={() => setChecksModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Checks to resolve</DialogTitle>
        <DialogContent dividers>
          {(() => {
            const students = sheet?.students || [];
            const missingScores = students.filter((s) => s.subjects_scored < s.total_subjects);
            const remarksPending = students.filter((s) => !s.class_teachers_comment);
            const positionsMissing = students.filter((s) => s.persisted_class_position === null);
            const Section = ({ title, list, hint }) => (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {title} ({list.length})
                </Typography>
                {list.length === 0 ? (
                  <Typography variant="caption" color="success.main">
                    All clear.
                  </Typography>
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {hint}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {list.map((s) => (
                        <Chip
                          key={s.id}
                          size="small"
                          label={`${s.user?.lname ?? ''} ${s.user?.fname ?? ''}`.trim()}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            );
            return (
              <>
                <Section
                  title="Missing scores"
                  list={missingScores}
                  hint="Hasn't been scored in every subject yet."
                />
                <Section
                  title="Remarks pending"
                  list={remarksPending}
                  hint="Run Generate Remarks (Stage 1) to fill these in."
                />
                <Section
                  title="Positions missing"
                  list={positionsMissing}
                  hint="Run Generate Positioning (Stage 2) once remarks are complete."
                />
              </>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChecksModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Workflow action confirmation ─────────────────────── */}
      <Dialog open={publishConfirm.open} onClose={closePublishConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>{PUBLISH_CONFIRM[publishConfirm.action]?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            {PUBLISH_CONFIRM[publishConfirm.action]?.body}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closePublishConfirm}
            disabled={Boolean(publishing) || generatingComments || generatingPositioning}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={PUBLISH_CONFIRM[publishConfirm.action]?.color || 'primary'}
            onClick={() => handleWorkflowConfirm(publishConfirm.action)}
            disabled={Boolean(publishing) || generatingComments || generatingPositioning}
          >
            {publishing || generatingComments || generatingPositioning ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              PUBLISH_CONFIRM[publishConfirm.action]?.confirm
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Comment Dialog ──────────────────────────────────── */}
      <Dialog open={commentDialog.open} onClose={closeCommentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {commentDialog.mode === 'hos' ? 'Head of School Comment' : 'Class Teacher Comment'} —{' '}
          {commentDialog.student?.user?.lname} {commentDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          {commentDialog.mode === 'hos' ? (
            <TextField
              label="Head of School Comment"
              fullWidth
              multiline
              rows={4}
              value={commentForm.hos_comment}
              onChange={(e) => setCommentForm({ ...commentForm, hos_comment: e.target.value })}
            />
          ) : (
            <TextField
              label="Class Teacher Comment"
              fullWidth
              multiline
              rows={4}
              value={commentForm.teacher_comment}
              onChange={(e) => setCommentForm({ ...commentForm, teacher_comment: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCommentDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveComment}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Scores Dialog ─────────────────────────────── */}
      <Dialog open={editScoresDialog.open} onClose={handleCloseEditScores} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Scores — {editScoresDialog.student?.user?.lname}{' '}
          {editScoresDialog.student?.user?.fname}
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  {scoreForm[0]?.ca_breakdown.map((g) => (
                    <TableCell
                      key={g.display_name}
                      colSpan={Math.max(g.entities.length, 1)}
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      {g.display_name}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    CA Total
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Exam Score
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} />
                  {scoreForm[0]?.ca_breakdown.map((g) =>
                    g.entities.map((e) => (
                      <TableCell
                        key={e.display_name}
                        align="center"
                        sx={{ fontSize: 12, color: 'text.secondary' }}
                      >
                        {e.display_name}
                        {e.max_score != null ? `(${e.max_score})` : ''}
                      </TableCell>
                    )),
                  )}
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {caMax})
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: 12, color: 'text.secondary' }}>
                    (Max {examMax})
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {scoreForm.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No registered subjects available to edit for this student.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  scoreForm.map((subj, i) => {
                    const caTotal = subj.ca_breakdown.reduce(
                      (sum, g) => sum + g.entities.reduce((s, e) => s + (Number(e.score) || 0), 0),
                      0,
                    );
                    return (
                      <TableRow key={subj.subject_id} hover>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{subj.subject_name}</TableCell>
                        {subj.ca_breakdown.map((g, gi) =>
                          g.entities.map((e, ei) => (
                            <TableCell key={`${gi}-${ei}`} align="center">
                              <TextField
                                size="small"
                                type="number"
                                value={e.score}
                                onChange={(ev) => handleScoreChange(i, gi, ei, ev.target.value)}
                                error={isScoreInvalid(e.score, e.max_score)}
                                helperText={
                                  isScoreInvalid(e.score, e.max_score) ? 'Invalid score' : ' '
                                }
                                inputProps={{
                                  min: 0,
                                  max: e.max_score ?? undefined,
                                  style: { textAlign: 'center', width: 64, padding: '6px 4px' },
                                }}
                                sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                              />
                            </TableCell>
                          )),
                        )}
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          {caTotal}
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={subj.exam_score}
                            onChange={(ev) => handleExamChange(i, ev.target.value)}
                            error={
                              subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax)
                            }
                            helperText={
                              subj.exam_score === '' || isScoreInvalid(subj.exam_score, examMax)
                                ? 'Invalid score'
                                : ' '
                            }
                            inputProps={{
                              min: 0,
                              max: examMax,
                              style: { textAlign: 'center', width: 64, padding: '6px 4px' },
                            }}
                            sx={{ '& .MuiFormHelperText-root': { m: 0, fontSize: 10 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button size="small" onClick={() => handleSaveScoreRow(i)}>
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditScores}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default BroadsheetTab;
