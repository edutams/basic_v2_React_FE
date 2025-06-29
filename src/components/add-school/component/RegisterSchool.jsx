import React, { useState, useEffect } from 'react';
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
import { useFormik } from 'formik';
import { schoolValidationScheme } from '../validation/schoolValidationScheme';
import ColorSchemeSelector from './ColorSchemeSelector';
import PropTypes from 'prop-types';

const lgaData = {
  lagos: [
    'Agege',
    'Ajeromi-Ifelodun',
    'Alimosho',
    'Amuwo-Odofin',
    'Apapa',
    'Badagry',
    'Epe',
    'Eti Osa',
    'Ibeju-Lekki',
    'Ifako-Ijaiye',
    'Ikeja',
    'Ikorodu',
    'Kosofe',
    'Lagos Island',
    'Lagos Mainland',
    'Mushin',
    'Ojo',
    'Oshodi-Isolo',
    'Shomolu',
    'Surulere',
  ],
  ogun: [
    'Abeokuta North',
    'Abeokuta South',
    'Ado-Odo/Ota',
    'Ewekoro',
    'Ifo',
    'Ijebu East',
    'Ijebu North',
    'Ijebu North East',
    'Ijebu Ode',
    'Ikenne',
    'Imeko Afon',
    'Ipokia',
    'Obafemi Owode',
    'Odeda',
    'Odogbolu',
    'Ogun Waterside',
    'Remo North',
    'Sagamu',
    'Yewa North',
    'Yewa South',
  ],
};

// Generate incremental ID for schools
const getNextId = () => {
  const lastId = parseInt(localStorage.getItem('lastSchoolId')) || 0;
  const newId = lastId + 1;
  localStorage.setItem('lastSchoolId', newId);
  return newId;
};

const RegisterSchoolForm = ({ actionType, selectedAgent, onSubmit, onCancel }) => {
  const [lgaOptions, setLgaOptions] = useState([]);

  const formik = useFormik({
    initialValues: {
      institutionName: selectedAgent?.institutionName || '',
      institutionShortName: selectedAgent?.institutionShortName || '',
      institutionAddress: selectedAgent?.institutionAddress || '',
      administratorFirstName: selectedAgent?.administratorFirstName || '',
      administratorLastName: selectedAgent?.administratorLastName || '',
      administratorEmail: selectedAgent?.administratorEmail || '',
      administratorPhone: selectedAgent?.administratorPhone || '',
      stateFilter: selectedAgent?.stateFilter || '',
      lga: selectedAgent?.lga || '',
      moduleType: selectedAgent?.moduleType || '',
      headerColor: selectedAgent?.headerColor || '#ffffff',
      sidebarColor: selectedAgent?.sidebarColor || '#ffffff',
      bodyColor: selectedAgent?.bodyColor || '#ffffff',
      registerSchool: selectedAgent?.registerSchool || '',
      permissions: selectedAgent?.permissions || [],
    },
    validationSchema: schoolValidationScheme,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedData = {
        ...values,
        id: actionType === 'update' ? selectedAgent.id : getNextId(),
        schoolUrl: `${values.institutionShortName.toLowerCase()}.edu`,
        gateway: 'No Gateway',
        colourScheme: values.bodyColor,
        headerColor: values.headerColor,
        sidebarColor: values.sidebarColor,
        status: 'Inactive',
        action: 'Edit',
        date: new Date().toISOString(),
        State: values.stateFilter, // Match SchoolDashboard.jsx field
        LGA: values.lga, // Match SchoolDashboard.jsx field
      };
      onSubmit(updatedData);
    },
  });

  // Update LGA options when stateFilter changes
  useEffect(() => {
    const selectedState = formik.values.stateFilter;
    const normalizedState = selectedState ? selectedState.toLowerCase() : '';
    const newLgaOptions = normalizedState && lgaData[normalizedState] ? lgaData[normalizedState] : [];

    // Only update state if necessary to prevent infinite loop
    if (JSON.stringify(newLgaOptions) !== JSON.stringify(lgaOptions)) {
      setLgaOptions(newLgaOptions);
    }

    // Reset lga if it's not valid for the new state
    if (normalizedState && formik.values.lga && !newLgaOptions.includes(formik.values.lga)) {
      formik.setFieldValue('lga', '');
    } else if (!normalizedState && formik.values.lga !== '') {
      formik.setFieldValue('lga', '');
    }
  }, [formik.values.stateFilter, formik.values.lga]);

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
            error={formik.touched.institutionShortName && Boolean(formik.errors.institutionShortName)}
            helperText={formik.touched.institutionShortName && formik.errors.institutionShortName}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
          <TextField
            label="Institution Address"
            fullWidth
            name="institutionAddress"
            multiline
            rows={2}
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
          <FormControl
            fullWidth
            error={formik.touched.lga && Boolean(formik.errors.lga)}
          >
            <InputLabel>LGA</InputLabel>
            <Select
              name="lga"
              value={formik.values.lga}
              label="LGA"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!lgaOptions.length}
            >
              <MenuItem value="">-- Choose --</MenuItem>
              {lgaOptions.map((lga) => (
                <MenuItem key={lga} value={lga}>
                  {lga}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.lga && formik.errors.lga && (
              <FormHelperText>{formik.errors.lga}</FormHelperText>
            )}
          </FormControl>
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

RegisterSchoolForm.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update', 'viewSchools']).isRequired,
  selectedAgent: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegisterSchoolForm;