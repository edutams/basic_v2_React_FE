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
} from '@mui/material';
import ColorSchemeSelector from './ColorSchemeSelector';
import PropTypes from 'prop-types';
import {
  createSchool,
  updateSchool,
  getAllStates,
  getLgasByState,
} from '../../../context/AgentContext/services/school.service';
import useNotification from '../../../hooks/useNotification';

const RegisterSchoolForm = ({ actionType, selectedSchool = null, onSubmit, onCancel }) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const [formData, setFormData] = useState({
    tenant_name: selectedSchool?.tenant_name || '',
    tenant_short_name: selectedSchool?.tenant_short_name || '',
    admin_fname: selectedSchool?.admin_fname || '',
    admin_lname: selectedSchool?.admin_lname || '',
    admin_email: selectedSchool?.admin_email || '',
    admin_phone: selectedSchool?.admin_phone || '',
    address: selectedSchool?.address || '',
    state_id: selectedSchool?.state_id || '',
    lga_id: selectedSchool?.lga_id || '',
    social_link: selectedSchool?.social_link || '',
    payModuleType: selectedSchool?.payModuleType || '',
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
    if (!formData.address.trim()) {
      newErrors.address = 'Institution address is required';
    }
    if (!formData.state_id) {
      newErrors.state_id = 'State is required';
    }
    if (!formData.lga_id) {
      newErrors.lga_id = 'LGA is required';
    }
    if (!formData.payModuleType) {
      newErrors.payModuleType = 'Module type is required';
    }

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
        res = await updateSchool(selectedSchool.id, payload);
      } else {
        delete payload.headcolor;
        delete payload.sidecolor;
        delete payload.bodycolor;
        res = await createSchool(payload);
      }

      notify.success(res.message || 'School processed successfully');
      onSubmit(res.tenant || res.data || res);

      // Reset form
      setFormData({
        tenant_name: '',
        tenant_short_name: '',
        admin_fname: '',
        admin_lname: '',
        admin_email: '',
        admin_phone: '',
        address: '',
        state_id: '',
        lga_id: '',
        social_link: '',
        payModuleType: '',
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
          Please wait while the initialization setup is processing. This may take up to <strong>1 minute</strong>.
        </Alert>
      )}
      <Grid container spacing={2}>
        {/* Institution Details */}
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Institution Name"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_name)}
            helperText={errors.tenant_name?.[0] || errors.tenant_name}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Institution Short Name"
            name="tenant_short_name"
            value={formData.tenant_short_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_short_name)}
            helperText={errors.tenant_short_name?.[0] || errors.tenant_short_name}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Institution Address"
            name="address"
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            error={Boolean(errors.address)}
            helperText={errors.address?.[0] || errors.address}
          />
        </Grid>

        {/* Admin Details */}
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Administrator First Name"
            name="admin_fname"
            value={formData.admin_fname}
            onChange={handleChange}
            error={Boolean(errors.admin_fname)}
            helperText={errors.admin_fname?.[0] || errors.admin_fname}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Administrator Last Name"
            name="admin_lname"
            value={formData.admin_lname}
            onChange={handleChange}
            error={Boolean(errors.admin_lname)}
            helperText={errors.admin_lname?.[0] || errors.admin_lname}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Administrator Email"
            name="admin_email"
            type="email"
            value={formData.admin_email}
            onChange={handleChange}
            error={Boolean(errors.admin_email)}
            helperText={errors.admin_email?.[0] || errors.admin_email}
          />
        </Grid>

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <TextField
            fullWidth
            label="Administrator Phone"
            name="admin_phone"
            value={formData.admin_phone}
            onChange={handleChange}
            error={Boolean(errors.admin_phone)}
            helperText={errors.admin_phone?.[0] || errors.admin_phone}
          />
        </Grid>

        {/* Location */}
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
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

        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
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

        {/* Module Type */}
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <FormControl fullWidth error={Boolean(errors.payModuleType)}>
            <InputLabel>Module Type</InputLabel>
            <Select
              name="payModuleType"
              value={formData.payModuleType}
              label="Module Type"
              onChange={handleChange}
            >
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="mini">Mini Pay</MenuItem>
              <MenuItem value="full">Full Pay</MenuItem>
            </Select>
            {errors.payModuleType && <FormHelperText>{errors.payModuleType}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Color Scheme */}
        {actionType === 'update' && (
          <Grid item xs={12}>
            <ColorSchemeSelector formData={formData} onColorChange={handleColorChange} />
          </Grid>
        )}

        {/* Social Link */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Social Link (optional)"
            name="social_link"
            value={formData.social_link}
            onChange={handleChange}
            error={Boolean(errors.social_link)}
            helperText={errors.social_link?.[0] || errors.social_link}
          />
        </Grid>
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
