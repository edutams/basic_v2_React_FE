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
import * as yup from 'yup';
import PropTypes from 'prop-types';
import {
  getClassesWithDivisions,
  getClassArms,
} from '../../../context/TenantContext/services/tenant.service';
import { teacherValidationSchema } from './validation/teacherValidationSchema';

const TeacherForm = ({
  initialValues = {
    staff_id: '',
    surname: '',
    first_name: '',
    phone_number: '',
    gender: '',
    email: '',
    is_class_teacher: false,
    class_id: '',
    class_arm_id: '',
    staff_type: '',
  },
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClassesWithDivisions();

        const allSubjects = [];
        const allClasses = [];

        (data || []).forEach((item) => {
          const itemsArray = item.classes || item;
          (itemsArray || []).forEach((cls) => {
            if (cls.subjects) {
              cls.subjects.forEach((sub) => {
                if (!allSubjects.includes(sub.subject_name)) {
                  allSubjects.push(sub.subject_name);
                }
              });
            }
            if (cls.id && cls.class_name) {
              allClasses.push({
                id: cls.id,
                name: cls.class_name,
              });
            }
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

        setClasses(allClasses);
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
      }
    };
    fetchData();
  }, []);

  // Fetch class arms when class is selected
  useEffect(() => {
    const fetchClassArms = async () => {
      if (!selectedClassId) {
        setClassArms([]);
        return;
      }

      try {
        const arms = await getClassArms(selectedClassId);
        setClassArms(arms || []);
      } catch (error) {
        console.error('Failed to fetch class arms:', error);
        setClassArms([]);
      }
    };
    fetchClassArms();
  }, [selectedClassId]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: teacherValidationSchema,
    onSubmit: (values) => onSubmit(values),
  });

  const isValid = formik.values.staff_id && formik.values.surname && formik.values.first_name;

  // Handle class selection
  const handleClassChange = (e) => {
    const classId = e.target.value;
    formik.setFieldValue('class_id', classId);
    formik.setFieldValue('class_arm_id', '');
    setSelectedClassId(classId);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Staff ID"
            name="staff_id"
            value={formik.values.staff_id || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.staff_id && Boolean(formik.errors.staff_id)}
            helperText={formik.touched.staff_id && formik.errors.staff_id}
          />
        </Box>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Surname"
            name="surname"
            value={formik.values.surname || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.surname && Boolean(formik.errors.surname)}
            helperText={formik.touched.surname && formik.errors.surname}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="First Name"
            name="first_name"
            value={formik.values.first_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Box>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Phone Number"
            name="phone_number"
            value={formik.values.phone_number || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
          />
        </Box>
      </Box>

      {/* Row 3: Gender, Email */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formik.values.gender || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Box>
      </Box>

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
                    formik.setFieldValue('class_id', '');
                    formik.setFieldValue('class_arm_id', '');
                    setSelectedClassId('');
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
                    formik.setFieldValue('class_id', '');
                    formik.setFieldValue('class_arm_id', '');
                    setSelectedClassId('');
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

      {/* Conditional: Class & Class Arm (if Yes) or Staff Type (if No) */}
      <Box sx={{ mb: 3 }}>
        {formik.values.is_class_teacher ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl
              fullWidth
              error={formik.touched.class_id && Boolean(formik.errors.class_id)}
              sx={{ flex: '1 1 45%', minWidth: '45%' }}
            >
              <InputLabel>Select Class</InputLabel>
              <Select
                name="class_id"
                value={formik.values.class_id || ''}
                onChange={handleClassChange}
                onBlur={formik.handleBlur}
                displayEmpty
                label="Select Class"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Class Arm Dropdown */}
            <FormControl
              fullWidth
              error={formik.touched.class_arm_id && Boolean(formik.errors.class_arm_id)}
              sx={{ flex: '1 1 45%', minWidth: '45%' }}
            >
              <InputLabel>Class Arm</InputLabel>
              <Select
                name="class_arm_id"
                value={formik.values.class_arm_id || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                displayEmpty
                label="Class Arm"
                disabled={!formik.values.class_id}
              >
                {classArms.map((arm) => (
                  <MenuItem key={arm.id} value={arm.id}>
                    {arm.arm_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <FormControl
            fullWidth
            error={formik.touched.staff_type && Boolean(formik.errors.staff_type)}
          >
            <InputLabel>Staff Type</InputLabel>
            <Select
              name="staff_type"
              value={formik.values.staff_type || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              displayEmpty
              label="Staff Type"
            >
              <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
              <MenuItem value="Teaching">Teaching</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={isLoading || !formik.isValid}>
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
