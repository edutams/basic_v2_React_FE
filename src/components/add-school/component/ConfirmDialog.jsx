import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          width: { xs: '90%', sm: 400 },
        }}
      >
      
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Divider sx={{ my: 2 }} />

       
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 100 }} />
        </Box>

        
        <Typography sx={{ textAlign: 'center', mb: 2 }}>{message}</Typography>

        

       
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={onClose}>
            No, Exit
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm}>
            Yes, Continue
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ConfirmDialog;
