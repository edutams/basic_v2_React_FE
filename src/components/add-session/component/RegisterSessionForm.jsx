import React from 'react';
import { Grid, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const sessionValidationSchema = Yup.object({
  sessionName: Yup.string().required('Session name is required'),
  status: Yup.string().required('Status is required'),
  isCurrent: Yup.boolean().nullable(),
});

const getNextId = () => {
  const lastId = parseInt(localStorage.getItem('lastSessionId')) || 0;
  const newId = lastId + 1;
  localStorage.setItem('lastSessionId', newId);
  return newId;
};

const RegisterSessionForm = ({ actionType, selectedAgent, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      sessionName: selectedAgent?.sessionName || '',
      status: selectedAgent?.status || '',
      isCurrent: selectedAgent?.isCurrent || '',
    },
    validationSchema: sessionValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedData = {
        ...values,
        id: actionType === 'update' ? selectedAgent.id : getNextId(),
        sessionName: values.sessionName || 'Unnamed Session',
        status: values.status || 'Pending',
        isCurrent: values.isCurrent ?? false,
      };
      onSubmit(updatedData);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} mb={3} direction="column">
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <TextField
            label="Session Name"
            fullWidth
            name="sessionName"
            value={formik.values.sessionName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sessionName && Boolean(formik.errors.sessionName)}
            helperText={formik.touched.sessionName && formik.errors.sessionName}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
             
            >
              <MenuItem value="">-- Choose --</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControl fullWidth error={formik.touched.isCurrent && Boolean(formik.errors.isCurrent)}>
            <InputLabel>Is Current</InputLabel>
            <Select
              name="isCurrent"
              value={formik.values.isCurrent}
              label="Is Current"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
            {formik.touched.isCurrent && formik.errors.isCurrent && (
              <FormHelperText>{formik.errors.isCurrent}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        {actionType !== 'view' && (
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {actionType === 'update' ? 'Update Session' : 'Save'}
          </Button>
        )}
      </Box>
    </form>
  );
};

RegisterSessionForm.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update', 'view']).isRequired,
  selectedAgent: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegisterSessionForm;