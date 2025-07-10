import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import { updateModuleValidationSchema } from './validation/moduleValidationSchema';

const infoBoxStyle = {
  bgcolor: '#e6f4ff',
  color: '#333',
  borderRadius: 1,
  p: 2,
  mb: 3,
  fontSize: '0.875rem',
};

const EditModule = ({ selectedModule, onSave, onClose }) => {

  const formik = useFormik({
    initialValues: {
      mod_name: selectedModule?.mod_name || '',
      mod_description: selectedModule?.mod_description || '',
      mod_links: selectedModule?.mod_links || '',
      mod_status: selectedModule?.mod_status || 'active',
    },
    validationSchema: updateModuleValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedModule = {
        ...selectedModule,
        ...values,
        lastUpdated: new Date().toISOString(),
      };
      onSave(updatedModule);
      onClose();
    },
  });

  return (
    <Box>
      {/* { <Box sx={infoBoxStyle}>
        Update the module information below. Changes will be applied immediately after saving.
        Make sure the module link follows the correct route format (e.g., /module-name).
      </Box> } */}

      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, sm: 12 }}>
          <TextField
            label="Module Name"
            name="mod_name"
            value={formik.values.mod_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            variant="outlined"
            error={formik.touched.mod_name && Boolean(formik.errors.mod_name)}
            helperText={formik.touched.mod_name && formik.errors.mod_name}
          />
        </Grid>

        <Grid  item size={{ xs: 12, sm: 12 }}>
          <TextField
            label="Module Link/Route"
            name="mod_links"
            value={formik.values.mod_links}
            fullWidth
            variant="outlined"
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{
              '& .MuiInputBase-input': {
                backgroundColor: 'grey.100',
                cursor: 'not-allowed',
              },
            }}
            // helperText="Module link cannot be changed"
          />
        </Grid>

        <Grid  item size={{ xs: 12, sm: 12 }}>
          <TextField
            label="Module Description"
            name="mod_description"
            value={formik.values.mod_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={1}
            variant="outlined"
            error={formik.touched.mod_description && Boolean(formik.errors.mod_description)}
            helperText={formik.touched.mod_description && formik.errors.mod_description}
          />
        </Grid>

        <Grid  item size={{ xs: 12, sm: 12 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="mod_status"
              value={formik.values.mod_status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Status"
              error={formik.touched.mod_status && Boolean(formik.errors.mod_status)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Update Module
        </Button>
      </Box>
    </Box>
  );
};

export default EditModule;
