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

import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'; // for Agent
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'; // for Module
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'; // for Package
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'; // for Term
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'; // for Session

const PackageForm = ({
  initialValues = {
    package_name: '',
    package_description: '',
    package_status: 'active',
    package_icon: 'fas fa-box',
    package_code: '',
    package_order: 0
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
      package_order: initialValues.package_order || 0
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
            label="Package Order"
            name="package_order"
            type="number"
            value={formik.values.package_order}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.package_order && Boolean(formik.errors.package_order)}
            helperText={formik.touched.package_order && formik.errors.package_order}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Icon</InputLabel>
            <Select
              name="package_icon"
              value={formik.values.package_icon}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Icon"
              error={formik.touched.package_icon && Boolean(formik.errors.package_icon)}
            >
              <MenuItem value="school">
                <SchoolOutlinedIcon sx={{ mr: 1 }} />
                School
              </MenuItem>
              <MenuItem value="agent">
                <SupervisorAccountOutlinedIcon sx={{ mr: 1 }} />
                Agent
              </MenuItem>
              <MenuItem value="module">
                <ExtensionOutlinedIcon sx={{ mr: 1 }} />
                Module
              </MenuItem>
              <MenuItem value="package">
                <Inventory2OutlinedIcon sx={{ mr: 1 }} />
                Package
              </MenuItem>
              <MenuItem value="term">
                <CalendarTodayOutlinedIcon sx={{ mr: 1 }} />
                Term
              </MenuItem>
              <MenuItem value="session">
                <ScheduleOutlinedIcon sx={{ mr: 1 }} />
                Session
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit" type="button" disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isLoading || !formik.isValid}>
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
