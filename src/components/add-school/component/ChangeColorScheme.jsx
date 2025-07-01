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

const ChangeColorScheme = ({ selectedSchool, onSave, onClose }) => {
  const formik = useFormik({
    initialValues: {
      headerColor: selectedSchool?.headerColor || '#1976d2',
      sidebarColor: selectedSchool?.sidebarColor || '#2196f3',
      bodyColor: selectedSchool?.bodyColor || '#f5f5f5',
    },
    validationSchema: colorSchemeValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  const handleSave = (values) => {
    const updatedSchool = {
      ...selectedSchool,
      headerColor: values.headerColor,
      sidebarColor: values.sidebarColor,
      bodyColor: values.bodyColor,
      colourScheme: values.bodyColor,
      lastColorSchemeUpdate: new Date().toISOString(),
    };
    onSave(updatedSchool);
    onClose();
  };

  const hasColorChanges = () => {
    const originalHeader = selectedSchool?.headerColor || '#1976d2';
    const originalSidebar = selectedSchool?.sidebarColor || '#2196f3';
    const originalBody = selectedSchool?.bodyColor || '#f5f5f5';
    return (
      formik.values.headerColor !== originalHeader ||
      formik.values.sidebarColor !== originalSidebar ||
      formik.values.bodyColor !== originalBody
    );
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Customize the color scheme for this school's dashboard interface. Changes will be applied to the header, sidebar, and body sections.
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
                        backgroundColor: selectedSchool?.headerColor || '#1976d2',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedSchool?.headerColor || '#1976d2'}
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
                        backgroundColor: selectedSchool?.sidebarColor || '#2196f3',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {selectedSchool?.sidebarColor || '#2196f3'}
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
                        backgroundColor: selectedSchool?.bodyColor || '#f5f5f5',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {selectedSchool?.bodyColor || '#f5f5f5'}
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
              </Paper>
            </Grid>
          )}
          <ColorSchemeSelector formik={formik} />
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ChangeColorScheme;
