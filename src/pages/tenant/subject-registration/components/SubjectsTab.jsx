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

/**
 * Compulsory + Optional subjects, merged into one tab/table — per the CEO's
 * call, optional subjects are usually few enough that a whole separate tab
 * for them isn't worth it. Trade subjects stay in their own tab
 * (TradeSubjectsTab) since they follow the same shape but are a genuinely
 * different subject category, not a copy-paste duplicate of this file.
 */
const SubjectsTab = forwardRef(function SubjectsTab(
  {
    session,
    term,
    termId,
    programme,
    classLevel,
    classArm,
    onStatusChange,
    onSaved,
    onInsightsChange,
    search = '',
    statusFilter = 'all',
  },
  ref,
) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [originalRegistered, setOriginalRegistered] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const pendingCount = useMemo(() => Object.keys(pendingChanges).length, [pendingChanges]);

  const compulsorySubjectIds = useMemo(
    () => subjects.filter((s) => s.status === 'compulsory').map((s) => s.id),
    [subjects],
  );
  const optionalSubjectIds = useMemo(
    () => subjects.filter((s) => s.status === 'optional').map((s) => s.id),
    [subjects],
  );

  // Rule-based ("AI") suggestions — deterministic templates over real
  // computed counts, no LLM call, same convention as the Attendance/
  // Psychomotor redesign's "AI Smart Insights" cards.
  const aiSuggestions = useMemo(() => {
    if (optionalSubjectIds.length === 0 || learners.length === 0) return [];
    const items = [];
    const zeroOptional = learners.filter((l) =>
      optionalSubjectIds.every((id) => !l.registered[id]),
    ).length;
    if (zeroOptional > 0) {
      items.push({
        text: `${zeroOptional} learner${zeroOptional > 1 ? 's' : ''} have no optional subjects registered`,
        detail: 'Confirm this is intentional for these learners.',
      });
    }
    if (optionalSubjectIds.length > 1) {
      const allOptional = learners.filter((l) =>
        optionalSubjectIds.every((id) => l.registered[id]),
      ).length;
      if (allOptional > 0) {
        items.push({
          text: `${allOptional} learner${allOptional > 1 ? 's are' : ' is'} registered for every optional subject`,
          detail: 'Worth a quick sanity check — an unusual combination.',
        });
      }
    }
    return items;
  }, [learners, optionalSubjectIds]);

  useEffect(() => {
    onInsightsChange?.(aiSuggestions);
  }, [aiSuggestions, onInsightsChange]);

  const fetchData = useCallback(async () => {
    if (!classLevel) return;
    setLoading(true);
    setError('');
    try {
      const [genRes, optRes, learnerRes] = await Promise.all([
        subjectRegistrationApi.getGeneralSubjects(classLevel, {
          programme_id: programme || undefined,
          term_id: termId || undefined,
          session_id: session || undefined,
        }),
        subjectRegistrationApi.getOptionalSubjects(classLevel, {
          programme_id: programme || undefined,
          term_id: termId || undefined,
          session_id: session || undefined,
        }),
        subjectRegistrationApi.getLearnerSubjectRegistration(classLevel, classArm || undefined, {
          programme_id: programme || undefined,
          session_id: session || undefined,
          term_id: termId || undefined,
        }),
      ]);

      const genData = genRes.data?.data;
      const optData = optRes.data?.data;
      // Deduped by subject id — an unscoped programme/class filter (e.g. no
      // arm configured) can make the backend return the same subject in
      // both the compulsory and optional lists, which previously produced
      // duplicate React keys in the matrix table and an inflated subject
      // count.
      const mergedById = new Map();
      [...(Array.isArray(genData) ? genData : []), ...(Array.isArray(optData) ? optData : [])].forEach(
        (s) => {
          if (!mergedById.has(s.id)) mergedById.set(s.id, s);
        },
      );
      setSubjects([...mergedById.values()]);

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

  // Registers every compulsory subject for every learner in one shot —
  // backs the sidebar's "Apply compulsory subjects to all learners" quick
  // action. Stages the change locally like every other toggle here; still
  // requires Save Selected to actually persist.
  const applyCompulsoryToAll = () => {
    if (compulsorySubjectIds.length === 0 || learners.length === 0) return;
    setLearners((prev) =>
      prev.map((l) => ({
        ...l,
        registered: compulsorySubjectIds.reduce(
          (acc, id) => ({ ...acc, [id]: true }),
          { ...l.registered },
        ),
      })),
    );
    setPendingChanges((prev) => {
      const next = { ...prev };
      learners.forEach((l) => {
        compulsorySubjectIds.forEach((subjId) => {
          const key = `${l.id}_${subjId}`;
          const origState = originalRegistered[l.id]?.[subjId] ?? false;
          if (!origState) next[key] = true;
          else delete next[key];
        });
      });
      return next;
    });
    notify('Core subjects applied to every learner — click Save Selected to save.', 'info');
  };

  // Copies one learner's registered subjects onto other learners — calls
  // the server directly (unlike every other action here, which only stages
  // a local change) since it's a one-off bulk operation, not something a
  // teacher is expected to review row-by-row before saving.
  const copyChoices = async (sourceLearnerId, targetLearnerIds) => {
    try {
      await subjectRegistrationApi.copyChoices(sourceLearnerId, targetLearnerIds, {
        session_id: session,
        term_id: termId,
      });
      notify('Subject choices copied successfully.', 'success');
      fetchData();
      onSaved?.();
      return true;
    } catch (e) {
      console.error('Copy choices failed:', e);
      notify(e.response?.data?.message || 'Failed to copy subject choices.', 'error');
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveSelected,
    refetch: fetchData,
    applyCompulsoryToAll,
    copyChoices,
    learners,
    subjects,
  }));

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
        if (!origState) next[key] = true;
        else delete next[key];
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
        if (origState) next[key] = false;
        else delete next[key];
      });
      return next;
    });
    notify(`All learners marked for removal — click Save Selected to save to the server.`, 'info');
  };

  const registerAllForLearner = (learnerId) => {
    setLearners((prev) =>
      prev.map((l) =>
        l.id === learnerId
          ? {
              ...l,
              registered: subjects.reduce((acc, subj) => ({ ...acc, [subj.id]: true }), {
                ...l.registered,
              }),
            }
          : l,
      ),
    );
    setPendingChanges((prev) => {
      const next = { ...prev };
      subjects.forEach((subj) => {
        const key = `${learnerId}_${subj.id}`;
        const origState = originalRegistered[learnerId]?.[subj.id] ?? false;
        if (!origState) next[key] = true;
        else delete next[key];
      });
      return next;
    });
    notify(`Learner marked for every subject — click Save Selected to save to the server.`, 'info');
  };

  // Per-subject registered-learner counts, over the FULL roster — must not
  // shrink when a search/status filter narrows which rows are visible.
  const registeredCount = useMemo(() => {
    const counts = {};
    subjects.forEach((subj) => {
      counts[subj.id] = learners.filter((l) => l.registered[subj.id]).length;
    });
    return counts;
  }, [subjects, learners]);

  // ── Search + status filter (client-side, over the already-loaded roster) ──
  const filteredLearners = useMemo(() => {
    const q = search.trim().toLowerCase();
    return learners.filter((l) => {
      if (q && !(l.name || '').toLowerCase().includes(q) && !(l.admissionNo || '').toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter === 'all') return true;
      const isComplete =
        compulsorySubjectIds.length > 0 &&
        compulsorySubjectIds.every((id) => l.registered[id]);
      return statusFilter === 'complete' ? isComplete : !isComplete;
    });
  }, [learners, search, statusFilter, compulsorySubjectIds]);

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
      ) : filteredLearners.length === 0 ? (
        <Alert severity="info">No learners match your search/filter.</Alert>
      ) : (
        <SubjectMatrixTable
          subjects={subjects}
          learners={filteredLearners}
          registeredCount={registeredCount}
          requiredSubjectIds={compulsorySubjectIds}
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

      <Dialog
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        maxWidth="xs"
        fullWidth
      >
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

export default SubjectsTab;
