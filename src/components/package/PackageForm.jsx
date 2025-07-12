import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const PackageForm = ({ formik, actionType, selectedPackage, onCancel }) => {
  const isEditMode = actionType === 'update';
  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim() && !formik.values.features.includes(newFeature.trim())) {
      formik.setFieldValue('features', [...formik.values.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    formik.setFieldValue(
      'features',
      formik.values.features.filter(feature => feature !== featureToRemove)
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        {/* Package Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Package Name"
            name="package_name"
            value={formik.values.package_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.package_name && Boolean(formik.errors.package_name)}
            helperText={formik.touched.package_name && formik.errors.package_name}
            required
          />
        </Grid>

        {/* Package Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Package Type</InputLabel>
            <Select
              name="package_type"
              value={formik.values.package_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Package Type"
              error={formik.touched.package_type && Boolean(formik.errors.package_type)}
            >
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
              <MenuItem value="One-time">One-time</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Package Description */}
        <Grid item xs={12}>
          <TextField
            label="Package Description"
            name="package_description"
            value={formik.values.package_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            error={formik.touched.package_description && Boolean(formik.errors.package_description)}
            helperText={formik.touched.package_description && formik.errors.package_description}
            required
          />
        </Grid>

        {/* Price */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            required
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Features */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Package Features
          </Typography>
          
          {/* Add Feature Input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Add Feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddFeature} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Enter a feature and press Enter or click +"
            />
          </Box>

          {/* Features List */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {formik.values.features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                onDelete={() => handleRemoveFeature(feature)}
                deleteIcon={<DeleteIcon />}
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>

          {formik.values.features.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              No features added yet. Add features to describe what's included in this package.
            </Typography>
          )}
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              onClick={onCancel}
              sx={{ mr: 1 }}
              color="inherit"
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={formik.isSubmitting}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              {isEditMode ? 'Update Package' : 'Create Package'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

PackageForm.propTypes = {
  formik: PropTypes.object.isRequired,
  actionType: PropTypes.string.isRequired,
  selectedPackage: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
};

export default PackageForm;
