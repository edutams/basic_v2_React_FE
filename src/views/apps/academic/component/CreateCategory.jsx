import React from 'react';
import { Grid, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Validation schema for categories
const categoryValidationSchema = Yup.object({
  categoryName: Yup.string().required('Category name is required'),
  description: Yup.string(),
  status: Yup.string().required('Status is required'),
});

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const CreateCategory = ({ value, onSubmit, onCancel, isEditing }) => {
  const formik = useFormik({
    initialValues: {
      categoryName: value?.categoryName || '',
      description: value?.description || '',
      status: value?.status || '',
    },
    validationSchema: categoryValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedData = {
        ...values,
        id: value?.id || Date.now(),
        categoryName: values.categoryName || '',
        description: values.description || '',
        status: values.status || 'Inactive',
      };
      onSubmit(updatedData);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} mb={3} direction="column">
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <TextField
            label="Category Name"
            fullWidth
            name="categoryName"
            value={formik.values.categoryName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
            helperText={formik.touched.categoryName && formik.errors.categoryName}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <TextField
            label="Description"
            fullWidth
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
             
            >
              <MenuItem value="">-- Choose --</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
          {isEditing ? 'Update Category' : 'Save Category'}
        </Button>
      </Box>
    </form>
  );
};

CreateCategory.propTypes = {
  value: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default CreateCategory;