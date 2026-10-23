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
  Radio,
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
  TablePagination,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import tenantApi from '@/api/tenant/tenant_api';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { useNotification } from '@/hooks/useNotification';
import ClassExplorerSidebar from './ClassExplorerSidebar';
import MultiArmStatCards from './MultiArmStatCards';
import MultiArmInsightsSidebar from './MultiArmInsightsSidebar';

const STATUS_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'graduate', label: 'Graduated' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'absconded', label: 'Absconded' },
  { value: 'suspended', label: 'Suspended' },
];

const RowSkeleton = ({ armCount }) => (
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
      <Skeleton variant="rounded" width={70} height={22} />
    </TableCell>
    {Array.from({ length: armCount || 2 }).map((_, i) => (
      <TableCell key={i} align="center">
        <Skeleton variant="circular" width={22} height={22} sx={{ mx: 'auto' }} />
      </TableCell>
    ))}
  </TableRow>
);

/**
 * Multiple Arm View — redesigned to match the CEO's mockup and the same
 * conventions as Single Arm View: role-aware navigation (class_teacher gets
 * their own classes, no filters; admin gets the full Class Explorer +
 * Session/Term/Programme filters), stat cards, AI Insights/Needs
 * Attention/Quick Actions sidebar. Unlike the old version, every arm toggle
 * saves immediately (no "Submit Changes" step) — there's no Save button in
 * the new design.
 */
const MultipleArmView = ({ onEnrollmentChange }) => {
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

  // ── Teacher mode: resolve the classes they have any arm in ───
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherClassesLoaded, setTeacherClassesLoaded] = useState(false);

  useEffect(() => {
    if (!isClassTeacher) return;
    tenantApi
      .get('/allocations/my-allocations')
      .then((res) => {
        if (res.data?.status) {
          const byClass = new Map();
          (res.data.data?.class_allocations || []).forEach((a) => {
            if (!a.class_id) return;
            if (!byClass.has(a.class_id)) {
              byClass.set(a.class_id, {
                class_arm_id: a.class_arm_id,
                class_name: a.class_name,
                class_id: a.class_id,
                programme_id: a.programme_id,
                student_count: a.student_count,
              });
            }
          });
          setTeacherClasses(Array.from(byClass.values()));
        }
      })
      .catch((err) => console.error('Failed to load my allocations:', err))
      .finally(() => setTeacherClassesLoaded(true));
  }, [isClassTeacher]);

  // ── Admin mode: Session/Term/Programme + Class Explorer ──────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [saSession, setSaSession] = useState('');
  const [saTerm, setSaTerm] = useState('');
  const [saProgramme, setSaProgramme] = useState('');
  const [saClass, setSaClass] = useState('');
  const [className, setClassName] = useState('');

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

  const [breakdown, setBreakdown] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingBreakdown(true);
    classRegisterApi
      .getClassEnrollmentBreakdown()
      .then((res) => {
        if (res.data?.status) setBreakdown(res.data.data || []);
      })
      .catch((err) => console.error('Failed to load class explorer:', err))
      .finally(() => setLoadingBreakdown(false));
  }, [isAdmin]);

  const handleSelectClass = useCallback((classId, programmeId, resolvedClassName) => {
    setSaClass(classId);
    setSaProgramme(programmeId);
    setClassName(resolvedClassName || '');
    setMaPage(0);
  }, []);

  // Changing the Programme filter directly (not via picking a class in the
  // Explorer) jumps straight to that programme's first class, so the page
  // never sits on stale data from the previous programme while the admin
  // picks a class.
  const handleProgrammeChange = useCallback(
    (programmeId) => {
      setSaProgramme(programmeId);
      if (!programmeId) return;
      const first = breakdown.find((c) => c.programme_id === programmeId);
      if (first) {
        setSaClass(first.class_id);
        setClassName(first.class_display_name || '');
        setMaPage(0);
      }
    },
    [breakdown],
  );

  useEffect(() => {
    if (!isAdmin || autoSelected || breakdown.length === 0) return;
    const first = breakdown[0];
    setAutoSelected(true);
    handleSelectClass(first.class_id, first.programme_id, first.class_display_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, autoSelected, breakdown]);

  useEffect(() => {
    if (!isClassTeacher || !teacherClassesLoaded || saClass) return;
    if (teacherClasses.length > 0) {
      const first = teacherClasses[0];
      setSaClass(first.class_id);
      setSaProgramme(first.programme_id);
      setClassName(first.class_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClassTeacher, teacherClassesLoaded, teacherClasses, saClass]);

  // ── Overview (stats, arms, insights) ──────────────────────
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const sessionTermId = overview?.session_term?.id || null;

  // Guards against out-of-order responses: switching Programme/Class fires
  // a new request before the previous one resolves, and without this a
  // slow stale response could land AFTER the fresh one and overwrite it
  // with the wrong class's data — exactly the "stale data on switch" bug.
  const overviewRequestRef = useRef(0);
  const studentsRequestRef = useRef(0);

  const fetchOverview = useCallback(() => {
    if (!saClass) {
      setOverview(null);
      return;
    }
    const requestId = ++overviewRequestRef.current;
    setLoadingOverview(true);
    classRegisterApi
      .getClassMultiArmOverview({
        class_id: saClass,
        programme_id: saProgramme || null,
        session_term_id: isAdmin ? saTerm || null : null,
      })
      .then((res) => {
        if (requestId !== overviewRequestRef.current) return;
        if (res.data?.status) setOverview(res.data.data);
      })
      .catch((err) => console.error('Failed to load class overview:', err))
      .finally(() => {
        if (requestId === overviewRequestRef.current) setLoadingOverview(false);
      });
  }, [saClass, saProgramme, saTerm, isAdmin]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const arms = overview?.arms || [];

  // ── Table state ────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [meta, setMeta] = useState(null);
  const [maPage, setMaPage] = useState(0);
  const [maRowsPerPage, setMaRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [assigningId, setAssigningId] = useState(null);

  const [needsAttentionOpen, setNeedsAttentionOpen] = useState(false);
  const [autoAssignConfirmOpen, setAutoAssignConfirmOpen] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTargetArm, setMoveTargetArm] = useState('');
  const [moving, setMoving] = useState(false);

  const fetchStudents = useCallback(
    async (overrides = {}) => {
      const effectivePage = overrides.page !== undefined ? overrides.page : maPage;
      const effectiveSearch = overrides.search !== undefined ? overrides.search : search;
      if (!saClass) return;

      const requestId = ++studentsRequestRef.current;
      setLoadingStudents(true);
      try {
        const res = await classRegisterApi.getStudentsByClass(saClass, null, {
          page: effectivePage + 1,
          per_page: maRowsPerPage,
          programme_id: saProgramme || null,
          session_term_id: isAdmin ? saTerm || null : null,
          search: effectiveSearch || null,
          gender: genderFilter || null,
          status: statusFilter || null,
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
      saTerm,
      isAdmin,
      maPage,
      maRowsPerPage,
      search,
      genderFilter,
      statusFilter,
    ],
  );

  useEffect(() => {
    if (maPage === 0) {
      fetchStudents();
    } else {
      setMaPage(0);
    }
    // saProgramme must be a dependency here too, not just saClass — picking
    // a Programme whose "first class" happens to already be the selected
    // class leaves saClass unchanged (React bails out of a same-value
    // update), so without saProgramme in this list the programme_id filter
    // would silently never be re-applied to the student list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saClass, saProgramme, saTerm, genderFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maPage, maRowsPerPage, search]);

  // Debounced live search (lodash/debounce, not a hand-rolled setTimeout).
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
        setMaPage(0);
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
    if (onEnrollmentChange) onEnrollmentChange();
  }, [fetchStudents, fetchOverview, onEnrollmentChange]);

  // Immediate save on radio click — no batch "Submit Changes" step.
  const handleAssignArm = async (student, armId) => {
    if (student.class_arm_id === armId) return;
    setAssigningId(student.student_registration_id);
    const previousArm = student.class_arm_id;
    setStudents((prev) =>
      prev.map((s) =>
        s.student_registration_id === student.student_registration_id
          ? { ...s, class_arm_id: armId }
          : s,
      ),
    );
    try {
      await classRegisterApi.assignArm(student.student_registration_id, { class_arm_id: armId });
      notify.success(`${student.name} moved to ${arms.find((a) => a.id === armId)?.name || 'arm'}`);
      fetchOverview();
      if (onEnrollmentChange) onEnrollmentChange();
    } catch {
      notify.error('Failed to move student');
      setStudents((prev) =>
        prev.map((s) =>
          s.student_registration_id === student.student_registration_id
            ? { ...s, class_arm_id: previousArm }
            : s,
        ),
      );
    } finally {
      setAssigningId(null);
    }
  };

  const toggleSelectAll = (checked) =>
    setSelectedIds(checked ? students.map((s) => s.student_registration_id) : []);
  const toggleSelectOne = (id, checked) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  const exportParams = () => ({
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

  const handleExportExcel = async () => {
    try {
      const res = await classRegisterApi.exportStudentList(exportParams());
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Student list exported successfully');
    } catch {
      notify.error('Failed to export student list');
    }
  };

  const handlePrintNameTags = async () => {
    try {
      const params =
        selectedIds.length > 0
          ? { student_registration_ids: selectedIds, session_term_id: sessionTermId }
          : { class_id: saClass, session_term_id: sessionTermId };
      const res = await classRegisterApi.exportNameTagsPdf(params);
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

  const handleConfirmAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      await classRegisterApi.autoAssignArms({
        class_id: saClass,
        programme_id: saProgramme || null,
        session_term_id: sessionTermId,
      });
      notify.success('Students auto-assigned across arms');
      setAutoAssignConfirmOpen(false);
      refetchAll();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to auto-assign students');
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleConfirmMoveSelected = async () => {
    if (!moveTargetArm || selectedIds.length === 0) return;
    setMoving(true);
    try {
      const assignments = selectedIds.map((id) => ({
        student_registration_id: id,
        class_arm_id: Number(moveTargetArm),
      }));
      await classRegisterApi.bulkAssignArm({ assignments });
      notify.success(`${selectedIds.length} student(s) moved successfully`);
      setMoveModalOpen(false);
      setMoveTargetArm('');
      refetchAll();
    } catch {
      notify.error('Failed to move selected students');
    } finally {
      setMoving(false);
    }
  };

  const headerTitle = overview?.class?.class_name
    ? `${overview.class.class_name}${overview.class.programme_name ? ` (${overview.class.programme_name})` : ''} – Multiple Arm View`
    : className || 'Select a Class';
  const subtitleParts = [
    overview ? `${overview.stats.total_students} students` : null,
    arms.length ? `${arms.length} arms (${arms.map((a) => a.name).join(' & ')})` : null,
    overview ? `${overview.stats.unassigned_count} unassigned` : null,
  ].filter(Boolean);

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
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

      <MultiArmStatCards stats={overview?.stats} />

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
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={genderFilter}
                label="Gender"
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          size="small"
          placeholder="Search by name, admission no..."
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

      <Grid container spacing={1}>
        {(isAdmin || teacherClasses.length > 1) && (
          <Grid size={{ xs: 12, md: 2.2 }}>
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
                teacherArms={teacherClasses.map((c) => ({
                  class_arm_id: c.class_id,
                  class_name: c.class_name,
                  class_arm_names: '',
                  student_count: c.student_count,
                }))}
                selectedArmId={saClass}
                onSelectTeacherArm={(c) => handleSelectClass(c.class_arm_id, null, c.class_name)}
              />
            )}
          </Grid>
        )}

        <Grid size={{ xs: 12, md: isAdmin || teacherClasses.length > 1 ? 7 : 9 }}>
          <TableContainer
            sx={{
              borderRadius: 2,
              overflowX: 'auto',
              border: '2px solid',
              borderColor: '#94A3B8',
            }}
          >
            <Table size="small" sx={{ minWidth: 700 }} stickyHeader>
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
                  <TableCell>Current Arm</TableCell>
                  {arms.map((arm) => (
                    <TableCell key={arm.id} align="center">
                      <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
                        {arm.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {arm.count} students
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingStudents ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <RowSkeleton key={i} armCount={arms.length} />
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={arms.length + 4} align="center" sx={{ py: 4 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center' }}>
                        {!saClass
                          ? isClassTeacher
                            ? 'Loading your assigned classes…'
                            : 'Select a class from Class Explorer to view students.'
                          : search
                            ? `No students match "${search}".`
                            : 'No students found for the selected filters.'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => {
                    const isMale = student.gender?.toUpperCase() === 'MALE';
                    const currentArm = arms.find((a) => a.id === student.class_arm_id);
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
                          <Chip
                            label={currentArm?.name || 'Unassigned'}
                            size="small"
                            color={currentArm ? 'primary' : 'warning'}
                            variant={currentArm ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        {arms.map((arm) => (
                          <TableCell key={arm.id} align="center">
                            <Radio
                              size="small"
                              checked={student.class_arm_id === arm.id}
                              disabled={assigningId === student.student_registration_id}
                              onChange={() => handleAssignArm(student, arm.id)}
                            />
                          </TableCell>
                        ))}
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
                page={maPage}
                onPageChange={(_, newPage) => setMaPage(newPage)}
                rowsPerPage={maRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                onRowsPerPageChange={(e) => {
                  setMaRowsPerPage(parseInt(e.target.value, 10));
                  setMaPage(0);
                }}
                labelRowsPerPage="Per page"
              />
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: isAdmin || teacherClasses.length > 1 ? 2.8 : 3 }}>
          <MultiArmInsightsSidebar
            overview={overview}
            loading={loadingOverview}
            onViewAffectedStudents={() => setNeedsAttentionOpen(true)}
            onAutoAssign={() => setAutoAssignConfirmOpen(true)}
            onMoveSelected={() => {
              if (selectedIds.length === 0) {
                notify.warning('Select at least one student first');
                return;
              }
              setMoveModalOpen(true);
            }}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            onPrintNameTags={handlePrintNameTags}
            onMarkAttendance={() => navigate('/attendance-psychomotor?tab=mark-attendance')}
            onMarkPsychomotor={() => navigate('/attendance-psychomotor?tab=mark-psychomotor')}
          />
        </Grid>
      </Grid>

      {/* ── Needs Attention (unassigned students) ───────────── */}
      <Dialog
        open={needsAttentionOpen}
        onClose={() => setNeedsAttentionOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Students Not Assigned to Any Arm</DialogTitle>
        <DialogContent>
          <Alert
            severity={overview?.needs_attention?.unassigned_count ? 'warning' : 'success'}
            sx={{ mt: 1 }}
          >
            {overview?.needs_attention?.unassigned_count
              ? `${overview.needs_attention.unassigned_count} student(s) need an arm assigned.`
              : 'Every student in this class is already assigned to an arm.'}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNeedsAttentionOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Auto-assign confirmation — a real bulk mutation, so it gets a
          clear, explicit confirm step ───────────────────────────────── */}
      <Dialog
        open={autoAssignConfirmOpen}
        onClose={() => setAutoAssignConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Auto-assign Students?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 1 }}>
            This will re-distribute{' '}
            <strong>
              every student currently in {headerTitle.replace(' – Multiple Arm View', '')}
            </strong>{' '}
            evenly across its {arms.length} arms. Existing arm assignments will be overwritten. This
            cannot be undone automatically.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoAssignConfirmOpen(false)} disabled={autoAssigning}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmAutoAssign}
            disabled={autoAssigning}
          >
            {autoAssigning ? 'Assigning…' : 'Confirm Auto-assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Move selected students ───────────────────────────── */}
      <Dialog open={moveModalOpen} onClose={() => setMoveModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Move {selectedIds.length} Selected Student{selectedIds.length === 1 ? '' : 's'}
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Target Arm</InputLabel>
            <Select
              value={moveTargetArm}
              label="Target Arm"
              onChange={(e) => setMoveTargetArm(e.target.value)}
            >
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveModalOpen(false)} disabled={moving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmMoveSelected}
            disabled={moving || !moveTargetArm}
          >
            {moving ? 'Moving…' : 'Confirm Move'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultipleArmView;
