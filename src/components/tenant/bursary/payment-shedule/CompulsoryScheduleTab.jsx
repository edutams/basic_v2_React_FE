import { useState } from 'react';
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import PaymentScheduleModal from './PaymentScheduleModal';
import AddPaymentItemModal from './AddPaymentItemModal';
import EditPaymentItemModal from './EditPaymentItemModal';

const CompulsoryScheduleTab = ({ showSnackbar }) => {
  const [currentTerm, setCurrentTerm] = useState(0);
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

  // Mock data for schedules - separate data for each term
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
    const isEdit = !cls.missing;

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
            amount: isEdit ? '10000' : '',
            dueDate: isEdit ? '2025-03-15' : '',
            installmentNumber: isEdit ? '1' : '',
            description: isEdit ? 'First term payment' : '',
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

          // Recalculate missing count
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
          Payment Schedules for 2024/2025 - Second Term (New Student Category)
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
            <Tab
              label="First Term"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: currentTerm === 0 ? 'primary.main' : 'grey.300',
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
            <Tab
              label="Second Term"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: currentTerm === 1 ? 'primary.main' : 'grey.300',
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
            <Tab
              label="Third Term"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: currentTerm === 2 ? 'primary.main' : 'grey.300',
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

          <Button
            // startIcon={<AddIcon />}
            onClick={handleAddPaymentItem}
            sx={{
              fontWeight: 600,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            Add payment item
          </Button>
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
                    {schedule.missingCount === schedule.classes.length && (
                      <Typography variant="caption" color="error.main" display="block" mb={1}>
                        You are yet to set Payment for all classes
                      </Typography>
                    )}
                    <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                      {schedule.classes.map((cls) => (
                        <Chip
                          key={cls.id}
                          label={cls.name}
                          size="small"
                          onClick={() => toggleClassStatus(schedule.id, cls.id)}
                          onDoubleClick={() => handleClassClick(schedule, cls)}
                          sx={{
                            bgcolor: cls.missing ? 'grey.300' : 'primary.main',
                            color: cls.missing ? 'text.secondary' : 'white',
                            fontWeight: 600,
                            fontSize: 11,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                        />
                      ))}
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
    </Stack>
  );
};

export default CompulsoryScheduleTab;
