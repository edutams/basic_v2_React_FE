import React from 'react';
import { Box, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableDialog from './ReusableDialog';
import PrimaryButton from './PrimaryButton';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info',
  maxWidth = 'xs',
  ...dialogProps
}) => {
  const theme = useTheme();
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const actions = (
    <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
      <PrimaryButton
        onClick={onClose}
        variant="secondary"
      >
        {cancelText}
      </PrimaryButton>
      <PrimaryButton
        onClick={handleConfirm}
        variant="primary"
        autoFocus
        sx={{ 
          bgcolor: severity === 'error' ? theme.palette.error.main : theme.palette.warning.main,
          '&:hover': {
            bgcolor: severity === 'error' ? theme.palette.error.dark : theme.palette.warning.dark,
          }
        }}
      >
        {confirmText}
      </PrimaryButton>
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