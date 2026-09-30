import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  fetchClassSubjectUsage,
  deleteClassSubjectRecord,
  toggleClassSubjectStatus,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

/**
 * Referential integrity alone won't stop a delete here (the raw FKs
 * cascade), so this is blocked at the app level instead: a subject with any
 * registration, result, or teacher allocation against it can only be
 * deactivated, never deleted — there is no cascade-delete path. Only a
 * completely unused subject can actually be removed.
 */
const STEP = {
  LOADING: 'loading',
  ERROR: 'error',
  ZERO_USAGE: 'zero_usage',
  USAGE_BLOCKED: 'usage_blocked',
  CONFIRM_DEACTIVATE: 'confirm_deactivate',
};

const DeleteClassSubjectModal = ({ open, classSubject, onClose, onDeleted, onDeactivated }) => {
  const [step, setStep] = useState(STEP.LOADING);
  const [usage, setUsage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !classSubject) return;

    setStep(STEP.LOADING);
    setUsage(null);
    setError('');

    (async () => {
      try {
        const response = await fetchClassSubjectUsage(classSubject.class_subject_id);
        if (!response.status) {
          setError(response.error || response.message || 'Failed to load subject usage');
          setStep(STEP.ERROR);
          return;
        }

        const data = response.data;
        setUsage(data);

        const hasAnyUsage =
          data.registrations_count > 0 || data.results_count > 0 || data.allocations_count > 0;

        setStep(hasAnyUsage ? STEP.USAGE_BLOCKED : STEP.ZERO_USAGE);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load subject usage');
        setStep(STEP.ERROR);
      }
    })();
  }, [open, classSubject]);

  const handleDelete = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await deleteClassSubjectRecord(classSubject.class_subject_id);
      if (response.status) {
        onDeleted?.();
      } else {
        setError(response.error || response.message || 'Failed to remove subject from class');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to remove subject from class',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await toggleClassSubjectStatus(classSubject.class_subject_id);
      if (response.status) {
        onDeactivated?.();
      } else {
        setError(response.error || response.message || 'Failed to deactivate subject');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to deactivate subject');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (step === STEP.LOADING) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      );
    }

    if (step === STEP.ERROR) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (step === STEP.ZERO_USAGE) {
      return (
        <Typography variant="body1">
          Are you sure you want to remove <strong>{classSubject?.subject_name}</strong> from this
          class? It has no registrations, results, or teacher allocations, so this is safe. This
          cannot be undone.
        </Typography>
      );
    }

    if (step === STEP.USAGE_BLOCKED) {
      return (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>{classSubject?.subject_name}</strong> is already in use in this class, so it
            can&apos;t be deleted:
          </Alert>
          <List dense sx={{ mb: 1 }}>
            {usage.registrations_count > 0 && (
              <ListItem disableGutters>
                <ListItemText primary={`${usage.registrations_count} student registration(s)`} />
              </ListItem>
            )}
            {usage.results_count > 0 && (
              <ListItem disableGutters>
                <ListItemText primary={`${usage.results_count} result(s) recorded`} />
              </ListItem>
            )}
            {usage.allocations_count > 0 && (
              <ListItem disableGutters>
                <ListItemText primary={`${usage.allocations_count} teacher allocation(s)`} />
              </ListItem>
            )}
          </List>
          <Typography variant="body1">
            Deactivating it instead hides it from registrations, results, and broadsheets going
            forward — nothing already recorded is touched, and it can be reactivated later.
          </Typography>
        </Box>
      );
    }

    if (step === STEP.CONFIRM_DEACTIVATE) {
      return (
        <Typography variant="body1">
          Deactivate <strong>{classSubject?.subject_name}</strong> for this class? It will
          disappear from registrations, results, and broadsheets until it&apos;s reactivated.
          Nothing already recorded against it is affected.
        </Typography>
      );
    }

    return null;
  };

  const renderActions = () => {
    if (step === STEP.LOADING) return null;

    if (step === STEP.ERROR) {
      return (
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      );
    }

    if (step === STEP.ZERO_USAGE) {
      return (
        <>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Removing...' : 'Remove'}
          </Button>
        </>
      );
    }

    if (step === STEP.USAGE_BLOCKED) {
      return (
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={() => setStep(STEP.CONFIRM_DEACTIVATE)}>
            Deactivate
          </Button>
        </>
      );
    }

    if (step === STEP.CONFIRM_DEACTIVATE) {
      return (
        <>
          <Button onClick={() => setStep(STEP.USAGE_BLOCKED)} disabled={submitting}>
            Back
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeactivate}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Deactivating...' : 'Yes, deactivate'}
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Remove Subject from Class</DialogTitle>
      <DialogContent>
        {error && step !== STEP.ERROR && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Stack direction="row" spacing={1.5}>
          {renderActions()}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteClassSubjectModal;
