import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableDialog from '@/components/shared/ReusableDialog';
import PrimaryButton from '@/components/shared/PrimaryButton';
import useNotification from '@/hooks/useNotification';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';

const termLabel = (term) =>
  `${term.session?.session_name || ''} - ${term.term?.term_name || term.term_name || ''}`.trim();

/**
 * Shared by every "migrate now" button (student registration, class-teacher
 * allocation, subject-teacher allocation, bursary schedule) — one modal,
 * one from/to term picker, one confirm flow; only the copy and which API
 * call fires differ per page. Mirrors the automatic SessionTermActivated
 * listeners: from/to are restricted to the same session client-side (the
 * backend enforces it either way), and running it again on already
 * migrated records is always safe (firstOrCreate underneath).
 */
const TermMigrationModal = ({ open, onClose, title, description, migrateFn, onSuccess }) => {
  const notify = useNotification();
  const [sessionTerms, setSessionTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fromTermId, setFromTermId] = useState('');
  const [toTermId, setToTermId] = useState('');

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchSessionTerms();
        const terms = res?.data || [];
        setSessionTerms(terms);

        const active = terms.find((t) => t.status === 'active');
        setToTermId(active?.id || '');

        if (active) {
          // Default "from" to the most recent other term in the same
          // session — the admin can still change it to any other term in
          // that session, just not a different session.
          const sameSession = terms
            .filter((t) => t.session_id === active.session_id && t.id !== active.id)
            .sort((a, b) => b.id - a.id);
          setFromTermId(sameSession[0]?.id || '');
        } else {
          setFromTermId('');
        }
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

  const toTerm = sessionTerms.find((t) => t.id === toTermId);
  const fromOptions = sessionTerms.filter(
    (t) => t.id !== toTermId && (!toTerm || t.session_id === toTerm.session_id)
  );
  const toOptions = sessionTerms.filter((t) => t.status === 'active');

  const handleConfirm = async () => {
    if (!fromTermId || !toTermId) {
      notify.error('Select both a from and to term.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await migrateFn({ fromSessionTermId: fromTermId, toSessionTermId: toTermId });
      notify.success(res?.message || 'Migration completed successfully.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Term migration failed', error);
      notify.error(error.response?.data?.message || 'Migration failed');
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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <PrimaryButton onClick={onClose} variant="secondary" disabled={submitting}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            onClick={handleConfirm}
            variant="primary"
            disabled={submitting || loading || !fromTermId || !toTermId}
          >
            {submitting ? 'Migrating…' : 'Migrate'}
          </PrimaryButton>
        </Box>
      }
    >
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        Already-migrated records are skipped automatically — running this again is always safe.
      </Alert>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="term-migration-from-label">From Term</InputLabel>
        <Select
          labelId="term-migration-from-label"
          label="From Term"
          value={fromTermId}
          onChange={(e) => setFromTermId(e.target.value)}
          disabled={loading}
        >
          {fromOptions.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {termLabel(t)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
