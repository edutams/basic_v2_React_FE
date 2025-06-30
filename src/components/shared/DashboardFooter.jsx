import React from 'react';
import {
  Box,
  Typography,
  Container,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';

const DashboardFooter = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: '20px',
        py: 1,
        px: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        border: '2px solid red'
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="textSecondary">
              Powered by
            </Typography>
            <img
              src={EduTAMSLogo}
              alt="EduTAMS Logo"
              style={{
                height: '30px',
                width: 'auto',
              }}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardFooter;