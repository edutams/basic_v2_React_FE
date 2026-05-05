import React, { useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, InputAdornment, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { Visibility, VisibilityOff, ArrowBack, InfoOutlined } from '@mui/icons-material';
import { useTenantAuth } from '../../../hooks/useTenantAuth';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';
import { IconSchool } from '@tabler/icons-react';
import { Avatar } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

const EMPTY = {
  title: '',
  surname: '',
  first_name: '',
  other_name: '',
  phone: '',
  email: '',
  gender: '',
  relationship: '',
  password: '',
  confirm_password: '',
  home_address: '',
};

const AdmissionApply = () => {
  const navigate = useNavigate();
  const { tenantInfo } = useTenantAuth();

  const schoolName = tenantInfo?.school_name || tenantInfo?.tenant_name || tenantInfo?.name || '';
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;

  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.surname || !form.first_name || !form.phone || !form.gender || !form.relationship || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // TODO: wire up API call
    setTimeout(() => {
      setLoading(false);
      navigate('/school-login', { state: { message: 'Account created successfully. Please log in.' } });
    }, 1000);
  };

  return (
    <PageContainer title="Apply for Admission" description="Create Parent Account">
      <Grid container sx={{ minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── Left panel ── */}
        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{
            background: 'linear-gradient(160deg, #0d1b5e 0%, #1a3a8f 60%, #0d1b5e 100%)',
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 6,
            px: 4,
          }}
        >
          {/* School branding */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar
              src={schoolLogo || undefined}
              variant="rounded"
              alt={schoolName}
              sx={{
                width: 100, height: 100,
                bgcolor: schoolLogo ? 'transparent' : 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              {!schoolLogo && <IconSchool size={52} color="#fff" />}
            </Avatar>
            {schoolName && (
              <Typography
                variant="h5"
                fontWeight={700}
                color="#fff"
                textAlign="center"
                sx={{ lineHeight: 1.3, maxWidth: 260 }}
              >
                {schoolName}
              </Typography>
            )}
          </Box>

          {/* Powered by */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Powered by
            </Typography>
            <Box
              component="img"
              src={EduTAMSLogo}
              alt="EduTAMS"
              sx={{ height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }}
            />
          </Box>
        </Grid>

        {/* ── Right panel ── */}
        <Grid
          size={{ xs: 12, lg: 8 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f6fa',
            py: 6,
            px: { xs: 2, sm: 4 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              bgcolor: '#fff',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="h5" fontWeight={700} mb={2}>
              Create Parent Account
            </Typography>

            {/* Info banner */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: '#e8f4fd', borderRadius: 1, px: 2, py: 1, mb: 3,
              }}
            >
              <InfoOutlined sx={{ color: '#1976d2', fontSize: 18 }} />
              <Typography variant="caption" color="primary">
                Fill in your details to create a parent account and apply for admission.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>

                {/* Title + Surname */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Title</InputLabel>
                    <Select name="title" value={form.title} onChange={handleChange} label="Title">
                      <MenuItem value="">—</MenuItem>
                      {['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Alhaji', 'Alhaja', 'Chief'].map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Surname *" name="surname" value={form.surname} onChange={handleChange} fullWidth size="small" required />
                </Grid>

                {/* First name + Other name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First name *" name="first_name" value={form.first_name} onChange={handleChange} fullWidth size="small" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Other name" name="other_name" value={form.other_name} onChange={handleChange} fullWidth size="small" />
                </Grid>

                {/* Phone + Email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone No *" name="phone" value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                    fullWidth size="small" required inputProps={{ maxLength: 11, inputMode: 'numeric' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="E-Mail" name="email" type="email" value={form.email} onChange={handleChange} fullWidth size="small" />
                </Grid>

                {/* Gender + Relationship */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Gender *</InputLabel>
                    <Select name="gender" value={form.gender} onChange={handleChange} label="Gender *">
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Relationship with Applicant *</InputLabel>
                    <Select name="relationship" value={form.relationship} onChange={handleChange} label="Relationship with Applicant *">
                      <MenuItem value="father">Father</MenuItem>
                      <MenuItem value="mother">Mother</MenuItem>
                      <MenuItem value="guardian">Guardian</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Password + Confirm */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Password *" name="password" value={form.password} onChange={handleChange}
                    type={showPassword ? 'text' : 'password'} fullWidth size="small" required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Confirm Password *" name="confirm_password" value={form.confirm_password} onChange={handleChange}
                    type={showConfirm ? 'text' : 'password'} fullWidth size="small" required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Home Address */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Home Address" name="home_address" value={form.home_address}
                    onChange={handleChange} fullWidth size="small" multiline rows={3}
                  />
                </Grid>

              </Grid>

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/school-login')}
                  sx={{ textTransform: 'none', color: 'text.secondary' }}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ textTransform: 'none', px: 4, borderRadius: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>

      </Grid>
    </PageContainer>
  );
};

export default AdmissionApply;
