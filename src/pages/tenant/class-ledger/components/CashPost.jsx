import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  FormControl,
  Select,
  MenuItem,
  Switch,
  useTheme,
  Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { fetchCashPostData, postCashData } from '@/api/tenant/bursary/classLedger';
import { fetchActiveSessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';

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
  const { user_id,invoiceId } = useParams();
  const navigate = useNavigate();

  /* DATA STATE */
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [compFees, setCompFees] = useState([]);
  const [optFees, setOptFees] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [installmentalSetting, setInstallmentalSetting] = useState('percentage');

  /* FILTER STATE */
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  /* UI STATE */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  /* GLOBAL SWITCHES */
  const [compDiscountGlobal, setCompDiscountGlobal] = useState(false);
  const [compPenaltyGlobal, setCompPenaltyGlobal] = useState(false);
  const [optDiscountGlobal, setOptDiscountGlobal] = useState(false);
  const [optPenaltyGlobal, setOptPenaltyGlobal] = useState(false);

  /* GLOBAL VALUE MODAL */
  const [globalModal, setGlobalModal] = useState({ open: false, type: 'comp', field: 'discount' });
  const [globalModalValue, setGlobalModalValue] = useState('');

  /* CHECKBOX HANDLERS */
  const handleCheckChange = (type, id, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => (f.id === id ? { ...f, checked } : f)));
  };

  const handleAllCheckChange = (type, checked) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) => prev.map((f) => ({ ...f, checked })));
  };

  /* POST CASH */
  const [posting, setPosting] = useState(false);

  /* UPDATE FIELD — local editing only (discount/penalty values) */
  const updateFee = (type, id, key, value) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, [key]: value };
        // Prevent negative values for discount and penalty
        updated.discount = Math.max(0, Number(updated.discount || 0));
        updated.penalty = Math.max(0, Number(updated.penalty || 0));
        return updated;
      })
    );
  };

  const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);

  /* DYNAMIC PAYABLE CALCULATION — factors in installment percentage */
  const getPayable = (fee, discountGlobal, penaltyGlobal) => {
    const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
    const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;
    const discount = discountRowEnabled ? Number(fee.discount || 0) : 0;
    const penalty = penaltyRowEnabled ? Number(fee.penalty || 0) : 0;
    let baseAmount;
    if (installmentalSetting === 'percentage') {
      const installmentPct = Number(fee.installment_pct) || Number(fee.installment_inst1) || 100;
      baseAmount = fee.amount * (installmentPct / 100);
    } else {
      baseAmount = Math.min(Number(fee.custom_amount) || fee.amount, fee.amount);
    }
    return Math.max(0, baseAmount - discount + penalty);
  };

  /* GLOBAL MODAL CONFIRM */
  const handleGlobalModalConfirm = () => {
    const value = Number(globalModalValue) || 0;
    const { type, field } = globalModal;
    const setter = type === 'comp' ? setCompFees : setOptFees;
    const setGlobal = type === 'comp'
      ? (field === 'discount' ? setCompDiscountGlobal : setCompPenaltyGlobal)
      : (field === 'discount' ? setOptDiscountGlobal : setOptPenaltyGlobal);

    setter((prev) =>
      prev.map((f) => ({ ...f, [field]: value, [`${field}Enabled`]: true }))
    );
    setGlobal(true);
    setGlobalModal({ ...globalModal, open: false });
  };

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
          amount_to_pay: Number(f.amountToPay) || 0,
          discount: Number(f.discount) || 0,
          penalty: Number(f.penalty) || 0,
          installment_id: f.installment_id || null,
          installment_inst1: f.installment_inst1 || '',
          installment_inst2: f.installment_inst2 || '',
          custom_amount: Number(f.custom_amount) || 0,
        }));

    const payload = {
      user_id,
      session_id: selectedSessionId,
      term_id: selectedTermId,
      invoice_id: invoiceId || null,
      items: [...buildItems(compFees), ...buildItems(optFees)],
    };

    try {
      const res = await postCashData(payload);
      if (res.success) {
        await fetchData(selectedSessionId, selectedTermId, '');
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
  const fetchData = useCallback(async (sessionId, termId, categoryId) => {
    if (!user_id) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetchCashPostData({
        sessionId,
        termId,
        userId: user_id,
        categoryId,
        invoiceId,

      });

      if (!res.success || !res.data) {
        setError(res.message || 'Failed to load cashpost data');
        setLoading(false);
        return;
      }

      const { data } = res;

      setStudentInfo(data.student_info);
      setSessionInfo(data.session_info);
      const installmentsList = data.installments || [];
      setInstallments(installmentsList);
      setInstallmentalSetting(data.installmental_setting || 'percentage');

      // Helper to find installment data from installment_id
      const findInstallment = (item) => {
        const match = installmentsList.find(
          (inst) => inst.id === item.installment_id || inst.inst1 === item.installment_name || inst.inst2 === item.installment_name
        );
        return match || null;
      };

      // Map compulsory data: add editable fields
      const mappedComp = (data.compulsory_data || []).map((item) => {
        const inst = findInstallment(item);
        return {
          id: item.id,
          bursary_schedule_id: item.bursary_schedule_id,
          description: item.description,
          amount: item.amount,
          schedule_amount: item.schedule_amount,
          discount: item.discount || 0,
          discountEnabled: !!item.discount_enabled,
          penalty: item.penalty || 0,
          penaltyEnabled: !!item.penalty_enabled,
          paid_amount: item.paid_amount || 0,
          balance: item.balance || item.amount,
          installment_id: item.installment_id || null,
          installment_inst1: inst ? String(inst.inst1) : '',
          installment_inst2: inst ? String(inst.inst2) : '',
          installment_pct: item.installment_pct !== undefined ? Number(item.installment_pct) : (inst ? Number(inst.inst1) : 100),
          installment_part: item.installment_part || 'inst1',
          has_cashpost: !!item.has_cashpost,
          amountToPay: item.balance || item.amount,
          custom_amount: item.amount,
          checked: false,
        };
      });
      setCompFees(mappedComp);

      // Map optional data: add editable fields
      const mappedOpt = (data.optional_data || []).map((item) => {
        const inst = findInstallment(item);
        return {
          id: item.id,
          bursary_schedule_id: item.bursary_schedule_id,
          description: item.description,
          amount: item.amount,
          schedule_amount: item.schedule_amount,
          discount: item.discount || 0,
          discountEnabled: !!item.discount_enabled,
          penalty: item.penalty || 0,
          penaltyEnabled: !!item.penalty_enabled,
          paid_amount: item.paid_amount || 0,
          balance: item.balance || item.amount,
          installment_id: item.installment_id || null,
          installment_inst1: inst ? String(inst.inst1) : '',
          installment_inst2: inst ? String(inst.inst2) : '',
          installment_pct: item.installment_pct !== undefined ? Number(item.installment_pct) : (inst ? Number(inst.inst1) : 100),
          installment_part: item.installment_part || 'inst1',
          has_cashpost: !!item.has_cashpost,
          amountToPay: item.balance || item.amount,
          custom_amount: item.amount,
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
  }, [user_id]);

  // Initial load: fetch session/term AND cashpost data on mount
  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetchActiveSessionTerm();
        if (sessionRes.status && sessionRes.data) {
          const active = sessionRes.data;
          setSelectedSessionId(active.session_id || '');
          setSelectedTermId(active.term_id || '');
          setSessionInfo({
            session_id: active.session_id,
            term_id: active.term_id,
            session: active.sesname || '',
            term: active.term_name || '',
          });

          await fetchData(active.session_id, active.term_id, '');
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

  /* RENDER TABLE */
  const renderTable = (type, data) => {
    const discountGlobal = type === 'comp' ? compDiscountGlobal : optDiscountGlobal;
    const penaltyGlobal = type === 'comp' ? compPenaltyGlobal : optPenaltyGlobal;

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? '#222' : '#fafafa' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount (₦)</TableCell>
              <TableCell align="center">Discount (₦)</TableCell>
              <TableCell align="center">Penalty (₦)</TableCell>
              <TableCell align="center">
                {installmentalSetting === 'percentage' ? 'Installment' : 'Choice Amount (₦)'} 
              </TableCell>
              <TableCell align="right">Paid(₦)</TableCell>
              <TableCell align="right">Balance(₦)</TableCell>
              <TableCell align="right">Payable(₦)</TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600} color={isDark ? '#94a3b8' : '#475569'}>
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
              const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
              const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;
              const discountFieldEnabled = discountGlobal ? true : !!fee.discountEnabled;
              const penaltyFieldEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;
              const payable = getPayable(fee, discountGlobal, penaltyGlobal);

              return (
                <TableRow
                  key={fee.id}
                  hover
                  sx={{
                    bgcolor: fee.has_cashpost
                      ? (isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4')
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
                  <TableCell align="right">{format(fee.amount)}</TableCell>

                  {/* DISCOUNT */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <Switch
                        size="small"
                        checked={discountRowEnabled}
                        disabled={discountGlobal}
                        onChange={(e) => updateFee(type, fee.id, 'discountEnabled', e.target.checked)}
                      />
                      <TextField
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled={!discountFieldEnabled}
                        value={fee.discount}
                        onChange={(e) => updateFee(type, fee.id, 'discount', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  </TableCell>

                  {/* PENALTY */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <Switch
                        size="small"
                        checked={penaltyRowEnabled}
                        disabled={penaltyGlobal}
                        onChange={(e) => updateFee(type, fee.id, 'penaltyEnabled', e.target.checked)}
                      />
                      <TextField
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled={!penaltyFieldEnabled}
                        value={fee.penalty}
                        onChange={(e) => updateFee(type, fee.id, 'penalty', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  </TableCell>

                  {/* INSTALLMENT / CUSTOM AMOUNT */}
                  <TableCell align="center">
                    {installmentalSetting === 'percentage' ? (
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <Select
                          value={fee.installment_id || ''}
                          onChange={(e) => {
                            const selectedInst = installments.find(
                              (inst) => inst.id === Number(e.target.value)
                            );
                            updateFee(type, fee.id, 'installment_id', selectedInst?.id || null);
                            updateFee(type, fee.id, 'installment_inst1', selectedInst ? String(selectedInst.inst1) : '');
                            updateFee(type, fee.id, 'installment_inst2', selectedInst ? String(selectedInst.inst2) : '');
                            const newPct = selectedInst
                              ? (fee.has_cashpost ? Number(selectedInst.inst2) : Number(selectedInst.inst1))
                              : 100;
                            updateFee(type, fee.id, 'installment_pct', newPct);
                          }}
                          displayEmpty
                          disabled={fee.has_cashpost}
                        >
                          <MenuItem value="">
                            <em>Select</em>
                          </MenuItem>
                          {installments.map((inst) => (
                            <MenuItem key={inst.id} value={inst.id}>
                              {fee.has_cashpost ? inst.inst2 : inst.inst1}
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
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value) || 0, fee.amount);
                          updateFee(type, fee.id, 'custom_amount', val);
                        }}
                        inputProps={{ min: 0, max: fee.amount }}
                      />
                    )}
                  </TableCell>

                  {/* PAID */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {format(fee.paid_amount)}
                    </Typography>
                  </TableCell>

                  {/* BALANCE */}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={(fee.balance || fee.amount) > 0 ? 'error.main' : 'text.secondary'}
                    >
                      {format(fee.balance || fee.amount)}
                    </Typography>
                  </TableCell>

                  {/* PAYABLE */}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} />
        </Box>
      </PageContainer>
    );
  }

  if (error && !dataLoaded) {
    return (
      <PageContainer title="Cash Posting">
        <Breadcrumb title="Cash Posting" items={BCrumb} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>{error}</Alert>
        </Box>
      </PageContainer>
    );
  }

  const studentName = studentInfo?.name || 'Unknown Student';
  const studentLearnerId = studentInfo?.user_id || '—';
  const studentClassName = studentInfo?.class_name || '—';
  const termLabel = sessionInfo?.term || '';
  const sessionLabel = sessionInfo?.session || '';

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
                {sessionLabel} {termLabel}
              </Typography>
            </Box>
          </Box>

          {/* RIGHT - Refresh */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Button
              variant="contained"
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
        </Box>

        {/* ERROR ALERT */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        )}

        {/* COMPULSORY PAYMENT */}
        {renderHeaderBlock({
          title: 'Compulsory Payment',
          borderLeftColor: '#10b981',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: (
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Discount</Typography>
                <Switch
                  size="small"
                  checked={compDiscountGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'comp', field: 'discount' });
                      setGlobalModalValue('');
                    } else {
                      setCompFees((prev) =>
                        prev.map((f) => ({ ...f, discount: 0, discountEnabled: false }))
                      );
                      setCompDiscountGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Penalty</Typography>
                <Switch
                  size="small"
                  checked={compPenaltyGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'comp', field: 'penalty' });
                      setGlobalModalValue('');
                    } else {
                      setCompFees((prev) =>
                        prev.map((f) => ({ ...f, penalty: 0, penaltyEnabled: false }))
                      );
                      setCompPenaltyGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                    },
                  }}
                />
              </Box>
            </Box>
          ),
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

        {/* OPTIONAL PAYMENT */}
        {renderHeaderBlock({
          title: 'Optional Payment',
          borderLeftColor: '#3b82f6',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          action: (
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Discount</Typography>
                <Switch
                  size="small"
                  checked={optDiscountGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'opt', field: 'discount' });
                      setGlobalModalValue('');
                    } else {
                      setOptFees((prev) =>
                        prev.map((f) => ({ ...f, discount: 0, discountEnabled: false }))
                      );
                      setOptDiscountGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>Penalty</Typography>
                <Switch
                  size="small"
                  checked={optPenaltyGlobal}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGlobalModal({ open: true, type: 'opt', field: 'penalty' });
                      setGlobalModalValue('');
                    } else {
                      setOptFees((prev) =>
                        prev.map((f) => ({ ...f, penalty: 0, penaltyEnabled: false }))
                      );
                      setOptPenaltyGlobal(false);
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8338ec',
                      '& + .MuiSwitch-track': { backgroundColor: '#8338ec' },
                    },
                  }}
                />
              </Box>
            </Box>
          ),
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
            variant="contained"
            size="large"
            onClick={handlePostCash}
            disabled={posting}
            sx={{ px: 6, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
          >
            {posting ? <CircularProgress size={22} sx={{ mr: 1 }} /> : null}
            {posting ? 'Posting...' : `Post All Cash — ₦${format(
              [...compFees, ...optFees]
                .filter((f) => f.checked)
                .reduce((sum, f) => {
                  const g = compFees.includes(f) ? { d: compDiscountGlobal, p: compPenaltyGlobal } : { d: optDiscountGlobal, p: optPenaltyGlobal };
                  return sum + getPayable(f, g.d, g.p);
                }, 0)
            )}`}
          </Button>
        </Box>

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
            <Button onClick={() => setGlobalModal({ ...globalModal, open: false })}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleGlobalModalConfirm}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default CashPost;
