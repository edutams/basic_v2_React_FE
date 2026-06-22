import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Button,
  Switch,
  useTheme,
  Alert,
  Checkbox,
  TextField,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  InputLabel,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { fetchInvoiceByNumber } from '@/api/tenant/bursary/classLedger';
import {
  fetchActiveSessionTerm,
  fetchBursarySessionTerms,
  fetchStudentOptionalPayments,
  saveStudentOptionalPayments,
} from '@/api/tenant/bursary/bursarySettingsApi';
import {
  fetchSessions,
  fetchSessionTermsBySession,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import PrintInvoiceModal from '@/components/tenant/bursary/payment-shedule/PrintInvoiceModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Bursary' },
  { to: '/class-ledger', title: 'Class Ledger' },
  { title: 'Invoice' },
];

const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

/* ================= COMPONENT ================= */
const Invoice = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { invoiceId, user_id } = useParams();
  const navigate = useNavigate();

  /* DATA STATE */
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [compFees, setCompFees] = useState([]);
  const [optFees, setOptFees] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [installmentalSetting, setInstallmentalSetting] = useState('percentage');

  /* SESSION / CLASS / CATEGORY IDs (for optional payments modal) */
  const [sessionTermId, setSessionTermId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  /* UI STATE */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const [optionalEnabled, setOptionalEnabled] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  /* Refs */
  const dataLoadedRef = useRef(false);

  /* GLOBAL SWITCHES */
  const [compDiscountGlobal, setCompDiscountGlobal] = useState(false);
  const [compPenaltyGlobal, setCompPenaltyGlobal] = useState(false);
  const [optDiscountGlobal, setOptDiscountGlobal] = useState(false);
  const [optPenaltyGlobal, setOptPenaltyGlobal] = useState(false);

  /* GLOBAL VALUE MODAL */
  const [globalModal, setGlobalModal] = useState({ open: false, type: 'comp', field: 'discount' });
  const [globalModalValue, setGlobalModalValue] = useState('');

  const [allSessionTerms, setAllSessionTerms] = useState([]);
  const [selectedSessionTermId, setSelectedSessionTermId] = useState(null);

  const [loadingSessions, setLoadingSessions] = useState(false);

  const loadSessionsAndTerms = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetchSessions();
      const sessionsList = extractList(res);
      let combinedTerms = [];

      for (const session of sessionsList) {
        const termsRes = await fetchSessionTermsBySession(session.id);
        const terms = extractList(termsRes);

        const formatted = terms.map((term) => ({
          ...term,
          displayLabel: `${term.session?.sesname || session.sesname} - ${term.display_term?.display_name}`,
        }));

        combinedTerms = [...combinedTerms, ...formatted];
      }

      setAllSessionTerms(combinedTerms);

      // Auto select first one
      if (combinedTerms.length > 0) {
        const firstTerm = combinedTerms[0];
        setSelectedSessionTermId(firstTerm.id);
        setSessionTermId(firstTerm.id);

        await fetchInvoiceData(firstTerm.session?.id || firstTerm.session_id, firstTerm.id);
      }
    } catch (err) {
      console.error('Failed to load sessions and terms', err);
      setError('Failed to load session terms');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSessionTermChange = async (e) => {
    const termId = Number(e.target.value);
    setSelectedSessionTermId(termId);

    const selectedTerm = allSessionTerms.find((t) => t.id === termId);
    if (selectedTerm) {
      setSessionTermId(termId);
      await fetchInvoiceData(selectedTerm.session?.id || selectedTerm.session_id, termId);
    }
  };

  useEffect(() => {
    loadSessionsAndTerms();
  }, []);

  const handleGlobalModalConfirm = () => {
    const value = Number(globalModalValue) || 0;
    const { type, field } = globalModal;
    const setter = type === 'comp' ? setCompFees : setOptFees;
    const setGlobal =
      type === 'comp'
        ? field === 'discount'
          ? setCompDiscountGlobal
          : setCompPenaltyGlobal
        : field === 'discount'
          ? setOptDiscountGlobal
          : setOptPenaltyGlobal;

    setter((prev) => prev.map((f) => ({ ...f, [field]: value, [`${field}Enabled`]: true })));
    setGlobal(true);
    setGlobalModal({ ...globalModal, open: false });
  };

  /* ── Optional Payment Modal State ── */
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalPaymentList, setOptionalPaymentList] = useState([]);
  const [loadingOptionalPayments, setLoadingOptionalPayments] = useState(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState(new Set());

  /* ACTIONS */
  const handleCompCheckChange = (id, checked) => {
    setCompFees((prev) => prev.map((f) => (f.id === id ? { ...f, checked } : f)));
  };

  const handleOptCheckChange = (id, checked) => {
    setOptFees((prev) => prev.map((f) => (f.id === id ? { ...f, checked } : f)));
  };

  const handleAllCompCheckChange = (checked) => {
    setCompFees((prev) => prev.map((f) => ({ ...f, checked })));
  };

  const handleAllOptCheckChange = (checked) => {
    setOptFees((prev) => prev.map((f) => ({ ...f, checked })));
  };

  /* DISCOUNT / PENALTY UPDATE ACTIONS */
  const handleDiscountValueChange = (type, id, val) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => (f.id === id ? { ...f, discount: Math.max(0, Number(val || 0)) } : f)),
    );
  };

  const handlePenaltyValueChange = (type, id, val) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => (f.id === id ? { ...f, penalty: Math.max(0, Number(val || 0)) } : f)),
    );
  };

  /* INSTALLMENT CHANGE HANDLER */
  const handleInstallmentChange = (feeId, value) => {
    const selectedInst = installments.find((inst) => inst.id === Number(value));
    setCompFees((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              installment_id: selectedInst?.id || null,
              installment_inst1: selectedInst ? String(selectedInst.inst1) : '',
              installment_inst2: selectedInst ? String(selectedInst.inst2) : '',
            }
          : f,
      ),
    );
  };

  const handleDiscountSwitchChange = (type, id, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => (f.id === id ? { ...f, discountEnabled: checked } : f)));
  };

  const handlePenaltySwitchChange = (type, id, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => (f.id === id ? { ...f, penaltyEnabled: checked } : f)));
  };

  /* DYNAMIC PAYABLE CALCULATION */
  const getPayable = (fee, discountGlobal, penaltyGlobal) => {
    const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
    const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;

    const discount = discountRowEnabled ? Number(fee.discount || 0) : 0;
    const penalty = penaltyRowEnabled ? Number(fee.penalty || 0) : 0;

    let baseAmount;
    if (installmentalSetting === 'percentage') {
      const hasPayment = Number(fee.paid_amount) > 0;
      const installmentPct = hasPayment
        ? (Number(fee.installment_inst2) || 0)
        : (Number(fee.installment_inst1) || 100);
      baseAmount = fee.amount * (installmentPct / 100);
    } else {
      baseAmount = Math.min(Number(fee.custom_amount) || fee.amount, fee.amount);
    }

    return Math.max(0, baseAmount - discount + penalty);
  };

  /* COMPUTATIONS */
  const compTotal = compFees.reduce((acc, f) => {
    return f.checked ? acc + getPayable(f, compDiscountGlobal, compPenaltyGlobal) : acc;
  }, 0);

  const optTotal = optionalEnabled
    ? optFees.reduce((acc, f) => {
        return f.checked ? acc + getPayable(f, optDiscountGlobal, optPenaltyGlobal) : acc;
      }, 0)
    : 0;

  const grandTotal = compTotal + optTotal;

  const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);

  /* ── Optional Payment Modal Handlers ── */
  const handleOpenOptionalModal = async () => {
    // Guard: check required IDs are loaded
    if (!sessionTermId || !classId || !selectedCategoryId) {
      setError(
        'Session/term, class, or category information not loaded yet. Please refresh the page.',
      );
      return;
    }

    setOptionalModalOpen(true);

    try {
      setLoadingOptionalPayments(true);
      const res = await fetchStudentOptionalPayments({
        sessionTermId,
        classId,
        categoryId: selectedCategoryId,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setOptionalPaymentList(list);

      // Pre-select existing optional payments that the student already has
      const preSelected = new Set();

      optFees.forEach((fee) => {
        // Check selectedOptions array
        if (fee.selectedOptions && fee.selectedOptions.length > 0) {
          fee.selectedOptions.forEach((opt) => {
            if (opt.option_id) preSelected.add(opt.option_id);
          });
        }
        // Fallback for direct selected_option_id
        if (fee.selected_option_id) {
          preSelected.add(fee.selected_option_id);
        }
      });

      setSelectedOptionalIds(preSelected);
    } catch (err) {
      console.error('Failed to load optional payments', err);
      setOptionalPaymentList([]);
    } finally {
      setLoadingOptionalPayments(false);
    }
  };

  const handleCloseOptionalModal = () => {
    setOptionalModalOpen(false);
    setOptionalPaymentList([]);
    setSelectedOptionalIds(new Set());
  };

  const handleToggleOptionalItem = (optionId) => {
    setSelectedOptionalIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  const handleToggleAllOptional = () => {
    const allIds = new Set();
    optionalPaymentList.forEach((group) => {
      group.options.forEach((opt) => allIds.add(opt.option_id));
    });

    setSelectedOptionalIds((prev) => {
      const isAllSelected = prev.size === allIds.size && [...allIds].every((id) => prev.has(id));
      return isAllSelected ? new Set() : allIds;
    });
  };

  const handleAddOptionalPayments = async () => {
    if (!invoiceId || !user_id) return;

    // Capture selected IDs before closing modal (state resets on close)
    const optionPaymentIds = [...selectedOptionalIds];

    // Close the modal
    handleCloseOptionalModal();

    try {
      const res = await saveStudentOptionalPayments({
        invoice_number: Number(invoiceId),
        user_id,
        option_payment_ids: optionPaymentIds,
      });

      if (res?.success) {
        // Refetch invoice data to show the saved optional payments
        if (sessionInfo) {
          await fetchInvoiceData(
            sessionInfo.session_id,
            sessionInfo.term_id,
            selectedCategoryId || undefined,
          );
        }
      } else {
        setError(res?.message || 'Failed to save optional payments.');
      }
    } catch (err) {
      console.error('Failed to save optional payments', err);
      setError(err?.response?.data?.message || 'An error occurred while saving optional payments.');
    }
  };

  const allOptionalItems = optionalPaymentList.flatMap((g) => g.options);
  const allOptionalSelected =
    allOptionalItems.length > 0 &&
    allOptionalItems.every((opt) => selectedOptionalIds.has(opt.option_id));

  const totalSelectedOptionalAmount = allOptionalItems
    .filter((opt) => selectedOptionalIds.has(opt.option_id))
    .reduce((sum, opt) => sum + (Number(opt.amount) || 0), 0);

  /* ───────────────────────────────────────────── */
  /* DATA FETCHING                                */
  /* ───────────────────────────────────────────── */
  const fetchInvoiceData = useCallback(
    async (sessionId, termId, categoryId) => {
      if (!invoiceId) return;

      setLoading(true);
      setError('');

      try {
        const res = await fetchInvoiceByNumber({
          sessionId,
          termId,
          invoiceNumber: invoiceId,
          userId: user_id,
          categoryId: categoryId || undefined,
        });

        if (!res.success || !res.data) {
          setError(res.message || 'Failed to load invoice data');
          setLoading(false);
          return;
        }

        const { data } = res;

        setStudentInfo(data.student_info);
        setSessionInfo(data.session_info);
        setInvoiceInfo(data.invoice_info);

        // Store IDs needed for optional payments modal
        if (data.session_info?.session_term_id) {
          setSessionTermId(data.session_info.session_term_id);
        }
        if (data.student_info?.class_id) {
          setClassId(data.student_info.class_id);
        }

        // Set category from invoice_info
        if (data.invoice_info?.bursary_payment_category_id) {
          setSelectedCategoryId(String(data.invoice_info.bursary_payment_category_id));
        }

        // Store installments and installmental setting
        setInstallments(data.installments || []);
        setInstallmentalSetting(data.installmental_setting || 'percentage');

        const installmentsList = data.installments || [];

        // Helper to find installment data from installment_id
        const findInstallment = (item) => {
          const match = installmentsList.find(
            (inst) => inst.id === item.installment_id || inst.inst1 === item.installment_name || inst.inst2 === item.installment_name,
          );
          return match || null;
        };

        // Map compulsory data
        const mappedComp = (data.compulsory_data || []).map((item) => {
          const inst = findInstallment(item);
          return {
            id: item.id,
            description: item.description,
            schedule_amount: item.schedule_amount,
            amount: item.amount,
            discount: item.discount,
            discount_enabled: item.discount_enabled,
            penalty: item.penalty,
            penalty_enabled: item.penalty_enabled,
            paid_amount: item.paid_amount,
            balance: item.balance,
            status: item.status,
            checked: false,
            discountEnabled: !!item.discount_enabled,
            penaltyEnabled: !!item.penalty_enabled,
            installment_id: item.installment_id || null,
            installment_inst1: inst ? String(inst.inst1) : '',
            installment_inst2: inst ? String(inst.inst2) : '',
            custom_amount: item.amount,
          };
        });
        setCompFees(mappedComp);

        // Map optional data — use selected_options for chip display & amount calculation
        const mappedOpt = (data.optional_data || []).map((item) => ({
          id: item.id,
          description: item.description,
          schedule_amount: item.schedule_amount,
          // Calculate amount as the SUM of all selected option amounts
          amount: (item.selected_options || []).reduce(
            (sum, opt) => sum + (Number(opt.amount) || 0),
            0,
          ),
          selectedOptions: item.selected_options || [],
          discount: item.discount,
          discount_enabled: item.discount_enabled,
          penalty: item.penalty,
          penalty_enabled: item.penalty_enabled,
          paid_amount: item.paid_amount,
          balance: item.balance,
          status: item.status,
          checked: false,
          discountEnabled: !!item.discount_enabled,
          penaltyEnabled: !!item.penalty_enabled,
          custom_amount: item.amount,
        }));
        setOptFees(mappedOpt);

        setDataLoaded(true);
        dataLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to fetch invoice data:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    },
    [invoiceId, user_id],
  );

  // Fetch active session/term on mount, then load invoice data
  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetchActiveSessionTerm();
        if (sessionRes.status && sessionRes.data) {
          const active = sessionRes.data;
          setSessionInfo({
            session_id: active.session_id,
            term_id: active.term_id,
            session: active.sesname || '',
            term: active.term_name || '',
          });

          // Fetch invoice using session_id, term_id (no category initially)
          await fetchInvoiceData(active.session_id, active.term_id);
        } else {
          setLoading(false);
          setError('No active session/term found. Please configure bursary settings first.');
        }
      } catch (err) {
        console.error('Failed to fetch active session:', err);
        setError('Failed to load session/term information');
        setLoading(false);
      }
    };

    init();
  }, [fetchInvoiceData]);

  /* SECTION HEADER BLOCK */
  const renderHeaderBlock = ({ title, borderLeftColor, icon, action }) => {
    return (
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          p: 2,
          mb: 2,
          gap: { xs: 2, sm: 0 },
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
          borderLeft: `5px solid ${borderLeftColor}`,
          borderRadius: '8px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              color: isDark ? '#cbd5e1' : '#64748b',
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color={isDark ? '#f1f5f9' : '#334155'}>
            {title}
          </Typography>
        </Box>
        <Box>{action}</Box>
      </Paper>
    );
  };

  /* ───────────────────────────────────────────── */
  /* LOADING / ERROR SCREEN                       */
  /* ───────────────────────────────────────────── */
  if (loading && !dataLoaded) {
    return (
      <PageContainer title="Invoice">
        <Breadcrumb title="Invoice" items={BCrumb} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress size={40} />
        </Box>
      </PageContainer>
    );
  }

  if (error && !dataLoaded) {
    return (
      <PageContainer title="Invoice">
        <Breadcrumb title="Invoice" items={BCrumb} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  const studentName = studentInfo?.name || 'Unknown Student';
  const studentLearnerId = studentInfo?.user_id || '—';
  const studentClassName = studentInfo?.class_name || '—';
  const termLabel = sessionInfo?.term || '';
  const sessionLabel = sessionInfo?.session || '';
  const invoiceNumber = invoiceInfo?.invoice_number || '';

  const breadcrumbTitle = `Invoice${invoiceNumber ? ` #${invoiceNumber}` : ''}`;

  const BCrumbLive = [
    { to: '/', title: 'Home' },
    { title: 'Bursary' },
    { to: '/class-ledger', title: 'Class Ledger' },
    { title: breadcrumbTitle },
  ];

  return (
    <PageContainer title={breadcrumbTitle}>
      <Breadcrumb title={breadcrumbTitle} items={BCrumbLive} />
      <Box sx={{ pb: 8 }}>
        {/* HEADER - Student Info & Filters */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'center',
            gap: 2,
            mb: 3,
            mt: 2,
            p: 2.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            borderRadius: '12px',
          }}
        >
          {/* Student details */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              width: '100%',
              py: 1,
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                mb: 1.5,
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.3 }}>
              {studentName}
            </Typography>

            <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Learner ID:</strong> {studentLearnerId}
            </Typography>

            <Typography variant="body1" fontWeight={600} color="text.secondary">
              <strong>Class:</strong> {studentClassName}
            </Typography>

            <Typography variant="body1" fontWeight={600} color="text.secondary">
              <strong>Bursary Session/Term:</strong> {sessionLabel} {termLabel}
            </Typography>
          </Box>

          {/* BACK BUTTON */}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/class-ledger')}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              textTransform: 'none',
              fontWeight: 600,
              color: isDark ? '#94a3b8' : '#64748b',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
            }}
          >
            ← Go To Class Ledger
          </Button>
        </Box>

        {/* ERROR ALERT */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <FormControl size="small">
            <InputLabel>Session Term</InputLabel>
            <Select
              value={selectedSessionTermId || ''}
              label="Session Term"
              onChange={handleSessionTermChange}
              disabled={loadingSessions}
            >
              {allSessionTerms.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.displayLabel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* COMPULSORY PAYMENT */}
        {renderHeaderBlock({
          title: 'Compulsory Payment',
          borderLeftColor: '#10b981',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 3 },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Discount
                </Typography>
                <Switch
                  size="small"
                  checked={compDiscountGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'comp', field: 'discount' });
                      setGlobalModalValue('');
                    } else {
                      setCompFees((prev) =>
                        prev.map((f) => ({ ...f, discount: 0, discountEnabled: false })),
                      );
                      setCompDiscountGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#8338ec',
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Penalty
                </Typography>
                <Switch
                  size="small"
                  checked={compPenaltyGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'comp', field: 'penalty' });
                      setGlobalModalValue('');
                    } else {
                      setCompFees((prev) =>
                        prev.map((f) => ({ ...f, penalty: 0, penaltyEnabled: false })),
                      );
                      setCompPenaltyGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#8338ec',
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          ),
        })}

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 3,
            mb: 4,
            overflowX: 'auto',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  Pay Description
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  Amount (₦)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  Discount(₦)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  Penalty(₦)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  {installmentalSetting === 'percentage' ? 'Installment' : 'Amount (₦)'}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  Payable(₦)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    py: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={isDark ? '#94a3b8' : '#475569'}
                    >
                      Select All
                    </Typography>
                    <Checkbox
                      size="small"
                      checked={compFees.length > 0 && compFees.every((f) => f.checked)}
                      indeterminate={
                        compFees.some((f) => f.checked) && !compFees.every((f) => f.checked)
                      }
                      onChange={(e) => handleAllCompCheckChange(e.target.checked)}
                      sx={{ p: 0.5 }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compFees.map((fee, idx) => {
                const discountRowEnabled = compDiscountGlobal ? true : !!fee.discountEnabled;
                const penaltyRowEnabled = compPenaltyGlobal ? true : !!fee.penaltyEnabled;
                const discountFieldEnabled = compDiscountGlobal ? true : !!fee.discountEnabled;
                const penaltyFieldEnabled = compPenaltyGlobal ? true : !!fee.penaltyEnabled;
                const payable = getPayable(fee, compDiscountGlobal, compPenaltyGlobal);

                return (
                  <TableRow
                    key={fee.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>
                      {fee.description}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1rem',
                      }}
                    >
                      ₦{format(fee.amount)}
                    </TableCell>

                    {/* DISCOUNT */}
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Switch
                          size="small"
                          checked={discountRowEnabled}
                          disabled={compDiscountGlobal}
                          onChange={(e) =>
                            handleDiscountSwitchChange('comp', fee.id, e.target.checked)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#8338ec',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#8338ec',
                              },
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          sx={{
                            width: 80,
                            bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white',
                          }}
                          disabled={!discountFieldEnabled}
                          value={fee.discount}
                          onChange={(e) =>
                            handleDiscountValueChange('comp', fee.id, e.target.value)
                          }
                          inputProps={{ min: 0 }}
                        />
                      </Box>
                    </TableCell>

                    {/* PENALTY */}
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Switch
                          size="small"
                          checked={penaltyRowEnabled}
                          disabled={compPenaltyGlobal}
                          onChange={(e) =>
                            handlePenaltySwitchChange('comp', fee.id, e.target.checked)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#8338ec',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#8338ec',
                              },
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          sx={{
                            width: 80,
                            bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white',
                          }}
                          disabled={!penaltyFieldEnabled}
                          value={fee.penalty}
                          onChange={(e) => handlePenaltyValueChange('comp', fee.id, e.target.value)}
                          inputProps={{ min: 0 }}
                        />
                      </Box>
                    </TableCell>

                    {/* INSTALLMENT / CUSTOM AMOUNT */}
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      {installmentalSetting === 'percentage' ? (
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={fee.installment_id || ''}
                            onChange={(e) => handleInstallmentChange(fee.id, e.target.value)}
                            displayEmpty
                            sx={{
                              borderRadius: 2,
                              '& .MuiSelect-select': { py: 0.75, fontSize: '0.875rem' },
                            }}
                          >
                            <MenuItem value="">
                              <em>Select</em>
                            </MenuItem>
                            {installments.map((inst) => (
                              <MenuItem key={inst.id} value={inst.id}>
                                {Number(fee.paid_amount) > 0 ? inst.inst2 : inst.inst1}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          size="small"
                          type="number"
                          sx={{ width: 110, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                          value={fee.custom_amount}
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value) || 0, fee.amount);
                            setCompFees((prev) =>
                              prev.map((f) => (f.id === fee.id ? { ...f, custom_amount: val } : f)),
                            );
                          }}
                          inputProps={{ min: 0, max: fee.amount }}
                        />
                      )}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1rem',
                      }}
                    >
                      ₦{format(payable)}
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Checkbox
                        size="small"
                        checked={fee.checked}
                        onChange={(e) => handleCompCheckChange(fee.id, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* COMPULSORY TABLE FOOTER ROW */}
              <TableRow
                sx={{
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
                }}
              >
                <TableCell colSpan={6} sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    Total Compulsory
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    color: isDark ? '#60a5fa' : '#1e40af',
                    fontSize: '1.25rem',
                  }}
                >
                  ₦{format(compTotal)}
                </TableCell>
                <TableCell sx={{ py: 1.5 }} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* OPTIONAL PAYMENT */}
        {renderHeaderBlock({
          title: 'Optional Payment',
          borderLeftColor: '#3b82f6',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 3 },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Discount
                </Typography>
                <Switch
                  size="small"
                  checked={optDiscountGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'opt', field: 'discount' });
                      setGlobalModalValue('');
                    } else {
                      setOptFees((prev) =>
                        prev.map((f) => ({ ...f, discount: 0, discountEnabled: false })),
                      );
                      setOptDiscountGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#8338ec',
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Penalty
                </Typography>
                <Switch
                  size="small"
                  checked={optPenaltyGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'opt', field: 'penalty' });
                      setGlobalModalValue('');
                    } else {
                      setOptFees((prev) =>
                        prev.map((f) => ({ ...f, penalty: 0, penaltyEnabled: false })),
                      );
                      setOptPenaltyGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#8338ec',
                      },
                    },
                  }}
                />
              </Box>
              <Switch
                checked={optionalEnabled}
                onChange={(e) => setOptionalEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#8338ec',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#8338ec',
                    },
                  },
                }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenOptionalModal}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Add Optional Pay.
              </Button>
            </Box>
          ),
        })}

        {optionalEnabled && optFees.length > 0 ? (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              mb: 4,
              overflowX: 'auto',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead
                sx={{
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    Item
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    Amount (₦)
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    Discount(₦)
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    Penalty(₦)
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    Payable(₦)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#94a3b8' : '#475569',
                      py: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={isDark ? '#94a3b8' : '#475569'}
                      >
                        Select All
                      </Typography>
                      <Checkbox
                        size="small"
                        checked={optFees.length > 0 && optFees.every((f) => f.checked)}
                        indeterminate={
                          optFees.some((f) => f.checked) && !optFees.every((f) => f.checked)
                        }
                        onChange={(e) => handleAllOptCheckChange(e.target.checked)}
                        sx={{ p: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {optFees.map((fee, idx) => {
                  const discountRowEnabled = optDiscountGlobal ? true : !!fee.discountEnabled;
                  const penaltyRowEnabled = optPenaltyGlobal ? true : !!fee.penaltyEnabled;
                  const discountFieldEnabled = optDiscountGlobal ? true : !!fee.discountEnabled;
                  const penaltyFieldEnabled = optPenaltyGlobal ? true : !!fee.penaltyEnabled;
                  const payable = getPayable(fee, optDiscountGlobal, optPenaltyGlobal);

                  return (
                    <TableRow
                      key={fee.id}
                      hover
                      sx={{
                        bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                          sx={{ mb: 0.5 }}
                        >
                          {fee.description}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                          }}
                        >
                          {(fee.selectedOptions || []).map((opt, oi) => (
                            <Chip
                              key={opt.option_id || oi}
                              label={`${opt.option_name}: ₦${format(opt.amount)}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.5,
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1rem',
                        }}
                      >
                        ₦{format(fee.amount)}
                      </TableCell>

                      {/* DISCOUNT */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <Switch
                            size="small"
                            checked={discountRowEnabled}
                            disabled={optDiscountGlobal}
                            onChange={(e) =>
                              handleDiscountSwitchChange('opt', fee.id, e.target.checked)
                            }
                          />
                          <TextField
                            size="small"
                            type="number"
                            sx={{
                              width: 80,
                              bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white',
                            }}
                            disabled={!discountFieldEnabled}
                            value={fee.discount}
                            onChange={(e) =>
                              handleDiscountValueChange('opt', fee.id, e.target.value)
                            }
                            inputProps={{ min: 0 }}
                          />
                        </Box>
                      </TableCell>

                      {/* PENALTY */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: 'center',
                          }}
                        >
                          <Switch
                            size="small"
                            checked={penaltyRowEnabled}
                            disabled={optPenaltyGlobal}
                            onChange={(e) =>
                              handlePenaltySwitchChange('opt', fee.id, e.target.checked)
                            }
                          />
                          <TextField
                            size="small"
                            type="number"
                            sx={{
                              width: 80,
                              bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white',
                            }}
                            disabled={!penaltyFieldEnabled}
                            value={fee.penalty}
                            onChange={(e) =>
                              handlePenaltyValueChange('opt', fee.id, e.target.value)
                            }
                            inputProps={{ min: 0 }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          py: 1.5,
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1rem',
                        }}
                      >
                        ₦{format(payable)}
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Checkbox
                          size="small"
                          checked={fee.checked}
                          onChange={(e) => handleOptCheckChange(fee.id, e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* OPTIONAL TABLE FOOTER ROW */}
                <TableRow
                  sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  }}
                >
                  <TableCell colSpan={5} sx={{ py: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                      Total Optional
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      fontWeight: 800,
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '1.25rem',
                    }}
                  >
                    ₦{format(optTotal)}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : optionalEnabled ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              textAlign: 'center',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="body1" fontWeight={600} color="text.secondary">
              No optional payment set for this student.
            </Typography>
          </Paper>
        ) : null}

        {/* STICKY BOTTOM ACTION SHEET */}
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 16,
            left: 0,
            right: 0,
            zIndex: 10,
            p: 2,
            mt: 4,
            bgcolor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fef9c3',
            border: `1px solid ${isDark ? 'rgba(234, 179, 8, 0.3)' : '#fef08a'}`,
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
          }}
        >
          {/* LEFT - Legends */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'column', md: 'column' },
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
              gap: { xs: 2, sm: 0.5 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Checkbox
                size="small"
                checked={compFees.length > 0 && compFees.every((f) => f.checked)}
                indeterminate={compFees.some((f) => f.checked) && !compFees.every((f) => f.checked)}
                onChange={(e) => handleAllCompCheckChange(e.target.checked)}
                sx={{
                  color: '#10b981',
                  '&.Mui-checked': { color: '#10b981' },
                  '&.MuiCheckbox-indeterminate': { color: '#10b981' },
                  p: 0.5,
                }}
              />
              <Typography variant="body2" fontWeight={600} color={isDark ? '#cbd5e1' : '#374151'}>
                Compulsory Payment
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Checkbox
                size="small"
                checked={optionalEnabled && optFees.length > 0 && optFees.every((f) => f.checked)}
                indeterminate={
                  optionalEnabled &&
                  optFees.some((f) => f.checked) &&
                  !optFees.every((f) => f.checked)
                }
                disabled={!optionalEnabled}
                onChange={(e) => handleAllOptCheckChange(e.target.checked)}
                sx={{
                  color: '#84cc16',
                  '&.Mui-checked': { color: '#84cc16' },
                  '&.MuiCheckbox-indeterminate': { color: '#84cc16' },
                  p: 0.5,
                }}
              />
              <Typography variant="body2" fontWeight={600} color={isDark ? '#cbd5e1' : '#374151'}>
                Optional Payment
              </Typography>
            </Box>
          </Box>

          {/* RIGHT - Sticky Pay Button */}
          <Button variant="contained" disabled={grandTotal === 0}>
            Pay Now - ₦{format(grandTotal)} &gt;
          </Button>
        </Paper>
      </Box>

      {/* ── Optional Payment Modal ── */}
      <Dialog open={optionalModalOpen} onClose={handleCloseOptionalModal} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Add Optional Payments
            </Typography>
            {studentInfo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {studentInfo.name} ({studentInfo.user_id})
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleCloseOptionalModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {loadingOptionalPayments ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : optionalPaymentList.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No optional payments available for this class/category.
            </Alert>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allOptionalSelected}
                      indeterminate={selectedOptionalIds.size > 0 && !allOptionalSelected}
                      onChange={handleToggleAllOptional}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {allOptionalSelected ? 'Deselect All' : 'Select All'}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedOptionalIds.size} of {allOptionalItems.length} selected
                </Typography>
              </Box>

              <Divider />

              {optionalPaymentList.map((group) => (
                <Box key={group.payment_name_id} sx={{ mt: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary.main"
                    gutterBottom
                  >
                    {group.payment_name}
                  </Typography>
                  <Stack spacing={0.5} sx={{ pl: 1 }}>
                    {group.options.map((opt) => (
                      <FormControlLabel
                        key={opt.option_id}
                        control={
                          <Checkbox
                            checked={selectedOptionalIds.has(opt.option_id)}
                            onChange={() => handleToggleOptionalItem(opt.option_id)}
                            size="small"
                            color="primary"
                          />
                        }
                        label={
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            sx={{
                              minWidth: { xs: 180, sm: 250 },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: {
                                  xs: '0.75rem',
                                  sm: '0.875rem',
                                },
                                mr: 1,
                              }}
                            >
                              {opt.option_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{
                                fontSize: {
                                  xs: '0.75rem',
                                  sm: '0.875rem',
                                },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ₦{(Number(opt.amount) || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mx: 0,
                          '& .MuiFormControlLabel-label': {
                            width: '100%',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <Divider />

        {!loadingOptionalPayments && optionalPaymentList.length > 0 && (
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Selected Total:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ₦{totalSelectedOptionalAmount.toLocaleString()}
            </Typography>
          </Box>
        )}

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button onClick={handleCloseOptionalModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddOptionalPayments}
            disabled={selectedOptionalIds.size === 0}
            sx={{ fontWeight: 600 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* GLOBAL VALUE MODAL */}
      <Dialog
        open={globalModal.open}
        onClose={() => setGlobalModal({ ...globalModal, open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Set {globalModal.field === 'discount' ? 'Discount' : 'Penalty'} Amount
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={
              globalModal.field === 'discount' ? 'Discount Amount (₦)' : 'Penalty Amount (₦)'
            }
            type="number"
            fullWidth
            variant="outlined"
            value={globalModalValue}
            onChange={(e) => setGlobalModalValue(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGlobalModal({ ...globalModal, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleGlobalModalConfirm}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Print Invoice Modal ── */}
      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        student={{ user_id: studentInfo?.user_id || user_id, name: studentName }}
      />
    </PageContainer>
  );
};

export default Invoice;
