import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
    subject: '',
  },
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [subjects, setSubjects] = useState([]);

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getClassesWithDivisions();
        // Get unique subjects from all classes
        const allSubjects = [];
        (data || []).forEach((cls) => {
          if (cls.subjects) {
            cls.subjects.forEach((sub) => {
              if (!allSubjects.includes(sub.subject_name)) {
                allSubjects.push(sub.subject_name);
              }
            });
          }
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
      } catch (error) {
        console.error('Failed to fetch subjects:', error);

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
      }
    };
    fetchSubjects();
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
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Staff ID"
          name="staff_id"
          value={formik.values.staff_id || ''}
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
            label="Phone Number"
            name="phone_number"
            value={formik.values.phone_number || ''}
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
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              name="subject"
              value={formik.values.subject || ''}
              onChange={formik.handleChange}
              displayEmpty
              label="Subject"
            >
              {subjects.map((subject, index) => (
                <MenuItem key={index} value={subject}>
                  {subject}
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
