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
  CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import { stimulationLinkValidationSchema } from './validation/subcriptionValidationSchema';
import tenantApi from 'src/api/tenant_api';

const SubcriptionFormLink = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  isLoading,
}) => {
  const [form, setForm] = useState({
    subscriptionMode: 'perTerm',
    session: '',
    term: '',
    studentpopulation: '',
    availableplan: '',
    status: 'active',
    ...initialValues,
  });
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState({
    sessions: [],
    terms: [],
    plans: [],
  });
  const [fetchingOptions, setFetchingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFetchingOptions(true);
        const res = await tenantApi.get('/get-form-options');
        setOptions(res.data);
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setFetchingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm({
        subscriptionMode: initialValues.subscriptionMode || 'perTerm',
        session: initialValues.session || '',
        term: initialValues.term || '',
        studentpopulation: initialValues.studentpopulation || '',
        availableplan: initialValues.availableplan || '',
        status: initialValues.status || 'active',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    // Reset term when switching to per session mode
    if (name === 'subscriptionMode' && value === 'perSession') {
      setForm((prev) => ({ ...prev, term: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stimulationLinkValidationSchema.validate(form, { abortEarly: false });
      setErrors({});
      // Ensure we map student population correctly if needed, 
      // but for now let's just send the form
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

  if (fetchingOptions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
        <FormLabel component="legend">Subscription Mode</FormLabel>
        <RadioGroup
          row
          name="subscriptionMode"
          value={form.subscriptionMode}
          onChange={handleChange}
        >
          <FormControlLabel value="perTerm" control={<Radio />} label="Per Term" />
          <FormControlLabel value="perSession" control={<Radio />} label="Per Session" />
        </RadioGroup>
      </FormControl>

      {form.subscriptionMode === 'perSession' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This subscription mode allows for automatic creation of all terms (e.g First Term, Second
          Term, Third Term) in the selected session with the bulk payment of the subscription fees.
        </Alert>
      )}

      <TextField
        fullWidth
        label="Select Session"
        name="session"
        value={form.session}
        onChange={handleChange}
        margin="normal"
        error={!!errors.session}
        helperText={errors.session}
        select
      >
        <MenuItem value="">Select Session</MenuItem>
        {options.sessions.map((session) => (
          <MenuItem key={session.id} value={session.id.toString()}>
            {session.sesname}
          </MenuItem>
        ))}
      </TextField>

      {form.subscriptionMode === 'perTerm' && (
        <TextField
          fullWidth
          label="Select Term"
          name="term"
          value={form.term}
          onChange={handleChange}
          margin="normal"
          error={!!errors.term}
          helperText={errors.term}
          select
        >
          <MenuItem value="">Select Term</MenuItem>
          {options.terms.map((term) => (
            <MenuItem key={term.id} value={term.id.toString()}>
              {term.term_name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        label="Student Population"
        name="studentpopulation"
        value={form.studentpopulation}
        onChange={handleChange}
        margin="normal"
        error={!!errors.studentpopulation}
        helperText={errors.studentpopulation}
        select
      >
        <MenuItem value="">Select Student Population</MenuItem>
        <MenuItem value="1-50">1-50 Students</MenuItem>
        <MenuItem value="51-100">51-100 Students</MenuItem>
        <MenuItem value="101-200">101-200 Students</MenuItem>
        <MenuItem value="200+">200 and above Students</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Available Plan"
        name="availableplan"
        value={form.availableplan}
        onChange={handleChange}
        margin="normal"
        error={!!errors.availableplan}
        helperText={errors.availableplan}
        select
      >
        <MenuItem value="">Select Plan</MenuItem>
        {options.plans.map((plan) => (
          <MenuItem key={plan.id} value={plan.id.toString()}>
            {plan.display_name} (₦{parseFloat(plan.price).toLocaleString()})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Status"
        name="status"
        value={form.status}
        onChange={handleChange}
        margin="normal"
        error={!!errors.status}
        helperText={errors.status}
      >
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button sx={{ mr: 1 }} color="inherit" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? 'Submitting...' : submitText}
        </Button>
      </Box>
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
