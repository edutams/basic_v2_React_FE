import { Box, Container, Typography } from '@mui/material';
import ErrorImg from 'src/assets/images/backgrounds/errorimg.svg';

// Shown when the current hostname matched neither a real tenant (school)
// domain nor a real organization (agent) domain — e.g. a mistyped school
// subdomain. Previously this case silently fell through to AgentRoutes,
// showing the agent portal's login screen under a URL that still looked
// like (a wrong) school address — see Router.jsx for the domain check
// that now renders this instead.
const DomainNotFound = ({ hostname = window.location.hostname }) => (
  <Box display="flex" flexDirection="column" textAlign="center" justifyContent="center" minHeight="100vh">
    <Container maxWidth="md">
      <img src={ErrorImg} alt="School not found" style={{ width: '100%', maxWidth: '500px' }} />
      <Typography align="center" variant="h1">
        School Not Found
      </Typography>
      <Typography align="center" variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        We couldn't find a school at <strong>{hostname}</strong>. Please
        double-check the web address your school gave you, or contact them
        directly if the problem continues.
      </Typography>
    </Container>
  </Box>
);

export default DomainNotFound;
