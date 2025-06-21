import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

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
          width: { xs: '90%', sm: 400, lg: 600, },
        }}
      >
        {/* Close icon */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* Warning icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 60 }} />
        </Box>

        {/* Message section - supports both string and JSX */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {typeof message === 'string' ? (
            message.split('\n').map((line, idx) => (
              <Typography key={idx} variant={idx === 0 ? 'h6' : 'body2'}>
                {line}
              </Typography>
            ))
          ) : (
            message
          )}
        </Box>

        {/* Action buttons */}
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
