import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Grid,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

const divisionValidationSchema = Yup.object({
  name: Yup.string().required('Division Name is required'),
  code: Yup.string().required('Division Code is required'),
  description: Yup.string(),
  status: Yup.string().required('Status is required'),
  categories: Yup.object({
    Private: Yup.boolean(),
    Public: Yup.boolean(),
    Unapproved: Yup.boolean(),
    Community: Yup.boolean(),
  }),
});

const defaultCategories = {
  Private: false,
  Public: false,
  Unapproved: false,
  Community: false,
};

const CreateDivision = ({ actionType = 'create', selectedDivision, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      name: selectedDivision?.name || '',
      code: selectedDivision?.code || '',
      description: selectedDivision?.description || '',
      status: selectedDivision?.status || '',
      categories: selectedDivision?.categories || defaultCategories,
    },
    validationSchema: divisionValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    formik.setFieldValue('categories', {
      ...formik.values.categories,
      [name]: checked,
    });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            label="Division Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <TextField
            label="Division Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
            fullWidth
            required
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            label="Description "
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)} required>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="">--Choose--</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sm={12}>
          <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Categories</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6} sm={12}>
              <Grid item xs={12} md={6} sm={12}>
                <FormControlLabel
                  control={<Checkbox checked={formik.values.categories.Private} onChange={handleCategoryChange} name="Private" />}
                  label="Private"
                />
              </Grid>
              <Grid item xs={12} md={6} sm={12}>
                <FormControlLabel
                  control={<Checkbox checked={formik.values.categories.Public} onChange={handleCategoryChange} name="Public" />}
                  label="Public"
                />
              </Grid>
              </Grid>
              <Grid>
              <Grid item xs={12} md={6} sm={12}>
                <FormControlLabel
                  control={<Checkbox checked={formik.values.categories.Unapproved} onChange={handleCategoryChange} name="Unapproved" />}
                  label="Unapproved"
                />
              </Grid>
              <Grid item xs={12} md={6} sm={12}>
                <FormControlLabel
                  control={<Checkbox checked={formik.values.categories.Community} onChange={handleCategoryChange} name="Community" />}
                  label="Community"
                />
              </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Creating...' : (actionType === 'update' ? 'Update Division' : 'Create Division')}
        </Button>
      </Box>
        
      </Grid>
    </form>
  );
};

CreateDivision.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update']),
  selectedDivision: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CreateDivision;
