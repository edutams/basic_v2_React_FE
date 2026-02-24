import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Button, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';

const UpgradePlanModal = ({ open, onClose, selectedRow, onUpgrade, isLoading = false }) => {
  const [form, setForm] = useState({
    studentpopulation: '',
    availableplan: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedRow) {
      const planDetails = selectedRow.plandetails || '';
      const planMatch = planDetails.match(/^(OBASIC\+*)\s*\(([^)]+)\)/);
      const currentPlan = planMatch ? planMatch[1] : '';
      const currentPopulation = planMatch ? planMatch[2] : '';

      setForm({
        studentpopulation: currentPopulation,
        availableplan: currentPlan,
      });
    }
  }, [selectedRow]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.studentpopulation) {
      newErrors.studentpopulation = 'Student population is required';
    }
    if (!form.availableplan) {
      newErrors.availableplan = 'Plan is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const planDetails = `${form.availableplan} (${form.studentpopulation})`;

      const upgradedData = {
        ...selectedRow,
        plandetails: planDetails,
        studentpopulation: form.studentpopulation,
        availableplan: form.availableplan,
      };

      onUpgrade(upgradedData);
      onClose();
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Upgrade Plan"
      size="small"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box component="form" onSubmit={handleSubmit}>
        {selectedRow && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Current Plan: {selectedRow.plandetails}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Student Population"
          name="studentpopulation"
          value={form.studentpopulation}
          onChange={handleChange}
          margin="normal"
          error={!!errors.studentpopulation}
          helperText={errors.studentpopulation}
          select
        >
          <MenuItem value="">Select Student Population</MenuItem>
          <MenuItem value="1-50">1-50 Students</MenuItem>
          <MenuItem value="51-100">51-100 Students</MenuItem>
          <MenuItem value="101-200">101-200 Students</MenuItem>
          <MenuItem value="200 and above Students">200 and above Students</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Available Plan"
          name="availableplan"
          value={form.availableplan}
          onChange={handleChange}
          margin="normal"
          error={!!errors.availableplan}
          helperText={errors.availableplan}
          select
        >
          <MenuItem value="">Select Plan</MenuItem>
          <MenuItem value="OBASIC">OBASIC</MenuItem>
          <MenuItem value="OBASIC+">OBASIC+</MenuItem>
          <MenuItem value="OBASIC++">OBASIC++</MenuItem>
        </TextField>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button sx={{ mr: 1 }} color="inherit" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? 'Upgrading...' : 'Upgrade Plan'}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

UpgradePlanModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  onUpgrade: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default UpgradePlanModal;
