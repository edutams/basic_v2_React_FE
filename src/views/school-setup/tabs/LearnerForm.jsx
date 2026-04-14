import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';

const LearnerForm = ({
  initialValues = {
    admission_id: '',
    surname: '',
    first_name: '',
    other_name: '',
    gender: '',
    date_of_birth: null,
    arm: '',
  },
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [arms, setArms] = useState([]);

  useEffect(() => {
    const fetchArms = async () => {
      if (className) {
        try {
          const data = await getClassesWithDivisions();
          const cls = (data || []).find((c) => c.class_name === className);
          if (cls && cls.arm_names) {
            setArms(cls.arm_names);
          }
        } catch (error) {
          console.error('Failed to fetch arms:', error);
        }
      }
    };
    fetchArms();
  }, [className]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  const isValid =
    formik.values.admission_id &&
    formik.values.surname &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.arm;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Admission ID"
            name="admission_id"
            value={formik.values.admission_id || ''}
            onChange={formik.handleChange}
            fullWidth
            required
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <TextField
              label="Surname"
              name="surname"
              value={formik.values.surname || ''}
              onChange={formik.handleChange}
              fullWidth
              required
            />
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <TextField
              label="First Name"
              name="first_name"
              value={formik.values.first_name || ''}
              onChange={formik.handleChange}
              fullWidth
              required
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <TextField
              label="Other Name"
              name="other_name"
              value={formik.values.other_name || ''}
              onChange={formik.handleChange}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formik.values.gender || ''}
                onChange={formik.handleChange}
                displayEmpty
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <DatePicker
              label="Date of Birth"
              name="date_of_birth"
              value={formik.values.date_of_birth}
              onChange={(newValue) => formik.setFieldValue('date_of_birth', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <FormControl fullWidth>
              <InputLabel>Arm</InputLabel>
              <Select
                name="arm"
                value={formik.values.arm || ''}
                onChange={formik.handleChange}
                displayEmpty
                label="Arm"
              >
                {arms.map((arm, index) => (
                  <MenuItem key={index} value={arm}>
                    {arm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button color="inherit" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={isLoading || !isValid}>
            {isLoading ? 'Saving...' : submitText}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

LearnerForm.propTypes = {
  initialValues: PropTypes.object,
  className: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default LearnerForm;
