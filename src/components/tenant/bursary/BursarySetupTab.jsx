import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  MenuItem,
  TextField,
  Stack,
  Switch,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import { IconPlus, IconEdit, IconDotsVertical, IconCheck, IconX } from '@tabler/icons-react';
import { Payments as PaymentsIcon, TaskAlt as TaskAltIcon } from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableModal from '@/components/shared/ReusableModal';
import CategoryModal from '@/components/tenant/bursary/CategoryModal';
import InstalmentModal from '@/components/tenant/bursary/InstalmentModal';

import { useEffect } from 'react';
import {
  fetchPaymentCategories,
  createPaymentCategory,
  updatePaymentCategory,
  togglePaymentCategoryStatus,
} from '@/api/tenant/bursary/paymentCategoryApi';
import {
  fetchInstallments,
  createInstallment,
  updateInstallment,
  toggleInstallmentStatus,
} from '@/api/tenant/bursary/installmentApi';

const StatusChip = ({ status }) => {
  const isActive = status === 'active';
  return (
    <Box
      component="span"
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: isActive ? 'success.light' : 'error.light',
        color: isActive ? 'success.dark' : 'error.dark',
      }}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Box>
  );
};

const BursarySetupTab = ({
  sessionTerms,
  selectedSessionTerm,
  setSelectedSessionTerm,
  categories,
  setCategories,
  instalments,
  setInstalments,
  showSnackbar,
}) => {
  const [collectionMethod, setCollectionMethod] = useState('single');
  const [instalmentStyle, setInstalmentStyle] = useState('percentage');
  const [gatewayPayer, setGatewayPayer] = useState('parent');
  const [requirePaymentForResults, setRequirePaymentForResults] = useState(true);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [instalmentModalOpen, setInstalmentModalOpen] = useState(false);
  const [editingInstalment, setEditingInstalment] = useState(null);
  const [instalmentMenuAnchor, setInstalmentMenuAnchor] = useState(null);
  const [selectedInstalment, setSelectedInstalment] = useState(null);

  const [categoryActionLoading, setCategoryActionLoading] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState({ open: false, category: null });

  const [instalmentActionLoading, setInstalmentActionLoading] = useState(false);
  const [confirmInstalmentStatusModal, setConfirmInstalmentStatusModal] = useState({
    open: false,
    instalment: null,
  });

  const loadCategories = async () => {
    try {
      const res = await fetchPaymentCategories();
      setCategories(res.data?.data || []);
    } catch {
      showSnackbar('Failed to load categories', 'error');
    }
  };

  const loadInstalments = async () => {
    try {
      const res = await fetchInstallments();
      const mapped = (res.data?.data || []).map((i) => ({
        ...i,
        options: `${i.inst1} : ${i.inst2}`,
      }));
      setInstalments(mapped);
    } catch {
      showSnackbar('Failed to load instalment plans', 'error');
    }
  };

  useEffect(() => {
    loadCategories();
    loadInstalments();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
    setCategoryMenuAnchor(null);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        const res = await updatePaymentCategory(editingCategory.id, categoryData);
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.data : c)));
        showSnackbar(res.message);
      } else {
        const res = await createPaymentCategory(categoryData);
        setCategories((prev) => [...prev, res.data]);
        showSnackbar(res.message);
      }
      setCategoryModalOpen(false);
    } catch {
      showSnackbar('Failed to save category', 'error');
    }
  };

  const handleToggleCategoryStatus = async () => {
    const category = confirmStatusModal.category;
    if (!category) return;

    setCategoryActionLoading(true);
    try {
      const res = await togglePaymentCategoryStatus(category.id);
      setCategories((prev) => prev.map((c) => (c.id === category.id ? res.data : c)));
      showSnackbar(
        `Category ${res.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      );
      setConfirmStatusModal({ open: false, category: null });
      setCategoryMenuAnchor(null);
    } catch {
      showSnackbar('Failed to update status', 'error');
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const handleAddInstalment = () => {
    setEditingInstalment(null);
    setInstalmentModalOpen(true);
  };

  const handleEditInstalment = (instalment) => {
    setEditingInstalment(instalment);
    setInstalmentModalOpen(true);
    setInstalmentMenuAnchor(null);
  };

  const handleSaveInstalment = async (instalmentData) => {
    try {
      if (editingInstalment) {
        const res = await updateInstallment(editingInstalment.id, {
          first_installment: parseInt(instalmentData.options.split(':')[0].trim()),
          second_installment: parseInt(instalmentData.options.split(':')[1].trim()),
          status: instalmentData.status,
        });
        const updated = { ...res.data, options: `${res.data.inst1} : ${res.data.inst2}` };
        setInstalments((prev) => prev.map((i) => (i.id === editingInstalment.id ? updated : i)));
        showSnackbar(res.message);
      } else {
        const res = await createInstallment({
          first_installment: parseInt(instalmentData.options.split(':')[0].trim()),
          second_installment: parseInt(instalmentData.options.split(':')[1].trim()),
          status: instalmentData.status,
        });
        const created = { ...res.data, options: `${res.data.inst1} : ${res.data.inst2}` };
        setInstalments((prev) => [...prev, created]);
        showSnackbar(res.message);
      }
      setInstalmentModalOpen(false);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to save instalment plan', 'error');
    }
  };

  const handleToggleInstalmentStatus = async () => {
    const instalment = confirmInstalmentStatusModal.instalment;
    if (!instalment) return;
    setInstalmentActionLoading(true);
    try {
      const res = await toggleInstallmentStatus(instalment.id);
      const updated = { ...res.data, options: `${res.data.inst1} : ${res.data.inst2}` };
      setInstalments((prev) => prev.map((i) => (i.id === instalment.id ? updated : i)));
      showSnackbar(
        `Instalment ${res.data.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      );
      setConfirmInstalmentStatusModal({ open: false, instalment: null });
      setInstalmentMenuAnchor(null);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setInstalmentActionLoading(false);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <ParentCard title="Select Session Term">
          <TextField
            select
            label="Select Session Term"
            value={selectedSessionTerm}
            onChange={(e) => setSelectedSessionTerm(e.target.value)}
            size="small"
          >
            {sessionTerms.map((term) => (
              <MenuItem key={term.id} value={term.id}>
                {term.label}
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" alignItems="flex-start" gap={2} mb={3} mt={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PaymentsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600}>
                How should fees be collected?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Choose how parents pay and who covers the gateway charges.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                }}
              >
                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                    Collection method
                  </FormLabel>
                  <RadioGroup
                    value={collectionMethod}
                    onChange={(e) => setCollectionMethod(e.target.value)}
                  >
                    <Stack spacing={2}>
                      <FormControlLabel
                        value="single"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Single payment
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              All fees collected together in one transaction.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                      <FormControlLabel
                        value="per_fee"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Pay per fee
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Each fee is processed separately.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                }}
              >
                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                    Installment style
                  </FormLabel>
                  <RadioGroup
                    value={instalmentStyle}
                    onChange={(e) => setInstalmentStyle(e.target.value)}
                  >
                    <Stack spacing={2}>
                      <FormControlLabel
                        value="percentage"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              By percentage
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              e.g. 60% now, 40% later.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                      <FormControlLabel
                        value="amount"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              By amount
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pay any amount, anytime.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                }}
              >
                <FormControl fullWidth>
                  <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                    Who pays gateway charges?
                  </FormLabel>
                  <RadioGroup
                    value={gatewayPayer}
                    onChange={(e) => setGatewayPayer(e.target.value)}
                  >
                    <Stack spacing={2}>
                      <FormControlLabel
                        value="parent"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Parent / Student
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Charges added on top of the fee.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                      <FormControlLabel
                        value="school"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              School
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              School absorbs the charges.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          m: 0,
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          alignItems: 'flex-start',
                        }}
                      />
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </ParentCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ParentCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}
                    >
                      <PaymentsIcon size={20} />
                    </Box>
                    <Box>
                      <Typography variant="h6">Payment categories</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Target students for waivers, etc.
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleAddCategory}
                    sx={{ fontWeight: 600 }}
                  >
                    Add Category
                  </Button>
                </Box>
              }
            >
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category, index) => (
                      <TableRow key={category.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell align="center">
                          <StatusChip status={category.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setCategoryMenuAnchor(e.currentTarget);
                              setSelectedCategory(category);
                            }}
                          >
                            <IconDotsVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={100} align="center">
                          <Alert
                            severity="info"
                            sx={{
                              mb: 3,
                              width: '100%',
                              justifyContent: 'center',
                              textAlign: 'center',
                              '& .MuiAlert-icon': {
                                mr: 1.5,
                              },
                            }}
                          >
                            No records found
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ParentCard
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}
                    >
                      <TaskAltIcon size={20} />
                    </Box>
                    <Box>
                      <Typography variant="h6">Installment plans</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Split options parents can pick from.
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleAddInstalment}
                    sx={{ fontWeight: 600 }}
                  >
                    Add New
                  </Button>
                </Box>
              }
            >
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Installment Options (%)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instalments.map((instalment, index) => (
                      <TableRow key={instalment.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{instalment.options}</TableCell>
                        <TableCell align="center">
                          <StatusChip status={instalment.status} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setInstalmentMenuAnchor(e.currentTarget);
                              setSelectedInstalment(instalment);
                            }}
                          >
                            <IconDotsVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {instalments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={100} align="center">
                          <Alert
                            severity="info"
                            sx={{
                              mb: 3,
                              width: '100%',
                              justifyContent: 'center',
                              textAlign: 'center',
                              '& .MuiAlert-icon': {
                                mr: 1.5,
                              },
                            }}
                          >
                            No records found
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ParentCard>
          </Grid>
        </Grid>

        <ParentCard>
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PaymentsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Result viewing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Control whether students can see results before paying.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: '#f6f6f6',
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Require payment before students can view results
              </Typography>
              <Typography variant="caption" color="textSecondary">
                When on, unpaid students will see a payment prompt instead of their results.
              </Typography>
            </Box>
            <Switch
              checked={requirePaymentForResults}
              onChange={(e) => setRequirePaymentForResults(e.target.checked)}
              color="primary"
            />
          </Box>
        </ParentCard>
      </Stack>

      {/* Category Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => {
          setCategoryMenuAnchor(null);
          setSelectedCategory(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setConfirmStatusModal({ open: true, category: selectedCategory });
            setCategoryMenuAnchor(null);
          }}
          sx={{
            color: selectedCategory?.status === 'active' ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            {selectedCategory?.status === 'active' ? (
              <IconX size={18} color="currentColor" />
            ) : (
              <IconCheck size={18} color="currentColor" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedCategory?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedCategory && handleEditCategory(selectedCategory)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Description</ListItemText>
        </MenuItem>
      </Menu>

      {/* Instalment Menu */}
      <Menu
        anchorEl={instalmentMenuAnchor}
        open={Boolean(instalmentMenuAnchor)}
        onClose={() => {
          setInstalmentMenuAnchor(null);
          setSelectedInstalment(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setConfirmInstalmentStatusModal({ open: true, instalment: selectedInstalment });
            setInstalmentMenuAnchor(null);
          }}
          sx={{
            color: selectedInstalment?.status === 'active' ? 'error.main' : 'success.main',
          }}
        >
          <ListItemIcon>
            {selectedInstalment?.status === 'active' ? (
              <IconX size={18} color="currentColor" />
            ) : (
              <IconCheck size={18} color="currentColor" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedInstalment?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedInstalment && handleEditInstalment(selectedInstalment)}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit Installment</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirm Status Modal */}
      <ReusableModal
        open={confirmStatusModal.open}
        onClose={() => setConfirmStatusModal({ open: false, category: null })}
        title={
          confirmStatusModal.category?.status === 'active'
            ? 'Deactivate Category'
            : 'Activate Category'
        }
        size="small"
        showCloseButton
        showDivider
      >
        <Stack spacing={3}>
          <Typography variant="body2">
            Are you sure you want to{' '}
            <strong>
              {confirmStatusModal.category?.status === 'active' ? 'deactivate' : 'activate'}
            </strong>{' '}
            the category <strong>"{confirmStatusModal.category?.name}"</strong>?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => setConfirmStatusModal({ open: false, category: null })}
              disabled={categoryActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={confirmStatusModal.category?.status === 'active' ? 'error' : 'success'}
              onClick={handleToggleCategoryStatus}
              disabled={categoryActionLoading}
            >
              {categoryActionLoading
                ? 'Updating...'
                : confirmStatusModal.category?.status === 'active'
                  ? 'Deactivate'
                  : 'Activate'}
            </Button>
          </Stack>
        </Stack>
      </ReusableModal>

      {/* Instalment Modal */}
      <ReusableModal
        open={confirmInstalmentStatusModal.open}
        onClose={() => setConfirmInstalmentStatusModal({ open: false, instalment: null })}
        title={
          confirmInstalmentStatusModal.instalment?.status === 'active'
            ? 'Deactivate Instalment Plan'
            : 'Activate Instalment Plan'
        }
        size="small"
        showCloseButton
        showDivider
      >
        <Stack spacing={3}>
          <Typography variant="body2">
            Are you sure you want to{' '}
            <strong>
              {confirmInstalmentStatusModal.instalment?.status === 'active'
                ? 'deactivate'
                : 'activate'}
            </strong>{' '}
            the instalment plan{' '}
            <strong>"{confirmInstalmentStatusModal.instalment?.options}"</strong>?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => setConfirmInstalmentStatusModal({ open: false, instalment: null })}
              disabled={instalmentActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={
                confirmInstalmentStatusModal.instalment?.status === 'active' ? 'error' : 'success'
              }
              onClick={handleToggleInstalmentStatus}
              disabled={instalmentActionLoading}
            >
              {instalmentActionLoading
                ? 'Updating...'
                : confirmInstalmentStatusModal.instalment?.status === 'active'
                  ? 'Deactivate'
                  : 'Activate'}
            </Button>
          </Stack>
        </Stack>
      </ReusableModal>

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <InstalmentModal
        open={instalmentModalOpen}
        onClose={() => setInstalmentModalOpen(false)}
        onSave={handleSaveInstalment}
        instalment={editingInstalment}
      />
    </>
  );
};

export default BursarySetupTab;
