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
 Grid,
} from '@mui/material';
import { IconSchool } from '@tabler/icons-react';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReusableModal from '../../components/shared/ReusableModal';
import PlanForm from '../../components/add-plan/component/PlanForm';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import PackageModal from '../../components/package/PackageModal';
import ManageModule from '../../components/add-plan/component/ManageModule';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Plans' }];

const Plan = () => {
 const [open, setOpen] = useState(false);
 const [openPackageModal, setOpenPackageModal] = useState(false);
 const [openManagePackagesModal, setOpenManagePackagesModal] = useState(false);
 const [plans, setPlans] = useState([]);
 const [anchorEl, setAnchorEl] = useState(null);
 const [activeRow, setActiveRow] = useState(null);
 const [actionType, setActionType] = useState('create');
 const [selectedPlan, setSelectedPlan] = useState(null);
 const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
 const [planToDelete, setPlanToDelete] = useState(null);
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(5);
 const [snackbarOpen, setSnackbarOpen] = useState(false);
 const [snackbarMessage, setSnackbarMessage] = useState('');
 const [snackbarSeverity, setSnackbarSeverity] = useState('success');
 const [lockSubscription, setLockSubscription] = useState(false);
 const [planPackageFeatures, setPlanPackageFeatures] = useState({});

 const handleChangePage = (event, newPage) => {
 setPage(newPage);
 };

 const handleChangeRowsPerPage = (event) => {
 setRowsPerPage(parseInt(event.target.value, 10));
 setPage(0);
 };

 const handleOpen = (type = 'create', plan = null) => {
  handleActionClose();
  setActionType(type);
  setSelectedPlan(plan);
  if (type === 'managePackages') {
    setOpenPackageModal(true);
  } else {
    setOpen(true);
  }
};

 const handleClose = () => {
 setOpen(false);
 setOpenPackageModal(false);
 setActionType('create');
 setSelectedPlan(null);
 };

 const handleAddPlan = (newPlan) => {
 if (actionType === 'update') {
 setPlans(plans.map((plan) => (plan.id === newPlan.id ? newPlan : plan)));
 } else {
 setPlans([...plans, { ...newPlan, id: plans.length + 1 }]);
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

 const handleOpenDeleteDialog = (plan) => {
  handleActionClose();
  setTimeout(() => {
    setPlanToDelete(plan);
    setOpenDeleteDialog(true);
  }, 100);
};

 const handleDeletePlan = () => {
 if (planToDelete) {
 setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
 setOpenDeleteDialog(false);
 setSnackbarMessage('Plan deleted successfully');
 setSnackbarSeverity('success');
 setSnackbarOpen(true);
 }
 };

 const handleLockSubscriptionChange = (event) => {
 setLockSubscription(event.target.checked);
 setSnackbarMessage(`Subscription ${event.target.checked ? 'locked' : 'unlocked'}`);
 setSnackbarSeverity('info');
 setSnackbarOpen(true);
 };

 const handleOpenManagePackages = (plan) => {
  handleActionClose();
  setSelectedPlan(plan);
  setOpenManagePackagesModal(true);
};

 const handleCloseManagePackages = () => {
 setOpenManagePackagesModal(false);
 setSelectedPlan(null);
 };

 const handleSavePackageFeatures = (features) => {
 if (selectedPlan) {
 setPlanPackageFeatures((prev) => ({
 ...prev,
 [selectedPlan.id]: features,
 }));
 setOpenManagePackagesModal(false);
 setSnackbarMessage('Package features updated successfully');
 setSnackbarSeverity('success');
 setSnackbarOpen(true);
 }
 };

 const paginatedPlans = plans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

 return (
 <PageContainer title="Plans" description="This is the Plans page">
 <Breadcrumb title="Plans" items={BCrumb} />
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
 <Typography variant="h4">All Plans</Typography>
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
 <Table aria-label="plan table" sx={{ whiteSpace: 'nowrap' }}>
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
 <Typography variant="h6">Price (₦)</Typography>
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
 <MenuItem onClick={() => handleOpen('update', plan)}>Edit Plan</MenuItem>
 <MenuItem onClick={() => handleOpenManagePackages(plan)}>
 Manage Packages
 </MenuItem>
 <MenuItem onClick={() => handleOpenDeleteDialog(plan)}>
 Delete Plan
 </MenuItem>
 </Menu>
 </TableCell>
 </TableRow>
 ))
 ) : (
 <TableRow>
 <TableCell colSpan={7} sx={{ textAlign: 'center', padding: '40px 0' }}>
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
 No plans have been registered yet. Click 'Add New Plan' to create a new
 plan.
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
 title={actionType === 'create' ? 'Add New Plan' : 'Edit Plan'}
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

 <ConfirmationDialog
 open={openDeleteDialog}
 onClose={() => setOpenDeleteDialog(false)}
 onConfirm={handleDeletePlan}
 title="Delete Plan"
 message={`Are you sure you want to delete ${planToDelete?.name}? This action is irreversible.`}
 confirmText="Delete"
 cancelText="Cancel"
 confirmColor="error"
 severity="error"
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

 {openPackageModal && (
 <PackageModal
 open={openPackageModal}
 onClose={handleClose}
 handleRefresh={() => {}}
 selectedPackage={selectedPlan}
 actionType="update"
 />
 )}

 <ReusableModal
 open={openManagePackagesModal}
 onClose={handleCloseManagePackages}
 title="Manage Basic Plan"
 size="large"
 showDivider={true}
 showCloseButton={true}
 >
 <Box sx={{ mt: 4 }}>
 <ManageModule
 selectedPlan={selectedPlan}
 currentPermissions={selectedPlan ? planPackageFeatures[selectedPlan.id] || [] : []}
 onSave={handleSavePackageFeatures}
 onCancel={handleCloseManagePackages}
 />
 </Box>
 </ReusableModal>
 </ParentCard>
 </PageContainer>
 );
};

export default Plan;