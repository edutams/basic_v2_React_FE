import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Alert, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import resultSetupApi from '@/api/tenant/result-setup/resultSetupApi';
import { fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import useNotification from '@/hooks/useNotification';

/**
 * Set Resumption — ported from V1's standalone "Set Resumption" modal
 * (App\Http\Controllers\App\SessionTermController::set_resumption_closing_date()),
 * which had no V2 equivalent at all: every report card/dossier's resumption
 * date was hardcoded to an empty string. Always scopes to the current
 * active session term, same as V1 (there's no session/term picker here —
 * resumption dates are inherently "this term ending, next term beginning").
 */
const ResumptionDatesSection = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const notify = useNotification();

  const [sessionTermId, setSessionTermId] = useState(null);
  const [termLabel, setTermLabel] = useState('');
  const [form, setForm] = useState({ closing_date: '', resumption_date: '', boarding_resumption_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const activeRes = await fetchActiveTenantSessionTerm();
      const active = activeRes?.data;
      if (!active?.id) {
        setSessionTermId(null);
        return;
      }
      setSessionTermId(active.id);
      setTermLabel(`${active.session?.session_name || ''} — ${active.term?.term_name || ''}`.trim());

      const res = await resultSetupApi.getResumptionClosingDate(active.id);
      const data = res?.data?.data;
      setForm({
        closing_date: data?.closing_date || '',
        resumption_date: data?.resumption_date || '',
        boarding_resumption_date: data?.boarding_resumption_date || '',
      });
    } catch (err) {
      console.error('Failed to load resumption/closing dates:', err);
      notify.error('Failed to load resumption/closing dates');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!sessionTermId) return;
    setSaving(true);
    try {
      const res = await resultSetupApi.saveResumptionClosingDate({
        session_term_id: sessionTermId,
        closing_date: form.closing_date || null,
        resumption_date: form.resumption_date || null,
        boarding_resumption_date: form.boarding_resumption_date || null,
      });
      if (res?.data?.status) {
        notify.success('Resumption and closing dates saved');
      } else {
        notify.error(res?.data?.message || 'Failed to save dates');
      }
    } catch (err) {
      console.error('Failed to save resumption/closing dates:', err);
      notify.error(err?.response?.data?.message || 'Failed to save dates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        maxWidth: 520,
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={0.5}>
        Set Resumption
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Shown on every report card and class dossier for the current term.
      </Typography>

      {loading ? (
        <>
          <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={56} />
        </>
      ) : !sessionTermId ? (
        <Alert severity="warning">No active session term found. Activate a session term first.</Alert>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {termLabel}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label="This Term Ends On"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.closing_date}
                onChange={handleChange('closing_date')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Next Term Begins On"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.resumption_date}
                onChange={handleChange('resumption_date')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Boarding Students Return On"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.boarding_resumption_date}
                onChange={handleChange('boarding_resumption_date')}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" size="small" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ResumptionDatesSection;
