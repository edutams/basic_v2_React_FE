import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableDialog from '@/components/shared/ReusableDialog';
import PrimaryButton from '@/components/shared/PrimaryButton';
import useNotification from '@/hooks/useNotification';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchPreviousTerm } from '@/api/tenant/term-migration/termMigrationApi';

const termLabel = (term) =>
  `${term.session?.session_name || ''} - ${term.term?.term_name || term.term_name || ''}`.trim();

/**
 * Shared by every "migrate now" button (student registration, subject
 * registration, class-teacher allocation, subject-teacher allocation,
 * bursary schedule) — one modal, one from/to term picker, one confirm
 * flow; only the copy and which API call fires differ per page. Mirrors
 * the automatic SessionTermActivated listeners: from/to are restricted to
 * the same session client-side (the backend enforces it either way), and
 * running it again on already migrated records is always safe
 * (firstOrCreate underneath).
 *
 * "From Term" is never a free pick: the button says "from the previous
 * term", so the modal resolves and shows exactly the one term that
 * precedes the active term in this session (same lookup the automatic
 * SessionTermActivated listeners use) — same idea as "To Term" only ever
 * being the one currently-active term, not an open-ended list.
 *
 * Picking terms and committing to the migration are two deliberate steps:
 * "Migrate" only moves to a review screen restating exactly what is about
 * to happen; nothing actually runs until "Confirm & Migrate" is clicked
 * there.
 *
 * The result stays visible in the modal itself once the migration
 * finishes (success or failure) instead of closing straight away — a
 * toast alone was gone before there was time to actually read it. The
 * toast still fires too, for anyone who's glanced away from the modal.
 */
const TermMigrationModal = ({ open, onClose, title, description, migrateFn, onSuccess }) => {
  const notify = useNotification();
  const [sessionTerms, setSessionTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previousTerm, setPreviousTerm] = useState(null);
  const [toTermId, setToTermId] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'confirm' | 'result'
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;

    setStep('select');
    setResult(null);
    setPreviousTerm(null);

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSessionTerms();
        const terms = res?.data || [];
        setSessionTerms(terms);

        const active = terms.find((t) => t.status === 'active');
        setToTermId(active?.id || '');
      } catch (error) {
        console.error('Failed to load session terms', error);
        notify.error('Failed to load session terms');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !toTermId) return;

    const loadPrevious = async () => {
      setLoadingPrevious(true);
      try {
        const res = await fetchPreviousTerm(toTermId);
        setPreviousTerm(res?.data || null);
      } catch (error) {
        console.error('Failed to resolve the previous term', error);
        notify.error('Failed to resolve the previous term');
        setPreviousTerm(null);
      } finally {
        setLoadingPrevious(false);
      }
    };

    loadPrevious();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, toTermId]);

  const toTerm = sessionTerms.find((t) => t.id === toTermId);
  const toOptions = sessionTerms.filter((t) => t.status === 'active');
  const fromOptions = previousTerm ? [previousTerm] : [];
  const fromTermId = previousTerm?.id || '';

  const handleReview = () => {
    if (!fromTermId || !toTermId) {
      notify.error('No previous term was found in this session to migrate from.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await migrateFn({ fromSessionTermId: fromTermId, toSessionTermId: toTermId });
      const message = res?.message || 'Migration completed successfully.';
      setResult({ status: res?.status !== false, message, eligible: res?.eligible, migrated: res?.migrated });
      setStep('result');
      if (res?.status === false) {
        notify.error(message);
      } else {
        notify.success(message);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Term migration failed', error);
      const message = error.response?.data?.message || 'Migration failed';
      setResult({ status: false, message });
      setStep('result');
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        step === 'result' ? (
          <PrimaryButton onClick={onClose} variant="primary">
            Close
          </PrimaryButton>
        ) : step === 'confirm' ? (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <PrimaryButton onClick={() => setStep('select')} variant="secondary" disabled={submitting}>
              Back
            </PrimaryButton>
            <PrimaryButton onClick={handleConfirm} variant="primary" disabled={submitting}>
              {submitting ? 'Migrating…' : 'Confirm & Migrate'}
            </PrimaryButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <PrimaryButton onClick={onClose} variant="secondary">
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleReview}
              variant="primary"
              disabled={loading || loadingPrevious || !fromTermId || !toTermId}
            >
              Migrate
            </PrimaryButton>
          </Box>
        )
      }
    >
      {step === 'result' ? (
        <Box>
          <Alert severity={result.status ? 'success' : 'error'} sx={{ mb: 2 }}>
            {result.message}
          </Alert>
          {typeof result.eligible === 'number' && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Eligible
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {result.eligible}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Migrated
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {result.migrated}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ) : step === 'confirm' ? (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={700} color="warning.dark">
              This is your final confirmation — the migration runs as soon as you click Confirm
              &amp; Migrate.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            From
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {termLabel(previousTerm || {})}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            To
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {termLabel(toTerm || {})}
          </Typography>
        </Box>
      ) : (
        <>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            Already-migrated records are skipped automatically — running this again is always
            safe.
          </Alert>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="term-migration-from-label">From Term</InputLabel>
            <Select
              labelId="term-migration-from-label"
              label="From Term"
              value={fromTermId}
              // No onChange: there is exactly one valid "from" term (the one
              // immediately preceding "To Term" in this session), resolved
              // automatically — not a free pick, same as "To Term" only ever
              // listing the currently-active term.
              onChange={() => {}}
              disabled={loading || loadingPrevious}
            >
              {fromOptions.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {termLabel(t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!loading && !loadingPrevious && !previousTerm && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No previous term was found in this session — there is nothing to migrate from.
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="term-migration-to-label">To Term</InputLabel>
            <Select
              labelId="term-migration-to-label"
              label="To Term"
              value={toTermId}
              onChange={(e) => setToTermId(e.target.value)}
              disabled={loading}
            >
              {toOptions.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {termLabel(t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </ReusableDialog>
  );
};

TermMigrationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  migrateFn: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default TermMigrationModal;
