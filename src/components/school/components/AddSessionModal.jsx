import React, { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import PropTypes from 'prop-types';

const AddSessionModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'INACTIVE'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newSession = {
      id: Date.now(),
      name: formData.name,
      status: formData.status
    };
    
    onSubmit(newSession);
    setFormData({ name: '', status: 'INACTIVE' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', status: 'INACTIVE' });
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title="Add New Session"
      size="small"
      disableEnforceFocus
      disableAutoFocus
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="name"
            label="Session Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., 2024/2025"
          />
          
          <TextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Session
            </Button>
          </Box>
        </Box>
      </form>
    </ReusableModal>
  );
};

AddSessionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AddSessionModal;
