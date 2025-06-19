import React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Paper,
  Divider,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
  
};

const colors = [
  '#7F8C8D',
  '#BDC3C7',
  '#1ABC9C',
  '#3498DB',
  '#F1C40F',
  '#E67E22',
  '#E74C3C',
  '#ECF0F1',
  '#9B59B6',
  '#34495E',
  '#2C3E50',
  '#95A5A6',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#D35400',
  '#C0392B',
  '#F39C12',
  '#2ECC71',
];

const ColorSelector = ({ label, value, onChange }) => (
  <Grid item xs={12} md={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        onClick={() => onChange('')}
      >
        Default
      </Button>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {colors.map((color, index) => (
          <Box
            key={index}
            onClick={() => onChange(color)}
            sx={{
              width: 24,
              height: 24,
              bgcolor: color,
              borderRadius: '50%',
              border: value === color ? '3px solid #1976d2' : '1px solid #ccc',
              cursor: 'pointer',
              mx: 'auto',
              transition: 'border 0.2s ease',
              '&:hover': {
                border: '2px solid #1976d2',
              },
            }}
          />
        ))}
      </Box>
      {value && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Selected:
          </Typography>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: value,
              borderRadius: '50%',
              border: '1px solid #ccc',
            }}
          />
          <Typography variant="caption" color="textSecondary">
            {value}
          </Typography>
        </Box>
      )}
    </Paper>
  </Grid>
);

import { useState } from 'react';

// Validation schema
const validationSchema = yup.object({
  schoolName: yup
    .string()
    .min(2, 'School name must be at least 2 characters')
    .max(100, 'School name must be less than 100 characters')
    .required('School name is required'),
    institutionShortName: yup
    .string()
    .min(2, 'Institution Short Name must be at least 2 characters')
    .max(100, 'Institution Short Name must be less than 100 characters')
    .required('Institution Short Name is required'),
    institutionAddress: yup
    .string()
    .min(10, 'Institution address must be at least 10 characters')
    .max(200, 'Institution address must be less than 200 characters')
    .required('Institution address is required'),
  agentDetails: yup
    .string()
    .min(2, 'Agent name must be at least 2 characters')
    .max(100, 'Agent name must be less than 100 characters')
    .required('Agent name is required'),
  contactDetails: yup
    .string()
    .email('Enter a valid email address')
    .required('Agent email is required'),
  agentPhone: yup
    .string()
    .matches(
      /^(\+234|234|0)?[789][01]\d{8}$/,
      'Enter a valid Nigerian phone number (e.g., +234-801-234-5678)'
    )
    .required('Agent phone is required'),
  
  stateFilter: yup
    .string()
    .required('State selection is required'),
  lga: yup
    .string()
    .min(2, 'LGA must be at least 2 characters')
    .max(50, 'LGA must be less than 50 characters')
    .required('LGA is required'),
  // level: yup
  //   .string()
  //   .required('Agent level is required'),
});

const AddSchoolModal = ({ open, onClose, handleRefresh, selectedAgent, actionType }) => {

  const [headerColor, setHeaderColor] = useState(selectedAgent?.headerColor ||'');
  const [sidebarColor, setSidebarColor] = useState(selectedAgent?.sidebarColor ||'');
  const [bodyColor, setBodyColor] = useState(selectedAgent?.bodyColor ||'');

  const initialValues = {
    organizationName: selectedAgent?.organizationName || '',
    organizationTitle: selectedAgent?.organizationTitle || '',
    agentDetails: selectedAgent?.agentDetails || '',
    contactDetails: selectedAgent?.contactDetails || '',
    agentPhone: selectedAgent?.phoneNumber || '',
    contactAddress: selectedAgent?.contactAddress || '',
    stateFilter: selectedAgent?.stateFilter || '',
    lga: selectedAgent?.lga || '',
    level: selectedAgent?.level || '',
  };

  const validationSchema = yup.object({
    institutionName: yup
      .string()
      .min(2, 'Institution name must be at least 2 characters')
      .max(100, 'Institution name must be less than 100 characters')
      .required('Institution name is required'),
    organizationTitle: yup
      .string()
      .min(2, 'Organization title must be at least 2 characters')
      .max(100, 'Organization title must be less than 100 characters')
      .required('Organization title is required'),
    agentDetails: yup
      .string()
      .min(2, 'Agent name must be at least 2 characters')
      .max(100, 'Agent name must be less than 100 characters')
      .required('Agent name is required'),
    contactDetails: yup
      .string()
      .email('Enter a valid email address')
      .required('Agent email is required'),
    agentPhone: yup
      .string()
      .matches(
        /^(\+234|234|0)?[789][01]\d{8}$/,
        'Enter a valid Nigerian phone number (e.g., +234-801-234-5678)'
      )
      .required('Agent phone is required'),
    contactAddress: yup
      .string()
      .min(10, 'Contact address must be at least 10 characters')
      .max(200, 'Contact address must be less than 200 characters')
      .required('Contact address is required'),
    stateFilter: yup
      .string()
      .required('State selection is required'),
    lga: yup
      .string()
      .min(2, 'LGA must be at least 2 characters')
      .max(50, 'LGA must be less than 50 characters')
      .required('LGA is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (actionType === 'update') {
        handleUpdate(values);
      } else {
        handleSaveClick(values);
      }
    },
  });

  const resetForm = () => {
    formik.resetForm();
    setHeaderColor('');
    setSidebarColor('');
    setBodyColor('');
  };

  const handleSaveClick = (values) => {
    const updatedData = {
      ...values,
      s_n: Date.now(), 
      phoneNumber: values.agentPhone, 
      performance: 'N/A',
      gateway: 'No Gateway',
      colourScheme: bodyColor || 'Default',
      headerColor: headerColor || 'Default',
      sidebarColor: sidebarColor || 'Default',
      status: 'Inactive',
      action: 'Edit',
    };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleUpdate = (values) => {
    // Implement update logic here
    const updatedData = {
      ...selectedAgent,
      ...values,
      phoneNumber: values.agentPhone, 
      colourScheme: bodyColor || 'Default',
      headerColor: headerColor || 'Default',
      sidebarColor: sidebarColor || 'Default',
    };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h3" mb={2}>
          {actionType === 'update' ? 'Update Agent' : 'Register School'}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} mb={3}>
            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Institution Name"
                fullWidth
                name="nstitutionName"
                value={formik.values.institutionName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.institutionName && Boolean(formik.errors.institutionName)}
                helperText={formik.touched.institutionName && formik.errors.institutionName}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Institution Short Name"
                fullWidth
                name="institutionShortName"
                value={formik.values.institutionShortName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.institutionShortName && Boolean(formik.errors.institutionShortName)}
                helperText={formik.touched.institutionShortName && formik.errors.institutionShortName}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
              <TextField
                label="Contact Address"
                fullWidth
                name="contactAddress"
                multiline
                rows={2}
                value={formik.values.contactAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactAddress && Boolean(formik.errors.contactAddress)}
                helperText={formik.touched.contactAddress && formik.errors.contactAddress}
              />
            </Grid>


            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Administrator First Name"
                fullWidth
                name="administratorFirstName"
                type="email"
                value={formik.values.administratorFirstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.administratorFirstName && Boolean(formik.errors.administratorFirstName)}
                helperText={formik.touched.administratorFirstName && formik.errors.administratorFirstName}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Administrator Last Name"
                fullWidth
                name="administratorLastName"
                type="email"
                value={formik.values.administratorLastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.administratorLastName && Boolean(formik.errors.administratorLastName)}
                helperText={formik.touched.administratorLastName && formik.errors.administratorLastName}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Administrator Email"
                fullWidth
                name="administratorEmail"
                type="email"
                value={formik.values.administratorEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.administratorEmail && Boolean(formik.errors.administratorEmail)}
                helperText={formik.touched.administratorEmail && formik.errors.administratorEmail}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <TextField
                label="Administrator Phone"
                placeholder="+234-801-234-5678"
                fullWidth
                name="administratorPhone"
                value={formik.values.administratorPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.administratorPhone && Boolean(formik.errors.administratorPhone)}
                helperText={formik.touched.administratorPhone && formik.errors.administratorPhone}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <FormControl
                fullWidth
                error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
              >
                <InputLabel>State Filter</InputLabel>
                <Select
                  name="stateFilter"
                  value={formik.values.stateFilter}
                  label="State Filter"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  <MenuItem value="lagos">Lagos</MenuItem>
                  <MenuItem value="abuja">Abuja</MenuItem>
                </Select>
                {formik.touched.stateFilter && formik.errors.stateFilter && (
                  <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
              <FormControl
                fullWidth
                error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
              >
                <InputLabel>LGA</InputLabel>
                <Select
                  name="LGA"
                  value={formik.values.lga}
                  label="LGA"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  <MenuItem value="abeokuta">Abeokuta</MenuItem>
                  <MenuItem value="ijebu-ode">Ijebu-Ode</MenuItem>
                </Select>
                {formik.touched.stateFilter && formik.errors.stateFilter && (
                  <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
              <FormControl
                fullWidth
                error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
              >
                <InputLabel>Module Type</InputLabel>
                <Select
                  name="moduleType"
                  value={formik.values.moduleType}
                  label="Module Type"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">-- Choose --</MenuItem>
                  <MenuItem value="school-manager">School Manager</MenuItem>
                  <MenuItem value="school-payment">School Payment</MenuItem>
                </Select>
                {formik.touched.moduleType && formik.errors.moduleType && (
                  <FormHelperText>{formik.errors.moduleType}</FormHelperText>
                )}
              </FormControl>
            </Grid>


           

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <ColorSelector
                  label="Choose Header Color Scheme"
                  value={headerColor}
                  onChange={(color) => setHeaderColor(color)}
                />
                <ColorSelector
                  label="Choose Sidebar Color Scheme"
                  value={sidebarColor}
                  onChange={(color) => setSidebarColor(color)}
                />
                <ColorSelector
                  label="Choose Body Color Scheme"
                  value={bodyColor}
                  onChange={(color) => setBodyColor(color)}
                />
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
  
};

export default AddSchoolModal;