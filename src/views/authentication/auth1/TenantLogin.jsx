import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import img1 from 'src/assets/images/backgrounds/login-bg.svg';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthTenantLogin from '../authForms/AuthTenantLogin';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';
import SchoolIcon from '@mui/icons-material/School';

const cardStyle = {
  p: 3,
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const cardStyle1 = {
  background: '#212F76',
  borderRadius: 2,
  border: '2px solid #e6d300',
};
const cardStyle2 = {
  background: '#2E2414',
  borderRadius: 2,
  border: '2px solid #C8B80C',
};
const cardStyle3 = {
  background: '#4CAAF8',
  borderRadius: 2,
  border: '2px solid #A39500',
};

const buttonStyle = {
  borderRadius: 1,
  px: 4,
  textTransform: 'none',
  '&:hover': {
    background: '#1f2d75',
  },
};

const TenantLogin = () => {
  const navigate = useNavigate();

  return (
  <PageContainer title="School Login" description="Tenant Login page">
    <Grid container spacing={0} sx={{ overflowX: 'hidden' }}>
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
        <Box position="relative" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
              sx={{
                justifyContent: 'center',
                maxWidth: 1100,
                margin: '0 auto',
              }}
            >
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={[cardStyle1, cardStyle]}>
                  <Box display="flex" alignItems="center" gap={1}>
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
                      <SchoolIcon fontSize="small" />
                    </Box>

                    <Typography variant="h6">2026/2027 Admission</Typography>
                  </Box>

                  <Typography variant="h4" fontWeight="bold" textAlign="center">
                    NOW OPEN
                  </Typography>

                  <Button variant="contained" onClick={() => navigate('/admission/apply')} sx={[
                      buttonStyle,
                      {
                        background: '#213393A8',
                        color: '#fff',
                      },
                    ]}>
                    Apply Now
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={[cardStyle2, cardStyle]}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        border: '1px solid #fff',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon fontSize="small" />
                    </Box>

                    <Typography variant="h6">2026/2027 Result</Typography>
                  </Box>

                  <Typography variant="h4" fontWeight="bold" textAlign="center">
                    IS OUT
                  </Typography>

                  <Button variant="contained"  sx={[
                      buttonStyle,
                      {
                        background: '#C2B07AA8',
                        color: '#fff',
                      },
                    ]}>
                    Check Result
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={[cardStyle3, cardStyle]}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        border: '1px solid #fff',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon fontSize="small" />
                    </Box>

                    <Typography variant="h6">Check Addmission</Typography>
                  </Box>

                  <Typography variant="h4" fontWeight="bold" textAlign="center">
                   STATUS
                  </Typography>

                  <Button
                    variant="contained"
                    sx={[
                      buttonStyle,
                      {
                        background: '##4CAAF8',
                        color: '#fff',
                      },
                    ]}
                  >
                    Check Addmision
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* IMAGE BELOW */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <img src={img1} alt="bg" style={{ width: '100%', maxWidth: '500px' }} />
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '100vh' }}
      >
        <Box
          p={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            maxWidth: 480,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              {/* <AuthTenantLogin title="Institution Portal" /> */}
              <AuthTenantLogin title="Institution Portal" />
            </Box>
          </Box>
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
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
  );
};

export default TenantLogin;
