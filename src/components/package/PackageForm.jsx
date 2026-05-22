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
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const PackageForm = ({ formik, actionType, selectedPackage, onCancel, loading = false }) => {
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
      formik.values.features.filter((feature) => feature !== featureToRemove),
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
        <Grid size={{ xs: 12, sm: 6 }}>
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
            size="small"
          />
        </Grid>

        {/* Package Type */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Package Type</InputLabel>
            <Select
              name="package_type"
              value={formik.values.package_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Package Type"
              size="small"
              error={formik.touched.package_type && Boolean(formik.errors.package_type)}
            >
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
              <MenuItem value="One-time">One-time</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Package Description */}
        <Grid size={{ xs: 12 }}>
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
            size="small"
          />
        </Grid>

        {/* Price */}
        <Grid size={{ xs: 12, sm: 6 }}>
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
            size="small"
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              error={formik.touched.status && Boolean(formik.errors.status)}
              size="small"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Features */}
        <Grid size={{ xs: 12 }}>
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
              size="small"
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

        <Grid size={{ xs: 12 }}>
          <Box mt={4} display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
            <Button
              onClick={onCancel}
              color="inherit"
              type="button"
              size="small"
              disabled={loading}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              size="small"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                width: { xs: '100%', sm: 'auto' },
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
