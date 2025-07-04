import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  TableContainer,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { IconSchool } from '@tabler/icons-react';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReusableModal from '../../components/shared/ReusableModal';
import PlanForm from '../../components/add-plan/PlanForm';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'My Plans' }];

const MyPlan = () => {
  const [open, setOpen] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [plans, setPlans] = useState([]); // Initialize with empty array or mock data
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [planToDeactivate, setPlanToDeactivate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [lockSubscription, setLockSubscription] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (type = 'create', plan = null) => {
    setActionType(type);
    setSelectedPlan(plan);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActionType('create');
    setSelectedPlan(null);
  };

  const handleViewClose = () => {
    setOpenViewModal(false);
    setSelectedPlan(null);
  };

  const handleAddPlan = (newPlan) => {
    if (actionType === 'update') {
      setPlans(plans.map((plan) => (plan.id === newPlan.id ? newPlan : plan)));
    } else {
      setPlans([...plans, { ...newPlan, id: plans.length + 1, status: 'Active' }]);
    }
    setSnackbarMessage(`Plan ${actionType === 'create' ? 'added' : 'updated'} successfully`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleClose();
  };

  const handleActionClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(id);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleOpenDeactivateDialog = (plan) => {
    handleActionClose();
    setTimeout(() => {
      setPlanToDeactivate(plan);
      setOpenDeactivateDialog(true);
    }, 100);
  };

  const handleDeactivatePlan = () => {
    if (planToDeactivate) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planToDeactivate.id
            ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }
            : p
        )
      );
      setOpenDeactivateDialog(false);
      setSnackbarMessage(
        `Plan ${planToDeactivate.status === 'Active' ? 'deactivated' : 'activated'} successfully`
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenViewModal(true);
    handleActionClose();
  };

  const handleLockSubscriptionChange = (event) => {
    setLockSubscription(event.target.checked);
    setSnackbarMessage(`Subscription ${event.target.checked ? 'locked' : 'unlocked'}`);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const paginatedPlans = plans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageContainer title="My Plans" description="This is the My Plans page">
      <Breadcrumb title="My Plans" items={BCrumb} />
      <ParentCard
        title={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h4">All My Plans</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={lockSubscription}
                    onChange={handleLockSubscriptionChange}
                    color="primary"
                    aria-label="Lock subscription toggle"
                  />
                }
                label="Lock Subscription"
                labelPlacement="start"
              />
              <Button variant="contained" color="primary" onClick={() => handleOpen('create')}>
                Add New Plan
              </Button>
            </Box>
          </Box>
        }
      >
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="my plan table" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">S/N</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Description</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Base Price (₦)</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Additional Price (₦)</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Student Limit</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Status</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Action</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPlans.length > 0 ? (
                  paginatedPlans.map((plan, index) => (
                    <TableRow
                      key={plan.id}
                      sx={{
                        '&:hover': { bgcolor: 'grey.50' },
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="400">
                          {plan.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{plan.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">₦{plan.price.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">
                          ₦{(plan.additionalPrice || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">{plan.studentLimit}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              plan.status === 'Active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.primary.light,
                            color:
                              plan.status === 'Active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.primary.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={plan.status || 'Unknown'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionClick(e, plan.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeRow === plan.id}
                          onClose={handleActionClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                          <MenuItem onClick={() => handleOpen('update', plan)}>
                            Edit Plan Detail
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenDeactivateDialog(plan)}>
                            {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </MenuItem>
                          <MenuItem onClick={() => handleViewPlan(plan)}>View Plan</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', padding: '40px 0' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconSchool
                          width={48}
                          height={48}
                          color="#757575"
                          sx={{ marginBottom: '16px' }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#757575', marginBottom: '8px' }}
                        >
                          No Plans Available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px' }}>
                          No plans have been registered yet. Click 'Add New Plan' to create a new plan.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={plans.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>

        <ReusableModal
          open={open}
          onClose={handleClose}
          title={actionType === 'create' ? 'Add New Plan' : 'Edit Plan Detail'}
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <PlanForm
            actionType={actionType}
            selectedPlan={selectedPlan}
            onSubmit={handleAddPlan}
            onCancel={handleClose}
          />
        </ReusableModal>

        <ReusableModal
          open={openViewModal}
          onClose={handleViewClose}
          title="View Plan Details"
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Name: {selectedPlan?.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Description: {selectedPlan?.description}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Base Price: ₦{selectedPlan?.price?.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Additional Price: ₦{(selectedPlan?.additionalPrice || 0).toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Student Limit: {selectedPlan?.studentLimit}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Status: {selectedPlan?.status}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={handleViewClose} color="inherit" variant="outlined">
                Close
              </Button>
            </Box>
          </Box>
        </ReusableModal>

        <ConfirmationDialog
          open={openDeactivateDialog}
          onClose={() => setOpenDeactivateDialog(false)}
          onConfirm={handleDeactivatePlan}
          title={planToDeactivate?.status === 'Active' ? 'Deactivate Plan' : 'Activate Plan'}
          message={`Are you sure you want to ${
            planToDeactivate?.status === 'Active' ? 'deactivate' : 'activate'
          } ${planToDeactivate?.name}?`}
          confirmText={planToDeactivate?.status === 'Active' ? 'Deactivate' : 'Activate'}
          cancelText="Cancel"
          confirmColor={planToDeactivate?.status === 'Active' ? 'error' : 'success'}
          severity={planToDeactivate?.status === 'Active' ? 'error' : 'success'}
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ParentCard>
    </PageContainer>
  );
};

export default MyPlan;