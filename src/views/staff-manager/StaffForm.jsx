import React from 'react';
import { Box, TextField, Grid, MenuItem } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IMaskInput } from 'react-imask';
import dayjs from 'dayjs';

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
  // staff_id: Yup.string().required('Staff ID is required'),
  surname: Yup.string().required('Surname is required'),
  first_name: Yup.string().required('First Name is required'),
  phone_number: Yup.string().required('Phone is required'),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  date_of_appointment: Yup.date().nullable(),
  status: Yup.string().required('Status is required'),
});

const StaffForm = ({ initialValues, onSubmit, isLoading }) => {
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
          date_of_appointment: initialValues?.date_of_appointment
            ? dayjs(initialValues.date_of_appointment)
            : null,
          status: initialValues?.status || 'active',
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, submitForm }) => (
          <Form>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Staff ID"
                    name="staff_id"
                    placeholder="If left blank, it will be auto-generated"
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
                    placeholder="Surname"
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
                    placeholder="First Name"
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
                    InputProps={{
                      inputComponent: PhoneMaskCustom,
                    }}
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="@smaiplm.com"
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
                    onChange={(newValue) => setFieldValue('date_of_appointment', newValue)}
                    disabled={isLoading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: touched.date_of_appointment && Boolean(errors.date_of_appointment),
                        helperText: touched.date_of_appointment && errors.date_of_appointment,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Select Status"
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                    disabled={isLoading}
                  >
                    <MenuItem value="">Select Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="leave">On Leave</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* Hidden submit button - will be triggered by parent */}
            <button
              type="submit"
              style={{ display: 'none' }}
              ref={(ref) => {
                if (ref) {
                  window.staffFormSubmit = submitForm;
                }
              }}
            />
          </Form>
        )}
      </Formik>
    </LocalizationProvider>
  );
};

export default StaffForm;
