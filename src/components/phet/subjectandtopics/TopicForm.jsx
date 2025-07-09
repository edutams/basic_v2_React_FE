import React from 'react';
import { Box, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Topic name is required'),
  status: Yup.string().required('Status is required'),
});

const TopicForm = ({ open, onClose, initialValues, onSubmit, submitText, isLoading }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => onSubmit(values),
  });

  if (!open) return null;

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Topic Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button variant="contained" type="submit" disabled={isLoading || !formik.isValid}>
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TopicForm;