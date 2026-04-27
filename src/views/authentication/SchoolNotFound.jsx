import { Box, Container, Typography, Button } from '@mui/material';
import ErrorImg from 'src/assets/images/backgrounds/errorimg.svg';
import { Link } from 'react-router';

const appMode = import.meta.env.MODE;
const CENTRAL_DOMAIN =
    appMode === 'production'
        ? import.meta.env.VITE_CENTRAL_DOMAIN_PROD
        : import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL;

const SchoolNotFound = () => {
    return (
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
                    School Not Exist                </Typography>
                <Typography align="center" variant="h4" mb={4}>
                    The school domain you are trying to access does not exist or has not been set up yet.
                    Please check the URL or contact your administrator.
                </Typography>
                <Button
                    color="primary"
                    variant="contained"
                    href={CENTRAL_DOMAIN}
                    disableElevation
                >
                    Go Back to Home
                </Button>
            </Container>
        </Box>
    );
};

export default SchoolNotFound;
