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
import locationApi from '../../../api/location';

const AgentFormFields = ({ formik, canSelectColor = true }) => {
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
      {/* Row 1: Name & Mail */}
      <Grid item size={{ xs: 12, md: 6 }}>
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
      <Grid item size={{ xs: 12, md: 6 }}>
        <TextField
          key="contactDetails"
          label="Mail"
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

      {/* Row 2: Phone No & Country */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <TextField
          key="agentPhone"
          label="Phone No:"
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
      {/* <Grid item size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth error={formik.touched.country && Boolean(formik.errors.country)}>
          <InputLabel>Country</InputLabel>
          <Select
            name="country"
            value={formik.values.country}
            label="Country"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="Nigeria">Nigeria</MenuItem>
            <MenuItem value="Ghana">Ghana</MenuItem>
            <MenuItem value="Kenya">Kenya</MenuItem>
          </Select>
          {formik.touched.country && formik.errors.country && (
            <FormHelperText>{formik.errors.country}</FormHelperText>
          )}
        </FormControl>
      </Grid> */}

      {/* Row 3: State & LGA */}
      <Grid item size={{ xs: 12, md: 6 }}>
        <FormControl
          fullWidth
          error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
        >
          <InputLabel>State</InputLabel>
          <Select
            name="stateFilter"
            value={formik.values.stateFilter}
            label="State"
            onChange={handleStateChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose State --</MenuItem>
            {states.map((state) => (
              <MenuItem key={state.id} value={state.id}>
                {state.stname}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.stateFilter && formik.errors.stateFilter && (
            <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <FormControl
          fullWidth
          error={formik.touched.lga && Boolean(formik.errors.lga)}
          disabled={!formik.values.stateFilter || lgas.length === 0}
        >
          <InputLabel>LGA</InputLabel>
          <Select
            name="lga"
            value={formik.values.lga}
            label="LGA"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose LGA --</MenuItem>
            {lgas.map((lga) => (
              <MenuItem key={lga.id} value={lga.id}>
                {lga.lganame}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.lga && formik.errors.lga && (
            <FormHelperText>{formik.errors.lga}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* Primary Color — same row as LGA */}
      {canSelectColor && (
      <Grid item size={{ xs: 12, md: 6 }}>
        <ClickAwayListener onClickAway={() => setColorPickerOpen(false)}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Primary Color"
              value={(() => {
                const v = formik.values.headerColor || '';
                return v.startsWith('#') ? v.slice(1).toUpperCase() : v.toUpperCase();
              })()}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                const color = raw ? `#${raw}` : '';
                formik.setFieldValue('headerColor', color);
                formik.setFieldValue('sidebarColor', color);
                formik.setFieldValue('bodyColor', color);
              }}
              onFocus={() => setColorPickerOpen(true)}
              placeholder="e.g. 3949AB"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      onClick={() => setColorPickerOpen(true)}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '4px',
                        bgcolor: (formik.values.headerColor || '').length >= 4 ? formik.values.headerColor : '#e0e0e0',
                        border: '1px solid rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary', fontFamily: 'monospace' }}>#</Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />

            {colorPickerOpen && (
              <Paper elevation={8} sx={{
                position: 'absolute',
                zIndex: 1400,
                top: 'calc(100% + 6px)',
                left: 0,
                borderRadius: '12px',
                p: 1.5,
                bgcolor: '#1e1e1e',
                '& .react-colorful': { width: '220px', height: '200px' },
                '& .react-colorful__saturation': { borderRadius: '8px 8px 0 0' },
                '& .react-colorful__hue': { height: '14px', borderRadius: '8px', mt: '10px' },
                '& .react-colorful__pointer': { width: '20px', height: '20px', borderWidth: '3px' },
              }}>
                <HexColorPicker
                  color={(formik.values.headerColor || '').length >= 4 ? formik.values.headerColor : '#3949ab'}
                  onChange={(color) => {
                    formik.setFieldValue('headerColor', color);
                    formik.setFieldValue('sidebarColor', color);
                    formik.setFieldValue('bodyColor', color);
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6 }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>Hex</Typography>
                  </Box>
                  <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6, flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>
                      {(formik.values.headerColor || '').replace('#', '').toUpperCase() || '------'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
      </Grid>
      )}

      {/* Row 4: Organization Name & Organization Title */}
      {/* <Grid item size={{ xs: 12, md: 6 }}>
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
      </Grid> */}
      {/* <Grid item size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth error={formik.touched.organizationTitle && Boolean(formik.errors.organizationTitle)}>
          <InputLabel>Organization Title</InputLabel>
          <Select
            name="organizationTitle"
            value={formik.values.organizationTitle}
            label="Organization Title"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="CEO">CEO</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
          </Select>
          {formik.touched.organizationTitle && formik.errors.organizationTitle && (
            <FormHelperText>{formik.errors.organizationTitle}</FormHelperText>
          )}
        </FormControl>
      </Grid> */}

      <Grid item size={{ xs: 12 }}>
        <TextField
          key="contactAddress"
          label="Contact Address"
          fullWidth
          name="contactAddress"
          multiline
          rows={3}
          value={formik.values.contactAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.contactAddress && Boolean(formik.errors.contactAddress)}
          helperText={formik.touched.contactAddress && formik.errors.contactAddress}
        />
      </Grid>
    </>
  );
};

export default AgentFormFields;
