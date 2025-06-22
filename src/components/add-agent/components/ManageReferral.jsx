import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 3,
};

const containerStyle = {
  bgcolor: '#e3f2fd',
  borderRadius: 1,
  p: 2,
  mt: 2,
};

const ManageReferralModal = ({ selectedAgent, onSave, onClose }) => {
  const [selectedReferrer, setSelectedReferrer] = useState('');
  const [currentReferrer, setCurrentReferrer] = useState('');

  const availableReferrers = [
    'Crownbirth Limited',
    'Digital Solutions',
  ];

  useEffect(() => {
    if (selectedAgent) {
      const ref = selectedAgent.referrerName || 'Crownbirth Limited';
      setCurrentReferrer(ref);
      setSelectedReferrer(ref);
    }
  }, [selectedAgent]);

  const handleChange = (e) => {
    setSelectedReferrer(e.target.value);
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave({
        ...selectedAgent,
        referrerName: selectedReferrer,
      });
    }
    onClose();
  };

  return (
    <Box>

        <Typography variant="subtitle1" fontWeight="500">
          Current Referrer: <strong>{currentReferrer}</strong>
        </Typography>

        <Box sx={containerStyle}>
          <FormControl fullWidth>
            <InputLabel>Referrer</InputLabel>
            <Select
              value={selectedReferrer}
              label="Referrer"
              onChange={handleChange}
            >
              {availableReferrers.map((ref, i) => (
                <MenuItem key={i} value={ref}>
                  {ref}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button onClick={onClose} >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#f9a825', color: '#fff', '&:hover': { bgcolor: '#f57f17' } }}
          >
            Set Referrer
          </Button>
        </Box>
    </Box>
  );
};

export default ManageReferralModal;
