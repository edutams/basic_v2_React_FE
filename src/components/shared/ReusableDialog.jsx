import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

const ReusableDialog = ({
  open,
  onClose,
  title,
  content,
  contentText,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  dividers = false,
  scroll = 'paper',
  disableEscapeKeyDown = false,
  ...dialogProps
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll={scroll}
      disableEscapeKeyDown={disableEscapeKeyDown}
      {...dialogProps}
    >
      {/* Title Section */}
      {title && (
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            {showCloseButton && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      {/* Content Section */}
      <DialogContent dividers={dividers}>
        {contentText && (
          <DialogContentText sx={{ mb: content || children ? 2 : 0 }}>
            {contentText}
          </DialogContentText>
        )}
        {content && (
          <Box>{content}</Box>
        )}
        {children}
      </DialogContent>

      {/* Actions Section */}
      {actions && (
        <DialogActions sx={{ p: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

ReusableDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  content: PropTypes.node,
  contentText: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullWidth: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  dividers: PropTypes.bool,
  scroll: PropTypes.oneOf(['body', 'paper']),
  disableEscapeKeyDown: PropTypes.bool,
};

export default ReusableDialog;
