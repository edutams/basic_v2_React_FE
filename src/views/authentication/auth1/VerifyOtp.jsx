import React from 'react';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import img1 from 'src/assets/images/backgrounds/login-bg.svg';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import Typography from '@mui/material/Typography';
import AuthVerifyOtp from '../authForms/AuthVerifyOtp';

const VerifyOtp = () => (
  <PageContainer title="Verify Otp" description="this is Verify Otp page">
    <Grid container justifyContent="center" spacing={0} sx={{ overflowX: 'hidden' }}>
      <Grid
        size={{ xs: 12, sm: 12, lg: 8, xl: 9 }}
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
        size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box p={4}>
          <Typography variant="h4" fontWeight="700">
            Verify Otp
          </Typography>

          <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2}>
            Please enter the OTP sent to your email address.
          </Typography>
          <AuthVerifyOtp />
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
);

export default VerifyOtp;
