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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const EditPaymentItemModal = ({ open, onClose, onSave, schedule }) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    paymentType: 'compulsory',
    selectedClasses: [],
    classAmounts: {},
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
      const amounts = {};
      if (schedule.classes) {
        schedule.classes.forEach((cls) => {
          if (!cls.missing) amounts[cls.id] = cls.amount || '';
        });
      }

      setFormData({
        paymentName: schedule.paymentName || '',
        paymentType: 'compulsory',
        selectedClasses: schedule.classes?.map((cls) => cls.id) || [],
        classAmounts: amounts,
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
      setFormData((prev) => ({ ...prev, selectedClasses: [] }));
    } else {
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
      title={`2025/2026 - Third Term (Returning Student Category) ${schedule?.paymentName || 'JS School Fee'}`}
      subtitle="Update payment item details and class selection"
      size="medium"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        <Alert severity="info">
          You cannot attach Instalment percentage to this fee because your present bursary settings
          is to pay on amount available.
        </Alert>
        {formData.selectedClasses.length === 0 && (
          <Alert severity="warning">You are yet to set Payment for all classes</Alert>
        )}

        <Box>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderColor: errors.selectedClasses ? 'error.main' : 'divider' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableClasses.map((cls) => {
                  const isSelected = formData.selectedClasses.includes(cls.id);
                  return (
                    <TableRow
                      key={cls.id}
                      hover
                      sx={{
                        bgcolor: isSelected ? 'white' : '#f5f5f5',
                      }}
                    >
                      <TableCell sx={{ opacity: isSelected ? 1 : 0.5 }}>
                        <Chip
                          label={cls.name}
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell sx={{ opacity: isSelected ? 1 : 0.5 }}>
                        <TextField
                          type="number"
                          size="small"
                          inputProps={{ min: 0 }}
                          placeholder="Amount"
                          value={formData.classAmounts[cls.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              classAmounts: {
                                ...prev.classAmounts,
                                [cls.id]: val,
                              },
                              selectedClasses:
                                val && !isSelected
                                  ? [...new Set([...prev.selectedClasses, cls.id])]
                                  : prev.selectedClasses,
                            }));
                          }}
                          disabled={!isSelected}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                          }}
                          sx={{ width: '100%', maxWidth: 200 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant={isSelected ? 'outlined' : 'contained'}
                          color={isSelected ? 'error' : 'primary'}
                          onClick={() => handleClassToggle(cls.id)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          {isSelected ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {errors.selectedClasses && (
            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
              {errors.selectedClasses}
            </Typography>
          )}
        </Box>

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
