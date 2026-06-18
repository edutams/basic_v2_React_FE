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
  InputLabel,
  Select,
  MenuItem,
  Switch,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { fetchCashPostData } from '@/api/tenant/bursary/classLedger';
import { fetchActiveSessionTerm, fetchActiveCategories } from '@/api/tenant/bursary/bursarySettingsApi';

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
  const { user_id } = useParams();
  const navigate = useNavigate();

  /* DATA STATE */
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [compFees, setCompFees] = useState([]);
  const [optFees, setOptFees] = useState([]);
  const [installments, setInstallments] = useState([]);

  /* FILTER STATE */
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  /* UI STATE */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  /* GLOBAL SWITCHES */
  const [compDiscountGlobal, setCompDiscountGlobal] = useState(false);
  const [compPenaltyGlobal, setCompPenaltyGlobal] = useState(false);
  const [optDiscountGlobal, setOptDiscountGlobal] = useState(false);
  const [optPenaltyGlobal, setOptPenaltyGlobal] = useState(false);

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

  /* DYNAMIC PAYABLE CALCULATION */
  const getPayable = (fee, discountGlobal, penaltyGlobal) => {
    const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
    const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;
    const discount = discountRowEnabled ? Number(fee.discount || 0) : 0;
    const penalty = penaltyRowEnabled ? Number(fee.penalty || 0) : 0;
    return Math.max(0, fee.amount - discount + penalty);
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
      });

      if (!res.success || !res.data) {
        setError(res.message || 'Failed to load cashpost data');
        setLoading(false);
        return;
      }

      const { data } = res;

      setStudentInfo(data.student_info);
      setSessionInfo(data.session_info);
      setInstallments(data.installments || []);

      // Map compulsory data: add editable fields
      const mappedComp = (data.compulsory_data || []).map((item) => ({
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
        installment_name: item.installment_name || '',
        has_cashpost: !!item.has_cashpost,
      }));
      setCompFees(mappedComp);

      // Map optional data: add editable fields
      const mappedOpt = (data.optional_data || []).map((item) => ({
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
        installment_name: item.installment_name || '',
        has_cashpost: !!item.has_cashpost,
      }));
      setOptFees(mappedOpt);

      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to fetch cashpost data:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load cashpost data');
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  // Fetch active categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetchActiveCategories();
        const list = Array.isArray(res?.data) ? res.data : [];
        setCategories(list);
        if (list.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(String(list[0].id));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch active session/term on mount, then load cashpost data.
  // Waits for categories to load first so we don't do a double-fetch.
  useEffect(() => {
    if (categoriesLoading || categories.length === 0) return;

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

          await fetchData(active.session_id, active.term_id, selectedCategoryId);
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
  }, [fetchData, selectedCategoryId, categories, categoriesLoading]);

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
              <TableCell align="right">Amount (NGN)</TableCell>
              <TableCell align="center">Discount</TableCell>
              <TableCell align="center">Penalty</TableCell>
              <TableCell align="center">Installment</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="right">Payable</TableCell>
              <TableCell align="center">Action</TableCell>
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

                  {/* INSTALLMENT */}
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={fee.installment_name || ''}
                        onChange={(e) => {
                          const selectedInst = installments.find(
                            (inst) => inst.inst1 === e.target.value || inst.id === e.target.value
                          );
                          updateFee(type, fee.id, 'installment_name', e.target.value);
                          updateFee(type, fee.id, 'installment_id', selectedInst?.id || null);
                        }}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select</em>
                        </MenuItem>
                        {installments.map((inst) => (
                          <MenuItem key={inst.id} value={inst.inst1 || inst.id}>
                            {inst.inst1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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

                  {/* ACTION */}
                  <TableCell align="center">
                    <Button variant="contained" size="small" disabled={fee.has_cashpost}>
                      {fee.has_cashpost ? 'Posted' : 'Post Cash'}
                    </Button>
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
        {/* HEADER - Student Info */}
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

        {/* CATEGORY FILTER */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            mt: 2,
            p: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            borderRadius: '12px',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Payment Category</InputLabel>
            <Select
              value={selectedCategoryId}
              label="Payment Category"
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={categoriesLoading}
            >
              {categoriesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Filter fee items by payment category
          </Typography>
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
                  onChange={(e) => setCompDiscountGlobal(e.target.checked)}
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
                  onChange={(e) => setCompPenaltyGlobal(e.target.checked)}
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
                  onChange={(e) => setOptDiscountGlobal(e.target.checked)}
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
                  onChange={(e) => setOptPenaltyGlobal(e.target.checked)}
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
      </Box>
    </PageContainer>
  );
};

export default CashPost;
