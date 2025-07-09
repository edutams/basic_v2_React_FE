import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import PropTypes from 'prop-types';

const SubjectForm = ({
  initialValues = {},
  onSubmit,
  onCancel,
  submitText,
  isLoading,
}) => {
  const [form, setForm] = useState({
    name: initialValues.name || '',
    code: initialValues.code || '',
    status: initialValues.status || 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Subject Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          label="Subject Code"
          name="code"
          value={form.code}
          onChange={handleChange}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={form.status}
            label="Status"
            onChange={handleChange}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isLoading}
          >
            {submitText}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

SubjectForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

export default SubjectForm;
