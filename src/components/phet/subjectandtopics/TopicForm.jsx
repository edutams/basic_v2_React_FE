import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import { topicValidationSchema } from './validation/topicValidationSchema';

const TopicForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitText,
  isLoading,
  selectedSubject,
}) => {
  const [form, setForm] = useState({
    topic: initialValues?.topic || '',
    subject_name: initialValues?.subject_name || '',
    status: initialValues?.status || 'active',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await topicValidationSchema.validate(form, { abortEarly: false });
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
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Topic Name"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          error={!!errors.topic}
          helperText={errors.topic}
        />
        <TextField
          label="subject name"
          name="subject_name"
          value={form.subject_name || selectedSubject?.subject_name || ''}
          disabled
          error={!!errors.subject_name}
          // helperText={errors.subject_name || 'Subject is auto-selected'}
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
          }}
        />
        <TextField
          select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          error={!!errors.status}
          helperText={errors.status}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <Box display="flex" justifyContent="flex-end">
          <Button sx={{ mr: 1 }} color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading}>
            {submitText}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

TopicForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  selectedSubject: PropTypes.object,
};

export default TopicForm;
