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
import { getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';
import { teacherValidationSchema } from './validation/teacherValidationSchema';

const TeacherForm = ({
  initialValues = {
    staff_id: '',
    surname: '',
    first_name: '',
    middle_name: '',
    phone_number: '',
    gender: '',
    email: '',
    is_class_teacher: false,
    class_arm_id: '',
    class_arm: '',
    staff_type: 'Teaching',
  },
  className,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isLoading = false,
}) => {
  const [subjects, setSubjects] = useState([]);
  const [classArms, setClassArms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Fetch classes and class arms from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClassesWithDivisions();

        console.log('Classes service response:', data);

        // Get unique subjects from all classes
        const allSubjects = [];

        // Get unique classes
        const uniqueClasses = [];
        const classMap = new Map();

        // Get all unique arms
        const allArms = [];
        const armMap = new Map();

        // Data is array of classes with arms property
        (data || []).forEach((cls) => {
          // Collect subjects
          if (cls.subjects) {
            cls.subjects.forEach((sub) => {
              if (!allSubjects.includes(sub.subject_name)) {
                allSubjects.push(sub.subject_name);
              }
            });
          }

          // Collect unique classes
          if (cls.id && cls.class_name && !classMap.has(cls.id)) {
            classMap.set(cls.id, true);
            uniqueClasses.push({
              id: cls.id,
              class_name: cls.class_name,
            });
          }

          // Collect class arms
          if (cls.arms && Array.isArray(cls.arms)) {
            cls.arms.forEach((arm) => {
              if (!armMap.has(arm.id)) {
                armMap.set(arm.id, true);
                allArms.push({
                  id: arm.id,
                  class_id: cls.id,
                  arm_name: arm.arm_name,
                });
              }
            });
          }
        });

        console.log('Extracted Classes:', uniqueClasses);
        console.log('Extracted Arms:', allArms);

        setSubjects(
          allSubjects.length > 0
            ? allSubjects
            : ['Mathematics', 'English', 'Science', 'Social Studies', 'Religious Studies'],
        );
        setClasses(uniqueClasses);
        setClassArms(allArms);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSubjects(['Mathematics', 'English', 'Science', 'Social Studies', 'Religious Studies']);
        setClasses([]);
        setClassArms([]);
      }
    };
    fetchData();
  }, []);

  // Filter arms based on selected class
  const filteredArms = selectedClassId
    ? classArms.filter(
        (arm) => arm.class_id === selectedClassId || arm.id?.startsWith(`${selectedClassId}-arm-`),
      )
    : classArms;

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: teacherValidationSchema,
    onSubmit: (values) => onSubmit(values),
  });

  // Handle class teacher checkbox change
  const handleClassTeacherChange = (e) => {
    formik.setFieldValue('is_class_teacher', e.target.checked);
    if (!e.target.checked) {
      formik.setFieldValue('class_arm_id', '');
      formik.setFieldValue('class_arm', '');
      setSelectedClassId('');
    } else {
      formik.setFieldValue('staff_type', 'teaching');
    }
  };

  // Handle class selection change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    formik.setFieldValue('class_arm_id', '');
    formik.setFieldValue('class_arm', '');
  };

  // Handle arm selection change
  const handleArmChange = (e) => {
    const armId = e.target.value;
    const selectedArm = classArms.find((arm) => arm.id === armId);
    formik.setFieldValue('class_arm_id', armId);
    formik.setFieldValue('class_arm', selectedArm?.arm_name || '');
  };

  const isValid = formik.values.staff_id && formik.values.surname && formik.values.first_name;

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

      {/* Row 2: First Name, Phone Number */}
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
                onChange={() => {
                  formik.setFieldValue('is_class_teacher', true);
                  formik.setFieldValue('staff_type', 'teaching');
                }}
              />
            }
            label="Yes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.is_class_teacher === false}
                onChange={() => {
                  formik.setFieldValue('is_class_teacher', false);
                  formik.setFieldValue('class_arm_id', '');
                  formik.setFieldValue('class_arm', '');
                  setSelectedClassId('');
                }}
              />
            }
            label="No"
          />
        </Box>
      </Box>

      {/* Conditional: Class Teacher Fields (if Yes) or Staff Type (if No) */}
      <Box sx={{ mb: 3 }}>
        {formik.values.is_class_teacher ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Class Selection */}
            <FormControl
              fullWidth
              sx={{ flex: '1 1 45%', minWidth: '45%' }}
              error={formik.touched.class_arm_id && Boolean(formik.errors.class_arm_id)}
            >
              <InputLabel>Class</InputLabel>
              <Select
                name="class_id"
                value={selectedClassId || ''}
                onChange={handleClassChange}
                onBlur={formik.handleBlur}
                displayEmpty
                label="Class"
              >
                <MenuItem value="">Select a class</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Class Arm Selection */}
            <FormControl
              fullWidth
              sx={{ flex: '1 1 45%', minWidth: '45%' }}
              error={formik.touched.class_arm_id && Boolean(formik.errors.class_arm_id)}
            >
              <InputLabel>Class Arm</InputLabel>
              <Select
                name="class_arm_id"
                value={formik.values.class_arm_id || ''}
                onChange={handleArmChange}
                onBlur={formik.handleBlur}
                displayEmpty
                label="Class Arm"
                disabled={!selectedClassId}
              >
                <MenuItem value="">Select a class arm</MenuItem>
                {filteredArms.map((arm) => (
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

      {/* Action Buttons */}
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
