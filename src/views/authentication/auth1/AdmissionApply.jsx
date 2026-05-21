import React, { useRef, useState } from 'react';
import { Box, Grid, Typography, Alert, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { InfoOutlined } from '@mui/icons-material';
import { useTenantAuth } from '../../../hooks/useTenantAuth';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.png';
import { IconSchool } from '@tabler/icons-react';
import { Avatar } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ReCAPTCHA from 'react-google-recaptcha';
import ParentForm from 'src/components/tenant-components/parents/ParentForm';
import guardianApi from 'src/api/parentApi';

const AdmissionApply = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { tenantInfo } = useTenantAuth();

  const schoolName = tenantInfo?.school_name || tenantInfo?.tenant_name || tenantInfo?.name || '';
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;

  const primary = theme.palette.primary.main;
  const leftPanelBg = `linear-gradient(180deg, #020411 -19.51%, ${primary} 81.27%)`;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleSubmit = async (values) => {
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }
    if (!values.password) {
      setError('Password is required.');
      return;
    }
    if (values.password !== values.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await guardianApi.admissionParentSignup(values);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      navigate('/login', { state: { message: 'Account created successfully. Please log in.' } });
    } catch (err) {
      console.error('[AdmissionApply] error:', err);
      console.error('[AdmissionApply] response:', err.response);
      console.error('[AdmissionApply] response data:', err.response?.data);
      const data = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      if (data?.errors) {
        msg = Object.values(data.errors).flat().join(' ');
      } else if (data?.message) {
        msg = data.message;
      }
      setError(msg);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Apply for Admission" description="Create Parent Account">
      <Grid container sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
        {/* ── Left panel ── */}
        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{
            background: leftPanelBg,
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 6,
            px: 4,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={schoolLogo || undefined}
              variant="rounded"
              alt={schoolName}
              sx={{
                width: 100,
                height: 100,
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="#fff" fontWeight={500}>
              Powered by
            </Typography>
            <Box
              component="img"
              src={EduTAMSLogo}
              alt="EduTAMS"
              sx={{
                height: 24,
                objectFit: 'contain',
              }}
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
              maxWidth: 800,
              bgcolor: '#fff',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="h5" fontWeight={700} mb={2}>
              Create Parent Account
            </Typography>

            <Alert severity="info" icon={<InfoOutlined fontSize="inherit" />} sx={{ mb: 3 }}>
              Fill in your details to create a parent account and apply for admission.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <ParentForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/login')}
              isLoading={loading}
              submitText="Create Account"
              cancelLabel="← Back to Login"
              showConfirmPassword
              hideWardLink
              beforeActions={
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
                    '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
                  }
                  onChange={(token) => {
                    setCaptchaToken(token);
                    if (error) setError('');
                  }}
                  onExpired={() => setCaptchaToken(null)}
                />
              }
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AdmissionApply;
