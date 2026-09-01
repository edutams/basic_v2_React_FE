import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  Switch,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TableFooter,
  TablePagination,
  Tooltip,
  Skeleton,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import {
  Search as SearchIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Security as ShieldIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PaymentScheduleModal from './PaymentScheduleModal';
import AddPaymentItemModal from './AddPaymentItemModal';
import EditPaymentItemModal from './EditPaymentItemModal';
import {
  fetchTermsBySessionTerm,
  fetchPaymentSchedules,
  deletePaymentSchedule,
  deletePaymentSchedulesByPaymentName,
  togglePaymentScheduleStatus,
} from '@/api/tenant/bursary/bursarySettingsApi';

const CompulsoryScheduleTab = ({
  showSnackbar,
  sessionId,
  termId,
  categoryId,
  sessionLabel,
  categoryLabel,
  payOption = 'compulsory',
  payType = 'bursary',
  onTermChange,
  refreshStats,
  scheduleRefreshKey = 0,
}) => {
  const [terms, setTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(0);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [scheduleData, setScheduleData] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    payment: null,
    isEdit: false,
  });
  const [addItemModal, setAddItemModal] = useState(false);
  const [editItemModal, setEditItemModal] = useState({
    open: false,
    schedule: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    schedule: null,
  });
  const [classActionDialog, setClassActionDialog] = useState({
    open: false,
    action: null, // 'delete' or 'toggle'
    schedule: null,
    classData: null,
  });
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (!sessionId || !termId) return;
    const loadData = async () => {
      try {
        setLoadingTerms(true);
        const data = await fetchTermsBySessionTerm(sessionId, termId);
        const items = data?.data;
        const list = Array.isArray(items) ? items : [];
        setTerms(list);
        if (list.length > 0) {
          setCurrentTerm(0);
          setSelectedTermId(list[0].term_id);
          // Notify parent of initial term
          onTermChange?.(list[0].term_id);
        }
      } catch (err) {
        showSnackbar?.('Failed to load terms', 'error');
      } finally {
        setLoadingTerms(false);
      }
    };
    loadData();
  }, [sessionId, termId]);

  const loadPaymentSchedules = async (searchTerm = '') => {
    if (!sessionId || !selectedTermId || !categoryId) return;
    try {
      setLoadingTerms(true);
      const data = await fetchPaymentSchedules(
        sessionId,
        selectedTermId,
        categoryId,
        payOption,
        payType,
        searchTerm,
      );

      // Transform the data to match expected structure
      if (data?.data && Array.isArray(data.data)) {
        const transformedData = data.data.map((paymentName) => {
          const classes =
            paymentName.payschedules?.map((schedule) => ({
              id: schedule.class_id,
              name: schedule.my_class?.class_code || schedule.my_class?.class_name || `Class ${schedule.class_id}`,
              amount: schedule.amount || 0,
              schedule_id: schedule.id,
              bursary_installment_id: schedule.bursary_installment_id,
              status: schedule.status,
              invoices_count: schedule.invoices_count || 0,
            })) || [];

          return {
            payment_name: {
              id: paymentName.id,
              name: paymentName.name,
            },
            category: {
              id: categoryId,
              name: null,
            },
            installment: {
              id: null,
            },
            classes: classes,
            missingCount: classes.filter((c) => !c.amount || c.amount === 0).length,
            hasInvoices: classes.some((c) => c.invoices_count > 0),
          };
        });

        setScheduleData(transformedData);
      } else {
        setScheduleData([]);
      }
    } catch (err) {
      showSnackbar?.('Failed to load payment schedules', 'error');
      console.error('Error loading schedules:', err);
    } finally {
      setLoadingTerms(false);
    }
  };

  useEffect(() => {
    loadPaymentSchedules();
  }, [sessionId, selectedTermId, categoryId, scheduleRefreshKey]);

  const [schedules, setSchedules] = useState({});

  const handleTermChange = (e, val) => {
    setCurrentTerm(val);
    if (terms[val]) {
      const newTermId = terms[val].term_id;
      setSelectedTermId(newTermId);
      // Notify parent of term change
      onTermChange?.(newTermId);
    }
  };

  const handleAddPaymentItem = () => {
    setAddItemModal(true);
  };

  const toggleClassStatus = (scheduleId, classId) => {
    setSchedules((prev) => ({
      ...prev,
      [currentTerm]: (prev[currentTerm] || []).map((sch) => {
        if (sch.id !== scheduleId) return sch;
        const updatedClasses = sch.classes.map((cls) =>
          cls.id === classId ? { ...cls, missing: !cls.missing } : cls,
        );
        const missingCount = updatedClasses.filter((c) => c.missing).length;
        return { ...sch, classes: updatedClasses, missingCount, allClassesSet: missingCount === 0 };
      }),
    }));
  };

  const handleClassActionClick = (schedule, cls, action) => {
    setClassActionDialog({
      open: true,
      action,
      schedule,
      classData: cls,
    });
  };

  const handleConfirmClassAction = async () => {
    if (!classActionDialog.classData) return;

    try {
      setProcessingAction(true);

      if (classActionDialog.action === 'delete') {
        const response = await deletePaymentSchedule(classActionDialog.classData.schedule_id);

        if (response.success) {
          showSnackbar?.(`${classActionDialog.classData.name} removed successfully`, 'success');
          await loadPaymentSchedules(searchQuery);
          refreshStats?.();
        } else {
          showSnackbar?.(response.message || 'Failed to delete class schedule', 'error');
        }
      } else if (classActionDialog.action === 'toggle') {
        const currentStatus = classActionDialog.classData.status || 'active';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        const response = await togglePaymentScheduleStatus(
          classActionDialog.classData.schedule_id,
          newStatus,
        );

        if (response.success) {
          showSnackbar?.(
            `${classActionDialog.classData.name} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            'success',
          );
          await loadPaymentSchedules(searchQuery);
          refreshStats?.();
        } else {
          showSnackbar?.(response.message || 'Failed to toggle class schedule', 'error');
        }
      }

      setClassActionDialog({ open: false, action: null, schedule: null, classData: null });
    } catch (err) {
      console.error('Failed to process class action:', err);
      showSnackbar?.(err.response?.data?.message || 'Failed to process action', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSearch = () => {
    loadPaymentSchedules(searchQuery);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEditSchedule = () => {
    handleMenuClose();
    setEditItemModal({
      open: true,
      schedule: selectedRow,
    });
  };

  const handleDeleteSchedule = () => {
    handleMenuClose();
    setDeleteDialog({
      open: true,
      schedule: selectedRow,
    });
  };

  // const handleClassClick = (schedule, cls) => {
  //   const isEdit = cls.name.includes('₦'); // Has amount if name contains ₦

  //   setConfirmDialog({
  //     open: true,
  //     title: isEdit ? 'Edit Payment' : 'Add Payment',
  //     message: isEdit
  //       ? `Are you sure you want to edit payment for ${cls.id} in ${schedule.paymentName}?`
  //       : `Are you sure you want to add payment to ${cls.id} for ${schedule.paymentName}?`,
  //     onConfirm: () => {
  //       setConfirmDialog({ ...confirmDialog, open: false });
  //       setPaymentModal({
  //         open: true,
  //         payment: {
  //           className: cls.id,
  //           paymentName: schedule.paymentName,
  //           amount: isEdit ? cls.name.match(/\d+/)?.[0] || '' : '',
  //         },
  //         isEdit,
  //       });
  //     },
  //   });
  // };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handlePaymentModalClose = () => {
    setPaymentModal({ open: false, payment: null, isEdit: false });
  };

  const handlePaymentSave = async (formData) => {
    try {
      const action = paymentModal.isEdit ? 'updated' : 'added';
      const { className, paymentName } = paymentModal.payment || {};

      showSnackbar?.(
        `Payment ${action} successfully: ${formData.amount} ₦ for ${className} in ${paymentName}`,
      );

      // Reload schedules after saving
      await loadPaymentSchedules(searchQuery);
      refreshStats?.();
    } catch (err) {
      console.error('Failed to reload schedules:', err);
      showSnackbar?.('Failed to reload payment schedules', 'error');
    }
  };

  const handleAddItemSave = (formData) => {
    setSchedules((prev) => {
      const currentTermSchedules = prev[currentTerm] || [];
      const allSchedules = Object.values(prev).flat();
      const newId = Math.max(...allSchedules.map((s) => s.id), 0) + 1;

      const classes = formData.selectedClasses.map((classId) => ({
        id: classId,
        name: classId,
        missing: true,
      }));

      const newSchedule = {
        id: newId,
        paymentName: formData.paymentName,
        classes: classes,
        allClassesSet: false,
        missingCount: classes.length,
      };

      return {
        ...prev,
        [currentTerm]: [...currentTermSchedules, newSchedule],
      };
    });

    showSnackbar?.(
      `Payment item "${formData.paymentName}" added successfully with ${formData.selectedClasses.length} classes`,
    );
  };

  const handleEditItemSave = async (formData) => {
    try {
      console.log('Saving edit item:', formData, editItemModal.schedule);

      showSnackbar?.(`Payment item "${formData.paymentName}" updated successfully`);

      await loadPaymentSchedules(searchQuery);
      refreshStats?.();
    } catch (err) {
      console.error('Failed to save edit item:', err);
      showSnackbar?.('Failed to update payment item', 'error');
    }
  };

  const handleRefreshSchedules = async () => {
    await loadPaymentSchedules(searchQuery);
  };

  const handleConfirmDelete = async () => {
    const scheduleToDelete = deleteDialog.schedule;

    try {
      setProcessingAction(true);
      const response = await deletePaymentSchedulesByPaymentName(scheduleToDelete.payment_name?.id);

      if (response.success) {
        setSchedules((prevSchedules) => ({
          ...prevSchedules,
          [currentTerm]: (prevSchedules[currentTerm] || []).filter(
            (schedule) => schedule.payment_name?.id !== scheduleToDelete.payment_name?.id,
          ),
        }));

        showSnackbar?.(
          `Payment item "${scheduleToDelete.payment_name?.name}" deleted successfully`,
          'success',
        );

        await loadPaymentSchedules(searchQuery);
        refreshStats?.();
      } else {
        showSnackbar?.(response.message || 'Failed to delete payment item', 'error');
      }
    } catch (err) {
      console.error('Failed to delete payment item:', err);
      showSnackbar?.(err.response?.data?.message || 'Failed to delete payment item', 'error');
    } finally {
      setProcessingAction(false);
      setDeleteDialog({ open: false, schedule: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchedules = scheduleData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2, textAlign: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" fontWeight={600}>
          Payment Schedules for {sessionLabel || '...'} -{' '}
          {terms[currentTerm]?.term?.term_name ||
            terms[currentTerm]?.display_term?.display_name ||
            terms[currentTerm]?.name ||
            terms[currentTerm]?.term_name ||
            (loadingTerms ? 'Loading...' : '')}{' '}
          ({categoryLabel || '...'})
        </Typography>
      </Alert>

      <ParentCard>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={2}
        >
          <Tabs
            value={currentTerm}
            onChange={handleTermChange}
            variant="scrollable"
            scrollButtons={false}
          >
            {terms.map((term, idx) => (
              <Tab
                key={idx}
                label={term.term?.term_name}
                sx={{ textTransform: 'none', fontWeight: 600 }}
                icon={
                  <Box
                    component="span"
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: currentTerm === idx ? 'primary.main' : 'grey.300',
                      color: 'white',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      mr: 1,
                    }}
                  >
                    ●
                  </Box>
                }
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box display="flex" gap={2}>
            <TextField
              placeholder="Search payment items..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button variant="contained" size="small" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
          mt={2}
          mb={2}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: '#5CB979',
                }}
              />
              <Typography variant="caption">Active Payment Schedules</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                }}
              />
              <Typography variant="caption">Inactive Payment Schedules</Typography>
            </Stack>
          </Stack>
        </Box>

        <TableContainer variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>PAYMENT NAME</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CLASS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingTerms ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={140} height={20} /></TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
                      </Box>
                    </TableCell>
                    <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>No payment schedules found</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSchedules.map((schedule, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {schedule.payment_name.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {schedule.missingCount > 0 && (
                      <Typography variant="caption" color="error.main" display="block" mb={1}>
                        You are yet to set payment for all classes
                      </Typography>
                    )}
                    <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                      {schedule.classes && schedule.classes.length > 0 ? (
                        schedule.classes.map((cls) => {
                          // Skip null/invalid classes
                          if (!cls || !cls.id || !cls.name) return null;

                          const hasAmount = !!cls.amount && cls.amount > 0;
                          return (
                            <Chip
                              key={cls.id}
                              label={
                                <Tooltip title="Click to set or edit payment amount">
                                  <span>
                                    {hasAmount ? `${cls.name} - [${cls.amount} ₦]` : cls.name}
                                  </span>
                                </Tooltip>
                              }
                              size="small"
                              onClick={(e) => {
                                // Prevent bubbling if clicking on delete icon
                                if (e.target.closest('.MuiChip-deleteIcon')) {
                                  return;
                                }

                                if (cls.invoices_count > 0) {
                                  showSnackbar?.(`Cannot edit: attached to ${cls.invoices_count} invoice(s)`, 'warning');
                                  return;
                                }

                                // Open modal to set/edit amount for this class
                                setPaymentModal({
                                  open: true,
                                  payment: {
                                    className: cls.name,
                                    classId: cls.id,
                                    paymentName: schedule.payment_name.name,
                                    bursaryPaymentNameId: schedule.payment_name.id,
                                    scheduleId: cls.schedule_id,
                                    amount: cls.amount || '',
                                    bursary_installment_id: cls.bursary_installment_id || '',
                                  },
                                  isEdit: hasAmount,
                                });
                              }}
                              onDelete={
                                hasAmount
                                  ? (e) => {
                                    e.stopPropagation();
                                    if (cls.invoices_count > 0) {
                                      showSnackbar?.(`Cannot delete: attached to ${cls.invoices_count} invoice(s)`, 'warning');
                                      return;
                                    }
                                    handleClassActionClick(schedule, cls, 'delete');
                                  }
                                  : undefined
                              }
                              deleteIcon={
                                hasAmount ? (
                                  <Box
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                  >
                                    <Tooltip
                                      title={cls.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                      <Switch
                                        size="small"
                                        checked={cls.status === 'active'}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleClassActionClick(schedule, cls, 'toggle');
                                        }}
                                        sx={{
                                          color: hasAmount
                                            ? schedule.status === 'inactive'
                                              ? 'white'
                                              : '#5CB979'
                                            : 'grey.300',
                                        }}
                                      />
                                    </Tooltip>
                                    <Tooltip title="Delete class schedule">
                                      <DeleteIcon sx={{ fontSize: 14 }} />
                                    </Tooltip>
                                  </Box>
                                ) : (
                                  <Tooltip title="Add payment for this class">
                                    <AddIcon sx={{ fontSize: 14 }} />
                                  </Tooltip>
                                )
                              }
                              sx={{
                                bgcolor: hasAmount
                                  ? cls.status === 'inactive'
                                    ? 'error.main'
                                    : '#5CB979'
                                  : 'grey.300',

                                color: hasAmount ? 'white' : 'text.secondary',
                                fontWeight: 600,
                                fontSize: 11,
                                cursor: 'pointer',

                                transition: 'all 0.2s ease',

                                '&:hover': {
                                  transform: 'scale(1.03)',
                                  backgroundColor: hasAmount
                                    ? cls.status === 'inactive'
                                      ? 'error.dark'
                                      : '#5CB979'
                                    : 'grey.400',
                                },

                                '& .MuiChip-deleteIcon, & .MuiChip-deleteIcon:hover': {
                                  color: 'inherit',
                                },
                              }}
                            />
                          );
                        })
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No classes assigned
                        </Typography>
                      )}
                      {schedule.missingCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {schedule.missingCount} missing
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, schedule)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  colSpan={4}
                  count={scheduleData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </ParentCard>
      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuOption onClick={handleEditSchedule}>
          Set/Edit Schedule
        </MenuOption>
        <Tooltip title={selectedRow?.hasInvoices ? "Cannot delete: one or more classes have attached invoices" : ""} placement="left">
          <span>
            <MenuOption onClick={handleDeleteSchedule} sx={{ color: selectedRow?.hasInvoices ? 'text.disabled' : 'error.main' }} disabled={selectedRow?.hasInvoices}>
              Delete Schedule
            </MenuOption>
          </span>
        </Tooltip>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={handleConfirmDialogClose}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={confirmDialog.onConfirm}
            sx={{ fontWeight: 600 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentScheduleModal
        open={paymentModal.open}
        onClose={handlePaymentModalClose}
        onSave={handlePaymentSave}
        payment={paymentModal.payment}
        isEdit={paymentModal.isEdit}
        sessionId={sessionId}
        termId={selectedTermId}
        categoryId={categoryId}
      />

      <AddPaymentItemModal
        open={addItemModal}
        onClose={() => setAddItemModal(false)}
        onSave={handleAddItemSave}
      />

      {/* Edit Payment Item Modal */}
      <EditPaymentItemModal
        open={editItemModal.open}
        onClose={() => setEditItemModal({ open: false, schedule: null })}
        onSave={handleEditItemSave}
        schedule={editItemModal.schedule}
        sessionId={sessionId}
        termId={selectedTermId}
        categoryId={categoryId}
        onRefresh={() => loadPaymentSchedules()}
        showSnackbar={showSnackbar}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, schedule: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Payment Item</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete the payment item "
            <strong>{deleteDialog.schedule?.paymentName}</strong>"? All payment schedules and
            amounts for this item will be permanently removed.
          </Typography>
          {/* {deleteDialog.schedule && deleteDialog.schedule.classes && (
            <Box mt={2}>
              <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                This will affect the following classes:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {deleteDialog.schedule.classes.map((cls) => (
                  <Chip key={cls.id} label={cls.id} size="small" color="error" variant="outlined" />
                ))}
              </Box>
            </Box>
          )} */}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setDeleteDialog({ open: false, schedule: null })}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ fontWeight: 600 }}
          >
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Class Action Confirmation Dialog */}
      <Dialog
        open={classActionDialog.open}
        onClose={() =>
          !processingAction &&
          setClassActionDialog({ open: false, action: null, schedule: null, classData: null })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {classActionDialog.action === 'delete' ? 'Delete Class Schedule' : 'Toggle Class Status'}
        </DialogTitle>
        <DialogContent>
          {classActionDialog.action === 'delete' && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action cannot be undone!
              </Alert>
              <Typography variant="body2">
                Are you sure you want to delete <strong>{classActionDialog.classData?.name}</strong>{' '}
                from <strong>{classActionDialog.schedule?.payment_name?.name}</strong>? The payment
                amount and installment settings for this class will be permanently removed.
              </Typography>
            </>
          )}
          {classActionDialog.action === 'toggle' && (
            <Typography variant="body2">
              Are you sure you want to toggle the status of{' '}
              <strong>{classActionDialog.classData?.name}</strong> in{' '}
              <strong>{classActionDialog.schedule?.payment_name?.name}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() =>
              setClassActionDialog({ open: false, action: null, schedule: null, classData: null })
            }
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color={classActionDialog.action === 'delete' ? 'error' : 'primary'}
            onClick={handleConfirmClassAction}
            disabled={processingAction}
            sx={{ fontWeight: 600 }}
          >
            {processingAction
              ? 'Processing...'
              : classActionDialog.action === 'delete'
                ? 'Delete'
                : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CompulsoryScheduleTab;
