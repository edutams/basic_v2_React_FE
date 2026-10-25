import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Grid,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Radio,
  Checkbox,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CategoryPlacementStatCard from './CategoryPlacementStatCard';
import CategoryRemapModal from './CategoryRemapModal';
import {
  fetchClassAndArmsByProgramme,
  fetchProgrammes,
  fetchSessions,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchActiveCategories } from '@/api/tenant/bursary/bursarySettingsApi';
import {
  fetchStudentsForClass,
  assignCategory,
  clearCategory,
  fetchMigratePreview,
  exportStudentsCsv,
  importStudentsCsv,
} from '@/api/tenant/bursary/paymentCategory';
import { useNotification } from '@/hooks/useNotification';

const SN_WIDTH = 50;
const CHECK_WIDTH = 44;
const STUDENT_COL_WIDTH = 240;
const CATEGORY_COL_WIDTH = 120;
const PLACEMENT_COL_WIDTH = 160;

// Category visuals are matched by name/code against known patterns first —
// a fixed, small fallback palette (keyed by category id) covers any custom
// category a school adds that doesn't match a known pattern, so every
// column/badge still gets a stable, distinct color instead of defaulting
// to the same one everywhere.
const CATEGORY_PATTERNS = [
  {
    test: (c) => c.code === 'new' || /new/i.test(c.name || ''),
    badgeBg: '#FCE7F3',
    badgeText: '#DB2777',
    headerBg: '#FDF2F8',
  },
  {
    test: (c) => c.code === 'returning' || /return/i.test(c.name || ''),
    badgeBg: '#DBEAFE',
    badgeText: '#2563EB',
    headerBg: '#EFF6FF',
  },
  {
    test: (c) => /bursary/i.test(c.name || ''),
    badgeBg: '#DBEAFE',
    badgeText: '#2563EB',
    headerBg: '#EFF6FF',
  },
  {
    test: (c) => /existing/i.test(c.name || ''),
    badgeBg: '#DCFCE7',
    badgeText: '#16A34A',
    headerBg: '#F0FDF4',
  },
  {
    test: (c) => /scholarship/i.test(c.name || ''),
    badgeBg: '#FEF9C3',
    badgeText: '#A16207',
    headerBg: '#FEFCE8',
  },
  {
    test: (c) => /staff/i.test(c.name || ''),
    badgeBg: '#E2E8F0',
    badgeText: '#475569',
    headerBg: '#F8FAFC',
  },
  {
    test: (c) => /boarding/i.test(c.name || ''),
    badgeBg: '#CCFBF1',
    badgeText: '#0D9488',
    headerBg: '#F0FDFA',
  },
  {
    test: (c) => /\bday\b/i.test(c.name || ''),
    badgeBg: '#FCE7F3',
    badgeText: '#DB2777',
    headerBg: '#FDF2F8',
  },
  {
    test: (c) => /special/i.test(c.name || ''),
    badgeBg: '#EDE9FE',
    badgeText: '#7C3AED',
    headerBg: '#F5F3FF',
  },
  {
    test: (c) => /late admission/i.test(c.name || ''),
    badgeBg: '#FFEDD5',
    badgeText: '#EA580C',
    headerBg: '#FFF7ED',
  },
  {
    test: (c) => /financial|fin\.?\s*assist/i.test(c.name || ''),
    badgeBg: '#E0E7FF',
    badgeText: '#4F46E5',
    headerBg: '#EEF2FF',
  },
  {
    test: (c) => /sibling/i.test(c.name || ''),
    badgeBg: '#CCFBF1',
    badgeText: '#0D9488',
    headerBg: '#F0FDFA',
  },
];
const FALLBACK_PALETTE = [
  { badgeBg: '#E2E8F0', badgeText: '#475569', headerBg: '#F8FAFC' },
  { badgeBg: '#FEE2E2', badgeText: '#DC2626', headerBg: '#FEF2F2' },
  { badgeBg: '#E0E7FF', badgeText: '#4F46E5', headerBg: '#EEF2FF' },
];

const getCategoryStyle = (category) => {
  if (!category) return FALLBACK_PALETTE[0];
  const match = CATEGORY_PATTERNS.find((p) => p.test(category));
  if (match) return match;

  return FALLBACK_PALETTE[(category.id || 0) % FALLBACK_PALETTE.length];
};

const CurrentPlacementBadge = ({ student, category }) => {
  if (student.bursary_payment_category_id == null) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.4,
          borderRadius: '6px',
          bgcolor: '#FFEDD5',
          color: '#C2410C',
          fontSize: '11.5px',
          fontWeight: 700,
        }}
      >
        <WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />
        Needs placement
      </Box>
    );
  }

  const style = getCategoryStyle(category);

  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.4,
        borderRadius: '6px',
        bgcolor: style.badgeBg,
        color: style.badgeText,
        fontSize: '11.5px',
        fontWeight: 700,
      }}
    >
      {category?.name || student.category_name}
    </Box>
  );
};

const StudentCategoryPlacementTab = () => {
  const notify = useNotification();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programme, setProgramme] = useState('');
  const [classArmId, setClassArmId] = useState('');

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [termOptions, setTermOptions] = useState([]);
  const [sessionTermId, setSessionTermId] = useState(null);

  const [categories, setCategories] = useState([]);

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    not_placed: 0,
    new_students: 0,
    returning_students: 0,
    placed_new_students: 0,
    placed_returning_students: 0,
    not_placed_new_students: 0,
    not_placed_returning_students: 0,
    by_category: [],
  });
  const [lastTermReference, setLastTermReference] = useState({ available: false, total: 0 });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [savingUserId, setSavingUserId] = useState(null);
  const [remapTarget, setRemapTarget] = useState(null);
  const [placementConfirm, setPlacementConfirm] = useState(null);

  // Generic batch-assign confirm — used by both a category column's "place
  // everyone" header checkbox and the row-selection bulk bar's "Assign
  // category" action. { category, eligible, skipped } | null.
  const [bulkConfirm, setBulkConfirm] = useState(null);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Row-selection for the bulk action bar — a separate concept from the
  // per-category column bulk-assign above (that one targets "everyone in
  // the class", this one targets only the checked rows).
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkRowCategoryId, setBulkRowCategoryId] = useState('');
  const [clearConfirm, setClearConfirm] = useState(null);
  const [clearing, setClearing] = useState(false);

  const [migrateState, setMigrateState] = useState(null); // { previous_term, eligible, skipped } | null
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importInputRef = useRef(null);

  const scrollRef = useRef(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    updateScrollShadow();
    window.addEventListener('resize', updateScrollShadow);
    return () => window.removeEventListener('resize', updateScrollShadow);
  }, [updateScrollShadow, categories, students]);

  useEffect(() => {
    fetchProgrammes()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setProgrammes(list.map((p) => ({ value: p.id, label: p.programme_name })));
        if (list.length > 0) {
          setProgramme(list[0].id);
        }
      })
      .catch(() => notify.error('Failed to load programmes'));

    fetchSessions()
      .then((res) => setSessions(res.data || res || []))
      .catch(() => notify.error('Failed to load sessions'));

    fetchActiveSessionTerm()
      .then((res) => {
        if (res?.data?.session_id) setSessionId(res.data.session_id);
      })
      .catch(() => notify.error('Failed to load active session term'));

    fetchActiveCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : []))
      .catch(() => notify.error('Failed to load pay categories'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!programme) return;
    fetchClassAndArmsByProgramme(programme)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setClasses(
          list.map((c) => ({
            value: c.class_arm_id,
            label: `${c.class_code}${c.class_arm_names ? ` ${c.class_arm_names}` : ''}`,
          })),
        );
        setClassArmId(list.length > 0 ? list[0].class_arm_id : '');
      })
      .catch(() => notify.error('Failed to load classes'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programme]);

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionTerms(sessionId)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setTermOptions(list);
        setSessionTermId((prev) => {
          if (prev && list.some((t) => t.session_term_id === prev)) return prev;
          const active = list.find((t) => t.status === 'active');

          return (active || list[0])?.session_term_id ?? null;
        });
      })
      .catch(() => notify.error('Failed to load terms for this session'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const resetSelection = () => setSelectedRows(new Set());

  const loadStudents = useCallback(async () => {
    if (!classArmId || !sessionTermId) {
      notify.warning('Please select a programme, class and term');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchStudentsForClass({ classArmId, sessionTermId });
      if (res?.status) {
        setStudents(res.data.students || []);
        setStats(
          res.data.stats ? { ...res.data.stats, by_category: res.data.by_category || [] } : stats,
        );
        setLastTermReference(res.data.last_term_reference || { available: false, total: 0 });
        setPage(0);
        setFilterStatus('all');
        setSearch('');
        setHasFetched(true);
        resetSelection();
      }
    } catch (err) {
      notify.error('Failed to load students');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classArmId, sessionTermId, notify]);

  const handleSelectCategory = (student, category) => {
    if (student.bursary_payment_category_id === category.id || savingUserId) return;
    setPlacementConfirm({ student, category });
  };

  const applyPlacement = async (student, category) => {
    if (student.has_payments) {
      setRemapTarget({
        userId: student.user_id,
        fullName: student.full_name,
        currentCategoryId: student.bursary_payment_category_id,
        newCategoryId: category.id,
      });
      return;
    }

    setSavingUserId(student.user_id);
    setStudents((prev) =>
      prev.map((s) =>
        s.user_id === student.user_id
          ? { ...s, bursary_payment_category_id: category.id, category_name: category.name }
          : s,
      ),
    );
    try {
      const res = await assignCategory({
        userId: student.user_id,
        sessionTermId,
        categoryId: category.id,
      });
      if (res?.status) {
        notify.success(`${student.full_name} placed in ${category.name}`);
        loadStudents();
      } else {
        notify.error(res?.message || 'Failed to update pay category');
        loadStudents();
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update pay category');
      loadStudents();
    } finally {
      setSavingUserId(null);
    }
  };

  const handleConfirmPlacement = () => {
    if (!placementConfirm) return;
    const { student, category } = placementConfirm;
    setPlacementConfirm(null);
    applyPlacement(student, category);
  };

  // Shared by the per-column "place everyone" checkbox and the row-selection
  // bulk bar — scope is whichever student list is passed in.
  const openBatchAssign = (category, scopeStudents, emptyMessage) => {
    const eligible = scopeStudents.filter(
      (s) => s.bursary_payment_category_id !== category.id && !s.has_payments,
    );
    const skipped = scopeStudents.filter(
      (s) => s.bursary_payment_category_id !== category.id && s.has_payments,
    );

    if (eligible.length === 0 && skipped.length === 0) {
      notify.warning(emptyMessage);
      return;
    }

    setBulkConfirm({ category, eligible, skipped });
  };

  const handleOpenBulkAssign = (category) => {
    openBatchAssign(category, students, `Everyone in this class is already in ${category.name}`);
  };

  const handleBulkRowAssign = () => {
    const category = categories.find((c) => c.id === bulkRowCategoryId);
    if (!category) {
      notify.warning('Choose a category to assign first');
      return;
    }
    const scope = students.filter((s) => selectedRows.has(s.user_id));
    openBatchAssign(category, scope, `Every selected student is already in ${category.name}`);
  };

  const handleConfirmBulkAssign = async () => {
    if (!bulkConfirm) return;
    const { category, eligible, skipped } = bulkConfirm;
    setBulkConfirm(null);
    setBulkAssigning(true);

    try {
      const results = await Promise.all(
        eligible.map((student) =>
          assignCategory({ userId: student.user_id, sessionTermId, categoryId: category.id }).catch(
            () => ({
              status: false,
            }),
          ),
        ),
      );
      const succeeded = results.filter((r) => r?.status).length;
      const failed = eligible.length - succeeded;

      let message = `${succeeded} student(s) placed in ${category.name}`;
      if (failed > 0) message += ` — ${failed} failed`;
      if (skipped.length > 0) message += ` — ${skipped.length} skipped (already have payments)`;

      notify[failed > 0 ? 'warning' : 'success'](message);
      resetSelection();
      loadStudents();
    } catch (err) {
      notify.error('Failed to place students');
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleRemapFromBulkSkip = (student, category) => {
    setBulkConfirm(null);
    setClearConfirm(null);
    setMigrateState(null);
    setRemapTarget({
      userId: student.user_id,
      fullName: student.full_name,
      currentCategoryId: student.bursary_payment_category_id,
      newCategoryId: category.id,
    });
  };

  // "Clear placement" reverts selected rows back to genuinely having no
  // category — same has_payments skip rule as every other bulk path here.
  const handleOpenClearPlacement = () => {
    const scope = students.filter((s) => selectedRows.has(s.user_id));
    const eligible = scope.filter((s) => s.bursary_payment_category_id != null && !s.has_payments);
    const skipped = scope.filter((s) => s.bursary_payment_category_id != null && s.has_payments);

    if (eligible.length === 0 && skipped.length === 0) {
      notify.warning('Every selected student already needs placement');
      return;
    }

    setClearConfirm({ eligible, skipped });
  };

  const handleConfirmClearPlacement = async () => {
    if (!clearConfirm) return;
    const { eligible, skipped } = clearConfirm;
    setClearConfirm(null);
    setClearing(true);

    try {
      const results = await Promise.all(
        eligible.map((student) =>
          clearCategory({ userId: student.user_id, sessionTermId }).catch(() => ({ status: false })),
        ),
      );
      const succeeded = results.filter((r) => r?.status).length;
      const failed = eligible.length - succeeded;

      let message = `${succeeded} student(s) reverted to Needs Placement`;
      if (failed > 0) message += ` — ${failed} failed`;
      if (skipped.length > 0) message += ` — ${skipped.length} skipped (already have payments)`;

      notify[failed > 0 ? 'warning' : 'success'](message);
      resetSelection();
      loadStudents();
    } catch (err) {
      notify.error('Failed to clear placements');
    } finally {
      setClearing(false);
    }
  };

  const handleOpenMigrate = async () => {
    if (!classArmId || !sessionTermId) return;
    setMigrateLoading(true);
    try {
      const res = await fetchMigratePreview({ classArmId, sessionTermId });
      if (!res?.status) {
        notify.error(res?.message || 'Failed to load migration preview');

        return;
      }
      const data = res.data;
      if (!data.available) {
        notify.info('There is no earlier term to migrate from.');

        return;
      }
      if (data.eligible.length === 0 && data.skipped.length === 0) {
        notify.info(
          'Everyone in this class either already has a placement or has no record in the last term.',
        );

        return;
      }
      setMigrateState(data);
    } catch (err) {
      notify.error('Failed to load migration preview');
    } finally {
      setMigrateLoading(false);
    }
  };

  const handleConfirmMigrate = async () => {
    if (!migrateState) return;
    const { eligible } = migrateState;
    setMigrateState(null);
    setMigrating(true);

    try {
      const results = await Promise.all(
        eligible.map((student) =>
          assignCategory({
            userId: student.user_id,
            sessionTermId,
            categoryId: student.target_category_id,
          }).catch(() => ({ status: false })),
        ),
      );
      const succeeded = results.filter((r) => r?.status).length;
      const failed = eligible.length - succeeded;

      let message = `${succeeded} student(s) migrated from last term`;
      if (failed > 0) message += ` — ${failed} failed`;

      notify[failed > 0 ? 'warning' : 'success'](message);
      loadStudents();
    } catch (err) {
      notify.error('Failed to migrate placements');
    } finally {
      setMigrating(false);
    }
  };

  const handleExportCsv = async () => {
    if (!classArmId || !sessionTermId) return;
    try {
      const blob = await exportStudentsCsv({ classArmId, sessionTermId });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_category_placement_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      notify.error('Failed to export CSV');
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
    e.target.value = '';
  };

  const handleImportUpload = async () => {
    if (!importFile || !sessionTermId) return;
    setImporting(true);
    try {
      const res = await importStudentsCsv({ sessionTermId, file: importFile });
      setImportResult(res?.data || null);
      setImportFile(null);
      if (res?.data?.updated > 0) {
        loadStudents();
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    let list = students;
    if (filterStatus === 'placed') {
      list = list.filter((s) => s.bursary_payment_category_id != null);
    } else if (filterStatus === 'not_placed') {
      list = list.filter((s) => s.bursary_payment_category_id == null);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) => s.full_name?.toLowerCase().includes(q) || s.admission_no?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [students, filterStatus, search]);

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const toggleFilter = (status) => {
    setFilterStatus((prev) => (prev === status ? 'all' : status));
    setPage(0);
  };

  const toggleRowSelection = (userId) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);

      return next;
    });
  };

  const isAllPageSelected =
    paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedRows.has(s.user_id));
  const isSomePageSelected =
    paginatedStudents.some((s) => selectedRows.has(s.user_id)) && !isAllPageSelected;

  const toggleSelectAllOnPage = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        paginatedStudents.forEach((s) => next.delete(s.user_id));
      } else {
        paginatedStudents.forEach((s) => next.add(s.user_id));
      }

      return next;
    });
  };

  const stickyHeaderSx = { fontWeight: 700 };

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const rangeFrom = filteredStudents.length === 0 ? 0 : page * rowsPerPage + 1;
  const rangeTo = Math.min(filteredStudents.length, page * rowsPerPage + rowsPerPage);

  // Group the migrate preview's per-student target categories for a
  // readable summary line ("12 → Returning Student Category") instead of
  // listing every student — each row still carries its own target when
  // actually applied.
  const migrateGroups = useMemo(() => {
    if (!migrateState) return [];
    const groups = new Map();
    migrateState.eligible.forEach((s) => {
      const key = s.target_category_name;
      groups.set(key, (groups.get(key) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([name, count]) => ({ name, count }));
  }, [migrateState]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CategoryPlacementStatCard
            icon={GroupsOutlinedIcon}
            iconBg={isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE'}
            iconColor="#2563EB"
            label="Total Students"
            value={stats.total}
            valueColor="#2563EB"
            loading={loading}
            active={filterStatus === 'all'}
            onClick={() => toggleFilter('all')}
            subStats={[
              { label: 'New Students', value: stats.new_students },
              { label: 'Returning Students', value: stats.returning_students },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CategoryPlacementStatCard
            icon={CheckCircleOutlineIcon}
            iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7'}
            iconColor="#16A34A"
            label="Categorised Students"
            value={stats.placed}
            valueColor="#16A34A"
            percent={stats.total ? Math.round((stats.placed / stats.total) * 100) : 0}
            percentColor="#16A34A"
            loading={loading}
            active={filterStatus === 'placed'}
            onClick={() => toggleFilter('placed')}
            subStats={[
              { label: 'New Students', value: stats.placed_new_students },
              { label: 'Returning Students', value: stats.placed_returning_students },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CategoryPlacementStatCard
            icon={PersonIcon}
            iconBg={isDark ? 'rgba(217,119,6,0.18)' : '#FFEDD5'}
            iconColor="#D97706"
            label="Needs Placement"
            value={stats.not_placed}
            valueColor="#DC2626"
            percent={stats.total ? Math.round((stats.not_placed / stats.total) * 100) : 0}
            percentColor="#DC2626"
            analyticsIconColor="#DC2626"
            loading={loading}
            active={filterStatus === 'not_placed'}
            onClick={() => toggleFilter('not_placed')}
            subStats={[
              { label: 'New Students', value: stats.not_placed_new_students },
              { label: 'Returning Students', value: stats.not_placed_returning_students },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <CategoryPlacementStatCard
            icon={HistoryOutlinedIcon}
            iconBg={isDark ? 'rgba(124,58,237,0.18)' : '#EDE9FE'}
            iconColor="#7C3AED"
            label="Last Term Reference"
            value={lastTermReference.available ? lastTermReference.total : '—'}
            valueColor="#2563EB"
            loading={loading}
            analyticsIconColor="#DC2626"
            supportingText={
              lastTermReference.available
                ? `Students placed in ${lastTermReference.session_name} – ${lastTermReference.term_name}`
                : 'No earlier term on record'
            }
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 1.5 }}>
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
            <TextField
              select
              fullWidth
              label="Academic Session"
              size="small"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <TextField
              select
              fullWidth
              label="Term"
              size="small"
              value={sessionTermId || ''}
              onChange={(e) => setSessionTermId(e.target.value)}
            >
              {termOptions.map((t) => (
                <MenuItem key={t.session_term_id} value={t.session_term_id}>
                  {t.term_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.7 }}>
            <TextField
              select
              fullWidth
              label="Programme"
              size="small"
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
            >
              {programmes.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <TextField
              select
              fullWidth
              label="Class / Arm"
              size="small"
              value={classArmId}
              onChange={(e) => setClassArmId(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <TextField
              select
              fullWidth
              label="Placement Status"
              size="small"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">All Students</MenuItem>
              <MenuItem value="placed">Placed</MenuItem>
              <MenuItem value="not_placed">Not Placed</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or admission number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={loadStudents}
              disabled={!classArmId || !sessionTermId || loading}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
            </Button>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {(() => {
              const migrateDisabled = !hasFetched || migrateLoading || migrating || !lastTermReference.available;
              const migrateDisabledReason = !hasFetched
                ? 'Select a programme, class and term, then click Fetch first.'
                : !lastTermReference.available
                  ? "There's no earlier term on record to migrate placements from."
                  : '';

              return (
                <Tooltip title={migrateDisabled && migrateDisabledReason ? migrateDisabledReason : ''}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={migrateLoading ? <CircularProgress size={16} /> : <RestoreOutlinedIcon />}
                      onClick={handleOpenMigrate}
                      disabled={migrateDisabled}
                    >
                      {migrating ? 'Migrating...' : 'Migrate from Last Term'}
                    </Button>
                  </span>
                </Tooltip>
              );
            })()}
            {lastTermReference.available && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 480 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary">
                  Copy students&apos; category placement from {lastTermReference.session_name} –{' '}
                  {lastTermReference.term_name}. You can review and make changes after migration.
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => setImportOpen(true)}
              disabled={!hasFetched}
            >
              Import CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileUploadOutlinedIcon />}
              onClick={handleExportCsv}
              disabled={!hasFetched}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadStudents}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <TableContainer
            ref={scrollRef}
            onScroll={updateScrollShadow}
            sx={{ maxHeight: 560, overflowX: 'auto' }}
          >
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      width: CHECK_WIDTH,
                      minWidth: CHECK_WIDTH,
                      ...stickyHeaderSx,
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      ...(!isMobile && { position: 'sticky', left: 0, zIndex: 4 }),
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isAllPageSelected}
                      indeterminate={isSomePageSelected}
                      onChange={toggleSelectAllOnPage}
                      disabled={paginatedStudents.length === 0}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      width: SN_WIDTH,
                      minWidth: SN_WIDTH,
                      maxWidth: SN_WIDTH,
                      ...stickyHeaderSx,
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      ...(!isMobile && { position: 'sticky', left: CHECK_WIDTH, zIndex: 4 }),
                      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}`,
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      width: STUDENT_COL_WIDTH,
                      minWidth: STUDENT_COL_WIDTH,
                      maxWidth: STUDENT_COL_WIDTH,
                      ...stickyHeaderSx,
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                      ...(!isMobile && {
                        position: 'sticky',
                        left: CHECK_WIDTH + SN_WIDTH,
                        zIndex: 4,
                      }),
                      borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>
                      Student Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
                      {stats.total} students
                    </Typography>
                  </TableCell>
                  {categories.map((cat) => {
                    const style = getCategoryStyle(cat);
                    const count =
                      stats.by_category.find((c) => c.category_id === cat.id)?.count ?? 0;

                    return (
                      <TableCell
                        key={cat.id}
                        align="center"
                        sx={{
                          width: CATEGORY_COL_WIDTH,
                          minWidth: CATEGORY_COL_WIDTH,
                          ...stickyHeaderSx,
                          bgcolor: `${isDark ? 'rgba(255,255,255,0.04)' : style.headerBg} !important`,
                        }}
                      >
                        <Tooltip title={cat.description || ''}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              display: 'block',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              lineHeight: 1.2,
                            }}
                          >
                            {cat.name} ({count})
                          </Typography>
                        </Tooltip>
                        <Tooltip title={`Place every student in this class into ${cat.name}`}>
                          <span>
                            <Checkbox
                              size="small"
                              checked={false}
                              disabled={
                                !hasFetched || loading || bulkAssigning || students.length === 0
                              }
                              onChange={() => handleOpenBulkAssign(cat)}
                              sx={{ p: 0.25 }}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    align="center"
                    sx={{
                      width: PLACEMENT_COL_WIDTH,
                      minWidth: PLACEMENT_COL_WIDTH,
                      ...stickyHeaderSx,
                      bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                    }}
                  >
                    Current Placement
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell
                        padding="checkbox"
                        sx={{
                          ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      >
                        <Skeleton variant="rectangular" width={16} height={16} />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: SN_WIDTH,
                          ...(!isMobile && { position: 'sticky', left: CHECK_WIDTH, zIndex: 2 }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      >
                        <Skeleton variant="text" width={16} />
                      </TableCell>
                      <TableCell
                        sx={{
                          width: STUDENT_COL_WIDTH,
                          ...(!isMobile && {
                            position: 'sticky',
                            left: CHECK_WIDTH + SN_WIDTH,
                            zIndex: 2,
                          }),
                          bgcolor: `${isDark ? '#1e293b' : '#f1f5f9'} !important`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" />
                            <Skeleton variant="text" width="40%" />
                          </Box>
                        </Box>
                      </TableCell>
                      {categories.map((cat) => (
                        <TableCell key={cat.id} align="center">
                          <Skeleton variant="circular" width={20} height={20} sx={{ mx: 'auto' }} />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <Skeleton variant="rounded" width={90} height={22} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !hasFetched ? (
                  <TableRow>
                    <TableCell colSpan={3 + categories.length} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        Select a programme, class and term, then click Fetch.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3 + categories.length} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No students match this filter.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => {
                    const isSaving = savingUserId === student.user_id;
                    const isChecked = selectedRows.has(student.user_id);

                    return (
                      <TableRow key={student.user_id} hover selected={isChecked}>
                        <TableCell
                          padding="checkbox"
                          sx={{
                            ...(!isMobile && { position: 'sticky', left: 0, zIndex: 2 }),
                            bgcolor: theme.palette.background.paper,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            onChange={() => toggleRowSelection(student.user_id)}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            width: SN_WIDTH,
                            ...(!isMobile && { position: 'sticky', left: CHECK_WIDTH, zIndex: 2 }),
                            bgcolor: theme.palette.background.paper,
                            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                          }}
                        >
                          {isSaving ? (
                            <CircularProgress size={14} />
                          ) : (
                            page * rowsPerPage + index + 1
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            width: STUDENT_COL_WIDTH,
                            ...(!isMobile && {
                              position: 'sticky',
                              left: CHECK_WIDTH + SN_WIDTH,
                              zIndex: 2,
                            }),
                            bgcolor: theme.palette.background.paper,
                            borderRight: `2px solid ${isDark ? 'rgba(255,255,255,0.18)' : '#e2e8f0'}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={student.avatar}
                              sx={{ width: 32, height: 32, flexShrink: 0 }}
                            >
                              <PersonOutlineIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.25,
                                  color: '#0F172A',
                                }}
                              >
                                {student.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.admission_no}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {categories.map((cat) => (
                          <TableCell key={cat.id} align="center">
                            <Tooltip title={`Place ${student.full_name} in ${cat.name}`}>
                              <span>
                                <Radio
                                  size="small"
                                  checked={student.bursary_payment_category_id === cat.id}
                                  disabled={isSaving}
                                  onChange={() => handleSelectCategory(student, cat)}
                                  sx={{ p: 0.5 }}
                                />
                              </span>
                            </Tooltip>
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <CurrentPlacementBadge
                            student={student}
                            category={categories.find(
                              (c) => c.id === student.bursary_payment_category_id,
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {canScrollRight && !loading && hasFetched && paginatedStudents.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 36,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                background: isDark
                  ? 'linear-gradient(to right, transparent, rgba(15,23,42,0.85))'
                  : 'linear-gradient(to right, transparent, rgba(255,255,255,0.95))',
              }}
            >
              <ChevronRightIcon sx={{ color: 'text.secondary', mr: 0.25 }} />
            </Box>
          )}
        </Box>

        {hasFetched && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Checkbox
                  size="small"
                  checked={isAllPageSelected}
                  indeterminate={isSomePageSelected}
                  onChange={toggleSelectAllOnPage}
                  disabled={paginatedStudents.length === 0}
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedRows.size} student(s) selected
                </Typography>
                <TextField
                  select
                  size="small"
                  label="Assign category"
                  value={bulkRowCategoryId}
                  onChange={(e) => setBulkRowCategoryId(e.target.value)}
                  sx={{ minWidth: 180 }}
                  disabled={selectedRows.size === 0}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBulkRowAssign}
                  disabled={selectedRows.size === 0 || !bulkRowCategoryId || bulkAssigning}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleOpenClearPlacement}
                  disabled={selectedRows.size === 0 || clearing}
                >
                  Clear placement
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  select
                  size="small"
                  label="Rows per page"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  sx={{ minWidth: 110 }}
                >
                  {[10, 20, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="body2" color="text.secondary">
                  {rangeFrom}–{rangeTo} of {filteredStudents.length}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12.5px',
                    fontWeight: 700,
                  }}
                >
                  {page + 1}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <CategoryRemapModal
        open={Boolean(remapTarget)}
        target={remapTarget}
        sessionTermId={sessionTermId}
        categories={categories}
        onClose={() => setRemapTarget(null)}
        onSuccess={() => {
          setRemapTarget(null);
          loadStudents();
        }}
      />

      <Dialog
        open={Boolean(placementConfirm)}
        onClose={() => setPlacementConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Placement</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Place <strong>{placementConfirm?.student.full_name}</strong> in{' '}
            <strong>{placementConfirm?.category.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPlacementConfirm(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPlacement}>
            Yes, place
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(bulkConfirm)}
        onClose={() => setBulkConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Place Students?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Place <strong>{bulkConfirm?.eligible.length}</strong> student(s) into{' '}
            <strong>{bulkConfirm?.category.name}</strong>?
          </Typography>
          {bulkConfirm?.skipped.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid #f57c00',
                bgcolor: isDark ? 'rgba(245,124,0,0.15)' : '#fff3e0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#e65100', mb: 0.5 }}>
                {bulkConfirm.skipped.length} student(s) will be SKIPPED — already have approved
                payments
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#ffb74d' : '#7a3e00', mb: 1 }}>
                They can&apos;t be moved automatically. Click a name below to review and move them
                individually instead:
              </Typography>
              <List
                dense
                disablePadding
                sx={{ bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRadius: 1 }}
              >
                {bulkConfirm.skipped.map((student) => (
                  <ListItemButton
                    key={student.user_id}
                    onClick={() => handleRemapFromBulkSkip(student, bulkConfirm.category)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={student.full_name}
                      secondary={student.admission_no}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBulkConfirm(null)} disabled={bulkAssigning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBulkAssign}
            disabled={bulkAssigning}
            startIcon={bulkAssigning ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {bulkAssigning ? 'Placing...' : 'Yes, place'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(clearConfirm)}
        onClose={() => setClearConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clear Placement?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Revert <strong>{clearConfirm?.eligible.length}</strong> student(s) back to Needs Placement?
          </Typography>
          {clearConfirm?.skipped.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid #f57c00',
                bgcolor: isDark ? 'rgba(245,124,0,0.15)' : '#fff3e0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#e65100', mb: 0.5 }}>
                {clearConfirm.skipped.length} student(s) will be SKIPPED — already have approved
                payments
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#ffb74d' : '#7a3e00' }}>
                A student with approved payments can&apos;t be cleared automatically — reassign their
                payments first if their category needs to change.
              </Typography>
              <List
                dense
                disablePadding
                sx={{ mt: 1, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRadius: 1 }}
              >
                {clearConfirm.skipped.map((student) => (
                  <ListItemText
                    key={student.user_id}
                    sx={{ px: 1.5, py: 0.5 }}
                    primary={student.full_name}
                    secondary={student.admission_no}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setClearConfirm(null)} disabled={clearing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmClearPlacement}
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {clearing ? 'Clearing...' : 'Yes, clear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(migrateState)}
        onClose={() => setMigrateState(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Migrate from Last Term?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Copy category placement from{' '}
            <strong>{migrateState?.previous_term?.session_name}</strong> –{' '}
            <strong>{migrateState?.previous_term?.term_name}</strong> for{' '}
            <strong>{migrateState?.eligible.length}</strong> not-yet-placed student(s)?
          </Typography>
          {migrateGroups.length > 0 && (
            <List dense disablePadding sx={{ mb: 1.5 }}>
              {migrateGroups.map((g) => (
                <ListItemText key={g.name} primary={`${g.count} student(s) → ${g.name}`} />
              ))}
            </List>
          )}
          {migrateState?.skipped.length > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '2px solid #f57c00',
                bgcolor: isDark ? 'rgba(245,124,0,0.15)' : '#fff3e0',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#e65100', mb: 0.5 }}>
                {migrateState.skipped.length} student(s) will be SKIPPED — already have approved
                payments this term
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#ffb74d' : '#7a3e00' }}>
                They can&apos;t be migrated automatically — use the remap flow for them individually
                instead.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setMigrateState(null)} disabled={migrating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmMigrate}
            disabled={migrating || migrateState?.eligible.length === 0}
            startIcon={migrating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {migrating ? 'Migrating...' : 'Yes, migrate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportFile(null);
          setImportResult(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Import CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export the current roster first, edit the Category column, then upload it here. Rows for
            students who already have approved payments this term are skipped.
          </Typography>
          <Box
            onClick={() => importInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: importFile ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 32, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {importFile ? importFile.name : 'Click to select a .csv file'}
            </Typography>
          </Box>
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={handleImportFileChange}
          />

          {importing && <CircularProgress size={20} sx={{ mt: 2 }} />}

          {importResult && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={importResult.updated > 0 ? 'success' : 'warning'} sx={{ mb: 1 }}>
                {importResult.updated} student(s) updated
              </Alert>
              {importResult.skipped_has_payments?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {importResult.skipped_has_payments.length} skipped — already have approved
                  payments
                </Alert>
              )}
              {importResult.not_found?.length > 0 && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {importResult.not_found.length} admission number(s) not found this term
                </Alert>
              )}
              {importResult.unknown_category?.length > 0 && (
                <Alert severity="error">
                  {importResult.unknown_category.length} row(s) had an unknown category
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => {
              setImportOpen(false);
              setImportFile(null);
              setImportResult(null);
            }}
          >
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={handleImportUpload}
            disabled={!importFile || importing}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCategoryPlacementTab;
