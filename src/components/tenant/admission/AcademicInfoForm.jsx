import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { academicInfoValidationSchema } from './validation/academicInfoValidationSchema';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';
import { useNotification } from 'src/hooks/useNotification';

const EMPTY_FORM = {
  has_previous_school: false,
  prev_school_name: '',
  prev_school_state: '',
  prev_school_lga: '',
  previous_class: '',
  intending_programme_id: '',
  intending_class_id: '',
  study_mode: '',
};

const AcademicInfoForm = ({
  initialValues,
  onSubmit,
  onBack,
  isLoading = false,
  serverErrors = {},
  selectedBatch
}) => {
  const notify = useNotification();

  // ── State ─────────────────────────────────────────────────────────────────
  const [states, setStates] = useState([]); // all states
  const [lgas, setLgas] = useState([]); // filtered by selected state
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Extract programme and classes from selectedBatch
  const batchProgramme = selectedBatch?.programme;
  const batchClasses = selectedBatch?.classes || [];

  // ── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema: academicInfoValidationSchema,
    onSubmit: (values) => onSubmit(values),
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Validation helpers
  const isPrevSchoolValid =
    !formik.values.has_previous_school ||
    (
      formik.values.prev_school_name &&
      formik.values.prev_school_state &&
      formik.values.prev_school_lga &&
      formik.values.previous_class
    );

  const isIntendingValid =
    Boolean(formik.values.intending_class_id) &&
    Boolean(formik.values.study_mode);

  const isFormValid =
    isPrevSchoolValid && isIntendingValid && formik.isValid;

  // Trigger form validation when batch classes are loaded
  useEffect(() => {
    if (batchClasses.length > 0) {
      // Re-validate the form when classes become available
      formik.validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchClasses.length]);

  // ── Load states on mount ──────────────────────────────────────────────
  useEffect(() => {
    const loadStates = async () => {
      setStatesLoading(true);
      try {
        const data = await getAllStates();
        setStates(data || []);
      } catch (err) {
        console.error('Failed to load states', err);
        notify.error('Failed to load states');
      } finally {
        setStatesLoading(false);
      }
    };

    loadStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate form with initialValues once states are loaded
  useEffect(() => {
    if (!states.length || !initialValues || hydrated) return;

    const hydrate = async () => {
      const prevSchoolState = initialValues.prev_school_state;
      const prevSchoolLga = initialValues.prev_school_lga;

      // Set all form values first - ensure batch programme is not overridden
      formik.setValues({
        ...EMPTY_FORM,
        ...initialValues,
        intending_programme_id: batchProgramme?.id || initialValues?.intending_programme_id || '',
        intending_class_id: initialValues?.intending_class_id || '',
        prev_school_state: prevSchoolState || '',
        prev_school_lga: '', // Temporarily clear LGA until options load
      });

      // Load LGAs if state exists
      if (prevSchoolState) {
        setLgasLoading(true);
        try {
          const data = await getLgasByState(prevSchoolState);
          setLgas(data || []);

          // Set LGA after options are loaded
          if (prevSchoolLga) {
            formik.setFieldValue('prev_school_lga', prevSchoolLga);
          }
        } catch (err) {
          notify.error('Failed to load LGAs');
        } finally {
          setLgasLoading(false);
        }
      }

      setHydrated(true);
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, initialValues]);

  // Update batch-related fields when selectedBatch changes
  useEffect(() => {
    if (!hydrated) return; // Only update after initial hydration
    
    if (batchProgramme?.id) {
      formik.setFieldValue('intending_programme_id', batchProgramme.id);
    }
    
    // Clear intending_class_id if batch changed (since classes might be different)
    if (formik.values.intending_class_id && batchClasses.length > 0) {
      const classExists = batchClasses.find(c => c.id === parseInt(formik.values.intending_class_id));
      if (!classExists) {
        // Class doesn't exist in new batch, clear it
        formik.setFieldValue('intending_class_id', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchProgramme?.id, batchClasses.length]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    formik.setFieldValue('prev_school_state', stateId);
    formik.setFieldValue('prev_school_lga', '');

    setLgas([]);

    if (!stateId) return;

    setLgasLoading(true);
    try {
      const data = await getLgasByState(stateId);
      setLgas(data || []);
    } catch (error) {
      notify.error('Failed to load LGAs');
    } finally {
      setLgasLoading(false);
    }
  };

  // Merge server errors with formik errors
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      Object.keys(serverErrors).forEach(key => {
        formik.setFieldError(key, serverErrors[key]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrors]);

  const hasPrev = formik.values.has_previous_school;
  const fe = formik.errors;
  const ft = formik.touched;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Academic information
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ── Previous school ── */}
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Previous school information
      </Typography>

      {/* Toggle row */}
      <Alert
        severity="info"
        sx={{
          mb: 2.5,
          bgcolor: '#F0F9FF',
          '& .MuiAlert-message': { width: '100%', p: 0 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">Does your ward have Previous school information</Typography>
          <Checkbox
            name="has_previous_school"
            checked={formik.values.has_previous_school}
            onChange={formik.handleChange}
            color="primary"
            sx={{ p: 0.5 }}
          />
        </Box>
      </Alert>

      {/* Previous school fields */}
      {hasPrev && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Previous school name"
              name="prev_school_name"
              value={formik.values.prev_school_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={ft.prev_school_name && Boolean(fe.prev_school_name)}
              helperText={ft.prev_school_name && fe.prev_school_name}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl
              fullWidth
              error={ft.prev_school_state && Boolean(fe.prev_school_state)}
              disabled={statesLoading}
            >
              <InputLabel>State</InputLabel>
              <Select
                name="prev_school_state"
                value={formik.values.prev_school_state || ''}
                onChange={handleStateChange}
                onBlur={formik.handleBlur}
                label="State"
                endAdornment={statesLoading && <CircularProgress size={20} sx={{ mr: 2 }} />}
              >
                {states.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.state_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl
              fullWidth
              error={ft.prev_school_lga && Boolean(fe.prev_school_lga)}
              disabled={!formik.values.prev_school_state || lgasLoading}
            >
              <InputLabel>LGA</InputLabel>
              <Select
                name="prev_school_lga"
                value={formik.values.prev_school_lga || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="LGA"
                endAdornment={lgasLoading && <CircularProgress size={20} sx={{ mr: 2 }} />}
              >
                {lgas.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.lga_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Previous Class"
              name="previous_class"
              value={formik.values.previous_class}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={ft.previous_class && Boolean(fe.previous_class)}
              helperText={ft.previous_class && fe.previous_class}
            />
          </Grid>
        </Grid>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* ── Intending class ── */}
      <Box mb={4}>

        <Typography variant="subtitle1" fontWeight={700}>
          Intending Class
        </Typography>
        <small className='text-success'>Programme and class are determined by the Selected Batch,select the intend class!!!</small>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Programme"
            value={batchProgramme?.programme_name || batchProgramme?.programme_code || 'N/A'}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={ft.intending_class_id && Boolean(fe.intending_class_id)}
          >
            <InputLabel>Class Choice</InputLabel>
            <Select
              name="intending_class_id"
              value={formik.values.intending_class_id || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Class Choice"
            >
              <MenuItem value="" disabled>
                Select Class
              </MenuItem>
              {batchClasses.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.class_code || c.class_name}
                </MenuItem>
              ))}
            </Select>
            {ft.intending_class_id && fe.intending_class_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {fe.intending_class_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={ft.study_mode && Boolean(fe.study_mode)}>
            <InputLabel>Boarding Status</InputLabel>
            <Select
              name="study_mode"
              value={formik.values.study_mode ?? ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Boarding Status"
            >
              <MenuItem value="day">Day Student</MenuItem>
              <MenuItem value="boarding">Boarding Student</MenuItem>
            </Select>
            {ft.study_mode && fe.study_mode && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {fe.study_mode}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Footer — matches ParentForm action row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} sx={{ mr: 2 }} />
          ) : (
            'Save and Continue'
          )}
        </Button>
      </Box>
    </Box>
  );
};

AcademicInfoForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  serverErrors: PropTypes.object,
  selectedBatch: PropTypes.object.isRequired,
};

export default AcademicInfoForm;
