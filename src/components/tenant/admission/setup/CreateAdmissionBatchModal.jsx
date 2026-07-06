import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Grid,
} from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';

const INITIAL_FORM = {
  batch_name: '',
  has_entrance_exam: false,
  require_payment: false,
  application_fee: '',
  acceptance_fee: '',
  app_instruction: '',
  admission_letter_template: '',
  status: 'open',
};

const CreateAdmissionBatchModal = ({
  open,
  onClose,
  sessionTermId,
  sessionTermLabel,
  batch,
  onSaved,
}) => {
  const isEdit = Boolean(batch);

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (isEdit && batch) {
        setForm({
          batch_name: batch.batch_name ?? '',
          has_entrance_exam: Boolean(batch.has_entrance_exam),
          require_payment: Boolean(batch.require_payment),
          application_fee: batch.application_fee ?? '',
          acceptance_fee: batch.acceptance_fee ?? '',
          app_instruction: batch.app_instruction ?? '',
          admission_letter_template: batch.admission_letter_template ?? '',
          status: batch.status ?? 'open',
        });
      } else {
        setForm(INITIAL_FORM);
      }
    }
  }, [open, batch, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const validate = () => {
    if (!form.batch_name.trim()) return 'Batch name is required.';
    if (form.require_payment) {
      if (!form.application_fee || Number(form.application_fee) < 0)
        return 'Enter a valid application fee.';
      if (!form.acceptance_fee || Number(form.acceptance_fee) < 0)
        return 'Enter a valid acceptance fee.';
    }
    return '';
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');

    const payload = {
      ...form,
      id: batch?.id ?? null,
      session_term_id: sessionTermId,
      application_fee: form.require_payment ? Number(form.application_fee) : 0,
      acceptance_fee: form.require_payment ? Number(form.acceptance_fee) : 0,
    };

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSaved?.(payload);
    }, 300);
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Admission Batch' : 'Create New Admission Batch'}
      size="medium"
    >
      <Box>
        {sessionTermLabel && (
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Session Term: <strong>{sessionTermLabel}</strong>
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Batch Name"
              size="small"
              value={form.batch_name}
              onChange={handleChange('batch_name')}
              placeholder="e.g. Batch 1 — Junior Secondary"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Batch Status"
              size="small"
              value={form.status}
              onChange={handleChange('status')}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="close">Close</MenuItem>
            </TextField>
          </Grid>

          {/* Entrance Exam toggle */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={form.has_entrance_exam}
                    onChange={handleSwitchChange('has_entrance_exam')}
                    size="small"
                    color="success"
                  />
                }
                label={<Typography variant="body2">Entrance Exam Required</Typography>}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Require Payment toggle */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.require_payment}
                  onChange={handleSwitchChange('require_payment')}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" fontWeight={600}>
                  Require Payment
                </Typography>
              }
            />
          </Grid>

          {/* Fee fields — only shown when require_payment is on */}
          {form.require_payment && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Application Fee"
                  size="small"
                  type="number"
                  value={form.application_fee}
                  onChange={handleChange('application_fee')}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    },
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Acceptance Fee"
                  size="small"
                  type="number"
                  value={form.acceptance_fee}
                  onChange={handleChange('acceptance_fee')}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    },
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* App Instruction */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Application Instruction"
              size="small"
              multiline
              rows={3}
              value={form.app_instruction}
              onChange={handleChange('app_instruction')}
              placeholder="Enter instructions shown to applicants..."
            />
          </Grid>

          {/* Admission Letter Template */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Admission Letter Template"
              size="small"
              multiline
              rows={3}
              value={form.admission_letter_template}
              onChange={handleChange('admission_letter_template')}
              placeholder="Enter admission letter template content..."
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
          <Button variant="contained" size="small" onClick={onClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSubmit} disabled={loading} sx={{ fontWeight: 700, minWidth: 100 }}>
            {loading ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

export default CreateAdmissionBatchModal;
