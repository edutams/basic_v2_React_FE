import React from 'react';
import {
  Box,
  Grid as Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { packageValidationSchema } from '../validation/packageValidationSchema';
import PropTypes from 'prop-types';

// Unused imports removed

const PackageForm = ({
  initialValues = {
    package_name: '',
    package_description: '',
    package_status: 'active',
    package_icon: 'fas fa-box',
    // package_code: '',
  },
  onSubmit,
  onCancel,
  submitText = 'Create Package',
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      // Handle potential legacy field names
      package_name: initialValues.package_name || initialValues.pac_name || '',
      package_description: initialValues.package_description || initialValues.pac_description || '',
      package_status: initialValues.package_status || initialValues.pac_status || 'active',
      package_icon: initialValues.package_icon || initialValues.pac_icon || 'fas fa-box',
      package_code: initialValues.package_code || initialValues.pac_code || '',
    },
    validationSchema: packageValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
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
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Package Description"
            name="package_description"
            value={formik.values.package_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            error={formik.touched.package_description && Boolean(formik.errors.package_description)}
            helperText={formik.touched.package_description && formik.errors.package_description}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="package_status"
              value={formik.values.package_status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              error={formik.touched.package_status && Boolean(formik.errors.package_status)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Package Code"
            name="package_code"
            value={formik.values.package_code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.package_code && Boolean(formik.errors.package_code)}
            helperText={formik.touched.package_code && formik.errors.package_code}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Icon"
            name="package_icon"
            value={formik.values.package_icon}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.package_icon && Boolean(formik.errors.package_icon)}
            helperText={formik.touched.package_icon && formik.errors.package_icon}
            placeholder="e.g. fas fa-box"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              onClick={onCancel}
              sx={{ mr: 1 }}
              color="inherit"
              type="button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

PackageForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default PackageForm;
