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
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

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
            session: active.sesname || '',
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

  /* ── Pay Now ── */
  const handlePayNow = async () => {
    if (grandTotal <= 0) {
      notify.error('Please select at least one item to pay');
      return;
    }

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
    }
  };

  /* SECTION HEADER BLOCK */
  const renderHeaderBlock = ({ title, borderLeftColor, icon, action }) => (
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

  /* ── Shared read-only cell style ── */
  const roCell = {
    py: 1.5,
    fontWeight: 600,
    color: 'text.primary',
  };

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

  /* Shared table head cell style */
  const thCell = {
    fontWeight: 600,
    color: isDark ? '#94a3b8' : '#475569',
    py: 1.5,
    whiteSpace: 'nowrap',
  };

  return (
    <PageContainer title={breadcrumbTitle}>
      <Breadcrumb title={breadcrumbTitle} items={BCrumbLive} />
      <Box sx={{ pb: 8 }}>
        {/* HEADER — Student Info */}
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
              sx={{ width: 72, height: 72, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', mb: 1.5 }}
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
              <strong>Bursary Session/Term:</strong> {activeSessionInfo.session}{' '}
              {activeSessionInfo.term}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/class-ledger')}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              textTransform: 'none',
              fontWeight: 600,
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
        {/* ══════════════════════════════════════════════ */}
        {renderHeaderBlock({
          title: `Compulsory Payment${owingInfo?.owing_session_label ? ` - ${owingInfo.owing_session_label}` : ''}`,
          borderLeftColor: '#10b981',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: null,
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
                <TableCell sx={thCell}>#</TableCell>
                <TableCell sx={thCell}>Pay Description</TableCell>
                <TableCell sx={thCell}>Original Amount (₦)</TableCell>
                <TableCell align="center" sx={thCell}>
                  Paid (₦)
                </TableCell>
                <TableCell align="center" sx={thCell}>
                  Balance (₦)
                </TableCell>
                <TableCell align="center" sx={thCell}>
                  Discount (₦)
                </TableCell>
                <TableCell align="center" sx={thCell}>
                  Penalty (₦)
                </TableCell>
                <TableCell align="center" sx={thCell}>
                  {installmentalSetting === 'percentage' ? 'Installment' : 'Amount (₦)'}
                </TableCell>
                <TableCell sx={thCell}>Payable (₦)</TableCell>
                <TableCell align="right" sx={thCell}>
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
              {compFees.map((fee, idx) => (
                <TableRow
                  key={fee.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>

                  {/* Description */}
                  <TableCell sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>
                    {fee.description}
                  </TableCell>

                  {/* Amount — read-only */}
                  <TableCell sx={{ ...roCell, fontWeight: 700, fontSize: '1rem' }}>
                    ₦{format(fee.amount)}
                  </TableCell>

                  {/* Paid — read-only */}
                  <TableCell align="center" sx={roCell}>
                    ₦{format(fee.paid_amount)}
                  </TableCell>

                  {/* Balance — read-only */}
                  <TableCell align="center" sx={roCell}>
                    ₦{format(fee.balance)}
                  </TableCell>

                  {/* Discount — read-only */}
                  <TableCell align="center" sx={roCell}>
                    ₦{format(fee.discount_amount)}
                  </TableCell>

                  {/* Penalty — read-only */}
                  <TableCell align="center" sx={roCell}>
                    ₦{format(fee.penalty_amount)}
                  </TableCell>

                  {/* Installment dropdown (percentage) OR custom amount input — INTERACTIVE */}
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
                        sx={{ width: 110, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                        value={fee.custom_amount}
                        onChange={(e) => handleCustomAmountChange(fee.id, e.target.value, 'comp')}
                        inputProps={{ min: 0, max: fee.balance }}
                      />
                    )}
                  </TableCell>

                  {/* Payable — recalculates on installment/amount change */}
                  <TableCell
                    sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}
                  >
                    ₦{format(fee.payable)}
                  </TableCell>

                  {/* Checkbox */}
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Checkbox
                      size="small"
                      checked={fee.checked}
                      onChange={(e) => handleCompCheckChange(fee.id, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* Footer */}
              <TableRow sx={{ bgcolor: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe' }}>
                <TableCell colSpan={8} sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    Total Compulsory
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    color: isDark ? '#60a5fa' : '#1e40af',
                    fontSize: '1.5rem',
                  }}
                >
                  ₦{format(compTotal)}
                </TableCell>
                <TableCell sx={{ py: 1.5 }} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* ══════════════════════════════════════════════ */}
        {/* OPTIONAL PAYMENT                             */}
        {/* ══════════════════════════════════════════════ */}
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
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={thCell}>#</TableCell>
                  <TableCell sx={thCell}>Item</TableCell>
                  <TableCell sx={thCell}>Original Amount (₦)</TableCell>
                  <TableCell align="center" sx={thCell}>
                    Paid (₦)
                  </TableCell>
                  <TableCell align="center" sx={thCell}>
                    Balance (₦)
                  </TableCell>
                  <TableCell align="center" sx={thCell}>
                    Discount (₦)
                  </TableCell>
                  <TableCell align="center" sx={thCell}>
                    Penalty (₦)
                  </TableCell>
                  <TableCell sx={thCell}>Payable (₦)</TableCell>
                  <TableCell align="right" sx={thCell}>
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
                {optFees.map((fee, idx) => (
                  <TableRow
                    key={fee.id}
                    hover
                    sx={{
                      bgcolor: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>

                    {/* Item name + selected option chips */}
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ mb: 0.5 }}
                      >
                        {fee.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(fee.selectedOptions || []).map((opt, oi) => {
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
                    </TableCell>

                    {/* Amount — read-only */}
                    <TableCell sx={{ ...roCell, fontWeight: 700, fontSize: '1rem' }}>
                      ₦{format(fee.amount)}
                    </TableCell>

                    {/* Paid — read-only */}
                    <TableCell align="center" sx={roCell}>
                      ₦{format(fee.paid_amount)}
                    </TableCell>

                    {/* Balance — read-only */}
                    <TableCell align="center" sx={roCell}>
                      ₦{format(fee.balance)}
                    </TableCell>

                    {/* Discount — read-only */}
                    <TableCell align="center" sx={roCell}>
                      ₦{format(fee.discount_amount)}
                    </TableCell>

                    {/* Penalty — read-only */}
                    <TableCell align="center" sx={roCell}>
                      ₦{format(fee.penalty_amount)}
                    </TableCell>

                    {/* Payable — from API (optional fees have no installment control here) */}
                    <TableCell
                      sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}
                    >
                      ₦{format(fee.payable)}
                    </TableCell>

                    {/* Checkbox */}
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Checkbox
                        size="small"
                        checked={fee.checked}
                        onChange={(e) => handleOptCheckChange(fee.id, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Footer */}
                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                  <TableCell colSpan={7} sx={{ py: 1.5 }}>
                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                      Total Optional
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      fontWeight: 800,
                      color: isDark ? '#60a5fa' : '#1e40af',
                      fontSize: '1.5rem',
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

        {/* ══════════════════════════════════════════════ */}
        {/* STICKY BOTTOM ACTION SHEET                   */}
        {/* ══════════════════════════════════════════════ */}
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
            bgcolor: isDark ? 'rgba(234,179,8,0.15)' : '#fef9c3',
            border: `1px solid ${isDark ? 'rgba(234,179,8,0.3)' : '#fef08a'}`,
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Left — legends with bulk-select checkboxes */}
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

          {/* Right — Pay button */}
          {/* Right side - Amount bigger + button under it */}
          <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
              ₦{format(grandTotal)}
            </Typography>

            <Button
              variant="contained"
              disabled={grandTotal === 0}
              onClick={() => {
                if (grandTotal <= 0) {
                  notify.error('Please select at least one item to pay');
                  return;
                }
                setConfirmModalOpen(true);
              }}
              sx={{
                px: 4,
                py: 1.2,
                fontSize: '1.05rem',
                fontWeight: 700,
              }}
            >
              Pay Now
            </Button>
          </Box>
        </Paper>
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => setConfirmModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
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
            variant="contained"
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
