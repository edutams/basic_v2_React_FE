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
    mod_name: '',
    mod_description: '',
    mod_status: 'active',
    mod_links: {
      link: '',
      permission: ''
    }
  },
  onSubmit,
  onCancel,
  submitText = 'Create Module',
  isLoading = false 
}) => {
  const formik = useFormik({
    initialValues,
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
            name="mod_name"
            value={formik.values.mod_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.mod_name && Boolean(formik.errors.mod_name)}
            helperText={formik.touched.mod_name && formik.errors.mod_name}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Module Description"
            name="mod_description"
            value={formik.values.mod_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={1}
            variant="outlined"
            error={formik.touched.mod_description && Boolean(formik.errors.mod_description)}
            helperText={formik.touched.mod_description && formik.errors.mod_description}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Module Link"
            name="mod_links.link"
            value={formik.values.mod_links?.link || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.mod_links?.link && Boolean(formik.errors.mod_links?.link)}
            helperText={formik.touched.mod_links?.link && formik.errors.mod_links?.link}
            placeholder="/module-path"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Module Permission"
            name="mod_links.permission"
            value={formik.values.mod_links?.permission || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.mod_links?.permission && Boolean(formik.errors.mod_links?.permission)}
            helperText={formik.touched.mod_links?.permission && formik.errors.mod_links?.permission}
            placeholder="module.view"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth variant="outlined">
            {/* <InputLabel>Status</InputLabel> */}
            <Select
              name="mod_status"
              value={formik.values.mod_status}
              onChange={formik.handleChange}
              displayEmpty
              onBlur={formik.handleBlur}
              // label="Status"
              error={formik.touched.mod_status && Boolean(formik.errors.mod_status)}
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
