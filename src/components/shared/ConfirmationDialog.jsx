import React from 'react';
import { Button, Box } from '@mui/material';
import ReusableDialog from './ReusableDialog'; // Adjust path
import PropTypes from 'prop-types';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  confirmVariant = 'contained',
  cancelColor = 'inherit',
  cancelVariant = 'outlined',
  severity = 'info',
  maxWidth = 'xs',
  ...dialogProps
}) => {
  console.log('ConfirmationDialog rendered, open:', open); // Debugging
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return confirmColor;
    }
  };

  const actions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        onClick={onClose}
        color={cancelColor}
        variant={cancelVariant}
      >
        {cancelText}
      </Button>
      <Button
        onClick={handleConfirm}
        color={getSeverityColor()}
        variant={confirmVariant}
        autoFocus
      >
        {confirmText}
      </Button>
    </Box>
  );

  return (
    <ReusableDialog
      open={open}
      onClose={onClose}
      title={title}
      contentText={message}
      actions={actions}
      maxWidth={maxWidth}
      {...dialogProps}
    />
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.string,
  confirmVariant: PropTypes.string,
  cancelColor: PropTypes.string,
  cancelVariant: PropTypes.string,
  severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
};

export default ConfirmationDialog;