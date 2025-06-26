import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ColorSchemeSelector from './ColorSchemeSelector';

const colorSchemeValidationSchema = yup.object({
  headerColor: yup.string().required('Header color is required'),
  sidebarColor: yup.string().required('Sidebar color is required'),
  bodyColor: yup.string().required('Body color is required'),
});

const ChangeColorScheme = ({ selectedAgent, onSave, onClose }) => {
  const formik = useFormik({
    initialValues: {
      headerColor: selectedAgent?.headerColor || '#1976d2',
      sidebarColor: selectedAgent?.sidebarColor || '#2196f3',
      bodyColor: selectedAgent?.bodyColor || '#f5f5f5',
    },
    validationSchema: colorSchemeValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  const handleSave = (values) => {
    const updatedAgent = {
      ...selectedAgent,
      headerColor: values.headerColor,
      sidebarColor: values.sidebarColor,
      bodyColor: values.bodyColor,
      colourScheme: values.bodyColor,
      lastColorSchemeUpdate: new Date().toISOString(),
    };

    onSave(updatedAgent);
    onClose();
  };

  const hasColorChanges = () => {
    const originalHeader = selectedAgent?.headerColor || '#1976d2';
    const originalSidebar = selectedAgent?.sidebarColor || '#2196f3';
    const originalBody = selectedAgent?.bodyColor || '#f5f5f5';

    return (
      formik.values.headerColor !== originalHeader ||
      formik.values.sidebarColor !== originalSidebar ||
      formik.values.bodyColor !== originalBody
    );
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Customize the color scheme for this agent's dashboard interface. Changes will be applied to their header, sidebar, and body sections.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={hasColorChanges() ? 6 : 12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" color="primary" mb={2}>
                Current Color Scheme
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Header Color
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: selectedAgent?.headerColor || '#1976d2',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedAgent?.headerColor || '#1976d2'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Sidebar Color
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: selectedAgent?.sidebarColor || '#2196f3',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedAgent?.sidebarColor || '#2196f3'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Body Color
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        backgroundColor: selectedAgent?.bodyColor || '#f5f5f5',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {selectedAgent?.bodyColor || '#f5f5f5'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {hasColorChanges() && (
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.light' }}>
                <Typography variant="h6" color="success.dark" mb={2}>
                  New Color Preview
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        Header Preview
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 40,
                          backgroundColor: formik.values.headerColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {formik.values.headerColor}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        Sidebar Preview
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 40,
                          backgroundColor: formik.values.sidebarColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {formik.values.sidebarColor}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        Body Preview
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 40,
                          backgroundColor: formik.values.bodyColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {formik.values.bodyColor}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* <Typography variant="caption" color="success.dark" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
                  ✓ Preview updates in real-time
                </Typography> */}
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}  variant="outlined">
         
              <Typography variant="h6" color="primary" mb={2}>
                Select New Color Scheme
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
            Apply Color Scheme
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ChangeColorScheme;
