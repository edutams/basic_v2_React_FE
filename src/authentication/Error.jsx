import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorImg from '@/assets/images/backgrounds/errorimg.svg';

const hostname = window.location.hostname;
const centralHost = import.meta.env.VITE_API_BASE_URL
  ? new URL(import.meta.env.VITE_API_BASE_URL).hostname
  : 'basic_v2.test';

const isTenantSubdomain =
  hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

const Error = ({ message = 'This page you are looking for could not be found.' }) => (
  <Box
    display="flex"
    flexDirection="column"
    height="100vh"
    textAlign="center"
    justifyContent="center"
  >
    <Container maxWidth="md">
      <img src={ErrorImg} alt="404" />
      <Typography align="center" variant="h1" mb={4}>
        Opps!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        {message}
      </Typography>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        to={isTenantSubdomain ? '/dashboard' : '/agent/dashboard'}
        disableElevation
      >
        Go Back
      </Button>
    </Container>
  </Box>
);

export default Error;
