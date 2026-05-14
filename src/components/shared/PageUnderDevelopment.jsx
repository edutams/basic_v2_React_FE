import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import MaintenanceImg from 'src/assets/images/backgrounds/maintenance2.svg';

const PageUnderDevelopment = ({
  title = 'Page Under Development',
  subtitle = 'This feature is currently being built. Check back later!',
  showImage = true,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
          <img src={MaintenanceImg} alt="Under Development" style={{ width: '100%', maxWidth: '500px' }} />
        <Typography align="center" variant="h1" >
          {title}
        </Typography>
        
       
      </Container>
    </Box>
  );
};

export default PageUnderDevelopment;