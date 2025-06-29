import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

// Simple validation schema for terms
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
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
      }}
    >
      <Typography variant="h6">{actionType === 'create' ? 'Add New Term' : 'Edit Term'}</Typography>

      <TextField
        label="Term Name"
        name="termName"
        value={formik.values.termName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.termName && !!formik.errors.termName}
        helperText={formik.touched.termName && formik.errors.termName}
        fullWidth
        required
      />

      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formik.values.status}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          label="Status"
          error={formik.touched.status && !!formik.errors.status}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            name="isCurrent"
            checked={formik.values.isCurrent}
            onChange={formik.handleChange}
          />
        }
        label="Set as Current Term"
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          {actionType === 'create' ? 'Add Term' : 'Update Term'}
        </Button>
      </Box>
    </Box>
  );
};

RegisterTermForm.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update']).isRequired,
  selectedAgent: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegisterTermForm;