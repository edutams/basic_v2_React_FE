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

// Validation schema for color scheme
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
      colourScheme: values.bodyColor, // For backward compatibility
      lastColorSchemeUpdate: new Date().toISOString(),
    };
    
    onSave(updatedAgent);
    onClose();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Customize the color scheme for this agent's dashboard interface. Changes will be applied to their header, sidebar, and body sections.
      </Alert>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Current Color Scheme Display */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" color="primary" mb={2}>
                Current Color Scheme
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
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
                
                <Grid item xs={4}>
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
                
                <Grid item xs={4}>
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

          {/* Color Scheme Selector */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" color="primary" mb={2}>
                Select New Color Scheme
              </Typography>
              
              <ColorSchemeSelector formik={formik} />
            </Paper>
          </Grid>

          {/* Color Preview */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'info.light' }}>
              <Typography variant="h6" color="info.dark" mb={2}>
                Color Scheme Preview
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Header Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 50,
                        backgroundColor: formik.values.headerColor,
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Header
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Sidebar Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 50,
                        backgroundColor: formik.values.sidebarColor,
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Sidebar
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Body Preview
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 50,
                        backgroundColor: formik.values.bodyColor,
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Body
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                Preview updates in real-time as you select colors
              </Typography>
            </Paper>
          </Grid>

          {/* Color Scheme Summary */}
          {/* <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'success.light' }}>
              <Typography variant="h6" color="success.dark" mb={2}>
                Color Scheme Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Header Color:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formik.values.headerColor}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Sidebar Color:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formik.values.sidebarColor}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Body Color:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formik.values.bodyColor}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid> */}
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
