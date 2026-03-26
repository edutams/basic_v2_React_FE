import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Typography,
} from '@mui/material';
import ColorSchemeSelector from './ColorSchemeSelector';
import PropTypes from 'prop-types';
import {
  createSchool,
  updateSchool,
  getAllStates,
  getLgasByState,
  getSchoolCategories,
  getSchoolDivisions,
} from '../../../context/AgentContext/services/school.service';
import useNotification from '../../../hooks/useNotification';

const RegisterSchoolForm = ({ actionType, selectedSchool = null, onSubmit, onCancel }) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const [formData, setFormData] = useState({
    tenant_name: selectedSchool?.tenant_name || '',
    tenant_email: selectedSchool?.tenant_email || '',
    tenant_short_name: selectedSchool?.tenant_short_name || '',
    session_term: selectedSchool?.session_term || '',
    owner_fname: selectedSchool?.owner_fname || '',
    owner_lname: selectedSchool?.owner_lname || '',
    owner_email: selectedSchool?.owner_email || '',
    owner_phone: selectedSchool?.owner_phone || '',
    admin_fname: selectedSchool?.admin_fname || '',
    admin_lname: selectedSchool?.admin_lname || '',
    admin_email: selectedSchool?.admin_email || '',
    admin_phone: selectedSchool?.admin_phone || '',
    address: selectedSchool?.address || '',
    state_id: selectedSchool?.state_lga?.state_id || '',
    lga_id: selectedSchool?.lga_id || '',
    school_divisions:
      selectedSchool?.school_divisions?.map((d) => d.id) || selectedSchool?.school_divisions || [],
    headcolor: selectedSchool?.color?.headcolor || 'bg-night-sky text-lighter',
    sidecolor: selectedSchool?.color?.sidecolor || 'bg-dark text-lighter',
    bodycolor: selectedSchool?.color?.bodycolor || 'null',
  });

  const [errors, setErrors] = useState({});

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await getAllStates();
        setStates(data || []);
      } catch (err) {
        notify.error('Failed to load states');
      }
    };
    fetchStates();
  }, []);

  // Fetch categories and divisions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, divs] = await Promise.all([getSchoolCategories(), getSchoolDivisions()]);
        setCategories(cats || []);
        setAvailableDivisions(divs || []);
      } catch (err) {
        notify.error('Failed to load school categorization metadata');
      }
    };
    fetchMetadata();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    if (formData.state_id) {
      const fetchLgas = async () => {
        try {
          const data = await getLgasByState(formData.state_id);
          setLgas(data || []);
        } catch (err) {
          notify.error(err.error || 'Failed to load LGAs');
        }
      };
      fetchLgas();
    } else {
      setLgas([]);
      setFormData((prev) => ({ ...prev, lga_id: '' }));
    }
  }, [formData.state_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleColorChange = (colorType, value) => {
    setFormData({ ...formData, [colorType]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenant_name.trim()) {
      newErrors.tenant_name = 'Institution name is required';
    }

    if (!formData.tenant_short_name.trim()) {
      newErrors.tenant_short_name = 'Institution short name is required';
    }

    if (!formData.admin_fname.trim()) {
      newErrors.admin_fname = 'Administrator first name is required';
    }

    if (!formData.admin_lname.trim()) {
      newErrors.admin_lname = 'Administrator last name is required';
    }

    if (!formData.admin_email.trim()) {
      newErrors.admin_email = 'Administrator email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Invalid email format';
    }

    if (!formData.admin_phone.trim()) {
      newErrors.admin_phone = 'Administrator phone is required';
    }

    if (!formData.tenant_email.trim()) {
      newErrors.tenant_email = 'Institution email is required';
    }

    if (!formData.owner_fname.trim()) {
      newErrors.owner_fname = 'Owner first name is required';
    }

    if (!formData.owner_lname.trim()) {
      newErrors.owner_lname = 'Owner last name is required';
    }

    if (!formData.owner_email.trim()) {
      newErrors.owner_email = 'Owner email is required';
    }

    if (!formData.owner_phone.trim()) {
      newErrors.owner_phone = 'Owner phone is required';
    }

    if (!formData.session_term) {
      newErrors.session_term = 'Session term is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Institution address is required';
    }

    if (!formData.state_id) {
      newErrors.state_id = 'State is required';
    }

    if (!formData.lga_id) {
      newErrors.lga_id = 'LGA is required';
    }

    // Not currently in the form
    // if (!formData.payModuleType) {
    //   newErrors.payModuleType = 'Module type is required';
    // }

    if (!formData.school_divisions || formData.school_divisions.length === 0) {
      newErrors.school_divisions = 'At least one school division is required';
    }

    // Field is commented out in UI
    // if (formData.school_divisions.length === 0) {
    //   newErrors.school_divisions = 'At least one school division is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notify.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
      };

      let res;
      if (actionType === 'update') {
        const { school_categories, ...updatePayload } = payload;
        res = await updateSchool(selectedSchool.id, updatePayload);
      } else {
        const { headcolor, sidecolor, bodycolor, school_categories, ...createPayload } = payload;
        res = await createSchool(createPayload);
      }

      notify.success(res.message || 'School processed successfully');
      onSubmit(res.tenant || res.data || res);

      // Reset form
      setFormData({
        tenant_name: '',
        tenant_email: '',
        tenant_short_name: '',
        session_term: '',
        owner_fname: '',
        owner_lname: '',
        owner_email: '',
        owner_phone: '',
        admin_fname: '',
        admin_lname: '',
        admin_email: '',
        admin_phone: '',
        address: '',
        state_id: '',
        lga_id: '',
        payModuleType: '',
        school_divisions: [],
        headcolor: 'bg-night-sky text-lighter',
        sidecolor: 'bg-dark text-lighter',
        bodycolor: 'null',
      });
      setErrors({});
    } catch (err) {
      console.error('Registration error:', err);
      if (err.errors) {
        setErrors(err.errors);
        notify.error(err.message || 'Validation error occurred');
      } else {
        notify.error(err.error || err.message || 'Failed to register school');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {loading && actionType !== 'update' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Initialzation Processing</AlertTitle>
          Please wait while the initialization setup is processing. This may take up to{' '}
          <strong>1 minute</strong>.
        </Alert>
      )}
      <Grid container spacing={2}>
        {/* Row 1: School Name & School Mail */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="School Name"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_name)}
            helperText={errors.tenant_name?.[0] || errors.tenant_name}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="School Mail"
            name="tenant_email"
            value={formData.tenant_email}
            onChange={handleChange}
            error={Boolean(errors.tenant_email)}
            helperText={errors.tenant_email?.[0] || errors.tenant_email}
          />
        </Grid>

        {/* Row 2: Session Term & School Division */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.session_term)}>
            <InputLabel>Session Term</InputLabel>
            <Select
              name="session_term"
              value={formData.session_term}
              label="Session Term"
              onChange={handleChange}
            >
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="First Term">First Term</MenuItem>
              <MenuItem value="Second Term">Second Term</MenuItem>
              <MenuItem value="Third Term">Third Term</MenuItem>
            </Select>
            {errors.session_term && <FormHelperText>{errors.session_term}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.school_divisions)}>
            <InputLabel>School Division</InputLabel>
            <Select
              name="school_divisions"
              multiple
              value={formData.school_divisions}
              label="School Division"
              onChange={handleChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={availableDivisions.find((d) => d.id === value)?.name}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {availableDivisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>
                  {div.name}
                </MenuItem>
              ))}
            </Select>
            {errors.school_divisions && <FormHelperText>{errors.school_divisions}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Row 3: State & LGA */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.state_id)}>
            <InputLabel>State</InputLabel>
            <Select name="state_id" value={formData.state_id} label="State" onChange={handleChange}>
              <MenuItem value="">-- Select State --</MenuItem>
              {states.map((state) => (
                <MenuItem key={state.id} value={state.id}>
                  {state.stname}
                </MenuItem>
              ))}
            </Select>
            {errors.state_id && <FormHelperText>{errors.state_id}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.lga_id)}>
            <InputLabel>LGA</InputLabel>
            <Select name="lga_id" value={formData.lga_id} label="LGA" onChange={handleChange}>
              <MenuItem value="">-- Select LGA --</MenuItem>
              {lgas.map((lga) => (
                <MenuItem key={lga.id} value={lga.id}>
                  {lga.lganame}
                </MenuItem>
              ))}
            </Select>
            {errors.lga_id && <FormHelperText>{errors.lga_id}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Row 4: School Address & Short Name */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="School Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
            error={Boolean(errors.address)}
            helperText={errors.address?.[0] || errors.address}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Short Name"
            name="tenant_short_name"
            value={formData.tenant_short_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_short_name)}
            helperText={errors.tenant_short_name?.[0] || errors.tenant_short_name}
          />
        </Grid>

        {/* School Divisions (Preserved field) */}
        {/* <Grid item size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.school_divisions)}>
            <InputLabel>School Divisions</InputLabel>
            <Select
              name="school_divisions"
              multiple
              value={formData.school_divisions}
              label="School Divisions"
              onChange={handleChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={availableDivisions.find(d => d.id === value)?.name} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableDivisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>
                  {div.name}
                </MenuItem>
              ))}
            </Select>
            {errors.school_divisions && <FormHelperText>{errors.school_divisions}</FormHelperText>}
          </FormControl>
        </Grid> */}

        {/* School Owner Details Section */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: '#F1F8E9', borderRadius: '4px', border: '1px solid #DCEDC8' }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: '#33691E' }}>
              School Owner Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="owner_fname"
                  value={formData.owner_fname}
                  onChange={handleChange}
                  error={Boolean(errors.owner_fname)}
                  helperText={errors.owner_fname?.[0] || errors.owner_fname}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="last name"
                  name="owner_lname"
                  value={formData.owner_lname}
                  onChange={handleChange}
                  error={Boolean(errors.owner_lname)}
                  helperText={errors.owner_lname?.[0] || errors.owner_lname}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone no"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  error={Boolean(errors.owner_phone)}
                  helperText={errors.owner_phone?.[0] || errors.owner_phone}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Name mail"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  error={Boolean(errors.owner_email)}
                  helperText={errors.owner_email?.[0] || errors.owner_email}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* School Admin Owner Details Section */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: '4px', border: '1px solid #E0E0E0' }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>
              School Admin Owner Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Admin First Name"
                  name="admin_fname"
                  value={formData.admin_fname}
                  onChange={handleChange}
                  error={Boolean(errors.admin_fname)}
                  helperText={errors.admin_fname?.[0] || errors.admin_fname}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Admin last name"
                  name="admin_lname"
                  value={formData.admin_lname}
                  onChange={handleChange}
                  error={Boolean(errors.admin_lname)}
                  helperText={errors.admin_lname?.[0] || errors.admin_lname}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Admin Phone no"
                  name="admin_phone"
                  value={formData.admin_phone}
                  onChange={handleChange}
                  error={Boolean(errors.admin_phone)}
                  helperText={errors.admin_phone?.[0] || errors.admin_phone}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Admin Name mail"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleChange}
                  error={Boolean(errors.admin_email)}
                  helperText={errors.admin_email?.[0] || errors.admin_email}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Color Scheme */}
        {actionType === 'update' && (
          <Grid item xs={12}>
            <ColorSchemeSelector formData={formData} onColorChange={handleColorChange} />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading
            ? 'Processing...'
            : actionType === 'update'
            ? 'Update School'
            : 'Register School'}
        </Button>
      </Box>
    </Box>
  );
};

RegisterSchoolForm.propTypes = {
  actionType: PropTypes.oneOf(['create', 'update']).isRequired,
  selectedSchool: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RegisterSchoolForm;
