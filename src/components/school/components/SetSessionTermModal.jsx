import React, { useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import PropTypes from 'prop-types';

const SetSessionTermModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    session: '',
    term: '',
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
    
    const newSessionTerm = {
      id: Date.now(),
      sessionTerm: `${formData.session} - ${formData.term}`,
      session: formData.session,
      term: formData.term,
      status: formData.status
    };
    
    onSubmit(newSessionTerm);
    setFormData({ session: '', term: '', status: 'INACTIVE' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ session: '', term: '', status: 'INACTIVE' });
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title="Set Session/Term"
      size="small"
      disableEnforceFocus
      disableAutoFocus
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
          <TextField
            name="session"
            label="Session"
            value={formData.session}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., 2024/2025"
          />
          
          <TextField
            name="term"
            label="Term"
            value={formData.term}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., First Term"
          />
          
          <TextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Set Session/Term
            </Button>
          </Box>
        </Box>
      </form>
    </ReusableModal>
  );
};

SetSessionTermModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SetSessionTermModal;