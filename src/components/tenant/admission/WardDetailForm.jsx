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
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { wardValidationSchema } from './validation/wardValidationSchema';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { getAllStates, getLgasByState } from '@/api/tenant/admission/admissionApi';
import { useNotification } from 'src/hooks/useNotification';

const EMPTY_FORM = {
  surname: '',
  first_name: '',
  other_name: '',
  dob: '',
  gender: '',
  state_of_origin: '',
  lga_id: '',
  home_address: '',
};

const WardDetailForm = ({ initialValues, onSubmit, onBack, isLoading = false, serverErrors = {} }) => {
  const notify = useNotification();
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  
  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema: wardValidationSchema,
    onSubmit: (values) => onSubmit(values),
    validateOnChange: true,
    validateOnBlur: true,
  });
  
  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      setStatesLoading(true);
      try {
        const data = await getAllStates();
        setStates(data || []);
      } catch (error) {
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
    // Only hydrate if we have states, initialValues, and haven't hydrated yet
    if (!states.length || !initialValues || hydrated) return;

    // Check if initialValues actually has data (not just an empty object)
    const hasData = initialValues.surname || initialValues.first_name;
    if (!hasData) return;

    const hydrate = async () => {
      console.log('[WardDetailForm] Hydrating with:', initialValues);
      
      // IMPORTANT: Get state from lga relationship first (backend provides lga object with state_id)
      // This ensures we have the correct state even if state_of_origin wasn't set
      let stateId = '';
      let lgaId = initialValues.lga_id || '';
      
      // Priority 1: Get state from the lga relationship (most accurate)
      if (initialValues.lga?.state_id) {
        stateId = initialValues.lga.state_id;
        console.log('[WardDetailForm] Got state from lga relationship:', stateId);
      } 
      // Priority 2: Fallback to state_of_origin
      else if (initialValues.state_of_origin) {
        stateId = initialValues.state_of_origin;
        console.log('[WardDetailForm] Got state from state_of_origin:', stateId);
      }

      // Step 1: Load LGAs for the state FIRST (before setting form values)
      if (stateId) {
        setLgasLoading(true);
        try {
          const data = await getLgasByState(stateId);
          setLgas(data || []);
          console.log('[WardDetailForm] Loaded', data?.length, 'LGAs for state:', stateId);
        } catch (err) {
          console.error('[WardDetailForm] Failed to load LGAs:', err);
          notify.error('Failed to load LGAs');
        } finally {
          setLgasLoading(false);
        }
      }

      // Step 2: Now set ALL form values including state and LGA
      formik.setValues({
        ...EMPTY_FORM,
        ...initialValues,
        state_of_origin: stateId || '',
        lga_id: lgaId || '', // Now LGAs are loaded, so this will work
      });

      console.log('[WardDetailForm] Set form values - state:', stateId, 'lga:', lgaId);

      setHydrated(true);
      console.log('[WardDetailForm] Hydration complete');
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, initialValues, hydrated]);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    formik.setFieldValue('state_of_origin', stateId);
    formik.setFieldValue('lga_id', '');

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
  }, [serverErrors]);

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Tell us about your ward
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Basic information
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Surname"
            name="surname"
            value={formik.values.surname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.surname && Boolean(formik.errors.surname)}
            helperText={formik.touched.surname && formik.errors.surname}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="First name"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Other name"
            name="other_name"
            value={formik.values.other_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Date of Birth"
            value={
              formik.values.dob && dayjs(formik.values.dob).isValid()
                ? dayjs(formik.values.dob)
                : null
            }
            onChange={(val) => {
              formik.setFieldValue('dob', val ? val.format('YYYY-MM-DD') : '');
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
            <InputLabel>Select Gender</InputLabel>
            <Select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Select Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.state_of_origin && Boolean(formik.errors.state_of_origin)}
            disabled={statesLoading}
          >
            <InputLabel>State of Origin</InputLabel>
            <Select
              name="state_of_origin"
              value={formik.values.state_of_origin || ''}
              onChange={handleStateChange}
              onBlur={formik.handleBlur}
              label="State of Origin"
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

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.lga_id && Boolean(formik.errors.lga_id)}
            disabled={!formik.values.state_of_origin || lgasLoading}
          >
            <InputLabel>LGA of Origin</InputLabel>
            <Select
              name="lga_id"
              value={formik.values.lga_id || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="LGA of Origin"
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

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Home Address"
            name="home_address"
            value={formik.values.home_address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={2}
            error={formik.touched.home_address && Boolean(formik.errors.home_address)}
            helperText={formik.touched.home_address && formik.errors.home_address}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={!formik.isValid || isLoading}
        >
          {isLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : 'Save and Continue'}
        </Button>
      </Box>
    </Box>
  );
};

WardDetailForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  serverErrors: PropTypes.object,
};

export default WardDetailForm;
