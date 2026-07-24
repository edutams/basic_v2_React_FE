import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import SubjectMatrixTable from './SubjectMatrixTable';

const OptionalSubjectsTab = ({ session, term, termId, programme, classLevel, classArm }) => {
  // ── Data States ───────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [originalRegistered, setOriginalRegistered] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});

  const pendingCount = useMemo(() => Object.keys(pendingChanges).length, [pendingChanges]);

  // ── Fetch Data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    setError('');
    try {
      const [subjRes, learnerRes] = await Promise.all([
        subjectRegistrationApi.getOptionalSubjects(classLevel, { programme_id: programme || undefined }),
        subjectRegistrationApi.getLearnerSubjectRegistration(classLevel, classArm || undefined, {
          session_id: session || undefined,
          term_id: termId || undefined,
        }),
      ]);

      if (subjRes.data?.data) {
        setSubjects(Array.isArray(subjRes.data.data) ? subjRes.data.data : []);
      }

      if (learnerRes.data?.data) {
        const learnerData = learnerRes.data.data;
        const transformed = learnerData.map((l) => ({
          id: l.student_reg_id,
          name: l.name,
          registered: {},
        }));
        learnerData.forEach((l) => {
          const learner = transformed.find((t) => t.id === l.student_reg_id);
          if (learner) {
            (l.registered_subjects || []).forEach((rs) => {
              learner.registered[rs.subject_id] = true;
            });
          }
        });
        setLearners(transformed);

        const orig = {};
        transformed.forEach((l) => { orig[l.id] = { ...l.registered }; });
        setOriginalRegistered(orig);
        setPendingChanges({});
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [classLevel, classArm, programme, session, termId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────
  const toggleRegistration = (learnerId, subjectId) => {
    const currentLearner = learners.find((l) => l.id === learnerId);
    const currentlyRegistered = currentLearner?.registered?.[subjectId] ?? false;
    const newRegistered = !currentlyRegistered;
    const key = `${learnerId}_${subjectId}`;
    const origState = originalRegistered[learnerId]?.[subjectId] ?? false;

    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? { ...l, registered: { ...l.registered, [subjectId]: newRegistered } }
          : l,
      ),
    );

    setPendingChanges((prev) => {
      const next = { ...prev };
      if (newRegistered === origState) {
        delete next[key];
      } else {
        next[key] = newRegistered;
      }
      return next;
    });
  };

  const handleSaveSelected = async () => {
    const changes = Object.entries(pendingChanges).map(([key, registered]) => {
      const [learnerId, subjectId] = key.split('_');
      return { learner_id: Number(learnerId), subject_id: Number(subjectId), registered };
    });

    if (changes.length === 0) return;

    setSaving(true);
    setError('');
    try {
      await subjectRegistrationApi.bulkToggle(changes);
      setPendingChanges({});
      const orig = {};
      learners.forEach((l) => { orig[l.id] = { ...l.registered }; });
      setOriginalRegistered(orig);
    } catch (e) {
      console.error('Save failed:', e);
      setError('Failed to save changes. Please try again.');
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : subjects.length === 0 ? (
        <Alert severity="info">
          No subjects have been created for this class. Please go to the Curriculum step to create subjects before registering learners.
        </Alert>
      ) : (
        <SubjectMatrixTable
          subjects={subjects}
          learners={learners}
          onToggle={toggleRegistration}
        />
      )}

      {pendingCount > 0 && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveSelected}
            disabled={saving}
          >
            {saving ? 'SAVING...' : `SAVE SELECTED (${pendingCount})`}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default OptionalSubjectsTab;
