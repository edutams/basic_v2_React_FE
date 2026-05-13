import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByProgramme,
  fetchClassArmsByClass,
  fetchCurriculums,
  fetchSubjects,
  fetchSessionTerms,
} from '../../../api/tenantCurriculumApi';
import useNotification from '../../../hooks/useNotification';

const StaffAllocationFields = ({ values, handleChange, setFieldValue, isLoading }) => {
  const notify = useNotification();
  
  const [programmes, setProgrammes] = useState([]);
  const [sessionTerms, setSessionTerms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  
  // Separate states for class allocation
  const [classClasses, setClassClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  
  // Separate states for subject allocation
  const [subjectClasses, setSubjectClasses] = useState([]);
  const [subjectClassArms, setSubjectClassArms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag to track initial load

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
      
      console.log('Loading edit mode data for staff allocation');
      
      // Load class allocation data if values exist
      if (values.class_programme_id) {
        try {
          const classRes = await fetchClassesByProgramme(values.class_programme_id);
          const classes = classRes.data || classRes || [];
          setClassClasses(classes);
          
          if (values.class_id) {
            const armRes = await fetchClassArmsByClass(values.class_id);
            const allArms = armRes.data || armRes || [];
            setClassArms(allArms);
          }
        } catch (error) {
          console.error('Failed to load class allocation data:', error);
        }
      }
      
      // Load subject allocation data if values exist
      if (values.subject_programme_id) {
        try {
          const classRes = await fetchClassesByProgramme(values.subject_programme_id);
          const classes = classRes.data || classRes || [];
          setSubjectClasses(classes);
          
          if (values.subject_class_id) {
            const armRes = await fetchClassArmsByClass(values.subject_class_id);
            const allArms = armRes.data || armRes || [];
            setSubjectClassArms(allArms);
          }
        } catch (error) {
          console.error('Failed to load subject allocation data:', error);
        }
      }
      
      // Load subjects if curriculum is selected
      if (values.subject_curriculum_id) {
        try {
          const res = await fetchSubjects(values.subject_curriculum_id);
          const subjects = res.data || res || [];
          setSubjects(subjects);
        } catch (error) {
          console.error('Failed to load subjects:', error);
        }
      }
      
      // Mark initial load as complete
      setIsInitialLoad(false);
    };
    
    loadEditModeData();
  }, [
    isInitialLoad,
    loadingOptions,
    programmes.length,
    values.class_programme_id,
    values.class_id,
    values.subject_programme_id,
    values.subject_class_id,
    values.subject_curriculum_id
  ]);

  // Class allocation handlers
  const handleClassProgrammeChange = async (programmeId) => {
    setIsInitialLoad(false); // Prevent useEffect from running
    setFieldValue('class_programme_id', programmeId);
    setFieldValue('class_id', '');
    setFieldValue('class_arm_id', '');
    setClassClasses([]);
    setClassArms([]);
    
    if (programmeId) {
      try {
        const res = await fetchClassesByProgramme(programmeId);
        setClassClasses(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleClassChange = async (classId) => {
    setIsInitialLoad(false); // Prevent useEffect from running
    setFieldValue('class_id', classId);
    setFieldValue('class_arm_id', '');
    setClassArms([]);
    
    if (classId) {
      try {
        const res = await fetchClassArmsByClass(classId);
        setClassArms(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load class arms');
      }
    }
  };

  // Subject allocation handlers
  const handleSubjectProgrammeChange = async (programmeId) => {
    setIsInitialLoad(false); // Prevent useEffect from running
    setFieldValue('subject_programme_id', programmeId);
    setFieldValue('subject_class_id', '');
    setFieldValue('subject_class_arm_id', '');
    setSubjectClasses([]);
    setSubjectClassArms([]);
    
    if (programmeId) {
      try {
        const res = await fetchClassesByProgramme(programmeId);
        setSubjectClasses(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load classes');
      }
    }
  };

  const handleSubjectClassChange = async (classId) => {
    setIsInitialLoad(false); // Prevent useEffect from running
    setFieldValue('subject_class_id', classId);
    setFieldValue('subject_class_arm_id', '');
    setSubjectClassArms([]);
    
    if (classId) {
      try {
        const res = await fetchClassArmsByClass(classId);
        setSubjectClassArms(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load class arms');
      }
    }
  };

  const handleCurriculumChange = async (curriculumId) => {
    setIsInitialLoad(false); // Prevent useEffect from running
    setFieldValue('subject_curriculum_id', curriculumId);
    setFieldValue('subject_id', '');
    if (curriculumId) {
      try {
        const res = await fetchSubjects(curriculumId);
        setSubjects(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load subjects');
      }
    } else {
      setSubjects([]);
    }
  };

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'primary.main' }}>
        Allocation
      </Typography>

      {/* 1. Class Allocation */}
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'text.secondary' }}>
        1. Class Allocation
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Session Term"
            name="class_session_term_id"
            value={values.class_session_term_id}
            onChange={handleChange}
            disabled={loadingOptions || isLoading}
          >
            <MenuItem value="">Select Session Term</MenuItem>
            {sessionTerms.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                {st.session.sesname} - {st?.display_term?.display_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} >
          <TextField
            fullWidth
            select
            label="Programme"
            name="class_programme_id"
            value={values.class_programme_id}
            onChange={(e) => handleClassProgrammeChange(e.target.value)}
            disabled={loadingOptions || isLoading}
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
            name="class_id"
            value={values.class_id}
            onChange={(e) => handleClassChange(e.target.value)}
            disabled={!values.class_programme_id || isLoading}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classClasses.map((c) => (
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
            name="class_arm_id"
            value={values.class_arm_id}
            onChange={handleChange}
            disabled={!values.class_id || isLoading}
          >
            <MenuItem value="">Select Class Arm</MenuItem>
            {classArms.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.programme_class?.class?.class_code || 'N/A'} - {c.arm_names}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Center Divider */}
      <Divider orientation="horizontal" flexItem sx={{ mb: 4 }} />

      {/* 2. Subject Allocation */}
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'text.secondary' }}>
        2. Subject Allocation
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }} >
          <TextField
            fullWidth
            select
            label="Session Term"
            name="subject_session_term_id"
            value={values.subject_session_term_id}
            onChange={handleChange}
            disabled={loadingOptions || isLoading}
          >
            <MenuItem value="">Select Session Term</MenuItem>
            {sessionTerms.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                {st.session.sesname} - {st?.display_term?.display_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} >
          <TextField
            fullWidth
            select
            label="Programme"
            name="subject_programme_id"
            value={values.subject_programme_id}
            onChange={(e) => handleSubjectProgrammeChange(e.target.value)}
            disabled={loadingOptions || isLoading}
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
            name="subject_class_id"
            value={values.subject_class_id}
            onChange={(e) => handleSubjectClassChange(e.target.value)}
            disabled={!values.subject_programme_id || isLoading}
          >
            <MenuItem value="">Select Class</MenuItem>
            {subjectClasses.map((c) => (
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
            name="subject_class_arm_id"
            value={values.subject_class_arm_id}
            onChange={handleChange}
            disabled={!values.subject_class_id || isLoading}
          >
            <MenuItem value="">Select Class Arm</MenuItem>
            {subjectClassArms.map((c) => (
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
            name="subject_curriculum_id"
            value={values.subject_curriculum_id}
            onChange={(e) => handleCurriculumChange(e.target.value)}
            disabled={loadingOptions || isLoading}
          >
            <MenuItem value="">Select Curriculum</MenuItem>
            {curriculums.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.curriculum_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Subject"
            name="subject_id"
            value={values.subject_id}
            onChange={handleChange}
            disabled={!values.subject_curriculum_id || isLoading}
          >
            <MenuItem value="">Select Subject</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.subject_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </>
  );
};

export default StaffAllocationFields;
