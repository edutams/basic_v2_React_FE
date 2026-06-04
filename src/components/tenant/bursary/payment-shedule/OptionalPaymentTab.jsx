import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
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
  TablePagination,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ReusableModal from '@/components/shared/ReusableModal';

const OptionalPaymentTab = ({ showSnackbar }) => {
  const [currentTerm, setCurrentTerm] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    schedule: null,
  });

  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  const [errors, setErrors] = useState({});

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const [schedules, setSchedules] = useState([
    {
      id: 1,
      paymentName: 'School Bag',
      description: 'Branded school bag, by type.',
      options: [
        { name: 'Trolley Bag', price: '₦18,000' },
        { name: 'Backpack - Large', price: '₦12,000' },
        { name: 'Backpack - Small', price: '₦6,000' },
      ],
      totalTypes: 3,
      totalAmount: '₦36,000',
      category: 'Returning Service',
      classes: 'JSS1, JSS2, JSS3, SS1, SS2, SS3',
      status: 'Active',
    },
    {
      id: 2,
      paymentName: 'School Bus',
      description: 'Branded school bag.',
      options: [
        { name: 'Lagos route', price: '₦20,000' },
        { name: 'Lagos route', price: '₦40,000' },
      ],
      totalTypes: 2,
      totalAmount: '₦60,000',
      category: 'Returning Service',
      classes: 'JSS1, JSS2, JSS3',
      status: 'Active',
    },
    {
      id: 3,
      paymentName: 'Uniform',
      description: 'Day & sports wear in multiple sizes.',
      options: [
        { name: 'Size S', price: '₦35,000' },
        { name: 'Size M', price: '₦45,000' },
      ],
      totalTypes: 2,
      totalAmount: '₦80,00',
      category: 'Returning Service',
      classes: 'SS1, SS2, SS3',
      status: 'Active',
    },
    {
      id: 4,
      paymentName: 'Textbooks',
      description: 'Day & sports wear in multiple sizes.',
      options: [
        { name: 'JSS Bundle', price: '₦20,000' },
        { name: 'SSS Bundle', price: '₦30,000' },
      ],
      totalTypes: 2,
      totalAmount: '₦50,000',
      category: 'Returning Service',
      classes: 'SS1, SS2, SS3',
      status: 'Active',
    },
    {
      id: 5,
      paymentName: 'ICT / Devices',
      description: 'Tablet, ICT lab access.',
      options: [
        { name: 'Tablet rental', price: '₦20,000' },
        { name: 'ICT lab access', price: '₦20,000' },
      ],
      totalTypes: 2,
      totalAmount: '₦40,000',
      category: 'Returning Service',
      classes: 'SS1, SS2, SS3',
      status: 'Inactive',
    },
  ]);

  const handleAddPaymentItem = () => {
    setPaymentDialog({
      open: true,
      isEdit: false,
      data: {
        icon: '',
        paymentName: '',
        description: '',
        options: [{ name: '', price: '' }],
        category: '',
        classes: '',
        status: 'Active',
      },
    });
    setErrors({});
  };

  const handleMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEditSchedule = () => {
    setPaymentDialog({
      open: true,
      isEdit: true,
      data: selectedRow,
    });
    setErrors({});
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    const newStatus = selectedRow.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmDialog({
      open: true,
      title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Payment Schedule`,
      message: (
        <>
          Are you sure you want to {newStatus === 'Active' ? 'activate' : 'deactivate'}{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {selectedRow.paymentName} payment
          </Box>
          ?
        </>
      ),
      onConfirm: () => {
        setSchedules((prev) =>
          prev.map((s) => (s.id === selectedRow.id ? { ...s, status: newStatus } : s)),
        );
        showSnackbar?.(
          `Payment schedule ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`,
          'success',
        );
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
    handleMenuClose();
  };

  const handleRowClick = (schedule) => {
    setDetailsDialog({
      open: true,
      schedule,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialog({ open: false, schedule: null });
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialog({ open: false, isEdit: false, data: null });
    setErrors({});
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    if (!paymentDialog.data?.paymentName?.trim()) {
      newErrors.paymentName = 'Payment name is required';
    }

    if (!paymentDialog.data?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!paymentDialog.data?.category) {
      newErrors.category = 'Payment category is required';
    }

    if (!paymentDialog.data?.classes) {
      newErrors.classes = 'Class selection is required';
    }

    const optionErrors = [];
    paymentDialog.data?.options?.forEach((option, index) => {
      const optionError = {};
      if (!option.name?.trim()) {
        optionError.name = 'Option name is required';
      }
      if (!option.price?.trim()) {
        optionError.price = 'Price is required';
      }
      if (Object.keys(optionError).length > 0) {
        optionErrors[index] = optionError;
      }
    });

    if (optionErrors.length > 0) {
      newErrors.options = optionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePayment = () => {
    if (!validatePaymentForm()) {
      showSnackbar?.('Please fix the errors before submitting', 'error');
      return;
    }

    const totalTypes = paymentDialog.data.options.length;
    const totalAmount = paymentDialog.data.options.reduce((sum, opt) => {
      const price = parseInt(opt.price.replace(/[^\d]/g, ''), 10) || 0;
      return sum + price;
    }, 0);

    const updatedData = {
      ...paymentDialog.data,
      totalTypes,
      totalAmount: `₦${totalAmount.toLocaleString()}`,
    };

    if (paymentDialog.isEdit) {
      setSchedules((prev) => prev.map((s) => (s.id === updatedData.id ? updatedData : s)));
      showSnackbar?.('Payment item updated successfully', 'success');
    } else {
      const newPayment = {
        ...updatedData,
        id: schedules.length + 1,
      };
      setSchedules((prev) => [...prev, newPayment]);
      showSnackbar?.('Payment item added successfully', 'success');
    }
    handlePaymentDialogClose();
  };

  const handleAddOption = () => {
    setPaymentDialog((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        options: [...prev.data.options, { name: '', price: '' }],
      },
    }));
  };

  const handleRemoveOption = (index) => {
    setPaymentDialog((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        options: prev.data.options.filter((_, i) => i !== index),
      },
    }));
    // Clear errors for this option
    if (errors.options?.[index]) {
      const newErrors = { ...errors };
      newErrors.options = newErrors.options.filter((_, i) => i !== index);
      setErrors(newErrors);
    }
  };

  const handleOptionChange = (index, field, value) => {
    setPaymentDialog((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        options: prev.data.options.map((opt, i) =>
          i === index ? { ...opt, [field]: value } : opt,
        ),
      },
    }));
    // Clear error for this field
    if (errors.options?.[index]?.[field]) {
      const newErrors = { ...errors };
      if (newErrors.options[index]) {
        delete newErrors.options[index][field];
        if (Object.keys(newErrors.options[index]).length === 0) {
          newErrors.options[index] = undefined;
        }
      }
      setErrors(newErrors);
    }
  };

  const handleFieldChange = (field, value) => {
    setPaymentDialog((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSearch = () => {
    showSnackbar?.(`Searching for: ${searchQuery}`, 'info');
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const query = searchQuery.toLowerCase();
    return (
      schedule.paymentName.toLowerCase().includes(query) ||
      schedule.description.toLowerCase().includes(query) ||
      schedule.category.toLowerCase().includes(query)
    );
  });

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600} textAlign="center" sx={{ width: '100%' }}>
          Payment Schedules for 2024/2025 -{' '}
          {currentTerm === 0 ? 'First' : currentTerm === 1 ? 'Second' : 'Third'} Term
        </Typography>
      </Alert>

      {/* Term Tabs and Search Row */}
      <Stack spacing={2}>
        {/* Term Tabs */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Tabs
            value={currentTerm}
            onChange={(e, val) => setCurrentTerm(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: { xs: 'auto', sm: 120 },
              },
            }}
          >
            <Tab
              label="First Term"
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
        </Box>

        {/* Search Bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width="100%">
          <TextField
            placeholder="Search optional payment items..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="small"
            onClick={handleSearch}
            fullWidth={{ xs: true, sm: false }}
            sx={{ minWidth: { sm: 100 } }}
          >
            Search
          </Button>
        </Stack>
      </Stack>

      {/* Header and Add Button */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Optional Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Each row is a service with its variants and payment. Click a row to view details.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPaymentItem}
          sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
          fullWidth={{ xs: true, sm: false }}
        >
          Add payment item
        </Button>
      </Stack>

      {/* Scrollable Table for all screen sizes */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Payment Name</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Option Name</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Payment Category</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 100 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((schedule, index) => (
                <TableRow
                  key={schedule.id}
                  hover
                  onClick={() => handleRowClick(schedule)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {schedule.paymentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {schedule.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {schedule.options.map((option, idx) => (
                        <Chip
                          key={idx}
                          label={`${option.name} · ${option.price}`}
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {schedule.totalTypes} types · Total {schedule.totalAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.category}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.classes}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.status}
                      size="small"
                      sx={{
                        bgcolor:
                          schedule.status === 'Active'
                            ? 'rgba(76, 175, 80, 0.1)'
                            : 'rgba(244, 67, 54, 0.1)',
                        color: schedule.status === 'Active' ? '#4CAF50' : '#F44336',
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, schedule);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSchedules.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuOption onClick={handleEditSchedule}>Edit</MenuOption>
        <MenuOption onClick={handleToggleStatus}>
          {selectedRow?.status === 'Active' ? 'Deactivate' : 'Activate'}
        </MenuOption>
      </Menu>

      {/* View Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={handleDetailsDialogClose}
        maxWidth="sm"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {detailsDialog.schedule?.paymentName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {detailsDialog.schedule?.description}
            </Typography>
          </Box>

          <IconButton onClick={handleDetailsDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Status and Category */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Status
                </Typography>

                <Chip
                  label={detailsDialog.schedule?.status}
                  size="small"
                  sx={{
                    bgcolor:
                      detailsDialog.schedule?.status === 'Active'
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(244, 67, 54, 0.1)',
                    color: detailsDialog.schedule?.status === 'Active' ? '#4CAF50' : '#F44336',
                    fontWeight: 600,
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Category
                </Typography>

                <Chip
                  label={detailsDialog.schedule?.category}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(63, 81, 181, 0.08)',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Classes
              </Typography>
              <Chip
                label={detailsDialog.schedule?.classes}
                size="small"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Payment Options ({detailsDialog.schedule?.totalTypes} types)
              </Typography>

              <Stack spacing={1.5} mt={2}>
                {detailsDialog.schedule?.options.map((option, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {option.name}
                    </Typography>

                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {option.price}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {detailsDialog.schedule?.totalAmount}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button onClick={handleDetailsDialogClose} fullWidth={{ xs: true, sm: false }}>
            Close
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              handleDetailsDialogClose();
              setPaymentDialog({
                open: true,
                isEdit: true,
                data: detailsDialog.schedule,
              });
            }}
            fullWidth={{ xs: true, sm: false }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Payment Modal */}
      <ReusableModal
        open={paymentDialog.open}
        onClose={handlePaymentDialogClose}
        title={paymentDialog.isEdit ? 'Edit Optional Payment Item' : 'Create Optional Payment Item'}
        subtitle="Configure optional payment item details with multiple pricing options"
        size="large"
        showCloseButton={true}
        showDivider={true}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              p: 2,
              bgcolor: paymentDialog.isEdit ? 'warning.lighter' : 'info.light',
              borderRadius: 1,
              border: '1px solid',
              borderColor: paymentDialog.isEdit ? 'warning.light' : 'info.light',
            }}
          >
            <Typography
              variant="caption"
              color={paymentDialog.isEdit ? 'warning.main' : 'info.main'}
            >
              {paymentDialog.isEdit ? '✏️ ' : '💡 '}
              <strong>{paymentDialog.isEdit ? 'Edit Mode:' : 'Tip:'}</strong>{' '}
              {paymentDialog.isEdit
                ? 'Update the payment item details below. Changes will apply to all selected classes.'
                : 'Create optional payment items with multiple variants and prices for different classes.'}
            </Typography>
          </Box>

          {/* Optional Payment Name */}
          <TextField
            fullWidth
            label="Optional Payment Name"
            value={paymentDialog.data?.paymentName || ''}
            onChange={(e) => handleFieldChange('paymentName', e.target.value)}
            error={!!errors.paymentName}
            helperText={errors.paymentName}
            placeholder="e.g., School Bag"
            required
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={paymentDialog.data?.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Brief description of the payment item"
            required
          />

          {/* Option Name - with Add button aligned to right */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="body2" fontWeight={600}>
                Option Name <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddOption}
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Add
              </Button>
            </Box>

            <Stack spacing={2}>
              {paymentDialog.data?.options?.map((option, index) => (
                <Box key={index}>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <TextField
                      fullWidth
                      placeholder="Option name"
                      value={option.name}
                      onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                      size="medium"
                      error={!!errors.options?.[index]?.name}
                      helperText={errors.options?.[index]?.name}
                    />
                    <TextField
                      fullWidth
                      placeholder="Price (₦)"
                      value={option.price}
                      onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                      size="medium"
                      error={!!errors.options?.[index]?.price}
                      helperText={errors.options?.[index]?.price}
                    />
                    {paymentDialog.data?.options?.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveOption(index)}
                        sx={{ color: 'error.main', mt: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Payment Category and Class */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Payment Category</InputLabel>
                <Select
                  value={paymentDialog.data?.category || ''}
                  label="Payment Category"
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                >
                  <MenuItem value="Returning Service">Returning Service</MenuItem>
                  <MenuItem value="One-time Payment">One-time Payment</MenuItem>
                  <MenuItem value="Subscription">Subscription</MenuItem>
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.classes} required>
                <InputLabel>Class Applicable</InputLabel>
                <Select
                  value={paymentDialog.data?.classes || ''}
                  label="Class Applicable"
                  onChange={(e) => handleFieldChange('classes', e.target.value)}
                >
                  <MenuItem value="JSS1">JSS1</MenuItem>
                  <MenuItem value="JSS2">JSS2</MenuItem>
                  <MenuItem value="JSS3">JSS3</MenuItem>
                  <MenuItem value="SS1">SS1</MenuItem>
                  <MenuItem value="SS2">SS2</MenuItem>
                  <MenuItem value="SS3">SS3</MenuItem>
                </Select>
                {errors.classes && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.classes}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Selected Classes Display */}
          {paymentDialog.data?.classes && (
            <Box
              sx={{
                bgcolor: 'rgba(33, 150, 243, 0.08)',
                p: 2,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {paymentDialog.data.classes}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
            <Button onClick={handlePaymentDialogClose} variant="outlined">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSavePayment} sx={{ fontWeight: 600 }}>
              {paymentDialog.isEdit ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </ReusableModal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 2, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            color="inherit"
            onClick={handleConfirmDialogClose}
            fullWidth={{ xs: true, sm: false }}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDialog.onConfirm}
            sx={{ fontWeight: 600, order: { xs: 1, sm: 2 } }}
            fullWidth={{ xs: true, sm: false }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OptionalPaymentTab;
