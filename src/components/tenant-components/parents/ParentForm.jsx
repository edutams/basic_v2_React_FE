import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import { parentValidationSchema } from './validation/parentValidationSchema';
import PropTypes from 'prop-types';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  gender: '',
  occupation: '',
  relationship: '',
  address: '',
};

const ParentForm = ({
  open,
  onClose,
  initialValues = EMPTY_FORM,
  onSave,
  isEdit = false,
  isLoading = false,
}) => {
  const formik = useFormik({
    initialValues: {
      ...EMPTY_FORM,
      ...initialValues,
    },
    validationSchema: parentValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Parent / Guardian' : 'Add Parent / Guardian'}</DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 0.5 }}>
          <Grid container spacing={2}>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First Name"
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                required
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last Name"
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                required
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Middle Name"
                name="middle_name"
                value={formik.values.middle_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
                helperText={formik.touched.middle_name && formik.errors.middle_name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                required
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                error={formik.touched.relationship && Boolean(formik.errors.relationship)}
              >
                <InputLabel>Relationship</InputLabel>
                <Select
                  name="relationship"
                  value={formik.values.relationship}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Relationship"
                >
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Occupation"
                name="occupation"
                value={formik.values.occupation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={formik.touched.occupation && Boolean(formik.errors.occupation)}
                helperText={formik.touched.occupation && formik.errors.occupation}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                multiline
                rows={2}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={formik.handleSubmit}
          disabled={isLoading || !formik.isValid}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Parent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ParentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default ParentForm;
