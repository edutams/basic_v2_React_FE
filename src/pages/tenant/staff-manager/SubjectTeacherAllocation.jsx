import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { IconTrash, IconSearch } from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import staffApi from '@/api/tenant/staffs/staffApi';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import {
  fetchProgrammes,
  fetchClassArmsByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

const SubjectTeacherAllocation = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Filters — nothing here re-fetches the table on its own; only the Fetch
  // button does. Session -> Term -> Programme -> Class Arm, in that order.
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedClassArm, setSelectedClassArm] = useState('');

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);

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

      const activeSession = allSessions.find((s) => s.status === 'active') || allSessions[0];
      if (activeSession) {
        setSelectedSession(activeSession.id);
        await loadTermsForSession(activeSession.id);
      }

      if (progs.length > 0) {
        setSelectedProgramme(progs[0].id);
        await loadClassArmsForProgramme(progs[0].id);
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

  const loadClassArmsForProgramme = async (progId) => {
    try {
      const classArmsRes = await fetchClassArmsByProgramme(progId);
      setAvailableClasses(classArmsRes.data || []);
      setSelectedClassArm('');
    } catch (error) {
      notify.error('Failed to fetch class arms');
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
    setAvailableClasses([]);
    setSelectedClassArm('');
    if (progId) {
      await loadClassArmsForProgramme(progId);
    }
  };

  const fetchAllocations = async () => {
    if (!selectedProgramme || !selectedTerm || !selectedClassArm) {
      notify.error('Select a session, term, programme, and class first');
      return;
    }

    setLoading(true);
    setHasFetched(true);
    try {
      const response = await allocationApi.getSubjectTeacherAllocations({
        programme_id: selectedProgramme,
        session_term_id: selectedTerm,
        class_arm_id: selectedClassArm,
      });
      setAllocations(response.data || []);
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
        const response = await allocationApi.removeSubjectTeacherAllocation(
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

  const handleSaveAll = async () => {
    if (!selectedClassArm) {
      notify.error('Please select a class first');
      return;
    }

    if (!selectedTerm) {
      notify.error('No session term selected');
      return;
    }

    try {
      const allocationsData = allocations
        .filter((a) => a.teacher_id)
        .map((a) => ({
          subject_id: a.subject_id,
          user_id: a.teacher_id,
        }));

      const response = await allocationApi.saveSubjectTeacherAllocations({
        session_term_id: selectedTerm,
        class_arm_id: selectedClassArm,
        allocations: allocationsData,
      });

      if (response.status) {
        notify.success('Subject teacher allocations saved successfully');
        fetchAllocations();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save allocations');
      console.error(error);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ color: '#000000', backgroundColor: '#FFFAE6', mb: 2 }}>
        Select from the list of subjects below and allocate a teacher to the subject
      </Alert>

      {/* Filters Row: Session -> Term -> Programme -> Class Arm -> Fetch */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
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
            value={selectedClassArm}
            onChange={(e) => setSelectedClassArm(e.target.value)}
            fullWidth
            disabled={!selectedProgramme}
          >
            <MenuItem value="">Select Class</MenuItem>
            {availableClasses.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.programme_class.class.class_name} - {cls.class_arm_names}
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

      {/* Table */}
      <TableContainer>
        <Table sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width={20} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={140} height={28} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width="100%" height={36} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={130} height={24} /></TableCell>
                </TableRow>
              ))
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Typography color="textSecondary">
                    {hasFetched
                      ? 'No subject allocations found for these filters'
                      : 'Select a session, term, programme, and class, then click Fetch'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation, index) => (
                <TableRow key={allocation.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ bgcolor: '#fcfcfcff', p: 1, borderRadius: 1 }}>
                      {allocation.subject_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ bgcolor: '#fcfcfcff', p: 1, borderRadius: 1 }}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        placeholder="Select Teacher"
                        value={allocation.teacher_id || ''}
                        onChange={(e) => handleTeacherChange(index, e.target.value)}
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
                        onClick={() => handleRemoveAllocation(index)}
                        onDelete={() => handleRemoveAllocation(index)}
                        deleteIcon={<IconTrash size={14} />}
                        sx={{
                          bgcolor: '#ffebee',
                          color: '#c62828',
                          cursor: 'pointer',
                          '& .MuiChip-deleteIcon': { color: '#c62828' },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save Button */}
      {allocations.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'right' }}>
          <Button variant="contained" size="small" onClick={handleSaveAll}>
            Save All
          </Button>
        </Box>
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

export default SubjectTeacherAllocation;
