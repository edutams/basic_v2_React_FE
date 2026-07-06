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
  Divider,
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
import {
  changeBursarySetting,
  fetchBursarySettings,
  setActiveSessionTerm,
} from '@/api/tenant/bursary/bursarySettingsApi';
import {
  fetchResultPaymentSettings,
  saveResultPaymentSettings,
} from '@/api/tenant/bursary/bursaryResultSettingsApi';
import useNotification from '@/hooks/useNotification';

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
  onStatsChange,
  showSnackbar,
}) => {
  const notify = useNotification();

  const [collectionMethod, setCollectionMethod] = useState('single');
  const [instalmentStyle, setInstalmentStyle] = useState('percentage');
  const [gatewayPayer, setGatewayPayer] = useState('parent');

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

  const [categories, setCategories] = useState([]);
  const [instalments, setInstalments] = useState([]);

  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingCode, setSavingCode] = useState(null);

  const [resultSettings, setResultSettings] = useState({
    pay_condition: 'no',
    pay_type: '',
    pay_method: '',
    compulsory_pay_method: '',
    optional_pay_method: '',
  });
  const [savingResultSettings, setSavingResultSettings] = useState(false);

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryMeta, setCategoryMeta] = useState(null);

  const [instalmentPage, setInstalmentPage] = useState(1);
  const [instalmentMeta, setInstalmentMeta] = useState(null);

  const loadResultSettings = async () => {
    try {
      const res = await fetchResultPaymentSettings();

      if (res.status) {
        setResultSettings({
          pay_condition: res.data.pay_condition || 'no',
          pay_type: res.data.pay_type || '',
          pay_method: res.data.pay_method || '',
          compulsory_pay_method: res.data.compulsory_pay_method || '',
          optional_pay_method: res.data.optional_pay_method || '',
        });
      } else {
        notify.info(res.message);
      }
    } catch (err) {
      notify.info(err?.response?.data?.message);
    }
  };

  const loadCategories = async (page = 1) => {
    try {
      const res = await fetchPaymentCategories(page);
      setCategories(res.data?.data || []);
      setCategoryMeta(res.data || null);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to load categories', 'error');
    }
  };

  const loadInstalments = async (page = 1) => {
    try {
      const res = await fetchInstallments(page);
      const mapped = (res.data?.data || []).map((i) => ({
        ...i,
        options: `${i.inst1} : ${i.inst2}`,
      }));
      setInstalments(mapped);
      setInstalmentMeta(res.data);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to load instalments', 'error');
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetchBursarySettings();
      const map = {};
      (res.data?.data || []).forEach((s) => {
        map[s.code] = {
          ...s,
          options: typeof s.options === 'string' ? JSON.parse(s.options) : s.options,
        };
      });
      setSettings(map);

      // seed local radio states from DB values
      if (map.fee_collection_method) setCollectionMethod(map.fee_collection_method.value);
      if (map.installment_style) setInstalmentStyle(map.installment_style.value);
      if (map.gateway_charge_bearer) setGatewayPayer(map.gateway_charge_bearer.value);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to load settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    onStatsChange?.({
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.status === 'active').length,
      totalInstalments: instalments.length,
      activeInstalments: instalments.filter((i) => i.status === 'active').length,
    });
  }, [categories, instalments]);

  useEffect(() => {
    loadCategories(categoryPage);
  }, [categoryPage]);

  useEffect(() => {
    loadInstalments(instalmentPage);
  }, [instalmentPage]);

  // keep settings and result settings load separate
  useEffect(() => {
    loadSettings();
    loadResultSettings();
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

  const handleSettingChange = async (code, value) => {
    // optimistically update local state first
    if (code === 'fee_collection_method') setCollectionMethod(value);
    if (code === 'installment_style') setInstalmentStyle(value);
    if (code === 'gateway_charge_bearer') setGatewayPayer(value);

    setSavingCode(code);
    try {
      const res = await changeBursarySetting(code, value);
      setSettings((prev) => ({ ...prev, [code]: { ...prev[code], value } }));
      showSnackbar(res.message || 'Setting saved successfully');
    } catch {
      // revert on failure
      if (code === 'fee_collection_method')
        setCollectionMethod(settings.fee_collection_method?.value);
      if (code === 'installment_style') setInstalmentStyle(settings.installment_style?.value);
      if (code === 'gateway_charge_bearer') setGatewayPayer(settings.gateway_charge_bearer?.value);
      showSnackbar('Failed to save setting', 'error');
    } finally {
      setSavingCode(null);
    }
  };

  const handleBursarySessionTermChange = async (termId) => {
    setSelectedSessionTerm(termId);
    setSavingCode('active_ses_term');
    try {
      const res = await setActiveSessionTerm(termId);
      showSnackbar(res.message || 'Bursary session term updated successfully');
    } catch {
      showSnackbar('Failed to update bursary session term', 'error');
    } finally {
      setSavingCode(null);
    }
  };

  const handleSaveResultSettings = async (updatedSettings) => {
    setSavingResultSettings(true);
    try {
      const res = await saveResultPaymentSettings({
        ...updatedSettings,
        // session_term_id: selectedSessionTerm,
      });
      showSnackbar(res.message);
      loadResultSettings();
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to save result settings', 'error');
    } finally {
      setSavingResultSettings(false);
    }
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
        <ParentCard>
          {/* Session Term */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Set Bursary Active Session Term
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              This determines which session term bursary fees are being collected for.
            </Typography>
            <TextField
              select
              label="Select Session Term"
              value={selectedSessionTerm}
              onChange={(e) => handleBursarySessionTermChange(e.target.value)}
              size="small"
              disabled={savingCode === 'active_ses_term'}
              sx={{ minWidth: 280 }}
            >
              {sessionTerms.map((term) => (
                <MenuItem key={term.id} value={term.id}>
                  {term.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
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
            {/* Collection Method */}
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
                    {settings.fee_collection_method?.name || 'Collection method'}
                  </FormLabel>
                  <RadioGroup
                    value={collectionMethod}
                    onChange={(e) => handleSettingChange('fee_collection_method', e.target.value)}
                  >
                    <Stack spacing={2}>
                      {(settings.fee_collection_method?.options || []).map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          value={opt.value}
                          disabled={savingCode === 'fee_collection_method'}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {opt.value === 'single_payment' ? 'Single payment' : 'Pay per fee'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {opt.text}
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
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            {/* Instalment Style */}
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
                    {settings.installment_style?.name || 'Installment style'}
                  </FormLabel>
                  <RadioGroup
                    value={instalmentStyle}
                    onChange={(e) => handleSettingChange('installment_style', e.target.value)}
                  >
                    <Stack spacing={2}>
                      {(settings.installment_style?.options || []).map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          value={opt.value}
                          disabled={savingCode === 'installment_style'}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {opt.value === 'percentage' ? 'By percentage' : 'By amount'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {opt.text}
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
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            {/* Gateway Payer */}
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
                    {settings.gateway_charge_bearer?.name || 'Who pays gateway charges?'}
                  </FormLabel>
                  <RadioGroup
                    value={gatewayPayer}
                    onChange={(e) => handleSettingChange('gateway_charge_bearer', e.target.value)}
                  >
                    <Stack spacing={2}>
                      {(settings.gateway_charge_bearer?.options || []).map((opt) => (
                        <FormControlLabel
                          key={opt.value}
                          value={opt.value}
                          disabled={savingCode === 'gateway_charge_bearer'}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {opt.value === 'client' ? 'Parent / Student' : 'School'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {opt.text}
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
                      ))}
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
                  <Button variant="contained" size="small" startIcon={<IconPlus />}
                    onClick={handleAddCategory}
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
              {/* Categories Pagination */}
              {categoryMeta && (
                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1.5}>
                  <Typography variant="caption" color="text.secondary">
                    {categoryMeta.total > 0
                      ? `${categoryMeta.from}–${categoryMeta.to} of ${categoryMeta.total}`
                      : ''}
                  </Typography>
                  <Button variant="contained" size="small" disabled={!categoryMeta.prev_page_url} onClick={() => setCategoryPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <Button variant="contained" size="small" disabled={!categoryMeta.next_page_url} onClick={() => setCategoryPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </Box>
              )}
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
                  <Button variant="contained" size="small" startIcon={<IconPlus />}
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
              {/* Instalments Pagination */}
              {instalmentMeta && (
                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1} mt={1.5}>
                  <Typography variant="caption" color="text.secondary">
                    {instalmentMeta.total > 0
                      ? `${instalmentMeta.from}–${instalmentMeta.to} of ${instalmentMeta.total}`
                      : ''}
                  </Typography>
                  <Button variant="contained" size="small" disabled={!instalmentMeta.prev_page_url} onClick={() => setInstalmentPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <Button variant="contained" size="small" disabled={!instalmentMeta.next_page_url} onClick={() => setInstalmentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </Box>
              )}
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

          {/* Main toggle */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: '#f6f6f6',
              borderRadius: 2,
              mb: 2,
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
              checked={resultSettings.pay_condition === 'yes'}
              onChange={(e) => {
                const updated = {
                  ...resultSettings,
                  pay_condition: e.target.checked ? 'yes' : 'no',
                  pay_type: '',
                  pay_method: '',
                  compulsory_pay_method: '',
                  optional_pay_method: '',
                };
                setResultSettings(updated);
                // auto save when toggled off
                if (!e.target.checked) handleSaveResultSettings(updated);
              }}
              color="primary"
            />
          </Box>

          {/* Expanded options when switch is ON */}
          {resultSettings.pay_condition === 'yes' && (
            <Stack
              spacing={3}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              {/* Pay Type */}
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Payment Type
                </FormLabel>
                <TextField
                  select
                  size="small"
                  value={resultSettings.pay_type}
                  onChange={(e) =>
                    setResultSettings((prev) => ({
                      ...prev,
                      pay_type: e.target.value,
                      pay_method: '',
                      compulsory_pay_method: '',
                      optional_pay_method: '',
                    }))
                  }
                  sx={{ maxWidth: 300 }}
                >
                  <MenuItem value="compulsory">Compulsory</MenuItem>
                  <MenuItem value="optional">Optional</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </TextField>
              </FormControl>

              {/* Pay Method — shown when compulsory or optional */}
              {(resultSettings.pay_type === 'compulsory' ||
                resultSettings.pay_type === 'optional') && (
                  <FormControl>
                    <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      Payment Method
                    </FormLabel>
                    <RadioGroup
                      row
                      value={resultSettings.pay_method}
                      onChange={(e) =>
                        setResultSettings((prev) => ({ ...prev, pay_method: e.target.value }))
                      }
                    >
                      <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                      <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
                    </RadioGroup>
                  </FormControl>
                )}

              {/* Split method — shown when "both" */}
              {resultSettings.pay_type === 'both' && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Typography variant="body2" fontWeight={600} mb={1}>
                        Compulsory Payment Method
                      </Typography>
                      <RadioGroup
                        row
                        value={resultSettings.compulsory_pay_method}
                        onChange={(e) =>
                          setResultSettings((prev) => ({
                            ...prev,
                            compulsory_pay_method: e.target.value,
                          }))
                        }
                      >
                        <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                        <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
                      </RadioGroup>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Typography variant="body2" fontWeight={600} mb={1}>
                        Optional Payment Method
                      </Typography>
                      <RadioGroup
                        row
                        value={resultSettings.optional_pay_method}
                        onChange={(e) =>
                          setResultSettings((prev) => ({
                            ...prev,
                            optional_pay_method: e.target.value,
                          }))
                        }
                      >
                        <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                        <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
                      </RadioGroup>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Save button */}
              <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" size="small" disabled={savingResultSettings || !resultSettings.pay_type || (resultSettings.pay_type !== 'both' && !resultSettings.pay_method) || (resultSettings.pay_type === 'both' && (!resultSettings.compulsory_pay_method || !resultSettings.optional_pay_method))} onClick={() => handleSaveResultSettings(resultSettings)}
                  sx={{ fontWeight: 600 }}
                >
                  {savingResultSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Stack>
          )}
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
            <Button variant="contained" size="small" onClick={() => setConfirmStatusModal({ open: false, category: null })}
              disabled={categoryActionLoading}
            >
              Cancel
            </Button>
            <Button size="small" color={confirmStatusModal.category?.status === 'active' ? 'error' : 'success'} onClick={handleToggleCategoryStatus} disabled={categoryActionLoading}>
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
            <Button variant="contained" size="small" onClick={() => setConfirmInstalmentStatusModal({ open: false, instalment: null })}
              disabled={instalmentActionLoading}
            >
              Cancel
            </Button>
            <Button size="small" color={confirmInstalmentStatusModal.instalment?.status === 'active' ? 'error' : 'success'} onClick={handleToggleInstalmentStatus} disabled={instalmentActionLoading}>
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
