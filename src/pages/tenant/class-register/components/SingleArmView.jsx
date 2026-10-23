import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
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
  Checkbox,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Menu,
  TablePagination,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FileDownload as ExportIcon,
  VisibilityOutlined as ViewDetailIcon,
  SwapHoriz as ChangeClassIcon,
  PersonRemove as RemoveClassIcon,
  ManageAccounts as StatusIcon,
  PersonAdd as AddIcon,
  SentimentVerySatisfied as BehaviourGoodIcon,
  SentimentSatisfied as BehaviourOkIcon,
  SentimentDissatisfied as BehaviourPoorIcon,
  HelpOutline as BehaviourUnknownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import tenantApi from '@/api/tenant/tenant_api';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNotification } from '@/hooks/useNotification';
import StudentDetailModal from './StudentDetailModal';
import ChangeClassModal from './ChangeClassModal';
import AddToClassModal from './AddToClassModal';
import ClassExplorerSidebar from './ClassExplorerSidebar';
import ClassArmStatCards from './ClassArmStatCards';
import ClassArmInsightsSidebar from './ClassArmInsightsSidebar';
import NeedsAttentionModal from './NeedsAttentionModal';

const STATUS_OPTIONS = [
  { value: 'student', label: 'Student', color: 'success' },
  { value: 'graduate', label: 'Graduated', color: 'info' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'warning' },
  { value: 'absconded', label: 'Absconded', color: 'error' },
  { value: 'suspended', label: 'Suspended', color: 'warning' },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || {
    value: status,
    label: status || 'Unknown',
    color: 'default',
  };

const behaviourMeta = (label) => {
  switch (label) {
    case 'Excellent':
      return { icon: <BehaviourGoodIcon fontSize="small" />, color: '#16A34A' };
    case 'Very Good':
      return { icon: <BehaviourGoodIcon fontSize="small" />, color: '#2563EB' };
    case 'Good':
      return { icon: <BehaviourOkIcon fontSize="small" />, color: '#0891B2' };
    case 'Fair':
      return { icon: <BehaviourOkIcon fontSize="small" />, color: '#D97706' };
    case 'Needs Support':
      return { icon: <BehaviourPoorIcon fontSize="small" />, color: '#DC2626' };
    default:
      return { icon: <BehaviourUnknownIcon fontSize="small" />, color: '#9CA3AF' };
  }
};

const RowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="rounded" width={18} height={18} />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width={20} />
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Box>
          <Skeleton variant="text" width={140} height={20} />
          <Skeleton variant="text" width={80} height={14} />
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Skeleton variant="rounded" width={90} height={18} />
    </TableCell>
    <TableCell>
      <Skeleton variant="rounded" width={90} height={18} />
    </TableCell>
    <TableCell>
      <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: '12px' }} />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width={90} height={20} />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width={110} height={20} />
    </TableCell>
    <TableCell align="right">
      <Skeleton variant="circular" width={26} height={26} sx={{ ml: 'auto' }} />
    </TableCell>
  </TableRow>
);

/**
 * Single Arm View — redesigned per the CEO's mockup and the follow-up
 * session with him:
 *  - class_teacher: no filters at all (class_teachers is scoped per ARM —
 *    see TeacherScopeService::myClassArmIds() on the backend); if assigned
 *    one arm it's auto-selected, if several they get a flat "My Classes"
 *    picker instead of the full admin Class Explorer.
 *  - school_admin/super_admin: the full Class Explorer (programme -> class
 *    tree) plus Session/Term/Programme/Gender/Status/Profile Status
 *    filters, all in one row right after the stat cards.
 */
const SingleArmView = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const { roles } = useTenantAuth();
  const isClassTeacher =
    Array.isArray(roles) &&
    roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'class_teacher');
  const isAdmin =
    Array.isArray(roles) &&
    roles.some((r) =>
      ['super_admin', 'school_admin'].includes(typeof r === 'string' ? r : r?.name),
    );

  // ── Teacher mode: resolve assigned arms once ──────────────
  const [teacherArms, setTeacherArms] = useState([]);
  const [teacherArmsLoaded, setTeacherArmsLoaded] = useState(false);

  useEffect(() => {
    if (!isClassTeacher) return;
    tenantApi
      .get('/allocations/my-allocations')
      .then((res) => {
        if (res.data?.status) {
          const arms = (res.data.data?.class_allocations || []).map((a) => ({
            class_arm_id: a.class_arm_id,
            class_name: a.class_name,
            class_arm_names: a.class_arm_names,
            student_count: a.student_count,
          }));
          setTeacherArms(arms);
        }
      })
      .catch((err) => console.error('Failed to load my allocations:', err))
      .finally(() => setTeacherArmsLoaded(true));
  }, [isClassTeacher]);

  // ── Admin mode: Session/Term/Programme/Class/Arm resolution ──
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [saSession, setSaSession] = useState('');
  const [saTerm, setSaTerm] = useState('');
  const [saProgramme, setSaProgramme] = useState('');
  const [saClass, setSaClass] = useState('');
  const [className, setClassName] = useState('');
  const [programmeName, setProgrammeName] = useState('');
  const [arms, setArms] = useState([]);
  const [saArm, setSaArm] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([fetchSessions(), fetchProgrammes(), fetchActiveTenantSessionTerm()])
      .then(([sessRes, progRes, activeRes]) => {
        const sessionsData = Array.isArray(sessRes.data?.data || sessRes.data)
          ? sessRes.data?.data || sessRes.data
          : [];
        const programmesData = Array.isArray(progRes.data?.data || progRes.data)
          ? progRes.data?.data || progRes.data
          : [];
        setSessions(sessionsData);
        setProgrammes(programmesData);

        const activeSessionTerm = activeRes?.status ? activeRes.data : null;
        const defaultSession =
          (activeSessionTerm && sessionsData.find((s) => s.id === activeSessionTerm.session_id)) ||
          sessionsData[0];
        if (defaultSession) setSaSession(defaultSession.id);
        if (activeSessionTerm?.term_id) setSaTerm(activeSessionTerm.term_id);
      })
      .catch((err) => console.error('Failed to load filter data:', err));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !saSession) return;
    fetchTerms(saSession)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setTerms(data);
        if (!saTerm && data.length) setSaTerm(data[0].id);
      })
      .catch((err) => console.error('Failed to load terms:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, saSession]);

  // Class Explorer's data — lifted up here (rather than fetched inside the
  // sidebar) so the Programme filter dropdown and the Explorer's own
  // programme narrowing share one source of truth (saProgramme), and so we
  // can auto-select the first programme/class/arm once this loads instead
  // of leaving the whole page on skeletons until the admin clicks something.
  const [breakdown, setBreakdown] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingBreakdown(true);
    classRegisterApi
      .getClassEnrollmentBreakdown()
      .then((res) => {
        if (res.data?.status) {
          setBreakdown(res.data.data || []);
        }
      })
      .catch((err) => console.error('Failed to load class explorer:', err))
      .finally(() => setLoadingBreakdown(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || autoSelected || breakdown.length === 0) return;
    const first = breakdown[0];
    setAutoSelected(true);
    handleSelectClass(
      first.class_id,
      first.programme_id,
      first.class_display_name,
      first.programme_name,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, autoSelected, breakdown]);

  const handleSelectClass = (classId, programmeId, resolvedClassName, resolvedProgrammeName) => {
    setSaClass(classId);
    setSaProgramme(programmeId);
    setClassName(resolvedClassName || '');
    setProgrammeName(resolvedProgrammeName || '');
    setSaArm('');
    setSaPage(0);
  };

  const handleSelectTeacherArm = (arm) => {
    setSaArm(arm.class_arm_id);
    setClassName(`${arm.class_name} (${arm.class_arm_names})`);
    setSaPage(0);
  };

  // Changing the Programme filter directly (not via picking a class in the
  // Explorer) jumps straight to that programme's first class/arm, so the
  // page never sits on stale data from the previous programme.
  const handleProgrammeChange = (programmeId) => {
    if (!programmeId) {
      setSaProgramme('');
      return;
    }
    const first = breakdown.find((c) => c.programme_id === programmeId);
    if (first) {
      handleSelectClass(
        first.class_id,
        first.programme_id,
        first.class_display_name,
        first.programme_name,
      );
    } else {
      setSaProgramme(programmeId);
    }
  };

  // Admin: arms for the selected class, drives the header's arm-switcher.
  useEffect(() => {
    if (!isAdmin || !saClass) {
      if (isAdmin) setArms([]);
      return;
    }
    fetchClassArmsByClass(saClass, saProgramme ? { programme_id: saProgramme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setArms(data);
        if (data.length > 0) setSaArm(data[0].id);
      })
      .catch((err) => console.error('Failed to load class arms:', err));
  }, [isAdmin, saClass, saProgramme]);

  // Teacher: auto-select the only arm, or the first one until they pick.
  useEffect(() => {
    if (!isClassTeacher || !teacherArmsLoaded) return;
    if (teacherArms.length === 1) {
      handleSelectTeacherArm(teacherArms[0]);
    } else if (teacherArms.length > 1 && !saArm) {
      handleSelectTeacherArm(teacherArms[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClassTeacher, teacherArmsLoaded, teacherArms]);

  // ── Table state ──────────────────────────────────────────
  const [tableSearch, setTableSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [profileStatusFilter, setProfileStatusFilter] = useState('');

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [meta, setMeta] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const [saPage, setSaPage] = useState(0);
  const [saRowsPerPage, setSaRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [changeClassModalOpen, setChangeClassModalOpen] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(false);

  const [addToClassModalOpen, setAddToClassModalOpen] = useState(false);
  const [needsAttentionOpen, setNeedsAttentionOpen] = useState(false);

  const sessionTermId = overview?.session_term?.id || null;

  // Guards against out-of-order responses: switching Programme/Class/Arm
  // fires a new request before the previous one resolves, and without this
  // a slow stale response could land AFTER the fresh one and overwrite it
  // with the wrong class's data — exactly the "stale data on switch" bug.
  const overviewRequestRef = useRef(0);
  const studentsRequestRef = useRef(0);

  const fetchOverview = useCallback(() => {
    if (!saArm) {
      setOverview(null);
      return;
    }
    const requestId = ++overviewRequestRef.current;
    setLoadingOverview(true);
    classRegisterApi
      .getClassArmOverview({
        class_arm_id: saArm,
        session_term_id: isAdmin ? saTerm || null : null,
      })
      .then((res) => {
        if (requestId !== overviewRequestRef.current) return;
        if (res.data?.status) {
          setOverview(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load class arm overview:', err))
      .finally(() => {
        if (requestId === overviewRequestRef.current) setLoadingOverview(false);
      });
  }, [saArm, saTerm, isAdmin]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const fetchStudents = useCallback(
    async (overrides = {}) => {
      const effectivePage = overrides.page !== undefined ? overrides.page : saPage;
      const effectiveSearch = overrides.search !== undefined ? overrides.search : tableSearch;

      if (!saArm) return;

      const requestId = ++studentsRequestRef.current;
      setLoadingStudents(true);
      try {
        const res = await classRegisterApi.getStudentsByClass(saClass || 'all', saArm, {
          page: effectivePage + 1,
          per_page: saRowsPerPage,
          programme_id: saProgramme || null,
          session_term_id: isAdmin ? saTerm || null : null,
          search: effectiveSearch || null,
          gender: genderFilter || null,
          status: statusFilter || null,
          profile_status: profileStatusFilter || null,
        });
        if (requestId !== studentsRequestRef.current) return;
        if (res.data?.status && res.data?.data) {
          setStudents(res.data.data);
          setMeta(res.data.meta);
          setSelectedIds([]);
        }
      } catch (error) {
        if (requestId !== studentsRequestRef.current) return;
        console.error('Failed to fetch students:', error);
        setStudents([]);
      } finally {
        if (requestId === studentsRequestRef.current) setLoadingStudents(false);
      }
    },
    [
      saClass,
      saProgramme,
      saArm,
      saTerm,
      isAdmin,
      saPage,
      saRowsPerPage,
      tableSearch,
      genderFilter,
      statusFilter,
      profileStatusFilter,
    ],
  );

  useEffect(() => {
    if (saPage === 0) {
      fetchStudents();
    } else {
      setSaPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saArm, saTerm, genderFilter, statusFilter, profileStatusFilter]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saPage, saRowsPerPage, tableSearch]);

  // Debounced live search (lodash/debounce, not a hand-rolled setTimeout).
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setTableSearch(value);
        setSaPage(0);
      }, 400),
    [],
  );
  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const refetchAll = useCallback(() => {
    fetchStudents();
    fetchOverview();
  }, [fetchStudents, fetchOverview]);

  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenDetail = (row) => {
    handleMenuClose();
    setSelectedRow(row);
    setDetailModalOpen(true);
  };
  const handleOpenChangeClass = () => {
    handleMenuClose();
    setChangeClassModalOpen(true);
  };
  const handleOpenStatusModal = () => {
    setSelectedStatus(selectedRow?.status || 'student');
    handleMenuClose();
    setStatusModalOpen(true);
  };
  const handleOpenRemoveModal = () => {
    handleMenuClose();
    setRemoveModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedRow || !selectedStatus) return;
    setSavingStatus(true);
    try {
      await classRegisterApi.updateStudentStatus(
        selectedRow.student_registration_id,
        selectedStatus,
      );
      notify.success('Student status updated successfully');
      setStudents((prev) =>
        prev.map((s) =>
          s.student_registration_id === selectedRow.student_registration_id
            ? { ...s, status: selectedStatus }
            : s,
        ),
      );
      setStatusModalOpen(false);
      refetchAll();
    } catch {
      notify.error('Failed to update student status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedRow) return;
    setRemovingStudent(true);
    try {
      await classRegisterApi.removeFromClass(selectedRow.student_registration_id);
      notify.success(`${selectedRow.name} removed from class`);
      setStudents((prev) =>
        prev.filter((s) => s.student_registration_id !== selectedRow.student_registration_id),
      );
      setRemoveModalOpen(false);
      refetchAll();
    } catch {
      notify.error('Failed to remove student from class');
    } finally {
      setRemovingStudent(false);
    }
  };

  const exportParams = () => ({
    class_arm_id: saArm || null,
    class_id: saClass || null,
    programme_id: saProgramme || null,
    session_term_id: sessionTermId,
  });

  const handleExportPdf = async () => {
    try {
      const res = await classRegisterApi.exportStudentListPdf(exportParams());
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_list.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Student list exported as PDF');
    } catch {
      notify.error('Failed to export PDF');
    }
  };

  const handlePrintNameTags = async () => {
    if (!saArm) {
      notify.warning('Select a class arm first');
      return;
    }
    try {
      const res = await classRegisterApi.exportNameTagsPdf({
        class_arm_id: saArm,
        session_term_id: sessionTermId,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'name_tags.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Name tags exported');
    } catch {
      notify.error('Failed to export name tags');
    }
  };

  const toggleSelectAll = (checked) =>
    setSelectedIds(checked ? students.map((s) => s.student_registration_id) : []);
  const toggleSelectOne = (id, checked) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const headerTitle =
    overview?.class_arm?.class_name && overview?.class_arm?.arm_name
      ? `${overview.class_arm.class_name} – ${overview.class_arm.arm_name} Arm`
      : className || 'Select a Class';

  const subtitleParts = [
    overview?.session_term?.session_name,
    overview?.session_term?.term_name,
    overview?.class_arm?.programme_name || programmeName,
    overview ? `${overview.stats.total_students} students` : null,
  ].filter(Boolean);

  return (
    <Box>
      {/* ── Header: title + arm switcher, search bar, Add Student ── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'center' }}
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800} noWrap>
            {headerTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitleParts.length
              ? subtitleParts.join(' • ')
              : isClassTeacher
                ? 'Loading your classes…'
                : 'Pick a class from Class Explorer to get started'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddToClassModalOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Student
          </Button>
        </Stack>
      </Stack>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <ClassArmStatCards
        stats={overview?.stats}
        loading={loadingOverview}
        onNeedAttentionClick={() => setNeedsAttentionOpen(true)}
      />

      {/* ── Filter row — Session/Term/Programme/Arm/Gender/Status/Profile
          Status for admins only (class teachers have nothing to filter),
          Search always last so it reads as "narrow further within these
          filters" rather than a separate control. ── */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1.5 }}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
      >
        {isAdmin && (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Session</InputLabel>
              <Select
                value={saSession}
                label="Session"
                onChange={(e) => setSaSession(e.target.value)}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.session_name || s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Term</InputLabel>
              <Select value={saTerm} label="Term" onChange={(e) => setSaTerm(e.target.value)}>
                {terms.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Programme</InputLabel>
              <Select
                value={saProgramme}
                label="Programme"
                onChange={(e) => handleProgrammeChange(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {programmes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.programme_name || p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {arms.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Arm</InputLabel>
                <Select
                  value={saArm}
                  label="Arm"
                  onChange={(e) => {
                    setSaArm(e.target.value);
                    setSaPage(0);
                  }}
                >
                  {arms.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.class_arm_names}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={genderFilter}
                label="Gender"
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Profile Status</InputLabel>
              <Select
                value={profileStatusFilter}
                label="Profile Status"
                onChange={(e) => setProfileStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
                <MenuItem value="Incomplete">Incomplete</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          size="small"
          placeholder="Search students by name, admission no..."
          value={searchInput}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          sx={{ flex: '1 1 240px', minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* ── Body ────────────────────────────────────────────── */}
      <Grid container spacing={1}>
        {(isAdmin || teacherArms.length > 1) && (
          <Grid size={{ xs: 12, md: isAdmin ? 2.2 : 2 }}>
            {isAdmin ? (
              <ClassExplorerSidebar
                mode="admin"
                breakdown={breakdown}
                loading={loadingBreakdown}
                programmeFilter={saProgramme}
                onProgrammeFilterChange={handleProgrammeChange}
                selectedClassId={saClass}
                onSelectClass={handleSelectClass}
              />
            ) : (
              <ClassExplorerSidebar
                mode="teacher"
                teacherArms={teacherArms}
                selectedArmId={saArm}
                onSelectTeacherArm={handleSelectTeacherArm}
              />
            )}
          </Grid>
        )}

        <Grid size={{ xs: 12, md: isAdmin || teacherArms.length > 1 ? 7 : 9 }}>
          <TableContainer
            sx={{
              borderRadius: 2,
              overflowX: 'auto',
              border: '2px solid',
              borderColor: '#94A3B8',
            }}
          >
            <Table size="small" sx={{ minWidth: 820 }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      indeterminate={selectedIds.length > 0 && selectedIds.length < students.length}
                      checked={students.length > 0 && selectedIds.length === students.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Attendance (This Term)</TableCell>
                  <TableCell>Last Test Average</TableCell>
                  <TableCell>Profile Status</TableCell>
                  {/* <TableCell>Behaviour</TableCell> */}
                  <TableCell>Parent/Guardian</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingStudents ? (
                  Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center' }}>
                        {!saArm
                          ? isClassTeacher
                            ? 'Loading your assigned class…'
                            : 'Select a class from Class Explorer to view students.'
                          : tableSearch
                            ? `No students match "${tableSearch}".`
                            : 'No students found for the selected filters.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => {
                    const statusCfg = getStatusConfig(student.status);
                    const beh = behaviourMeta(student.behaviour_label);
                    const isMale = student.gender?.toUpperCase() === 'MALE';
                    return (
                      <TableRow
                        key={student.student_registration_id || index}
                        hover
                        selected={selectedIds.includes(student.student_registration_id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selectedIds.includes(student.student_registration_id)}
                            onChange={(e) =>
                              toggleSelectOne(student.student_registration_id, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {(meta?.current_page - 1) * meta?.per_page + index + 1}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                              src={student.avatar}
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                fontWeight: 700,
                              }}
                            >
                              {(student.name || '?').charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={0.6}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {student.name}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.6rem',
                                    flexShrink: 0,
                                    bgcolor: isMale ? 'info.light' : 'success.light',
                                    color: isMale ? 'info.main' : 'success.main',
                                  }}
                                >
                                  {isMale ? 'M' : 'F'}
                                </Box>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {student.admission_no}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {student.attendance_pct === null ||
                          student.attendance_pct === undefined ? (
                            <Typography variant="caption" color="text.disabled">
                              No data
                            </Typography>
                          ) : (
                            <Stack spacing={0.25} sx={{ minWidth: 90 }}>
                              <Typography variant="caption" fontWeight={700}>
                                {student.attendance_pct}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={student.attendance_pct}
                                sx={{
                                  height: 6,
                                  borderRadius: 4,
                                  bgcolor: '#F3F4F6',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: student.attendance_pct < 70 ? '#DC2626' : '#16A34A',
                                  },
                                }}
                              />
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.last_test_average === null ||
                          student.last_test_average === undefined ? (
                            <Typography variant="caption" color="text.disabled">
                              No data
                            </Typography>
                          ) : (
                            <Stack spacing={0.25} sx={{ minWidth: 90 }}>
                              <Typography variant="caption" fontWeight={700}>
                                {student.last_test_average}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={student.last_test_average}
                                sx={{
                                  height: 6,
                                  borderRadius: 4,
                                  bgcolor: '#F3F4F6',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' },
                                }}
                              />
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.profile_status}
                            size="small"
                            color={student.profile_status === 'Complete' ? 'success' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        {/* <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Box sx={{ color: beh.color, display: 'flex' }}>{beh.icon}</Box>
                            <Typography variant="caption" fontWeight={600}>
                              {student.behaviour_label || 'Not rated'}
                            </Typography>
                          </Stack>
                        </TableCell> */}
                        <TableCell>
                          {!student.guardians || student.guardians.length === 0 ? (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          ) : (
                            <Box sx={{ minWidth: 0 }}>
                              {student.guardians.slice(0, 1).map((g, i) => (
                                <Box key={i}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    fontWeight={500}
                                    fontSize="0.8rem"
                                  >
                                    {g.name || '—'}
                                    {g.relationship && (
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 0.5, fontStyle: 'italic' }}
                                      >
                                        ({g.relationship})
                                      </Typography>
                                    )}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {g.phone || g.email || '—'}
                                  </Typography>
                                </Box>
                              ))}
                              {student.guardians.length > 1 && (
                                <Typography variant="caption" color="text.disabled">
                                  +{student.guardians.length - 1} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {meta && (
            <Box sx={{ pt: 1 }}>
              <TablePagination
                component="div"
                count={meta.total || 0}
                page={saPage}
                onPageChange={(_, newPage) => setSaPage(newPage)}
                rowsPerPage={saRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onRowsPerPageChange={(e) => {
                  setSaRowsPerPage(parseInt(e.target.value, 10));
                  setSaPage(0);
                }}
                labelRowsPerPage="Per page"
              />
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: isAdmin || teacherArms.length > 1 ? 2.8 : 3 }}>
          <ClassArmInsightsSidebar
            overview={overview}
            loading={loadingOverview}
            onViewAffectedStudents={() => setNeedsAttentionOpen(true)}
            onExportPdf={handleExportPdf}
            onIdentifyIncompleteProfiles={() => {
              setProfileStatusFilter('Incomplete');
              setSaPage(0);
            }}
            onSendMessageToGuardians={() => navigate('/communications')}
            onPrintNameTags={handlePrintNameTags}
            onViewBehaviourReports={() => navigate('/attendance-psychomotor?tab=mark-psychomotor')}
            onMarkAttendance={() => navigate('/attendance-psychomotor?tab=mark-attendance')}
            onMarkPsychomotor={() => navigate('/attendance-psychomotor?tab=mark-psychomotor')}
          />
        </Grid>
      </Grid>

      {/* ── Row-action menu ─────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleOpenDetail(selectedRow)}>
          <ViewDetailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          View Detail
        </MenuItem>
        <MenuItem onClick={handleOpenChangeClass}>
          <ChangeClassIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Class
        </MenuItem>
        <MenuItem onClick={handleOpenStatusModal}>
          <StatusIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1.5 }} />
          Change Status
        </MenuItem>
        <MenuItem onClick={handleOpenRemoveModal} sx={{ color: 'error.main' }}>
          <RemoveClassIcon fontSize="small" sx={{ mr: 1.5 }} />
          Remove from Class
        </MenuItem>
      </Menu>

      <Dialog
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusIcon color="primary" />
          Change Student Status
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Update status for{' '}
              <Typography component="span" fontWeight={700} color="primary">
                {selectedRow?.name}
              </Typography>
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModalOpen(false)} disabled={savingStatus}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveStatus} disabled={savingStatus}>
            {savingStatus ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove from Class</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 1 }}>
            Are you sure you want to remove <strong>{selectedRow?.name}</strong> from{' '}
            <strong>{selectedRow?.class_arm}</strong>? This will unassign them from their current
            class arm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveModalOpen(false)} disabled={removingStudent}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRemove}
            disabled={removingStudent}
          >
            {removingStudent ? 'Removing...' : 'Confirm Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <StudentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedRow}
      />
      <ChangeClassModal
        open={changeClassModalOpen}
        onClose={() => setChangeClassModalOpen(false)}
        student={selectedRow}
        onSuccess={refetchAll}
      />
      <AddToClassModal
        open={addToClassModalOpen}
        onClose={() => setAddToClassModalOpen(false)}
        onSuccess={refetchAll}
      />

      <NeedsAttentionModal
        open={needsAttentionOpen}
        onClose={() => setNeedsAttentionOpen(false)}
        classArmId={saArm}
        sessionTermId={sessionTermId}
        needsAttention={overview?.needs_attention}
        onViewStudent={(s) => {
          setNeedsAttentionOpen(false);
          handleOpenDetail(s);
        }}
      />
    </Box>
  );
};

export default SingleArmView;
