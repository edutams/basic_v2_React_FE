import React from 'react';
import { Button, Box } from '@mui/material';
import ReusableDialog from './ReusableDialog';
import PropTypes from 'prop-types';

const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitColor = 'primary',
  submitVariant = 'contained',
  cancelColor = 'inherit',
  cancelVariant = 'outlined',
  submitDisabled = false,
  maxWidth = 'sm',
  dividers = true,
  ...dialogProps
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
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
        type="submit"
        form="form-dialog-form"
        color={submitColor}
        variant={submitVariant}
        disabled={submitDisabled}
      >
        {submitText}
      </Button>
    </Box>
  );

  const content = (
    <Box component="form" id="form-dialog-form" onSubmit={handleSubmit}>
      {children}
    </Box>
  );

  return (
    <ReusableDialog
      open={open}
      onClose={onClose}
      title={title}
      content={content}
      actions={actions}
      maxWidth={maxWidth}
      dividers={dividers}
      {...dialogProps}
    />
  );
};

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  submitColor: PropTypes.string,
  submitVariant: PropTypes.string,
  cancelColor: PropTypes.string,
  cancelVariant: PropTypes.string,
  submitDisabled: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  dividers: PropTypes.bool,
};

export default FormDialog;
