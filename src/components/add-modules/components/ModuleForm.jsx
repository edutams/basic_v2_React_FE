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
} from '@mui/material';
import { useFormik } from 'formik';
import { moduleValidationSchema } from '../validation/moduleValidationSchema';
import PropTypes from 'prop-types';

const ModuleForm = ({ 
  initialValues = {
    module_name: '',
    module_description: '',
    module_status: 'active',
    module_links: {
      link: '',
      permission: ''
    },
    is_sidebar: 'no',
    module_order: 0
  },
  onSubmit,
  onCancel,
  submitText = 'Create Module',
  isLoading = false 
}) => {
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      // Handle potential legacy field names
      module_name: initialValues.module_name || initialValues.mod_name || '',
      module_description: initialValues.module_description || initialValues.mod_description || '',
      module_status: initialValues.module_status || initialValues.mod_status || 'active',
      module_links: initialValues.module_links || initialValues.mod_links || { link: '', permission: '' },
      is_sidebar: initialValues.is_sidebar || 'no',
      module_order: initialValues.module_order || 0
    },
    validationSchema: moduleValidationSchema,
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
            label="Module Name"
            name="module_name"
            value={formik.values.module_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.module_name && Boolean(formik.errors.module_name)}
            helperText={formik.touched.module_name && formik.errors.module_name}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Module Description"
            name="module_description"
            value={formik.values.module_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={1}
            variant="outlined"
            error={formik.touched.module_description && Boolean(formik.errors.module_description)}
            helperText={formik.touched.module_description && formik.errors.module_description}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Module Link"
            name="module_links.link"
            value={formik.values.module_links?.link || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.module_links?.link && Boolean(formik.errors.module_links?.link)}
            helperText={formik.touched.module_links?.link && formik.errors.module_links?.link}
            placeholder="/module-path"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Module Permission"
            name="module_links.permission"
            value={formik.values.module_links?.permission || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.module_links?.permission && Boolean(formik.errors.module_links?.permission)}
            helperText={formik.touched.module_links?.permission && formik.errors.module_links?.permission}
            placeholder="module.view"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth variant="outlined">
            <Select
              name="module_status"
              value={formik.values.module_status}
              onChange={formik.handleChange}
              displayEmpty
              onBlur={formik.handleBlur}
              error={formik.touched.module_status && Boolean(formik.errors.module_status)}
            >
               <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              sx={{ mr: 1 }} color="inherit" 
              onClick={onCancel}
              type="button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.isValid}
            >
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

ModuleForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default ModuleForm;
