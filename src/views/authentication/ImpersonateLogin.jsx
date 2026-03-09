import { useEffect } from 'react';
import { useParams } from 'react-router';
import { CircularProgress, Box, Typography } from '@mui/material';

const ImpersonateLogin = () => {
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    if (token) {
      localStorage.setItem('tenant_access_token', token);
      window.location.href = '/';
    } else {
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
