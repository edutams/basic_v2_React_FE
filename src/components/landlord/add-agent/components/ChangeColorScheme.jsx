import React from 'react';
import { Box, Typography, Button, Grid, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ColorSchemeSelector from './ColorSchemeSelector';

const validationSchema = yup.object({
  primaryColor: yup.string().required('Primary color is required'),
});

const ChangeColorScheme = ({ selectedAgent, onSave, onClose }) => {
  const originalColor =
    selectedAgent?.primaryColor || selectedAgent?.primary_color || '#1976d2';

  const formik = useFormik({
    initialValues: { primaryColor: originalColor },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave({ ...selectedAgent, primaryColor: values.primaryColor });
      onClose();
    },
  });

  const hasChanged = formik.values.primaryColor !== originalColor;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Customize the primary color for this agent's dashboard interface.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={hasChanged ? 6 : 12}>
            <Typography variant="subtitle2" color="textSecondary" mb={1}>
              Current Color
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 40,
                bgcolor: originalColor,
                borderRadius: 1,
                border: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                {originalColor}
              </Typography>
            </Box>
          </Grid>

          {hasChanged && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary" mb={1}>
                New Color Preview
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  bgcolor: formik.values.primaryColor,
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {formik.values.primaryColor}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" color="primary" mb={2}>
              Select New Color
            </Typography>
            <ColorSchemeSelector formik={formik} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            Apply Color
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ChangeColorScheme;
