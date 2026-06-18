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
    FormControl,
    Select,
    MenuItem,
    Grid,
    Switch,
    useTheme,
    Alert,
    Checkbox,
    TextField,
    CircularProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { fetchInvoiceByNumber } from '@/api/tenant/bursary/classLedger';
import { fetchActiveSessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';
import PrintInvoiceModal from '@/components/tenant/bursary/payment-shedule/PrintInvoiceModal';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Bursary' },
    { to: '/class-ledger', title: 'Class Ledger' },
    { title: 'Invoice' },
];

/* ================= COMPONENT ================= */
const Invoice = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { invoiceId,user_id } = useParams();
    const navigate = useNavigate();

    /* DATA STATE */
    const [studentInfo, setStudentInfo] = useState(null);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [invoiceInfo, setInvoiceInfo] = useState(null);
    const [compFees, setCompFees] = useState([]);
    const [optFees, setOptFees] = useState([]);
    const [installments, setInstallments] = useState([]);
    const [assignedInstallmentId, setAssignedInstallmentId] = useState(null);

    /* FILTER STATE */
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState('');

    /* UI STATE */
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);

    const [optionalEnabled, setOptionalEnabled] = useState(true);
    const [compInstallment, setCompInstallment] = useState('Select Installment');
    const [globalInstallment, setGlobalInstallment] = useState('Select Installment');
    const [printModalOpen, setPrintModalOpen] = useState(false);

    /* GLOBAL SWITCHES */
    const [compDiscountGlobal, setCompDiscountGlobal] = useState(false);
    const [compPenaltyGlobal, setCompPenaltyGlobal] = useState(false);
    const [optDiscountGlobal, setOptDiscountGlobal] = useState(false);
    const [optPenaltyGlobal, setOptPenaltyGlobal] = useState(false);

    /* ACTIONS */
    const handleCompCheckChange = (id, checked) => {
        setCompFees(prev => prev.map(f => f.id === id ? { ...f, checked } : f));
    };

    const handleOptCheckChange = (id, checked) => {
        setOptFees(prev => prev.map(f => f.id === id ? { ...f, checked } : f));
    };

    const handleAllCompCheckChange = (checked) => {
        setCompFees(prev => prev.map(f => ({ ...f, checked })));
    };

    const handleAllOptCheckChange = (checked) => {
        setOptFees(prev => prev.map(f => ({ ...f, checked })));
    };

    const handleOptOptionChange = (id, value) => {
        setOptFees(prev => prev.map(f => f.id === id ? { ...f, selectedOption: value } : f));
    };

    /* DISCOUNT / PENALTY UPDATE ACTIONS */
    const handleDiscountValueChange = (type, id, val) => {
        const setter = type === 'comp' ? setCompFees : setOptFees;
        setter(prev => prev.map(f => f.id === id ? { ...f, discount: Math.max(0, Number(val || 0)) } : f));
    };

    const handlePenaltyValueChange = (type, id, val) => {
        const setter = type === 'comp' ? setCompFees : setOptFees;
        setter(prev => prev.map(f => f.id === id ? { ...f, penalty: Math.max(0, Number(val || 0)) } : f));
    };

    const handleDiscountSwitchChange = (type, id, checked) => {
        const setter = type === 'comp' ? setCompFees : setOptFees;
        setter(prev => prev.map(f => f.id === id ? { ...f, discountEnabled: checked } : f));
    };

    const handlePenaltySwitchChange = (type, id, checked) => {
        const setter = type === 'comp' ? setCompFees : setOptFees;
        setter(prev => prev.map(f => f.id === id ? { ...f, penaltyEnabled: checked } : f));
    };

    /* DYNAMIC PAYABLE CALCULATION */
    const getPayable = (fee, discountGlobal, penaltyGlobal) => {
        const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
        const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;

        const discount = discountRowEnabled ? Number(fee.discount || 0) : 0;
        const penalty = penaltyRowEnabled ? Number(fee.penalty || 0) : 0;

        return Math.max(0, fee.amount - discount + penalty);
    };

    /* COMPUTATIONS */
    const compTotal = compFees.reduce((acc, f) => {
        return f.checked ? acc + getPayable(f, compDiscountGlobal, compPenaltyGlobal) : acc;
    }, 0);

    const optTotal = optionalEnabled ? optFees.reduce((acc, f) => {
        return f.checked ? acc + getPayable(f, optDiscountGlobal, optPenaltyGlobal) : acc;
    }, 0) : 0;

    const grandTotal = compTotal + optTotal;

    const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);

    /* ───────────────────────────────────────────── */
    /* DATA FETCHING                                */
    /* ───────────────────────────────────────────── */
    const fetchInvoiceData = useCallback(async (sessionId, termId) => {
        if (!invoiceId) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetchInvoiceByNumber({
                sessionId,
                termId,
                invoiceNumber: invoiceId,
                userId: user_id,
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
            setInstallments(data.installments || []);
            setAssignedInstallmentId(data.assigned_installment_id);

            // Map compulsory data: add checked:false
            const mappedComp = (data.compulsory_data || []).map(item => ({
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
            }));
            setCompFees(mappedComp);

            // Map optional data: add checked:false, map options to string arrays
            const mappedOpt = (data.optional_data || []).map(item => ({
                id: item.id,
                description: item.description,
                schedule_amount: item.schedule_amount,
                amount: item.amount,
                optionType: item.option_type || '',
                options: (item.options || []).map(o => o.option_name),
                selectedOption: item.selected_option_name || '',
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
            }));
            setOptFees(mappedOpt);

            // Set installment dropdown defaults
            if (data.assigned_installment_id) {
                const assigned = data.installments?.find(i => i.id === data.assigned_installment_id);
                if (assigned) {
                    setCompInstallment(assigned.inst1 || 'Select Installment');
                    setGlobalInstallment(assigned.inst1 || 'Select Installment');
                }
            }

            setDataLoaded(true);
        } catch (err) {
            console.error('Failed to fetch invoice data:', err);
            setError(err?.response?.data?.message || err.message || 'Failed to load invoice data');
        } finally {
            setLoading(false);
        }
    }, [invoiceId]);

    // Fetch active session/term on mount, then load invoice data
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

                    // Fetch invoice using session_id, term_id, invoiceId, and user_id from URL
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
    /* LOADING / ERROR SCREEN                     */
    /* ───────────────────────────────────────────── */
    if (loading && !dataLoaded) {
        return (
            <PageContainer title="Invoice">
                <Breadcrumb title="Invoice" items={BCrumb} />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <CircularProgress size={40} />
                </Box>
            </PageContainer>
        );
    }

    if (error && !dataLoaded) {
        return (
            <PageContainer title="Invoice">
                <Breadcrumb title="Invoice" items={BCrumb} />
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

    <Typography
        variant="h5"
        fontWeight={800}
        color="text.primary"
        sx={{ lineHeight: 1.3 }}
    >
        {studentName}
    </Typography>

    <Typography
        variant="body1"
        fontWeight={600}
        color="text.secondary"
        sx={{ mt: 0.5 }}
    >
        <strong>Learner ID:</strong> {studentLearnerId}
    </Typography>

    <Typography
        variant="body1"
        fontWeight={600}
        color="text.secondary"
    >
        <strong>Class:</strong> {studentClassName}
    </Typography>

    <Typography
        variant="body1"
        fontWeight={600}
        color="text.secondary"
    >
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

                {/* INFO ALERT BANNER
                {dataLoaded && invoiceInfo?.status && (
                    <Alert
                        icon={false}
                        severity={invoiceInfo.status === 'complete' ? 'success' : 'info'}
                        sx={{
                            mb: 4,
                            bgcolor: isDark ? 'rgba(3, 105, 161, 0.2)' : '#e0f2fe',
                            color: isDark ? '#bae6fd' : '#0369a1',
                            border: `1px solid ${isDark ? 'rgba(3, 105, 161, 0.4)' : '#bae6fd'}`,
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            '& .MuiAlert-message': {
                                textAlign: 'center',
                                width: '100%',
                                fontWeight: 500,
                            },
                        }}
                    >
                        Invoice #{invoiceNumber} — {sessionLabel} {termLabel} — Status: {invoiceInfo.status}
                    </Alert>
                )} */}

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
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
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
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                            {/* <Button
                                variant="contained"
                                size="small"
                                onClick={() => setPrintModalOpen(true)}
                            >
                                Print Invoice
                            </Button> */}
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
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                    }}
                >
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Pay Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Amount (NGN)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Discount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Penalty</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Payable</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={600} color={isDark ? '#94a3b8' : '#475569'}>
                                            Mark
                                        </Typography>
                                        <Checkbox
                                            size="small"
                                            checked={compFees.length > 0 && compFees.every((f) => f.checked)}
                                            indeterminate={compFees.some((f) => f.checked) && !compFees.every((f) => f.checked)}
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
                                    <TableRow key={fee.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>
                                        <TableCell sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>{fee.description}</TableCell>
                                        <TableCell sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                                            ₦{format(fee.amount)}
                                        </TableCell>

                                        {/* DISCOUNT */}
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                <Switch
                                                    size="small"
                                                    checked={discountRowEnabled}
                                                    disabled={compDiscountGlobal}
                                                    onChange={(e) => handleDiscountSwitchChange('comp', fee.id, e.target.checked)}
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
                                                    sx={{ width: 80, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                                                    disabled={!discountFieldEnabled}
                                                    value={fee.discount}
                                                    onChange={(e) => handleDiscountValueChange('comp', fee.id, e.target.value)}
                                                    inputProps={{ min: 0 }}
                                                />
                                            </Box>
                                        </TableCell>

                                        {/* PENALTY */}
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                <Switch
                                                    size="small"
                                                    checked={penaltyRowEnabled}
                                                    disabled={compPenaltyGlobal}
                                                    onChange={(e) => handlePenaltySwitchChange('comp', fee.id, e.target.checked)}
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
                                                    sx={{ width: 80, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                                                    disabled={!penaltyFieldEnabled}
                                                    value={fee.penalty}
                                                    onChange={(e) => handlePenaltyValueChange('comp', fee.id, e.target.value)}
                                                    inputProps={{ min: 0 }}
                                                />
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
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
                            <TableRow sx={{ bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe' }}>
                                <TableCell colSpan={5} sx={{ py: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                            Select Installment Plan
                                        </Typography>
                                        <FormControl size="small" sx={{ minWidth: 160, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'white', borderRadius: 2 }}>
                                            <Select
                                                value={compInstallment}
                                                onChange={(e) => setCompInstallment(e.target.value)}
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiSelect-select': { py: 0.75, fontSize: '0.875rem' }
                                                }}
                                            >
                                                <MenuItem value="Select Installment">Select Installment</MenuItem>
                                                {installments.map((inst) => (
                                                    <MenuItem key={inst.id} value={inst.inst1 || inst.id}>
                                                        {inst.inst1}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, fontWeight: 800, color: isDark ? '#60a5fa' : '#1e40af', fontSize: '1.25rem' }}>
                                    ₦{format(compTotal)}
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                    <Button
                                        variant="contained"
                                        disabled={compTotal === 0}
                                        // sx={{
                                        //     bgcolor: isDark ? '#475569' : '#94a3b8',
                                        //     color: 'white',
                                        //     '&:hover': { bgcolor: isDark ? '#334155' : '#64748b' },
                                        //     '&.Mui-disabled': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', color: isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8' },
                                        //     textTransform: 'none',
                                        //     fontWeight: 700,
                                        //     borderRadius: 2,
                                        //     px: 3,
                                        //     py: 0.8,
                                        // }}
                                    >
                                        Pay Now - ₦{format(compTotal)} &gt;
                                    </Button>
                                </TableCell>
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
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
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
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
                        }}
                    >
                        <Table sx={{ minWidth: 1000 }}>
                            <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>#</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Pay Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Options</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Amount (NGN)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Discount</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Penalty</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>Payable</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', py: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                            <Typography variant="body2" fontWeight={600} color={isDark ? '#94a3b8' : '#475569'}>
                                                Mark
                                            </Typography>
                                            <Checkbox
                                                size="small"
                                                checked={optFees.length > 0 && optFees.every((f) => f.checked)}
                                                indeterminate={optFees.some((f) => f.checked) && !optFees.every((f) => f.checked)}
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
                                        <TableRow key={fee.id} hover sx={{ bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4', '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{idx + 1}</TableCell>
                                            <TableCell sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>{fee.description}</TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <FormControl size="small" sx={{ minWidth: 120, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'white', borderRadius: 2 }}>
                                                    <Select
                                                        value={fee.selectedOption}
                                                        onChange={(e) => handleOptOptionChange(fee.id, e.target.value)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem' }
                                                        }}
                                                    >
                                                        {fee.options.map((opt) => (
                                                            <MenuItem key={opt} value={opt}>
                                                                {opt}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                                                ₦{format(fee.amount)}
                                            </TableCell>

                                            {/* DISCOUNT */}
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                    <Switch
                                                        size="small"
                                                        checked={discountRowEnabled}
                                                        disabled={optDiscountGlobal}
                                                        onChange={(e) => handleDiscountSwitchChange('opt', fee.id, e.target.checked)}
                                                        
                                                    />
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        sx={{ width: 80, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                                                        disabled={!discountFieldEnabled}
                                                        value={fee.discount}
                                                        onChange={(e) => handleDiscountValueChange('opt', fee.id, e.target.value)}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </Box>
                                            </TableCell>

                                            {/* PENALTY */}
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                    <Switch
                                                        size="small"
                                                        checked={penaltyRowEnabled}
                                                        disabled={optPenaltyGlobal}
                                                        onChange={(e) => handlePenaltySwitchChange('opt', fee.id, e.target.checked)}
                                                       
                                                    />
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        sx={{ width: 80, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'white' }}
                                                        disabled={!penaltyFieldEnabled}
                                                        value={fee.penalty}
                                                        onChange={(e) => handlePenaltyValueChange('opt', fee.id, e.target.value)}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ py: 1.5, fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
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
                                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                                    <TableCell colSpan={6} sx={{ py: 1.5 }} />
                                    <TableCell sx={{ py: 1.5, fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.25rem' }}>
                                        ₦{format(optTotal)}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }} />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : optionalEnabled && (
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
                )}

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
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'row', sm: 'column', md: 'column' }, 
                        justifyContent: { xs: 'space-between', sm: 'flex-start' },
                        gap: { xs: 2, sm: 0.5 } 
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Checkbox
                                size="small"
                                checked={compFees.length > 0 && compFees.every(f => f.checked)}
                                indeterminate={compFees.some(f => f.checked) && !compFees.every(f => f.checked)}
                                onChange={(e) => handleAllCompCheckChange(e.target.checked)}
                                sx={{
                                    color: '#10b981',
                                    '&.Mui-checked': { color: '#10b981' },
                                    '&.MuiCheckbox-indeterminate': { color: '#10b981' },
                                    p: 0.5
                                }}
                            />
                            <Typography variant="body2" fontWeight={600} color={isDark ? '#cbd5e1' : '#374151'}>
                                Compulsory Payment
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Checkbox
                                size="small"
                                checked={optionalEnabled && optFees.length > 0 && optFees.every(f => f.checked)}
                                indeterminate={optionalEnabled && optFees.some(f => f.checked) && !optFees.every(f => f.checked)}
                                disabled={!optionalEnabled}
                                onChange={(e) => handleAllOptCheckChange(e.target.checked)}
                                sx={{
                                    color: '#84cc16',
                                    '&.Mui-checked': { color: '#84cc16' },
                                    '&.MuiCheckbox-indeterminate': { color: '#84cc16' },
                                    p: 0.5
                                }}
                            />
                            <Typography variant="body2" fontWeight={600} color={isDark ? '#cbd5e1' : '#374151'}>
                                Optional Payment
                            </Typography>
                        </Box>
                    </Box>

                    {/* MIDDLE - Global Installment Dropdown */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: '100%', md: 'auto' } 
                    }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
                            Select Installment Plan
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 220, width: { xs: '100%', sm: 220, md: 220 }, bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'white', borderRadius: 2 }}>
                            <Select
                                value={globalInstallment}
                                onChange={(e) => setGlobalInstallment(e.target.value)}
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiSelect-select': { py: 1, fontSize: '0.875rem' }
                                }}
                            >
                                <MenuItem value="Select Installment">Select Installment</MenuItem>
                                {installments.map((inst) => (
                                    <MenuItem key={inst.id} value={inst.inst1 || inst.id}>
                                        {inst.inst1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* RIGHT - Sticky Pay Button */}
                    <Button
                        variant="contained"
                        disabled={grandTotal === 0}
                        // sx={{
                        //     bgcolor: '#84cc16',
                        //     color: 'white',
                        //     '&:hover': { bgcolor: '#65a30d' },
                        //     '&.Mui-disabled': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', color: isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8' },
                        //     textTransform: 'none',
                        //     fontWeight: 700,
                        //     fontSize: '1rem',
                        //     borderRadius: 3,
                        //     px: 4,
                        //     py: 1.2,
                        //     width: { xs: '100%', md: 'auto' },
                        //     display: 'flex',
                        //     alignItems: 'center',
                        //     justifyContent: 'center',
                        //     gap: 1.5,
                        //     boxShadow: '0 4px 6px -1px rgba(132, 204, 22, 0.4)',
                        // }}
                    >
                        Pay Now - ₦{format(grandTotal)} &gt;
                    </Button>
                </Paper>
            </Box>

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
