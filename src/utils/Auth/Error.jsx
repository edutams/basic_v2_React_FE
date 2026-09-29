import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorImg from '@/assets/images/backgrounds/errorimg.svg';

// Both the tenant and agent portals use /dashboard as their home route now,
// so there's no longer a need to branch on which subdomain this is.
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
      <Button variant="contained" size="small" color="primary" component={Link} to="/dashboard" disableElevation>
        Go Back
      </Button>
    </Container>
  </Box>
);

export default Error;
