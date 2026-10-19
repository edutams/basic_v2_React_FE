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
  Skeleton,
  Chip,
  Grid,
  Alert,
  Paper,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  IconTrash,
  IconSearch,
  IconUsers,
  IconUserCheck,
  IconUserExclamation,
  IconChalkboard,
  IconWand,
  IconDownload,
  IconUpload,
  IconFilterOff,
} from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from '@/components/shared/StatCard';
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

const ClassTeacherAllocation = () => {
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

  useEffect(() => {
    initData();
  }, []);

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

  const handleRowOpenDetail = (allocation) => {
    setDetailArm(allocation);
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
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 3,
      }}
    >
      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          {
            label: 'Total Classes',
            count: stats.totalClasses,
            icon: IconChalkboard,
            colorIndex: 0,
            subtitle: `${stats.totalArms} class arm${stats.totalArms !== 1 ? 's' : ''}`,
          },
          {
            label: 'Total Class Arms',
            count: stats.totalArms,
            icon: IconUsers,
            colorIndex: 2,
            subtitle: 'All class arms in the programme',
          },
          {
            label: 'Assigned',
            count: stats.armsWithTeacher,
            icon: IconUserCheck,
            colorIndex: 1,
            subtitle: 'Arms with a class teacher',
          },
          {
            label: 'Unassigned',
            count: stats.armsWithoutTeacher,
            icon: IconUserExclamation,
            colorIndex: 4,
            subtitle: 'Arms needing a class teacher',
          },
          {
            label: 'Class Teachers',
            count: stats.totalClassTeachers,
            icon: IconUserCheck,
            colorIndex: 3,
            subtitle: 'Distinct teachers assigned',
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 12 / 5 }}>
            <StatCard
              loading={loading && !hasFetched}
              label={card.label}
              count={card.count}
              icon={card.icon}
              colorIndex={card.colorIndex}
              subtitle={card.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Description + legend */}
      <Alert severity="info" sx={{ color: '#000000', backgroundColor: '#FFFAE6', mb: 2 }}>
        Select from classes below and allocate teacher to the class. Click a row to open its detail
        panel with suggested teachers.{' '}
        <Box component="span" sx={{ display: 'inline-flex', gap: 1.5, ml: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Assigned"
            size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#166534', height: 20, fontSize: '0.7rem' }}
          />
          <Chip
            label="Partial"
            size="small"
            sx={{ bgcolor: '#FEF3C7', color: '#92400E', height: 20, fontSize: '0.7rem' }}
          />
          <Chip
            label="Unassigned"
            size="small"
            sx={{ bgcolor: '#FEE2E2', color: '#991B1B', height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Alert>

      {/* Filters Row: Session -> Term -> Programme -> Class -> Status -> Fetch */}
      <Paper
        variant="contained"
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
              {sessions.map((session) => (
                <MenuItem key={session.id} value={session.id}>
                  {session.session_name}
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
              {sessionTerms.map((term) => (
                <MenuItem key={term.id} value={term.id}>
                  {term.term?.term_name || term.term_name}
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
              onChange={(e) => handleProgrammeChange(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select Programme</MenuItem>
              {programmes.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>
                  {prog.programme_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              fullWidth
              disabled={!selectedProgramme}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
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
              onClick={fetchAllocations}
              sx={{ height: '40px' }}
            >
              Fetch
            </Button>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            gap: 1,
            mt: 2,
          }}
        >
          <Button size="small" startIcon={<IconFilterOff size={16} />} onClick={handleResetFilters}>
            Reset
          </Button>
          <Tooltip title="Fill every class arm without a class teacher, using whichever active teaching staff member currently has the lightest load">
            <span>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<IconWand size={16} />}
                onClick={() => setAutoAllocateConfirmOpen(true)}
                disabled={!selectedProgramme || !selectedTerm || autoAllocating}
              >
                {autoAllocating ? 'Running…' : 'Auto-Allocate'}
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            startIcon={<IconDownload size={16} />}
            onClick={handleDownloadTemplate}
            disabled={!selectedProgramme}
          >
            Download Template
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<IconUpload size={16} />}
            onClick={() => setUploadModalOpen(true)}
          >
            Bulk Upload
          </Button>
        </Box>
      </Paper>

      {/* Table + detail panel */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {loading ? (
            <TableContainer>
              <Table sx={{ border: '1px solid #e0e0e0' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Students</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton variant="text" width={20} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={60} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={40} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rounded" width="100%" height={36} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rounded" width={80} height={22} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rounded" width={130} height={24} />
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
                  : 'Select a session, term, and programme, then click Fetch'}
              </Typography>
            </Box>
          ) : filteredGroupedAllocations.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No classes match the "{STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}"
                status filter
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
                <Button variant="contained" size="small" onClick={handleSaveAll} disabled={saving}>
                  {saving ? 'Saving...' : 'Save All'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filteredGroupedAllocations.map((group) => {
                  const collapsed = collapsedGroups.has(group.className);

                  return (
                    <Paper
                      key={group.className}
                      variant="contained"
                      sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          cursor: 'pointer',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
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
                              {group.rows[0]?.programme_name} — {group.className}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {group.rows.length} arm{group.rows.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          <Chip
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
                        <Button
                          size="small"
                          variant="contained"
                          disabled={savingGroup === group.className}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveGroup(group);
                          }}
                        >
                          {savingGroup === group.className ? 'Saving...' : 'Save'}
                        </Button>
                      </Box>

                      <Collapse in={!collapsed}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Total Students</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.rows.map((allocation) => (
                                <TableRow
                                  key={allocation.id}
                                  hover
                                  onClick={() => handleRowOpenDetail(allocation)}
                                  selected={detailArm?.class_arm_id === allocation.class_arm_id}
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
                                  <TableCell>{allocation.arm_name}</TableCell>
                                  <TableCell>{allocation.student_count ?? 0}</TableCell>
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Box sx={{ bgcolor: '#fcfcfcff', p: 1, borderRadius: 1 }}>
                                      <TextField
                                        select
                                        size="small"
                                        fullWidth
                                        placeholder="Select Teacher"
                                        value={allocation.teacher_id || ''}
                                        onChange={(e) =>
                                          handleTeacherChange(allocation._index, e.target.value)
                                        }
                                      >
                                        <MenuItem value="">Select Teacher</MenuItem>
                                        {teachers.map((teacher) => (
                                          <MenuItem key={teacher.user_id} value={teacher.user_id}>
                                            {teacher.user.full_name} ({teacher.staff_id})
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={allocation.teacher_id ? 'Assigned' : 'Unassigned'}
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
                                  <TableCell onClick={(e) => e.stopPropagation()}>
                                    {allocation.teacher_id && (
                                      <Chip
                                        label="Remove Allocation"
                                        size="small"
                                        onClick={() => handleRemoveAllocation(allocation._index)}
                                        onDelete={() => handleRemoveAllocation(allocation._index)}
                                        deleteIcon={<IconTrash size={14} />}
                                        sx={{
                                          bgcolor: '#ffebee',
                                          color: '#c62828',
                                          cursor: 'pointer',
                                          '& .MuiChip-deleteIcon': {
                                            color: '#c62828',
                                          },
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Box>
            </>
          )}
        </Box>

        {detailArm && (
          <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0 }}>
            <ClassArmDetailPanel
              arm={detailArm}
              programmeId={selectedProgramme}
              sessionTermId={selectedTerm}
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
