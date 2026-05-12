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
  fetchClassArmsByProgramme,
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
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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

  // Handle initial loads for edit mode
  useEffect(() => {
    const fetchInitialDependencies = async () => {
      if (values.class_programme_id) {
        try {
          const res = await fetchClassArmsByProgramme(values.class_programme_id);
          setClasses(res.data || res || []);
        } catch (error) { }
      }
      if (values.subject_curriculum_id) {
        try {
          const res = await fetchSubjects(values.subject_curriculum_id);
          setSubjects(res.data || res || []);
        } catch (error) { }
      }
      // Also load classes for subject programme if it exists
      if (values.subject_programme_id && values.subject_programme_id !== values.class_programme_id) {
        try {
          const res = await fetchClassArmsByProgramme(values.subject_programme_id);
          // We could maintain separate state for subject classes, but for now use the same classes state
          if (!classes.length) {
            setClasses(res.data || res || []);
          }
        } catch (error) { }
      }
    };
    fetchInitialDependencies();
  }, [values.class_programme_id, values.subject_curriculum_id, values.subject_programme_id]);

  const handleProgrammeChange = async (programmeId) => {
    setFieldValue('class_programme_id', programmeId);
    setFieldValue('class_arm_id', '');
    if (programmeId) {
      try {
        const res = await fetchClassArmsByProgramme(programmeId);
        setClasses(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load classes');
      }
    } else {
      setClasses([]);
    }
  };

  const handleCurriculumChange = async (curriculumId) => {
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

  const handleSubjectProgrammeChange = async (programmeId) => {
    setFieldValue('subject_programme_id', programmeId);
    setFieldValue('subject_class_arm_id', '');
    if (programmeId) {
      try {
        const res = await fetchClassArmsByProgramme(programmeId);
        setClasses(res.data || res || []);
      } catch (error) {
        notify.error('Failed to load classes');
      }
    } else {
      setClasses([]);
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
            onChange={(e) => handleProgrammeChange(e.target.value)}
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
            name="class_arm_id"
            value={values.class_arm_id}
            onChange={handleChange}
            disabled={!values.class_programme_id || isLoading}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.programme_class.class.class_code} - {c.arm_names}
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
            label="Class Arm"
            name="subject_class_arm_id"
            value={values.subject_class_arm_id}
            onChange={handleChange}
            disabled={!values.subject_programme_id || isLoading}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.programme_class.class.class_code} - {c.arm_names}
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
