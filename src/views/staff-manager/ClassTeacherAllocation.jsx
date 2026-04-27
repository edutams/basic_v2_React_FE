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

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      // Fetch current session
      const sessionRes = await fetchCurrentSession();
      if (sessionRes.status && sessionRes.data) {
        const currentSession = sessionRes.data;
        
        // Fetch session terms
        const termsRes = await fetchSessionTerms(currentSession.id);
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
      }
      
      const progsRes = await fetchProgrammes();
      setProgrammes(progsRes.data || []);
      
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

  const handleProgrammeChange = async (progId) => {
    setSelectedProgramme(progId);
    if (progId) {
      try {
        const classesRes = await fetchClassesByProgramme(progId);
        setClasses(classesRes.data || []);
        fetchAllocations(progId);
      } catch (error) {
        notify.error('Failed to fetch classes');
      }
    } else {
      setClasses([]);
      setAllocations([]);
    }
  };

  const fetchAllocations = async (progId) => {
    setLoading(true);
    try {
      const response = await allocationApi.getClassTeacherAllocations({
        programme_id: progId,
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
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      teacher_id: null,
      teacher_name: '',
    };
    setAllocations(updatedAllocations);
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
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Select from classes below and allocate teacher to the class
      </Typography>

      {/* Filters Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            size="small"
            label="Session Term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            fullWidth
          >
            {sessionTerms.map((term) => (
              <MenuItem key={term.id} value={term.id}>
                {term.display_name || term.term_name}
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
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>Programme</TableCell>
              <TableCell sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>Class Name</TableCell>
              <TableCell sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>Teachers Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>+</TableCell>
              <TableCell sx={{ fontWeight: 700, border: '1px solid #e0e0e0' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="textSecondary">
                    Select a programme to view class allocations
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation, index) => (
                <TableRow key={allocation.id} hover>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {allocation.programme}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {allocation.class_name}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {allocation.teacher_name ? (
                      <Typography variant="body2">{allocation.teacher_name}</Typography>
                    ) : (
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
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                    <IconButton size="small" color="primary">
                      <Typography sx={{ fontSize: 20, fontWeight: 700 }}>+</Typography>
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                    {allocation.teacher_id && (
                      <Chip
                        label="Remove Allocation"
                        size="small"
                        onDelete={() => handleRemoveAllocation(index)}
                        deleteIcon={<IconTrash size={14} />}
                        sx={{ 
                          bgcolor: '#ffebee', 
                          color: '#c62828',
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
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
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
    </Box>
  );
};

export default ClassTeacherAllocation;
