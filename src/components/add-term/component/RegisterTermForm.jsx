import React from 'react';
import {
  Grid,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Validation schema for terms
const termValidationSchema = Yup.object({
  termName: Yup.string().required('Term name is required'),
  status: Yup.string().required('Status is required'),
});

// Generate incremental ID for terms
const getNextId = () => {
  const lastId = parseInt(localStorage.getItem('lastTermId')) || 0;
  const newId = lastId + 1;
  localStorage.setItem('lastTermId', newId);
  return newId;
};

const RegisterTermForm = ({ actionType, selectedAgent, onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      termName: selectedAgent?.termName || '',
      status: selectedAgent?.status || 'Active',
      isCurrent: selectedAgent?.isCurrent || false,
    },
    validationSchema: termValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedData = {
        ...values,
        id: actionType === 'update' ? selectedAgent.id : getNextId(),
        termName: values.termName || 'Unnamed Term',
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
            label="Term Name"
            name="termName"
            value={formik.values.termName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.termName && Boolean(formik.errors.termName)}
            helperText={formik.touched.termName && formik.errors.termName}
            fullWidth
            required
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControl
            fullWidth
            error={formik.touched.status && Boolean(formik.errors.status)}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              sx={{
                '& .MuiOutlinedInput-input': {
                  boxSizing: 'border-box',
                  padding: '16.5px 14px',
                },
              }}
            >
              <MenuItem value="">-- Choose --</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="isCurrent"
                checked={formik.values.isCurrent}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            }
            label="Set as Current Term"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {actionType === 'create' ? 'Add Term' : 'Update Term'}
        </Button>
      </Box>
    </form>
  );
};

RegisterTermForm.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update']).isRequired,
  selectedAgent: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegisterTermForm;