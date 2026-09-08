import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import Radio from '@mui/material/Radio';

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
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { getStudentSchedule } from '@/api/tenant/bursary/classLedger';
import {
  fetchActiveSessionTerm,
  fetchStudentOptionalPayments,
  saveStudentOptionalPayments,
} from '@/api/tenant/bursary/bursarySettingsApi';

import PrintInvoiceModal from '@/components/tenant/bursary/payment-shedule/PrintInvoiceModal';
import { usePermissions } from '@/context/TenantContext/permissions';
import { createPendingPayment } from '@/api/tenant/bursary/bursaryPayment';
import { useNotification } from '@/hooks/useNotification';
import { makePayment } from '@/utils/paymentGateway';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Bursary' },
  { to: '/class-ledger', title: 'Class Ledger' },
  { title: 'Invoice' },
];

/* ================= COMPONENT ================= */
const PayInvoice = () => {
  const { can } = usePermissions();
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

  const [optionalEnabled, setOptionalEnabled] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [owingInfo, setOwingInfo] = useState(null);
  const [activeSessionInfo, setActiveSessionInfo] = useState({ session: '', term: '' });

  /* ── Optional Payment Modal State ── */
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalPaymentList, setOptionalPaymentList] = useState([]);
  const [loadingOptionalPayments, setLoadingOptionalPayments] = useState(false);
  const [selectedOptionalIds, setSelectedOptionalIds] = useState(new Set());
  const [savedOptionalIds, setSavedOptionalIds] = useState(new Set());

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('');
  /* Guards against a double-click firing two overlapping payment-gateway
     widgets — the SDK popup takes a moment to open, and a second click in
     that window would invoke it a second time, which looks like the page
     has frozen. */
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Dummy wallet balances for UI representation
  const availableWallets = [
    {
      id: 'father',
      name: "Father's Wallet",
      balance: 150000,
      parent: {
        id: 1,
        name: 'Nwafor Chukwudi',
        email: 'father@example.com',
        phone: '08012345678',
        wallet_number: '9048121392',
      },
      themeMain: 'primary.main',
      themeBg: isDark ? 'rgba(25,118,210,0.05)' : '#f0f4ff',
      themeBorder: isDark ? 'rgba(25,118,210,0.2)' : '#dbeafe',
      themeHoverBg: isDark ? 'rgba(25,118,210,0.1)' : '#e0e7ff',
      themeSelectedBg: isDark ? 'rgba(25,118,210,0.2)' : '#e0e7ff',
    },
    {
      id: 'mother',
      name: "Mother's Wallet",
      balance: 85000,
      parent: {
        id: 2,
        name: 'Jane Nwafor',
        email: 'mother@example.com',
        phone: '08087654321',
        wallet_number: '9048121391',
      },
      themeBg: isDark ? 'rgba(25,118,210,0.05)' : '#f0f4ff',
      themeSelectedBg: isDark ? 'rgba(25,118,210,0.25)' : '#e0e7ff',
      themeHoverBg: isDark ? 'rgba(25,118,210,0.12)' : '#e0e7ff',
      themeMain: '#0288d1',
    },
    {
      id: 'child',
      name: "Child's Wallet",
      balance: 25000,
      parent: {
        id: 3,
        name: 'David Nwafor',
        email: 'child@example.com',
        phone: '08011223344',
        wallet_number: '9048121395',
      },
      themeBg: isDark ? 'rgba(25,118,210,0.05)' : '#f0f4ff',
      themeSelectedBg: isDark ? 'rgba(25,118,210,0.25)' : '#e0e7ff',
      themeHoverBg: isDark ? 'rgba(25,118,210,0.12)' : '#e0e7ff',
      themeMain: 'secondary.main',
    },
  ];

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

  /* INSTALLMENT CHANGE HANDLER — triggers payable recalculation */
  const handleInstallmentChange = (feeId, value) => {
    setCompFees((prev) =>
      prev.map((f) => {
        if (f.id !== feeId) return f;
        const selectedInst = (f.installments || []).find((inst) => inst.id === Number(value));
        const installmentPct = selectedInst ? Number(selectedInst.inst1) || 100 : 100;

        // Apply installment % to the API payable (already has discount/penalty)
        const basePayable = Number(f.balance || 0); // balance already = amount - discount + penalty
        const payable = Math.max(0, basePayable * (installmentPct / 100));

        return {
          ...f,
          installment_id: selectedInst?.id || null,
          installment_inst1: selectedInst ? String(selectedInst.inst1) : '',
          installment_inst2: selectedInst ? String(selectedInst.inst2 ?? '') : '',
          payable,
        };
      }),
    );
  };

  /* CUSTOM AMOUNT CHANGE HANDLER — triggers payable recalculation */
  const handleCustomAmountChange = (feeId, rawVal, type = 'comp') => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => {
        if (f.id !== feeId) return f;
        const max = Number(f.balance || f.amount || 0);
        const custom = Math.min(Number(rawVal) || 0, max);
        const discount = Number(f.discount_amount || 0);
        const penalty = Number(f.penalty_amount || 0);
        const payable = Math.max(0, custom - discount + penalty);
        return { ...f, custom_amount: custom, payable };
      }),
    );
  };

  /* COMPUTATIONS — use the stored payable from each fee row */
  const compTotal = compFees.reduce(
    (acc, f) => (f.checked ? acc + Number(f.payable || 0) : acc),
    0,
  );
  const optTotal = optionalEnabled
    ? optFees.reduce((acc, f) => {
        if (!f.checked) return acc;
        return acc + Number(f.payable || f.balance || f.amount || 0);
      }, 0)
    : 0;
  const grandTotal = compTotal + optTotal;

  const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);

  /* ── Optional Payment Modal Handlers ── */
  const handleOpenOptionalModal = async () => {
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

      /* Use persisted savedOptionalIds as the source of truth for pre-selection */
      const preSelected = new Set([...savedOptionalIds]);
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
      next.has(optionId) ? next.delete(optionId) : next.add(optionId);
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
    const optionPaymentIds = [...selectedOptionalIds];
    handleCloseOptionalModal();

    try {
      const res = await saveStudentOptionalPayments({
        invoice_number: Number(invoiceId),
        user_id,
        option_payment_ids: optionPaymentIds,
      });
      if (res?.success) {
        /* Immediately persist the saved IDs so they show checked on modal reopen */
        setSavedOptionalIds((prev) => new Set([...prev, ...optionPaymentIds]));
        await fetchInvoiceData();
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
      const res = await getStudentSchedule({ invoiceNumber: invoiceId, userId: user_id });

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

      const targetSessionTermId =
        data.owing_info?.owing_status === 'owing'
          ? data.owing_info.owing_session_term_id
          : data.session_info.session_term_id;

      setSessionTermId(targetSessionTermId);
      setClassId(data.student_info?.class_id);
      setSelectedCategoryId(String(data.invoice_info?.bursary_payment_category_id || ''));

      /* Map compulsory fees — all values come straight from API; payable pre-set from API */
      const mappedComp = (data.compulsory_data || []).map((item) => {
        const instList = item.installments || [];
        /* Auto-preselect the first installment if none is already set */
        const defaultInst = !item.installment_id && instList.length > 0 ? instList[0] : null;
        const instId = item.installment_id || defaultInst?.id || null;
        const inst1 = defaultInst
          ? String(defaultInst.inst1)
          : item.installment_inst1 !== undefined
            ? String(item.installment_inst1)
            : '';
        const inst2 = defaultInst
          ? String(defaultInst.inst2 ?? '')
          : item.installment_inst2 !== undefined
            ? String(item.installment_inst2)
            : '';

        /* Recalculate payable based on the preselected installment percentage */
        const balance = Number(item.balance || 0);
        const installmentPct = defaultInst ? Number(defaultInst.inst1) || 100 : 100;
        const calculatedPayable = Math.max(0, balance * (installmentPct / 100));

        return {
          id: item.id,
          bursary_schedule_id: item.bursary_schedule_id,
          description: item.description,
          amount: Number(item.amount || 0),
          paid_amount: Number(item.paid_amount || 0),
          balance,
          /* Use calculated payable when preselecting an installment, otherwise API value */
          payable: defaultInst ? calculatedPayable : Number(item.payable || 0),
          discount_amount: Number(item.discount_amount || 0),
          penalty_amount: Number(item.penalty_amount || 0),
          rev_code: item.rev_code,
          fee_bearer: item.fee_bearer,
          checked: false,
          installment_id: instId,
          installment_inst1: inst1,
          installment_inst2: inst2,
          installments: instList,
          /* custom_amount defaults to balance for the custom-amount mode */
          custom_amount: Number(item.balance || item.amount || 0),
        };
      });
      setCompFees(mappedComp);

      /* Map optional fees */
      const mappedOpt = (data.optional_data || []).map((item) => ({
        id: item.id,
        bursary_schedule_id: item.bursary_schedule_id,
        description: item.description,
        amount: Number(item.amount || 0),
        paid_amount: Number(item.paid_amount || 0),
        balance: Number(item.balance || 0),
        payable: Number(item.payable || item.balance || 0),
        discount_amount: Number(item.discount_amount || 0),
        penalty_amount: Number(item.penalty_amount || 0),
        optionsPool: item.options || [],
        selectedOptions: item.selected_options || [],
        rev_code: item.rev_code,
        fee_bearer: item.fee_bearer,
        checked: false,
        custom_amount: Number(item.balance || item.amount || 0),
      }));
      setOptFees(mappedOpt);

      /* Sync savedOptionalIds from API response so pre-selection persists */
      const selectedIds = new Set();
      mappedOpt.forEach((fee) => {
        (fee.selectedOptions || []).forEach((opt) => {
          if (opt.option_id) selectedIds.add(opt.option_id);
        });
      });
      setSavedOptionalIds(selectedIds);

      setDataLoaded(true);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  }, [invoiceId, user_id]);

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

  useEffect(() => {
    const handler = () => {
      notify.success('Payment successful and confirmed!');
      fetchInvoiceData();
    };
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
  }, [fetchInvoiceData]);

  /* ── Smart wallet default ── */
  /* Once there's something to pay, auto-pick the first wallet that can
     actually cover it — saves the parent a step, and never overrides a
     choice they've already made themselves. */
  useEffect(() => {
    if (selectedWallet || grandTotal <= 0) return;
    const sufficient = availableWallets.find((w) => w.balance >= grandTotal);
    setSelectedWallet(sufficient?.id || availableWallets[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grandTotal]);

  /* ── Pay Now ── */
  const handlePayNow = async () => {
    if (grandTotal <= 0) {
      notify.error('Please select at least one item to pay');
      return;
    }

    if (submittingPayment) return; // already in flight — ignore repeat clicks
    setSubmittingPayment(true);

    const payload = [];

    compFees.forEach((fee) => {
      if (fee.checked && Number(fee.payable || 0) > 0) {
        payload.push({
          bursary_schedule_id: fee.bursary_schedule_id || fee.id,
          user_id,
          session_term_id: sessionInfo?.session_term_id,
          amount: fee.amount,
          instValue: fee.payable,
          paymentname: {
            name: fee.description || fee.payment_name,
            rev_code: fee.rev_code,
          },
          fee_bearer: fee.fee_bearer,
          checked: true,
          fname: studentInfo?.name?.split(' ')[0] || '',
          lname: studentInfo?.name?.split(' ').slice(1).join(' ') || '',
          payment_type: 'ONLINE',
        });
      }
    });

    optFees.forEach((fee) => {
      if (fee.checked && Number(fee.payable || 0) > 0) {
        payload.push({
          bursary_schedule_id: fee.bursary_schedule_id || fee.id,
          user_id,
          session_term_id: sessionInfo?.session_term_id,
          amount: fee.amount,
          instValue: fee.payable,
          paymentname: {
            name: fee.description || fee.payment_name,
            rev_code: fee.rev_code,
          },
          fee_bearer: fee.fee_bearer,
          checked: true,
          fname: studentInfo?.name?.split(' ')[0] || '',
          lname: studentInfo?.name?.split(' ').slice(1).join(' ') || '',
          payment_type: 'ONLINE',
        });
      }
    });

    if (payload.length === 0) {
      notify.info('No valid items selected for payment');
      setSubmittingPayment(false);
      return;
    }

    try {
      const res = await createPendingPayment({ schedules: payload });
      // console.log('Full API response:', res?.success);
      // console.log('SkoolPay on window:', window.SkoolPay);
      if (res?.success) {
        notify.success('Payment initiated successfully!');

        // Trigger Payment Gateway Directly ===
        const paymentData = res?.data;
        const hash = res.xpress;
        const gatewayCode = res.gateway_code;
        const pubKey = res.pub_key;

        const data = paymentData.map((item) => ({
          ...item,
          gateway_code: gatewayCode,
          pub_key: pubKey,
          hash: hash,
        }));

        makePayment(data, hash);
        // fetchInvoiceData();
      }
    } catch (err) {
      console.error(err);
      notify.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  /* SECTION HEADER BLOCK */
  /* Renders just the colored title strip — no border/radius/margin of its
     own. It's meant to sit flush on top of a content Box inside a single
     outer Paper (see the two "section" wrappers below), so the bar and its
     fees read as one attached panel instead of two floating boxes. */
  const renderHeaderBlock = ({ title, borderLeftColor, icon, action }) => (
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
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

  /* ───────────────────────────────────────────── */
  /* LOADING / ERROR SCREEN                       */
  /* ───────────────────────────────────────────── */
  if (loading && !dataLoaded) {
    return (
      <PageContainer title="Pay Invoice">
        <Breadcrumb title="Pay Invoice" items={BCrumb} />
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
        >
          <CircularProgress size={40} />
        </Box>
      </PageContainer>
    );
  }

  if (error && !dataLoaded) {
    return (
      <PageContainer title="Pay Invoice">
        <Breadcrumb title="Pay Invoice" items={BCrumb} />
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
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
  const invoiceNumber = invoiceInfo?.invoice_number || '';
  const breadcrumbTitle = `Pay Invoice${invoiceNumber ? ` #${invoiceNumber}` : ''}`;

  const BCrumbLive = [
    { to: '/', title: 'Home' },
    { title: 'Bursary' },
    { to: '/class-ledger', title: 'Class Ledger' },
    { title: breadcrumbTitle },
  ];

  /* ── Convenience: quick "N of M selected" counters ── */
  const compSelectedCount = compFees.filter((f) => f.checked).length;
  const optSelectedCount = optFees.filter((f) => f.checked).length;

  /* ── Intelligence: flag a wallet that can't cover the current total ── */
  const selectedWalletObj = availableWallets.find((w) => w.id === selectedWallet);
  const insufficientBalance =
    grandTotal > 0 && !!selectedWalletObj && selectedWalletObj.balance < grandTotal;

  return (
    <PageContainer title={breadcrumbTitle}>
      <Breadcrumb title={breadcrumbTitle} items={BCrumbLive} />
      <Box sx={{ pb: 4 }}>
        {/* HEADER — Student Info */}
        <Box sx={{ mb: 2, mt: 1.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
              borderRadius: '12px',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {/* LEFT: Student Profile Row */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ width: 44, height: 44 }}>
                <PersonOutlineIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} color="text.primary" noWrap>
                  {studentName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', whiteSpace: 'nowrap' }}
                >
                  ID {studentLearnerId} &nbsp;·&nbsp; {studentClassName} &nbsp;·&nbsp;{' '}
                  {activeSessionInfo.session} {activeSessionInfo.term}
                </Typography>
              </Box>
            </Box>

            {/* Print + Back — top right, extreme end */}
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => setPrintModalOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/class-ledger')}
                startIcon={<ArrowBackIcon fontSize="small" />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Back
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* ══════════════════════════════════════════════ */}
        {/* CHECKOUT LAYOUT — fees (left) + sticky summary (right) */}
        {/* Reversed column order on mobile puts the summary/pay panel   */}
        {/* first, so totals and the wallet picker are visible without   */}
        {/* scrolling all the way down.                                 */}
        {/* ══════════════════════════════════════════════ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', lg: 'row' },
            alignItems: 'flex-start',
            gap: 2.5,
          }}
        >
          {/* ── LEFT: Fee tables ── */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            {/* ERROR ALERT */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* OWING WARNING */}
            {owingInfo?.owing_status === 'owing' && (
              <Alert severity="error" sx={{ mb: 2, fontSize: '1.05rem' }}>
                <strong>Outstanding Balance Detected</strong>
                <br />
                You need to pay for the previous term you owe{' '}
                <strong>{owingInfo.owing_session_label}</strong> before you can pay for this term.
              </Alert>
            )}

            {/* ══════════════════════════════════════════════ */}
            {/* COMPULSORY PAYMENT                           */}
            {/* No table here on purpose — a 9-column money table forced a  */}
            {/* horizontal scroll in the narrower checkout column. Each fee */}
            {/* is a self-contained card instead, so it wraps and never    */}
            {/* needs a scrollbar to read an amount. The header bar and    */}
            {/* the fee list share one outer Paper — no gap between them — */}
            {/* so they read as a single attached panel.                   */}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Subtotal ₦{format(compTotal)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 2.5 }}
                  >
                    No compulsory fees found for this invoice.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {compFees.map((fee, idx) => (
                      <Paper
                        key={fee.id}
                        variant="outlined"
                        onClick={() => handleCompCheckChange(fee.id, !fee.checked)}
                        sx={{
                          p: 0.75,
                          borderRadius: 2,
                          cursor: 'pointer',
                          borderColor: fee.checked
                            ? 'success.main'
                            : isDark
                              ? 'rgba(255,255,255,0.1)'
                              : '#e2e8f0',
                          bgcolor: fee.checked
                            ? isDark
                              ? 'rgba(16,185,129,0.12)'
                              : '#ecfdf5'
                            : isDark
                              ? 'rgba(255,255,255,0.03)'
                              : '#ffffff',
                        }}
                      >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={fee.checked}
                        onChange={(e) => handleCompCheckChange(fee.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.5 }}
                      />

                      {/* Description + amount breakdown — one truncating line */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.75,
                          minWidth: 0,
                          flex: '1 1 200px',
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="text.primary"
                          noWrap
                          sx={{ flexShrink: 0, maxWidth: '55%' }}
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
                          ₦{format(fee.amount)} · Paid ₦{format(fee.paid_amount)} · Bal ₦
                          {format(fee.balance)}
                          {fee.discount_amount > 0 && ` · Disc ₦${format(fee.discount_amount)}`}
                          {fee.penalty_amount > 0 && ` · Pen ₦${format(fee.penalty_amount)}`}
                        </Typography>
                      </Box>

                      {/* Installment dropdown (percentage) OR custom amount input — INTERACTIVE */}
                      <Box sx={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        {installmentalSetting === 'percentage' ? (
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={fee.installment_id || ''}
                              onChange={(e) => handleInstallmentChange(fee.id, e.target.value)}
                              displayEmpty
                              sx={{
                                borderRadius: 2,
                                '& .MuiSelect-select': { py: 0.5, fontSize: '0.8125rem' },
                              }}
                            >
                              <MenuItem value="">
                                <em>Select</em>
                              </MenuItem>
                              {(fee.installments || []).map((inst) => (
                                <MenuItem key={inst.id} value={inst.id}>
                                  {inst.inst1}%{inst.inst2 ? ` : ${inst.inst2}%` : ''}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            size="small"
                            type="number"
                            sx={{ width: 100, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                            value={fee.custom_amount}
                            onChange={(e) =>
                              handleCustomAmountChange(fee.id, e.target.value, 'comp')
                            }
                            inputProps={{ min: 0, max: fee.balance }}
                          />
                        )}
                      </Box>

                      {/* Payable — recalculates on installment/amount change */}
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="primary.main"
                        sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right', fontSize: '1.1rem' }}
                      >
                        ₦{format(fee.payable)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
                )}
              </Box>
            </Paper>

        {/* ══════════════════════════════════════════════ */}
        {/* OPTIONAL PAYMENT — card list, same reasoning as Compulsory */}
        {/* Header bar + content share one outer Paper — no gap — same as   */}
        {/* the Compulsory section above.                                  */}
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
                gap: { xs: 1.5, sm: 2 },
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              {optionalEnabled && optFees.length > 0 && (
                <>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Subtotal ₦{format(optTotal)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                </>
              )}
              {/* Enable / disable optional section */}
              {can('bursary_manager.ledger.create_invoice_discount') && (
                <Switch
                  checked={optionalEnabled}
                  onChange={(e) => setOptionalEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                    },
                  }}
                />
              )}
              {owingInfo?.owing_status !== 'owing' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenOptionalModal}
                  sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Add Optional Pay.
                </Button>
              )}
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
            {optFees.map((fee, idx) => (
              <Paper
                key={fee.id}
                variant="outlined"
                onClick={() => handleOptCheckChange(fee.id, !fee.checked)}
                sx={{
                  p: 0.75,
                  borderRadius: 2,
                  cursor: 'pointer',
                  borderColor: fee.checked
                    ? 'success.main'
                    : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : '#e2e8f0',
                  bgcolor: fee.checked
                    ? isDark
                      ? 'rgba(16,185,129,0.12)'
                      : '#ecfdf5'
                    : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : '#ffffff',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={fee.checked}
                    onChange={(e) => handleOptCheckChange(fee.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 0.5 }}
                  />

                  {/* Description + amount breakdown — one truncating line */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.75,
                      minWidth: 0,
                      flex: '1 1 200px',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="text.primary"
                      noWrap
                      sx={{ flexShrink: 0, maxWidth: '55%' }}
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
                      ₦{format(fee.amount)} · Paid ₦{format(fee.paid_amount)} · Bal ₦
                      {format(fee.balance)}
                      {fee.discount_amount > 0 && ` · Disc ₦${format(fee.discount_amount)}`}
                      {fee.penalty_amount > 0 && ` · Pen ₦${format(fee.penalty_amount)}`}
                    </Typography>
                  </Box>

                  {/* Payable */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right', fontSize: '1.1rem' }}
                  >
                    ₦{format(fee.payable)}
                  </Typography>
                </Box>

                {(fee.selectedOptions || []).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 4.5, mt: 0.5 }}>
                    {fee.selectedOptions.map((opt, oi) => {
                      const optionData =
                        typeof opt === 'number'
                          ? fee.optionsPool?.find((o) => o.option_id === opt)
                          : opt;

                      return (
                        <Chip
                          key={optionData?.option_id || oi}
                          label={`${optionData?.option_name || 'Option'} : ₦${format(optionData?.amount || 0)}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        ) : optionalEnabled ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2.5 }}>
            No outstanding optional fees. All optional payments have been cleared.
          </Typography>
        ) : null}
        </Box>
        </Paper>
          </Box>
          {/* ── end LEFT column ── */}

          {/* ── RIGHT: Sticky Payment Summary — the "checkout panel" ── */}
          <Box
            sx={{
              width: { xs: '100%', lg: 340 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 88 },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800}>
                Payment Summary
              </Typography>
              <Divider sx={{ my: 1 }} />

              {compFees.length > 0 && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Compulsory ({compSelectedCount}/{compFees.length})
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₦{format(compTotal)}
                  </Typography>
                </Box>
              )}
              {optionalEnabled && optFees.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Optional ({optSelectedCount}/{optFees.length})
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₦{format(optTotal)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Total Payable
                </Typography>
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  ₦{format(grandTotal)}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                fontWeight={800}
                color="primary.main"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Pay From
              </Typography>
              <Stack spacing={1} sx={{ mt: 1, mb: 1.5 }}>
                {availableWallets.map((wallet) => {
                  const walletInsufficient = grandTotal > 0 && wallet.balance < grandTotal;
                  return (
                    <Box
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet.id)}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'all .15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor:
                          selectedWallet === wallet.id ? wallet.themeSelectedBg : wallet.themeBg,
                        border: '1.5px solid',
                        borderColor: selectedWallet === wallet.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          bgcolor: wallet.themeHoverBg,
                          borderColor: wallet.themeMain,
                        },
                      }}
                    >
                      <Radio
                        checked={selectedWallet === wallet.id}
                        value={wallet.id}
                        size="small"
                        sx={{
                          color: 'error.main',
                          p: 0,
                          '&.Mui-checked': { color: 'error.main' },
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} noWrap>
                            {wallet.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            color="error.main"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            ₦{format(wallet.balance)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.primary"
                          noWrap
                          sx={{ display: 'block', fontWeight: 600 }}
                        >
                          {wallet.parent.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          Wallet No: {wallet.parent.wallet_number}
                        </Typography>
                        {walletInsufficient && (
                          <Chip
                            label="Insufficient balance"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5, '& .MuiChip-label': { px: 0.75 } }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              {insufficientBalance && (
                <Alert severity="warning" sx={{ mb: 1.5, py: 0.25 }}>
                  This wallet's balance is below the total payable — choose another wallet or
                  reduce your selection.
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                disabled={grandTotal === 0}
                onClick={() => {
                  if (grandTotal <= 0) {
                    notify.error('Please select at least one item to pay');
                    return;
                  }
                  setConfirmModalOpen(true);
                }}
                sx={{ py: 1.2, fontWeight: 700, fontSize: '1rem' }}
              >
                {grandTotal > 0 ? `Pay Now · ₦${format(grandTotal)}` : 'Pay Now'}
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════ */}
      {/* PAYMENT CONFIRMATION MODAL                   */}
      {/* ══════════════════════════════════════════════ */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Payment</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              You are about to make a payment for:
            </Typography>
            <Box
              sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: 2, p: 2 }}
            >
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Student
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {studentName}
              </Typography>
            </Box>
            {compTotal > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Compulsory
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₦{format(compTotal)}
                </Typography>
              </Box>
            )}
            {optTotal > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Optional
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₦{format(optTotal)}
                </Typography>
              </Box>
            )}
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                ₦{format(grandTotal)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Pay From
            </Typography>
            <Stack spacing={1}>
              {availableWallets.map((wallet) => (
                <Box
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet.id)}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: 'all .15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: selectedWallet === wallet.id ? wallet.themeSelectedBg : wallet.themeBg,
                    border: '1.5px solid',
                    borderColor: selectedWallet === wallet.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      bgcolor: wallet.themeHoverBg,
                      borderColor: wallet.themeMain,
                    },
                  }}
                >
                  <Radio
                    checked={selectedWallet === wallet.id}
                    value={wallet.id}
                    size="small"
                    sx={{
                      color: 'error.main',
                      p: 0,
                      '&.Mui-checked': { color: 'error.main' },
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} noWrap>
                        {wallet.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="error.main"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        ₦{format(wallet.balance)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      noWrap
                      sx={{ display: 'block', fontWeight: 600 }}
                    >
                      {wallet.parent.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ display: 'block' }}
                    >
                      Wallet No: {wallet.parent.wallet_number}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {insufficientBalance && (
              <Alert severity="warning" sx={{ py: 0.25 }}>
                This wallet's balance is below the total payable.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setConfirmModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            disabled={!selectedWallet || submittingPayment}
            onClick={() => {
              setConfirmModalOpen(false);
              handlePayNow();
            }}
            sx={{ fontWeight: 600 }}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════ */}
      {/* OPTIONAL PAYMENT MODAL                       */}
      {/* ══════════════════════════════════════════════ */}
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
                            sx={{ minWidth: { xs: 180, sm: 250 } }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mr: 1 }}
                            >
                              {opt.option_name}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ₦{(Number(opt.amount) || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        sx={{ mx: 0, '& .MuiFormControlLabel-label': { width: '100%' } }}
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

      {/* ── Print Invoice Modal ── */}
      <PrintInvoiceModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        student={{ user_id: studentInfo?.user_id || user_id, name: studentName }}
      />
    </PageContainer>
  );
};

export default PayInvoice;
