import React from 'react';
import { 
Box,
Grid, 
TextField, 
Button, 
MenuItem,
FormControl,
InputLabel,
Select,
FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';

const CreateClassForm = ({ open, onSubmit, onCancel, initialValues = {}, actionType = 'create', entityName = "Class" }) => {
  const formik = useFormik({
    initialValues: {
      name: initialValues.name || '',
      code: initialValues.code || '',
      description: initialValues.description || '',
      status: initialValues.status || '',
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
    <Grid container spacing={2} mb={3} direction="column">
      <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
        <TextField
          label={`${entityName} Name`}
          fullWidth
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
        <TextField
          label={`${entityName} Code`}
          fullWidth
          name="code"
          value={formik.values.code}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />
      </Grid>
      {entityName === "Class" && (
        <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
          <TextField
            label="Class Order"
            fullWidth
            name="order"
            value={formik.values.order}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.order && Boolean(formik.errors.order)}
            helperText={formik.touched.order && formik.errors.order}
          />
        </Grid>
      )}
      <Grid item size={{ xs: 12, md: 12, sm: 12 }}>
        <TextField
          label="Description"
          fullWidth
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
      </Grid>
      {entityName === "Program" && (
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
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      )}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
        Cancel
      </Button>
      <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? 'Creating...' : (actionType === 'update' ? `Update ${entityName}` : `Create ${entityName}`)}
      </Button>
    </Box>
      
    </Grid>
  </form>
  );
};

export default CreateClassForm; 