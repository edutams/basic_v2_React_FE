import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Menu,
  Skeleton,
  Chip,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Checkbox,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  IconUsers,
  IconUserCheck,
  IconUserExclamation,
  IconChalkboard,
  IconWand,
  IconDownload,
  IconUpload,
  IconFilterOff,
  IconDotsVertical,
  IconChevronDown,
} from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from '@/components/shared/StatCard';
import ArrowHint from '@/components/shared/ArrowHint';
import AllocationSubTabs from '@/pages/tenant/teaching-allocations/AllocationSubTabs';
import UploadStaffForm from './components/UploadStaffForm';
import ClassArmDetailPanel from './components/ClassArmDetailPanel';
import staffApi from '@/api/tenant/staffs/staffApi';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'partial', label: 'Partial' },
  { value: 'unassigned', label: 'Unassigned' },
];

const groupStatus = (group) => {
  const withTeacher = group.rows.filter((r) => r.teacher_id).length;
  if (withTeacher === 0) return 'unassigned';
  if (withTeacher === group.rows.length) return 'assigned';
  return 'partial';
};

const formatClassList = (names) => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};

/** Label-above select — matches the reference design's filter controls
 * (a muted caption above a bordered box) instead of MUI's floating-notch
 * label, same pattern already used for Period Settings' time fields. */
const FilterSelect = ({ label, children, ...props }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
    >
      {label}
    </Typography>
    <TextField
      select
      size="small"
      fullWidth
      SelectProps={{ displayEmpty: true }}
      sx={{ '& .MuiInputBase-root': { height: 40 } }}
      {...props}
    >
      {children}
    </TextField>
  </Box>
);

const LegendDot = ({ color, label }) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
    <Typography variant="caption" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
  </Stack>
);

const ClassTeacherAllocation = ({ activeTab, onTabChange, onOpenMigrate }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Filters — nothing here re-fetches the table on its own; only the Fetch
  // button does. Session -> Term -> Programme -> Class, in that order.
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingGroup, setSavingGroup] = useState(null);

  // Right-side detail panel — set to one allocation row to show it.
  const [detailArm, setDetailArm] = useState(null);
  const [detailInitialTab, setDetailInitialTab] = useState('overview');

  // First-visit onboarding hints — "click a row" then "the panel updates".
  // Driven by the real detailArm state (not a synthetic timer): once the
  // admin actually opens a row's detail panel for the first time, step 1
  // disappears, step 2 shows itself and auto-fades, and neither comes back
  // for the rest of this page visit — even if the panel is later closed or
  // a different arm is opened.
  const [tourStep, setTourStep] = useState(detailArm ? null : 'row');
  useEffect(() => {
    if (detailArm && tourStep === 'row') {
      setTourStep('panel');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailArm]);

  // Auto-Allocate
  const [autoAllocateConfirmOpen, setAutoAllocateConfirmOpen] = useState(false);
  const [autoAllocating, setAutoAllocating] = useState(false);

  // Bulk Upload
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Warn-but-allow modal — shown when a teacher just picked already holds a
  // different class as its class teacher this term. Not a block: a small
  // school may not have enough staff for one class teacher per class.
  const [conflictDialog, setConflictDialog] = useState({
    open: false,
    index: null,
    teacherName: '',
    classNames: [],
    previousTeacherId: null,
    previousTeacherName: '',
  });
  // Tracks whether the conflict modal is closing because the admin hit
  // "Yes, this is intentional" — ConfirmationDialog always fires onClose
  // right after onConfirm, so without this flag that onClose would also
  // run the revert meant only for "No, undo this" / backdrop dismissal.
  const conflictConfirmedRef = useRef(false);

  // Grouped-by-class collapsible sections — a flat list of every class arm
  // in a programme gets long fast (42+ arms isn't unusual), so rows are
  // grouped by class with a collapsible header, same pattern as
  // SetUpClassesTab's class-structure manager.
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Row selection (per class arm) — tracked for the mockup's checkbox
  // column; nothing consumes the selection yet beyond the checkboxes
  // themselves, same as every other staff-manager table's selection state
  // before its own bulk-action bar existed.
  const [selectedArmIds, setSelectedArmIds] = useState(new Set());

  // Per-group "⋮" menu (Save this class's changes) and per-row teacher
  // picker menu (replaces the native <select> so each option can show an
  // avatar, matching the reference design).
  const [groupMenu, setGroupMenu] = useState({ anchorEl: null, group: null });
  const [teacherMenu, setTeacherMenu] = useState({ anchorEl: null, index: null });

  const groupedAllocations = useMemo(() => {
    const groups = new Map();
    allocations.forEach((allocation, index) => {
      const key = allocation.class_name || 'Unassigned';
      if (!groups.has(key)) {
        groups.set(key, { className: key, rows: [] });
      }
      groups.get(key).rows.push({ ...allocation, _index: index });
    });
    return Array.from(groups.values());
  }, [allocations]);

  const filteredGroupedAllocations = useMemo(() => {
    if (statusFilter === 'all') return groupedAllocations;
    return groupedAllocations.filter((group) => groupStatus(group) === statusFilter);
  }, [groupedAllocations, statusFilter]);

  // All five stat cards come straight out of the already-fetched
  // `allocations` array — no extra round trip for numbers the table itself
  // already has.
  const stats = useMemo(() => {
    const totalArms = allocations.length;
    const armsWithTeacher = allocations.filter((a) => a.teacher_id).length;
    const totalClassTeachers = new Set(
      allocations.filter((a) => a.teacher_id).map((a) => a.teacher_id),
    ).size;

    return {
      totalClasses: groupedAllocations.length,
      totalArms,
      armsWithTeacher,
      armsWithoutTeacher: totalArms - armsWithTeacher,
      totalClassTeachers,
    };
  }, [allocations, groupedAllocations]);

  const toggleGroup = (className) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(className)) {
        next.delete(className);
      } else {
        next.add(className);
      }
      return next;
    });
  };

  const collapseAll = () => setCollapsedGroups(new Set(groupedAllocations.map((g) => g.className)));
  const expandAll = () => setCollapsedGroups(new Set());

  const toggleArmSelected = (classArmId) => {
    setSelectedArmIds((prev) => {
      const next = new Set(prev);
      if (next.has(classArmId)) {
        next.delete(classArmId);
      } else {
        next.add(classArmId);
      }
      return next;
    });
  };

  const toggleGroupSelected = (group) => {
    const ids = group.rows.map((r) => r.class_arm_id);
    const allSelected = ids.every((id) => selectedArmIds.has(id));
    setSelectedArmIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  useEffect(() => {
    initData();
  }, []);

  // Auto-apply: the reference design has no separate "Fetch" button —
  // changing Session/Term/Programme/Class re-fetches on its own, same as
  // the prefill-and-go pattern this page already used for its first load.
  useEffect(() => {
    if (selectedProgramme && selectedTerm) {
      fetchAllocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramme, selectedTerm, selectedClass]);

  const initData = async () => {
    try {
      const [sessionsRes, progsRes, staffRes] = await Promise.all([
        fetchTenantSessions({ pagination: false }),
        fetchProgrammes(),
        staffApi.getAll({ staff_type: 'teaching' }),
      ]);

      const allSessions = sessionsRes.data || [];
      setSessions(allSessions);
      setTeachers(staffRes.data || []);

      const progs = progsRes.data || [];
      setProgrammes(progs);

      // Pre-fill sensible defaults (active session, its terms, first
      // programme's classes) without fetching the table itself.
      const activeSession = allSessions.find((s) => s.status === 'active') || allSessions[0];
      if (activeSession) {
        setSelectedSession(activeSession.id);
        await loadTermsForSession(activeSession.id);
      }

      if (progs.length > 0) {
        setSelectedProgramme(progs[0].id);
        await loadClassesForProgramme(progs[0].id);
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

  const loadClassesForProgramme = async (progId) => {
    try {
      const classesRes = await fetchClassesByProgramme(progId);
      setClasses(classesRes.data || []);
      setSelectedClass('');
    } catch (error) {
      notify.error('Failed to fetch classes');
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

  const handleProgrammeChange = async (progId) => {
    setSelectedProgramme(progId);
    setClasses([]);
    setSelectedClass('');
    if (progId) {
      await loadClassesForProgramme(progId);
    }
  };

  const fetchAllocations = async () => {
    if (!selectedProgramme || !selectedTerm) {
      notify.error('Select a session, term, and programme first');
      return;
    }

    setLoading(true);
    setHasFetched(true);
    try {
      const response = await allocationApi.getClassTeacherAllocations({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm,
      });

      if (response.status) {
        let rows = response.data || [];
        if (selectedClass) {
          const className = classes.find((c) => c.id === selectedClass)?.class_name;
          if (className) {
            rows = rows.filter((r) => r.class_name === className);
          }
        }
        setAllocations(rows);
      }
    } catch (error) {
      notify.error('Failed to fetch allocations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = async (index, teacherUserId) => {
    const teacher = teachers.find((t) => t.user_id === teacherUserId);
    const previousAllocation = allocations[index];
    const classArmId = previousAllocation.class_arm_id;

    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      teacher_id: teacherUserId,
      teacher_name: teacher ? teacher.user.full_name : '',
    };
    setAllocations(updatedAllocations);

    // Warn (but don't block) if this teacher already holds a different
    // class this term — a small school may not have enough staff for one
    // class teacher per class, so this is informational only. The admin
    // can undo the pick from the modal if it wasn't intentional. Checks
    // both already-saved assignments (backend) and other rows picked for
    // the same teacher in this still-unsaved edit session (local), since
    // picking the same teacher for two arms before hitting Save never
    // touches the backend until Save runs.
    if (!teacherUserId || !selectedTerm) return;

    const pendingClassNames = updatedAllocations
      .filter((a, i) => i !== index && a.teacher_id === teacherUserId && a.class_name)
      .map((a) => a.class_name);

    let savedClassNames = [];
    try {
      const res = await allocationApi.checkClassTeacherConflict({
        user_id: teacherUserId,
        session_term_id: selectedTerm,
        excluding_class_arm_id: classArmId,
      });
      if (res.data) {
        savedClassNames = res.data.map((c) => c.class_name);
      }
    } catch (error) {
      // Non-blocking — a failed check shouldn't stop the admin from saving.
      console.error(error);
    }

    const classNames = [...new Set([...savedClassNames, ...pendingClassNames])];
    if (classNames.length > 0) {
      conflictConfirmedRef.current = false;
      setConflictDialog({
        open: true,
        index,
        teacherName: teacher ? teacher.user.full_name : 'This teacher',
        classNames,
        previousTeacherId: previousAllocation.teacher_id,
        previousTeacherName: previousAllocation.teacher_name,
      });
    }
  };

  const confirmConflictedTeacherChange = () => {
    conflictConfirmedRef.current = true;
  };

  const closeConflictDialog = () => {
    if (conflictConfirmedRef.current) {
      conflictConfirmedRef.current = false;
      setConflictDialog((prev) => ({ ...prev, open: false }));
      return;
    }
    const { index, previousTeacherId, previousTeacherName } = conflictDialog;
    if (index !== null) {
      setAllocations((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          teacher_id: previousTeacherId,
          teacher_name: previousTeacherName,
        };
        return updated;
      });
    }
    setConflictDialog((prev) => ({ ...prev, open: false }));
  };

  const handleRemoveAllocation = (index) => {
    setAllocationToDelete(allocations[index]);
    setConfirmOpen(true);
  };

  const confirmRemoveAllocation = async () => {
    if (!allocationToDelete) return;

    try {
      if (allocationToDelete.allocation_id) {
        const response = await allocationApi.removeClassTeacherAllocation(
          allocationToDelete.allocation_id,
        );
        if (response.status) {
          notify.success('Allocation removed successfully');
          fetchAllocations();
        }
      } else {
        const updatedAllocations = allocations.map((a) =>
          a.id === allocationToDelete.id ? { ...a, teacher_id: null, teacher_name: '' } : a,
        );
        setAllocations(updatedAllocations);
        notify.success('Selection cleared');
      }
    } catch (error) {
      notify.error('Failed to remove allocation');
      console.error(error);
    } finally {
      setAllocationToDelete(null);
      setConfirmOpen(false);
    }
  };

  const saveRows = async (rows) => {
    if (!selectedTerm) {
      notify.error('No session term selected');
      return false;
    }

    const allocationsData = rows
      .filter((a) => a.teacher_id) // Only send allocations with teachers
      .map((a) => ({
        class_arm_id: a.class_arm_id,
        user_id: a.teacher_id,
      }));

    if (allocationsData.length === 0) {
      notify.error('Select at least one teacher before saving');
      return false;
    }

    const response = await allocationApi.saveClassTeacherAllocations({
      session_term_id: selectedTerm,
      allocations: allocationsData,
    });

    return response.status;
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const saved = await saveRows(allocations);
      if (saved) {
        notify.success('Class teacher allocations saved successfully');
        fetchAllocations();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save allocations');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGroup = async (group) => {
    setSavingGroup(group.className);
    try {
      const saved = await saveRows(group.rows);
      if (saved) {
        notify.success(`${group.className} allocations saved successfully`);
        fetchAllocations();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save allocations');
      console.error(error);
    } finally {
      setSavingGroup(null);
    }
  };

  const handleRowOpenDetail = (allocation, initialTab = 'overview') => {
    setDetailArm(allocation);
    setDetailInitialTab(initialTab);
  };

  // Called from the Suggested Teachers panel — saves immediately (unlike
  // the table's own Select, which only stages a pending change until Save
  // is clicked) since there's no "Save" affordance inside the panel itself.
  const handleAssignFromPanel = async (userId, teacherName) => {
    if (!detailArm || !selectedTerm) return;

    try {
      const response = await allocationApi.saveClassTeacherAllocations({
        session_term_id: selectedTerm,
        allocations: [{ class_arm_id: detailArm.class_arm_id, user_id: userId }],
      });
      if (response.status) {
        notify.success(`${teacherName} assigned as class teacher for ${detailArm.full_class_name}`);
        setDetailArm((prev) =>
          prev ? { ...prev, teacher_id: userId, teacher_name: teacherName } : prev,
        );
        fetchAllocations();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to assign teacher');
      console.error(error);
    }
  };

  const handleAutoAllocate = async () => {
    if (!selectedProgramme || !selectedTerm) {
      notify.error('Select a session, term, and programme first');
      return;
    }

    setAutoAllocating(true);
    try {
      const response = await allocationApi.autoAllocateClassTeachers({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm,
      });
      if (response.status) {
        notify.success(response.message);
        fetchAllocations();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to auto-allocate class teachers');
      console.error(error);
    } finally {
      setAutoAllocating(false);
      setAutoAllocateConfirmOpen(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedProgramme) {
      notify.error('Select a programme first');
      return;
    }
    try {
      const res = await allocationApi.downloadClassTeacherTemplate({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'class_teacher_allocation_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
    } catch (error) {
      notify.error('Failed to download template');
      console.error(error);
    }
  };

  const handleUploadTemplate = async (file) => {
    if (!selectedTerm) {
      throw new Error('Select a session term first');
    }
    const res = await allocationApi.uploadClassTeacherTemplate(file, selectedTerm);
    fetchAllocations();
    return res?.message || 'Upload complete';
  };

  const handleResetFilters = () => {
    setSelectedClass('');
    setStatusFilter('all');
  };

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            label: 'Total Classes',
            count: stats.totalClasses,
            icon: IconChalkboard,
            colorIndex: 0,
            subtitle: `${stats.totalArms} class arm${stats.totalArms !== 1 ? 's' : ''}`,
            tooltip: 'Every class in the selected programme',
          },
          {
            label: 'Total Class Arms',
            count: stats.totalArms,
            icon: IconUsers,
            colorIndex: 2,
            subtitle: 'All class arms in the programme',
            tooltip: 'Every arm (e.g. A, B, C) across all classes in the selected programme',
          },
          {
            label: 'Assigned',
            count: stats.armsWithTeacher,
            icon: IconUserCheck,
            colorIndex: 1,
            subtitle: 'Arms with a class teacher',
            tooltip: 'Class arms that already have an active class teacher this term',
          },
          {
            label: 'Unassigned',
            count: stats.armsWithoutTeacher,
            icon: IconUserExclamation,
            colorIndex: 4,
            subtitle: 'Arms needing a class teacher',
            tooltip: 'Class arms with no class teacher assigned this term',
          },
          {
            label: 'Class Teachers',
            count: stats.totalClassTeachers,
            icon: IconUserCheck,
            colorIndex: 3,
            subtitle: 'Distinct teachers assigned',
            tooltip:
              'Distinct staff members currently serving as a class teacher in this programme',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 12 / 5 }}>
            <StatCard
              align="left"
              loading={loading && !hasFetched}
              label={card.label}
              count={card.count}
              tooltip={card.tooltip}
              icon={card.icon}
              colorIndex={card.colorIndex}
              subtitle={card.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      <AllocationSubTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenMigrate={onOpenMigrate}
        rightSlot={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Tooltip title="Fill every class arm without a class teacher, using whichever active teaching staff member currently has the lightest load">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconWand size={16} />}
                  onClick={() => setAutoAllocateConfirmOpen(true)}
                  disabled={!selectedProgramme || !selectedTerm || autoAllocating}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {autoAllocating ? 'Running…' : 'Auto-Allocate'}
                </Button>
              </span>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconUpload size={16} />}
              onClick={() => setUploadModalOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Bulk Upload
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconDownload size={16} />}
              onClick={handleDownloadTemplate}
              disabled={!selectedProgramme}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Download Template
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<SwapHorizIcon fontSize="small" />}
              onClick={onOpenMigrate}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Migrate from Previous Term
            </Button>
          </Box>
        }
      />

      {/* Table + detail panel — filters, info banner, and every class group
          live inside one continuous white card (left), matching the
          reference design (no gaps or separate borders between those
          sections); the detail panel is its own separate card (right). */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Paper
          variant="outlined"
          sx={{ flex: 1, minWidth: 0, width: '100%', borderRadius: 2, overflow: 'hidden' }}
        >
          {/* Filters Row: Session -> Term -> Programme -> Class -> Status -> Reset */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FilterSelect
                  label="Session"
                  value={selectedSession}
                  onChange={(e) => handleSessionChange(e.target.value)}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {session.session_name}
                    </MenuItem>
                  ))}
                </FilterSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FilterSelect
                  label="Term"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  disabled={!selectedSession}
                >
                  {sessionTerms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>
                      {term.term?.term_name || term.term_name}
                    </MenuItem>
                  ))}
                </FilterSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FilterSelect
                  label="Programme"
                  value={selectedProgramme}
                  onChange={(e) => handleProgrammeChange(e.target.value)}
                >
                  <MenuItem value="">Select Programme</MenuItem>
                  {programmes.map((prog) => (
                    <MenuItem key={prog.id} value={prog.id}>
                      {prog.programme_name}
                    </MenuItem>
                  ))}
                </FilterSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FilterSelect
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedProgramme}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </FilterSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </FilterSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  size="small"
                  startIcon={<IconFilterOff size={16} />}
                  onClick={handleResetFilters}
                  sx={{ height: 40 }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Info banner + status legend */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: '#FFFAE6',
              color: '#000',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#92400E' }} />
              <Typography variant="body2">
                Select teachers for each class arm. You can auto-allocate, bulk assign or assign
                manually.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <LegendDot color="#16A34A" label="Assigned" />
              <LegendDot color="#DC2626" label="Unassigned" />
              <LegendDot color="#D97706" label="Partial" />
            </Stack>
          </Box>

          <Box sx={{ p: 2 }}>
            {loading ? (
              <TableContainer>
                <Table sx={{ border: '1px solid #e0e0e0' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Class Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Students</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell padding="checkbox">
                          <Skeleton variant="rounded" width={18} height={18} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={40} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="rounded" width="100%" height={36} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width={40} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="rounded" width={80} height={22} />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="circular" width={24} height={24} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : allocations.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  {hasFetched
                    ? 'No class allocations found for these filters'
                    : 'Select a session, term, and programme to begin'}
                </Typography>
              </Box>
            ) : filteredGroupedAllocations.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No classes match the "
                  {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}" status filter
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Button size="small" onClick={collapseAll}>
                    Collapse all
                  </Button>
                  <Button size="small" variant="contained" onClick={expandAll}>
                    Expand all
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveAll}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save All'}
                  </Button>
                </Box>

                <Box>
                  {filteredGroupedAllocations.map((group, groupIndex) => {
                    const collapsed = collapsedGroups.has(group.className);
                    const armIds = group.rows.map((r) => r.class_arm_id);
                    const allGroupSelected =
                      armIds.length > 0 && armIds.every((id) => selectedArmIds.has(id));
                    const someGroupSelected =
                      armIds.some((id) => selectedArmIds.has(id)) && !allGroupSelected;

                    return (
                      <Box
                        key={group.className}
                        sx={{
                          mt: groupIndex > 0 ? 2 : 0,
                          position: groupIndex === 0 ? 'relative' : undefined,
                        }}
                      >
                        {groupIndex === 0 && (
                          <ArrowHint
                            show={tourStep === 'row'}
                            mode="persistent"
                            label="🚀 1. Click on a class arm's row — the row is highlighted to show it is selected."
                            direction="down-right"
                            maxWidth={240}
                            position={{ position: 'absolute', top: 46, right: 24, zIndex: 10 }}
                          />
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            cursor: 'pointer',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                          }}
                          onClick={() => toggleGroup(group.className)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small">
                              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            </IconButton>
                            <Box>
                              <Typography fontWeight={700}>
                                {group.className} ({group.rows.length} arm
                                {group.rows.length !== 1 ? 's' : ''})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {group.rows.filter((r) => r.teacher_id).length}/{group.rows.length}{' '}
                                assigned
                              </Typography>
                            </Box>
                            <Chip
                              icon={
                                groupStatus(group) === 'assigned' ? (
                                  <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                                ) : groupStatus(group) === 'unassigned' ? (
                                  <CancelIcon sx={{ fontSize: '14px !important' }} />
                                ) : undefined
                              }
                              label={
                                groupStatus(group) === 'assigned'
                                  ? 'Assigned'
                                  : groupStatus(group) === 'partial'
                                    ? 'Partial'
                                    : 'Unassigned'
                              }
                              size="small"
                              sx={{
                                fontWeight: 600,
                                ...(groupStatus(group) === 'assigned' && {
                                  bgcolor: '#DCFCE7',
                                  color: '#166534',
                                }),
                                ...(groupStatus(group) === 'partial' && {
                                  bgcolor: '#FEF3C7',
                                  color: '#92400E',
                                }),
                                ...(groupStatus(group) === 'unassigned' && {
                                  bgcolor: '#FEE2E2',
                                  color: '#991B1B',
                                }),
                              }}
                            />
                          </Box>
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="small" onClick={() => toggleGroup(group.className)}>
                              {collapsed ? 'Expand' : 'Collapse'}
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => setGroupMenu({ anchorEl: e.currentTarget, group })}
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Collapse in={!collapsed}>
                          <Box
                            sx={{
                              bgcolor: 'background.paper',
                              borderTop: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        size="small"
                                        checked={allGroupSelected}
                                        indeterminate={someGroupSelected}
                                        onChange={() => toggleGroupSelected(group)}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Class Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">
                                      Total Students
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {group.rows.map((allocation) => {
                                    const assignedTeacher = teachers.find(
                                      (t) => t.user_id === allocation.teacher_id,
                                    );
                                    return (
                                      <TableRow
                                        key={allocation.id}
                                        hover
                                        onClick={() => handleRowOpenDetail(allocation)}
                                        selected={
                                          detailArm?.class_arm_id === allocation.class_arm_id
                                        }
                                        sx={{
                                          cursor: 'pointer',
                                          '&.Mui-selected': {
                                            bgcolor: 'rgba(37, 99, 235, 0.12)',
                                            borderLeft: '3px solid',
                                            borderLeftColor: 'primary.main',
                                          },
                                          '&.Mui-selected:hover': {
                                            bgcolor: 'rgba(37, 99, 235, 0.18)',
                                          },
                                        }}
                                      >
                                        <TableCell
                                          padding="checkbox"
                                          onClick={(e) => {
                                            // Stop it reaching the row's own onClick (which would
                                            // call handleRowOpenDetail a second time) — but a
                                            // checkbox click should still open the detail panel
                                            // exactly like clicking anywhere else in the row.
                                            e.stopPropagation();
                                            handleRowOpenDetail(allocation);
                                          }}
                                        >
                                          <Checkbox
                                            size="small"
                                            checked={selectedArmIds.has(allocation.class_arm_id)}
                                            onChange={() =>
                                              toggleArmSelected(allocation.class_arm_id)
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>{allocation.arm_name}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          <Box
                                            role="button"
                                            onClick={(e) =>
                                              setTeacherMenu({
                                                anchorEl: e.currentTarget,
                                                index: allocation._index,
                                              })
                                            }
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              p: 0.75,
                                              borderRadius: 1.5,
                                              border: '1px solid',
                                              borderColor: allocation.teacher_id
                                                ? 'divider'
                                                : '#FCA5A5',
                                              bgcolor: allocation.teacher_id
                                                ? 'background.paper'
                                                : '#FEF2F2',
                                              cursor: 'pointer',
                                              minHeight: 48,
                                            }}
                                          >
                                            {allocation.teacher_id ? (
                                              <Avatar
                                                src={assignedTeacher?.user?.avatar}
                                                sx={{
                                                  width: 30,
                                                  height: 30,
                                                  fontSize: 12,
                                                  bgcolor: '#2563EB',
                                                }}
                                              >
                                                {(allocation.teacher_name || '?')[0]}
                                              </Avatar>
                                            ) : null}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              {allocation.teacher_id ? (
                                                <>
                                                  <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    noWrap
                                                  >
                                                    {allocation.teacher_name}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                  >
                                                    {assignedTeacher?.user?.user_id || ''}
                                                  </Typography>
                                                </>
                                              ) : (
                                                <Typography
                                                  variant="body2"
                                                  fontWeight={600}
                                                  sx={{ color: '#DC2626' }}
                                                >
                                                  Not Assigned
                                                </Typography>
                                              )}
                                            </Box>
                                            <IconChevronDown
                                              size={16}
                                              color={allocation.teacher_id ? '#64748B' : '#DC2626'}
                                            />
                                          </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                          {allocation.student_count ?? 0}
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            icon={
                                              allocation.teacher_id ? (
                                                <CheckCircleIcon
                                                  sx={{ fontSize: '14px !important' }}
                                                />
                                              ) : (
                                                <CancelIcon sx={{ fontSize: '14px !important' }} />
                                              )
                                            }
                                            label={
                                              allocation.teacher_id ? 'Assigned' : 'Unassigned'
                                            }
                                            size="small"
                                            sx={
                                              allocation.teacher_id
                                                ? {
                                                    bgcolor: '#DCFCE7',
                                                    color: '#166534',
                                                    fontWeight: 600,
                                                  }
                                                : {
                                                    bgcolor: '#FEE2E2',
                                                    color: '#991B1B',
                                                    fontWeight: 600,
                                                  }
                                            }
                                          />
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <IconButton
                                            size="small"
                                            disabled={!allocation.teacher_id}
                                            onClick={() =>
                                              handleRemoveAllocation(allocation._index)
                                            }
                                          >
                                            <IconDotsVertical size={18} />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {detailArm && (
          <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0, position: 'relative' }}>
            <ArrowHint
              show={tourStep === 'panel'}
              mode="timed"
              label="🚀 2. The class detail panel updates automatically with the selected arm's information."
              direction="down-left"
              maxWidth={260}
              position={{ position: 'absolute', top: -56, right: 8, zIndex: 10 }}
            />
            <ClassArmDetailPanel
              arm={detailArm}
              programmeId={selectedProgramme}
              sessionTermId={selectedTerm}
              initialTab={detailInitialTab}
              onClose={() => setDetailArm(null)}
              onAssignTeacher={handleAssignFromPanel}
              onRemoved={() => {
                setDetailArm(null);
                fetchAllocations();
              }}
            />
          </Box>
        )}
      </Stack>

      {/* Per-group "⋮" menu — Save this class's pending changes. */}
      <Menu
        anchorEl={groupMenu.anchorEl}
        open={Boolean(groupMenu.anchorEl)}
        onClose={() => setGroupMenu({ anchorEl: null, group: null })}
      >
        <MenuItem
          disabled={!groupMenu.group || savingGroup === groupMenu.group?.className}
          onClick={() => {
            const group = groupMenu.group;
            setGroupMenu({ anchorEl: null, group: null });
            if (group) handleSaveGroup(group);
          }}
        >
          {groupMenu.group && savingGroup === groupMenu.group.className
            ? 'Saving…'
            : 'Save Changes for This Class'}
        </MenuItem>
      </Menu>

      {/* Per-row teacher picker — replaces the native <select> so each
          option can show an avatar, matching the reference design. */}
      <Menu
        anchorEl={teacherMenu.anchorEl}
        open={Boolean(teacherMenu.anchorEl)}
        onClose={() => setTeacherMenu({ anchorEl: null, index: null })}
        slotProps={{ paper: { sx: { maxHeight: 360, width: 280 } } }}
      >
        <MenuItem
          onClick={() => {
            if (teacherMenu.index !== null) handleTeacherChange(teacherMenu.index, '');
            setTeacherMenu({ anchorEl: null, index: null });
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Select Teacher
          </Typography>
        </MenuItem>
        {teachers.map((teacher) => (
          <MenuItem
            key={teacher.user_id}
            onClick={() => {
              if (teacherMenu.index !== null)
                handleTeacherChange(teacherMenu.index, teacher.user_id);
              setTeacherMenu({ anchorEl: null, index: null });
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={teacher.user?.avatar} sx={{ width: 26, height: 26, fontSize: 11 }}>
                {teacher.user?.fname?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">{teacher.user?.full_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {teacher.user?.user_id}
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmRemoveAllocation}
        title="Remove Teacher Allocation"
        message="Are you sure you want to remove this teacher from the allocation?"
        severity="error"
        confirmText="Remove"
      />

      {/* Already-a-class-teacher-elsewhere notice — purely informational,
          never blocks the assignment. Worded carefully so it doesn't read
          as an error: a teacher covering more than one class (even across
          programmes) is a perfectly normal setup. */}
      <ConfirmationDialog
        open={conflictDialog.open}
        onClose={closeConflictDialog}
        onConfirm={confirmConflictedTeacherChange}
        title={
          conflictDialog.classNames.length > 1
            ? 'Just confirming — this teacher already covers other classes'
            : 'Just confirming — this teacher already covers another class'
        }
        message={`${conflictDialog.teacherName} is already set as the class teacher for ${formatClassList(conflictDialog.classNames)} this term. That's completely fine if they're meant to cover ${conflictDialog.classNames.length > 1 ? 'all of these classes' : 'both classes'} — this isn't an error, just a check before saving.`}
        severity="info"
        confirmText="Yes, this is intentional"
        cancelText="No, undo this"
      />

      {/* Auto-Allocate confirmation */}
      <ConfirmationDialog
        open={autoAllocateConfirmOpen}
        onClose={() => setAutoAllocateConfirmOpen(false)}
        onConfirm={handleAutoAllocate}
        title="Auto-Allocate Class Teachers"
        message="This fills every class arm in this programme that doesn't yet have a class teacher, picking whichever active teaching staff member currently has the lightest teaching load. Arms that already have a class teacher are never touched."
        severity="info"
        confirmText="Run Auto-Allocate"
      />

      {/* Bulk Upload */}
      <ReusableModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Bulk Upload Class Teacher Allocations"
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

export default ClassTeacherAllocation;
