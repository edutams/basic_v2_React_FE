import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableDialog from './ReusableDialog';
import PrimaryButton from './PrimaryButton';

const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
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
    <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
      <PrimaryButton
        onClick={onClose}
        variant="secondary"
      >
        {cancelText}
      </PrimaryButton>
      <PrimaryButton
        type="submit"
        form="form-dialog-form"
        variant="primary"
        disabled={submitDisabled}
      >
        {submitText}
      </PrimaryButton>
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
