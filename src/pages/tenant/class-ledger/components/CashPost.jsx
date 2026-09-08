import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import {
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Alert,
  CircularProgress,
  Checkbox,
  Stack,
  Chip,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { postCashData } from '@/api/tenant/bursary/bursaryPayment';
import { getStudentSchedule } from '@/api/tenant/bursary/classLedger';
import { useNotification } from '@/hooks/useNotification';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Bursary' },
  { to: '/class-ledger', title: 'Class Ledger' },
  { title: 'Cash Posting' },
];

/* ================= COMPONENT ================= */
const CashPost = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user_id, invoiceId } = useParams();
  const notify = useNotification();

  /* DATA STATE */
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [activeSessionInfo, setActiveSessionInfo] = useState(null);
  const [owingInfo, setOwingInfo] = useState(null);
  const [compFees, setCompFees] = useState([]);
  const [optFees, setOptFees] = useState([]);
  const [installmentalSetting, setInstallmentalSetting] = useState('percentage');

  const [targetSessionTermId, setTargetSessionTermId] = useState(null);
  const [paymentType, setPaymentType] = useState('CASH');

  /* FILTER STATE */
  // const [selectedTermId, setSelectedTermId] = useState('');
  // const [selectedSessionId, setSelectedSessionId] = useState('');

  /* UI STATE */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  /* POST CASH */
  const [posting, setPosting] = useState(false);

  /* CHECKBOX HANDLERS */
  const handleCheckChange = (type, id, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => (f.id === id ? { ...f, checked } : f)));
  };

  const handleAllCheckChange = (type, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => ({ ...f, checked })));
  };

  const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);

  /* ── INSTALLMENT CHANGE HANDLER (same logic as PayInvoice) ── */
  const handleInstallmentChange = (type, feeId, value) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => {
        if (f.id !== feeId) return f;
        const selectedInst = (f.installments || []).find((inst) => inst.id === Number(value));
        const installmentPct = selectedInst ? Number(selectedInst.inst1) || 100 : 100;
        const base = Number(f.balance || f.amount || 0);
        const discount = Number(f.discount_amount || 0);
        const penalty = Number(f.penalty_amount || 0);
        const payable = Math.max(0, base * (installmentPct / 100) - discount + penalty);
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

  /* ── CUSTOM AMOUNT CHANGE HANDLER (same logic as PayInvoice) ── */
  /* Typing a post amount is a clear signal of intent to post that fee, so  */
  /* it auto-checks the row — otherwise the header's "Selected to Post"    */
  /* total (and the actual post payload, which only includes checked rows) */
  /* would silently ignore whatever the clerk just typed until they also   */
  /* remembered to tick the checkbox separately.                          */
  const handleCustomAmountChange = (type, feeId, rawVal) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => {
        if (f.id !== feeId) return f;
        const max = Number(f.balance || f.amount || 0);
        const custom = Math.min(Number(rawVal) || 0, max);
        const discount = Number(f.discount_amount || 0);
        const penalty = Number(f.penalty_amount || 0);
        const payable = Math.max(0, custom - discount + penalty);
        return { ...f, custom_amount: custom, payable, checked: custom > 0 ? true : f.checked };
      }),
    );
  };

  /* DYNAMIC PAYABLE — reads from stored payable on fee (like PayInvoice) */
  const getPayable = (fee) => Number(fee.payable || 0);

  /* POST CASH */
  const handlePostCash = async () => {
    setPosting(true);
    setError('');

    const buildItems = (fees) =>
      fees
        .filter((f) => !f.has_cashpost && f.checked)
        .map((f) => ({
          id: f.id,
          bursary_schedule_id: f.bursary_schedule_id,
          amount_to_pay: Number(f.payable || 0),
          discount: Number(f.discount_amount || 0),
          penalty: Number(f.penalty_amount || 0),
          installment_id: f.installment_id || null,
          installment_inst1: f.installment_inst1 || '',
          installment_inst2: f.installment_inst2 || '',
          custom_amount: Number(f.custom_amount) || 0,
        }));

    const payload = {
      user_id,
      session_term_id: targetSessionTermId,
      invoice_id: invoiceId || null,
      payment_type: paymentType,
      items: [...buildItems(compFees), ...buildItems(optFees)],
    };

    try {
      const res = await postCashData(payload);
      if (res.success) {
        await fetchData();
      } else {
        setError(res.message || 'Failed to post cash');
        setPosting(false);
        notify.error(res.message || 'Failed to post cash');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to post cash');
    } finally {
      setPosting(false);
    }
  };

  /* ───────────────────────────────────────────── */
  /* DATA FETCHING                                */
  /* ───────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!user_id || !invoiceId) return;

    setLoading(true);
    setError('');

    try {
      const res = await getStudentSchedule({
        userId: user_id,
        invoiceNumber: invoiceId,
      });

      if (!res.success || !res.data) {
        setError(res.message || 'Failed to load cashpost data');
        setLoading(false);
        return;
      }

      const { data } = res;

      setStudentInfo(data.student_info);
      setSessionInfo(data.session_info);
      setActiveSessionInfo(data.active_session_info);
      setOwingInfo(data.owing_info);
      setInstallmentalSetting(data.installmental_setting || 'percentage');

      const resolvedSTId =
        data.owing_info?.owing_status === 'owing'
          ? data.owing_info.owing_session_term_id
          : data.session_info.session_term_id;

      setTargetSessionTermId(resolvedSTId);

      // Map compulsory data: values from API; payable recalculated with installment
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

        const balance = Number(item.balance || 0);
        const discount_amount = Number(item.discount_amount || 0);
        const penalty_amount = Number(item.penalty_amount || 0);
        const installmentPct = defaultInst ? Number(defaultInst.inst1) || 100 : 100;
        const payable = Math.max(
          0,
          balance * (installmentPct / 100) - discount_amount + penalty_amount,
        );

        return {
          id: item.id,
          bursary_schedule_id: item.bursary_schedule_id,
          description: item.description,
          amount: Number(item.amount || 0),
          paid_amount: Number(item.paid_amount || 0),
          balance,
          discount_amount,
          penalty_amount,
          payable,
          installment_id: instId,
          installment_inst1: inst1,
          installment_inst2: inst2,
          installments: instList,
          has_cashpost: item.status === 'paid',
          custom_amount: Number(item.balance || item.amount || 0),
          checked: false,
        };
      });
      setCompFees(mappedComp);

      // Map optional data: values from API
      const mappedOpt = (data.optional_data || []).map((item) => {
        const instList = item.installments || [];
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

        const balance = Number(item.balance || 0);
        const discount_amount = Number(item.discount_amount || 0);
        const penalty_amount = Number(item.penalty_amount || 0);
        const installmentPct = defaultInst ? Number(defaultInst.inst1) || 100 : 100;
        const payable = Math.max(
          0,
          balance * (installmentPct / 100) - discount_amount + penalty_amount,
        );

        return {
          id: item.id,
          bursary_schedule_id: item.bursary_schedule_id,
          description: item.description,
          amount: Number(item.amount || 0),
          paid_amount: Number(item.paid_amount || 0),
          balance,
          discount_amount,
          penalty_amount,
          payable,
          installment_id: instId,
          installment_inst1: inst1,
          installment_inst2: inst2,
          installments: instList,
          has_cashpost: item.status === 'paid',
          custom_amount: Number(item.balance || item.amount || 0),
          checked: false,
        };
      });
      setOptFees(mappedOpt);

      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to fetch cashpost data:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load cashpost data');
    } finally {
      setLoading(false);
    }
  }, [user_id, invoiceId]);

  // Initial load: fetch cashpost data on mount
  useEffect(() => {
    fetchData();
  }, []);

  /* SECTION HEADER BLOCK — flush title strip, no border/radius/margin of its
     own. It sits directly on top of a content Box inside one outer Paper
     (see renderFeeSection below), so the bar and its fees read as one
     attached panel instead of two floating boxes with a gap between. */
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
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{action}</Box>
      </Box>
    );
  };

  /* RENDER FEE SECTION — header bar + fee cards share one outer Paper (no  */
  /* gap between them), each fee is a self-contained card instead of a      */
  /* wide table row, so nothing needs a horizontal scrollbar to read an     */
  /* amount and the row wraps responsively on mobile.                      */
  const renderFeeSection = ({ title, borderLeftColor, type, data, emptyLabel }) => {
    const subtotal = data.reduce((sum, f) => sum + getPayable(f), 0);

    return (
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
          title,
          borderLeftColor,
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action:
            data.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Subtotal ₦{format(subtotal)}
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
                    checked={data.length > 0 && data.every((f) => f.checked)}
                    indeterminate={data.some((f) => f.checked) && !data.every((f) => f.checked)}
                    onChange={(e) => handleAllCheckChange(type, e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                </Box>
              </Box>
            ) : null,
        })}

        <Box sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
          {data.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 2.5 }}
            >
              {emptyLabel}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {data.map((fee, i) => {
                const payable = getPayable(fee);

                return (
                  <Paper
                    key={fee.id}
                    variant="outlined"
                    onClick={() =>
                      !fee.has_cashpost && handleCheckChange(type, fee.id, !fee.checked)
                    }
                    sx={{
                      p: 0.75,
                      borderRadius: 2,
                      cursor: fee.has_cashpost ? 'default' : 'pointer',
                      borderColor: fee.has_cashpost
                        ? 'success.main'
                        : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : '#e2e8f0',
                      bgcolor: fee.has_cashpost
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
                        justifyContent: 'space-between',
                        gap: 1.5,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      {/* LEFT — checkbox + description + amount breakdown, own width only */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Checkbox
                          size="small"
                          checked={fee.checked}
                          onChange={(e) => handleCheckChange(type, fee.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={fee.has_cashpost}
                          sx={{ p: 0.5, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="text.primary"
                          noWrap
                          sx={{ flexShrink: 0, maxWidth: { xs: 130, sm: 170 } }}
                        >
                          {i + 1}. {fee.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.secondary"
                          noWrap
                          sx={{ fontSize: '0.9375rem', maxWidth: { xs: 150, sm: 260 } }}
                        >
                          ₦{format(fee.amount)} · Paid ₦{format(fee.paid_amount)} · Bal ₦
                          {format(fee.balance || fee.amount)}
                          {fee.discount_amount > 0 && ` · Disc ₦${format(fee.discount_amount)}`}
                          {fee.penalty_amount > 0 && ` · Pen ₦${format(fee.penalty_amount)}`}
                        </Typography>
                        {fee.has_cashpost && (
                          <Chip
                            label="Cash Posted"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ flexShrink: 0, fontWeight: 600 }}
                          />
                        )}
                      </Box>

                      {/* MIDDLE — Amount to Post, centered in the remaining space */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Post
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          sx={{
                            width: 100,
                            bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white',
                            // Hide the native spinner — this is a plain type-in amount, not a stepper
                            '& input[type=number]': { MozAppearance: 'textfield' },
                            '& input[type=number]::-webkit-outer-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                          }}
                          disabled={fee.has_cashpost}
                          value={fee.custom_amount}
                          onChange={(e) => handleCustomAmountChange(type, fee.id, e.target.value)}
                          inputProps={{ min: 0, max: fee.balance || fee.amount }}
                          placeholder="0"
                        />
                      </Box>

                      {/* RIGHT — Payable, pinned to the far edge */}
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="primary.main"
                        sx={{
                          flexShrink: 0,
                          minWidth: 80,
                          textAlign: 'right',
                          fontSize: '1.1rem',
                        }}
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
    );
  };

  /* ───────────────────────────────────────────── */
  /* LOADING / ERROR SCREEN                       */
  /* ───────────────────────────────────────────── */
  if (loading && !dataLoaded) {
    return (
      <PageContainer title="Cash Posting">
        <Breadcrumb title="Cash Posting" items={BCrumb} />
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
      <PageContainer title="Cash Posting">
        <Breadcrumb title="Cash Posting" items={BCrumb} />
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
  const studentGender = studentInfo?.gender || '';
  const studentArm = studentInfo?.class_arm || '';

  /* ── Header summary — this student's outstanding balance, and a live   */
  /* running total of what's currently checked to post, so the clerk can */
  /* see it without scrolling down to the button.                        */
  const allFees = [...compFees, ...optFees];
  const totalOutstanding = allFees.reduce(
    (sum, f) => sum + (Number(f.balance || f.amount) || 0),
    0,
  );
  const selectedFees = allFees.filter((f) => f.checked);
  const selectedToPostTotal = selectedFees.reduce((sum, f) => sum + getPayable(f), 0);

  const BCrumbLive = [
    { to: '/', title: 'Home' },
    { title: 'Bursary' },
    { to: '/class-ledger', title: 'Class Ledger' },
    { title: `Cash Post - ${studentName}` },
  ];

  return (
    <PageContainer title="Cash Posting">
      <Breadcrumb title="Cash Posting" items={BCrumbLive} />
      <Box sx={{ pb: 4 }}>
        {/* HEADER - Student Info & Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 2,
            mt: 1.5,
            p: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            borderRadius: '12px',
          }}
        >
          {/* LEFT - Student Details */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h5" fontWeight={800} color="text.primary" noWrap>
                  {studentName}
                </Typography>
                {studentGender && (
                  <Chip
                    label={
                      studentGender.toLowerCase() === 'male'
                        ? 'Male'
                        : studentGender.toLowerCase() === 'female'
                          ? 'Female'
                          : studentGender
                    }
                    size="small"
                    color={
                      studentGender.toLowerCase() === 'male'
                        ? 'info'
                        : studentGender.toLowerCase() === 'female'
                          ? 'secondary'
                          : 'default'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
              <Typography variant="body2" fontWeight={600} color="text.secondary" noWrap>
                {studentLearnerId} • {studentClassName} {studentArm}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary" noWrap>
                {activeSessionInfo?.session} {activeSessionInfo?.term}
              </Typography>
            </Box>
          </Box>

          {/* RIGHT - Quick summary: this student's outstanding balance, and */}
          {/* a live total of whatever's currently checked to post — saves  */}
          {/* the clerk a scroll down to the button to see the running sum. */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Outstanding Balance
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color="error.main">
                ₦{format(totalOutstanding)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Selected to Post
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                ₦{format(selectedToPostTotal)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* OWING WARNING BANNER */}
        {owingInfo?.owing_status === 'owing' && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '1.05rem' }}>
            <strong>Outstanding Balance Detected</strong>
            <br />
            You need to pay for the previous term you owe{' '}
            <strong>{owingInfo.owing_session_label}</strong> before you can pay for this term.{' '}
          </Alert>
        )}

        {/* ERROR ALERT — your existing one stays below this */}

        {/* ERROR ALERT */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* COMPULSORY PAYMENT — no discount/penalty toggles, values come from API */}
        {renderFeeSection({
          title: 'Compulsory Payment',
          borderLeftColor: '#10b981',
          type: 'comp',
          data: compFees,
          emptyLabel: 'No outstanding compulsory payments for this student.',
        })}

        {/* OPTIONAL PAYMENT — no discount/penalty toggles, values come from API */}
        {renderFeeSection({
          title: 'Optional Payment',
          borderLeftColor: '#3b82f6',
          type: 'opt',
          data: optFees,
          emptyLabel: 'No outstanding optional payments for this student.',
        })}

        {/* PAYMENT METHOD + POST — one action bar, method on the left, the */}
        {/* button (with the running selected total) anchored on the right */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <InputLabel id="cashpost-payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="cashpost-payment-method-label"
              label="Payment Method"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="BANK_TELLER">Bank Teller</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handlePostCash}
            disabled={posting || selectedFees.length === 0}
            sx={{
              px: 5,
              py: 1.2,
              fontSize: '1rem',
              fontWeight: 700,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {posting ? <CircularProgress size={22} sx={{ mr: 1 }} /> : null}
            {posting ? 'Posting...' : `Post All Cash — ₦${format(selectedToPostTotal)}`}
          </Button>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default CashPost;
