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
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Security as ShieldIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  fetchClasses,
  batchUpsertPaymentSchedule,
  getBursaryInstalmentSetting,
  fetchInstallments,
  deletePaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';

const EditPaymentItemModal = ({
  open,
  onClose,
  onSave,
  schedule,
  sessionId,
  termId,
  categoryId,
  onRefresh,
}) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    paymentType: 'compulsory',
    selectedClasses: [],
    classAmounts: {},
    classInstallments: {}, // Store installment selections per class
    classScheduleIds: {}, // Store schedule IDs for existing schedules
  });

  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instalmentCheck, setInstalmentCheck] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    classSchedule: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null);
  const [selectedRowClass, setSelectedRowClass] = useState(null);
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    classData: null,
  });
  const [toggling, setToggling] = useState(false);

  // Fetch classes from API when modal opens
  useEffect(() => {
    if (open) {
      const loadClasses = async () => {
        try {
          setLoadingClasses(true);
          const response = await fetchClasses();
          if (response?.data) {
            const classList = Array.isArray(response.data)
              ? response.data.map((cls) => ({
                  id: cls.id,
                  name: cls.class_name,
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
              setInstallments(
                Array.isArray(installmentsResponse.data) ? installmentsResponse.data : [],
              );
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
      const scheduleIds = {};
      console.log(schedule.classes, 6666);

      if (schedule.classes) {
        schedule.classes.forEach((cls) => {
          selected.push(cls.id);
          if (cls.amount && cls.amount > 0) {
            amounts[cls.id] = cls.amount;
          }
          // Pre-populate installment if exists
          if (cls.bursary_installment_id) {
            installmentSelections[cls.id] = cls.bursary_installment_id;
          }
          // Store schedule_id for existing schedules
          if (cls.schedule_id) {
            scheduleIds[cls.id] = cls.schedule_id;
          }
        });
      }

      setFormData({
        paymentName: schedule.payment_name?.name || schedule.paymentName || '',
        paymentType: 'compulsory',
        selectedClasses: selected,
        classAmounts: amounts,
        classInstallments: installmentSelections,
        classScheduleIds: scheduleIds,
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

  const handleRowMenuOpen = (event, classData, classScheduleData) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setSelectedRowClass({ ...classData, scheduleData: classScheduleData });
  };

  const handleRowMenuClose = () => {
    setRowMenuAnchor(null);
    setSelectedRowClass(null);
  };

  const handleToggleClick = () => {
    handleRowMenuClose();
    setToggleDialog({
      open: true,
      classData: selectedRowClass,
    });
  };

  const handleDeleteClick = () => {
    handleRowMenuClose();
    setDeleteDialog({
      open: true,
      classSchedule: selectedRowClass?.scheduleData,
    });
  };

  const handleToggleConfirm = async () => {
    if (!toggleDialog.classData) return;

    try {
      setToggling(true);
      const classId = toggleDialog.classData.id;
      const isCurrentlySelected = formData.selectedClasses.includes(classId);

      // Toggle the selection
      handleClassToggle(classId);

      // Show success message
      const action = isCurrentlySelected ? 'deactivated' : 'activated';

      // Close dialog after a short delay to show the change
      setTimeout(() => {
        setToggleDialog({ open: false, classData: null });
        // Optionally refresh parent component
        if (onRefresh) {
          onRefresh();
        }
      }, 300);
    } catch (err) {
      console.error('Failed to toggle class:', err);
      setErrors({
        submit: err.response?.data?.message || 'Failed to toggle class status',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.classSchedule?.schedule_id) {
      setErrors({ submit: 'Invalid schedule ID' });
      return;
    }

    try {
      setDeleting(true);
      const response = await deletePaymentSchedule(deleteDialog.classSchedule.schedule_id);

      if (response.success) {
        // Remove the class from formData
        setFormData((prev) => ({
          ...prev,
          selectedClasses: prev.selectedClasses.filter(
            (id) => id !== deleteDialog.classSchedule.id,
          ),
          classAmounts: {
            ...prev.classAmounts,
            [deleteDialog.classSchedule.id]: undefined,
          },
          classInstallments: {
            ...prev.classInstallments,
            [deleteDialog.classSchedule.id]: undefined,
          },
        }));

        // Trigger refresh in parent component
        if (onRefresh) {
          onRefresh();
        }

        setDeleteDialog({ open: false, classSchedule: null });
      } else {
        setErrors({ submit: response.message || 'Failed to delete class schedule' });
      }
    } catch (err) {
      console.error('Failed to delete class schedule:', err);
      setErrors({
        submit: err.response?.data?.message || 'Failed to delete class schedule',
      });
    } finally {
      setDeleting(false);
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

    // Validate that all activated classes have amounts
    const activatedClassesWithoutAmounts = formData.selectedClasses.filter(
      (classId) => !formData.classAmounts[classId] || formData.classAmounts[classId] <= 0,
    );

    if (activatedClassesWithoutAmounts.length > 0) {
      newErrors.selectedClasses = 'Please set amounts for all activated classes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        setSaving(true);

        // Prepare data for API - now including schedule_id for existing records
        const classesData = formData.selectedClasses
          .filter((classId) => formData.classAmounts[classId] && formData.classAmounts[classId] > 0)
          .map((classId) => ({
            class_id: classId,
            amount: parseFloat(formData.classAmounts[classId]),
            ...(formData.classScheduleIds[classId] && {
              schedule_id: formData.classScheduleIds[classId],
            }),
            ...(instalmentCheck === 'percentage' &&
              formData.classInstallments[classId] && {
                bursary_installment_id: formData.classInstallments[classId],
              }),
          }));

        if (classesData.length === 0) {
          setErrors({ selectedClasses: 'Please set amounts for at least one class' });
          setSaving(false);
          return;
        }

        const payload = {
          bursary_payment_name_id: schedule.payment_name?.id,
          session_id: sessionId,
          term_id: termId,
          bursary_payment_category_id: categoryId,
          classes: classesData,
        };

        console.log('Submitting payment schedule:', payload);

        const response = await batchUpsertPaymentSchedule(payload);

        if (response.success) {
          onSave(formData);
          // Trigger refresh in parent component
          if (onRefresh) {
            onRefresh();
          }
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
      title={`Update Payment Schedule for (${schedule?.payment_name?.name || schedule?.paymentName})`}
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
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes && classes.length > 0 ? (
                    classes.map((cls) => {
                      const isSelected = formData.selectedClasses.includes(cls.id);
                      const amount = formData.classAmounts[cls.id] || '';
                      const selectedInstallment = formData.classInstallments[cls.id] || '';

                      // Find the schedule data for this class
                      const classScheduleData = schedule?.classes?.find(
                        (schedClass) => schedClass.id === cls.id,
                      );

                      return (
                        <TableRow
                          key={cls.id}
                          hover
                          sx={{
                            bgcolor: isSelected ? 'white' : '#f5f5f5',
                            borderLeft:
                              isSelected && (!amount || amount <= 0) ? '3px solid' : 'none',
                            borderColor: 'error.main',
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
                                // Clear error when user starts typing
                                if (errors.selectedClasses) {
                                  setErrors((prev) => ({ ...prev, selectedClasses: '' }));
                                }
                              }}
                              disabled={!isSelected}
                              error={isSelected && (!amount || amount <= 0)}
                              slotProps={{
                                htmlInput: { min: 0 },
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">₦</InputAdornment>
                                  ),
                                },
                              }}
                              sx={{ width: '100%', maxWidth: 200 }}
                            />
                            {isSelected && (!amount || amount <= 0) && (
                              <Typography
                                variant="caption"
                                color="error.main"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                Amount required
                              </Typography>
                            )}
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
                            {/* {isSelected && classScheduleData?.schedule_id && ( */}
                            <IconButton
                              size="small"
                              onClick={(e) => handleRowMenuOpen(e, cls, classScheduleData)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                            {/* )} */}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={instalmentCheck === 'percentage' ? 4 : 3}
                        align="center"
                        sx={{ py: 3 }}
                      >
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

      {/* Row Action Menu */}
      <Menu anchorEl={rowMenuAnchor} open={Boolean(rowMenuAnchor)} onClose={handleRowMenuClose}>
        <MenuOption onClick={handleToggleClick}>
          <ShieldIcon fontSize="small" sx={{ mr: 1 }} />
          {selectedRowClass && formData.selectedClasses.includes(selectedRowClass.id)
            ? 'Deactivate'
            : 'Activate'}
        </MenuOption>
        <MenuOption onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Class Schedule
        </MenuOption>
      </Menu>

      {/* Toggle Status Dialog */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => !toggling && setToggleDialog({ open: false, classData: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {toggleDialog.classData && formData.selectedClasses.includes(toggleDialog.classData.id)
            ? 'Deactivate Class'
            : 'Activate Class'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to{' '}
            <strong>
              {toggleDialog.classData &&
              formData.selectedClasses.includes(toggleDialog.classData.id)
                ? 'deactivate'
                : 'activate'}
            </strong>{' '}
            <strong>{toggleDialog.classData?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => setToggleDialog({ open: false, classData: null })}
            disabled={toggling}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleToggleConfirm}
            disabled={toggling}
            sx={{ fontWeight: 600 }}
          >
            {toggling ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleting && setDeleteDialog({ open: false, classSchedule: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Class Schedule</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete the payment schedule for{' '}
            <strong>{deleteDialog.classSchedule?.name}</strong>? The payment amount and installment
            settings for this class will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => setDeleteDialog({ open: false, classSchedule: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            sx={{ fontWeight: 600 }}
          >
            {deleting ? 'Deleting...' : 'Delete Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </ReusableModal>
  );
};

EditPaymentItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  schedule: PropTypes.object,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  termId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRefresh: PropTypes.func,
};

export default EditPaymentItemModal;
