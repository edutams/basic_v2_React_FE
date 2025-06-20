import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const LocationFields = ({ formik }) => {
  return (
    <>
      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <FormControl
          fullWidth
          error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
        >
          <InputLabel>State Filter</InputLabel>
          <Select
            name="stateFilter"
            value={formik.values.stateFilter}
            label="State Filter"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose --</MenuItem>
            <MenuItem value="lagos">Lagos</MenuItem>
            <MenuItem value="abuja">Abuja</MenuItem>
          </Select>
          {formik.touched.stateFilter && formik.errors.stateFilter && (
            <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={3} md={6}>
        <TextField
          key="lga"
          label="LGA"
          fullWidth
          name="lga"
          value={formik.values.lga}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lga && Boolean(formik.errors.lga)}
          helperText={formik.touched.lga && formik.errors.lga}
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <FormControl
          fullWidth
          error={formik.touched.level && Boolean(formik.errors.level)}
        >
          <InputLabel>Agent Level</InputLabel>
          <Select
            name="level"
            value={formik.values.level}
            label="Agent Level"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose --</MenuItem>
            <MenuItem value="Level 1">Level 1</MenuItem>
            <MenuItem value="Level 2">Level 2</MenuItem>
            <MenuItem value="Level 3">Level 3</MenuItem>
          </Select>
          {formik.touched.level && formik.errors.level && (
            <FormHelperText>{formik.errors.level}</FormHelperText>
          )}
        </FormControl>
      </Grid>
    </>
  );
};

export default LocationFields;
