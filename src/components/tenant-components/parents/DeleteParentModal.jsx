import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const DeleteParentModal = ({ open, onClose, parent, onConfirm }) => {
  const name = parent?.user
    ? `${parent.user.fname} ${parent.user.lname}`
    : 'this parent';

  return (
    <ReusableModal open={open} onClose={onClose} title="Delete Parent" size="small">
      <Typography sx={{ mb: 3 }}>
        Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
      </Typography>
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>Delete</Button>
      </Box>
    </ReusableModal>
  );
};

DeleteParentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  parent: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteParentModal;
