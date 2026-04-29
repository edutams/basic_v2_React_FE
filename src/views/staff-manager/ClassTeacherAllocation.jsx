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
  Alert,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import staffApi from '../../api/staffApi';
import allocationApi from '../../api/allocationApi';
import { fetchProgrammes, fetchClassesByProgramme } from '../../api/tenantCurriculumApi';
import { fetchCurrentSession, fetchSessionTerms } from '../../api/sessionTermApi';
import useNotification from '../../hooks/useNotification';

const ClassTeacherAllocation = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);

  // Filters
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

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
    if (selectedProgramme) {
      fetchAllocations(selectedProgramme, termId);
    }
  };

  const handleProgrammeChange = async (progId) => {
    setSelectedProgramme(progId);
    if (progId) {
      try {
        const classesRes = await fetchClassesByProgramme(progId);
        setClasses(classesRes.data || []);
        fetchAllocations(progId, selectedTerm);
      } catch (error) {
        notify.error('Failed to fetch classes');
      }
    } else {
      setClasses([]);
      setAllocations([]);
    }
  };

  const fetchAllocations = async (progId, termId = null) => {
    if (!progId) return;

    setLoading(true);
    try {
      const response = await allocationApi.getClassTeacherAllocations({
        programme_id: progId,
        session_term_id: termId || selectedTerm || activeSessionTermId,
      });

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
        const response = await allocationApi.removeClassTeacherAllocation(allocationToDelete.allocation_id);
        if (response.status) {
          notify.success('Allocation removed successfully');
          if (selectedProgramme) {
            fetchAllocations(selectedProgramme);
          }
        }
      } else {
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
    if (!activeSessionTermId) {
      notify.error('No active session term found');
      return;
    }

    try {
      // Prepare allocations data
      const allocationsData = allocations
        .filter(a => a.teacher_id) // Only send allocations with teachers
        .map(a => ({
          class_arm_id: a.class_arm_id,
          user_id: a.teacher_id,
        }));

      const response = await allocationApi.saveClassTeacherAllocations({
        session_term_id: selectedTerm || activeSessionTermId,
        allocations: allocationsData,
      });

      if (response.status) {
        notify.success('Class teacher allocations saved successfully');
        // Refresh allocations
        if (selectedProgramme) {
          fetchAllocations(selectedProgramme);
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
      <Alert severity="info" sx={{ mb: 3, color: '#000000', backgroundColor: '#FFFAE6' }}>
        Select from classes below and allocate teacher to the class
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


      </Grid>

      {/* Table */}
      <TableContainer>
        <Table sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Programme</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Teachers Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <Typography color="textSecondary">
                    Select a programme to view class allocations
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation, index) => (
                <TableRow key={allocation.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ bgcolor: '#fcfcfcff', p: 1, borderRadius: 1 }}>

                      {allocation.programme_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {allocation.class_name}
                    {' '}
                    {allocation.arm_name}
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

                  <TableCell >
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
                          '& .MuiChip-deleteIcon': {
                            color: '#c62828'
                          }
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

export default ClassTeacherAllocation;
