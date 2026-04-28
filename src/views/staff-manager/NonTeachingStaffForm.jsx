import React from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import PropTypes from 'prop-types';

const nonTeachingStaffValidationSchema = yup.object({
  staff_id: yup.string(),
  surname: yup.string().required('Surname is required'),
  first_name: yup.string().required('First name is required'),
  phone_number: yup.string(),
  gender: yup.string().required('Gender is required'),
  email: yup.string().email('Invalid email format'),
  status: yup.string().required('Status is required'),
  role: yup.string().required('Role is required'),
});

const NonTeachingStaffForm = ({
  initialValues = {
    staff_id: '',
    surname: '',
    first_name: '',
    phone_number: '',
    gender: '',
    email: '',
    status: 'active',
    role: '',
  },
  onSubmit,
  onCancel,
  submitText = 'Add Staff',
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: nonTeachingStaffValidationSchema,
    onSubmit: (values) => onSubmit(values),
  });

  // Predefined roles for non-teaching staff
  const roles = [
    'Bursar',
    'Security',
    'Librarian',
    'Cleaner',
    'Driver',
    'Cook',
    'Gardener',
    'IT Support',
    'Admin',
    'Accountant',
  ];

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
            placeholder="Auto-generated if empty"
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
            required
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
            required
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Box>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <TextField
            label="Phone"
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)} required>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formik.values.gender || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Gender"
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
            {formik.touched.gender && formik.errors.gender && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {formik.errors.gender}
              </Box>
            )}
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
            placeholder="@smaiplm.com"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '45%' }}>
          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)} required>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="leave">Leave</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {formik.errors.status}
              </Box>
            )}
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)} required>
          <InputLabel>Select Role</InputLabel>
          <Select
            name="role"
            value={formik.values.role || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Select Role"
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.role && formik.errors.role && (
            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
              {formik.errors.role}
            </Box>
          )}
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          type="submit" 
        >
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </Box>
    </Box>
  );
};

NonTeachingStaffForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default NonTeachingStaffForm;
