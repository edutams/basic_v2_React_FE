import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const EditPaymentItemModal = ({ open, onClose, onSave, schedule }) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    paymentType: 'compulsory',
    selectedClasses: [],
  });

  const [errors, setErrors] = useState({});

  // Available classes
  const availableClasses = [
    { id: 'JSS1', name: 'JSS 1' },
    { id: 'JSS2', name: 'JSS 2' },
    { id: 'JSS3', name: 'JSS 3' },
    { id: 'SS1', name: 'SS 1' },
    { id: 'SS2', name: 'SS 2' },
    { id: 'SS3', name: 'SS 3' },
  ];

  useEffect(() => {
    if (open && schedule) {
      setFormData({
        paymentName: schedule.paymentName || '',
        paymentType: 'compulsory',
        selectedClasses: schedule.classes?.map((cls) => cls.id) || [],
      });
      setErrors({});
    }
  }, [open, schedule]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleClassToggle = (classId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedClasses.includes(classId);
      return {
        ...prev,
        selectedClasses: isSelected
          ? prev.selectedClasses.filter((id) => id !== classId)
          : [...prev.selectedClasses, classId],
      };
    });
    if (errors.selectedClasses) {
      setErrors((prev) => ({ ...prev, selectedClasses: '' }));
    }
  };

  const handleSelectAll = () => {
    if (formData.selectedClasses.length === availableClasses.length) {
      // Deselect all
      setFormData((prev) => ({ ...prev, selectedClasses: [] }));
    } else {
      // Select all
      setFormData((prev) => ({
        ...prev,
        selectedClasses: availableClasses.map((cls) => cls.id),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.paymentName.trim()) {
      newErrors.paymentName = 'Payment name is required';
    }

    if (formData.selectedClasses.length === 0) {
      newErrors.selectedClasses = 'Please select at least one class';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const allSelected = formData.selectedClasses.length === availableClasses.length;

  // Check which classes have payment data set
  const getClassStatus = (classId) => {
    const cls = schedule?.classes?.find((c) => c.id === classId);
    return cls && !cls.missing;
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Edit Payment Item"
      subtitle="Update payment item details and class selection"
      size="medium"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
          <Alert severity="info">
            You cannot attach Instalment percentage to this fee because your present bursary settings is to pay on amount available.
          </Alert>

        {/* <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" fontWeight={600}>
              Select Classes <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button size="small" onClick={handleSelectAll} variant="outlined">
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </Box>

          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: errors.selectedClasses ? 'error.main' : 'divider',
              borderRadius: 1,
              bgcolor: 'grey.50',
            }}
          >
            <Grid container spacing={1}>
              {availableClasses.map((cls) => {
                const isSelected = formData.selectedClasses.includes(cls.id);
                const hasPaymentData = getClassStatus(cls.id);
                return (
                  <Grid size={{ xs: 6, sm: 4 }} key={cls.id}>
                    <Box
                      onClick={() => handleClassToggle(cls.id)}
                      sx={{
                        p: 1.5,
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.lighter' : 'white',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: isSelected ? 'primary.lighter' : 'grey.50',
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleClassToggle(cls.id)}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {cls.name}
                            </Typography>
                            {hasPaymentData && (
                              <Typography variant="caption" color="success.main">
                                ✓ Has data
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {errors.selectedClasses && (
            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
              {errors.selectedClasses}
            </Typography>
          )}

          {formData.selectedClasses.length > 0 && (
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                Selected Classes ({formData.selectedClasses.length}):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.selectedClasses.map((classId) => {
                  const cls = availableClasses.find((c) => c.id === classId);
                  const hasPaymentData = getClassStatus(classId);
                  return (
                    <Chip
                      key={classId}
                      label={cls?.name}
                      size="small"
                      onDelete={() => handleClassToggle(classId)}
                      color={hasPaymentData ? 'success' : 'primary'}
                      icon={
                        hasPaymentData ? (
                          <Typography component="span" sx={{ fontSize: 14 }}>
                            ✓
                          </Typography>
                        ) : undefined
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </Box> */}

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ fontWeight: 600 }}>
            Update Payment Item
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

EditPaymentItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  schedule: PropTypes.object,
};

export default EditPaymentItemModal;
