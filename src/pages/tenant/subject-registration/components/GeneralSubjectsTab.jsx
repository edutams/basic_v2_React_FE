import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import SubjectMatrixTable from './SubjectMatrixTable';
import SubjectMatrixTableSkeleton from './SubjectMatrixTableSkeleton';

const GeneralSubjectsTab = forwardRef(function GeneralSubjectsTab(
  { session, term, termId, programme, classLevel, classArm, onStatusChange, onSaved },
  ref,
) {
  const navigate = useNavigate();
  // ── Data States ───────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Tracks original registration state from last fetch for pending change detection
  const [originalRegistered, setOriginalRegistered] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const pendingCount = useMemo(() => Object.keys(pendingChanges).length, [pendingChanges]);

  // ── Fetch Data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    setError('');
    try {
      const [subjRes, learnerRes] = await Promise.all([
        subjectRegistrationApi.getGeneralSubjects(classLevel, {
          programme_id: programme || undefined,
        }),
        subjectRegistrationApi.getLearnerSubjectRegistration(classLevel, classArm || undefined, {
          programme_id: programme || undefined,
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
          id: l.student_registration_id,
          name: l.name,
          admissionNo: l.admission_no,
          avatar: l.avatar,
          gender: l.gender,
          registered: {},
        }));
        learnerData.forEach((l) => {
          const learner = transformed.find((t) => t.id === l.student_registration_id);
          if (learner) {
            (l.registered_subjects || []).forEach((rs) => {
              learner.registered[rs.subject_id] = true;
            });
          }
        });
        setLearners(transformed);

        // Snapshot the original registration state
        const orig = {};
        transformed.forEach((l) => {
          orig[l.id] = { ...l.registered };
        });
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

    notify(
      `${newRegistered ? 'Marked for registration' : 'Marked for removal'} — click Save Selected to save to the server.`,
      'info',
    );
  };

  const runSave = async () => {
    const changes = Object.entries(pendingChanges).map(([key, registered]) => {
      const [learnerId, subjectId] = key.split('_');
      return { learner_id: Number(learnerId), subject_id: Number(subjectId), registered };
    });

    if (changes.length === 0) return;

    setSaving(true);
    setError('');
    try {
      await subjectRegistrationApi.bulkToggle(changes, { session_id: session, term_id: termId });
      setPendingChanges({});
      // Update original snapshot to match current state after save
      const orig = {};
      learners.forEach((l) => {
        orig[l.id] = { ...l.registered };
      });
      setOriginalRegistered(orig);
      notify(`${changes.length} change(s) saved successfully.`, 'success');
      onSaved?.();
    } catch (e) {
      console.error('Save failed:', e);
      setError('Failed to save changes. Please try again.');
      notify('Failed to save changes. Please try again.', 'error');
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSelected = () => setConfirmSaveOpen(true);

  const confirmAndSave = async () => {
    setConfirmSaveOpen(false);
    await runSave();
  };

  // Lets the parent render its own "Save Selected" button up on the tabs
  // row (same action, just also reachable without scrolling down) —
  // pendingCount/saving are reported up for that button's label/disabled
  // state, and the actual save (via the same confirm-first flow) is
  // triggered back down via this ref.
  useImperativeHandle(ref, () => ({ save: handleSaveSelected, refetch: fetchData }));

  useEffect(() => {
    onStatusChange?.({ pendingCount, saving });
  }, [pendingCount, saving, onStatusChange]);

  const registerAll = (subjectId) => {
    setLearners((prev) =>
      prev.map((l) => ({ ...l, registered: { ...l.registered, [subjectId]: true } })),
    );

    setPendingChanges((prev) => {
      const next = { ...prev };
      learners.forEach((l) => {
        const key = `${l.id}_${subjectId}`;
        const origState = originalRegistered[l.id]?.[subjectId] ?? false;
        if (!origState) {
          next[key] = true;
        } else {
          delete next[key];
        }
      });
      return next;
    });

    notify(`All learners marked registered — click Save Selected to save to the server.`, 'info');
  };

  const unregisterAll = (subjectId) => {
    setLearners((prev) =>
      prev.map((l) => ({ ...l, registered: { ...l.registered, [subjectId]: false } })),
    );

    setPendingChanges((prev) => {
      const next = { ...prev };
      learners.forEach((l) => {
        const key = `${l.id}_${subjectId}`;
        const origState = originalRegistered[l.id]?.[subjectId] ?? false;
        if (origState) {
          next[key] = false;
        } else {
          delete next[key];
        }
      });
      return next;
    });

    notify(`All learners marked for removal — click Save Selected to save to the server.`, 'info');
  };

  // Registers ONE learner for every subject in this tab at once — the
  // per-row counterpart to the per-column "All"/"None" toggle above.
  const registerAllForLearner = (learnerId) => {
    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? {
              ...l,
              registered: subjects.reduce(
                (acc, subj) => ({ ...acc, [subj.id]: true }),
                { ...l.registered },
              ),
            }
          : l,
      ),
    );

    setPendingChanges((prev) => {
      const next = { ...prev };
      subjects.forEach((subj) => {
        const key = `${learnerId}_${subj.id}`;
        const origState = originalRegistered[learnerId]?.[subj.id] ?? false;
        if (!origState) {
          next[key] = true;
        } else {
          delete next[key];
        }
      });
      return next;
    });

    notify(
      `Learner marked for every subject — click Save Selected to save to the server.`,
      'info',
    );
  };

  return (
    <Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <SubjectMatrixTableSkeleton />
      ) : subjects.length === 0 ? (
        <Alert
          severity="info"
          sx={{ alignItems: 'center' }}
          action={
            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={() => navigate('/curriculum-setup')}
            >
              Go to Curriculum
            </Button>
          }
        >
          No subjects have been created for this class. Please go to the Curriculum step to create
          subjects before registering learners.
        </Alert>
      ) : (
        <SubjectMatrixTable
          subjects={subjects}
          learners={learners}
          onToggle={toggleRegistration}
          onRegisterAll={registerAll}
          onUnregisterAll={unregisterAll}
          onRegisterAllForLearner={registerAllForLearner}
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

      <Dialog open={confirmSaveOpen} onClose={() => setConfirmSaveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Save Subject Registrations?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            You're about to save <strong>{pendingCount}</strong> pending change
            {pendingCount === 1 ? '' : 's'} to the server. This will update which subjects these
            learners are registered for.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmSaveOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmAndSave}>
            Yes, Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default GeneralSubjectsTab;
