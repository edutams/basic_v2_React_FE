import React from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableDialog from './ReusableDialog';
import PrimaryButton from './PrimaryButton';

const AlertDialog = ({
  open,
  onClose,
  title,
  message,
  severity = 'info', 
  showIcon = true,
  variant = 'standard', 
  buttonText = 'OK',
  maxWidth = 'sm',
  ...dialogProps
}) => {
  const content = (
    <Alert 
      severity={severity} 
      variant={variant}
      icon={showIcon}
      sx={{ mb: 0 }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );

  const actions = (
    <Box sx={{ p: 1 }}>
      <PrimaryButton
        onClick={onClose}
        variant="primary"
        autoFocus
        fullWidth
      >
        {buttonText}
      </PrimaryButton>
    </Box>
  );

  return (
    <ReusableDialog
      open={open}
      onClose={onClose}
      content={content}
      actions={actions}
      maxWidth={maxWidth}
      showCloseButton={false}
      {...dialogProps}
    />
  );
};

AlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  showIcon: PropTypes.bool,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  buttonText: PropTypes.string,
  buttonColor: PropTypes.string,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
};

export default AlertDialog;
