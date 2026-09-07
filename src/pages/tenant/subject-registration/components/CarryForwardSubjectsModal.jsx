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
} from '@mui/material';
import { LibraryAddCheck as CarryForwardIcon } from '@mui/icons-material';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from '@/hooks/useNotification';

// Bulk-carries each active student's most-recent subject registrations
// forward into a new session term, skipping anyone already registered for
// the target term. See SubjectRegistrationController::carryForwardTerm() for
// the exact rules — mirrors Class Register's "Register for New Term".
const CarryForwardSubjectsModal = ({ open, onClose, onSuccess }) => {
  const notify = useNotification();

  const [scope, setScope] = useState('all'); // 'all' | 'arm'
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [programme, setProgramme] = useState('');
  const [classId, setClassId] = useState('');
  const [armId, setArmId] = useState('');

  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setScope('all');
      setProgramme('');
      setClassId('');
      setArmId('');
      setConfirming(false);
      setSaving(false);
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
    setSaving(true);
    try {
      const res = await subjectRegistrationApi.carryForwardTerm({
        class_arm_id: scope === 'arm' ? armId : undefined,
      });
      if (res.data?.status) {
        setResult(res.data.data);
        notify.success(res.data.message || 'Subject registrations carried forward');
        onSuccess?.();
      } else {
        notify.error(res.data?.message || 'Failed to carry subject registrations forward');
      }
    } catch (e) {
      notify.error(
        e.response?.data?.message || 'Failed to carry subject registrations forward',
      );
    } finally {
      setSaving(false);
    }
  };

  const armLabel = arms.find((a) => String(a.id) === String(armId))?.class_arm_names;
  const classLabel = classes.find((c) => String(c.id) === String(classId))?.class_name;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CarryForwardIcon color="primary" />
        Carry Subject Registrations to New Term
      </DialogTitle>
      <DialogContent dividers>
        {result ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Carried forward {result.registered} subject registration(s) for{' '}
              {result.session_term_label}.
            </Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Candidates
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {result.total_candidates}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Carried forward
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {result.registered}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Already registered
                </Typography>
                <Typography variant="h6" fontWeight={700} color="text.secondary">
                  {result.already_registered}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : confirming ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will carry forward every subject each eligible student{' '}
              {scope === 'all' ? (
                <strong>school-wide</strong>
              ) : (
                <>
                  currently placed in{' '}
                  <strong>
                    {classLabel} ({armLabel})
                  </strong>{' '}
                  for the new term
                </>
              )}{' '}
              was most recently registered for, keyed to whichever term is currently active.
              Students already registered for a subject in that term are skipped — nothing will
              be duplicated. Withdrawn, transferred, graduated, absconded, or suspended students
              are never included.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Only students who already have a Class Register entry for the new term are
              eligible — run Class Register&apos;s &quot;Register for New Term&quot; first if you
              haven&apos;t already. Are you sure you want to continue?
            </Typography>
          </Box>
        ) : (
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
                    <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)}>
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
                    <Select value={armId} label="Class/Arm" onChange={(e) => setArmId(e.target.value)}>
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
            <Button onClick={() => setConfirming(false)} disabled={saving}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Carrying forward...' : 'Confirm & Carry Forward'}
            </Button>
          </>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={() => setConfirming(true)} disabled={!scopeReady}>
              Continue
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CarryForwardSubjectsModal;
