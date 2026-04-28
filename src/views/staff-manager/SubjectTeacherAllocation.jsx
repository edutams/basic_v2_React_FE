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
  IconButton,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import staffApi from '../../api/staffApi';
import allocationApi from '../../api/allocationApi';
import { fetchProgrammes, fetchSubjectsByProgramme, fetchClassesByProgramme } from '../../api/tenantCurriculumApi';
import { fetchCurrentSession, fetchSessionTerms } from '../../api/sessionTermApi';
import useNotification from '../../hooks/useNotification';

const SubjectTeacherAllocation = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  
  // Filters
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedClassArm, setSelectedClassArm] = useState('');

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      // Fetch all subscribed session terms
      const termsRes = await fetchSessionTerms();
      if (termsRes.status) {
        const terms = termsRes.data || [];
        setSessionTerms(terms);
        
        // Find active term
        const activeTerm = terms.find(t => t.status?.toUpperCase() === 'ACTIVE');
        if (activeTerm) {
          setActiveSessionTermId(activeTerm.id);
          setSelectedTerm(activeTerm.id);
        } else if (terms.length > 0) {
          setActiveSessionTermId(terms[0].id);
          setSelectedTerm(terms[0].id);
        }
      }
      
      const progsRes = await fetchProgrammes();
      const progs = progsRes.data || [];
      setProgrammes(progs);
      if (progs.length > 0) {
        handleProgrammeChange(progs[0].id);
      }
      
      // Fetch teaching staff
      const staffRes = await staffApi.getAll({ staff_type: 'teaching' });
      if (staffRes.status) {
        setTeachers(staffRes.data || []);
      }
    } catch (error) {
      notify.error('Failed to initialize data');
      console.error(error);
    }
  };

  const handleTermChange = (termId) => {
    setSelectedTerm(termId);
    if (selectedProgramme && selectedClassArm) {
      fetchAllocations(selectedProgramme, selectedClassArm, termId);
    }
  };

  const handleProgrammeChange = async (progId) => {
    setSelectedProgramme(progId);
    if (progId) {
      try {
        const subjectsRes = await fetchSubjectsByProgramme(progId);
        setSubjects(subjectsRes.data || []);
        
        // Fetch classes for this programme
        const classesRes = await fetchClassesByProgramme(progId);
        setAvailableClasses(classesRes.data || []);
        
        fetchAllocations(progId, selectedClassArm, selectedTerm);
      } catch (error) {
        notify.error('Failed to fetch subjects');
      }
    } else {
      setSubjects([]);
      setAllocations([]);
      setAvailableClasses([]);
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
      
      if (response.status) {
        setAllocations(response.data || []);
      }
    } catch (error) {
      notify.error('Failed to fetch allocations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (index, teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      teacher_id: teacherId,
      teacher_name: teacher ? `${teacher.user?.fname} ${teacher.user?.lname} (${teacher.staff_id})` : '',
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
        // Remove from backend
        const response = await allocationApi.removeSubjectTeacherAllocation(allocationToDelete.allocation_id);
        if (response.status) {
          notify.success('Allocation removed successfully');
          if (selectedProgramme && selectedClassArm) {
            fetchAllocations(selectedProgramme, selectedClassArm);
          }
        }
      } else {
        // Just clear locally if not yet saved to backend
        const updatedAllocations = allocations.map(a => 
          a.id === allocationToDelete.id 
            ? { ...a, teacher_id: null, teacher_name: '' } 
            : a
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

    if (!activeSessionTermId) {
      notify.error('No active session term found');
      return;
    }

    try {
      // Prepare allocations data
      const allocationsData = allocations
        .filter(a => a.teacher_id) // Only send allocations with teachers
        .map(a => ({
          subject_id: a.subject_id,
          user_id: a.teacher_id,
        }));

      const response = await allocationApi.saveSubjectTeacherAllocations({
        session_term_id: selectedTerm || activeSessionTermId,
        class_arm_id: selectedClassArm,
        allocations: allocationsData,
      });

      if (response.status) {
        notify.success('Subject teacher allocations saved successfully');
        // Refresh allocations
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
      {/* Description */}
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Select from the list of subjects below and allocate a teacher to the subject
      </Typography>

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
                {term.display_name}
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
            label="Select Program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Program</MenuItem>
            <MenuItem value="all">All Programs</MenuItem>
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
                {cls.class_name}
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
                          <MenuItem key={teacher.id} value={teacher.id}>
                            {teacher.user?.fname} {teacher.user?.lname} ({teacher.staff_id})
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
                          '& .MuiChip-deleteIcon': { color: '#c62828' }
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
          <Button
            variant="contained"
            onClick={handleSaveAll}
            sx={{ 
              textTransform: 'none', 
              bgcolor: '#7cb342', 
              '&:hover': { bgcolor: '#689f38' },
              px: 4,
            }}
          >
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
