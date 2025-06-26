import React from 'react';
import { Grid, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const RegisterSessionForm = ({ formik, onCancel, actionType }) => {
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} mb={3}>
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            label="Session Name"
            fullWidth
            name="sessionName"
            value={formik.values.sessionName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            // Removed error and helperText props since no validation for sessions
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
            {/* Removed FormHelperText since no validation for sessions */}
          </FormControl>
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Is Current</InputLabel>
            <Select
              name="isCurrent"
              value={formik.values.isCurrent}
              label="Is Current"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              sx={{
                '& .MuiOutlinedInput-input': {
                  boxSizing: 'border-box',
                  padding: '16.5px 14px',
                },
              }}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
            {/* Removed FormHelperText since no validation for sessions */}
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
            disabled={formik.isSubmitting} // Removed !formik.isValid since no validation for sessions
          >
            {actionType === 'update' ? 'Update Session' : 'Save'}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default RegisterSessionForm;