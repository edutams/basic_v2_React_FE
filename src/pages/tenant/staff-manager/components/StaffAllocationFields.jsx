import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByProgramme,
  fetchClassArmsByClass,
  fetchCurriculums,
  fetchSubjects,
  fetchSessionTerms,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import useNotification from '@/hooks/useNotification';

const StaffAllocationFields = ({
  values,
  handleChange,
  setFieldValue,
  isLoading,
  errors,
  touched,
  mode,
}) => {
  const notify = useNotification();

  const [programmes, setProgrammes] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);

  // Separate states for class allocation
  const [classClasses, setClassClasses] = useState({});
  const [classArms, setClassArms] = useState({});

  // Separate states for subject allocation
  const [subjectClasses, setSubjectClasses] = useState({});
  const [subjectClassArms, setSubjectClassArms] = useState({});
  const [subjects, setSubjects] = useState({});

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag to track initial load

  // Reset initial load flag when mode changes (for edit mode)
  useEffect(() => {
    setIsInitialLoad(true);
  }, [mode]);

  // Initialize arrays if they don't exist
  useEffect(() => {
    if (!Array.isArray(values.classAllocations)) {
      setFieldValue('classAllocations', [
        {
          session_term_id: '',
          programme_id: '',
          class_id: '',
          class_arm_id: '',
        },
      ]);
    }
    if (!Array.isArray(values.subjectAllocations)) {
      setFieldValue('subjectAllocations', [
        {
          session_term_id: '',
          programme_id: '',
          class_id: '',
          class_arm_id: '',
          curriculum_id: '',
          subject_id: '',
        },
      ]);
    }
  }, []);

  const classAllocations = values.classAllocations || [];
  const subjectAllocations = values.subjectAllocations || [];

  // Helper function to get error for a specific field
  const getFieldError = (fieldPath) => {
    const pathParts = fieldPath.split('.');
    let error = errors;
    for (const part of pathParts) {
      if (error && typeof error === 'object') {
        error = error[part];
      } else {
        return null;
      }
    }
    return error;
  };

  // Helper function to check if field is touched
  const isFieldTouched = (fieldPath) => {
    const pathParts = fieldPath.split('.');
    let touchedField = touched;
    for (const part of pathParts) {
      if (touchedField && typeof touchedField === 'object') {
        touchedField = touchedField[part];
      } else {
        return false;
      }
    }
    return touchedField;
  };

  useEffect(() => {
    const loadInitialOptions = async () => {
      setLoadingOptions(true);
      try {
        const [progRes, sessionRes, currRes] = await Promise.all([
          fetchProgrammes(),
          fetchSessionTerms(),
          fetchCurriculums(),
        ]);
        setProgrammes(progRes.data || progRes || []);
        setSessionTerms(sessionRes.data || sessionRes || []);
        setCurriculums(currRes.data || currRes || []);
      } catch (error) {
        console.error('Failed to load options:', error);
        notify.error('Failed to load allocation options');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadInitialOptions();
  }, []);

  // Separate effect to handle initial data loading for edit mode ONLY
  useEffect(() => {
    const loadEditModeData = async () => {
      // Only run on initial load, not on user interactions
      if (!isInitialLoad || loadingOptions || programmes.length === 0) return;

      try {
        // Load class allocation data if values exist
        if (classAllocations.length > 0) {
          for (let i = 0; i < classAllocations.length; i++) {
            const allocation = classAllocations[i];

            // Load classes for this programme
            if (allocation.programme_id) {
              try {
                const classRes = await fetchClassesByProgramme(allocation.programme_id);
                const classes = classRes.data || classRes || [];
                setClassClasses((prev) => ({ ...prev, [i]: classes }));

                // Load class arms for this class
                if (allocation.class_id) {
                  const armRes = await fetchClassArmsByClass(allocation.class_id);
                  const allArms = armRes.data || armRes || [];

                  setClassArms((prev) => ({ ...prev, [i]: allArms }));
                }
              } catch (error) {
                console.error(`Failed to load class allocation data for index ${i}:`, error);
              }
            }
          }
        }

        // Load subject allocation data if values exist
        if (subjectAllocations.length > 0) {
          for (let i = 0; i < subjectAllocations.length; i++) {
            const allocation = subjectAllocations[i];

            // Load classes for this programme
            if (allocation.programme_id) {
              try {
                const classRes = await fetchClassesByProgramme(allocation.programme_id);
                const classes = classRes.data || classRes || [];

                setSubjectClasses((prev) => ({ ...prev, [i]: classes }));

                // Load class arms for this class
                if (allocation.class_id) {
                  const armRes = await fetchClassArmsByClass(allocation.class_id);
                  const allArms = armRes.data || armRes || [];
                  setSubjectClassArms((prev) => ({ ...prev, [i]: allArms }));
                }
              } catch (error) {
                console.error(
                  `Failed to load subject allocation class data for index ${i}:`,
                  error,
                );
              }
            }

            // Load subjects if curriculum is selected
            if (allocation.curriculum_id) {
              try {
                const res = await fetchSubjects(allocation.curriculum_id);
                const subjectList = res.data || res || [];
                setSubjects((prev) => ({ ...prev, [i]: subjectList }));
              } catch (error) {
                console.error(`Failed to load subjects for index ${i}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in loadEditModeData:', error);
      } finally {
        // Mark initial load as complete
        setIsInitialLoad(false);
      }
    };

    loadEditModeData();
  }, [
    isInitialLoad,
    loadingOptions,
    programmes.length,
    // Remove the length dependencies to prevent re-triggering
    // classAllocations.length,
    // subjectAllocations.length
  ]);

  // Class allocation handlers
  const handleClassProgrammeChange = async (index, programmeId) => {
    setIsInitialLoad(false);
    const newAllocations = [...classAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      programme_id: programmeId,
      class_id: '',
      class_arm_id: '',
    };
    setFieldValue('classAllocations', newAllocations);

    // Clear dependent states
    setClassClasses((prev) => ({ ...prev, [index]: [] }));
    setClassArms((prev) => ({ ...prev, [index]: [] }));

    if (programmeId) {
      try {
        const res = await fetchClassesByProgramme(programmeId);
        setClassClasses((prev) => ({ ...prev, [index]: res.data || res || [] }));
      } catch (error) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleClassChange = async (index, classId) => {
    setIsInitialLoad(false);
    const newAllocations = [...classAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      class_id: classId,
      class_arm_id: '',
    };
    setFieldValue('classAllocations', newAllocations);

    // Clear dependent states
    setClassArms((prev) => ({ ...prev, [index]: [] }));

    if (classId) {
      try {
        const res = await fetchClassArmsByClass(classId);
        setClassArms((prev) => ({ ...prev, [index]: res.data || res || [] }));
      } catch (error) {
        notify.error('Failed to load class arms');
      }
    }
  };

  const handleClassAllocationChange = (index, field, value) => {
    const newAllocations = [...classAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: value,
    };
    setFieldValue('classAllocations', newAllocations);
  };

  const addClassAllocation = () => {
    const newAllocations = [
      ...classAllocations,
      {
        id: null, // No ID for new records
        session_term_id: '',
        programme_id: '',
        class_id: '',
        class_arm_id: '',
      },
    ];
    setFieldValue('classAllocations', newAllocations);
  };

  const removeClassAllocation = (index) => {
    if (classAllocations.length > 1) {
      const newAllocations = classAllocations.filter((_, i) => i !== index);
      setFieldValue('classAllocations', newAllocations);

      // Clean up states
      setClassClasses((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setClassArms((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  // Subject allocation handlers
  const handleSubjectProgrammeChange = async (index, programmeId) => {
    setIsInitialLoad(false);
    const newAllocations = [...subjectAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      programme_id: programmeId,
      class_id: '',
      class_arm_id: '',
    };
    setFieldValue('subjectAllocations', newAllocations);

    // Clear dependent states
    setSubjectClasses((prev) => ({ ...prev, [index]: [] }));
    setSubjectClassArms((prev) => ({ ...prev, [index]: [] }));

    if (programmeId) {
      try {
        const res = await fetchClassesByProgramme(programmeId);
        setSubjectClasses((prev) => ({ ...prev, [index]: res.data || res || [] }));
      } catch (error) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleSubjectClassChange = async (index, classId) => {
    setIsInitialLoad(false);
    const newAllocations = [...subjectAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      class_id: classId,
      class_arm_id: '',
    };
    setFieldValue('subjectAllocations', newAllocations);

    // Clear dependent states
    setSubjectClassArms((prev) => ({ ...prev, [index]: [] }));

    if (classId) {
      try {
        const res = await fetchClassArmsByClass(classId);
        setSubjectClassArms((prev) => ({ ...prev, [index]: res.data || res || [] }));
      } catch (error) {
        notify.error('Failed to load class arms');
      }
    }
  };

  const handleCurriculumChange = async (index, curriculumId) => {
    setIsInitialLoad(false);
    const newAllocations = [...subjectAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      curriculum_id: curriculumId,
      subject_id: '',
    };
    setFieldValue('subjectAllocations', newAllocations);

    if (curriculumId) {
      try {
        const res = await fetchSubjects(curriculumId);
        setSubjects((prev) => ({ ...prev, [index]: res.data || res || [] }));
      } catch (error) {
        notify.error('Failed to load subjects');
      }
    } else {
      setSubjects((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSubjectAllocationChange = (index, field, value) => {
    const newAllocations = [...subjectAllocations];
    newAllocations[index] = {
      ...newAllocations[index],
      [field]: value,
    };
    setFieldValue('subjectAllocations', newAllocations);
  };

  const addSubjectAllocation = () => {
    const newAllocations = [
      ...subjectAllocations,
      {
        id: null, // No ID for new records
        session_term_id: '',
        programme_id: '',
        class_id: '',
        class_arm_id: '',
        curriculum_id: '',
        subject_id: '',
      },
    ];
    setFieldValue('subjectAllocations', newAllocations);
  };

  const removeSubjectAllocation = (index) => {
    if (subjectAllocations.length > 1) {
      const newAllocations = subjectAllocations.filter((_, i) => i !== index);
      setFieldValue('subjectAllocations', newAllocations);

      // Clean up states
      setSubjectClasses((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setSubjectClassArms((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setSubjects((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'primary.main' }}>
        Allocation
      </Typography>

      {/* 1. Class Allocation */}
      <Box sx={{ mb: 4 }} id="classAllocations-section">
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary' }}>
            1. Class Allocation
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addClassAllocation}
            disabled={isLoading}
            sx={{ minWidth: 'auto' }}
          >
            Add More
          </Button>
        </Box>

        {classAllocations.map((allocation, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Class Assignment {index + 1}
              </Typography>
              {classAllocations.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeClassAllocation(index)}
                  disabled={isLoading}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Session Term"
                  value={allocation.session_term_id}
                  onChange={(e) => handleClassAllocationChange(index, 'session_term_id', e.target.value)}
                  disabled={loadingOptions || isLoading}
                  required
                >
                  <MenuItem value="">Select Session Term</MenuItem>
                  {sessionTerms.map((st) => (
                    <MenuItem key={st.id} value={st.id}>
                      {st.session.sesname} - {st?.display_term?.display_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid> */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Programme"
                  name={`classAllocations[${index}].programme_id`}
                  value={allocation.programme_id}
                  onChange={(e) => handleClassProgrammeChange(index, e.target.value)}
                  disabled={loadingOptions || isLoading}
                  required
                  error={Boolean(getFieldError(`classAllocations.${index}.programme_id`))}
                  helperText={getFieldError(`classAllocations.${index}.programme_id`)}
                >
                  <MenuItem value="">Select Programme</MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Class"
                  name={`classAllocations[${index}].class_id`}
                  value={allocation.class_id}
                  onChange={(e) => handleClassChange(index, e.target.value)}
                  disabled={!allocation.programme_id || isLoading}
                  // required
                  error={Boolean(getFieldError(`classAllocations.${index}.class_id`))}
                  helperText={getFieldError(`classAllocations.${index}.class_id`)}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {(classClasses[index] || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Class Arm"
                  name={`classAllocations[${index}].class_arm_id`}
                  value={allocation.class_arm_id}
                  onChange={(e) =>
                    handleClassAllocationChange(index, 'class_arm_id', e.target.value)
                  }
                  disabled={!allocation.class_id || isLoading}
                  // required
                  error={Boolean(getFieldError(`classAllocations.${index}.class_arm_id`))}
                  helperText={getFieldError(`classAllocations.${index}.class_arm_id`)}
                >
                  <MenuItem value="">Select Class Arm</MenuItem>
                  {(classArms[index] || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.programme_class?.class?.class_code || 'N/A'} - {c.arm_names}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Center Divider */}
      <Divider orientation="horizontal" flexItem sx={{ mb: 4 }} />

      {/* 2. Subject Allocation */}
      <Box id="subjectAllocations-section">
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary' }}>
            2. Subject Allocation
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addSubjectAllocation}
            disabled={isLoading}
            sx={{ minWidth: 'auto' }}
          >
            Add More
          </Button>
        </Box>

        {subjectAllocations.map((allocation, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Subject Assignment {index + 1}
              </Typography>
              {subjectAllocations.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeSubjectAllocation(index)}
                  disabled={isLoading}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              {/* <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Session Term"
                  value={allocation.session_term_id}
                  onChange={(e) => handleSubjectAllocationChange(index, 'session_term_id', e.target.value)}
                  disabled={loadingOptions || isLoading}
                  required
                >
                  <MenuItem value="">Select Session Term</MenuItem>
                  {sessionTerms.map((st) => (
                    <MenuItem key={st.id} value={st.id}>
                      {st.session.sesname} - {st?.display_term?.display_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid> */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Programme"
                  name={`subjectAllocations[${index}].programme_id`}
                  value={allocation.programme_id}
                  onChange={(e) => handleSubjectProgrammeChange(index, e.target.value)}
                  disabled={loadingOptions || isLoading}
                  // required
                  error={Boolean(getFieldError(`subjectAllocations.${index}.programme_id`))}
                  helperText={getFieldError(`subjectAllocations.${index}.programme_id`)}
                >
                  <MenuItem value="">Select Programme</MenuItem>
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.programme_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Class"
                  name={`subjectAllocations[${index}].class_id`}
                  value={allocation.class_id}
                  onChange={(e) => handleSubjectClassChange(index, e.target.value)}
                  disabled={!allocation.programme_id || isLoading}
                  // required
                  error={Boolean(getFieldError(`subjectAllocations.${index}.class_id`))}
                  helperText={getFieldError(`subjectAllocations.${index}.class_id`)}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {(subjectClasses[index] || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.class_code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Class Arm"
                  name={`subjectAllocations[${index}].class_arm_id`}
                  value={allocation.class_arm_id}
                  onChange={(e) =>
                    handleSubjectAllocationChange(index, 'class_arm_id', e.target.value)
                  }
                  disabled={!allocation.class_id || isLoading}
                  // required
                  error={Boolean(getFieldError(`subjectAllocations.${index}.class_arm_id`))}
                  helperText={getFieldError(`subjectAllocations.${index}.class_arm_id`)}
                >
                  <MenuItem value="">Select Class Arm</MenuItem>
                  {(subjectClassArms[index] || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.programme_class?.class?.class_code || 'N/A'} - {c.arm_names}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Curriculum"
                  name={`subjectAllocations[${index}].curriculum_id`}
                  value={allocation.curriculum_id}
                  onChange={(e) => handleCurriculumChange(index, e.target.value)}
                  disabled={loadingOptions || isLoading}
                  // required
                  error={Boolean(getFieldError(`subjectAllocations.${index}.curriculum_id`))}
                  helperText={getFieldError(`subjectAllocations.${index}.curriculum_id`)}
                >
                  <MenuItem value="">Select Curriculum</MenuItem>
                  {curriculums.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.curriculum_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Subject"
                  name={`subjectAllocations[${index}].subject_id`}
                  value={allocation.subject_id}
                  onChange={(e) =>
                    handleSubjectAllocationChange(index, 'subject_id', e.target.value)
                  }
                  disabled={!allocation.curriculum_id || isLoading}
                  // required
                  error={Boolean(getFieldError(`subjectAllocations.${index}.subject_id`))}
                  helperText={getFieldError(`subjectAllocations.${index}.subject_id`)}
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {(subjects[index] || []).map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.subject_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default StaffAllocationFields;
