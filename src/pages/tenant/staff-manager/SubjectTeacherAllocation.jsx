import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Skeleton,
  Chip,
  Grid,
  Alert,
  Paper,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  TablePagination,
  Menu,
  Tooltip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  IconSearch,
  IconWand,
  IconDownload,
  IconUpload,
  IconCopy,
  IconDotsVertical,
  IconTrash,
  IconFilterOff,
  IconUsers,
  IconBook2,
  IconUserPlus,
  IconChevronDown,
} from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from '@/components/shared/StatCard';
import UploadStaffForm from './components/UploadStaffForm';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import { fetchProgrammes } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'assigned', label: 'Complete' },
  { value: 'partial', label: 'Partial' },
  { value: 'unassigned', label: 'Unassigned' },
];

const statusChipSx = (status) =>
  status === 'assigned'
    ? { bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }
    : status === 'partial'
      ? { bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }
      : { bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 600 };

const statusLabel = (status) =>
  status === 'assigned' ? 'Complete' : status === 'partial' ? 'Partial' : 'Unassigned';

const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const LOAD_BUCKETS = [
  { label: '1-2', min: 1, max: 2 },
  { label: '3-4', min: 3, max: 4 },
  { label: '5-6', min: 5, max: 6 },
  { label: '7-8', min: 7, max: 8 },
  { label: '9-10', min: 9, max: 10 },
  { label: '11+', min: 11, max: Infinity },
];

const SubjectTeacherAllocation = () => {
  const notify = useNotification();

  const [sessions, setSessions] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');

  // Left pane — Classes list
  const [classes, setClasses] = useState([]);
  const [teachersActive, setTeachersActive] = useState(0);
  const [classesLoading, setClassesLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [leftSearch, setLeftSearch] = useState('');
  const [leftStatusFilter, setLeftStatusFilter] = useState('all');
  const [leftPage, setLeftPage] = useState(0);
  const [leftRowsPerPage, setLeftRowsPerPage] = useState(10);

  // Right pane — selected class's subjects
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [rightSearch, setRightSearch] = useState('');
  const [rightPage, setRightPage] = useState(0);
  const [rightRowsPerPage, setRightRowsPerPage] = useState(10);

  // Staged (not-yet-saved) teacher picks — subject_id -> {user_id, name, staff_id}
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [saving, setSaving] = useState(false);

  // Teacher workload histogram — school-wide (not programme-scoped), since
  // it is drawn from the suggested-teachers ranking rather than a separate
  // per-programme query.
  const [workloadBuckets, setWorkloadBuckets] = useState([]);
  const [workloadLoading, setWorkloadLoading] = useState(false);

  // Inline teacher-picker popover
  const [popover, setPopover] = useState({ anchorEl: null, subjectId: null, excludingUserId: null });
  const [popoverSearch, setPopoverSearch] = useState('');
  const [popoverCandidates, setPopoverCandidates] = useState([]);
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [popoverExpanded, setPopoverExpanded] = useState(false);

  // Row action menu
  const [rowMenu, setRowMenu] = useState({ anchorEl: null, subject: null });
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Auto-Allocate / Copy From Class / Bulk Upload
  const [autoAllocateConfirmOpen, setAutoAllocateConfirmOpen] = useState(false);
  const [autoAllocating, setAutoAllocating] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState('');
  const [copying, setCopying] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    initData();
    fetchWorkload();
  }, []);

  const initData = async () => {
    try {
      const [sessionsRes, progsRes] = await Promise.all([
        fetchTenantSessions({ pagination: false }),
        fetchProgrammes(),
      ]);

      const allSessions = sessionsRes.data || [];
      setSessions(allSessions);

      const progs = progsRes.data || [];
      setProgrammes(progs);

      const activeSession = allSessions.find((s) => s.status === 'active') || allSessions[0];
      if (activeSession) {
        setSelectedSession(activeSession.id);
        await loadTermsForSession(activeSession.id);
      }

      if (progs.length > 0) {
        setSelectedProgramme(progs[0].id);
      }
    } catch (error) {
      notify.error('Failed to initialize data');
      console.error(error);
    }
  };

  const loadTermsForSession = async (sessionId) => {
    try {
      const termsRes = await fetchSessionTerms(sessionId);
      const terms = termsRes.data || [];
      setSessionTerms(terms);
      const activeTerm = terms.find((t) => t.status === 'active') || terms[0];
      setSelectedTerm(activeTerm ? activeTerm.id : '');
    } catch (error) {
      notify.error('Failed to fetch terms for the selected session');
    }
  };

  const handleSessionChange = async (sessionId) => {
    setSelectedSession(sessionId);
    setSelectedTerm('');
    setSessionTerms([]);
    if (sessionId) {
      await loadTermsForSession(sessionId);
    }
  };

  const fetchWorkload = async () => {
    setWorkloadLoading(true);
    try {
      const res = await allocationApi.getSuggestedSubjectTeachers({ limit: 500 });
      const all = res.data || [];
      const buckets = LOAD_BUCKETS.map((b) => ({
        ...b,
        count: all.filter((t) => t.subject_teacher_count >= b.min && t.subject_teacher_count <= b.max)
          .length,
      }));
      setWorkloadBuckets(buckets);
    } catch (error) {
      console.error(error);
    } finally {
      setWorkloadLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!selectedProgramme) {
      notify.error('Select a programme first');
      return;
    }
    setClassesLoading(true);
    setHasFetched(true);
    try {
      const res = await allocationApi.getSubjectAllocationClassesOverview({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm || undefined,
      });
      if (res.status) {
        setClasses(res.data.classes || []);
        setTeachersActive(res.data.teachers_active || 0);
      }
      setSelectedClass(null);
      setSubjects([]);
      setLeftPage(0);
    } catch (error) {
      notify.error('Failed to fetch classes');
      console.error(error);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchSubjects = async (classRow) => {
    const firstArmId = classRow.arms?.[0]?.id;
    if (!firstArmId) {
      setSubjects([]);
      return;
    }
    setSubjectsLoading(true);
    try {
      const res = await allocationApi.getSubjectTeacherAllocations({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm || undefined,
        class_arm_id: firstArmId,
      });
      setSubjects(res.data || []);
    } catch (error) {
      notify.error('Failed to fetch subjects for this class');
      console.error(error);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSelectClass = (row) => {
    setSelectedClass(row);
    setPendingAssignments({});
    setRightSearch('');
    setRightPage(0);
    fetchSubjects(row);
  };

  const handleResetFilters = () => {
    setLeftSearch('');
    setLeftStatusFilter('all');
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (leftStatusFilter !== 'all' && c.status !== leftStatusFilter) return false;
      if (leftSearch && !c.class_name.toLowerCase().includes(leftSearch.toLowerCase())) return false;
      return true;
    });
  }, [classes, leftSearch, leftStatusFilter]);

  const filteredSubjects = useMemo(() => {
    if (!rightSearch) return subjects;
    const q = rightSearch.toLowerCase();
    return subjects.filter((s) => {
      const pending = pendingAssignments[s.subject_id];
      const teacherName = pending ? pending.name : s.teacher_name;
      return (
        s.subject_name?.toLowerCase().includes(q) ||
        s.subject_code?.toLowerCase().includes(q) ||
        teacherName?.toLowerCase().includes(q)
      );
    });
  }, [subjects, rightSearch, pendingAssignments]);

  // ── Teacher picker popover ──────────────────────────────────────────
  const openPopover = (event, subject) => {
    const currentUserId = pendingAssignments[subject.subject_id]?.user_id ?? subject.teacher_id;
    setPopover({ anchorEl: event.currentTarget, subjectId: subject.subject_id, excludingUserId: currentUserId });
    setPopoverSearch('');
    setPopoverExpanded(false);
    loadPopoverCandidates(currentUserId, 8);
  };

  const closePopover = () => {
    setPopover({ anchorEl: null, subjectId: null, excludingUserId: null });
    setPopoverCandidates([]);
  };

  const loadPopoverCandidates = async (excludingUserId, limit) => {
    setPopoverLoading(true);
    try {
      const res = await allocationApi.getSuggestedSubjectTeachers({
        session_term_id: selectedTerm || undefined,
        excluding_user_id: excludingUserId || undefined,
        limit,
      });
      setPopoverCandidates(res.data || []);
    } catch (error) {
      notify.error('Failed to fetch suggested teachers');
    } finally {
      setPopoverLoading(false);
    }
  };

  const handleViewAllTeachers = () => {
    setPopoverExpanded(true);
    loadPopoverCandidates(null, 500);
  };

  const filteredPopoverCandidates = useMemo(() => {
    if (!popoverSearch) return popoverCandidates;
    const q = popoverSearch.toLowerCase();
    return popoverCandidates.filter((c) => c.name.toLowerCase().includes(q));
  }, [popoverCandidates, popoverSearch]);

  const handlePickTeacher = (subjectId, candidate) => {
    setPendingAssignments((prev) => ({
      ...prev,
      [subjectId]: { user_id: candidate.user_id, name: candidate.name, staff_id: candidate.staff_id, phone: candidate.phone },
    }));
    closePopover();
  };

  // ── Save ─────────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!selectedClass || !selectedTerm) return;
    const entries = Object.entries(pendingAssignments);
    if (entries.length === 0) {
      notify.error('No changes to save');
      return;
    }
    setSaving(true);
    try {
      const allocationsData = entries.map(([subjectId, pick]) => ({
        subject_id: subjectId,
        user_id: pick.user_id,
      }));
      const response = await allocationApi.saveSubjectTeacherAllocationsForClass({
        session_term_id: selectedTerm,
        programme_class_id: selectedClass.programme_class_id,
        allocations: allocationsData,
      });
      if (response.status) {
        notify.success('Subject teacher allocations saved successfully');
        setPendingAssignments({});
        fetchSubjects(selectedClass);
        fetchClasses();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save allocations');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ── Remove ───────────────────────────────────────────────────────────
  const handleOpenRowMenu = (event, subject) => {
    setRowMenu({ anchorEl: event.currentTarget, subject });
  };

  const handleCloseRowMenu = () => setRowMenu({ anchorEl: null, subject: null });

  const confirmRemoveAssignment = async () => {
    if (!rowMenu.subject || !selectedClass) return;
    setRemoving(true);
    try {
      const res = await allocationApi.removeSubjectTeacherAllocationForClass({
        programme_class_id: selectedClass.programme_class_id,
        subject_id: rowMenu.subject.subject_id,
        session_term_id: selectedTerm,
      });
      notify.success(res.message || 'Assignment removed');
      fetchSubjects(selectedClass);
      fetchClasses();
    } catch (error) {
      notify.error('Failed to remove assignment');
    } finally {
      setRemoving(false);
      setRemoveConfirmOpen(false);
      setRowMenu({ anchorEl: null, subject: null });
    }
  };

  // ── Auto-Allocate / Copy From Class / Template ──────────────────────
  const handleAutoAllocate = async () => {
    if (!selectedClass || !selectedTerm) return;
    setAutoAllocating(true);
    try {
      const response = await allocationApi.autoAllocateSubjectTeachers({
        programme_class_id: selectedClass.programme_class_id,
        session_term_id: selectedTerm,
      });
      if (response.status) {
        notify.success(response.message);
        fetchSubjects(selectedClass);
        fetchClasses();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to auto-allocate subject teachers');
    } finally {
      setAutoAllocating(false);
      setAutoAllocateConfirmOpen(false);
    }
  };

  const handleCopyFromClass = async () => {
    if (!selectedClass || !selectedTerm || !copySourceId) return;
    setCopying(true);
    try {
      const response = await allocationApi.copySubjectTeachersToClass({
        from_programme_class_id: copySourceId,
        to_programme_class_id: selectedClass.programme_class_id,
        session_term_id: selectedTerm,
      });
      if (response.status) {
        notify.success(response.message);
        fetchSubjects(selectedClass);
        fetchClasses();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to copy subject teachers');
    } finally {
      setCopying(false);
      setCopyModalOpen(false);
      setCopySourceId('');
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedClass) return;
    try {
      const res = await allocationApi.downloadSubjectTeacherTemplate({
        programme_id: selectedProgramme,
        programme_class_id: selectedClass.programme_class_id,
        session_term_id: selectedTerm || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'subject_teacher_allocation_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
    } catch (error) {
      notify.error('Failed to download template');
    }
  };

  const handleUploadTemplate = async (file) => {
    if (!selectedClass || !selectedTerm) {
      throw new Error('Select a class first');
    }
    const res = await allocationApi.uploadSubjectTeacherTemplate(
      file,
      selectedClass.programme_class_id,
      selectedTerm,
    );
    fetchSubjects(selectedClass);
    fetchClasses();
    return res?.message || 'Upload complete';
  };

  // ── Stat cards ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSlots = classes.reduce((sum, c) => sum + c.total_subjects, 0);
    const assignedSlots = classes.reduce((sum, c) => sum + c.assigned_count, 0);
    return {
      totalClasses: classes.length,
      totalSlots,
      assignedSlots,
      unassignedSlots: totalSlots - assignedSlots,
      assignedPct: totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0,
      teachersActive,
    };
  }, [classes, teachersActive]);

  const pagedClasses = filteredClasses.slice(
    leftPage * leftRowsPerPage,
    leftPage * leftRowsPerPage + leftRowsPerPage,
  );
  const pagedSubjects = filteredSubjects.slice(
    rightPage * rightRowsPerPage,
    rightPage * rightRowsPerPage + rightRowsPerPage,
  );

  const maxBucket = Math.max(1, ...workloadBuckets.map((b) => b.count));

  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 3,
      }}
    >
      {/* Stat Cards + Workload histogram */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {[
              { label: 'Classes', count: stats.totalClasses, icon: IconBook2, colorIndex: 0 },
              {
                label: 'Subject Slots',
                count: stats.totalSlots,
                icon: IconBook2,
                colorIndex: 2,
                subtitle: `${stats.totalClasses} classes`,
              },
              {
                label: 'Assigned',
                count: stats.assignedSlots,
                icon: IconUserPlus,
                colorIndex: 1,
                subtitle: `${stats.assignedPct}%`,
              },
              {
                label: 'Unassigned',
                count: stats.unassignedSlots,
                icon: IconUsers,
                colorIndex: 4,
                subtitle: stats.totalSlots > 0 ? `${100 - stats.assignedPct}%` : '0%',
              },
              { label: 'Teachers Active', count: stats.teachersActive, icon: IconUsers, colorIndex: 3 },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 6, md: 12 / 5 }}>
                <StatCard
                  loading={classesLoading && !hasFetched}
                  label={card.label}
                  count={card.count}
                  icon={card.icon}
                  colorIndex={card.colorIndex}
                  subtitle={card.subtitle}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Teacher Workload (school-wide)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 70, mt: 1 }}>
              {workloadLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" width="100%" height={40} />
                  ))
                : workloadBuckets.map((b) => (
                    <Tooltip key={b.label} title={`${b.count} teacher(s) with ${b.label} subject assignments`}>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: `${Math.max(6, (b.count / maxBucket) * 56)}px`,
                            bgcolor: 'primary.main',
                            borderRadius: '3px 3px 0 0',
                            opacity: 0.4 + 0.6 * (b.count / maxBucket),
                          }}
                        />
                        <Typography variant="caption" fontWeight={700} display="block">
                          {b.count}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {LOAD_BUCKETS.map((b) => (
                <Typography key={b.label} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
                  {b.label}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ color: '#000000', backgroundColor: '#FFFAE6', mb: 2 }}>
        Select a class from the list, then allocate a teacher to each of its subjects. One teacher
        is assigned per subject per class and applies across every arm of that class.
      </Alert>

      {/* Filters */}
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2, borderTop: '3px solid', borderTopColor: 'primary.main' }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select size="small" label="Session" value={selectedSession} onChange={(e) => handleSessionChange(e.target.value)} fullWidth>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select size="small" label="Term" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} fullWidth disabled={!selectedSession}>
              {sessionTerms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term?.term_name || t.term_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select size="small" label="Programme" value={selectedProgramme} onChange={(e) => setSelectedProgramme(e.target.value)} fullWidth>
              <MenuItem value="">Select Programme</MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select size="small" label="Status" value={leftStatusFilter} onChange={(e) => setLeftStatusFilter(e.target.value)} fullWidth>
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button variant="contained" size="small" fullWidth startIcon={<IconSearch size={16} />} onClick={fetchClasses} sx={{ height: '40px' }}>
              Fetch
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Button size="small" startIcon={<IconFilterOff size={16} />} onClick={handleResetFilters}>
            Reset
          </Button>
          <Tooltip title={selectedClass ? '' : 'Select a class first'}>
            <span>
              <Button size="small" variant="outlined" color="secondary" startIcon={<IconWand size={16} />} onClick={() => setAutoAllocateConfirmOpen(true)} disabled={!selectedClass || autoAllocating}>
                {autoAllocating ? 'Running…' : 'Auto-Allocate'}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedClass ? '' : 'Select a class first'}>
            <span>
              <Button size="small" variant="outlined" startIcon={<IconDownload size={16} />} onClick={handleDownloadTemplate} disabled={!selectedClass}>
                Export
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedClass ? '' : 'Select a class first'}>
            <span>
              <Button size="small" variant="outlined" startIcon={<IconUpload size={16} />} onClick={() => setUploadModalOpen(true)} disabled={!selectedClass}>
                Import
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedClass ? '' : 'Select a class first'}>
            <span>
              <Button size="small" variant="outlined" startIcon={<IconCopy size={16} />} onClick={() => setCopyModalOpen(true)} disabled={!selectedClass || classes.length < 2}>
                Copy from Class
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Master-detail layout */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        {/* Left: Classes list */}
        <Paper variant="outlined" sx={{ borderRadius: 2, width: { xs: '100%', lg: 340 }, flexShrink: 0 }}>
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography fontWeight={700}>Classes ({filteredClasses.length})</Typography>
            <TextField
              size="small"
              placeholder="Search class..."
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton variant="rounded" height={28} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pagedClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        {hasFetched ? 'No classes found' : 'Select a programme, then click Fetch'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedClasses.map((row, idx) => (
                    <TableRow
                      key={row.programme_class_id}
                      hover
                      selected={selectedClass?.programme_class_id === row.programme_class_id}
                      onClick={() => handleSelectClass(row)}
                      sx={{
                        cursor: 'pointer',
                        '&.Mui-selected': { bgcolor: 'rgba(37, 99, 235, 0.12)', borderLeft: '3px solid', borderLeftColor: 'primary.main' },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(37, 99, 235, 0.18)' },
                      }}
                    >
                      <TableCell>{leftPage * leftRowsPerPage + idx + 1}</TableCell>
                      <TableCell>{row.class_name}</TableCell>
                      <TableCell>
                        {row.assigned_count}/{row.total_subjects}
                      </TableCell>
                      <TableCell>
                        <Chip label={statusLabel(row.status)} size="small" sx={statusChipSx(row.status)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredClasses.length}
            page={leftPage}
            onPageChange={(e, p) => setLeftPage(p)}
            rowsPerPage={leftRowsPerPage}
            onRowsPerPageChange={(e) => {
              setLeftRowsPerPage(parseInt(e.target.value, 10));
              setLeftPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Paper>

        {/* Right: selected class's subjects */}
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {!selectedClass ? (
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Select a class from the list to allocate its subject teachers</Typography>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography fontWeight={700}>
                      {selectedClass.class_name} ({selectedClass.total_subjects} subjects)
                    </Typography>
                    <Chip label={statusLabel(selectedClass.status)} size="small" sx={statusChipSx(selectedClass.status)} />
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveChanges}
                    disabled={Object.keys(pendingAssignments).length === 0 || saving}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary">
                    Total Students: {selectedClass.student_count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Arms ({selectedClass.arms.length}): {selectedClass.arms.map((a) => a.name).join(', ')}
                  </Typography>
                </Stack>
                <TextField
                  size="small"
                  placeholder="Search subject or teacher..."
                  value={rightSearch}
                  onChange={(e) => setRightSearch(e.target.value)}
                  sx={{ mt: 1.5, width: { xs: '100%', sm: 320 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Teacher Assigned</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}>
                            <Skeleton variant="rounded" height={36} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : pagedSubjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary">
                            No subjects found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedSubjects.map((subject, idx) => {
                        const pending = pendingAssignments[subject.subject_id];
                        const displayName = pending ? pending.name : subject.teacher_name;
                        const displayStaffId = pending ? pending.staff_id : subject.staff_id;
                        const displayPhone = pending ? pending.phone : subject.teacher_phone;
                        const isAssigned = Boolean(pending ? pending.user_id : subject.teacher_id);

                        return (
                          <TableRow key={subject.subject_id} hover>
                            <TableCell>{rightPage * rightRowsPerPage + idx + 1}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {subject.subject_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {subject.subject_code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => openPopover(e, subject)}
                                endIcon={<IconChevronDown size={14} />}
                                sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                              >
                                {displayName ? (
                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: '#16A34A' }}>
                                      {initials(displayName)}
                                    </Avatar>
                                    <span>
                                      {displayName}
                                      {displayStaffId ? ` (${displayStaffId})` : ''}
                                      {pending ? ' *' : ''}
                                    </span>
                                  </Stack>
                                ) : (
                                  '+ Assign Teacher'
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>{displayPhone || '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={isAssigned ? 'Assigned' : 'Unassigned'}
                                size="small"
                                sx={isAssigned ? { bgcolor: '#DCFCE7', color: '#166534' } : { bgcolor: '#FEE2E2', color: '#991B1B' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={(e) => handleOpenRowMenu(e, subject)} disabled={!subject.teacher_id}>
                                <IconDotsVertical size={16} />
                              </IconButton>
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
                count={filteredSubjects.length}
                page={rightPage}
                onPageChange={(e, p) => setRightPage(p)}
                rowsPerPage={rightRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRightRowsPerPage(parseInt(e.target.value, 10));
                  setRightPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </Paper>
          )}
        </Box>
      </Stack>

      {/* Teacher picker popover */}
      <Popover
        open={Boolean(popover.anchorEl)}
        anchorEl={popover.anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ width: 300, p: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search teacher..."
            fullWidth
            autoFocus
            value={popoverSearch}
            onChange={(e) => setPopoverSearch(e.target.value)}
            sx={{ mb: 1 }}
          />
          {popoverLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={40} />
              ))}
            </Box>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {filteredPopoverCandidates.map((candidate) => (
                <ListItemButton
                  key={candidate.user_id}
                  onClick={() => handlePickTeacher(popover.subjectId, candidate)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar src={candidate.avatar} sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#16A34A' }}>
                      {initials(candidate.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={candidate.name}
                    secondary={`${candidate.subject_teacher_count} assignment${candidate.subject_teacher_count !== 1 ? 's' : ''}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
          {!popoverExpanded && (
            <Button size="small" fullWidth onClick={handleViewAllTeachers} sx={{ mt: 1 }}>
              View All Teachers
            </Button>
          )}
        </Box>
      </Popover>

      {/* Row action menu */}
      <Menu anchorEl={rowMenu.anchorEl} open={Boolean(rowMenu.anchorEl)} onClose={handleCloseRowMenu}>
        <MenuItem
          onClick={() => {
            setRemoveConfirmOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <IconTrash size={16} style={{ marginRight: 8 }} />
          Remove Assignment
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={removeConfirmOpen}
        onClose={() => {
          setRemoveConfirmOpen(false);
          setRowMenu({ anchorEl: null, subject: null });
        }}
        onConfirm={confirmRemoveAssignment}
        title="Remove Subject Teacher"
        message={`Remove the teacher assigned to ${rowMenu.subject?.subject_name || 'this subject'} across every arm of ${selectedClass?.class_name || 'this class'}?`}
        severity="error"
        confirmText={removing ? 'Removing…' : 'Remove'}
      />

      <ConfirmationDialog
        open={autoAllocateConfirmOpen}
        onClose={() => setAutoAllocateConfirmOpen(false)}
        onConfirm={handleAutoAllocate}
        title="Auto-Allocate Subject Teachers"
        message={`This fills every subject gap in ${selectedClass?.class_name || 'this class'} with whichever active teaching staff member currently has the lightest subject-teacher load. Subjects (and arms) that already have a teacher are never touched.`}
        severity="info"
        confirmText="Run Auto-Allocate"
      />

      {/* Copy From Class */}
      <ReusableModal open={copyModalOpen} onClose={() => setCopyModalOpen(false)} title="Copy From Class" size="small">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Copy subject-teacher assignments from another class into{' '}
          <strong>{selectedClass?.class_name}</strong>. Only subjects both classes actually share are
          copied, and this overwrites any existing assignment for those subjects.
        </Typography>
        <TextField
          select
          size="small"
          label="Source Class"
          value={copySourceId}
          onChange={(e) => setCopySourceId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {classes
            .filter((c) => c.programme_class_id !== selectedClass?.programme_class_id)
            .map((c) => (
              <MenuItem key={c.programme_class_id} value={c.programme_class_id}>
                {c.class_name}
              </MenuItem>
            ))}
        </TextField>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setCopyModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyFromClass} disabled={!copySourceId || copying}>
            {copying ? 'Copying…' : 'Copy'}
          </Button>
        </Box>
      </ReusableModal>

      {/* Bulk Upload */}
      <ReusableModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Bulk Upload Subject Teacher Allocations"
        size="small"
      >
        <UploadStaffForm
          key={uploadModalOpen ? 'open' : 'closed'}
          onUpload={handleUploadTemplate}
          onCancel={() => setUploadModalOpen(false)}
          onDownloadTemplate={handleDownloadTemplate}
        />
      </ReusableModal>
    </Box>
  );
};

export default SubjectTeacherAllocation;
