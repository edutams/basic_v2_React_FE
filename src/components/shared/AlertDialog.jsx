import React from 'react';
import { Button, Box, Alert, AlertTitle } from '@mui/material';
import ReusableDialog from './ReusableDialog';
import PropTypes from 'prop-types';

const AlertDialog = ({
  open,
  onClose,
  title,
  message,
  severity = 'info', 
  showIcon = true,
  variant = 'standard', 
  buttonText = 'OK',
  buttonColor = 'primary',
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
    <Button
      onClick={onClose}
      color={buttonColor}
      variant="contained"
      autoFocus
    >
      {buttonText}
    </Button>
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
