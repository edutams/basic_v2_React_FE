import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import { stimulationLinkValidationSchema } from './validation/stimulationLinkValidationSchema';

const StimulationFormLink = ({ initialValues = {}, onSubmit, onCancel, submitText = 'Submit', isLoading }) => {
  const [form, setForm] = useState({
    title: '',
    topic: '',
    link: '',
    status: 'active',
    ...initialValues,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm({
        title: initialValues.title || '',
        topic: initialValues.topic || '',
        link: initialValues.link || '',
        status: initialValues.status || 'active',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
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

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Link Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        margin="normal"
        error={!!errors.title}
        helperText={errors.title}
      />
      <TextField
        fullWidth
        label="Topic"
        name="topic"
        value={form.topic}
        onChange={handleChange}
        margin="normal"
        error={!!errors.topic}
        helperText={errors.topic}
      />
      <TextField
        fullWidth
        label="Link URL"
        name="link"
        value={form.link}
        onChange={handleChange}
        margin="normal"
        type="url"
        error={!!errors.link}
        helperText={errors.link}
      />
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
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? 'Submitting...' : submitText}
        </Button>
      </Box>
    </Box>
  );
};

StimulationFormLink.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default StimulationFormLink; 