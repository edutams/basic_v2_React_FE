import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Grid,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import SubjectMatrixTable from './SubjectMatrixTable';

const GeneralSubjectsTab = () => {
  // ── Filter States ─────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);

  const [session, setSession] = useState('');
  const [term, setTerm] = useState('');
  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [classArm, setClassArm] = useState('');

  // ── Data States ───────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Load Filters ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, progRes] = await Promise.all([fetchSessions(), fetchProgrammes()]);
        setSessions(sessRes.data?.data || sessRes.data || []);
        setProgrammes(progRes.data?.data || progRes.data || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchTerms(session).then((r) => setTerms(r.data?.data || r.data || [])).catch(console.error);
  }, [session]);

  useEffect(() => {
    if (!programme) return;
    fetchClassesByProgramme(programme).then((r) => {
      const d = r.data?.data || r.data || [];
      setClasses(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [programme]);

  useEffect(() => {
    if (!classLevel) return;
    fetchClassArmsByClass(classLevel).then((r) => {
      const d = r.data?.data || [];
      setArms(Array.isArray(d) ? d : []);
    }).catch(console.error);
  }, [classLevel]);

  // ── Fetch Data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    setError('');
    try {
      const [subjRes, learnerRes] = await Promise.all([
        subjectRegistrationApi.getGeneralSubjects(classLevel, { programme_id: programme || undefined }),
        subjectRegistrationApi.getLearnerSubjectRegistration(classLevel, classArm || undefined),
      ]);

      if (subjRes.data?.data) {
        setSubjects(Array.isArray(subjRes.data.data) ? subjRes.data.data : []);
      }

      if (learnerRes.data?.data) {
        const learnerData = learnerRes.data.data;
        // Transform to format expected by SubjectMatrixTable
        const transformed = learnerData.map((l) => ({
          id: l.student_reg_id,
          name: l.name,
          registered: {},
        }));
        // Populate registered subjects
        learnerData.forEach((l) => {
          const learner = transformed.find((t) => t.id === l.student_reg_id);
          if (learner) {
            (l.registered_subjects || []).forEach((rs) => {
              learner.registered[rs.subject_id] = true;
            });
          }
        });
        setLearners(transformed);
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [classLevel, classArm, programme]);

  // ── Handlers ──────────────────────────────────────────────
  const toggleRegistration = async (learnerId, subjectId) => {
    // Determine new state before optimistic update to avoid stale closure
    const currentLearner = learners.find((l) => l.id === learnerId);
    const currentlyRegistered = currentLearner?.registered?.[subjectId] ?? false;
    const newRegistered = !currentlyRegistered;

    // Optimistic update
    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? { ...l, registered: { ...l.registered, [subjectId]: newRegistered } }
          : l,
      ),
    );

    try {
      await subjectRegistrationApi.toggleRegistration(learnerId, subjectId, newRegistered);
    } catch (e) {
      console.error('Toggle failed:', e);
      // Revert on failure
      fetchData();
    }
  };

  const registerAll = async (subjectId) => {
    const learnerIds = learners.map((l) => l.id);
    try {
      await subjectRegistrationApi.bulkRegisterSubject(subjectId, learnerIds);
      fetchData();
    } catch (e) {
      console.error('Bulk register failed:', e);
    }
  };

  const unregisterAll = async (subjectId) => {
    const learnerIds = learners.map((l) => l.id);
    try {
      await subjectRegistrationApi.bulkUnregisterSubject(subjectId, learnerIds);
      fetchData();
    } catch (e) {
      console.error('Bulk unregister failed:', e);
    }
  };

  const handleApplyFilter = () => {
    fetchData();
  };

  return (
    <Box>
      {/* ── Filters ───────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Session</InputLabel>
            <Select value={session} label="Session" onChange={(e) => setSession(e.target.value)}>
              {sessions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.sesname || s.name || s.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Term</InputLabel>
            <Select value={term} label="Term" onChange={(e) => setTerm(e.target.value)}>
              {terms.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Programme</InputLabel>
            <Select value={programme} label="Programme" onChange={(e) => setProgramme(e.target.value)}>
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.programme_name || p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Class</InputLabel>
            <Select value={classLevel} label="Class" onChange={(e) => setClassLevel(e.target.value)}>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Arm</InputLabel>
            <Select value={classArm} label="Arm" onChange={(e) => setClassArm(e.target.value)}>
              {arms.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.arm_names }</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.4 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<FilterIcon />}
            onClick={handleApplyFilter}
            sx={{ height: 40 }}
          >
            Filter
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {/* ── Table ────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <SubjectMatrixTable
          subjects={subjects}
          learners={learners}
          onToggle={toggleRegistration}
          onRegisterAll={registerAll}
          onUnregisterAll={unregisterAll}
        />
      )}
    </Box>
  );
};

export default GeneralSubjectsTab;
