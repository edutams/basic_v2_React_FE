import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';

const GatewayForm = ({
  initialValues = {
    gateway_name: '',
    gateway_status: 'active',
  },
  onSubmit,
  onCancel,
  submitText = 'Register',
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Grid container direction="column" spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Gateway Name"
            name="gateway_name"
            value={formik.values.gateway_name || ''}
            onChange={formik.handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <Select
              name="gateway_status"
              value={formik.values.gateway_status || ''}
              onChange={formik.handleChange}
              displayEmpty
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button sx={{ mr: 1 }} color="inherit" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.values.gateway_name}
            >
              {isLoading ? 'Saving...' : submitText}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

GatewayForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default GatewayForm;
