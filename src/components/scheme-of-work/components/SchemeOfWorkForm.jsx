import React, { useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import PropTypes from 'prop-types';

const SchemeOfWorkForm = ({ initialValues = {}, onSubmit, onCancel, submitText }) => {
  const [isFormModified, setIsFormModified] = React.useState(false);

  const getSafeInitialValues = (values) => {
    if (!values) {
      return {
        week: '',
        topic: '',
        subtopic: '',
        resources: '',
      };
    }

    return {
      week: values.week ?? '',
      topic: values.topic ?? '',
      subtopic: values.subtopic ?? '',
      resources: Array.isArray(values.resources)
        ? values.resources.join(', ')
        : values.resources || '',
    };
  };

  const [formValues, setFormValues] = React.useState(() => getSafeInitialValues(initialValues));

  useEffect(() => {
    const safeValues = getSafeInitialValues(initialValues);
    setFormValues(safeValues);
    setIsFormModified(false);
  }, [initialValues]);

  const handleChange = (e) => {
    const newValues = { ...formValues, [e.target.name]: e.target.value };
    setFormValues(newValues);

    const safeInitial = getSafeInitialValues(initialValues);
    const hasChanges = Object.keys(newValues).some((key) => newValues[key] !== safeInitial[key]);
    setIsFormModified(hasChanges);
  };

  const handleSubmit = () => {
    onSubmit({
      ...formValues,
      week: parseInt(formValues.week, 10) || 0,
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
        <Button variant="contained" onClick={handleSubmit} disabled={!isFormModified}>
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
