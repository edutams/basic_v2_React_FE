import { Box, Typography, Button } from '@mui/material';
import { IconSchool } from '@tabler/icons-react';

const SchoolNotFound = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={2}
            px={3}
            textAlign="center"
        >
            <IconSchool size={64} stroke={1.5} color="#aaa" />
            <Typography variant="h3" fontWeight={700}>
                School Not Found
            </Typography>
            <Typography variant="body1" color="textSecondary" maxWidth={420}>
                The school domain you are trying to access does not exist or has not been set up yet.
                Please check the URL or contact your administrator.
            </Typography>
            <Button variant="contained" href="/" sx={{ mt: 1 }}>
                Go to Homepage
            </Button>
        </Box>
    );
};

export default SchoolNotFound;
