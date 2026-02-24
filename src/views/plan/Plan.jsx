import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  useTheme,
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
import eduTierApi from '../../api/eduTierApi';

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
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [packages, setPackages] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansData, modulesData, packagesData] = await Promise.all([
        eduTierApi.getPlans(),
        eduTierApi.getModules(),
        eduTierApi.getPackages(),
      ]);
      setPlans(plansData);
      setModules(modulesData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setSnackbarMessage('Failed to load data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAddPlan = async (newPlan) => {
    try {
      await eduTierApi.savePlan(newPlan);
      setSnackbarMessage(`Plan ${actionType === 'create' ? 'added' : 'updated'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClose();
      fetchData();
    } catch (error) {
      setSnackbarMessage(`Failed to ${actionType} plan`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
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

  const handleDeletePlan = async () => {
    if (planToDelete) {
      try {
        await eduTierApi.deletePlan(planToDelete.id);
        setOpenDeleteDialog(false);
        setSnackbarMessage('Plan deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchData();
      } catch (error) {
        setSnackbarMessage('Failed to delete plan');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
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

  const handleSavePackageFeatures = async (features) => {
    if (selectedPlan) {
      try {
        await eduTierApi.savePlanModules(selectedPlan.id, features);
        setOpenManagePackagesModal(false);
        setSnackbarMessage('Plan modules updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchData();
      } catch (error) {
        setSnackbarMessage('Failed to update plan modules');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const paginatedPlans = plans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageContainer title="Plans" description="This is the Plans page">
      <Breadcrumb title="Plans" items={BCrumb} />
      <ParentCard
        title={
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: 2,
              }}
            >
              <Typography variant="h5">All Plans</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {!isMobileOrTablet && (
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
                    sx={{ m: 0 }}
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpen('create')}
                  sx={{ minWidth: 120 }}
                >
                  Add New Plan
                </Button>
              </Box>
            </Box>
            {isMobileOrTablet && (
              <Box sx={{ mt: 2, width: '100%' }}>
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
                  sx={{ m: 0 }}
                />
              </Box>
            )}
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
                        <Typography variant="h6">₦{parseFloat(plan.price).toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">
                          {plan.data ? JSON.parse(plan.data).students_limit : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              plan.status === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.primary.light,
                            color:
                              plan.status === 'active'
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
          title={`Module Configuration - ${selectedPlan?.name || 'Plan'}`}
          size="large"
          showDivider={true}
          showCloseButton={true}
        >
          <Box sx={{ mt: 4 }}>
            <ManageModule
              selectedPlan={selectedPlan}
              currentPermissions={selectedPlan?.modules?.map(m => m.id) || []}
              modules={modules}
              packages={packages}
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