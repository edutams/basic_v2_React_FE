import { useEffect } from 'react';
import { useParams } from 'react-router';
import { CircularProgress, Box, Typography } from '@mui/material';

const ImpersonateLogin = () => {
  const params = useParams();
  const token = params.token;

  console.log('=== ImpersonateLogin ===');
  console.log('params:', params);
  console.log('token:', token);

  useEffect(() => {
    console.log('useEffect token:', token);
    if (token) {
      localStorage.setItem('tenant_access_token', token);
      console.log('saved, redirecting to /');
      window.location.href = '/';
    } else {
      console.log('no token, redirecting to /login');
      window.location.href = '/login';
    }
  }, [token]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Authenticating...
      </Typography>
    </Box>
  );
};

export default ImpersonateLogin;
