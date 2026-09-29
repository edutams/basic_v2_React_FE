import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { IconSchool, IconUpload, IconCheck } from '@tabler/icons-react';
import BlankCard from '@/components/shared/BlankCard';
import CustomTextField from '@/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/components/forms/theme-elements/CustomFormLabel';
import { getTenantInfo, updateSchoolLogo, updateSchoolInfo } from '@/api/tenant/tenant_api';
import { useNotification } from '@/hooks/useNotification';
import { TenantAuthContext } from '@/context/TenantContext/auth';

const initialsFrom = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'S';

/**
 * School-wide info a school_admin/school_owner/school_head can update
 * themselves — logo, name, address, contact email/phone. Deliberately
 * does not expose tenant_short_name ("Tenant ID"): the landlord uses it
 * to resolve which database this tenant even is, so it stays read-only
 * here, shown only for reference.
 */
const SchoolTab = () => {
  const notify = useNotification();
  const { fetchTenantOnboardingInfo } = useContext(TenantAuthContext);

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [isLogoSaving, setIsLogoSaving] = useState(false);
  const [isInfoSaving, setIsInfoSaving] = useState(false);

  const [formData, setFormData] = useState({
    tenant_name: '',
    address: '',
    tenant_email: '',
    phone: '',
  });

  const applyTenant = (data) => {
    setTenant(data);
    setFormData({
      tenant_name: data?.tenant_name || '',
      address: data?.address || '',
      tenant_email: data?.tenant_email || '',
      phone: data?.administrator_info?.school_spa?.admin_phone || '',
    });
  };

  useEffect(() => {
    let mounted = true;
    getTenantInfo()
      .then((res) => {
        if (mounted && res?.status) applyTenant(res.data);
      })
      .catch((err) => console.error('Failed to load school info:', err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(file);
  };

  const handleLogoSubmit = async () => {
    if (!logoFile) return;

    setIsLogoSaving(true);
    const payload = new FormData();
    payload.append('school_logo', logoFile);

    try {
      const result = await updateSchoolLogo(payload);
      notify.success(result.message || 'School logo updated successfully!', 'Success');
      setTenant((prev) => ({ ...prev, school_logo: result.data?.school_logo }));
      setLogoFile(null);
      await fetchTenantOnboardingInfo?.();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update school logo', 'Error');
    } finally {
      setIsLogoSaving(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setIsInfoSaving(true);

    try {
      const result = await updateSchoolInfo(formData);
      notify.success(result.message || 'School info updated successfully!', 'Success');
      applyTenant({ ...tenant, ...result.data });
      await fetchTenantOnboardingInfo?.();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update school info', 'Error');
    } finally {
      setIsInfoSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <BlankCard>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={24} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  School Profile
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Update your school's logo and general information
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Logo */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: '14px',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
                border: '1px solid',
                borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
                <Avatar
                  key={logoFile ? 'preview' : tenant?.school_logo}
                  src={logoFile ? URL.createObjectURL(logoFile) : tenant?.school_logo || undefined}
                  alt={tenant?.tenant_name}
                  sx={{
                    width: 90,
                    height: 90,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    border: '3px solid #ffffff',
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {!logoFile && !tenant?.school_logo && initialsFrom(tenant?.tenant_name)}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    School Logo
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                    Allowed formats: JPG, PNG, GIF or SVG. Max size of 2MB.
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent={{ xs: 'center', sm: 'flex-start' }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      component="label"
                      startIcon={<IconUpload size={16} />}
                      sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
                    >
                      Upload Logo
                      <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
                    </Button>
                    {logoFile && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        type="button"
                        onClick={handleLogoSubmit}
                        disabled={isLogoSaving}
                        startIcon={
                          isLogoSaving ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <IconCheck size={16} />
                          )
                        }
                        sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
                      >
                        {isLogoSaving ? 'Saving...' : 'Save Logo'}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* General info */}
            <Box component="form" onSubmit={handleInfoSubmit}>
              <Box mb={2}>
                <CustomFormLabel htmlFor="tenant_short_name">Tenant ID</CustomFormLabel>
                <CustomTextField
                  id="tenant_short_name"
                  value={tenant?.tenant_short_name || ''}
                  fullWidth
                  disabled
                />
                <Typography variant="caption" color="textSecondary">
                  Used by the system to identify your school's database — this can't be changed
                  here. Contact support if it needs to change.
                </Typography>
              </Box>

              <Box mb={2}>
                <CustomFormLabel htmlFor="tenant_name">School Name</CustomFormLabel>
                <CustomTextField
                  id="tenant_name"
                  name="tenant_name"
                  value={formData.tenant_name}
                  onChange={handleChange}
                  fullWidth
                  required
                  placeholder="Enter school name"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="tenant_email">Contact Email</CustomFormLabel>
                  <CustomTextField
                    id="tenant_email"
                    name="tenant_email"
                    type="email"
                    value={formData.tenant_email}
                    onChange={handleChange}
                    fullWidth
                    placeholder="school@example.com"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="phone">Contact Phone</CustomFormLabel>
                  <CustomTextField
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    placeholder="+234..."
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <CustomFormLabel htmlFor="address">Address</CustomFormLabel>
                <CustomTextField
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  placeholder="Enter school address"
                />
              </Box>

              <Alert severity="info" sx={{ mt: 3, borderRadius: '12px', fontSize: '13px' }}>
                This information appears on payment receipts and other documents shared with
                parents.
              </Alert>

              <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isInfoSaving}
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
                  onClick={() => applyTenant(tenant)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isInfoSaving}
                  startIcon={
                    isInfoSaving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <IconCheck size={18} />
                    )
                  }
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 3.5, py: 1 }}
                >
                  {isInfoSaving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
};

export default SchoolTab;
