import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ClassStructureModal = ({ 
  open, 
  onClose, 
  onSave, 
  editingStructure 
}) => {
  const [formData, setFormData] = useState({
    class_name: '',
    arms: [''],
    status: 'active',
    order: 1,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStructure) {
      setFormData({
        class_name: editingStructure.class_name || '',
        arms: editingStructure.arms && editingStructure.arms.length > 0 
          ? editingStructure.arms 
          : [''],
        status: editingStructure.status || 'active',
        order: editingStructure.order || 1,
      });
    } else {
      resetForm();
    }
  }, [editingStructure, open]);

  const resetForm = () => {
    setFormData({
      class_name: '',
      arms: [''],
      status: 'active',
      order: 1,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArmChange = (index, value) => {
    const newArms = [...formData.arms];
    newArms[index] = value;
    setFormData(prev => ({
      ...prev,
      arms: newArms
    }));
  };

  const addArm = () => {
    setFormData(prev => ({
      ...prev,
      arms: [...prev.arms, '']
    }));
  };

  const removeArm = (index) => {
    if (formData.arms.length > 1) {
      const newArms = formData.arms.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        arms: newArms
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.class_name.trim()) {
      newErrors.class_name = 'Class name is required';
    }

    const validArms = formData.arms.filter(arm => arm.trim() !== '');
    if (validArms.length === 0) {
      newErrors.arms = 'At least one arm is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        ...formData,
        arms: formData.arms.filter(arm => arm.trim() !== ''),
      };
      onSave(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {editingStructure ? 'Edit Class Structure' : 'Add New Class Structure'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Class Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Class Name"
                value={formData.class_name}
                onChange={handleInputChange('class_name')}
                error={!!errors.class_name}
                helperText={errors.class_name}
                placeholder="e.g., JSS1, SS2, Primary 1"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleInputChange('status')}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Order */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Display Order"
                value={formData.order}
                onChange={handleInputChange('order')}
                error={!!errors.order}
                helperText={errors.order || "Order in which this class will be displayed"}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Arms Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Class Arms
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add the different arms or sections for this class (e.g., Alpha, Beta, A, B, etc.)
              </Typography>
              
              {errors.arms && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {errors.arms}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.arms.map((arm, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Arm ${index + 1}`}
                      value={arm}
                      onChange={(e) => handleArmChange(index, e.target.value)}
                      placeholder="e.g., Alpha, Beta, A, B"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeArm(index)}
                      disabled={formData.arms.length === 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={addArm}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              {/* Preview of arms */}
              {formData.arms.filter(arm => arm.trim() !== '').length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Preview:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.arms
                      .filter(arm => arm.trim() !== '')
                      .map((arm, index) => (
                        <Chip
                          key={index}
                          label={arm}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.class_name.trim() || formData.arms.filter(arm => arm.trim() !== '').length === 0}
        >
          {editingStructure ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ClassStructureModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editingStructure: PropTypes.object,
};

export default ClassStructureModal;
