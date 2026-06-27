import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  TextField,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  Alert,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { getStudentSchedule, postCashData } from '@/api/tenant/bursary/classLedger';

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

  /* DATA STATE */
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [activeSessionInfo, setActiveSessionInfo] = useState(null);
  const [owingInfo, setOwingInfo] = useState(null);
  const [compFees, setCompFees] = useState([]);
  const [optFees, setOptFees] = useState([]);
  const [installmentalSetting, setInstallmentalSetting] = useState('percentage');

  const [targetSessionTermId, setTargetSessionTermId] = useState(null);

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
        return { ...f, custom_amount: custom, payable };
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
      items: [...buildItems(compFees), ...buildItems(optFees)],
    };

    try {
      const res = await postCashData(payload);
      if (res.success) {
        await fetchData();
      } else {
        setError(res.message || 'Failed to post cash');
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
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{action}</Box>
      </Paper>
    );
  };

  /* RENDER TABLE — read-only discount/penalty from API, interactive installment (like PayInvoice) */
  const renderTable = (type, data) => {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? '#222' : '#fafafa' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount (₦)</TableCell>
              <TableCell align="right">Paid (₦)</TableCell>
              <TableCell align="right">Balance (₦)</TableCell>
              <TableCell align="center">Discount (₦)</TableCell>
              <TableCell align="center">Penalty (₦)</TableCell>
              <TableCell align="center">
                {installmentalSetting === 'percentage' ? 'Installment' : 'Amount (₦)'}
              </TableCell>
              <TableCell align="right">Payable (₦)</TableCell>
              <TableCell align="right">
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
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
                    checked={data.length > 0 && data.every((f) => f.checked)}
                    indeterminate={data.some((f) => f.checked) && !data.every((f) => f.checked)}
                    onChange={(e) => handleAllCheckChange(type, e.target.checked)}
                    sx={{ p: 0.5 }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((fee, i) => {
              const payable = getPayable(fee);

              return (
                <TableRow
                  key={fee.id}
                  hover
                  sx={{
                    bgcolor: fee.has_cashpost
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.08)'
                        : '#f0fdf4'
                      : 'inherit',
                  }}
                >
                  <TableCell>{String(i + 1).padStart(2, '0')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {fee.description}
                    </Typography>
                    {fee.has_cashpost && (
                      <Typography variant="caption" color="success.main" fontWeight={600}>
                        ✓ Cash Posted
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {format(fee.amount)}
                  </TableCell>

                  {/* PAID — read-only */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {format(fee.paid_amount)}
                    </Typography>
                  </TableCell>

                  {/* BALANCE — read-only */}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={(fee.balance || fee.amount) > 0 ? 'error.main' : 'text.secondary'}
                    >
                      {format(fee.balance || fee.amount)}
                    </Typography>
                  </TableCell>

                  {/* DISCOUNT — read-only from API */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {format(fee.discount_amount)}
                    </Typography>
                  </TableCell>

                  {/* PENALTY — read-only from API */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>
                      {format(fee.penalty_amount)}
                    </Typography>
                  </TableCell>

                  {/* INSTALLMENT / CUSTOM AMOUNT — interactive (same logic as PayInvoice) */}
                  <TableCell align="center">
                    {installmentalSetting === 'percentage' ? (
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={fee.installment_id || ''}
                          onChange={(e) => handleInstallmentChange(type, fee.id, e.target.value)}
                          displayEmpty
                          disabled={fee.has_cashpost}
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
                        sx={{ width: 110 }}
                        disabled={fee.has_cashpost}
                        value={fee.custom_amount}
                        onChange={(e) => handleCustomAmountChange(type, fee.id, e.target.value)}
                        inputProps={{ min: 0, max: fee.balance || fee.amount }}
                      />
                    )}
                  </TableCell>

                  {/* PAYABLE — recalculated on installment/amount change */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}>
                      {format(payable)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Checkbox
                      size="small"
                      checked={fee.checked}
                      onChange={(e) => handleCheckChange(type, fee.id, e.target.checked)}
                      disabled={fee.has_cashpost}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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
  const BCrumbLive = [
    { to: '/', title: 'Home' },
    { title: 'Bursary' },
    { to: '/class-ledger', title: 'Class Ledger' },
    { title: `Cash Post - ${studentName}` },
  ];

  return (
    <PageContainer title="Cash Posting">
      <Breadcrumb title="Cash Posting" items={BCrumbLive} />
      <Box>
        {/* HEADER - Student Info & Filters */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
            mt: 2,
            p: 2.5,
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
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {studentName}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {studentLearnerId} • {studentClassName}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                {activeSessionInfo.session} {activeSessionInfo.term}
              </Typography>
            </Box>
          </Box>

          {/* RIGHT - Refresh */}
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Button
             
              size="small"
              onClick={() => {
                if (selectedSessionId && selectedTermId) {
                  fetchData(selectedSessionId, selectedTermId, '');
                }
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Refresh
            </Button>
          </Box>
          */}
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
        {renderHeaderBlock({
          title: 'Compulsory Payment',
          borderLeftColor: '#10b981',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: null,
        })}

        {compFees.length > 0 ? (
          renderTable('comp', compFees)
        ) : (
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
              No compulsory payment schedules found for this student.
            </Typography>
          </Paper>
        )}

        {/* OPTIONAL PAYMENT — no discount/penalty toggles, values come from API */}
        {renderHeaderBlock({
          title: 'Optional Payment',
          borderLeftColor: '#3b82f6',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: null,
        })}

        {optFees.length > 0 ? (
          renderTable('opt', optFees)
        ) : (
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
              No optional payment schedules found for this student.
            </Typography>
          </Paper>
        )}

        {/* POST CASH BUTTON */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 4 }}>
          <Button
            size="large"
            onClick={handlePostCash}
            disabled={posting}
            sx={{ px: 6, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
          >
            {posting ? <CircularProgress size={22} sx={{ mr: 1 }} /> : null}
            {posting
              ? 'Posting...'
              : `Post All Cash — ₦${format(
                  [...compFees, ...optFees]
                    .filter((f) => f.checked)
                    .reduce((sum, f) => sum + getPayable(f), 0),
                )}`}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default CashPost;
