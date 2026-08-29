import React, { useState } from 'react';
import { Grid, Button, Box, Stack, Typography, Paper, Chip } from '@mui/material';
import {
  BusinessCenter,
  TrendingUp,
  School,
  CheckCircle,
  AccountBalanceWallet,
} from '@mui/icons-material';

import PageContainer from '@/components/container/PageContainer';
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
    <PageContainer
      title="Agent Portal Login - EduTams Private School Management"
      description="Login page for EduTams Agent & Partner Portal"
    >
      <Grid container spacing={0} sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Left Hero Panel (Wider: lg=7, xl=8) */}
        <Grid
          size={{ xs: 12, lg: 7, xl: 8 }}
          sx={{
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            p: { lg: 5, xl: 6 },
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: '#ffffff',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-15%',
              left: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)',
            },
          }}
        >
          {/* Header Logo */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Logo />
          </Box>

          {/* Center Hero Content */}
          <Box sx={{ position: 'relative', zIndex: 2, my: 'auto', maxWidth: 680 }}>
            <Chip
              icon={<BusinessCenter sx={{ fontSize: '16px !important', color: '#818cf8 !important' }} />}
              label="EDUTAMS AGENT & PARTNER PORTAL"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: '#c7d2fe',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: 0.8,
                mb: 3,
                px: 0.5,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { lg: '36px', xl: '44px' },
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#ffffff',
                mb: 2,
                letterSpacing: '-0.5px',
              }}
            >
              Onboard & Manage Top Private Schools Effortlessly.
            </Typography>

            <Typography
              sx={{
                fontSize: '15px',
                color: 'rgba(226, 232, 240, 0.85)',
                lineHeight: 1.6,
                mb: 4,
                fontWeight: 400,
              }}
            >
              Your central portal to register private schools, track SkoolPay transactions, manage sub-agent networks, and monitor commission payouts in real time.
            </Typography>

            {/* Feature Highlights Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { icon: School, title: 'School Onboarding', desc: 'Register primary & secondary private schools' },
                { icon: AccountBalanceWallet, title: 'Commission Payouts', desc: 'Real-time revenue tracking & payouts' },
                { icon: TrendingUp, title: 'Sub-Agent Network', desc: 'Multi-level organization hierarchy' },
              ].map((item, idx) => (
                <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      height: '100%',
                    }}
                  >
                    <item.icon sx={{ fontSize: 26, color: '#a5b4fc', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'rgba(203, 213, 225, 0.8)', lineHeight: 1.35 }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Footer Trust Bar */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              pt: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <CheckCircle sx={{ fontSize: 18, color: '#34d399' }} />
            <Typography sx={{ fontSize: '12px', color: 'rgba(226, 232, 240, 0.85)', fontWeight: 500 }}>
              Authorized Agent & Partner Access • Secure Encrypted Connection
            </Typography>
          </Box>
        </Grid>

        {/* Right Form Panel (Right Column: lg=5, xl=4) */}
        <Grid
          size={{ xs: 12, lg: 5, xl: 4 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            p: { xs: 3, sm: 6 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            {/* Mobile Logo display */}
            <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 3, textAlign: 'center' }}>
              <Logo />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '18px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
              }}
            >
              {view === 'login' && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                    Agent Portal Sign In 👋
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    Sign in with your agent credentials to access your partner dashboard
                  </Typography>
                  <AuthLogin
                    title=""
                    onForgotPassword={() => setView('forgot-password')}
                  />
                </Box>
              )}

              {view === 'forgot-password' && (
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                    Forgot Password? 🔒
                  </Typography>
                  <Typography color="#64748b" variant="subtitle2" fontWeight="400" mb={3}>
                    Enter your registered agent email address and we will send you an OTP to reset your password.
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
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                    Verify OTP 📩
                  </Typography>
                  <Typography color="#64748b" variant="subtitle2" fontWeight="400" mb={3}>
                    Enter the OTP sent to your email to verify your agent account identity.
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
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={handleBackToLogin}
                      sx={{ textTransform: 'none', borderRadius: '8px', color: '#475569', borderColor: '#cbd5e1' }}
                    >
                      ← Back to Login
                    </Button>
                  </Box>
                </Box>
              )}

              {view === 'reset-password' && (
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#0f172a" mb={1}>
                    Reset Password 🔑
                  </Typography>
                  <Typography color="#64748b" variant="subtitle2" fontWeight="400" mb={3}>
                    Enter your new secure password below.
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
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={handleBackToLogin}
                      sx={{ textTransform: 'none', borderRadius: '8px', color: '#475569', borderColor: '#cbd5e1' }}
                    >
                      ← Back to Login
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Login;
