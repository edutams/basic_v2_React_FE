import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import {
  Typography,
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
  FormControlLabel,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getStudentSchedule, updateStudentInvoice } from '@/api/tenant/bursary/classLedger';
import {
  fetchActiveSessionTerm,
  fetchStudentOptionalPayments,
  saveStudentOptionalPayments,
} from '@/api/tenant/bursary/bursarySettingsApi';
import PrintInvoiceModal from '@/components/tenant/bursary/payment-shedule/PrintInvoiceModal';
import useNotification from '@/hooks/useNotification';

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
  const notify = useNotification();

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
  const [installmentalSetting, setInstallmentalSetting] = useState('percentage');

  /* SESSION / CLASS / CATEGORY IDs (for optional payments modal) */
  const [sessionTermId, setSessionTermId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  /* UI STATE */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [optionalEnabled, setOptionalEnabled] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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

  const [owingInfo, setOwingInfo] = useState(null);
  const [activeSessionInfo, setActiveSessionInfo] = useState({ session: '', term: '' });

  /* ── Optional Payment Modal State ── */
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalPaymentList, setOptionalPaymentList] = useState([]);
  const [loadingOptionalPayments, setLoadingOptionalPayments] = useState(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState(new Set());

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

    // Use balance as the base amount (what's still owed), fallback to amount
    const baseAmount = Number(fee.balance || fee.amount || 0);

    return Math.max(0, baseAmount - discount + penalty);
  };

  /* COMPUTATIONS — this page updates discount/penalty on the whole invoice
     (no per-fee selection to pay), so totals sum every listed fee. */
  const compTotal = compFees.reduce((acc, f) => {
    return acc + getPayable(f, compDiscountGlobal, compPenaltyGlobal);
  }, 0);

  const optTotal = optionalEnabled
    ? optFees.reduce((acc, f) => {
        return acc + getPayable(f, optDiscountGlobal, optPenaltyGlobal);
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
        (fee.selectedOptions || []).forEach((opt) => {
          const id = typeof opt === 'object' ? opt.option_id : opt;
          if (id != null) preSelected.add(id);
        });
        (fee.optionsPool || []).forEach((opt) => {
          if (opt.selected) preSelected.add(opt.option_id);
        });
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
          await fetchInvoiceData();
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
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceId || !user_id) return;

    setLoading(true);
    setError('');

    try {
      const res = await getStudentSchedule({
        invoiceNumber: invoiceId,
        userId: user_id,
      });

      if (!res.success || !res.data) {
        setError(res.message || 'Failed to load invoice data');
        return;
      }

      const { data } = res;

      setStudentInfo(data.student_info);
      setSessionInfo(data.session_info);
      setActiveSessionInfo(data.active_session_info ?? data.session_info);
      setInvoiceInfo(data.invoice_info);
      setOwingInfo(data.owing_info || null);
      setInstallmentalSetting(data.installmental_setting || 'percentage');

      // === CRITICAL: RESPECT OWING LOGIC ===
      const targetSessionTermId =
        data.owing_info?.owing_status === 'owing'
          ? data.owing_info.owing_session_term_id
          : data.session_info.session_term_id;

      setSessionTermId(targetSessionTermId);

      // Store class and category
      setClassId(data.student_info?.class_id);
      setSelectedCategoryId(String(data.invoice_info?.bursary_payment_category_id || ''));

      // Map compulsory fees
      const mappedComp = (data.compulsory_data || []).map((item) => ({
        id: item.id,
        bursary_schedule_id: item.bursary_schedule_id,
        description: item.description,
        amount: item.amount,
        paid_amount: item.paid_amount,
        balance: item.balance,
        payable: item.payable,
        discount: Number(item.discount_amount || item.discount || 0),
        discountEnabled: Number(item.discount_amount || item.discount || 0) > 0,
        penalty: Number(item.penalty_amount || item.penalty || 0),
        penaltyEnabled: Number(item.penalty_amount || item.penalty || 0) > 0,
        installment_id: item.installment_id || null,
        installment_inst1:
          item.installment_inst1 !== undefined ? String(item.installment_inst1) : '',
        installment_inst2:
          item.installment_inst2 !== undefined ? String(item.installment_inst2) : '',
        installment_pct: item.installment_pct || null,
        installment_part: item.installment_part || '',
        installments: item.installments || [],
        custom_amount: item.amount,
      }));
      setCompFees(mappedComp);

      // Map optional fees
      const mappedOpt = (data.optional_data || []).map((item) => ({
        id: item.id,
        bursary_schedule_id: item.bursary_schedule_id,
        description: item.description,
        amount: Number(item.amount || 0),
        optionsPool: item.options || [],
        selectedOptions: item.selected_options || [],
        discount: Number(item.discount_amount || item.discount || 0),
        discountEnabled: Number(item.discount_amount || item.discount || 0) > 0,
        penalty: Number(item.penalty_amount || item.penalty || 0),
        penaltyEnabled: Number(item.penalty_amount || item.penalty || 0) > 0,
        paid_amount: item.paid_amount,
        balance: item.balance,
        payable: item.payable,
      }));
      setOptFees(mappedOpt);

      setDataLoaded(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  }, [invoiceId, user_id]);
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
            session: active.session_name || '',
            term: active.term_name || '',
          });

          // Fetch invoice using session_id, term_id (no category initially)
          await fetchInvoiceData();
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

  /* ── UPDATE INVOICE ── */
  const handleUpdateInvoice = async () => {
    try {
      setUpdating(true);

      const payload = {
        invoice_number: Number(invoiceId),
        user_id,
        compulsory_items: compFees.map((fee) => ({
          bursary_schedule_id: fee.bursary_schedule_id,
          id: fee.id,
          discount: fee.discountEnabled ? Number(fee.discount || 0) : 0,
          discountEnabled: !!fee.discountEnabled,
          penalty: fee.penaltyEnabled ? Number(fee.penalty || 0) : 0,
          penaltyEnabled: !!fee.penaltyEnabled,
        })),
        optional_items: optFees.map((fee) => ({
          bursary_schedule_id: fee.bursary_schedule_id,
          id: fee.id,
          discount: fee.discountEnabled ? Number(fee.discount || 0) : 0,
          discountEnabled: !!fee.discountEnabled,
          penalty: fee.penaltyEnabled ? Number(fee.penalty || 0) : 0,
          penaltyEnabled: !!fee.penaltyEnabled,
        })),
      };

      const res = await updateStudentInvoice(payload);

      if (res?.success) {
        notify.success(res.message || 'Invoice updated successfully');
        await fetchInvoiceData();
      } else {
        notify.error(res?.message || 'Failed to update invoice');
      }
    } catch (err) {
      console.error('Failed to update invoice:', err);
      notify.error(err?.response?.data?.message || 'An error occurred while updating invoice');
    } finally {
      setUpdating(false);
    }
  };

  /* SECTION HEADER BLOCK — flush title strip, no border/radius/margin of its
     own. It sits directly on top of a content Box inside one outer Paper
     (see the two section wrappers below), so the bar and its fees read as
     one attached panel instead of two floating boxes with a gap between. */
  const renderHeaderBlock = ({ title, borderLeftColor, icon, action }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          p: 1.5,
          gap: { xs: 1.5, sm: 0 },
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
          borderLeft: `5px solid ${borderLeftColor}`,
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
      </Box>
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

  // Parents reach this page via /parent-invoice/... and don't have access to
  // /class-ledger — point their breadcrumb/back links at the dashboard instead.
  const isParentView = window.location.pathname.startsWith('/parent-invoice');

  const BCrumbLive = isParentView
    ? [
        { to: '/', title: 'Home' },
        { to: '/dashboard', title: 'Dashboard' },
        { title: breadcrumbTitle },
      ]
    : [
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
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            mt: 1.5,
            p: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            borderRadius: '12px',
          }}
        >
          {/* Student details — avatar + info side by side, not stacked/centered */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 34 }} />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ lineHeight: 1.3 }}
                >
                  {studentName}
                </Typography>
                {invoiceNumber && (
                  <Chip
                    label={`Invoice #${invoiceNumber}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                <strong>Learner ID:</strong> {studentLearnerId}
                <Box component="span" sx={{ mx: 0.75 }}>
                  ·
                </Box>
                <strong>Class:</strong> {studentClassName}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {/* <strong>Bursary Session/Term:</strong> {sessionLabel} {termLabel} */}
                <strong>Bursary Session/Term:</strong> {activeSessionInfo.session}{' '}
                {activeSessionInfo.term}
              </Typography>
            </Box>
          </Box>

          {/* BACK BUTTON */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate(isParentView ? '/dashboard' : '/class-ledger')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              alignSelf: { xs: 'flex-start', md: 'center' },
              flexShrink: 0,
            }}
          >
            Go To Class Ledger
          </Button>
        </Box>

        {/* ERROR ALERT */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* COMPULSORY PAYMENT                           */}
        {/* No table here on purpose — a wide money table forced a         */}
        {/* horizontal scroll. Each fee is a self-contained card instead,  */}
        {/* so it wraps and never needs a scrollbar to read an amount. The */}
        {/* header bar and the fee list share one outer Paper — no gap —   */}
        {/* so they read as a single attached panel.                       */}
        {/* ══════════════════════════════════════════════ */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: '10px',
            overflow: 'hidden',
            mb: 3,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          }}
        >
        {renderHeaderBlock({
          title: `Compulsory Payment${owingInfo?.owing_session_label ? ` - ${owingInfo.owing_session_label}` : ''}`,
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
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Subtotal ₦{format(compTotal)}
              </Typography>
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

        <Box
          sx={{
            p: 1.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
          }}
        >
        {compFees.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2.5 }}>
            No compulsory fees found for this invoice.
          </Typography>
        ) : (
        <Stack spacing={1}>
        {compFees.map((fee, idx) => {
          const discountRowEnabled = compDiscountGlobal ? true : !!fee.discountEnabled;
          const penaltyRowEnabled = compPenaltyGlobal ? true : !!fee.penaltyEnabled;
          const discountFieldEnabled = compDiscountGlobal ? true : !!fee.discountEnabled;
          const penaltyFieldEnabled = compPenaltyGlobal ? true : !!fee.penaltyEnabled;
          const payable = getPayable(fee, compDiscountGlobal, compPenaltyGlobal);

          return (
            <Paper
              key={fee.id}
              variant="outlined"
              sx={{
                p: 0.75,
                borderRadius: 2,
                overflowX: 'auto',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'nowrap',
                }}
              >
                {/* Description + amount breakdown — one truncating line */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.75,
                    minWidth: 0,
                    flex: '1 1 160px',
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="text.primary"
                    noWrap
                    sx={{ flexShrink: 0, maxWidth: '50%' }}
                  >
                    {idx + 1}. {fee.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    noWrap
                    sx={{ flex: 1, minWidth: 0, fontSize: '0.9375rem' }}
                  >
                    ₦{format(fee.amount)} · Bal ₦{format(fee.balance)}
                  </Typography>
                </Box>

                {/* Discount / Penalty controls — between description and payable */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Discount
                  </Typography>
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
                        '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    sx={{ width: 64, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                    disabled={!discountFieldEnabled}
                    value={fee.discount}
                    onChange={(e) => handleDiscountValueChange('comp', fee.id, e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Penalty
                  </Typography>
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
                        '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    sx={{ width: 64, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                    disabled={!penaltyFieldEnabled}
                    value={fee.penalty}
                    onChange={(e) => handlePenaltyValueChange('comp', fee.id, e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Box>

                {/* Payable — final, right-most: the result after discount/penalty.   */}
                {/* ml pushes it a bit further from the penalty field, not flush against it. */}
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="primary.main"
                  sx={{ flexShrink: 0, minWidth: 68, textAlign: 'right', fontSize: '1.1rem', ml: 1.5 }}
                >
                  ₦{format(payable)}
                </Typography>
              </Box>
            </Paper>
          );
        })}
        </Stack>
        )}
        </Box>
        </Paper>

        {/* ══════════════════════════════════════════════ */}
        {/* OPTIONAL PAYMENT — card list, same reasoning as Compulsory */}
        {/* Header bar + content share one outer Paper — no gap.        */}
        {/* ══════════════════════════════════════════════ */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: '10px',
            overflow: 'hidden',
            mb: 3,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          }}
        >
        {renderHeaderBlock({
          title: `Optional Payment${owingInfo?.owing_session_label ? ` - ${owingInfo.owing_session_label}` : ''}`,
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
              {optionalEnabled && optFees.length > 0 && (
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Subtotal ₦{format(optTotal)}
                </Typography>
              )}
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
                variant="contained"
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

        <Box
          sx={{
            p: 1.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
          }}
        >
        {optionalEnabled && optFees.length > 0 ? (
          <Stack spacing={1}>
            {optFees.map((fee, idx) => {
              const discountRowEnabled = optDiscountGlobal ? true : !!fee.discountEnabled;
              const penaltyRowEnabled = optPenaltyGlobal ? true : !!fee.penaltyEnabled;
              const discountFieldEnabled = optDiscountGlobal ? true : !!fee.discountEnabled;
              const penaltyFieldEnabled = optPenaltyGlobal ? true : !!fee.penaltyEnabled;
              const payable = getPayable(fee, optDiscountGlobal, optPenaltyGlobal);

              return (
                <Paper
                  key={fee.id}
                  variant="outlined"
                  sx={{
                    p: 0.75,
                    borderRadius: 2,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'nowrap',
                    }}
                  >
                    {/* Description + amount breakdown — one truncating line */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.75,
                        minWidth: 0,
                        flex: '1 1 160px',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="text.primary"
                        noWrap
                        sx={{ flexShrink: 0, maxWidth: '50%' }}
                      >
                        {idx + 1}. {fee.description}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                        noWrap
                        sx={{ flex: 1, minWidth: 0, fontSize: '0.9375rem' }}
                      >
                        ₦{format(fee.amount)} · Bal ₦{format(fee.balance)}
                      </Typography>
                    </Box>

                    {/* Discount / Penalty controls — between description and payable */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Discount
                      </Typography>
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
                        sx={{ width: 64, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                        disabled={!discountFieldEnabled}
                        value={fee.discount}
                        onChange={(e) =>
                          handleDiscountValueChange('opt', fee.id, e.target.value)
                        }
                        inputProps={{ min: 0 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Penalty
                      </Typography>
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
                        sx={{ width: 64, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                        disabled={!penaltyFieldEnabled}
                        value={fee.penalty}
                        onChange={(e) =>
                          handlePenaltyValueChange('opt', fee.id, e.target.value)
                        }
                        inputProps={{ min: 0 }}
                      />
                    </Box>

                    {/* Payable — final, right-most: the result after discount/penalty.   */}
                    {/* ml pushes it a bit further from the penalty field, not flush against it. */}
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      color="primary.main"
                      sx={{ flexShrink: 0, minWidth: 68, textAlign: 'right', fontSize: '1.1rem', ml: 1.5 }}
                    >
                      ₦{format(payable)}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        ) : optionalEnabled ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2.5 }}>
            No optional payment set for this student.
          </Typography>
        ) : null}
        </Box>
        </Paper>

        {/* UPDATE INVOICE BUTTON */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={loading || updating}
            sx={{
              px: 6,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1.1rem',
              borderRadius: 2,
            }}
          >
            {updating ? <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> : null}
            Update Invoice
          </Button>
        </Box>
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
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <Button
                  component="a"
                  href="/bursary-setup?tab=payment-name&new=optional"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Set Up Now
                </Button>
              }
            >
              No optional payments available for this class/category. This opens Bursary Setup →
              Payment Name in a new tab, with "Add New" already open and Optional preselected —
              so you don't lose your place here. After saving it there, go to Payment Schedule →
              Set Schedule → Optional tab to set the schedule for the relevant classes — it won't
              show up here until that's done.
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
          <Button variant="contained" size="small" onClick={handleCloseOptionalModal}>
            Cancel
          </Button>
          <Button
            size="small"
            onClick={handleAddOptionalPayments}
            disabled={selectedOptionalIds.size === 0}
            sx={{ fontWeight: 600 }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Update Invoice Dialog ── */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Update Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to Update the Invoice</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setConfirmDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={() => {
              setConfirmDialogOpen(false);
              handleUpdateInvoice();
            }}
            sx={{ fontWeight: 600 }}
          >
            Confirm
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
            label={globalModal.field === 'discount' ? 'Discount Amount (₦)' : 'Penalty Amount (₦)'}
            type="number"
            fullWidth
            variant="outlined"
            value={globalModalValue}
            onChange={(e) => setGlobalModalValue(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            size="small"
            onClick={() => setGlobalModal({ ...globalModal, open: false })}
          >
            Cancel
          </Button>
          <Button size="small" onClick={handleGlobalModalConfirm}>
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
