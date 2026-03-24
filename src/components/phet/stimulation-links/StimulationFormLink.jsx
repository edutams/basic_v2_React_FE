import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { stimulationLinkValidationSchema } from './validation/stimulationLinkValidationSchema';
import phetApi from 'src/api/phet/phetApi';

const StimulationFormLink = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  isLoading,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Map API initial values to form field names
  const mapInitialValues = (values) => ({
    subject_id: values.subject_id || '',
    topic_id: values.topic_id || '',
    title: values.title || '',
    link: values.link || '',
    status: values.status || 'active',
  });

  const [form, setForm] = useState(mapInitialValues(initialValues));
  const [errors, setErrors] = useState({});

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const data = await phetApi.getSubjectsForDropdown();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch topics on mount (all topics)
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const data = await phetApi.getTopicsForDropdown();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  // Update form when initialValues change
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setForm(mapInitialValues(initialValues));
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
      {/* <FormControl fullWidth margin="normal" error={!!errors.subject_id}>
        <InputLabel>Subject</InputLabel>
        <Select
          name="subject_id"
          value={form.subject_id}
          onChange={handleChange}
          label="Subject"
          disabled={loadingSubjects}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.subject_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl> */}
      <TextField
        fullWidth
        label="Title"
        name="title"
        value={form.title || ''}
        onChange={handleChange}
        margin="normal"
        error={!!errors.title}
        helperText={errors.title}
      />

      <FormControl fullWidth margin="normal" error={!!errors.topic_id}>
        <InputLabel>Topic</InputLabel>
        <Select
          name="topic_id"
          value={form.topic_id}
          onChange={handleChange}
          label="Topic"
          disabled={loadingTopics}
        >
          {topics.map((topic) => (
            <MenuItem key={topic.id} value={topic.id}>
              {topic.subject_name} - {topic.topic}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Link URL"
        name="link"
        value={form.link || ''}
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

StimulationFormLink.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default StimulationFormLink;
