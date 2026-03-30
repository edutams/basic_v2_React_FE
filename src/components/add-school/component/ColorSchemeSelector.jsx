import React from 'react';
import { Box, Typography, Button, Grid, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ColorSchemeSelector from './ColorSchemeSelector';

const validationSchema = yup.object({
  primaryColor: yup.string().required('Primary color is required'),
});

// 🔥 Theme keyword mapping
const themeColorMap = {
  primary: '#1976d2',
  secondary: '#9c27b0',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
};

// ✅ Validate CSS color safely
const getSafeColor = (color) => {
  if (!color) return '#e0e0e0';
  const s = new Option().style;
  s.color = color;
  return s.color ? color : '#e0e0e0';
};

const ChangeColorScheme = ({ selectedAgent, onSave, onClose }) => {
  const originalColor =
    selectedAgent?.primaryColor ||
    selectedAgent?.primary_color ||
    '#1976d2';

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
          {/* Current Color */}
          <Grid item xs={hasChanged ? 6 : 12}>
            <Typography variant="subtitle2" color="textSecondary" mb={1}>
              Current Color
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 40,
                bgcolor: getSafeColor(originalColor),
                borderRadius: 1,
                border: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#fff', fontWeight: 'bold' }}
              >
                {originalColor}
              </Typography>
            </Box>
          </Grid>

          {/* New Preview */}
          {hasChanged && (
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary" mb={1}>
                New Color Preview
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  bgcolor: getSafeColor(formik.values.primaryColor),
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#fff', fontWeight: 'bold' }}
                >
                  {formik.values.primaryColor}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Selector */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" mb={2}>
              Select New Color
            </Typography>
            <ColorSchemeSelector formik={formik} />
          </Grid>
        </Grid>

        {/* Actions */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
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