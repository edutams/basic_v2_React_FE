import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';

const RegisterTermForm = ({ actionType, selectedAgent, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: selectedAgent ? selectedAgent.id : Date.now(), // Simple ID generation for new terms
    termName: selectedAgent ? selectedAgent.termName : '',
    status: selectedAgent ? selectedAgent.status : 'Active',
    isCurrent: selectedAgent ? selectedAgent.isCurrent : false,
  });

  const [errors, setErrors] = useState({ termName: '' });

  // Update formData when selectedAgent changes (for edit mode)
  useEffect(() => {
    if (selectedAgent && actionType === 'update') {
      setFormData({
        id: selectedAgent.id,
        termName: selectedAgent.termName,
        status: selectedAgent.status,
        isCurrent: selectedAgent.isCurrent,
      });
    }
  }, [selectedAgent, actionType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for termName when user types
    if (name === 'termName' && value.trim()) {
      setErrors((prev) => ({ ...prev, termName: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { termName: '' };

    if (!formData.termName.trim()) {
      newErrors.termName = 'Term name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
      }}
    >
      <Typography variant="h6">{actionType === 'create' ? 'Add New Term' : 'Edit Term'}</Typography>

      <TextField
        label="Term Name"
        name="termName"
        value={formData.termName}
        onChange={handleChange}
        error={!!errors.termName}
        helperText={errors.termName}
        fullWidth
        required
      />

      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          label="Status"
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            name="isCurrent"
            checked={formData.isCurrent}
            onChange={handleChange}
          />
        }
        label="Set as Current Term"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
        >
          {actionType === 'create' ? 'Add Term' : 'Update Term'}
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterTermForm;