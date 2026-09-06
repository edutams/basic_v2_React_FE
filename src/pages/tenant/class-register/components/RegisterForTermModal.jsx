import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Grid,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import { HowToReg as RegisterIcon } from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from '@/hooks/useNotification';

// Bulk-register students for a (new) session term — carries each eligible
// student forward from their own most recent registration (same class/arm),
// skipping anyone already registered for the target term. See
// ClassRegisterController::bulkRegisterForTerm() for the exact rules.
const RegisterForTermModal = ({ open, onClose, onSuccess }) => {
  const notify = useNotification();

  const [scope, setScope] = useState('all'); // 'all' | 'arm'
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [programme, setProgramme] = useState('');
  const [classId, setClassId] = useState('');
  const [armId, setArmId] = useState('');

  const [confirming, setConfirming] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState(null);

  // Reset to a clean slate every time the dialog is (re)opened
  useEffect(() => {
    if (open) {
      setScope('all');
      setProgramme('');
      setClassId('');
      setArmId('');
      setConfirming(false);
      setRegistering(false);
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchProgrammes()
      .then((r) => setProgrammes(r.data?.data || r.data || []))
      .catch(() => setProgrammes([]));
  }, [open]);

  useEffect(() => {
    if (!programme) {
      setClasses([]);
      setClassId('');
      return;
    }
    fetchClassesByProgramme(programme)
      .then((r) => setClasses(r.data?.data || r.data || []))
      .catch(() => setClasses([]));
  }, [programme]);

  useEffect(() => {
    if (!classId) {
      setArms([]);
      setArmId('');
      return;
    }
    fetchClassArmsByClass(classId, { programme_id: programme || undefined })
      .then((r) => setArms(r.data || []))
      .catch(() => setArms([]));
  }, [classId, programme]);

  const scopeReady = scope === 'all' || !!armId;

  const handleConfirm = async () => {
    setRegistering(true);
    try {
      const res = await classRegisterApi.bulkRegisterForTerm({
        class_arm_id: scope === 'arm' ? armId : undefined,
      });
      if (res.data?.status) {
        setResult(res.data.data);
        notify.success(res.data.message || 'Registration complete');
        onSuccess?.();
      } else {
        notify.error(res.data?.message || 'Failed to register students');
      }
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to register students');
    } finally {
      setRegistering(false);
    }
  };

  const armLabel = arms.find((a) => String(a.id) === String(armId))?.class_arm_names;
  const classLabel = classes.find((c) => String(c.id) === String(classId))?.class_name;

  return (
    <Dialog open={open} onClose={registering ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RegisterIcon color="primary" />
        Register Students for New Term
      </DialogTitle>
      <DialogContent dividers>
        {result ? (
          // ── Result summary ──────────────────────────────────
          <Box>
            <Alert severity={result.failed_count > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
              Registered {result.registered} student(s) for {result.session_term_label}.
            </Alert>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Candidates
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {result.total_candidates}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Registered
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {result.registered}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Restored
                </Typography>
                <Typography variant="h6" fontWeight={700} color="info.main">
                  {result.restored}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Skipped
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.secondary">
                  {result.skipped_count}
                </Typography>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Skipped students were already registered for this term — nothing was duplicated.
            </Typography>

            {result.failed_count > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  {result.failed_count} failed
                </Typography>
                <Stack spacing={0.5}>
                  {result.failed_sample.map((f) => (
                    <Typography key={f.user_id} variant="caption" color="text.secondary">
                      {f.name || f.user_id}: {f.reason}
                    </Typography>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        ) : confirming ? (
          // ── Confirmation step ────────────────────────────────
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will register{' '}
              {scope === 'all' ? (
                <strong>every eligible student school-wide</strong>
              ) : (
                <>
                  every eligible student most recently in{' '}
                  <strong>
                    {classLabel} ({armLabel})
                  </strong>
                </>
              )}{' '}
              for the active session term, keeping their current class/arm. Students already
              registered for this term are skipped — nothing will be duplicated. Withdrawn,
              transferred, graduated, absconded, or suspended students are never included.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              This may take a moment for a large school. Are you sure you want to continue?
            </Typography>
          </Box>
        ) : (
          // ── Scope selection ──────────────────────────────────
          <Box>
            <RadioGroup value={scope} onChange={(e) => setScope(e.target.value)}>
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="All students (school-wide)"
              />
              <FormControlLabel
                value="arm"
                control={<Radio />}
                label="A specific class & arm only"
              />
            </RadioGroup>

            {scope === 'arm' && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Programme</InputLabel>
                    <Select
                      value={programme}
                      label="Programme"
                      onChange={(e) => setProgramme(e.target.value)}
                    >
                      {programmes.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.programme_name || p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small" disabled={!programme}>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={classId}
                      label="Class"
                      onChange={(e) => setClassId(e.target.value)}
                    >
                      {classes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.class_name || c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small" disabled={!classId}>
                    <InputLabel>Class/Arm</InputLabel>
                    <Select
                      value={armId}
                      label="Class/Arm"
                      onChange={(e) => setArmId(e.target.value)}
                    >
                      {arms.map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          {a.class_arm_names}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {result ? (
          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
        ) : confirming ? (
          <>
            <Button onClick={() => setConfirming(false)} disabled={registering}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={registering}
              startIcon={registering ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {registering ? 'Registering...' : 'Confirm & Register'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={() => setConfirming(true)} disabled={!scopeReady}>
              Continue
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RegisterForTermModal;
