import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { useFormik } from 'formik';
import { holidayValidationSchema } from '../validation/holidayValidationSchema';
import PropTypes from 'prop-types';

const HolidayForm = ({
  initialValues = {
    holiday_date: '',
    holiday_description: '',
  },
  onSubmit,
  submitText = 'Add More',
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues,
    validationSchema: holidayValidationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      onSubmit(values);
      resetForm();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            label="Date"
            name="holiday_date"
            type="date"
            value={formik.values.holiday_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            error={formik.touched.holiday_date && Boolean(formik.errors.holiday_date)}
            helperText={formik.touched.holiday_date && formik.errors.holiday_date}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Description"
            name="holiday_description"
            value={formik.values.holiday_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            size="small"
            placeholder="Enter holiday description"
            error={formik.touched.holiday_description && Boolean(formik.errors.holiday_description)}
            helperText={formik.touched.holiday_description && formik.errors.holiday_description}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? 'Adding...' : submitText}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

HolidayForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default HolidayForm;