import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Paper,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const ManageTenantDomain = ({ open, onClose, domainData = [] }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      keepMounted
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Manage Tenant Domain
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            bgcolor: '#e6f3ff',
            p: 2,
            borderRadius: 1,
            fontFamily: 'monospace',
          }}
        >
          <Typography sx={{ mb: 1 }}>
            Here we can add other domain for the tenant and also we can do domain masking here.
            <br />
            This current domain for this tenant is
          </Typography>

          <Paper
            elevation={2}
            sx={{
              bgcolor: '#f5f5f5',
              color: '#d32f2f',
              p: 2,
              mt: 1,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(domainData, null, 2)}
          </Paper>
        </Box>
      </Box>
    </Modal>
  );
};

export default ManageTenantDomain;
