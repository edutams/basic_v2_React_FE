import React from 'react';
import { TextField, Button, Box } from '@mui/material';

const SchemeOfWorkForm = ({ initialValues = {}, onSubmit, onCancel, submitText }) => {
  const safeInitialValues = initialValues || {};
  const resourcesValue = Array.isArray(safeInitialValues.resources)
    ? safeInitialValues.resources.join(', ')
    : (safeInitialValues.resources || '');
  const [formValues, setFormValues] = React.useState({
    week: safeInitialValues.week ?? '',
    topic: safeInitialValues.topic ?? '',
    subtopic: safeInitialValues.subtopic ?? '',
    resources: resourcesValue,
  });

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit({
      ...formValues,
      week: parseInt(formValues.week, 10),
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
      />
      <TextField label="Topic" name="topic" value={formValues.topic} onChange={handleChange} />
      <TextField
        label="Subtopic"
        name="subtopic"
        value={formValues.subtopic}
        onChange={handleChange}
      />
      <TextField
        label="Resources (comma-separated)"
        name="resources"
        value={formValues.resources}
        onChange={handleChange}
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

export default SchemeOfWorkForm;
