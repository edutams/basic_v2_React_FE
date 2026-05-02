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
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
// import ColorSchemeSelector from './ColorSchemeSelector';
import PropTypes from 'prop-types';
import {
  createSchool,
  updateSchool,
  getAllStates,
  getLgasByState,
  createProspectiveTenant,
} from '../../../context/AgentContext/services/school.service';
import {
  getSessions,
  getCurrentSessionForSelect,
} from '../../../context/AgentContext/services/session.service';
import useNotification from '../../../hooks/useNotification';

import { IMaskInput } from 'react-imask';

const PhoneMaskCustom = React.forwardRef(function PhoneMaskCustom(props, ref) {
  const { onChange, name, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000000"
      definitions={{ 0: /[0-9]/ }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name, value } })}
      // onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
      lazy={true}
    />
  );
});

// ── helpers ──────────────────────────────────────────────────────────────────

const emptyPerson = () => ({
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  gender: '',
});

const emptyForm = () => ({
  tenant_name: '',
  tenant_email: '',
  tenant_short_name: '',
  address: '',
  state_id: '',
  lga_id: '',
  school_type: '',
  school_divisions: [],
  session_id: '',
  headcolor: 'bg-night-sky text-lighter',
  sidecolor: 'bg-dark text-lighter',
  bodycolor: 'null',
  owner: emptyPerson(),
  spa: emptyPerson(),
  head: emptyPerson(),
});

const fromSelected = (s) => {
  if (!s) return emptyForm();
  const info = s.administrator_info || {};
  const spa = info.school_spa || {};
  const head = info.school_head || {};
  const owner = info.school_owner || {};
  return {
    tenant_name: s.tenant_name || '',
    tenant_email: s.tenant_email || '',
    tenant_short_name: s.tenant_short_name || '',
    address: s.address || '',
    state_id: s.state_lga?.state_id || '',
    lga_id: s.lga_id || '',
    school_type: s.school_type
      ? Array.isArray(s.school_type)
        ? s.school_type[0] || ''
        : typeof s.school_type === 'string'
          ? (() => {
              try {
                const parsed = JSON.parse(s.school_type);
                return Array.isArray(parsed) ? parsed.find((t) => typeof t === 'string') || '' : '';
              } catch {
                return s.school_type;
              }
            })()
          : s.school_type
      : '',
    school_divisions: Array.isArray(s.school_divisions)
      ? s.school_divisions.map((d) => d.id ?? d)
      : typeof s.school_divisions === 'object' && s.school_divisions !== null
        ? Object.values(s.school_divisions)
        : [],
    session_id: s.session_id || '',
    headcolor: s.color?.headcolor || 'bg-night-sky text-lighter',
    sidecolor: s.color?.sidecolor || 'bg-dark text-lighter',
    bodycolor: s.color?.bodycolor || 'null',
    owner: {
      first_name: owner.school_owner_first_name || '',
      last_name: owner.school_owner_last_name || '',
      middle_name: owner.school_owner_middle_name || '',
      email: owner.school_owner_email || '',
      phone: owner.school_owner_phone || '',
      gender: owner.school_owner_gender || '',
    },
    spa: {
      first_name: spa.admin_first_name || '',
      last_name: spa.admin_last_name || '',
      middle_name: spa.admin_middle_name || '',
      email: spa.admin_email || '',
      phone: spa.admin_phone || '',
      gender: spa.admin_gender || '',
    },
    head: {
      first_name: head.school_head_first_name || '',
      last_name: head.school_head_last_name || '',
      middle_name: head.school_head_middle_name || '',
      email: head.school_head_email || '',
      phone: head.school_head_phone || '',
      gender: head.school_head_gender || '',
    },
  };
};

// ── PersonFields — defined OUTSIDE the parent to prevent remount on every render ──

const PersonFields = ({ section, formData, errors, onPersonChange, readOnly = false }) => (
  <Grid container spacing={2}>
    {[
      { key: 'first_name', label: 'First Name', md: 6 },
      { key: 'last_name', label: 'Last Name', md: 6 },
      { key: 'middle_name', label: 'Middle Name (optional)', md: 6 },
      { key: 'phone', label: 'Phone', md: 6, masked: true },
      { key: 'email', label: 'Email', md: 6 },
    ].map(({ key, label, md, masked }) => (
      <Grid item size={{ xs: 12, md }} key={key}>
        <TextField
          fullWidth
          label={label}
          value={formData[section][key]}
          onChange={(e) => onPersonChange(section, key, e.target.value)}
          error={Boolean(errors[`${section}.${key}`])}
          helperText={errors[`${section}.${key}`]}
          sx={{ bgcolor: 'white' }}
          InputProps={
            masked ? { inputComponent: PhoneMaskCustom } : readOnly ? { readOnly: true } : undefined
          }
          inputProps={readOnly ? { readOnly: true } : undefined}
        />
      </Grid>
    ))}
    <Grid item size={{ xs: 12, md: 6 }}>
      <FormControl fullWidth error={Boolean(errors[`${section}.gender`])} sx={{ bgcolor: 'white' }}>
        <InputLabel>Gender</InputLabel>
        <Select
          value={formData[section].gender}
          label="Gender"
          onChange={(e) => onPersonChange(section, 'gender', e.target.value)}
          inputProps={{ readOnly }}
        >
          <MenuItem value="">-- Select --</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
        {errors[`${section}.gender`] && (
          <FormHelperText>{errors[`${section}.gender`]}</FormHelperText>
        )}
      </FormControl>
    </Grid>
  </Grid>
);

// ── component ─────────────────────────────────────────────────────────────────

const RegisterSchoolForm = ({
  actionType,
  selectedSchool = null,
  onSubmit,
  onCancel,
  useProspective = false,
}) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const [formData, setFormData] = useState(() => fromSelected(selectedSchool));
  const [errors, setErrors] = useState({});

  // Reset form when selectedSchool changes (for edit mode)
  useEffect(() => {
    setFormData(fromSelected(selectedSchool));
    setErrors({});
  }, [selectedSchool]);

  // 'none' | 'owner'
  const [spaSource, setSpaSource] = useState('none');
  // 'none' | 'owner' | 'spa'
  const [headSource, setHeadSource] = useState('none');

  // ── data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    getAllStates()
      .then((d) => setStates(d || []))
      .catch(() => notify.error('Failed to load states'));
  }, []);

  // Fetch current session on mount
  useEffect(() => {
    getCurrentSessionForSelect()
      .then((res) => {
        const session = res.data || res;
        setCurrentSession(session);
        // Only prefill if user hasn't selected anything yet
        if (!formData.session_id && session?.id) {
          setFormData((prev) => ({ ...prev, session_id: session.id }));
        }
      })
      .catch(() => notify.error('Failed to load current session'));
  }, []);

  useEffect(() => {
    if (formData.state_id) {
      getLgasByState(formData.state_id)
        .then((d) => setLgas(d || []))
        .catch((err) => notify.error(err.error || 'Failed to load LGAs'));
    } else {
      setLgas([]);
      setFormData((prev) => ({ ...prev, lga_id: '' }));
    }
  }, [formData.state_id]);

  // ── change handlers ──────────────────────────────────────────────────────

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePersonChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    const key = `${section}.${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleColorChange = (colorType, value) => {
    setFormData((prev) => ({ ...prev, [colorType]: value }));
  };

  const copyPerson = (src) => ({ ...formData[src] });

  const handleSpaSourceChange = (e) => {
    const src = e.target.value;
    setSpaSource(src);
    setFormData((prev) => ({
      ...prev,
      spa: src === 'owner' ? copyPerson('owner') : emptyPerson(),
    }));
  };

  const handleHeadSourceChange = (e) => {
    const src = e.target.value;
    setHeadSource(src);
    setFormData((prev) => ({
      ...prev,
      head: src !== 'none' ? copyPerson(src) : emptyPerson(),
    }));
  };

  // ── validation ───────────────────────────────────────────────────────────

  const validateForm = () => {
    const e = {};
    if (!formData.tenant_name.trim()) e.tenant_name = 'School name is required';
    if (!formData.tenant_short_name.trim()) e.tenant_short_name = 'Short name is required';
    if (!formData.tenant_email.trim()) e.tenant_email = 'School email is required';
    if (!formData.address.trim()) e.address = 'Address is required';
    if (!formData.state_id) e.state_id = 'State is required';
    if (!formData.lga_id) e.lga_id = 'LGA is required';
    if (!formData.session_id) e.session_id = 'Session is required';
    if (!formData.school_type || !formData.school_type.length)
      e.school_type = 'School type is required';
    // If secondary is selected without specific levels, add a warning or treat as valid
    // The school_type array will contain 'secondary' or 'secondary-junior'/'secondary-senior'

    const validatePerson = (section, label, fields) => {
      fields.forEach(({ key, msg }) => {
        const val = formData[section][key];
        if (!val || !String(val).trim())
          e[`${section}.${key}`] = msg || `${label} ${key} is required`;
      });
    };

    validatePerson('owner', 'Owner', [
      { key: 'first_name' },
      { key: 'last_name' },
      { key: 'email' },
      { key: 'phone' },
      { key: 'gender' },
    ]);
    validatePerson('spa', 'Portal Admin', [
      { key: 'first_name' },
      { key: 'last_name' },
      { key: 'email' },
      { key: 'phone' },
      { key: 'gender' },
    ]);
    validatePerson('head', 'Head Admin', [
      { key: 'first_name' },
      { key: 'last_name' },
      { key: 'email' },
      { key: 'phone' },
      { key: 'gender' },
    ]);

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) {
      notify.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const isSpaOwner = formData.spa.email === formData.owner.email;
      const isSpaHead = formData.spa.email === formData.head.email;
      const isHeadOwner = formData.head.email === formData.owner.email;

      const administrator_info = {
        school_spa: {
          admin_first_name: formData.spa.first_name,
          admin_last_name: formData.spa.last_name,
          admin_middle_name: formData.spa.middle_name,
          admin_email: formData.spa.email,
          admin_phone: formData.spa.phone,
          admin_gender: formData.spa.gender,
          is_spa: 'yes',
          is_school_head: isSpaHead ? 'yes' : 'no',
          is_school_owner: isSpaOwner ? 'yes' : 'no',
          admin_session_term_id: 1,
        },
        school_head: {
          school_head_first_name: formData.head.first_name,
          school_head_last_name: formData.head.last_name,
          school_head_middle_name: formData.head.middle_name,
          school_head_email: formData.head.email,
          school_head_phone: formData.head.phone,
          school_head_gender: formData.head.gender,
          session_term_id: 1,
          is_school_head: 'yes',
          is_spa: isSpaHead ? 'yes' : 'no',
          is_school_owner: isHeadOwner ? 'yes' : 'no',
        },
        school_owner: {
          school_owner_first_name: formData.owner.first_name,
          school_owner_last_name: formData.owner.last_name,
          school_owner_middle_name: formData.owner.middle_name,
          school_owner_email: formData.owner.email,
          school_owner_phone: formData.owner.phone,
          school_owner_gender: formData.owner.gender,
          is_school_owner: 'yes',
          is_spa: isSpaOwner ? 'yes' : 'no',
          is_school_head: isHeadOwner ? 'yes' : 'no',
        },
      };

      const base = {
        tenant_name: formData.tenant_name,
        tenant_email: formData.tenant_email,
        tenant_short_name: formData.tenant_short_name,
        address: formData.address,
        lga_id: formData.lga_id,
        school_type: formData.school_type,
        school_divisions: formData.school_divisions,
        session_id: formData.session_id,
        administrator_info,
      };

      let res;
      if (actionType === 'update') {
        res = await updateSchool(selectedSchool.id, {
          ...base,
          headcolor: formData.headcolor,
          sidecolor: formData.sidecolor,
          bodycolor: formData.bodycolor,
        });
      } else if (useProspective) {
        res = await createProspectiveTenant(base);
      } else {
        res = await createSchool(base);
      }

      notify.success(res.message || 'School processed successfully');
      onSubmit(res.tenant || res.data || res);
      setFormData(emptyForm());
      setErrors({});
      setSpaSource('none');
      setHeadSource('none');
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

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {loading && actionType !== 'update' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>
            {useProspective ? 'Submitting Application' : 'Initialization Processing'}
          </AlertTitle>
          {useProspective ? (
            'Your school application is being submitted for review.'
          ) : (
            <>
              Please wait while the initialization setup is processing. This may take up to{' '}
              <strong>1 minute</strong>.
            </>
          )}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Session Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.session_id)}>
            <InputLabel>Session</InputLabel>
            <Select
              name="session_id"
              value={formData.session_id}
              label="Session"
              onChange={handleChange}
            >
              <MenuItem value="">-- Select Session --</MenuItem>
              {currentSession && (
                <MenuItem key={currentSession.id} value={currentSession.id}>
                  {currentSession.sesname} (Current)
                </MenuItem>
              )}
            </Select>
            {errors.session_id && <FormHelperText>{errors.session_id}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* School Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.school_type)}>
            <InputLabel>School Type</InputLabel>
            <Select
              name="school_type"
              value={formData.school_type}
              label="School Type"
              onChange={handleChange}
            >
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="secondary">Secondary</MenuItem>
            </Select>
            {errors.school_type && <FormHelperText>{errors.school_type}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* School Name & Email */}
        <Grid item size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="School Name"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_name)}
            helperText={errors.tenant_name}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="School Email"
            name="tenant_email"
            value={formData.tenant_email}
            onChange={handleChange}
            error={Boolean(errors.tenant_email)}
            helperText={errors.tenant_email}
          />
        </Grid>

        {/* Short Name */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Short Name"
            name="tenant_short_name"
            value={formData.tenant_short_name}
            onChange={handleChange}
            error={Boolean(errors.tenant_short_name)}
            helperText={errors.tenant_short_name}
          />
        </Grid>

        {/* State & LGA */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.state_id)}>
            <InputLabel>State</InputLabel>
            <Select name="state_id" value={formData.state_id} label="State" onChange={handleChange}>
              <MenuItem value="">-- Select State --</MenuItem>
              {states.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.state_name}
                </MenuItem>
              ))}
            </Select>
            {errors.state_id && <FormHelperText>{errors.state_id}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={Boolean(errors.lga_id)}>
            <InputLabel>LGA</InputLabel>
            <Select name="lga_id" value={formData.lga_id} label="LGA" onChange={handleChange}>
              <MenuItem value="">-- Select LGA --</MenuItem>
              {lgas.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.lga_name}
                </MenuItem>
              ))}
            </Select>
            {errors.lga_id && <FormHelperText>{errors.lga_id}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Address */}
        <Grid size={{ xs: 12, md: 12 }}>
          <TextField
            fullWidth
            label="School Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
            error={Boolean(errors.address)}
            helperText={errors.address}
          />
        </Grid>

        {/* ── School Owner ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ p: 2, bgcolor: '#F1F8E9', borderRadius: 1, border: '1px solid #DCEDC8' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#33691E' }}>
              School Owner Details
            </Typography>
            <PersonFields
              section="owner"
              formData={formData}
              errors={errors}
              onPersonChange={handlePersonChange}
            />
          </Box>
        </Grid>

        {/* ── School Portal Admin (SPA) ─────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ p: 2, bgcolor: '#E3F2FD', borderRadius: 1, border: '1px solid #BBDEFB' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#0D47A1' }}>
              School Portal Admin (SPA) Details
            </Typography>
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: '#EEF2FF',
                borderRadius: 1,
                border: '1px solid #C7D2FE',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}
              >
                Same as school owner?
              </Typography>
              <RadioGroup row value={spaSource} onChange={handleSpaSourceChange}>
                <FormControlLabel
                  value="owner"
                  control={<Radio size="small" />}
                  label="Yes, use owner info"
                />
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label="No, fill separately"
                />
              </RadioGroup>
            </Box>
            <PersonFields
              section="spa"
              formData={formData}
              errors={errors}
              onPersonChange={handlePersonChange}
              readOnly={spaSource === 'owner'}
            />
          </Box>
        </Grid>

        {/* ── School Head Admin ─────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 1, border: '1px solid #E0E0E0' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              School Head Admin Details
            </Typography>
            <Box
              sx={{
                mb: 1.5,
                p: 1.5,
                bgcolor: '#EEF2FF',
                borderRadius: 1,
                border: '1px solid #C7D2FE',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: 'primary.main', display: 'block', mb: 0.5 }}
              >
                Copy info from an existing person?
              </Typography>
              <RadioGroup row value={headSource} onChange={handleHeadSourceChange}>
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label="No, fill separately"
                />
                <FormControlLabel
                  value="owner"
                  control={<Radio size="small" />}
                  label="Use owner info"
                />
                <FormControlLabel
                  value="spa"
                  control={<Radio size="small" />}
                  label="Use portal admin info"
                />
              </RadioGroup>
            </Box>
            <PersonFields
              section="head"
              formData={formData}
              errors={errors}
              onPersonChange={handlePersonChange}
              readOnly={headSource !== 'none'}
            />
          </Box>
        </Grid>

        {/* Color Scheme (update only) */}
        {/* {actionType === 'update' && (
          <Grid item xs={12}>
            <ColorSchemeSelector formData={formData} onColorChange={handleColorChange} />
          </Grid>
        )} */}
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
  useProspective: PropTypes.bool,
};

export default RegisterSchoolForm;
