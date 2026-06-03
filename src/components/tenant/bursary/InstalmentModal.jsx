import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const InstalmentModal = ({ open, onClose, onSave, instalment }) => {
  const [formData, setFormData] = useState({
    inst1: '',
    inst2: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (instalment) {
      const parts = instalment.options.split(':').map((p) => p.trim());
      setFormData({
        inst1: parts[0] || '',
        inst2: parts[1] || '',
        status: instalment.status || 'active',
      });
    } else {
      setFormData({
        inst1: '',
        inst2: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [instalment, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    // Only allow numbers
    if (field === 'inst1' || field === 'inst2') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const inst1Num = parseInt(formData.inst1, 10);
    const inst2Num = parseInt(formData.inst2, 10);

    if (!formData.inst1) {
      newErrors.inst1 = 'First instalment is required';
    } else if (inst1Num < 0 || inst1Num > 100) {
      newErrors.inst1 = 'Must be between 0 and 100';
    }

    if (!formData.inst2) {
      newErrors.inst2 = 'Second instalment is required';
    } else if (inst2Num < 0 || inst2Num > 100) {
      newErrors.inst2 = 'Must be between 0 and 100';
    }

    if (!newErrors.inst1 && !newErrors.inst2 && inst1Num + inst2Num !== 100) {
      newErrors.general = 'Instalment percentages must add up to 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const instalmentData = {
        options: `${formData.inst1} : ${formData.inst2}`,
        status: formData.status,
      };
      onSave(instalmentData);
      onClose();
    }
  };

  const total = (parseInt(formData.inst1, 10) || 0) + (parseInt(formData.inst2, 10) || 0);

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={instalment ? 'Edit Instalment Plan' : 'Add Instalment Plan'}
      size="medium"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        {errors.general && <Alert severity="error">{errors.general}</Alert>}

        <Box>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Define the percentage split for the instalment plan. Both values must add up to 100%.
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={5}>
              <TextField
                label="First Instalment (%)"
                fullWidth
                value={formData.inst1}
                onChange={handleChange('inst1')}
                error={!!errors.inst1}
                helperText={errors.inst1}
                placeholder="e.g., 60"
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid item xs={2}>
              <Typography align="center" variant="h5" color="textSecondary">
                :
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Second Instalment (%)"
                fullWidth
                value={formData.inst2}
                onChange={handleChange('inst2')}
                error={!!errors.inst2}
                helperText={errors.inst2}
                placeholder="e.g., 40"
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: total === 100 ? 'success.light' : 'warning.light',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Total: {total}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {total === 100
                ? '✓ Perfect! This adds up to 100%'
                : `${total < 100 ? 'Add' : 'Reduce'} ${Math.abs(100 - total)}% to reach 100%`}
            </Typography>
          </Box>
        </Box>

        <TextField
          select
          label="Status"
          fullWidth
          value={formData.status}
          onChange={handleChange('status')}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
            {instalment ? 'Update' : 'Add'} Plan
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

InstalmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  instalment: PropTypes.object,
};

export default InstalmentModal;
