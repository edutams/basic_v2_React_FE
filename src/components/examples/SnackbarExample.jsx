import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useNotification } from '../../hooks/useNotification';
import ParentCard from '../shared/ParentCard';

const SnackbarExample = () => {
  const notify = useNotification();

  const handleSuccess = () => {
    notify.success('Operation completed successfully!', 'Success');
  };

  const handleError = () => {
    notify.error('Something went wrong. Please try again.', 'Error');
  };

  const handleWarning = () => {
    notify.warning('Please check your input before proceeding.', 'Warning');
  };

  const handleInfo = () => {
    notify.info('Here is some useful information for you.', 'Information');
  };

  const handleCustom = () => {
    notify.custom('This is a custom notification with extended duration', {
      severity: 'success',
      title: 'Custom Notification',
      duration: 10000, 
    });
  };

  const handleSweetAlertStyle = () => {ce
    notify.fire('Success', 'Package created successfully', 'success');
  };

  const handleMultiple = () => {
    notify.success('First notification');
    setTimeout(() => notify.warning('Second notification'), 500);
    setTimeout(() => notify.info('Third notification'), 1000);
  };

  return (
    <ParentCard title="Snackbar Notification Examples">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Try different notification types:
        </Typography>
        
        <Stack spacing={2} direction="row" flexWrap="wrap" gap={2}>
          <Button variant="contained" color="success" onClick={handleSuccess}>
            Success Notification
          </Button>
          
          <Button variant="contained" color="error" onClick={handleError}>
            Error Notification
          </Button>
          
          <Button variant="contained" color="warning" onClick={handleWarning}>
            Warning Notification
          </Button>
          
          <Button variant="contained" color="info" onClick={handleInfo}>
            Info Notification
          </Button>
          
          <Button variant="outlined" onClick={handleCustom}>
            Custom Notification
          </Button>
          
          <Button variant="outlined" onClick={handleSweetAlertStyle}>
            SweetAlert Style
          </Button>
          
          <Button variant="outlined" onClick={handleMultiple}>
            Multiple Notifications
          </Button>
        </Stack>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Usage Examples:
          </Typography>
          
          <Box component="pre" sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
{`// Import the hook
import { useNotification } from '../../hooks/useNotification';

// In your component
const notify = useNotification();

// Basic usage
notify.success('Operation successful!');
notify.error('Something went wrong!');
notify.warning('Please be careful!');
notify.info('Here is some info');

// With title
notify.success('Operation completed successfully!', 'Success');

// Custom options
notify.custom('Custom message', {
  severity: 'success',
  title: 'Custom Title',
  duration: 10000
});

// SweetAlert-like API (for easy migration)
notify.fire('Success', 'Package created successfully', 'success');`}
          </Box>
        </Box>
      </Box>
    </ParentCard>
  );
};

export default SnackbarExample;
