import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Skeleton,
  Grid,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { stimulationLinkValidationSchema } from './validation/subcriptionValidationSchema';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';

const SubcriptionFormLink = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  isLoading,
}) => {
  const [form, setForm] = useState({
    subscriptionMode: 'per_term',
    session: '',
    term: '',
    studentpopulation: '',
    availableplan: '',
    status: 'active',
    ...initialValues,
  });
  const [errors, setErrors] = useState({});

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [plans, setPlans] = useState([]);

  const [fetchingSessions, setFetchingSessions] = useState(true);
  const [fetchingTerms, setFetchingTerms] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setFetchingSessions(true);
        const res = await subscriptionApi.getSessions();
        setSessions(res.data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setFetchingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!form.studentpopulation) {
      setPlans([]);
      return;
    }
    const fetchPlans = async () => {
      try {
        setFetchingPlans(true);
        const res = await subscriptionApi.getPlansByPopulation(form.studentpopulation);
        setPlans(res.data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      } finally {
        setFetchingPlans(false);
      }
    };
    fetchPlans();
  }, [form.studentpopulation]);

  useEffect(() => {
    if (!form.session) {
      setTerms([]);
      return;
    }
    const fetchTerms = async () => {
      try {
        setFetchingTerms(true);
        const res = await subscriptionApi.getTermsBySession(form.session);
        setTerms(res.data || []);
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTerms([]);
      } finally {
        setFetchingTerms(false);
      }
    };
    fetchTerms();
  }, [form.session]);

  useEffect(() => {
    if (form.session) {
      setForm((prev) => ({ ...prev, term: '', availableplan: '' }));
    }
  }, [form.session]);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm({
        subscriptionMode: initialValues.subscriptionMode || 'per_term',
        session: initialValues.session || '',
        term: initialValues.term || '',
        availableplan: initialValues.availableplan || '',
        status: initialValues.status || 'active',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'studentpopulation') {
      setForm((prev) => ({ ...prev, studentpopulation: value, availableplan: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === 'subscriptionMode' && value === 'per_session') {
      setForm((prev) => ({ ...prev, term: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stimulationLinkValidationSchema.validate(form, { abortEarly: false });
      setErrors({});
      onSubmit(form);
    } catch (validationError) {
      if (validationError.inner) {
        const formErrors = {};
        validationError.inner.forEach((err) => {
          formErrors[err.path] = err.message;
        });
        setErrors(formErrors);
      }
    }
  };

  if (fetchingSessions) {
    return (
      <Box sx={{ py: 1 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={1.5}>
        {/* Subscription Mode */}
        <Grid size={{ xs: 12 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.8rem', mb: 0.5, fontWeight: 600 }}>
              Subscription Mode
            </FormLabel>
            <RadioGroup
              row
              name="subscriptionMode"
              value={form.subscriptionMode}
              onChange={handleChange}
            >
              <FormControlLabel
                value="per_term"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Per Term</Typography>}
              />
              <FormControlLabel
                value="per_session"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Per Session</Typography>}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Per Session Info */}
        {form.subscriptionMode === 'per_session' && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info" sx={{ py: 0, '& .MuiAlert-message': { py: 0.5, fontSize: '0.8rem' } }}>
              This subscription mode allows for automatic creation of all terms (e.g First Term,
              Second Term, Third Term) in the selected session with the bulk payment of the
              subscription fees.
            </Alert>
          </Grid>
        )}

        {/* Session */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Session"
            name="session"
            value={form.session}
            onChange={handleChange}
            error={!!errors.session}
            helperText={errors.session}
            select
            size="small"
          >
            <MenuItem value="">Select Session</MenuItem>
            {sessions.map((session) => (
              <MenuItem key={session.id} value={session.id.toString()}>
                {session.session_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Term (only for per_term) */}
        {form.subscriptionMode === 'per_term' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Term"
              name="term"
              value={form.term}
              onChange={handleChange}
              error={!!errors.term}
              helperText={errors.term}
              size="small"
              select
              disabled={!form.session || fetchingTerms}
            >
              <MenuItem value="">
                {!form.session ? 'Select session first' : fetchingTerms ? 'Loading...' : 'Select Term'}
              </MenuItem>
              {terms.map((st) => (
                <MenuItem key={st.term?.id || st.id} value={st.term?.id?.toString() || st.id?.toString()}>
                  {st.term?.term_name || st.term_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Student Population */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Student Population"
            name="studentpopulation"
            value={form.studentpopulation}
            onChange={handleChange}
            error={!!errors.studentpopulation}
            helperText={errors.studentpopulation}
            select
            size="small"
          >
            <MenuItem value="">Select Population</MenuItem>
            <MenuItem value="0 - 99">0-99 Students</MenuItem>
            <MenuItem value="100 - 199">100-199 Students</MenuItem>
            <MenuItem value="200 and above">200 and above Students</MenuItem>
          </TextField>
        </Grid>

        {/* Plan */}
        <Grid
  size={{
    xs: 12,
    sm: form.subscriptionMode === 'per_term' ? 6 : 12,
  }}
>
          <TextField
            fullWidth
            label="Plan"
            name="availableplan"
            value={form.availableplan}
            onChange={handleChange}
            error={!!errors.availableplan}
            helperText={
              !form.studentpopulation
                ? 'Select population first'
                : plans.length === 0
                  ? 'No plans available'
                  : errors.availableplan
            }
            select
            disabled={!form.studentpopulation || plans.length === 0}
            size="small"
          >
            <MenuItem value="">Select Plan</MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id.toString()}>
                {plan.display_name} — ₦{parseFloat(plan.price).toLocaleString()}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status */}
       

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button size="small" type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Submitting...' : submitText}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

SubcriptionFormLink.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default SubcriptionFormLink;
