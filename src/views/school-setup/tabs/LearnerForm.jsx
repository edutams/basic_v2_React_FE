import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  getClassArms,
  getClassesWithDivisions,
} from '../../../context/TenantContext/services/tenant.service';

const LearnerForm = ({
  initialValues = {
    learner_id: '',
    class_id: '',
    class_arm_id: '',
    surname: '',
    first_name: '',
    other_name: '',
    gender: '',
    date_of_birth: null,
  },
  classId,
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [classArms, setClassArms] = useState([]);

  useEffect(() => {
    const fetchArms = async () => {
      if (classId) {
        try {
          // Get class arm details from getClassesWithDivisions
          const data = await getClassArms(classId);
          // Convert classId to number for comparison (API might return string IDs)
          const classIdNum = Number(classId);
          // const cls = (data || []).find((c) => Number(c.id) === classIdNum);
          console.log('Class ID:', classId, 'Converted:', classIdNum);
          console.log('Class found:', cls);
          console.log('Arms:', cls?.arms);
          if (cls && cls.arms) {
            setClassArms(cls.arms);
          }
        } catch (error) {
          console.error('Failed to fetch arms:', error);
        }
      }
    };
    fetchArms();
  }, [classId]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  const isValid =
    formik.values.surname &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.class_arm_id;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Learner ID"
            name="learner_id"
            value={formik.values.learner_id || ''}
            onChange={formik.handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
            <TextField
              label="Last Name"
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
              label="Middle Name"
              name="middle_name"
              value={formik.values.middle_name || ''}
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
                name="class_arm_id"
                value={formik.values.class_arm_id || ''}
                onChange={formik.handleChange}
                displayEmpty
                label="Arm"
              >
                {classArms.map((arm) => (
                  <MenuItem key={arm.id} value={arm.id}>
                    {arm.arm_names || `Arm ${arm.id}`}
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
  classId: PropTypes.number,
  className: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default LearnerForm;
