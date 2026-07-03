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
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  fetchClasses,
  batchUpsertPaymentSchedule,
  deletePaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';

const EditOptionalPaymentModal = ({
  open,
  onClose,
  onSave,
  schedule,
  sessionId,
  termId,
  categoryId,
  onRefresh,
  showSnackbar,
}) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    selectedClasses: [],
    classOptions: {}, // Store options per class: { classId: [{ option_name, amount }] }
    classScheduleIds: {}, // Store schedule IDs for existing schedules
  });

  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null);
  const [selectedRowClass, setSelectedRowClass] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    classSchedule: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState({
    open: false,
    classData: null,
  });
  const [inlineWarnings, setInlineWarnings] = useState({});

  const showInlineWarning = (key, message) => {
    setInlineWarnings((prev) => ({ ...prev, [key]: message }));
    setTimeout(() => {
      setInlineWarnings((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 4000);
  };

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

  useEffect(() => {
    if (open && schedule) {
      const options = {};
      const selected = [];
      const scheduleIds = {};

      // Extract data from schedule
      if (schedule.payschedules) {
        schedule.payschedules.forEach((sched) => {
          const classId = sched.class_id;
          selected.push(classId);

          if (sched.id) {
            scheduleIds[classId] = sched.id;
          }

          if (sched.options && sched.options.length > 0) {
            options[classId] = sched.options.map((opt) => ({
              id: opt.id,
              option_name: opt.option_name,
              amount: opt.amount,
            }));
          } else {
            options[classId] = [];
          }
        });
      }

      setFormData({
        paymentName: schedule.name || '',
        selectedClasses: selected,
        classOptions: options,
        classScheduleIds: scheduleIds,
      });
      setErrors({});
    }
  }, [open, schedule]);

  const handleClassToggle = (classId) => {
    const isSelected = formData.selectedClasses.includes(classId);

    // If trying to deactivate (remove), check if there are options
    if (isSelected) {
      const options = formData.classOptions[classId] || [];
      const hasValidOptions =
        options.length > 0 && options.some((opt) => opt.option_name || opt.amount);

      if (hasValidOptions) {
        const className = classes.find((c) => c.id === classId)?.name || `Class ${classId}`;
        setDeactivateDialog({
          open: true,
          classData: { id: classId, name: className, options },
        });
        return;
      }
    }

    // Proceed with toggle (activation or deactivation without options)
    performClassToggle(classId);
  };

  const performClassToggle = (classId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedClasses.includes(classId);
      const newSelected = isSelected
        ? prev.selectedClasses.filter((id) => id !== classId)
        : [...prev.selectedClasses, classId];

      // Initialize options array for newly selected class
      const newOptions = { ...prev.classOptions };
      if (!isSelected && !newOptions[classId]) {
        newOptions[classId] = [];
      }

      return {
        ...prev,
        selectedClasses: newSelected,
        classOptions: newOptions,
      };
    });
    if (errors.selectedClasses) {
      setErrors((prev) => ({ ...prev, selectedClasses: '' }));
    }
  };

  const handleDeactivateConfirm = async () => {
    if (deactivateDialog.classData) {
      const classId = deactivateDialog.classData.id;
      const scheduleId = formData.classScheduleIds[classId];

      // If there's a schedule_id, delete it from the backend
      if (scheduleId) {
        try {
          const response = await deletePaymentSchedule(scheduleId);
          if (response.success) {
            performClassToggle(classId);
            setDeactivateDialog({ open: false, classData: null });

            if (onRefresh) {
              onRefresh();
            }
          } else {
            setErrors({ submit: response.message || 'Failed to deactivate class' });
          }
        } catch (err) {
          console.error('Failed to delete class schedule:', err);
          setErrors({
            submit: err.response?.data?.message || 'Failed to deactivate class',
          });
        }
      } else {
        // No schedule_id, just toggle locally
        performClassToggle(classId);
        setDeactivateDialog({ open: false, classData: null });
      }
    }
  };

  const handleAddOption = (classId) => {
    setFormData((prev) => ({
      ...prev,
      classOptions: {
        ...prev.classOptions,
        [classId]: [...(prev.classOptions[classId] || []), { option_name: '', amount: '' }],
      },
    }));
  };

  const handleRemoveOption = (classId, optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      classOptions: {
        ...prev.classOptions,
        [classId]: prev.classOptions[classId].filter((_, idx) => idx !== optionIndex),
      },
    }));
  };

  const handleOptionChange = (classId, optionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      classOptions: {
        ...prev.classOptions,
        [classId]: prev.classOptions[classId].map((opt, idx) =>
          idx === optionIndex ? { ...opt, [field]: value } : opt,
        ),
      },
    }));

    // Clear specific error
    if (errors[`${classId}_${optionIndex}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`${classId}_${optionIndex}_${field}`]: '' }));
    }
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
    const classId = selectedRowClass?.id;
    if (!classId) return;

    handleRowMenuClose();
    handleClassToggle(classId);
  };

  const handleDeleteClick = () => {
    handleRowMenuClose();
    setDeleteDialog({
      open: true,
      classSchedule: selectedRowClass?.scheduleData,
    });
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
          classOptions: {
            ...prev.classOptions,
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

    // Validate that all activated classes have at least one option with valid data
    formData.selectedClasses.forEach((classId) => {
      const options = formData.classOptions[classId] || [];

      if (options.length === 0) {
        newErrors[`class_${classId}`] = 'At least one option is required';
      } else {
        // Validate each option
        options.forEach((opt, idx) => {
          if (!opt.option_name || opt.option_name.trim() === '') {
            newErrors[`${classId}_${idx}_option_name`] = 'Option name required';
          }
          if (!opt.amount || parseFloat(opt.amount) <= 0) {
            newErrors[`${classId}_${idx}_amount`] = 'Amount required';
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        setSaving(true);

        const classesData = formData.selectedClasses
          .filter((classId) => {
            const options = formData.classOptions[classId] || [];
            return options.length > 0 && options.every((opt) => opt.option_name && opt.amount > 0);
          })
          .map((classId) => {
            const options = formData.classOptions[classId] || [];
            // Calculate total amount for this class as sum of all options
            const totalAmount = options.reduce((sum, opt) => sum + parseFloat(opt.amount || 0), 0);

            return {
              class_id: classId,
              amount: totalAmount,
              ...(formData.classScheduleIds[classId] && {
                schedule_id: formData.classScheduleIds[classId],
              }),
              options: options.map((opt) => ({
                option_name: opt.option_name,
                amount: parseFloat(opt.amount),
              })),
            };
          });

        if (classesData.length === 0) {
          setErrors({ selectedClasses: 'Please set valid options for at least one class' });
          setSaving(false);
          return;
        }

        const payload = {
          bursary_payment_name_id: schedule.id,
          session_id: sessionId,
          term_id: termId,
          bursary_payment_category_id: categoryId,
          classes: classesData,
        };

        console.log('Submitting optional payment schedule:', payload);

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
      title={`Optional Payment: ${schedule?.name || 'Payment Schedule'}`}
      subtitle="Manage payment options for each class"
      size="large"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        <Alert severity="info">
          Edit payment options for each class. Each class can have multiple pricing options (e.g.,
          different bag types, sizes, etc.).
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
                    <TableCell sx={{ fontWeight: 600 }}>Options</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: 80 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes && classes.length > 0 ? (
                    classes.map((cls) => {
                      const isSelected = formData.selectedClasses.includes(cls.id);
                      const options = formData.classOptions[cls.id] || [];
                      const classScheduleData = formData.classScheduleIds[cls.id]
                        ? {
                          id: cls.id,
                          name: cls.name,
                          schedule_id: formData.classScheduleIds[cls.id],
                        }
                        : null;

                      const schedData = schedule?.payschedules?.find((s) => s.class_id === cls.id);
                      const hasInvoices = schedData?.invoices_count > 0;

                      return (
                        <TableRow
                          key={cls.id}
                          hover
                          sx={{
                            bgcolor: isSelected ? 'white' : '#f5f5f5',
                            borderLeft: errors[`class_${cls.id}`] ? '3px solid' : 'none',
                            borderColor: 'error.main',
                          }}
                        >
                          <TableCell sx={{ opacity: isSelected ? 1 : 0.5, verticalAlign: 'top' }}>
                            <Box position="relative" display="inline-block">
                              {hasInvoices && (
                                <Box
                                  position="absolute"
                                  top={0} left={0} right={0} bottom={0}
                                  zIndex={1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showInlineWarning(`chip_${cls.id}`, 'Cannot remove: this class has attached invoices');
                                  }}
                                  sx={{ cursor: 'not-allowed' }}
                                />
                              )}
                              <Chip
                                label={cls.name}
                                color={isSelected ? 'primary' : 'default'}
                                variant={isSelected ? 'filled' : 'outlined'}
                                onClick={hasInvoices ? undefined : () => handleClassToggle(cls.id)}
                                sx={{
                                  fontWeight: 600,
                                  cursor: hasInvoices ? 'default' : 'pointer',
                                  '&:hover': {
                                    opacity: hasInvoices ? 1 : 0.8,
                                  },
                                }}
                              />
                            </Box>
                            {inlineWarnings[`chip_${cls.id}`] && (
                              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                                {inlineWarnings[`chip_${cls.id}`]}
                              </Typography>
                            )}
                            {!isSelected && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                Click to activate
                              </Typography>
                            )}
                            {errors[`class_${cls.id}`] && (
                              <Typography
                                variant="caption"
                                color="error.main"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {errors[`class_${cls.id}`]}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell sx={{ opacity: isSelected ? 1 : 0.5 }}>
                            {isSelected ? (
                              <Stack spacing={1.5}>
                                {options.map((option, idx) => {
                                  const isExistingOption = hasInvoices && option.id;
                                  return (
                                  <Box key={idx} display="flex" gap={1} alignItems="flex-start" position="relative">
                                    {isExistingOption && (
                                      <Box
                                        position="absolute"
                                        top={0} left={0} right={0} bottom={0}
                                        zIndex={1}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showInlineWarning(`options_${cls.id}`, 'Cannot edit/delete option: this class has attached invoices');
                                        }}
                                        sx={{ cursor: 'not-allowed' }}
                                      />
                                    )}
                                    <TextField
                                      size="small"
                                      placeholder="Option name (e.g., Large Bag)"
                                      value={option.option_name}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          cls.id,
                                          idx,
                                          'option_name',
                                          e.target.value,
                                        )
                                      }
                                      error={!!errors[`${cls.id}_${idx}_option_name`]}
                                      helperText={errors[`${cls.id}_${idx}_option_name`]}
                                      sx={{ flex: 2 }}
                                      disabled={isExistingOption}
                                    />
                                    <TextField
                                      size="small"
                                      type="number"
                                      placeholder="Amount"
                                      value={option.amount}
                                      onChange={(e) =>
                                        handleOptionChange(cls.id, idx, 'amount', e.target.value)
                                      }
                                      error={!!errors[`${cls.id}_${idx}_amount`]}
                                      helperText={errors[`${cls.id}_${idx}_amount`]}
                                      slotProps={{
                                        htmlInput: { min: 0, step: '0.01' },
                                        input: {
                                          startAdornment: (
                                            <InputAdornment position="start">₦</InputAdornment>
                                          ),
                                        },
                                      }}
                                      sx={{ flex: 1 }}
                                      disabled={isExistingOption}
                                    />
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveOption(cls.id, idx)}
                                      disabled={options.length === 1 || isExistingOption}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )})}
                                <Box sx={{ alignSelf: 'flex-start' }}>
                                  <Button variant="contained" size="small" startIcon={<AddIcon />}
                                    onClick={() => handleAddOption(cls.id)}
                                  >
                                    Add Option
                                  </Button>
                                </Box>
                                {inlineWarnings[`options_${cls.id}`] && (
                                  <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                                    {inlineWarnings[`options_${cls.id}`]}
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Select class to add options
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleRowMenuOpen(e, cls, classScheduleData)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
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
          <Button variant="contained" size="small" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit} sx={{ fontWeight: 600 }} disabled={loadingClasses || saving}>
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
        <Tooltip title={selectedRowClass?.scheduleData?.schedule_id && schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0 ? "Cannot toggle: attached invoices exist" : ""} placement="left">
          <Box onClickCapture={(e) => {
            if (selectedRowClass?.scheduleData?.schedule_id && schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0) {
              e.stopPropagation();
              handleRowMenuClose();
              showSnackbar?.('Cannot deactivate class: attached invoices exist', 'warning');
            }
          }}>
            <MenuOption onClick={handleToggleClick} disabled={selectedRowClass?.scheduleData?.schedule_id && schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0}>
              {selectedRowClass && formData.selectedClasses.includes(selectedRowClass.id)
                ? 'Deactivate Class'
                : 'Activate Class'}
            </MenuOption>
          </Box>
        </Tooltip>
        {selectedRowClass?.scheduleData?.schedule_id && (
          <Tooltip title={schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0 ? "Cannot delete: attached invoices exist" : ""} placement="left">
            <Box onClickCapture={(e) => {
              if (schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0) {
                e.stopPropagation();
                handleRowMenuClose();
                showSnackbar?.('Cannot delete class schedule: attached invoices exist', 'warning');
              }
            }}>
              <MenuOption onClick={handleDeleteClick} sx={{ color: schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0 ? 'text.disabled' : 'error.main' }} disabled={schedule?.payschedules?.find(s => s.class_id === selectedRowClass.id)?.invoices_count > 0}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete Class Schedule
              </MenuOption>
            </Box>
          </Tooltip>
        )}
      </Menu>

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
            <strong>{deleteDialog.classSchedule?.name}</strong>? All payment options for this class
            will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => setDeleteDialog({ open: false, classSchedule: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="contained" size="small" color="error" onClick={handleDeleteConfirm} disabled={deleting} sx={{ fontWeight: 600 }}>
            {deleting ? 'Deleting...' : 'Delete Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Class Confirmation Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onClose={() => setDeactivateDialog({ open: false, classData: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Deactivate Class</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This class has options configured!
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to deactivate <strong>{deactivateDialog.classData?.name}</strong>?
          </Typography>

          {deactivateDialog.classData?.options && deactivateDialog.classData.options.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                The following options will be removed:
              </Typography>
              <Stack spacing={0.5} mt={1}>
                {deactivateDialog.classData.options.map((opt, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{opt.option_name || '(Unnamed option)'}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₦{opt.amount ? parseFloat(opt.amount).toLocaleString() : '0'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            You can reactivate this class later, but you'll need to re-enter all the options.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" color="inherit" onClick={() => setDeactivateDialog({ open: false, classData: null })}
          >
            Cancel
          </Button>
          <Button variant="contained" size="small" color="warning" onClick={handleDeactivateConfirm} sx={{ fontWeight: 600 }}>
            Deactivate Class
          </Button>
        </DialogActions>
      </Dialog>
    </ReusableModal>
  );
};

EditOptionalPaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  schedule: PropTypes.object,
  sessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  termId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRefresh: PropTypes.func,
};

export default EditOptionalPaymentModal;
