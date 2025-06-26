import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

const getModalStyle = (size = 'medium', customStyle = {}) => {
  const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 2,
  };

  const sizeStyles = {
    small: {
      width: '90%',
      maxWidth: 400,
    },
    medium: {
      width: '90%',
      maxWidth: 600,
    },
    large: {
      width: '90%',
      maxWidth: 800,
    },
    extraLarge: {
      width: '95%',
      maxWidth: 1000,
    },
    custom: customStyle,
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
  };
};

const ReusableModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  customStyle = {},
  showCloseButton = true,
  showDivider = true,
  keepMounted = true,
  disableEnforceFocus = false,
  disableAutoFocus = false,
  ...modalProps
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      keepMounted={keepMounted}
      disableEnforceFocus={disableEnforceFocus}
      disableAutoFocus={disableAutoFocus}
      {...modalProps}
    >
      <Box sx={getModalStyle(size, customStyle)}>
        {/* Close Button */}
        {showCloseButton && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Header Section */}
        {(title || subtitle) && (
          <>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" mb={1}>
                {subtitle}
              </Typography>
            )}
            {title && (
              <Typography variant="h6" mb={showDivider ? 2 : 3}>
                {title}
              </Typography>
            )}
            {showDivider && <Divider sx={{ mb: 2 }} />}
          </>
        )}

        {/* Content */}
        {children}
      </Box>
    </Modal>
  );
};

ReusableModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'extraLarge', 'custom']),
  customStyle: PropTypes.object,
  showCloseButton: PropTypes.bool,
  showDivider: PropTypes.bool,
  keepMounted: PropTypes.bool,
  disableEnforceFocus: PropTypes.bool,
  disableAutoFocus: PropTypes.bool,
};

export default ReusableModal;
