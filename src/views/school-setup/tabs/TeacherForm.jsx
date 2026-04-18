import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';

const TeacherForm = ({
  initialValues = {
    staff_id: '',
    surname: '',
    first_name: '',
    phone_number: '',
    gender: '',
    email: '',
    is_class_teacher: false,
    class_arm: '',
    staff_type: '',
  },
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [classArms, setClassArms] = useState([]);

  // Fetch subjects and class arms from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClassesWithDivisions();

        // Get unique subjects from all classes
        const allSubjects = [];
        const allArms = [];

        (data || []).forEach((division) => {
          (division.programmes || []).forEach((programme) => {
            (programme.classes || []).forEach((cls) => {
              if (cls.subjects) {
                cls.subjects.forEach((sub) => {
                  if (!allSubjects.includes(sub.subject_name)) {
                    allSubjects.push(sub.subject_name);
                  }
                });
              }
              // Collect class arms
              if (cls.class_name && !allArms.includes(cls.class_name)) {
                allArms.push(cls.class_name);
              }
            });
          });
        });

        setSubjects(
          allSubjects.length > 0
            ? allSubjects
            : [
                'Mathematics',
                'English',
                'Science',
                'Social Studies',
                'Religious Studies',
                'Physical Education',
                'Music',
                'Art',
              ],
        );

        setClassArms(
          allArms.length > 0
            ? allArms
            : ['Science', 'Arts', 'Commercial', 'Primary 1', 'Primary 2', 'Primary 3'],
        );
      } catch (error) {
        console.error('Failed to fetch data:', error);

        setSubjects([
          'Mathematics',
          'English',
          'Science',
          'Social Studies',
          'Religious Studies',
          'Physical Education',
          'Music',
          'Art',
        ]);

        setClassArms(['Science', 'Arts', 'Commercial', 'Primary 1', 'Primary 2', 'Primary 3']);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  const isValid =
    formik.values.staff_id &&
    formik.values.surname &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.email;

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      {/* Row 1: Staff ID, Surname */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Staff ID"
            name="staff_id"
            value={formik.values.staff_id || ''}
            onChange={formik.handleChange}
            fullWidth
            required
          />
        </Box>
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
      </Box>

      {/* Row 2: First Name, Phone Number */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Phone Number"
            name="phone_number"
            value={formik.values.phone_number || ''}
            onChange={formik.handleChange}
            fullWidth
          />
        </Box>
      </Box>

      {/* Row 3: Gender, Email */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formik.values.email || ''}
            onChange={formik.handleChange}
            fullWidth
            required
          />
        </Box>
      </Box>

      {/* Is Class Teacher - Warning Background */}
      <Box
        sx={{
          mb: 3,
          p: 1,
          bgcolor: '#fff3e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Is Class Teacher?
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.is_class_teacher === true}
                onChange={(e) => {
                  formik.setFieldValue('is_class_teacher', e.target.checked ? true : false);
                  if (e.target.checked) {
                    formik.setFieldValue('staff_type', '');
                  } else {
                    formik.setFieldValue('class_arm', '');
                  }
                }}
              />
            }
            label="Yes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.is_class_teacher === false}
                onChange={(e) => {
                  formik.setFieldValue('is_class_teacher', e.target.checked ? false : true);
                  if (e.target.checked) {
                    formik.setFieldValue('class_arm', '');
                  } else {
                    formik.setFieldValue('staff_type', '');
                  }
                }}
                // sx={{
                //   color: '#e65100',
                //   '&.Mui-checked': {
                //     color: '#e65100',
                //   },
                // }}
              />
            }
            label="No"
            // sx={{ color: '#e65100' }}
          />
        </Box>
      </Box>

      {/* Conditional: Class Arm (if Yes) or Staff Type (if No) */}
      <Box sx={{ mb: 3 }}>
        {formik.values.is_class_teacher ? (
          <FormControl fullWidth>
            <InputLabel>Class Arm</InputLabel>
            <Select
              name="class_arm"
              value={formik.values.class_arm || ''}
              onChange={formik.handleChange}
              displayEmpty
              label="Class Arm"
            >
              {classArms.map((arm, index) => (
                <MenuItem key={index} value={arm}>
                  {arm}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Staff Type</InputLabel>
            <Select
              name="staff_type"
              value={formik.values.staff_type || ''}
              onChange={formik.handleChange}
              displayEmpty
              label="Staff Type"
            >
              <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
              <MenuItem value="Teaching">Teaching</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={isLoading || !isValid}>
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </Box>
    </Box>
  );
};

TeacherForm.propTypes = {
  initialValues: PropTypes.object,
  className: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default TeacherForm;
