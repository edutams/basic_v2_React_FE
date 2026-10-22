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
  LinearProgress,
} from '@mui/material';
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
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from '@/components/shared/StatCard';
import AllocationSubTabs from '@/pages/tenant/teaching-allocations/AllocationSubTabs';
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

// Not a hard system cap — just a reasonable reference point ("a full
// subject-teaching load") the workload bar is drawn relative to.
const WORKLOAD_REFERENCE_MAX = 12;

const LOAD_BUCKETS = [
  { label: '1-2', min: 1, max: 2 },
  { label: '3-4', min: 3, max: 4 },
  { label: '5-6', min: 5, max: 6 },
  { label: '7-8', min: 7, max: 8 },
  { label: '9-10', min: 9, max: 10 },
  { label: '11+', min: 11, max: Infinity },
];

const SubjectTeacherAllocation = ({ activeTab, onTabChange, onOpenMigrate }) => {
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

  // Right pane — selected class's subjects, scoped to one arm at a time. A
  // subject teacher is allocated per class ARM (a teacher can't physically
  // cover 3 arms of the same class at once), so the grid always edits
  // exactly one arm — switchable via the arm chips in the header.
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedArmId, setSelectedArmId] = useState('');
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
  const [popover, setPopover] = useState({
    anchorEl: null,
    subjectId: null,
    excludingUserId: null,
  });
  const [popoverSearch, setPopoverSearch] = useState('');
  const [popoverCandidates, setPopoverCandidates] = useState([]);
  const [popoverLoading, setPopoverLoading] = useState(false);
  const [popoverExpanded, setPopoverExpanded] = useState(false);

  // "Class Actions" dropdown — consolidates this arm's Auto-Allocate /
  // Download / Upload / Copy actions into one menu button in the panel
  // header, alongside the identical standalone toolbar buttons above.
  const [classActionsAnchorEl, setClassActionsAnchorEl] = useState(null);

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

  // Prefill-and-go: once the default session/term/programme resolve on
  // load, fetch the classes list automatically instead of leaving the user
  // looking at an empty "click Fetch" screen. Guarded by `hasFetched` so it
  // only fires once — the Fetch button still drives every later refetch.
  useEffect(() => {
    if (selectedProgramme && selectedTerm && !hasFetched) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramme, selectedTerm]);

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
        count: all.filter(
          (t) => t.subject_teacher_count >= b.min && t.subject_teacher_count <= b.max,
        ).length,
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

  const fetchSubjects = async (armId) => {
    if (!armId) {
      setSubjects([]);
      return;
    }
    setSubjectsLoading(true);
    try {
      const res = await allocationApi.getSubjectTeacherAllocations({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm || undefined,
        class_arm_id: armId,
      });
      setSubjects(res.data || []);
    } catch (error) {
      notify.error('Failed to fetch subjects for this class arm');
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
    const firstArmId = row.arms?.[0]?.id || '';
    setSelectedArmId(firstArmId);
    fetchSubjects(firstArmId);
  };

  const handleSelectArm = (armId) => {
    if (armId === selectedArmId) return;
    setSelectedArmId(armId);
    setPendingAssignments({});
    setRightSearch('');
    setRightPage(0);
    fetchSubjects(armId);
  };

  const handleResetFilters = () => {
    setLeftSearch('');
    setLeftStatusFilter('all');
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (leftStatusFilter !== 'all' && c.status !== leftStatusFilter) return false;
      if (leftSearch && !c.class_name.toLowerCase().includes(leftSearch.toLowerCase()))
        return false;
      return true;
    });
  }, [classes, leftSearch, leftStatusFilter]);

  // The selected ARM's own status (not the whole class's) — a class shows
  // "Partial" overall while one specific arm can already be fully done, so
  // the detail panel's badge must reflect whichever arm is actually open,
  // computed straight from the subjects already loaded for it.
  const armStatus = useMemo(() => {
    if (subjects.length === 0) return 'unassigned';
    const assigned = subjects.filter((s) => s.teacher_id).length;
    if (assigned === 0) return 'unassigned';
    return assigned === subjects.length ? 'assigned' : 'partial';
  }, [subjects]);

  // Every arm across every class, for the "Copy from Arm" source picker.
  const armFlatList = useMemo(
    () =>
      classes.flatMap((c) =>
        (c.arms || []).map((a) => ({
          class_arm_id: a.id,
          label: `${c.class_name} - ${a.name}`,
        })),
      ),
    [classes],
  );

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
    setPopover({
      anchorEl: event.currentTarget,
      subjectId: subject.subject_id,
      excludingUserId: currentUserId,
    });
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
      [subjectId]: {
        user_id: candidate.user_id,
        name: candidate.name,
        staff_id: candidate.staff_id,
        phone: candidate.phone,
        // This assignment would add one more to their current load —
        // shown as a preview before Save Changes commits it.
        load: candidate.subject_teacher_count + 1,
      },
    }));
    closePopover();
  };

  // ── Save ─────────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!selectedArmId || !selectedTerm) return;
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
      const response = await allocationApi.saveSubjectTeacherAllocations({
        session_term_id: selectedTerm,
        class_arm_id: selectedArmId,
        allocations: allocationsData,
      });
      if (response.status) {
        notify.success('Subject teacher allocations saved successfully');
        setPendingAssignments({});
        fetchSubjects(selectedArmId);
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
    if (!rowMenu.subject?.allocation_id) return;
    setRemoving(true);
    try {
      await allocationApi.removeSubjectTeacherAllocation(rowMenu.subject.allocation_id);
      notify.success('Assignment removed');
      fetchSubjects(selectedArmId);
      fetchClasses();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to remove assignment');
    } finally {
      setRemoving(false);
      setRemoveConfirmOpen(false);
      setRowMenu({ anchorEl: null, subject: null });
    }
  };

  // ── Auto-Allocate / Copy From Arm / Template ────────────────────────
  const handleAutoAllocate = async () => {
    if (!selectedArmId || !selectedTerm) return;
    setAutoAllocating(true);
    try {
      const response = await allocationApi.autoAllocateSubjectTeachers({
        class_arm_id: selectedArmId,
        session_term_id: selectedTerm,
      });
      if (response.status) {
        notify.success(response.message);
        fetchSubjects(selectedArmId);
        fetchClasses();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to auto-allocate subject teachers');
    } finally {
      setAutoAllocating(false);
      setAutoAllocateConfirmOpen(false);
    }
  };

  const handleCopyFromArm = async () => {
    if (!selectedArmId || !selectedTerm || !copySourceId) return;
    setCopying(true);
    try {
      const response = await allocationApi.copySubjectTeachersToArm({
        from_class_arm_id: copySourceId,
        to_class_arm_id: selectedArmId,
        session_term_id: selectedTerm,
      });
      if (response.status) {
        notify.success(response.message);
        fetchSubjects(selectedArmId);
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
    if (!selectedArmId) return;
    try {
      const res = await allocationApi.downloadSubjectTeacherTemplate({
        programme_id: selectedProgramme,
        class_arm_id: selectedArmId,
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
    if (!selectedArmId || !selectedTerm) {
      throw new Error('Select a class arm first');
    }
    const res = await allocationApi.uploadSubjectTeacherTemplate(file, selectedArmId, selectedTerm);
    fetchSubjects(selectedArmId);
    fetchClasses();
    return res?.message || 'Upload complete';
  };

  // ── Stat cards ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSlots = classes.reduce((sum, c) => sum + c.total_slots, 0);
    const assignedSlots = classes.reduce((sum, c) => sum + c.assigned_slots, 0);
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
    <Box>
      {/* Stat Cards + Workload histogram — one flat row, every card the
          same height (StatCard's natural ~96px), so nothing looks
          mismatched against its neighbors. */}
      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
        {[
          {
            label: 'Classes',
            count: stats.totalClasses,
            icon: IconBook2,
            colorIndex: 0,
            tooltip: 'Every class in the selected programme',
          },
          {
            label: 'Subject Slots',
            count: stats.totalSlots,
            icon: IconBook2,
            colorIndex: 2,
            subtitle: `${stats.totalClasses} classes`,
            tooltip: 'Total (class, subject) pairs across every class in this programme',
          },
          {
            label: 'Assigned',
            count: stats.assignedSlots,
            icon: IconUserPlus,
            colorIndex: 1,
            subtitle: `${stats.assignedPct}%`,
            tooltip: 'Subject slots that already have a teacher assigned',
          },
          {
            label: 'Unassigned',
            count: stats.unassignedSlots,
            icon: IconUsers,
            colorIndex: 4,
            subtitle: stats.totalSlots > 0 ? `${100 - stats.assignedPct}%` : '0%',
            tooltip: 'Subject slots still needing a teacher',
          },
          {
            label: 'Teachers Active',
            count: stats.teachersActive,
            icon: IconUsers,
            colorIndex: 3,
            tooltip:
              'Distinct staff members currently assigned as a subject teacher in this programme',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard
              align="left"
              loading={classesLoading && !hasFetched}
              label={card.label}
              count={card.count}
              icon={card.icon}
              colorIndex={card.colorIndex}
              subtitle={card.subtitle}
              tooltip={card.tooltip}
            />
          </Grid>
        ))}

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Tooltip title="How many teaching staff (school-wide) currently carry each range of subject-teacher assignments">
            <Paper
              elevation={0}
              sx={{
                borderRadius: '14px',
                p: '14px',
                width: '100%',
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
                Teacher Workload
              </Typography>
              {workloadLoading ? (
                <Skeleton variant="rounded" height={36} sx={{ mt: 0.5 }} />
              ) : (
                <Box
                  sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 36, mt: 0.5 }}
                >
                  {workloadBuckets.map((b) => (
                    <Tooltip
                      key={b.label}
                      title={`${b.count} teacher(s) with ${b.label} subject assignments`}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          height: `${Math.max(10, (b.count / maxBucket) * 36)}px`,
                          bgcolor: 'primary.main',
                          borderRadius: '2px 2px 0 0',
                          opacity: 0.4 + 0.6 * (b.count / maxBucket),
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: '3px', mt: '2px' }}>
                {LOAD_BUCKETS.map((b) => (
                  <Typography
                    key={b.label}
                    sx={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#9CA3AF' }}
                  >
                    {b.label}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Tooltip>
        </Grid>
      </Grid>

      <AllocationSubTabs activeTab={activeTab} onTabChange={onTabChange} onOpenMigrate={onOpenMigrate} />

      <Alert severity="info" sx={{ color: '#000000', backgroundColor: '#FFFAE6', mb: 2 }}>
        Select a class, pick an arm, then allocate a teacher to each of its subjects. A teacher is
        assigned per class arm — a class with several arms can have a different teacher per arm
        for the same subject.
      </Alert>

      {/* Filters */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          borderTop: '3px solid',
          borderTopColor: 'primary.main',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Session"
              value={selectedSession}
              onChange={(e) => handleSessionChange(e.target.value)}
              fullWidth
            >
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.session_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              fullWidth
              disabled={!selectedSession}
            >
              {sessionTerms.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.term?.term_name || t.term_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Programme"
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select Programme</MenuItem>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.programme_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={leftStatusFilter}
              onChange={(e) => setLeftStatusFilter(e.target.value)}
              fullWidth
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<IconSearch size={16} />}
              onClick={fetchClasses}
              sx={{ height: '40px' }}
            >
              Fetch
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<IconFilterOff size={16} />}
            onClick={handleResetFilters}
          >
            Reset
          </Button>
          <Tooltip title={selectedArmId ? '' : 'Select a class and arm first'}>
            <span>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<IconWand size={16} />}
                onClick={() => setAutoAllocateConfirmOpen(true)}
                disabled={!selectedArmId || autoAllocating}
              >
                {autoAllocating ? 'Running…' : 'Auto-Allocate'}
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedArmId ? '' : 'Select a class and arm first'}>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<IconUpload size={16} />}
                onClick={() => setUploadModalOpen(true)}
                disabled={!selectedArmId}
              >
                Import
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedArmId ? '' : 'Select a class and arm first'}>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<IconDownload size={16} />}
                onClick={handleDownloadTemplate}
                disabled={!selectedArmId}
              >
                Export
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={selectedArmId ? '' : 'Select a class and arm first'}>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<IconCopy size={16} />}
                onClick={() => setCopyModalOpen(true)}
                disabled={!selectedArmId || armFlatList.length < 2}
              >
                Copy from Arm
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      {/* Master-detail layout */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        {/* Left: Classes list */}
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, width: { xs: '100%', lg: 340 }, flexShrink: 0 }}
        >
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
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Tooltip title="Filled (arm, subject) slots out of the total — a class with 3 arms and 9 subjects has 27 slots, not 9">
                      <span>Assigned</span>
                    </Tooltip>
                  </TableCell>
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
                        '&.Mui-selected': {
                          bgcolor: 'rgba(37, 99, 235, 0.12)',
                          borderLeft: '3px solid',
                          borderLeftColor: 'primary.main',
                        },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(37, 99, 235, 0.18)' },
                      }}
                    >
                      <TableCell>{leftPage * leftRowsPerPage + idx + 1}</TableCell>
                      <TableCell>{row.class_name}</TableCell>
                      <TableCell>
                        {row.assigned_slots}/{row.total_slots}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel(row.status)}
                          size="small"
                          icon={
                            row.status === 'assigned' ? <IconCircleCheck size={14} /> : undefined
                          }
                          sx={statusChipSx(row.status)}
                        />
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
              <Typography color="text.secondary">
                Select a class from the list to allocate its subject teachers
              </Typography>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography fontWeight={700}>
                      {selectedClass.class_name} ({selectedClass.subject_count} subjects)
                    </Typography>
                    <Tooltip title="This status is for the selected arm only — other arms of this class may differ">
                      <Chip
                        label={statusLabel(armStatus)}
                        size="small"
                        icon={armStatus === 'assigned' ? <IconCircleCheck size={14} /> : undefined}
                        sx={statusChipSx(armStatus)}
                      />
                    </Tooltip>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<IconChevronDown size={14} />}
                      onClick={(e) => setClassActionsAnchorEl(e.currentTarget)}
                    >
                      Class Actions
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveChanges}
                      disabled={Object.keys(pendingAssignments).length === 0 || saving}
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={3} sx={{ mt: 1 }} flexWrap="wrap" alignItems="center">
                  <Typography variant="body2" color="text.primary">
                    Total Students: <strong>{selectedClass.student_count}</strong>
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" color="text.primary">
                      Arm:
                    </Typography>
                    {selectedClass.arms.map((a) => (
                      <Chip
                        key={a.id}
                        label={a.name}
                        size="small"
                        onClick={() => handleSelectArm(a.id)}
                        color={a.id === selectedArmId ? 'primary' : 'default'}
                        variant={a.id === selectedArmId ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, cursor: 'pointer' }}
                      />
                    ))}
                    <TextField
                      select
                      size="small"
                      value={selectedArmId}
                      onChange={(e) => handleSelectArm(e.target.value)}
                      sx={{ minWidth: 110, ml: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      {selectedClass.arms.map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          Arm {a.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Tooltip title="A subject teacher is assigned per arm — a class with several arms can have a different teacher per arm for the same subject. Switch arms here to allocate a different one.">
                      <IconInfoCircle size={16} style={{ color: '#9CA3AF', cursor: 'help' }} />
                    </Tooltip>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  A subject teacher is assigned per arm — pick an arm above before allocating.
                </Typography>
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
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Tooltip title="Teacher's current total subject-teacher assignments this term, relative to a 12-assignment full load">
                          <span>Workload</span>
                        </Tooltip>
                      </TableCell>
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
                          <TableCell colSpan={7}>
                            <Skeleton variant="rounded" height={36} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : pagedSubjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
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
                        const load = pending ? pending.load : subject.teacher_subject_load;
                        const loadPct = load
                          ? Math.min(100, Math.round((load / WORKLOAD_REFERENCE_MAX) * 100))
                          : 0;

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
                                    <Avatar
                                      sx={{
                                        width: 15,
                                        height: 15,
                                        fontSize: 8,
                                        bgcolor: '#16A34A',
                                      }}
                                    >
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
                              {isAssigned ? (
                                <Box sx={{ minWidth: 90 }}>
                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <LinearProgress
                                      variant="determinate"
                                      value={loadPct}
                                      sx={{
                                        flex: 1,
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#E5E7EB',
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          bgcolor:
                                            loadPct >= 80
                                              ? '#DC2626'
                                              : loadPct >= 50
                                                ? '#D97706'
                                                : '#16A34A',
                                        },
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                      sx={{ whiteSpace: 'nowrap' }}
                                    >
                                      {load}/{WORKLOAD_REFERENCE_MAX} {loadPct}%
                                    </Typography>
                                  </Stack>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={isAssigned ? 'Assigned' : 'Unassigned'}
                                size="small"
                                sx={
                                  isAssigned
                                    ? { bgcolor: '#DCFCE7', color: '#166534' }
                                    : { bgcolor: '#FEE2E2', color: '#991B1B' }
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleOpenRowMenu(e, subject)}
                                disabled={!subject.teacher_id}
                              >
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
              {filteredPopoverCandidates.map((candidate) => {
                const candidateLoadPct = Math.min(
                  100,
                  Math.round((candidate.subject_teacher_count / WORKLOAD_REFERENCE_MAX) * 100),
                );
                const isCurrent = candidate.user_id === popover.excludingUserId;
                return (
                  <ListItemButton
                    key={candidate.user_id}
                    onClick={() => handlePickTeacher(popover.subjectId, candidate)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={candidate.avatar}
                        sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#16A34A' }}
                      >
                        {initials(candidate.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={candidate.name}
                      secondary={
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                          <LinearProgress
                            variant="determinate"
                            value={candidateLoadPct}
                            sx={{
                              flex: 1,
                              height: 5,
                              borderRadius: 3,
                              bgcolor: '#E5E7EB',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor:
                                  candidateLoadPct >= 80
                                    ? '#DC2626'
                                    : candidateLoadPct >= 50
                                      ? '#D97706'
                                      : '#16A34A',
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                            {candidate.subject_teacher_count}/{WORKLOAD_REFERENCE_MAX} ({candidateLoadPct}%)
                          </Typography>
                        </Stack>
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    {isCurrent && <IconCircleCheck size={16} color="#2563EB" />}
                  </ListItemButton>
                );
              })}
            </List>
          )}
          {!popoverExpanded && (
            <Button size="small" fullWidth onClick={handleViewAllTeachers} sx={{ mt: 1 }}>
              View All Teachers
            </Button>
          )}
        </Box>
      </Popover>

      {/* Class Actions menu — this arm's Auto-Allocate/Download/Upload/Copy,
          consolidated for convenience; same handlers as the toolbar buttons. */}
      <Menu
        anchorEl={classActionsAnchorEl}
        open={Boolean(classActionsAnchorEl)}
        onClose={() => setClassActionsAnchorEl(null)}
      >
        <MenuItem
          disabled={!selectedArmId || autoAllocating}
          onClick={() => {
            setClassActionsAnchorEl(null);
            setAutoAllocateConfirmOpen(true);
          }}
        >
          <IconWand size={16} style={{ marginRight: 8 }} />
          Auto-Allocate This Arm
        </MenuItem>
        <MenuItem
          disabled={!selectedArmId}
          onClick={() => {
            setClassActionsAnchorEl(null);
            setUploadModalOpen(true);
          }}
        >
          <IconUpload size={16} style={{ marginRight: 8 }} />
          Import Template
        </MenuItem>
        <MenuItem
          disabled={!selectedArmId}
          onClick={() => {
            setClassActionsAnchorEl(null);
            handleDownloadTemplate();
          }}
        >
          <IconDownload size={16} style={{ marginRight: 8 }} />
          Export Template
        </MenuItem>
        <MenuItem
          disabled={!selectedArmId || armFlatList.length < 2}
          onClick={() => {
            setClassActionsAnchorEl(null);
            setCopyModalOpen(true);
          }}
        >
          <IconCopy size={16} style={{ marginRight: 8 }} />
          Copy from Another Arm
        </MenuItem>
      </Menu>

      {/* Row action menu */}
      <Menu
        anchorEl={rowMenu.anchorEl}
        open={Boolean(rowMenu.anchorEl)}
        onClose={handleCloseRowMenu}
      >
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
        message={`Remove the teacher assigned to ${rowMenu.subject?.subject_name || 'this subject'} for this arm?`}
        severity="error"
        confirmText={removing ? 'Removing…' : 'Remove'}
      />

      <ConfirmationDialog
        open={autoAllocateConfirmOpen}
        onClose={() => setAutoAllocateConfirmOpen(false)}
        onConfirm={handleAutoAllocate}
        title="Auto-Allocate Subject Teachers"
        message={`This fills every subject gap in ${selectedClass?.class_name || 'this class'} — ${selectedClass?.arms.find((a) => a.id === selectedArmId)?.name || 'this arm'} only — with whichever active teaching staff member currently has the lightest subject-teacher load. Subjects that already have a teacher on this arm are never touched.`}
        severity="info"
        confirmText="Run Auto-Allocate"
      />

      {/* Copy From Arm */}
      <ReusableModal
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        title="Copy From Arm"
        size="small"
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Copy subject-teacher assignments from another class arm into{' '}
          <strong>
            {selectedClass?.class_name} -{' '}
            {selectedClass?.arms.find((a) => a.id === selectedArmId)?.name}
          </strong>
          . Only subjects both arms' classes actually share are copied, and this overwrites any
          existing assignment for those subjects.
        </Typography>
        <TextField
          select
          size="small"
          label="Source Arm"
          value={copySourceId}
          onChange={(e) => setCopySourceId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {armFlatList
            .filter((a) => a.class_arm_id !== selectedArmId)
            .map((a) => (
              <MenuItem key={a.class_arm_id} value={a.class_arm_id}>
                {a.label}
              </MenuItem>
            ))}
        </TextField>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setCopyModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyFromArm} disabled={!copySourceId || copying}>
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
