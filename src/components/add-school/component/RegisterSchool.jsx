import React from 'react';
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
} from '@mui/material';
 import ColorSchemeSelector from './ColorSchemeSelector';

const RegisterSchoolForm = ({ formik, onCancel, actionType }) => {
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} mb={3}>

        {/* RegisterSchoolFormFields */}

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Institution Name"
            fullWidth
            name="institutionName"
            value={formik.values.institutionName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.institutionName && Boolean(formik.errors.institutionName)}
            helperText={formik.touched.institutionName && formik.errors.institutionName}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Institution Short Name"
            fullWidth
            name="institutionShortName"
            value={formik.values.institutionShortName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.administratorName && Boolean(formik.errors.administratorName)}
            helperText={formik.touched.administratorName && formik.errors.administratorName}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
          <TextField
            label="Institution Address"
            fullWidth
            name="institutionAddress"
             multiline                rows={2}
            value={formik.values.institutionAddress}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.institutionAddress && Boolean(formik.errors.institutionAddress)}
            helperText={formik.touched.institutionAddress && formik.errors.institutionAddress}
          />
        </Grid>

         <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Administrator First Name"
            fullWidth
            name="administratorFirstName"
            value={formik.values.administratorFirstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.administratorFirstName && Boolean(formik.errors.administratorFirstName)}
            helperText={formik.touched.administratorFirstName && formik.errors.administratorFirstName}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Administrator Last Name"
            fullWidth
            name="administratorLastName"
            value={formik.values.administratorLastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.administratorLastName && Boolean(formik.errors.administratorLastName)}
            helperText={formik.touched.administratorLastName && formik.errors.administratorLastName}
          />
        </Grid>

         <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Administrator Email"
            fullWidth
            name="administratorEmail"
            value={formik.values.administratorEmail}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.administratorEmail && Boolean(formik.errors.administratorEmail)}
            helperText={formik.touched.administratorEmail && formik.errors.administratorEmail}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Administrator Phone"
            fullWidth
            name="administratorPhone"
            value={formik.values.administratorPhone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.administratorPhone && Boolean(formik.errors.administratorPhone)}
            helperText={formik.touched.administratorPhone && formik.errors.administratorPhone}
          />
        </Grid>

        {/* RegisterSchoolLocationFields */}
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
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

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
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

        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.moduleType && Boolean(formik.errors.moduleType)}
          >
            <InputLabel>Module Type</InputLabel>
            <Select
              name="moduleType"
              value={formik.values.moduleType}
              label="Module Type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="">-- Choose --</MenuItem>
              <MenuItem value="school-manager">School Manager</MenuItem>
              <MenuItem value="school-payment">School Payment</MenuItem>
              <MenuItem value="school-portal">School Portal</MenuItem>
            </Select>
            {formik.touched.moduleType && formik.errors.moduleType && (
              <FormHelperText>{formik.errors.moduleType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* ColorSchemeSelector */}

        <Grid item xs={12}>
          <ColorSchemeSelector formik={formik} />
        </Grid>
      
        {/* <Grid item xs={12} sm={6}>
          <TextField
            label="Header Color"
            fullWidth
            name="headerColor"
            value={formik.values.headerColor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.headerColor && Boolean(formik.errors.headerColor)}
            helperText={formik.touched.headerColor && formik.errors.headerColor}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Sidebar Color"
            fullWidth
            name="sidebarColor"
            value={formik.values.sidebarColor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sidebarColor && Boolean(formik.errors.sidebarColor)}
            helperText={formik.touched.sidebarColor && formik.errors.sidebarColor}
          />
        </Grid>

         <Grid item xs={12} sm={6}>
          <TextField
            label="Body Color"
            fullWidth
            name="bodyColor"
            value={formik.values.bodyColor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.bodyColor && Boolean(formik.errors.bodyColor)}
            helperText={formik.touched.bodyColor && formik.errors.bodyColor}
          />
        </Grid> */}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        {actionType !== 'viewSchools' && (
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {actionType === 'update' ? 'Update Register School' : 'Save'}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default RegisterSchoolForm;
