import React from 'react';
import { useEffect } from 'react';

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  FormHelperText,
  Checkbox,
  ListItemText
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

const permissionOptions = [
  'Create School',
  'Edit School',
  'Delete School',
  'View Reports',
  'Manage Users',
];

const ColorSelector = ({ label, value, onChange }) => (
  <Grid item xs={12} md={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={() => onChange('')}>
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

// Validation schema
const validationSchema = yup.object({
  organizationName: yup
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .required('Organization name is required'),
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
      'Enter a valid Nigerian phone number (e.g., +234-801-234-5678)',
    )
    .required('Agent phone is required'),
  contactAddress: yup
    .string()
    .min(10, 'Contact address must be at least 10 characters')
    .max(200, 'Contact address must be less than 200 characters')
    .required('Contact address is required'),
  stateFilter: yup.string().required('State selection is required'),
  lga: yup
    .string()
    .min(2, 'LGA must be at least 2 characters')
    .max(50, 'LGA must be less than 50 characters')
    .required('LGA is required'),
  level: yup
    .string()
    .required('Agent level is required'),
});

const AddAgentModal = ({ open, onClose, handleRefresh, selectedAgent, actionType }) => {
  console.log('selectedAgent:', selectedAgent);
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
    headerColor: selectedAgent?.headerColor || '',
    sidebarColor: selectedAgent?.sidebarColor || '',
    bodyColor: selectedAgent?.bodyColor || '',
    accessLevel: selectedAgent?.accessLevel || '', 
    permissions: selectedAgent?.permissions || [],
  };
  console.log('initialValues:', initialValues);


  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
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
  };

  const handleSaveClick = (values) => {
    const updatedData = {
      ...values,
      s_n: Date.now(),
      phoneNumber: values.agentPhone,
      performance: 'School: 0',
      gateway: 'No Gateway',
      colourScheme: formik.values.bodyColor,
      headerColor: formik.values.headerColor,
      sidebarColor: formik.values.sidebarColor,
      status: 'Inactive',
      action: 'Edit',
    };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleUpdate = (values) => {
    const updatedData = {
      ...selectedAgent,
      ...values,
      phoneNumber: values.agentPhone,
      colourScheme: formik.values.bodyColor,
      headerColor: formik.values.headerColor,
      sidebarColor: formik.values.sidebarColor,
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
    <Modal open={open} onClose={handleClose} keepMounted
    disableEnforceFocus
    disableAutoFocus
  >
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {actionType === 'update'
            ? 'Update Agent'
            : actionType === 'viewSchools'
            ? 'View Schools'
            : 'Create Agent'}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {actionType === 'viewSchools' ? (
          <div>
            <Typography variant="h6" mb={2}>
              All schools in {selectedAgent?.organizationName}
            </Typography>
            {selectedAgent?.schools && selectedAgent.schools.length > 0 ? (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>School Name</TableCell>
                      <TableCell align="right">Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedAgent?.schools?.map((school) => (
                      <TableRow
                        key={school.schoolName}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {school.schoolName}
                        </TableCell>
                        <TableCell align="right">{school.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ backgroundColor: 'info.light', p: 2, borderRadius: 1 }}>
                <Typography variant="h2" sx={{ color: '#0B5886', fontWeight: 600 }}>
                  No schools registered yet
                </Typography>
              </Box>
            )}
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2} mb={3}>
              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <TextField
                  key="organizationName"
                  label="Organization Name"
                  fullWidth
                  name="organizationName"
                  value={formik.values.organizationName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.organizationName && Boolean(formik.errors.organizationName)}
                  helperText={formik.touched.organizationName && formik.errors.organizationName}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <TextField
                  key="organizationTitle"
                  label="Organization Title"
                  fullWidth
                  name="organizationTitle"
                  value={formik.values.organizationTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.organizationTitle && Boolean(formik.errors.organizationTitle)
                  }
                  helperText={formik.touched.organizationTitle && formik.errors.organizationTitle}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <TextField
                  key="agentDetails"
                  label="Agent Name"
                  fullWidth
                  name="agentDetails"
                  value={formik.values.agentDetails}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.agentDetails && Boolean(formik.errors.agentDetails)}
                  helperText={formik.touched.agentDetails && formik.errors.agentDetails}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <TextField
                  key="contactDetails"
                  label="Agent Email"
                  fullWidth
                  name="contactDetails"
                  type="email"
                  value={formik.values.contactDetails}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contactDetails && Boolean(formik.errors.contactDetails)}
                  helperText={formik.touched.contactDetails && formik.errors.contactDetails}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <TextField
                  key="agentPhone"
                  label="Agent Phone"
                  placeholder="+234-801-234-5678"
                  fullWidth
                  name="agentPhone"
                  value={formik.values.agentPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.agentPhone && Boolean(formik.errors.agentPhone)}
                  helperText={formik.touched.agentPhone && formik.errors.agentPhone}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
                <TextField
                  key="contactAddress"
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

              <Grid item xs={12} sm={3} md={6}>
                <TextField
                  key="lga"
                  label="LGA"
                  fullWidth
                  name="lga"
                  value={formik.values.lga}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lga && Boolean(formik.errors.lga)}
                  helperText={formik.touched.lga && formik.errors.lga}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
                <FormControl
                  fullWidth
                  error={formik.touched.level && Boolean(formik.errors.level)}
                >
                  <InputLabel>Agent Level</InputLabel>
                  <Select
                    name="level"
                    value={formik.values.level}
                    label="Agent Level"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">-- Choose --</MenuItem>
                    <MenuItem value="Level 1">Level 1</MenuItem>
                    <MenuItem value="Level 2">Level 2</MenuItem>
                    <MenuItem value="Level 3">Level 3</MenuItem>
                  </Select>
                  {formik.touched.level && formik.errors.level && (
                    <FormHelperText>{formik.errors.level}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <ColorSelector
                    label="Choose Header Color Scheme"
                    value={formik.values.headerColor}
                    onChange={(color) => formik.setFieldValue('headerColor', color)}
                  />
                  <ColorSelector
                    label="Choose Sidebar Color Scheme"
                    value={formik.values.sidebarColor}
                    onChange={(color) => formik.setFieldValue('sidebarColor', color)}
                  />
                  <ColorSelector
                    label="Choose Body Color Scheme"
                    value={formik.values.bodyColor}
                    onChange={(color) => formik.setFieldValue('bodyColor', color)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleClose} sx={{ mr: 1 }} color="inherit">
                Cancel
              </Button>
              {actionType !== 'viewSchools' && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formik.isValid || formik.isSubmitting}
                >
                  Save
                </Button>
              )}
            </Box>
          </form>
        )}
      </Box>

      {/* Permissions Field */}
      {/* <Grid item xs={12}>
        <FormControl
          fullWidth
          error={formik.touched.permissions && Boolean(formik.errors.permissions)}
        >
          <InputLabel>Permissions</InputLabel>
          <Select
            multiple
            name="permissions"
            value={formik.values.permissions}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            renderValue={(selected) => selected.join(', ')}
          >
            {permissionOptions.map((perm) => (
              <MenuItem key={perm} value={perm}>
                <Box display="flex" alignItems="center" gap={1}>
                  <input type="checkbox" checked={formik.values.permissions.includes(perm)} readOnly />
                  <MenuItem key={perm} value={perm}>
                    <Checkbox checked={formik.values.permissions?.includes(perm) || false} />
                    <ListItemText primary={perm} />
                  </MenuItem>

                  {perm}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {formik.touched.permissions && formik.errors.permissions && (
            <FormHelperText>{formik.errors.permissions}</FormHelperText>
          )}
        </FormControl>
      </Grid> */}
    </Modal>
  );
};

export default AddAgentModal;
