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
import { fetchTermsBySessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';

const CompulsoryScheduleTab = ({ showSnackbar, sessionTermId, categoryId, sessionLabel, categoryLabel }) => {
  const [terms, setTerms] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(0);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    classId: null,
    className: null,
  });

  useEffect(() => {
    if (!sessionTermId) return;
    const loadTerms = async () => {
      try {
        setLoadingTerms(true);
        const data = await fetchTermsBySessionTerm(sessionTermId);
        const items = data?.data;
        const list = Array.isArray(items) ? items : [];
        setTerms(list);
        if (list.length > 0) {
          setCurrentTerm(0);
        }
      } catch (err) {
        showSnackbar?.('Failed to load terms', 'error');
      } finally {
        setLoadingTerms(false);
      }
    };
    loadTerms();
  }, [sessionTermId]);

  const [schedules, setSchedules] = useState({
    0: [
      // First Term
      {
        id: 1,
        paymentName: 'School Fee',
        classes: [
          { id: 'JSS1', name: 'JSS1 - [10,000 NGN]', missing: false },
          { id: 'JSS2', name: 'JSS2', missing: true },
          { id: 'JSS3', name: 'JSS3', missing: true },
          { id: 'SS1', name: 'SS1', missing: true },
          { id: 'SS2', name: 'SS2', missing: true },
          { id: 'SS3', name: 'SS3', missing: true },
        ],
        allClassesSet: false,
        missingCount: 5,
      },
      {
        id: 2,
        paymentName: 'Bag',
        classes: [
          { id: 'JSS1', name: 'JSS1 - [10,000 NGN]', missing: false },
          { id: 'JSS2', name: 'JSS2', missing: true },
          { id: 'JSS3', name: 'JSS3', missing: true },
          { id: 'SS1', name: 'SS1', missing: true },
          { id: 'SS2', name: 'SS2', missing: true },
          { id: 'SS3', name: 'SS3', missing: true },
        ],
        allClassesSet: false,
        missingCount: 5,
      },
    ],
    1: [
      // Second Term
      {
        id: 3,
        paymentName: 'School Fee',
        classes: [
          { id: 'JSS1', name: 'JSS1', missing: true },
          { id: 'JSS2', name: 'JSS2', missing: true },
          { id: 'JSS3', name: 'JSS3', missing: true },
          { id: 'SS1', name: 'SS1', missing: true },
          { id: 'SS2', name: 'SS2', missing: true },
          { id: 'SS3', name: 'SS3', missing: true },
        ],
        allClassesSet: false,
        missingCount: 6,
      },
    ],
    2: [
      // Third Term
      {
        id: 4,
        paymentName: 'School Fee',
        classes: [
          { id: 'JSS1', name: 'JSS1', missing: true },
          { id: 'JSS2', name: 'JSS2', missing: true },
          { id: 'JSS3', name: 'JSS3', missing: true },
          { id: 'SS1', name: 'SS1', missing: true },
          { id: 'SS2', name: 'SS2', missing: true },
          { id: 'SS3', name: 'SS3', missing: true },
        ],
        allClassesSet: false,
        missingCount: 6,
      },
    ],
  });

  const handleAddPaymentItem = () => {
    setAddItemModal(true);
  };

  // Toggle active/inactive status for a class within a schedule
  const toggleClassStatus = (scheduleId, classId) => {
    setSchedules(prev => ({
      ...prev,
      [currentTerm]: prev[currentTerm].map(sch => {
        if (sch.id !== scheduleId) return sch;
        const updatedClasses = sch.classes.map(cls =>
          cls.id === classId ? { ...cls, missing: !cls.missing } : cls
        );
        const missingCount = updatedClasses.filter(c => c.missing).length;
        return { ...sch, classes: updatedClasses, missingCount, allClassesSet: missingCount === 0 };
      })
    }));
  };

  const handleClassActionClick = (scheduleId, classId, action) => {
    const schedule = currentSchedules.find(s => s.id === scheduleId);
    const cls = schedule?.classes.find(c => c.id === classId);
    
    if (cls) {
      setClassActionDialog({
        open: true,
        action,
        schedule,
        classId,
        className: cls.name,
      });
    }
  };

  const handleDeleteClass = (scheduleId, classId) => {
    setSchedules(prev => ({
      ...prev,
      [currentTerm]: prev[currentTerm].map(sch => {
        if (sch.id !== scheduleId) return sch;
        const updatedClasses = sch.classes.filter(cls => cls.id !== classId);
        const missingCount = updatedClasses.filter(c => c.missing).length;
        return { ...sch, classes: updatedClasses, missingCount, allClassesSet: missingCount === 0 };
      })
    }));
    showSnackbar?.(`Class removed successfully`);
    setClassActionDialog({ open: false, action: null, schedule: null, classId: null, className: null });
  };

  const handleConfirmClassAction = () => {
    if (classActionDialog.action === 'delete') {
      handleDeleteClass(classActionDialog.schedule.id, classActionDialog.classId);
    } else if (classActionDialog.action === 'toggle') {
      toggleClassStatus(classActionDialog.schedule.id, classActionDialog.classId);
      const schedule = currentSchedules.find(s => s.id === classActionDialog.schedule.id);
      const cls = schedule?.classes.find(c => c.id === classActionDialog.classId);
      if (cls) {
        showSnackbar?.(cls.missing ? `${classActionDialog.className} activated` : `${classActionDialog.className} deactivated`);
      }
      setClassActionDialog({ open: false, action: null, schedule: null, classId: null, className: null });
    }
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

  const handleClassClick = (schedule, cls) => {
    const isEdit = cls.name.includes('NGN'); // Has amount if name contains NGN

    setConfirmDialog({
      open: true,
      title: isEdit ? 'Edit Payment' : 'Add Payment',
      message: isEdit
        ? `Are you sure you want to edit payment for ${cls.id} in ${schedule.paymentName}?`
        : `Are you sure you want to add payment to ${cls.id} for ${schedule.paymentName}?`,
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        setPaymentModal({
          open: true,
          payment: {
            className: cls.id,
            paymentName: schedule.paymentName,
            amount: isEdit ? cls.name.match(/\d+/)?.[0] || '' : '',
          },
          isEdit,
        });
      },
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handlePaymentModalClose = () => {
    setPaymentModal({ open: false, payment: null, isEdit: false });
  };

  const handlePaymentSave = (formData) => {
    const action = paymentModal.isEdit ? 'updated' : 'added';
    const { className, paymentName } = paymentModal.payment || {};

    // Update the schedules state for current term
    setSchedules((prevSchedules) => ({
      ...prevSchedules,
      [currentTerm]: prevSchedules[currentTerm].map((schedule) => {
        if (schedule.paymentName === paymentName) {
          // Update the specific class
          const updatedClasses = schedule.classes.map((cls) => {
            if (cls.id === className) {
              return {
                ...cls,
                name: `${cls.id} - [${formData.amount} NGN]`,
                missing: false, // Mark as no longer missing
              };
            }
            return cls;
          });

          const missingCount = updatedClasses.filter((cls) => cls.missing).length;
          const allClassesSet = missingCount === 0;

          return {
            ...schedule,
            classes: updatedClasses,
            missingCount,
            allClassesSet,
          };
        }
        return schedule;
      }),
    }));

    showSnackbar?.(
      `Payment ${action} successfully: ${formData.amount} NGN for ${className} in ${paymentName}`,
    );
  };

  const handleAddItemSave = (formData) => {
    const currentTermSchedules = schedules[currentTerm] || [];
    const newId =
      Math.max(
        ...Object.values(schedules)
          .flat()
          .map((s) => s.id),
        0,
      ) + 1;

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

    setSchedules((prev) => ({
      ...prev,
      [currentTerm]: [...currentTermSchedules, newSchedule],
    }));

    showSnackbar?.(
      `Payment item "${formData.paymentName}" added successfully with ${classes.length} classes`,
    );
  };

  const handleEditItemSave = (formData) => {
    setSchedules((prevSchedules) => ({
      ...prevSchedules,
      [currentTerm]: prevSchedules[currentTerm].map((schedule) => {
        if (schedule.id === editItemModal.schedule?.id) {
          const existingClasses = schedule.classes;

          const updatedClasses = formData.selectedClasses.map((classId) => {
            const existingClass = existingClasses.find((cls) => cls.id === classId);
            if (existingClass) {
              return existingClass;
            } else {
              return {
                id: classId,
                name: classId,
                missing: true,
              };
            }
          });

          const missingCount = updatedClasses.filter((cls) => cls.missing).length;
          const allClassesSet = missingCount === 0;

          return {
            ...schedule,
            paymentName: formData.paymentName,
            classes: updatedClasses,
            missingCount,
            allClassesSet,
          };
        }
        return schedule;
      }),
    }));

    showSnackbar?.(`Payment item "${formData.paymentName}" updated successfully`);
  };

  const handleConfirmDelete = () => {
    const scheduleToDelete = deleteDialog.schedule;

    setSchedules((prevSchedules) => ({
      ...prevSchedules,
      [currentTerm]: prevSchedules[currentTerm].filter(
        (schedule) => schedule.id !== scheduleToDelete.id,
      ),
    }));

    showSnackbar?.(
      `Payment item "${scheduleToDelete.paymentName}" deleted successfully`,
      'success',
    );

    setDeleteDialog({ open: false, schedule: null });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentSchedules = schedules[currentTerm] || [];

  const paginatedSchedules = currentSchedules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2, textAlign: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" fontWeight={600}>
          Payment Schedules for {sessionLabel || '...'} - {terms[currentTerm]?.name || terms[currentTerm]?.term_name || (loadingTerms ? 'Loading...' : '')} ({categoryLabel || '...'})
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
            onChange={(e, val) => setCurrentTerm(val)}
            variant="scrollable"
            scrollButtons={false}
          >
           
              {terms.map((term, idx) => (
                  <Tab
                    key={idx}
                    label={term.display_term.display_name}
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
                ))
}
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
            <Button variant="contained" size="small">
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
                  bgcolor: 'primary.main',
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

          {/* Add payment item button commented out
          <Button
            onClick={handleAddPaymentItem}
            sx={{
              fontWeight: 600,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            Add payment item
          </Button>
          */}
        </Box>

        <TableContainer component={Paper} variant="outlined">
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
              {paginatedSchedules.map((schedule, index) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {schedule.paymentName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {schedule.missingCount > 0 && !schedule.classes.some(c => c.name.includes('NGN')) && (
                      <Typography variant="caption" color="error.main" display="block" mb={1}>
                        You are yet to set Payment for all classes
                      </Typography>
                    )}
                    <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                      {schedule.classes.map((cls) => {
                        const hasAmount = cls.name.includes('NGN');
                        return (
                          <Chip
                            key={cls.id}
                            label={cls.name}
                            size="small"
                            onClick={() => handleClassClick(schedule, cls)}
                            onDelete={() => {
                              if (hasAmount) {
                                handleClassActionClick(schedule.id, cls.id, 'delete');
                              }
                            }}
                            deleteIcon={
                              hasAmount ? (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <ShieldIcon
                                    sx={{
                                      fontSize: 16,
                                      opacity: cls.missing ? 0.5 : 1,
                                      cursor: 'pointer',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClassActionClick(schedule.id, cls.id, 'toggle');
                                    }}
                                  />
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </Box>
                              ) : (
                                <AddIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{
                              bgcolor: cls.name.includes('NGN') && cls.missing ? 'error.main' : cls.missing ? 'grey.300' : 'primary.main',
                              color: cls.name.includes('NGN') && cls.missing ? 'white' : cls.missing ? 'text.secondary' : 'white',
                              fontWeight: 600,
                              fontSize: 11,
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                              },
                              '& .MuiChip-deleteIcon': {
                                color: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.25,
                                '&:hover': {
                                  color: 'inherit',
                                },
                              },
                            }}
                          />
                        );
                      })}
                      {schedule.missingCount > 0 && (
                        <Typography variant="caption" color="textSecondary">
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
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  colSpan={4}
                  count={currentSchedules.length}
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
        <MenuOption onClick={handleEditSchedule}>Set/Edit Schedule</MenuOption>
        <MenuOption onClick={handleDeleteSchedule} sx={{ color: 'error.main' }}>
          Delete Schedule
        </MenuOption>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button color="inherit" onClick={handleConfirmDialogClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmDialog.onConfirm} sx={{ fontWeight: 600 }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Schedule Modal */}
      <PaymentScheduleModal
        open={paymentModal.open}
        onClose={handlePaymentModalClose}
        onSave={handlePaymentSave}
        payment={paymentModal.payment}
        isEdit={paymentModal.isEdit}
      />

      {/* Add Payment Item Modal */}
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
          {deleteDialog.schedule && deleteDialog.schedule.classes && (
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
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button color="inherit" onClick={() => setDeleteDialog({ open: false, schedule: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
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
        onClose={() => setClassActionDialog({ open: false, action: null, schedule: null, classId: null, className: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {classActionDialog.action === 'delete' ? 'Delete Class' : 'Toggle Class Status'}
        </DialogTitle>
        <DialogContent>
          {classActionDialog.action === 'delete' && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This action cannot be undone!
              </Alert>
              <Typography variant="body2">
                Are you sure you want to delete <strong>{classActionDialog.className}</strong> from this payment schedule? The payment amount for this class will be removed.
              </Typography>
            </>
          )}
          {classActionDialog.action === 'toggle' && (
            <Typography variant="body2">
              Are you sure you want to <strong>{classActionDialog.schedule?.classes.find(c => c.id === classActionDialog.classId)?.missing ? 'activate' : 'deactivate'}</strong> <strong>{classActionDialog.className}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => setClassActionDialog({ open: false, action: null, schedule: null, classId: null, className: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={classActionDialog.action === 'delete' ? 'error' : 'primary'}
            onClick={handleConfirmClassAction}
            sx={{ fontWeight: 600 }}
          >
            {classActionDialog.action === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CompulsoryScheduleTab;
