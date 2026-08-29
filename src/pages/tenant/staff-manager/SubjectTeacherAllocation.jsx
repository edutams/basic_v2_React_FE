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
  CircularProgress,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import staffApi from '@/api/tenant/staffs/staffApi';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import {
  fetchProgrammes,
  fetchClassArmsByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

const SubjectTeacherAllocation = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);

  // Filters
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
      setLoading(true);
      const [termsRes, progsRes, staffRes] = await Promise.all([
        fetchSessionTerms(),
        fetchProgrammes(),
        staffApi.getAll({ staff_type: 'teaching' }),
      ]);

      const terms = termsRes.data;
      setSessionTerms(terms);

      const activeTerm = terms.find((t) => t.status === 'active') || terms[0];
      const initialTermId = activeTerm ? activeTerm.id : '';
      if (initialTermId) {
        setActiveSessionTermId(initialTermId);
        setSelectedTerm(initialTermId);
      }

      const progs = progsRes.data;
      setProgrammes(progs);
      setTeachers(staffRes.data);

      if (progs.length > 0) {
        const firstProgId = progs[0].id;
        handleProgrammeChange(firstProgId, initialTermId);
      }
    } catch (error) {
      notify.error('Failed to initialize data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (termId) => {
    setSelectedTerm(termId);
    if (selectedProgramme && selectedClassArm) {
      fetchAllocations(selectedProgramme, selectedClassArm, termId);
    }
  };

  const handleProgrammeChange = async (progId, termId = null) => {
    setSelectedProgramme(progId);
    if (progId) {
      try {
        const classArmsRes = await fetchClassArmsByProgramme(progId);
        const arms = classArmsRes.data;
        setAvailableClasses(arms);

        const firstArmId = arms.length > 0 ? arms[0].id : '';
        setSelectedClassArm(firstArmId);

        if (firstArmId) {
          fetchAllocations(progId, firstArmId, termId || selectedTerm || activeSessionTermId);
        } else {
          setAllocations([]);
        }
      } catch (error) {
        notify.error('Failed to fetch class arms');
      }
    } else {
      setAllocations([]);
      setAvailableClasses([]);
      setSelectedClassArm('');
    }
  };

  const handleClassArmChange = (classArmId) => {
    setSelectedClassArm(classArmId);
    if (selectedProgramme && classArmId) {
      fetchAllocations(selectedProgramme, classArmId, selectedTerm);
    }
  };

  const fetchAllocations = async (progId, classArmId = null, termId = null) => {
    if (!progId) return;

    setLoading(true);
    try {
      const params = {
        programme_id: progId,
        session_term_id: termId || selectedTerm || activeSessionTermId,
      };

      if (classArmId) {
        params.class_arm_id = classArmId;
      }

      const response = await allocationApi.getSubjectTeacherAllocations(params);
      setAllocations(response.data);
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
          if (selectedProgramme && selectedClassArm) {
            fetchAllocations(selectedProgramme, selectedClassArm);
          }
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

    const targetTermId = selectedTerm || activeSessionTermId;
    if (!targetTermId) {
      notify.error('No active session term found');
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
        session_term_id: targetTermId,
        class_arm_id: selectedClassArm,
        allocations: allocationsData,
      });

      if (response.status) {
        notify.success('Subject teacher allocations saved successfully');
        if (selectedProgramme) {
          fetchAllocations(selectedProgramme, selectedClassArm);
        }
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save allocations');
      console.error(error);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3, color: '#000000', backgroundColor: '#FFFAE6' }}>
        Select from the list of subjects below and allocate a teacher to the subject
      </Alert>

      {/* Filters Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            size="small"
            label="Session Term"
            value={selectedTerm}
            onChange={(e) => handleTermChange(e.target.value)}
            fullWidth
          >
            {sessionTerms.map((term) => (
              <MenuItem key={term.id} value={term.id}>
                {term.session.sesname} · {term.display_term.display_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            size="small"
            label="Available Classes"
            value={selectedClassArm}
            onChange={(e) => handleClassArmChange(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Class</MenuItem>
            {availableClasses.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.programme_class.class.class_name} - {cls.arm_names}
              </MenuItem>
            ))}
          </TextField>
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
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                  <Typography color="textSecondary">
                    Select a programme to view subject allocations
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

