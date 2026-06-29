import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Button } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import PageContainer from '@/components/container/PageContainer';
import img1 from '@/assets/images/backgrounds/login-bg.svg';
import Logo from '@/layouts/landlord/shared/logo/Logo';
import AuthLogin from '@/components/landlord/auth/AuthLogin';
import AuthForgotPassword from '@/components/landlord/auth/AuthForgotPassword';
import AuthVerifyOtp from '@/components/landlord/auth/AuthVerifyOtp';
import AuthResetPassword from '@/components/landlord/auth/AuthResetPassword';

const Login = () => {
  const [view, setView] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleBackToLogin = () => {
    setView('login');
  };

  return (
    <PageContainer title="Login" description="this is Login page">
      <Grid container spacing={0} sx={{ overflowX: 'hidden' }}>
        <Grid
          size={{ xs: 12, sm: 12, lg: 7, xl: 8 }}
          sx={{
            position: 'relative',
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
          <Box position="relative">
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 75px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <img
                src={img1}
                alt="bg"
                style={{
                  width: '100%',
                  maxWidth: '500px',
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {view === 'login' && (
            <Box p={4} width="100%" maxWidth={480}>
              <AuthLogin
                title="Welcome to EduTams Basic"
                onForgotPassword={() => setView('forgot-password')}
              />
            </Box>
          )}

          {view === 'forgot-password' && (
            <Box p={4} width="100%" maxWidth={480}>
              <Typography variant="h5" fontWeight={700} mb={1}>
                Forgot your password?
              </Typography>
              <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2} mb={2}>
                Please enter the email address associated with your account and we will email you a
                link to reset your password.
              </Typography>
              <AuthForgotPassword
                onBackToLogin={handleBackToLogin}
                onSuccess={(email) => {
                  setResetEmail(email);
                  setView('verify-otp');
                }}
              />
            </Box>
          )}

          {view === 'verify-otp' && (
            <Box p={4} width="100%" maxWidth={480}>
              <Typography variant="h5" fontWeight={700} mb={1}>
                Verify OTP
              </Typography>
              <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2} mb={2}>
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
                <Button variant="contained" size="small" fullWidth onClick={handleBackToLogin} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                  ← Back to Login
                </Button>
              </Box>
            </Box>
          )}

          {view === 'reset-password' && (
            <Box p={4} width="100%" maxWidth={480}>
              <Typography variant="h5" fontWeight={700} mb={1}>
                Reset Password
              </Typography>
              <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2} mb={2}>
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
                <Button variant="contained" size="small" fullWidth onClick={handleBackToLogin} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                  ← Back to Login
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Login;
