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
    pac_name: '',
    pac_description: '',
    pac_status: 'active',
    pac_icon: 'fas fa-box',
  },
  onSubmit,
  onCancel,
  submitText = 'Create Package',
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues,
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
            name="pac_name"
            value={formik.values.pac_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.pac_name && Boolean(formik.errors.pac_name)}
            helperText={formik.touched.pac_name && formik.errors.pac_name}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Package Description"
            name="pac_description"
            value={formik.values.pac_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            error={formik.touched.pac_description && Boolean(formik.errors.pac_description)}
            helperText={formik.touched.pac_description && formik.errors.pac_description}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="pac_status"
              value={formik.values.pac_status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              error={formik.touched.pac_status && Boolean(formik.errors.pac_status)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Icon</InputLabel>
            <Select
              name="pac_icon"
              value={formik.values.pac_icon}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Icon"
              error={formik.touched.pac_icon && Boolean(formik.errors.pac_icon)}
            >
              {/* <MenuItem value="fas fa-box">📦 Box</MenuItem>
              <MenuItem value="fas fa-rocket">🚀 Rocket</MenuItem>
              <MenuItem value="fas fa-building">🏢 Building</MenuItem>
              <MenuItem value="fas fa-star">⭐ Star</MenuItem>
              <MenuItem value="fas fa-crown">👑 Crown</MenuItem> */}

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
          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onCancel} type="button" disabled={isLoading}>
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
