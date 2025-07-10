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
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  Button,
  TextField,
} from '@mui/material';
import { IconSchool } from '@tabler/icons-react';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReusableModal from '../../components/shared/ReusableModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import FormDialog from '../../components/shared/FormDialog';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'My Plans' }];

const MyPlan = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Entry-level plan for small classes',
      basePrice: 5000.00,
      price: 4500.00,
      studentLimit: '1-50',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Basic +',
      description: 'Mid-tier plan for medium-sized classes',
      basePrice: 10000.00,
      price: 9000.00,
      studentLimit: '51-99',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Basic ++',
      description: 'Advanced plan for large institutions',
      basePrice: 20000.00,
      price: 18000.00,
      studentLimit: '100-199',
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Basic Custom',
      description: 'Comprehensive plan for custom use',
      basePrice: 50000.00,
      price: 45000.00,
      studentLimit: '200 and Above',
      status: 'Active'
    }
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [planToDeactivate, setPlanToDeactivate] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const studentLimitOptions = [
    '0 - 99 Students',
    '100 - 199 Students',
    '200 - 299 Students',
    '300+ Students',
  ];
  const [selectedStudentLimit, setSelectedStudentLimit] = useState(studentLimitOptions[0]);
  const [showModules, setShowModules] = useState(false);
  const mockModules = [
    { id: 1, name: 'Attendance', description: 'Track student attendance' },
    { id: 2, name: 'Grading', description: 'Manage grades and assessments' },
    { id: 3, name: 'Communication', description: 'Send messages to students' },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    handleActionClose();
    setSelectedPlan(plan);
    setOpenViewModal(true);
  };

  const handleViewClose = () => {
    setOpenViewModal(false);
    setSelectedPlan(null);
  };

  const handleEditPlan = (plan) => {
    handleActionClose();
    setEditPlan(plan);
    setEditName(plan.name);
    setEditPrice(plan.price);
    setOpenEditModal(true);
  };
  const handleEditSave = (e) => {
    e.preventDefault();
    setPlans((prev) =>
      prev.map((p) =>
        p.id === editPlan.id ? { ...p, name: editName, price: parseFloat(editPrice) } : p
      )
    );
    setOpenEditModal(false);
    setSnackbarMessage('Plan updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const paginatedPlans = plans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <PageContainer title="My Plans" description="This is the My Plans page">
      <Breadcrumb title="My Plans" items={BCrumb} />
      <ParentCard title={<Typography variant="h5">All My Plans</Typography>}>
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
                        <Typography variant="h6">₦{plan.basePrice.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">
                          ₦{(plan.price || 0).toFixed(2)}
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
                          <MenuItem onClick={() => handleViewPlan(plan)}>View Plan Details</MenuItem>
                          <MenuItem onClick={() => handleEditPlan(plan)}>Edit Plan Details</MenuItem>
                          <MenuItem onClick={() => handleOpenDeactivateDialog(plan)}>
                            {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </MenuItem>
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
                          No plans have been registered yet.
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
          open={openViewModal}
          onClose={() => { handleViewClose(); setShowModules(false); }}
          title="View Details"
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Students Limit
              </Typography>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  display: 'inline-block',
                  bgcolor: '#f5f6fa',
                  px: 2,
                  py: 1,
                  width: '100%',
                }}
              >
                <Typography variant="body1" sx={{ fontSize: 16 }}>
                  {selectedPlan?.studentLimit ? `${selectedPlan.studentLimit} Students` : 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                border: '1px solid #bada55',
                borderRadius: 1,
                p: 3,
                mb: 2,
                bgcolor: '#fff',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {selectedPlan?.name?.toUpperCase()} (₦{selectedPlan?.price?.toLocaleString()})
              </Typography>
              <Button
                variant="text"
                color="primary"
                sx={{ textTransform: 'none', fontWeight: 500, fontSize: 18 }}
                onClick={() => setShowModules((prev) => !prev)}
              >
                {showModules ? 'Hide Modules' : 'View Modules'}
              </Button>
              {showModules && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Modules
                  </Typography>
                  {mockModules.map((module) => (
                    <Box key={module.id} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="body1" fontWeight={600}>{module.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{module.description}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </ReusableModal>

        {/* Edit Plan Modal using ReusableModal */}
        <ReusableModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          title="Edit Plan"
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <form onSubmit={handleEditSave}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Plan Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Price (₦)"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={() => setOpenEditModal(false)} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
              </Box>
            </Box>
          </form>
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