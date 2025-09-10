import React, { useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import PropTypes from 'prop-types';

const SchemeOfWorkForm = ({ initialValues = {}, onSubmit, onCancel, submitText }) => {
  // Initialize form values with safe defaults
  const safeInitialValues = {
    week: initialValues.week ?? '',
    topic: initialValues.topic ?? '',
    subtopic: initialValues.subtopic ?? '',
    resources: Array.isArray(initialValues.resources)
      ? initialValues.resources.join(', ')
      : initialValues.resources || '',
  };

  const [formValues, setFormValues] = React.useState(safeInitialValues);

  // Reset form values when initialValues changes
  useEffect(() => {
    setFormValues(safeInitialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit({
      ...formValues,
      week: parseInt(formValues.week, 10) || 0, // Fallback to 0 if invalid
      resources: formValues.resources
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Week"
        name="week"
        type="number"
        value={formValues.week}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Topic"
        name="topic"
        value={formValues.topic}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Subtopic"
        name="subtopic"
        value={formValues.subtopic}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Resources (comma-separated)"
        name="resources"
        value={formValues.resources}
        onChange={handleChange}
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {submitText}
        </Button>
      </Box>
    </Box>
  );
};

SchemeOfWorkForm.propTypes = {
  initialValues: PropTypes.shape({
    week: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    topic: PropTypes.string,
    subtopic: PropTypes.string,
    resources: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
};

export default SchemeOfWorkForm;
