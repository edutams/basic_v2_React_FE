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
  Collapse,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { IconTrash, IconSearch } from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import staffApi from '@/api/tenant/staffs/staffApi';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

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

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingGroup, setSavingGroup] = useState(null);

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

  const handleTeacherChange = (index, teacherUserId) => {
    const teacher = teachers.find((t) => t.user_id === teacherUserId);
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      teacher_id: teacherUserId,
      teacher_name: teacher ? teacher.user.full_name : '',
    };
    setAllocations(updatedAllocations);
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

  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 3,
      }}
    >
      {/* Description */}
      <Alert severity="info" sx={{ color: '#000000', backgroundColor: '#FFFAE6', mb: 2 }}>
        Select from classes below and allocate teacher to the class
      </Alert>

      {/* Filters Row: Session -> Term -> Programme -> Class -> Fetch */}
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
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
      </Paper>

      {/* Table */}
      {loading ? (
        <TableContainer>
          <Table sx={{ border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Arm</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width={20} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width="100%" height={36} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={130} height={24} /></TableCell>
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
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Button size="small" onClick={collapseAll}>
              Collapse all
            </Button>
            <Button size="small" variant="outlined" onClick={expandAll}>
              Expand all
            </Button>
            <Button variant="contained" size="small" onClick={handleSaveAll} disabled={saving}>
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {groupedAllocations.map((group) => {
              const collapsed = collapsedGroups.has(group.className);
              const withTeacher = group.rows.filter((r) => r.teacher_id).length;

              return (
                <Paper
                  key={group.className}
                  variant="outlined"
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
                          {group.rows.length} arm{group.rows.length !== 1 ? 's' : ''} · {withTeacher}{' '}
                          with a teacher
                          {group.rows.length - withTeacher > 0
                            ? ` · ${group.rows.length - withTeacher} still need one`
                            : ''}
                        </Typography>
                      </Box>
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
                            <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.rows.map((allocation) => (
                            <TableRow key={allocation.id} hover>
                              <TableCell>{allocation.arm_name}</TableCell>
                              <TableCell>
                                <Box sx={{ bgcolor: '#fcfcfcff', p: 1, borderRadius: 1 }}>
                                  <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    placeholder="Select Teacher"
                                    value={allocation.teacher_id || ''}
                                    onChange={(e) => handleTeacherChange(allocation._index, e.target.value)}
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
    </Box>
  );
};

export default ClassTeacherAllocation;
