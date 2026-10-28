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
  TablePagination,
  Skeleton,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconDotsVertical,
  IconCheck,
  IconX,
  IconEye,
  IconSearch,
  IconClockHour4,
  IconDeviceFloppy,
  IconRotateClockwise2,
} from '@tabler/icons-react';
import {
  Payments as PaymentsIcon,
  TaskAlt as TaskAltIcon,
  CalendarMonth as CalendarMonthIcon,
  Settings as SettingsIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableModal from '@/components/shared/ReusableModal';
import CategoryModal from '@/components/tenant/bursary/CategoryModal';
import InstalmentModal from '@/components/tenant/bursary/InstalmentModal';

import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
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
import { fetchTenantSessions, fetchTenantSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchTermDateRange } from '@/api/tenant/term-weeks/weekApi';
import useNotification from '@/hooks/useNotification';

/** Small reusable section header: icon badge + title + supporting text,
 * matching the reference design's section-card headers throughout this
 * page (Academic Sessions, Collection Rules, Fee Categories, etc). */
const SectionHeader = ({ icon: Icon, iconBg = '#DBEAFE', iconColor = 'primary.main', title, subtitle, action }) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
    <Box display="flex" alignItems="flex-start" gap={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {action}
  </Box>
);

/** Compact All/Active/Inactive filter tabs + search box, matching the
 * reference design's dense table toolbars (Fee Categories / Instalment
 * Plans sections). */
/** Small colored pill used for the Active/Inactive tab counts, matching
 * the reference design's colored count badges. */
const TabCountBadge = ({ count, color }) => (
  <Box
    component="span"
    sx={{
      ml: 0.75,
      px: 0.75,
      minWidth: 18,
      textAlign: 'center',
      borderRadius: 10,
      fontSize: 10,
      fontWeight: 700,
      lineHeight: '16px',
      display: 'inline-block',
      bgcolor: color === 'success' ? 'success.light' : 'grey.200',
      color: color === 'success' ? 'success.dark' : 'text.secondary',
    }}
  >
    {count}
  </Box>
);

const TableFilterBar = ({ tab, onTabChange, activeCount, inactiveCount, search, onSearchChange, searchPlaceholder }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} flexWrap="wrap" mb={1.5}>
    <Tabs
      value={tab}
      onChange={(_, v) => onTabChange(v)}
      sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, textTransform: 'none', fontSize: 12, fontWeight: 600 } }}
    >
      <Tab value="all" label="All" />
      <Tab
        value="active"
        label={
          <Box display="flex" alignItems="center">
            Active
            <TabCountBadge count={activeCount} color="success" />
          </Box>
        }
      />
      <Tab
        value="inactive"
        label={
          <Box display="flex" alignItems="center">
            Inactive
            <TabCountBadge count={inactiveCount} color="default" />
          </Box>
        }
      />
    </Tabs>
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <TextField
        select
        size="small"
        value={tab}
        onChange={(e) => onTabChange(e.target.value)}
        sx={{ width: 140 }}
      >
        <MenuItem value="all">All Statuses</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ width: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconSearch size={14} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  </Box>
);

const StatusChip = ({ status, activeLabel = 'Active', inactiveLabel = 'Inactive' }) => {
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
        bgcolor: isActive ? 'success.light' : 'grey.200',
        color: isActive ? 'success.dark' : 'text.secondary',
      }}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Box>
  );
};

/** Compact density override for TablePagination, matching the reference
 * design's minimal "Rows per page" footer across all 3 cards. */
const COMPACT_PAGINATION_SX = {
  minHeight: 36,
  '& .MuiTablePagination-toolbar': { minHeight: 36, pl: 0, pr: 0 },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: 12,
    mb: 0,
  },
  '& .MuiTablePagination-select': { fontSize: 12 },
  '& .MuiTablePagination-actions': { ml: 1 },
};

const BursarySetupTab = ({
  sessionTerms,
  selectedSessionTerm,
  setSelectedSessionTerm,
  lastTermUpdate,
  onStatsChange,
  onLoadingChange,
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [instalments, setInstalments] = useState([]);
  const [instalmentsLoading, setInstalmentsLoading] = useState(true);

  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingCode, setSavingCode] = useState(null);

  const [resultSettings, setResultSettings] = useState({
    pay_condition: 'no',
    pay_type: '',
    pay_method: '',
    compulsory_pay_method: '',
    optional_pay_method: '',
  });
  const [resultSettingsLoading, setResultSettingsLoading] = useState(true);
  const [savingResultSettings, setSavingResultSettings] = useState(false);

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryMeta, setCategoryMeta] = useState(null);
  const [categoryTab, setCategoryTab] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');

  const [instalmentPage, setInstalmentPage] = useState(1);
  const [instalmentMeta, setInstalmentMeta] = useState(null);
  const [instalmentTab, setInstalmentTab] = useState('all');
  const [instalmentSearch, setInstalmentSearch] = useState('');

  // Academic Sessions & Terms — a session-level list (fetchTenantSessions)
  // joined client-side with the flat session-term mappings
  // (fetchTenantSessionTerms), grouped by session for the table + the
  // "Activate Term" panel. Independent of the `sessionTerms`/
  // `selectedSessionTerm` props (which the parent still owns for its own
  // purposes) — this tab fetches its own richer, ungrouped copy since the
  // props only carry a flattened {id, label, status} shape.
  const [rawSessions, setRawSessions] = useState([]);
  const [rawSessionTerms, setRawSessionTerms] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [viewSessionId, setViewSessionId] = useState(null);
  const [activatingTermId, setActivatingTermId] = useState(null);
  const [sessionPage, setSessionPage] = useState(0);
  const [sessionRowsPerPage, setSessionRowsPerPage] = useState(5);
  const [sessionMenuAnchor, setSessionMenuAnchor] = useState(null);
  const [sessionMenuRow, setSessionMenuRow] = useState(null);
  const [termDateRanges, setTermDateRanges] = useState({}); // sessionTermId -> {start_date, end_date} | null

  // Collection Rules settings auto-save on every change (unchanged, proven
  // behaviour) — this snapshot just lets the bottom bar honestly reflect
  // "everything is already saved" rather than faking a dirty/pending state
  // that doesn't exist under an auto-save model.
  const [settingsSavedAt, setSettingsSavedAt] = useState(null);

  const loadResultSettings = async () => {
    setResultSettingsLoading(true);
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
    } finally {
      setResultSettingsLoading(false);
    }
  };

  const loadCategories = async (page = 1) => {
    setCategoriesLoading(true);
    try {
      const res = await fetchPaymentCategories(page);
      setCategories(res.data?.data || []);
      setCategoryMeta(res.data || null);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to load categories', 'error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadInstalments = async (page = 1) => {
    setInstalmentsLoading(true);
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
    } finally {
      setInstalmentsLoading(false);
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

      // "Last saved" for the bottom bar — the most recent of the three
      // settings' own updated_at, since each already auto-saves the
      // instant it changes.
      const timestamps = [
        map.fee_collection_method?.updated_at,
        map.installment_style?.updated_at,
        map.gateway_charge_bearer?.updated_at,
      ].filter(Boolean);
      if (timestamps.length > 0) {
        setSettingsSavedAt(timestamps.sort().at(-1));
      }
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to load settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadSessionsAndTerms = async () => {
    setSessionsLoading(true);
    try {
      const [sessRes, termsRes] = await Promise.all([
        fetchTenantSessions({ pagination: false }),
        fetchTenantSessionTerms({ per_page: 200 }),
      ]);
      setRawSessions(sessRes.data || []);
      setRawSessionTerms(termsRes.data || []);
    } catch (err) {
      showSnackbar('Failed to load academic sessions', 'error');
    } finally {
      setSessionsLoading(false);
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

  // The stat cards live in the parent (BursarySetup) — report combined
  // loading state up so they can skeleton until both sources settle.
  useEffect(() => {
    onLoadingChange?.(categoriesLoading || instalmentsLoading);
  }, [categoriesLoading, instalmentsLoading]);

  useEffect(() => {
    loadCategories(categoryPage);
  }, [categoryPage]);

  useEffect(() => {
    loadInstalments(instalmentPage);
  }, [instalmentPage]);

  // keep settings and result settings load separate
  useEffect(() => {
    loadSettings();
    // loadResultSettings(); — "Result viewing" card commented out below
    // (see that section for why); no need to fetch its settings anymore.
    loadSessionsAndTerms();
  }, []);

  // Grouped-by-session view for the Academic Sessions & Terms table — each
  // session's own record (status, updated_at) merged with its session-term
  // rows (for term count + which term is the bursary's active one).
  const groupedSessions = useMemo(() => {
    const bySession = new Map();
    rawSessionTerms.forEach((st) => {
      const sid = st.session_id ?? st.session?.id;
      if (sid == null) return;
      if (!bySession.has(sid)) bySession.set(sid, []);
      bySession.get(sid).push(st);
    });

    return rawSessions.map((s) => {
      const terms = bySession.get(s.id) || [];
      const activeBursaryTerm = terms.find((t) => t.id === selectedSessionTerm);
      return {
        session_id: s.id,
        session_name: s.session_name,
        status: s.status,
        updated_at: s.updated_at,
        terms,
        termCount: terms.length,
        activeTermName: activeBursaryTerm?.term?.term_name || '—',
      };
    });
  }, [rawSessions, rawSessionTerms, selectedSessionTerm]);

  // Default the "Activate Term" panel to whichever session currently holds
  // the bursary's active term; fall back to the session marked active.
  useEffect(() => {
    if (viewSessionId != null || groupedSessions.length === 0) return;
    const withActiveTerm = groupedSessions.find((g) =>
      g.terms.some((t) => t.id === selectedSessionTerm),
    );
    const fallback = groupedSessions.find((g) => g.status === 'active');
    setViewSessionId((withActiveTerm || fallback || groupedSessions[0]).session_id);
  }, [groupedSessions, selectedSessionTerm, viewSessionId]);

  const pagedSessions = groupedSessions.slice(
    sessionPage * sessionRowsPerPage,
    sessionPage * sessionRowsPerPage + sessionRowsPerPage,
  );
  const viewSession = groupedSessions.find((g) => g.session_id === viewSessionId) || null;

  // Real term date ranges, derived from each term's generated weeks (the
  // same `fetchTermDateRange` helper already used elsewhere in this app) —
  // fetched lazily per term the first time it's shown, then cached.
  useEffect(() => {
    const termIds = (viewSession?.terms || [])
      .map((t) => t.id)
      .filter((id) => !(id in termDateRanges));
    if (termIds.length === 0) return;
    termIds.forEach((id) => {
      fetchTermDateRange(id)
        .then((range) => setTermDateRanges((prev) => ({ ...prev, [id]: range })))
        .catch(() => setTermDateRanges((prev) => ({ ...prev, [id]: null })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSession]);

  const handleActivateTerm = async (sessionTermId) => {
    setActivatingTermId(sessionTermId);
    try {
      const res = await setActiveSessionTerm(sessionTermId);
      setSelectedSessionTerm(sessionTermId);
      showSnackbar(res.message || 'Bursary active term updated successfully');
    } catch {
      showSnackbar('Failed to update bursary active term', 'error');
    } finally {
      setActivatingTermId(null);
    }
  };

  // Client-side filter over the already-fetched page — consistent with how
  // every other table on this page filters (the full set for a given page
  // is small enough that this doesn't need a server round-trip).
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (categoryTab !== 'all' && c.status !== categoryTab) return false;
      if (categorySearch && !c.name?.toLowerCase().includes(categorySearch.toLowerCase())) return false;
      return true;
    });
  }, [categories, categoryTab, categorySearch]);

  const filteredInstalments = useMemo(() => {
    return instalments.filter((i) => {
      if (instalmentTab !== 'all' && i.status !== instalmentTab) return false;
      if (instalmentSearch && !i.options?.toLowerCase().includes(instalmentSearch.toLowerCase())) return false;
      return true;
    });
  }, [instalments, instalmentTab, instalmentSearch]);

  const categoryActiveCount = categories.filter((c) => c.status === 'active').length;
  const categoryInactiveCount = categories.filter((c) => c.status !== 'active').length;
  const instalmentActiveCount = instalments.filter((i) => i.status === 'active').length;
  const instalmentInactiveCount = instalments.filter((i) => i.status !== 'active').length;

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
      setSettingsSavedAt(new Date().toISOString());
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
      <Stack spacing={2}>
        {/* Academic Sessions & Terms + Activate Term panel */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
            <ParentCard
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '& .MuiCardContent-root': { flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } },
              }}
            >
              <SectionHeader
                icon={CalendarMonthIcon}
                title="Academic Sessions & Terms"
                subtitle="Select a session to view or configure settings. You can access all previous sessions and terms."
              />

              <TableContainer sx={{ flexGrow: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Academic Session</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Terms</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Active Term</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Activated</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={`sess-skel-${i}`}>
                          <TableCell colSpan={7}><Skeleton variant="rounded" height={28} /></TableCell>
                        </TableRow>
                      ))
                    ) : pagedSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>
                            No academic sessions found
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedSessions.map((row, idx) => (
                        <TableRow
                          key={row.session_id}
                          hover
                          selected={row.session_id === viewSessionId}
                          onClick={() => setViewSessionId(row.session_id)}
                          sx={{
                            cursor: 'pointer',
                            '&.Mui-selected': { bgcolor: 'rgba(37, 99, 235, 0.08)' },
                            '&.Mui-selected:hover': { bgcolor: 'rgba(37, 99, 235, 0.14)' },
                          }}
                        >
                          <TableCell>{sessionPage * sessionRowsPerPage + idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary.main" fontWeight={700}>
                              {row.session_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={row.status} activeLabel="Active" inactiveLabel="Completed" />
                          </TableCell>
                          <TableCell align="center">{row.termCount}</TableCell>
                          <TableCell>{row.activeTermName}</TableCell>
                          <TableCell>
                            {(row.terms || []).some((t) => t.id === selectedSessionTerm) &&
                            lastTermUpdate?.at ? (
                              <Tooltip
                                title={lastTermUpdate.by ? `Activated by ${lastTermUpdate.by}` : ''}
                                arrow
                              >
                                <Typography variant="body2">
                                  {dayjs(lastTermUpdate.at).format('MMM D, YYYY')}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionMenuAnchor(e.currentTarget);
                                setSessionMenuRow(row);
                              }}
                            >
                              <IconDotsVertical size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={groupedSessions.length}
                rowsPerPage={sessionRowsPerPage}
                page={sessionPage}
                onPageChange={(_, newPage) => setSessionPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setSessionRowsPerPage(parseInt(e.target.value, 10));
                  setSessionPage(0);
                }}
                sx={COMPACT_PAGINATION_SX}
              />
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
            <ParentCard
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '& .MuiCardContent-root': { flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } },
              }}
            >
              <SectionHeader
                icon={CalendarMonthIcon}
                title={`Activate Term for ${viewSession?.session_name || '—'}`}
                subtitle="Select and activate the term for fee collection."
              />

              {sessionsLoading ? (
                <Stack spacing={1.5}>
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" height={64} />
                  ))}
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexGrow: 1 }}>
                  {(viewSession?.terms || []).map((t) => {
                    const isActive = t.id === selectedSessionTerm;
                    const range = termDateRanges[t.id];
                    return (
                      <Box
                        key={t.id}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          p: 1,
                          border: '1px solid',
                          borderColor: isActive ? 'success.main' : 'divider',
                          bgcolor: isActive ? 'success.light' : 'background.paper',
                          borderRadius: 2,
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <CalendarMonthIcon sx={{ fontSize: 16, color: isActive ? 'success.dark' : 'text.secondary' }} />
                          <StatusChip status={isActive ? 'active' : 'inactive'} activeLabel="Active" inactiveLabel="Inactive" />
                        </Stack>
                        <Typography variant="caption" fontWeight={700} display="block" noWrap>
                          {t.term?.term_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: 10, lineHeight: 1.3 }}>
                          {range === undefined
                            ? 'Loading…'
                            : range
                              ? `${dayjs(range.start_date).format('MMM D')} – ${dayjs(range.end_date).format('MMM D, YYYY')}`
                              : 'No dates set'}
                        </Typography>
                        {isActive ? (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Radio size="small" checked readOnly sx={{ p: 0 }} />
                            <StatusChip status="active" activeLabel="Currently Active" />
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Radio size="small" checked={false} readOnly sx={{ p: 0 }} />
                            <Button
                              size="small"
                              variant="contained"
                              disabled={activatingTermId === t.id}
                              onClick={() => handleActivateTerm(t.id)}
                              sx={{ fontSize: '0.65rem', px: 1, minWidth: 0 }}
                            >
                              {activatingTermId === t.id ? '…' : 'Activate'}
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                  {(viewSession?.terms || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No terms configured for this session yet.
                    </Typography>
                  )}
                </Stack>
              )}

              <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ bgcolor: '#EFF6FF', color: 'text.primary' }}>
                Only one term can be active at a time for fee collection. You can view and switch to
                previous sessions and terms from the session list.
              </Alert>
            </ParentCard>
          </Grid>
        </Grid>

        {/* Collection Rules */}
        <ParentCard
          sx={{
            '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
          }}
        >
          <SectionHeader
            icon={SettingsIcon}
            title="Collection Rules"
            subtitle={`Define how fees are collected, how instalments are structured and who bears the gateway charges for the selected term.`}
          />

          {settingsLoading ? (
            <Grid container spacing={2}>
              {[0, 1, 2].map((i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ border: '2px solid #c7c9cbff', borderRadius: 3, p: 2, height: '100%' }}>
                    <Skeleton variant="text" width="60%" height={22} sx={{ mb: 2 }} />
                    {[0, 1].map((j) => (
                      <Box key={j} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                        <Skeleton variant="text" width="50%" height={18} />
                        <Skeleton variant="text" width="80%" height={14} />
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
          <Grid container spacing={2} alignItems="flex-start">
            {/* Collection Method */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PaymentsIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 13 }}>
                    {settings.fee_collection_method?.name || 'Collection Method'}
                  </Typography>
                </Stack>
                <FormControl fullWidth>
                  <RadioGroup
                    value={collectionMethod}
                    onChange={(e) => handleSettingChange('fee_collection_method', e.target.value)}
                  >
                    <Stack spacing={0.75}>
                      {(settings.fee_collection_method?.options || []).map((opt) => {
                        const isSelected = opt.value === collectionMethod;
                        return (
                          <FormControlLabel
                            key={opt.value}
                            value={opt.value}
                            disabled={savingCode === 'fee_collection_method'}
                            control={<Radio size="small" sx={{ py: 0.25 }} />}
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                  {opt.value === 'single_payment' ? 'Single payment' : 'Pay per fee'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                  {opt.text}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              m: 0,
                              py: 0.5,
                              px: 1,
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'background.paper',
                              borderRadius: 1.5,
                              alignItems: 'flex-start',
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            {/* Instalment Style */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TaskAltIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 13 }}>
                    {settings.installment_style?.name || 'Default Instalment Style'}
                  </Typography>
                </Stack>
                <FormControl fullWidth>
                  <RadioGroup
                    value={instalmentStyle}
                    onChange={(e) => handleSettingChange('installment_style', e.target.value)}
                  >
                    <Stack spacing={0.75}>
                      {(settings.installment_style?.options || []).map((opt) => {
                        const isSelected = opt.value === instalmentStyle;
                        return (
                          <FormControlLabel
                            key={opt.value}
                            value={opt.value}
                            disabled={savingCode === 'installment_style'}
                            control={<Radio size="small" sx={{ py: 0.25 }} />}
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                  {opt.value === 'percentage' ? 'By percentage' : 'By amount'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                  {opt.text}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              m: 0,
                              py: 0.5,
                              px: 1,
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'background.paper',
                              borderRadius: 1.5,
                              alignItems: 'flex-start',
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <Alert
                  severity="info"
                  icon={<InfoOutlinedIcon fontSize="small" />}
                  sx={{ mt: 1, bgcolor: '#EFF6FF', color: 'text.secondary', fontSize: 11, py: 0.25 }}
                >
                  Instalment plans are configured below and can be selected when setting fee schedules.
                </Alert>
              </Box>
            </Grid>

            {/* Gateway Payer */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <PaymentsIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 13 }}>
                    {settings.gateway_charge_bearer?.name || 'Gateway Charges Bearer'}
                  </Typography>
                </Stack>
                <FormControl fullWidth>
                  <RadioGroup
                    value={gatewayPayer}
                    onChange={(e) => handleSettingChange('gateway_charge_bearer', e.target.value)}
                  >
                    <Stack spacing={0.75}>
                      {(settings.gateway_charge_bearer?.options || []).map((opt) => {
                        const isSelected = opt.value === gatewayPayer;
                        return (
                          <FormControlLabel
                            key={opt.value}
                            value={opt.value}
                            disabled={savingCode === 'gateway_charge_bearer'}
                            control={<Radio size="small" sx={{ py: 0.25 }} />}
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                  {opt.value === 'client' ? 'Parent / Student' : 'School'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                  {opt.text}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              m: 0,
                              py: 0.5,
                              px: 1,
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'background.paper',
                              borderRadius: 1.5,
                              alignItems: 'flex-start',
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {gatewayPayer === 'client' && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#F0FDF4', borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="success.dark" display="block" sx={{ mb: 0.5, fontSize: 11 }}>
                      Example (Parent pays gateway fee)
                    </Typography>
                    <Stack spacing={0.25}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>School fee (sample)</Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: 11 }}>₦10,000</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>Gateway charge (1%)</Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: 11 }}>₦100</Typography>
                      </Stack>
                      <Divider sx={{ my: 0.25 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>Total payable by parent</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>₦10,100</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          )}
        </ParentCard>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <ParentCard
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
                '& .MuiCardContent-root': {
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1.5,
                  '&:last-child': { pb: 1.5 },
                },
              }}
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
                      <Typography variant="h6">Fee Categories</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create and manage fee categories. Categories are not connected to classes here.
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" size="small" startIcon={<IconPlus />}
                    onClick={handleAddCategory}
                    sx={{ fontWeight: 600 }}
                  >
                    Add Category
                  </Button>
                </Box>
              }
            >
              <TableFilterBar
                tab={categoryTab}
                onTabChange={setCategoryTab}
                activeCount={categoryActiveCount}
                inactiveCount={categoryInactiveCount}
                search={categorySearch}
                onSearchChange={setCategorySearch}
                searchPlaceholder="Search categories..."
              />
              <TableContainer variant="outlined" sx={{ maxHeight: 220, minHeight: 180, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
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
                    {categoriesLoading ? (
                      [...Array(4)].map((_, index) => (
                        <TableRow key={`cat-skel-${index}`}>
                          <TableCell><Skeleton variant="text" width={16} /></TableCell>
                          <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                          <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                          <TableCell align="center"><Skeleton variant="rounded" width={60} height={22} sx={{ mx: 'auto' }} /></TableCell>
                          <TableCell align="center"><Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                    <>
                    {filteredCategories.map((category, index) => (
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

                    {filteredCategories.length === 0 && (
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
                    </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Categories Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={categoryMeta?.total || categories.length}
                rowsPerPage={categoryMeta?.per_page || 10}
                page={(categoryPage || 1) - 1}
                onPageChange={(_, newPage) => {
                  const nextPage = newPage + 1;
                  setCategoryPage(nextPage);
                  loadCategories(nextPage);
                }}
                sx={COMPACT_PAGINATION_SX}
              />
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <ParentCard
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
                '& .MuiCardContent-root': {
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1.5,
                  '&:last-child': { pb: 1.5 },
                },
              }}
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
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
                      <Typography variant="h6">Instalment Plans</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create multiple instalment plans for use in fee schedules.
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="contained" size="small" startIcon={<IconPlus />}
                    onClick={handleAddInstalment}
                    sx={{ fontWeight: 600 }}
                  >
                    Add Plan
                  </Button>
                </Box>
              }
            >
              <TableFilterBar
                tab={instalmentTab}
                onTabChange={setInstalmentTab}
                activeCount={instalmentActiveCount}
                inactiveCount={instalmentInactiveCount}
                search={instalmentSearch}
                onSearchChange={setInstalmentSearch}
                searchPlaceholder="Search plans..."
              />
              <TableContainer variant="outlined" sx={{ maxHeight: 220, minHeight: 180, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Instalments</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Schedule / Details</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 90 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instalmentsLoading ? (
                      [...Array(3)].map((_, index) => (
                        <TableRow key={`inst-skel-${index}`}>
                          <TableCell colSpan={8}><Skeleton variant="rounded" height={24} /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                    <>
                    {filteredInstalments.map((instalment, index) => (
                      <TableRow key={instalment.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {instalment.code || `${instalment.inst1}/${instalment.inst2} Split`}
                          </Typography>
                        </TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell align="center">2</TableCell>
                        <TableCell>{instalment.options}</TableCell>
                        <TableCell align="center">
                          <StatusChip status={instalment.status} />
                        </TableCell>
                        <TableCell>
                          {instalment.usage_count != null
                            ? `${instalment.usage_count} schedule${instalment.usage_count === 1 ? '' : 's'}`
                            : '—'}
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

                    {filteredInstalments.length === 0 && (
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
                    </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Instalments Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={instalmentMeta?.total || instalments.length}
                rowsPerPage={instalmentMeta?.per_page || 10}
                page={(instalmentPage || 1) - 1}
                onPageChange={(_, newPage) => {
                  const nextPage = newPage + 1;
                  setInstalmentPage(nextPage);
                  loadInstalments(nextPage);
                }}
                sx={COMPACT_PAGINATION_SX}
              />
            </ParentCard>
          </Grid>
        </Grid>

        {/* "Result viewing" card — commented out per instruction. The
            compulsory/optional/full/part-payment configuration here is
            being replaced by a much simpler rule: a student can view their
            result if they don't currently owe any money for the relevant
            session/term, with no admin-configurable payment-type/method
            branching at all. The enforcement side of that (wherever a
            result/broadsheet controller actually gates on these settings)
            is a separate backend change — this just removes the now-dead
            configuration UI. Left in place (not deleted) in case any of
            this needs to be restored. */}
        {false && (
        <ParentCard
          sx={{
            '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
          }}
        >
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
            {resultSettingsLoading ? (
              <Skeleton variant="rounded" width={34} height={20} sx={{ borderRadius: 10 }} />
            ) : (
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
            )}
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
        )}

        {/* Bottom save bar — every Collection Rules change above already
            auto-saves the instant it's made (unchanged, proven behaviour),
            so there's never a genuinely unsaved/pending state to stage.
            This bar honestly reflects that instead of faking a dirty-state
            workflow: it shows when the settings were last (auto-)saved, and
            both buttons are disabled since nothing is ever left pending. */}
        <Paper
          variant="outlined"
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconClockHour4 size={16} color="#6B7280" />
            <Typography variant="body2" color="text.secondary">
              {settingsSavedAt
                ? `Last saved: ${dayjs(settingsSavedAt).format('MMM D, YYYY [at] h:mm A')}`
                : 'All changes save automatically'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Every change above saves automatically — there's nothing pending to discard">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconRotateClockwise2 size={16} />}
                  disabled
                >
                  Discard Changes
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Every change above already saved automatically">
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconDeviceFloppy size={16} />}
                  disabled
                >
                  Save Configuration
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      </Stack>

      {/* Session row menu */}
      <Menu
        anchorEl={sessionMenuAnchor}
        open={Boolean(sessionMenuAnchor)}
        onClose={() => {
          setSessionMenuAnchor(null);
          setSessionMenuRow(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (sessionMenuRow) setViewSessionId(sessionMenuRow.session_id);
            setSessionMenuAnchor(null);
            setSessionMenuRow(null);
          }}
        >
          <ListItemIcon>
            <IconEye size={16} />
          </ListItemIcon>
          <ListItemText>View Terms</ListItemText>
        </MenuItem>
      </Menu>

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
