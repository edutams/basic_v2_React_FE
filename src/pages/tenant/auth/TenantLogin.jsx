import { useRef, useState } from 'react';
import { Grid, Box, Typography, Button, Alert } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import img1 from '@/assets/images/backgrounds/login-bg.svg';
import Logo from '@/layouts/landlord/shared/logo/Logo';
import AuthTenantLogin from '@/components/tenant/auth/AuthTenantLogin';
import AuthForgotPassword from '@/components/tenant/auth/AuthForgotPassword';
import AuthVerifyOtp from '@/components/tenant/auth/AuthVerifyOtp';
import AuthResetPassword from '@/components/tenant/auth/AuthResetPassword';
import EduTAMSLogo from '@/assets/images/logos/EduTAMS.jpeg';
import SchoolIcon from '@mui/icons-material/School';
import ReCAPTCHA from 'react-google-recaptcha';
import ParentForm from '@/components/tenant/parents/ParentForm';
import guardianApi from '@/api/tenant/guardians/parentApi';

const cardStyle = {
  p: 3,
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.5,
};
const cardStyle1 = {
  bgcolor: 'primary.main',
  borderRadius: 2,
  border: '2px solid #e6d300',
};
const cardStyle2 = { background: '#2E2414', borderRadius: 2, border: '2px solid #C8B80C' };
const cardStyle3 = { background: '#4CAAF8', borderRadius: 2, border: '2px solid #A39500' };

const buttonStyle = {
  borderRadius: 1,
  px: 4,
  textTransform: 'none',
  // '&:hover': { background: '#1f2d75' },
};

const IconCircle = ({ children }) => (
  <Box
    sx={{
      border: '1px solid #fff',
      borderRadius: '50%',
      p: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
    }}
  >
    {children}
  </Box>
);

const TenantLogin = () => {
  const [view, setView] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleAdmissionSubmit = async (values) => {
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
      setView('login');
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      if (data?.errors) msg = Object.values(data.errors).flat().join(' ');
      else if (data?.message) msg = data.message;
      setError(msg);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setView('login');
    setError('');
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
  };

  return (
    <PageContainer title="School Login" description="Tenant Login page">
      <Grid container spacing={0} sx={{ overflowX: 'hidden' }}>
        {/* Left panel */}
        <Grid
          size={{ xs: 12, sm: 12, lg: 7, xl: 8 }}
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            '&:before': {
              content: '""',
              background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 15s ease infinite',
              position: 'absolute',
              height: '100%',
              width: '100%',
              opacity: '0.3',
            },
          }}
        >
          <Box
            position="relative"
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Box px={3}>
              <Logo />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: 2,
              }}
            >
              <Grid
                container
                spacing={3}
                sx={{ justifyContent: 'center', maxWidth: 1100, margin: '0 auto' }}
              >
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={[cardStyle1, cardStyle]}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCircle>
                        <SchoolIcon fontSize="small" />
                      </IconCircle>
                      <Typography variant="h6">2026/2027 Admission</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" textAlign="center">
                      NOW OPEN
                    </Typography>
                    <Button
                      onClick={() => setView('apply')}
                      sx={[
                        buttonStyle,
                        {
                          bgcolor: 'primary.dark',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                      ]}
                    >
                      Apply Now
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={[cardStyle2, cardStyle]}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCircle>
                        <SchoolIcon fontSize="small" />
                      </IconCircle>
                      <Typography variant="h6">2026/2027 Result</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" textAlign="center">
                      IS OUT
                    </Typography>
                    <Button sx={[buttonStyle, { background: '#C2B07AA8', color: '#fff' }]}>
                      Check Result
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={[cardStyle3, cardStyle]}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconCircle>
                        <SchoolIcon fontSize="small" />
                      </IconCircle>
                      <Typography variant="h6">Check Admission</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" textAlign="center">
                      STATUS
                    </Typography>
                    <Button sx={[buttonStyle, { background: '#0f81de', color: '#fff' }]}>
                      Check Admission
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', mt: 4 }}>
                <img src={img1} alt="bg" style={{ width: '100%', maxWidth: '500px' }} />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right panel */}
        <Grid
          size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
          sx={{
            minHeight: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {view === 'login' && (
            <Box
              p={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                maxWidth: 480,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%' }}>
                  <AuthTenantLogin
                    title="Institution Portal"
                    onCreateAccount={() => setView('apply')}
                    onForgotPassword={() => setView('forgot-password')}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {view === 'apply' && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                px: { xs: 3, sm: 4 },
                py: 5,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} mb={1}>
                  Create Parent Account
                </Typography>

                <Alert severity="info" icon={<InfoOutlined fontSize="inherit" />} sx={{ mb: 2 }}>
                  Fill in your details to create a parent account and apply for admission.
                </Alert>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <ParentForm
                  onSubmit={handleAdmissionSubmit}
                  onCancel={handleBackToLogin}
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
            </Box>
          )}

          {view === 'forgot-password' && (
            <Box
              p={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                maxWidth: 480,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="h5" fontWeight={700} mb={1}>
                  Forgot your password?
                </Typography>

                <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2}>
                  Please enter the email address associated with your account and we will email you
                  a link to reset your password.
                </Typography>

                <AuthForgotPassword
                  onBackToLogin={handleBackToLogin}
                  onSuccess={(email) => {
                    setResetEmail(email);
                    setView('verify-otp');
                  }}
                />
              </Box>
            </Box>
          )}

          {view === 'verify-otp' && (
            <Box
              p={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                maxWidth: 480,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="h5" fontWeight={700} mb={1}>
                  Verify OTP
                </Typography>

                <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2}>
                  Enter the OTP sent to your email to verify your identity.
                </Typography>

                <AuthVerifyOtp
                  emailProp={resetEmail}
                  onSuccess={(email, token) => {
                    setResetEmail(email);
                    setResetToken(token);
                    setView('reset-password');
                  }}
                />

                <Box mt={3}>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={handleBackToLogin}
                    sx={{ color: 'text.secondary', textTransform: 'none' }}
                  >
                    ← Back to Login
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {view === 'reset-password' && (
            <Box
              p={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                maxWidth: 480,
                mx: 'auto',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="h5" fontWeight={700} mb={1}>
                  Reset Password
                </Typography>

                <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2}>
                  Enter your new password below.
                </Typography>

                <AuthResetPassword
                  emailProp={resetEmail}
                  tokenProp={resetToken}
                  onSuccess={() => {
                    setView('login');
                  }}
                />

                <Box mt={3}>
                  <Button
                    variant="text"
                    fullWidth
                    onClick={handleBackToLogin}
                    sx={{ color: 'text.secondary', textTransform: 'none' }}
                  >
                    ← Back to Login
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              pb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Powered by
            </Typography>
            <Box
              component="img"
              src={EduTAMSLogo}
              alt="EduTAMS"
              sx={{ height: 24, objectFit: 'contain' }}
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default TenantLogin;
