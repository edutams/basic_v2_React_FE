import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';

const PlanForm = ({ actionType, selectedPlan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    studentLimit: '',
    status: '',
  });
  const [errors, setErrors] = useState({});

  // Predefined options for studentLimit
  const studentLimitOptions = [
    { value: '1-50', label: '1-50' },
    { value: '51-99', label: '51-99' },
    { value: '100-199', label: '100-199' },
    { value: '200 and Above', label: '200 and Above' },
  ];

  // Predefined options for status
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    if (actionType === 'update' && selectedPlan) {
      setFormData({
        id: selectedPlan.id,
        name: selectedPlan.name || '',
        description: selectedPlan.description || '',
        price: selectedPlan.price || '',
        studentLimit: selectedPlan.studentLimit || '',
        status: selectedPlan.status || '',
      });
      setErrors({});
    }
  }, [actionType, selectedPlan]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.studentLimit || formData.studentLimit === '') newErrors.studentLimit = 'Please select a student limit';
    if (!formData.status || formData.status === '') newErrors.status = 'Please select a status';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0,
      
    });
    
    if (actionType === 'create') {
      setFormData({
        name: '',
        description: '',
        price: '',
        studentLimit: '',
        status: '',
      });
      setErrors({});
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Plan Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
        error={!!errors.name}
        helperText={errors.name}
      />
      
      <TextField
        label="Price (₦)"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        required
        fullWidth
        inputProps={{ step: '0.01', min: '0' }}
        error={!!errors.price}
        helperText={errors.price}
      />
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={3}
        fullWidth
      />
      <FormControl fullWidth error={!!errors.studentLimit}>
        <InputLabel>Student Limit</InputLabel>
        <Select
          name="studentLimit"
          value={formData.studentLimit}
          onChange={handleChange}
          required
        >
          <MenuItem value="" disabled>
            Choose
          </MenuItem>
          {studentLimitOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors.studentLimit && <FormHelperText>{errors.studentLimit}</FormHelperText>}
      </FormControl>
      <FormControl fullWidth error={!!errors.status}>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <MenuItem value="" disabled>
            Choose
          </MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {actionType === 'create' ? 'Add Plan' : 'Update Plan'}
        </Button>
      </Box>
    </Box>
  );
};

export default PlanForm;