import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import { fetchClasses, batchUpsertPaymentSchedule, getBursaryInstalmentSetting, fetchInstallments } from '@/api/tenant/bursary/bursarySettingsApi';

const EditPaymentItemModal = ({ open, onClose, onSave, schedule, sessionTermId, categoryId }) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    paymentType: 'compulsory',
    selectedClasses: [],
    classAmounts: {},
    classInstallments: {}, // Store installment selections per class
  });

  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instalmentCheck, setInstalmentCheck] = useState(null);
  

  // Fetch classes from API when modal opens
  useEffect(() => {
    if (open) {
      const loadClasses = async () => {
        try {
          setLoadingClasses(true);
          const response = await fetchClasses();
          if (response?.data) {
            const classList = Array.isArray(response.data) 
              ? response.data.map(cls => ({
                  id: cls.id,
                  name: cls.class_name
                }))
              : [];
            setClasses(classList);
          }
        } catch (err) {
          console.error('Failed to fetch classes:', err);
          setClasses([]);
        } finally {
          setLoadingClasses(false);
        }
      };
      loadClasses();
    }
  }, [open]);

  // Fetch installment setting and installments
  useEffect(() => {
    if (open) {
      const loadBursaryData = async () => {
        try {
          // Fetch installment setting
          const settingResponse = await getBursaryInstalmentSetting();
          console.log('Installment setting:', settingResponse);
          setInstalmentCheck(settingResponse);
          
          // Fetch installments if setting is 'percentage'
          if (settingResponse === 'percentage') {
            const installmentsResponse = await fetchInstallments();
            if (installmentsResponse?.data) {
              setInstallments(Array.isArray(installmentsResponse.data) ? installmentsResponse.data : []);
            }
          }
        } catch (err) {
          console.error('Failed to fetch bursary data:', err);
        }
      };
      loadBursaryData();
    }
  }, [open]);

  useEffect(() => {
    if (open && schedule) {
      const amounts = {};
      const selected = [];
      const installmentSelections = {};
      
      if (schedule.classes) {
        schedule.classes.forEach((cls) => {
          selected.push(cls.id);
          if (cls.amount && cls.amount > 0) {
            amounts[cls.id] = cls.amount;
          }
          // Pre-populate installment if exists
          if (cls.installment_id) {
            installmentSelections[cls.id] = cls.installment_id;
          }
        });
      }

      setFormData({
        paymentName: schedule.payment_name?.name || schedule.paymentName || '',
        paymentType: 'compulsory',
        selectedClasses: selected,
        classAmounts: amounts,
        classInstallments: installmentSelections,
      });
      setErrors({});
    }
  }, [open, schedule]);

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

  const handleInstallmentChange = (classId, installmentId) => {
    setFormData((prev) => ({
      ...prev,
      classInstallments: {
        ...prev.classInstallments,
        [classId]: installmentId,
      },
    }));
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

  const handleSubmit = async () => {
    if (validate()) {
      try {
        setSaving(true);
        
        // Prepare data for API
        const classesData = formData.selectedClasses
          .filter(classId => formData.classAmounts[classId] && formData.classAmounts[classId] > 0)
          .map(classId => ({
            class_id: classId,
            amount: parseFloat(formData.classAmounts[classId]),
            ...(instalmentCheck === 'percentage' && formData.classInstallments[classId] && {
              bursary_installment_id: formData.classInstallments[classId]
            })
          }));

        if (classesData.length === 0) {
          setErrors({ selectedClasses: 'Please set amounts for at least one class' });
          setSaving(false);
          return;
        }

        const payload = {
          bursary_payment_name_id: schedule.payment_name?.id,
          session_term_id: sessionTermId,
          bursary_payment_category_id: categoryId,
          classes: classesData
        };

        console.log('Submitting payment schedule:', payload);

        const response = await batchUpsertPaymentSchedule(payload);
        
        if (response.success) {
          onSave(formData);
          onClose();
        } else {
          setErrors({ submit: response.message || 'Failed to save payment schedule' });
        }
      } catch (err) {
        console.error('Failed to save payment schedule:', err);
        setErrors({ submit: err.response?.data?.message || 'Failed to save payment schedule' });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`2025/2026 - Third Term (Returning Student Category) ${schedule?.payment_name?.name || schedule?.paymentName || 'Payment Schedule'}`}
      subtitle="Update payment item details and class selection"
      size="large"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        <Alert severity="info">
          {instalmentCheck === 'percentage' 
            ? 'Edit the payment amounts and installments for each class or add/remove classes from this payment schedule.'
            : 'You cannot attach Installment percentage to this fee because your present bursary settings is to pay on amount available.'}
        </Alert>
        {formData.selectedClasses.length === 0 && (
          <Alert severity="warning">No classes selected for this payment item</Alert>
        )}

        {loadingClasses ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
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
                    <TableCell sx={{ fontWeight: 600 }}>Amount (NGN)</TableCell>
                    {instalmentCheck === 'percentage' && (
                      <TableCell sx={{ fontWeight: 600 }}>Installment</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes && classes.length > 0 ? (
                    classes.map((cls) => {
                      const isSelected = formData.selectedClasses.includes(cls.id);
                      const amount = formData.classAmounts[cls.id] || '';
                      const selectedInstallment = formData.classInstallments[cls.id] || '';
                      
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
                              placeholder="Enter amount"
                              value={amount}
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
                              slotProps={{
                                htmlInput: { min: 0 },
                                input: {
                                  startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                                }
                              }}
                              sx={{ width: '100%', maxWidth: 200 }}
                            />
                          </TableCell>

                          {instalmentCheck === 'percentage' && (
                            <TableCell sx={{ opacity: isSelected ? 1 : 0.5 }}>
                              <FormControl size="small" fullWidth sx={{ maxWidth: 250 }}>
                                <Select
                                  value={selectedInstallment}
                                  onChange={(e) => handleInstallmentChange(cls.id, e.target.value)}
                                  disabled={!isSelected}
                                  displayEmpty
                                >
                                  <MenuItem value="">
                                    <em>--Choose Installment--</em>
                                  </MenuItem>
                                  {installments.map((inst) => (
                                    <MenuItem key={inst.id} value={inst.id}>
                                      {inst.inst1} : {inst.inst2}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                          )}

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              color={isSelected ? 'success' : 'default'}
                              onClick={() => handleClassToggle(cls.id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              {isSelected ? 'Active' : 'Inactive'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={instalmentCheck === 'percentage' ? 4 : 3} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          No classes available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {errors.selectedClasses && (
              <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                {errors.selectedClasses}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            sx={{ fontWeight: 600 }} 
            disabled={loadingClasses || saving}
          >
            {saving ? 'Saving...' : 'Update Payment Schedule'}
          </Button>
        </Stack>
        
        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Alert>
        )}
      </Stack>
    </ReusableModal>
  );
};

EditPaymentItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  schedule: PropTypes.object,
  sessionTermId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default EditPaymentItemModal;
