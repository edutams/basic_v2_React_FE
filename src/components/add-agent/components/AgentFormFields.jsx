import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Box,
  Typography,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import ImageUpload from '../../shared/ImageUpload';
import locationApi from '../../../api/location';

const AgentFormFields = ({ formik, canSelectColor = true, canEditDomain = true }) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states = await locationApi.getStates();
        setStates(states);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs if stateFilter is prefilled (e.g., during Update)
  useEffect(() => {
    const fetchInitialLgas = async () => {
      if (formik.values.stateFilter && lgas.length === 0) {
        try {
          const initialLgas = await locationApi.getLgas(formik.values.stateFilter);
          setLgas(initialLgas);
        } catch (error) {
          console.error("Failed to fetch LGAs for prefilled state", error);
        }
      }
    };
    fetchInitialLgas();
  }, [formik.values.stateFilter]);

  const handleStateChange = async (event) => {
    const newStateId = event.target.value;
    formik.setFieldValue('stateFilter', newStateId);
    formik.setFieldValue('lga', '');
    setLgas([]);

    if (newStateId) {
      try {
        const lgas = await locationApi.getLgas(newStateId);
        setLgas(lgas);
      } catch (error) {
        console.error("Failed to fetch LGAs", error);
      }
    }
  };

  return (
    <>
      {/* Section 1: Organization Information */}
      <Grid item size={{ xs: 12 }}>
        <Typography variant="h6" fontWeight="600" color="primary" sx={{ mb: 1 }}>
          Organization Information
        </Typography>
      </Grid>

      <Grid container spacing={3} sx={{ px: 2 }}>
        {/* Organization Logo Column (3) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <ImageUpload
            label="Organization Logo"
            value={formik.values.organizationLogo}
            onChange={(val) => formik.setFieldValue('organizationLogo', val)}
            error={formik.touched.organizationLogo && Boolean(formik.errors.organizationLogo)}
            helperText={formik.touched.organizationLogo && formik.errors.organizationLogo}
          />
        </Grid>

        {/* Organization Fields Column (9) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Grid container spacing={2}>
            {/* Row 1: Name & Domain */}
            <Grid size={{ xs: 12, md: canEditDomain ? 6 : 12 }}>
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
            {canEditDomain && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  key="organizationDomain"
                  label="Organization Domain"
                  placeholder="e.g. acme.com"
                  fullWidth
                  name="organizationDomain"
                  value={formik.values.organizationDomain}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.organizationDomain && Boolean(formik.errors.organizationDomain)}
                  helperText={formik.touched.organizationDomain && formik.errors.organizationDomain}
                />
              </Grid>
            )}

            {/* Row 2: Mail & Phone */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="contactDetails"
                label="Organization Mail"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="agentPhone"
                label="Organization Phone No:"
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

            {/* Row 3: State & LGA */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
              >
                <InputLabel>State</InputLabel>
                <Select
                  name="stateFilter"
                  value={formik.values.stateFilter}
                  label="Organization State"
                  onChange={handleStateChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">-- Choose State --</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.stateFilter && formik.errors.stateFilter && (
                  <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={formik.touched.lga && Boolean(formik.errors.lga)}
                disabled={!formik.values.stateFilter || lgas.length === 0}
              >
                <InputLabel>LGA</InputLabel>
                <Select
                  name="lga"
                  value={formik.values.lga}
                  label="Organization LGA"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">-- Choose LGA --</MenuItem>
                  {lgas.map((lga) => (
                    <MenuItem key={lga.id} value={lga.id}>
                      {lga.lga_name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.lga && formik.errors.lga && (
                  <FormHelperText>{formik.errors.lga}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Row 4: Color & Address */}
            {canSelectColor && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ClickAwayListener onClickAway={() => setColorPickerOpen(false)}>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      value={formik.values.primaryColor || ''}
                      onChange={(e) => {
                        let value = e.target.value.trim();
                        const themeColorMap = {
                          primary: '#1976d2',
                          secondary: '#9c27b0',
                          success: '#2e7d32',
                          error: '#d32f2f',
                          warning: '#ed6c02',
                        };

                        if (themeColorMap[value.toLowerCase()]) {
                          formik.setFieldValue('primaryColor', themeColorMap[value.toLowerCase()]);
                          return;
                        }

                        if (/^[0-9a-fA-F]{3,6}$/.test(value)) {
                          formik.setFieldValue('primaryColor', `#${value}`);
                          return;
                        }

                        if (/^#[0-9a-fA-F]{3,6}$/.test(value)) {
                          formik.setFieldValue('primaryColor', value);
                          return;
                        }

                        formik.setFieldValue('primaryColor', value.toLowerCase());
                      }}
                      onFocus={() => setColorPickerOpen(true)}
                      placeholder="e.g. 3949AB, #3949AB, red, primary"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box
                              onClick={() => setColorPickerOpen(true)}
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '4px',
                                bgcolor: (() => {
                                  const color = formik.values.primaryColor;
                                  const s = new Option().style;
                                  s.color = color;
                                  return s.color ? color : '#e0e0e0';
                                })(),
                                border: '1px solid rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary', fontFamily: 'monospace' }}>
                              #
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ style: { fontFamily: 'monospace' } }}
                    />

                    {colorPickerOpen && (
                      <Paper
                        elevation={8}
                        sx={{
                          position: 'absolute',
                          zIndex: 1400,
                          top: 'calc(100% + 6px)',
                          left: 0,
                          borderRadius: '12px',
                          p: 1.5,
                          bgcolor: '#1e1e1e',
                          '& .react-colorful': { width: '220px', height: '200px' },
                        }}
                      >
                        <HexColorPicker
                          color={(() => {
                            const color = formik.values.primaryColor;
                            const s = new Option().style;
                            s.color = color;
                            return s.color ? color : '#3949ab';
                          })()}
                          onChange={(color) => formik.setFieldValue('primaryColor', color)}
                        />
                      </Paper>
                    )}
                  </Box>
                </ClickAwayListener>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: canSelectColor ? 6 : 12 }}>
              <TextField
                key="contactAddress"
                label="Organization Address"
                fullWidth
                name="contactAddress"
                multiline
                rows={1}
                value={formik.values.contactAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactAddress && Boolean(formik.errors.contactAddress)}
                helperText={formik.touched.contactAddress && formik.errors.contactAddress}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight="600" color="primary" sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          Admin Information
        </Typography>
      </Grid>

      <Grid container spacing={1} sx={{ px: 2 }}>
        {/* Admin Avatar Column (3) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <ImageUpload
            label="Admin Avatar"
            shape="circle"
            value={formik.values.adminAvatar}
            onChange={(val) => formik.setFieldValue('adminAvatar', val)}
            error={formik.touched.adminAvatar && Boolean(formik.errors.adminAvatar)}
            helperText={formik.touched.adminAvatar && formik.errors.adminAvatar}
          />
        </Grid>

        {/* Admin Fields Column (9) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="fname"
                label="Admin First Name"
                fullWidth
                name="fname"
                value={formik.values.fname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fname && Boolean(formik.errors.fname)}
                helperText={formik.touched.fname && formik.errors.fname}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="lname"
                label="Admin Last Name"
                fullWidth
                name="lname"
                value={formik.values.lname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lname && Boolean(formik.errors.lname)}
                helperText={formik.touched.lname && formik.errors.lname}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="mname"
                label="Admin Middle Name"
                fullWidth
                name="mname"
                value={formik.values.mname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.mname && Boolean(formik.errors.mname)}
                helperText={formik.touched.mname && formik.errors.mname}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="email"
                label="Admin Email"
                fullWidth
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                key="phone"
                label="Admin Phone"
                fullWidth
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AgentFormFields;
