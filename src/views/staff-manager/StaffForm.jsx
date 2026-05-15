import React from 'react';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IMaskInput } from 'react-imask';
import dayjs from 'dayjs';
import StaffAllocationFields from './components/StaffAllocationFields';

// Phone mask component
const PhoneMaskCustom = React.forwardRef(function PhoneMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000000"
      definitions={{
        '0': /[0-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const validationSchema = Yup.object({
  surname: Yup.string().required('Surname is required'),
  first_name: Yup.string().required('First Name is required'),
  phone_number: Yup.string().required('Phone is required'),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  date_of_appointment: Yup.date().nullable(),
  status: Yup.string().required('Status is required'),
  // Simplified allocation validation without cyclic dependencies
  classAllocations: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().nullable(),
      programme_id: Yup.string(),
      class_id: Yup.string(),
      class_arm_id: Yup.string()
    })
  ),
  subjectAllocations: Yup.array().of(
    Yup.object().shape({
      id: Yup.number().nullable(),
      programme_id: Yup.string(),
      class_id: Yup.string(),
      class_arm_id: Yup.string(),
      curriculum_id: Yup.string(),
      subject_id: Yup.string()
    })
  )
});

const StaffForm = ({ initialValues, onSubmit, onCancel, isLoading, mode }) => {
  console.log('=== STAFF FORM DEBUG ===');
  console.log('Initial values received:', initialValues);
  console.log('Mode:', mode);
  console.log('Class allocations in initial values:', initialValues?.classAllocations);
  console.log('Subject allocations in initial values:', initialValues?.subjectAllocations);
  const validateAllocations = (values) => {
    const errors = {};
    
    // Validate class allocations
    if (values.classAllocations && values.classAllocations.length > 0) {
      const classAllocationErrors = [];
      values.classAllocations.forEach((allocation, index) => {
        const allocationErrors = {};
        const hasAnyValue = allocation.programme_id || allocation.class_id || allocation.class_arm_id;
        
        if (hasAnyValue) {
          if (!allocation.programme_id) {
            allocationErrors.programme_id = 'Programme is required';
          }
          if (!allocation.class_id) {
            allocationErrors.class_id = 'Class is required';
          }
          if (!allocation.class_arm_id) {
            allocationErrors.class_arm_id = 'Class Arm is required';
          }
        }
        
        if (Object.keys(allocationErrors).length > 0) {
          classAllocationErrors[index] = allocationErrors;
        }
      });
      
      if (classAllocationErrors.length > 0) {
        errors.classAllocations = classAllocationErrors;
      }
    }
    
    // Validate subject allocations
    if (values.subjectAllocations && values.subjectAllocations.length > 0) {
      const subjectAllocationErrors = [];
      values.subjectAllocations.forEach((allocation, index) => {
        const allocationErrors = {};
        const hasAnyValue = allocation.programme_id || allocation.class_id || 
                           allocation.class_arm_id || allocation.curriculum_id || allocation.subject_id;
        
        if (hasAnyValue) {
          if (!allocation.programme_id) {
            allocationErrors.programme_id = 'Programme is required';
          }
          if (!allocation.class_id) {
            allocationErrors.class_id = 'Class is required';
          }
          if (!allocation.class_arm_id) {
            allocationErrors.class_arm_id = 'Class Arm is required';
          }
          if (!allocation.curriculum_id) {
            allocationErrors.curriculum_id = 'Curriculum is required';
          }
          if (!allocation.subject_id) {
            allocationErrors.subject_id = 'Subject is required';
          }
        }
        
        if (Object.keys(allocationErrors).length > 0) {
          subjectAllocationErrors[index] = allocationErrors;
        }
      });
      
      if (subjectAllocationErrors.length > 0) {
        errors.subjectAllocations = subjectAllocationErrors;
      }
    }
    
    return errors;
  };

  const handleFormSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      console.log('Form values before transformation:', {
        classAllocations: values.classAllocations,
        subjectAllocations: values.subjectAllocations
      });

      // Transform the form data to match backend expectations
      const transformedValues = {
        ...values,
        // Map form field names to backend field names
        first_name: values.first_name,
        last_name: values.surname, // Note: surname maps to last_name
        middle_name: values.middle_name || '',
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender,
        email: values.email,
        date_of_first_appointment: values.date_of_appointment ? 
          (typeof values.date_of_appointment === 'string' ? values.date_of_appointment : values.date_of_appointment.format('YYYY-MM-DD')) : 
          null,
        status: values.status,
        staff_type: 'teaching', // Since this is for teaching staff

        // Include allocation data with IDs - send all allocations, let backend handle empty ones
        classAllocations: values.classAllocations || [],
        subjectAllocations: values.subjectAllocations || []
      };

      console.log('Transformed payload:', transformedValues);
      console.log('Allocation data being sent:', {
        classAllocations: transformedValues.classAllocations,
        subjectAllocations: transformedValues.subjectAllocations
      });
      console.log('Class allocation IDs:', transformedValues.classAllocations.map(a => a.id));
      console.log('Subject allocation IDs:', transformedValues.subjectAllocations.map(a => a.id));
      
      await onSubmit(transformedValues);
    } catch (error) {
      setSubmitting(false);
      
      // Handle backend validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};
        
        // Convert backend errors to formik format
        Object.keys(backendErrors).forEach(key => {
          if (key.includes('classAllocations.')) {
            const match = key.match(/classAllocations\.(\d+)\.(.+)/);
            if (match) {
              const index = parseInt(match[1]);
              const field = match[2];
              if (!formattedErrors.classAllocations) {
                formattedErrors.classAllocations = [];
              }
              if (!formattedErrors.classAllocations[index]) {
                formattedErrors.classAllocations[index] = {};
              }
              formattedErrors.classAllocations[index][field] = backendErrors[key][0];
            }
          } else if (key.includes('subjectAllocations.')) {
            const match = key.match(/subjectAllocations\.(\d+)\.(.+)/);
            if (match) {
              const index = parseInt(match[1]);
              const field = match[2];
              if (!formattedErrors.subjectAllocations) {
                formattedErrors.subjectAllocations = [];
              }
              if (!formattedErrors.subjectAllocations[index]) {
                formattedErrors.subjectAllocations[index] = {};
              }
              formattedErrors.subjectAllocations[index][field] = backendErrors[key][0];
            }
          } else {
            // Map backend field names back to form field names
            if (key === 'last_name') {
              formattedErrors.surname = backendErrors[key][0];
            } else if (key === 'phone') {
              formattedErrors.phone_number = backendErrors[key][0];
            } else if (key === 'userId') {
              formattedErrors.staff_id = backendErrors[key][0];
            } else {
              formattedErrors[key] = backendErrors[key][0];
            }
          }
        });
        
        setErrors(formattedErrors);
      }
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Formik
        initialValues={{
          staff_id: initialValues?.staff_id || '',
          surname: initialValues?.surname || '',
          first_name: initialValues?.first_name || '',
          phone_number: initialValues?.phone_number || '',
          gender: initialValues?.gender || '',
          email: initialValues?.email || '',
          date_of_appointment: initialValues?.date_of_appointment || null,
          status: initialValues?.status || 'active',
          // Allocation fields - now arrays
          classAllocations: initialValues?.classAllocations || [{ 
            id: null, // No ID for new records
            session_term_id: '', 
            programme_id: '', 
            class_id: '', 
            class_arm_id: '' 
          }],
          subjectAllocations: initialValues?.subjectAllocations || [{ 
            id: null, // No ID for new records
            session_term_id: '', 
            programme_id: '', 
            class_id: '', 
            class_arm_id: '', 
            curriculum_id: '', 
            subject_id: '' 
          }],
        }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validate={(values) => {
          const errors = {};
          
          // First run Yup validation for basic fields
          try {
            validationSchema.validateSync(values, { abortEarly: false });
          } catch (error) {
            error.inner.forEach((err) => {
              if (err.path && !err.path.includes('Allocations')) {
                errors[err.path] = err.message;
              }
            });
          }
          
          // Then run custom allocation validation
          const allocationErrors = validateAllocations(values);
          Object.assign(errors, allocationErrors);
          
          return errors;
        }}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, submitForm }) => (
          <Form>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={4}>
                {/* Left Side: Staff Detail */}
                <Grid size={{ xs: 12, md: 5.5 }} >
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'primary.main' }}>
                    Staff Detail
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Staff ID"
                        name="staff_id"
                        placeholder="Auto-generated if blank"
                        value={values.staff_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.staff_id && Boolean(errors.staff_id)}
                        helperText={touched.staff_id && errors.staff_id}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Surname"
                        name="surname"
                        value={values.surname}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.surname && Boolean(errors.surname)}
                        helperText={touched.surname && errors.surname}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.first_name && Boolean(errors.first_name)}
                        helperText={touched.first_name && errors.first_name}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone_number"
                        placeholder="08000000000"
                        value={values.phone_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone_number && Boolean(errors.phone_number)}
                        helperText={touched.phone_number && errors.phone_number}
                        disabled={isLoading}
                        InputProps={{ inputComponent: PhoneMaskCustom }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Gender"
                        name="gender"
                        value={values.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.gender && Boolean(errors.gender)}
                        helperText={touched.gender && errors.gender}
                        disabled={isLoading}
                      >
                        <MenuItem value="">Select</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label="Date of Appointment"
                        value={values.date_of_appointment}
                        onChange={(v) => setFieldValue('date_of_appointment', v)}
                        disabled={isLoading}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} >
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                        disabled={isLoading}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Center Divider */}
                <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                  <Divider sx={{ display: { xs: 'block', md: 'none' }, width: '100%', my: 2 }} />
                </Grid>

                {/* Right Side: Allocation */}
                <Grid size={{ xs: 12, md: 5.5 }} >
                  <div id="classAllocations-section" data-field="classAllocations">
                    <StaffAllocationFields
                      values={values}
                      handleChange={handleChange}
                      setFieldValue={setFieldValue}
                      isLoading={isLoading}
                      errors={errors}
                      touched={touched}
                      mode={mode}
                    />
                  </div>
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: '1px solid #e0e0e0',
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2 
            }}>
              <Button
                color="inherit"
                onClick={onCancel}
                disabled={isLoading}
                sx={{ textTransform: 'none', minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
                sx={{ textTransform: 'none', minWidth: 100 }}
              >
                {isLoading ? 'Saving...' : (mode === 'edit' ? 'Update Staff' : 'Save Staff')}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </LocalizationProvider>
  );
};

export default StaffForm;
