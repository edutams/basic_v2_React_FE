import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  FileUpload as UploadIcon,
  Wallet as WalletIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import StatCard from '@/components/shared/StatCard';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CompulsoryScheduleTab from '@/components/tenant/bursary/payment-shedule/CompulsoryScheduleTab';
import OptionalPaymentTab from '@/components/tenant/bursary/payment-shedule/OptionalPaymentTab';
import GenerateInvoiceTab from '@/components/tenant/bursary/payment-shedule/GenerateInvoiceTab';
import SendInvoiceTab from '@/components/tenant/bursary/payment-shedule/SendInvoiceTab';
import {
  fetchBursarySessionTerms,
  fetchActiveCategories,
  fetchPaymentScheduleStats,
  fetchGenerateInvoiceStats,
  fetchTermsBySessionTerm,
  importPaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchSendInvoiceStats } from '@/api/tenant/bursary/sendInvoiceApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment Schedule' }];

const PaymentShedule = () => {
  const [actionTab, setActionTab] = useState(0);
  const [scheduleTab, setScheduleTab] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeSubTermId, setActiveSubTermId] = useState(null);
  const [subTerms, setSubTerms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({
    schedule: { total: 0, classes: 0 },
    paymentName: { withMinSchedule: 0, withMaxSchedule: 0, minLabel: 'N/A', maxLabel: 'N/A' },
    studentCategory: { withMinSchedule: 0, withMaxSchedule: 0, minLabel: 'N/A', maxLabel: 'N/A' },
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [invoiceStats, setInvoiceStats] = useState({
    invoiceGenerated: 0,
    totalAmount: 0,
    paymentNames: [
      { name: 'With Minimum Invoice', count: 0, amount: 0, label: 'N/A' },
      { name: 'With Maximum Invoice', count: 0, amount: 0, label: 'N/A' },
    ],
    categories: [
      { name: 'With Minimum Invoice', count: 0, amount: 0, label: 'N/A' },
      { name: 'With Maximum Invoice', count: 0, amount: 0, label: 'N/A' },
    ],
  });
  const [loadingInvoiceStats, setLoadingInvoiceStats] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);

  const refreshStats = () => {
    if (!selectedSession || !activeSubTermId) return;
    const payOption = scheduleTab === 0 ? 'compulsory' : 'optional';
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const res = await fetchPaymentScheduleStats(selectedSession, activeSubTermId, payOption);
        if (res?.success && res.data) {
          const { schedule, amount, student_category } = res.data;
          setScheduleStats({
            schedule: { total: schedule?.total ?? 0, classes: schedule?.classes ?? 0 },
            paymentName: {
              withMinSchedule: amount?.min?.amount ?? 0,
              withMaxSchedule: amount?.max?.amount ?? 0,
              minLabel: amount?.min?.name ?? 'N/A',
              maxLabel: amount?.max?.name ?? 'N/A',
            },
            studentCategory: {
              withMinSchedule: student_category?.min?.amount ?? 0,
              withMaxSchedule: student_category?.max?.amount ?? 0,
              minLabel: student_category?.min?.name ?? 'N/A',
              maxLabel: student_category?.max?.name ?? 'N/A',
            },
          });
        }
      } catch (err) {
        console.error('Failed to refresh stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        setLoadingSessions(true);
        const res = await fetchBursarySessionTerms();

        const list = Array.isArray(res?.data) ? res.data : [];
        setSessions(list);

        if (list.length > 0) {
          const firstItem = list[0];
          setSelectedSessionTerm(firstItem.id);
          setSelectedSession(firstItem.session_id);
          setSelectedTerm(firstItem.term_id);
        }
      } catch (err) {
        showSnackbar('Failed to load session terms', 'error');
      } finally {
        setLoadingSessions(false);
      }
    };

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchActiveCategories();

        const list = Array.isArray(res?.data) ? res.data : [];
        setCategories(list);

        if (list.length > 0) {
          setSelectedCategory(String(list[0].id));
        }
      } catch (err) {
        showSnackbar('Failed to load categories', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadSessionTerms();
    loadCategories();
  }, []);

  const selectedSessionLabel =
    sessions.find((s) => s.id === selectedSessionTerm)?.session?.sesname || '';

  const selectedCategoryLabel =
    categories.find((c) => String(c.id) === String(selectedCategory))?.name || '';

  const handleSessionTermChange = (sessionTermId) => {
    const selectedItem = sessions.find((s) => s.id === sessionTermId);
    if (selectedItem) {
      setSelectedSessionTerm(sessionTermId);
      setSelectedSession(selectedItem.session_id);
      setSelectedTerm(selectedItem.term_id);
      setActiveSubTermId(null);
    }
  };

  useEffect(() => {
    if (!selectedSession) {
      setSubTerms([]);
      return;
    }

    const loadSubTerms = async () => {
      try {
        const res = await fetchTermsBySessionTerm(selectedSession, selectedTerm);
        const list = Array.isArray(res?.data) ? res.data : [];
        setSubTerms(list);
      } catch (err) {
        console.error('Failed to load sub-terms:', err);
        setSubTerms([]);
      }
    };

    loadSubTerms();
  }, [selectedSession, selectedTerm]);

  const firstSubTermId = subTerms[0]?.term_id ?? null;
  const activeSubTermIndex = subTerms.findIndex((term) => term.term_id === activeSubTermId);
  const previousSubTerm = activeSubTermIndex > 0 ? subTerms[activeSubTermIndex - 1] : null;
  const currentSubTerm = activeSubTermIndex >= 0 ? subTerms[activeSubTermIndex] : null;
  const canImportSchedule =
    Boolean(activeSubTermId) && Boolean(firstSubTermId) && activeSubTermId !== firstSubTermId;

  const getSubTermLabel = (term) =>
    term?.display_term?.display_name || term?.displayTerm?.display_name || 'Term';

  const handleActionTabChange = (e, v) => setActionTab(v);
  const handleScheduleTabChange = (e, v) => setScheduleTab(v);

  const handleUpdateCategory = (categoryId, sessionTermId) => {
    setActionTab(0);
    setSelectedCategory(String(categoryId));
    handleSessionTermChange(sessionTermId);
  };

  const handleImportSchedule = () => {
    setImportDialogOpen(true);
  };

  const handleConfirmImportSchedule = async () => {
    if (!selectedSession || !activeSubTermId || !selectedCategory) {
      showSnackbar('Please select a session, term, and category before importing', 'error');
      return;
    }

    const payOption = scheduleTab === 0 ? 'compulsory' : 'optional';
    const payType = 'bursary';

    try {
      setImporting(true);
      const res = await importPaymentSchedule({
        session_id: selectedSession,
        term_id: activeSubTermId,
        bursary_payment_category_id: selectedCategory,
        pay_option: payOption,
        pay_type: payType,
      });

      if (res?.success) {
        showSnackbar(res.message || 'Payment schedules imported successfully');
        setImportDialogOpen(false);
        setScheduleRefreshKey((key) => key + 1);
        refreshStats();
      } else {
        showSnackbar(res?.message || 'Failed to import payment schedules', 'error');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to import payment schedules';
      showSnackbar(message, 'error');
    } finally {
      setImporting(false);
    }
  };

  // Fetch stats when session, term, schedule tab, or sub-term changes
  useEffect(() => {
    if (!selectedSession || !activeSubTermId) return;
    const payOption = scheduleTab === 0 ? 'compulsory' : 'optional';
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const res = await fetchPaymentScheduleStats(selectedSession, activeSubTermId, payOption);
        if (res?.success && res.data) {
          const { schedule, amount, student_category } = res.data;
          setScheduleStats({
            schedule: {
              total: schedule?.total ?? 0,
              classes: schedule?.classes ?? 0,
            },
            paymentName: {
              withMinSchedule: amount?.min?.amount ?? 0,
              withMaxSchedule: amount?.max?.amount ?? 0,
              minLabel: amount?.min?.name ?? 'N/A',
              maxLabel: amount?.max?.name ?? 'N/A',
            },
            studentCategory: {
              withMinSchedule: student_category?.min?.amount ?? 0,
              withMaxSchedule: student_category?.max?.amount ?? 0,
              minLabel: student_category?.min?.name ?? 'N/A',
              maxLabel: student_category?.max?.name ?? 'N/A',
            },
          });
        }
      } catch (err) {
        console.error('Failed to load schedule stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [selectedSession, activeSubTermId, scheduleTab]);

  const stats = scheduleStats;

  // Fetch invoice stats when session term changes or when Generate Invoice tab is active
  useEffect(() => {
    if (!selectedSessionTerm || actionTab !== 1) return;
    const loadInvoiceStats = async () => {
      try {
        setLoadingInvoiceStats(true);
        const res = await fetchGenerateInvoiceStats(selectedSessionTerm, selectedClass);
        if (res?.success && res.data) {
          const { invoice_generated, total_amount, payment_names, categories } = res.data;
          setInvoiceStats({
            invoiceGenerated: invoice_generated ?? 0,
            totalAmount: total_amount ?? 0,
            paymentNames: [
              {
                name: 'With Minimum Invoice',
                count: payment_names?.min?.count ?? 0,
                amount: payment_names?.min?.amount ?? 0,
                label: payment_names?.min?.name ?? 'N/A',
              },
              {
                name: 'With Maximum Invoice',
                count: payment_names?.max?.count ?? 0,
                amount: payment_names?.max?.amount ?? 0,
                label: payment_names?.max?.name ?? 'N/A',
              },
            ],
            categories: [
              {
                name: 'With Minimum Invoice',
                count: categories?.min?.count ?? 0,
                amount: categories?.min?.amount ?? 0,
                label: categories?.min?.name ?? 'N/A',
              },
              {
                name: 'With Maximum Invoice',
                count: categories?.max?.count ?? 0,
                amount: categories?.max?.amount ?? 0,
                label: categories?.max?.name ?? 'N/A',
              },
            ],
          });
        }
      } catch (err) {
        console.error('Failed to load invoice stats:', err);
      } finally {
        setLoadingInvoiceStats(false);
      }
    };
    loadInvoiceStats();
  }, [selectedSessionTerm, actionTab, selectedClass]);

  const [sendInvoiceStatsData, setSendInvoiceStatsData] = useState({
    total_sent: 0,
    sent_by_mail: 0,
    sent_by_sms: 0,
    excel_generated: 0,
  });
  const [loadingSendInvoiceStats, setLoadingSendInvoiceStats] = useState(false);
  const [sendInvoiceRefreshKey, setSendInvoiceRefreshKey] = useState(0);

  const refreshSendInvoiceStats = () => {
    setSendInvoiceRefreshKey((prev) => prev + 1);
  };

  // Fetch send invoice stats
  useEffect(() => {
    if (!selectedSessionTerm || actionTab !== 2) return;
    const loadSendInvoiceStats = async () => {
      try {
        setLoadingSendInvoiceStats(true);
        const res = await fetchSendInvoiceStats({
          sessionTermId: selectedSessionTerm,
          classId: selectedClass || undefined,
        });
        if (res?.success && res.data) {
          setSendInvoiceStatsData({
            total_sent: res.data.total_sent || 0,
            sent_by_mail: res.data.sent_by_mail || 0,
            sent_by_sms: res.data.sent_by_sms || 0,
            excel_generated: res.data.excel_generated || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load send invoice stats:', err);
      } finally {
        setLoadingSendInvoiceStats(false);
      }
    };
    loadSendInvoiceStats();
  }, [selectedSessionTerm, actionTab, selectedClass, sendInvoiceRefreshKey]);

  const formatCurrency = (value) =>
    `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sendInvoiceStats = [
    { label: 'Total Invoice Sent', value: sendInvoiceStatsData.total_sent, icon: MessageIcon },
    { label: 'Invoice Sent by Mail', value: sendInvoiceStatsData.sent_by_mail, icon: EmailIcon },
    { label: 'Invoice Sent by SMS', value: sendInvoiceStatsData.sent_by_sms, icon: EmailIcon },
    { label: 'Excel Generated', value: sendInvoiceStatsData.excel_generated, icon: ArticleIcon },
  ];

  return (
    <PageContainer title="Payment Schedule" description="Configure fees and payment settings">
      <Breadcrumb
        title="Payment Schedule"
        subtitle="Configure how fees are collected for the current term"
        items={BCrumb}
      />

      {/* Dynamic Stats Cards based on active tab */}
      {actionTab === 0 && (
        // Set Schedule Stats
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="body2" color="textSecondary" mb={3}>
                {scheduleTab === 0 ? 'Compulsory Schedule' : 'Optional Schedule'}
              </Typography>

              <Box display="flex" justifyContent="space-between" alignItems="center" gap={4}>
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    borderRadius: 1,
                    px: 3,
                    py: 2,
                    minWidth: 100,
                    textAlign: 'center',
                  }}
                >
                  {loadingStats ? (
                    <Skeleton width={90} height={48} />
                  ) : (
                    <Typography
                      variant="h2"
                      fontWeight={700}
                      color="primary"
                      sx={{ lineHeight: 1 }}
                    >
                      {stats.schedule.total}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {loadingStats ? (
                    <Skeleton width={80} height={40} />
                  ) : (
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                      {stats.schedule.classes}
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary">
                    Classes
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 25,
                    height: 25,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptIcon color="primary" sx={{ fontSize: 14 }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Payment Name
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    Has Minimum Amount
                  </Typography>
                  {loadingStats ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                      ₦{stats.paymentName.withMinSchedule?.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {stats.paymentName.minLabel}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    Has Maximum Amount
                  </Typography>
                  {loadingStats ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                      ₦{stats.paymentName.withMaxSchedule?.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {stats.paymentName.maxLabel}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 25,
                    height: 25,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptIcon color="primary" sx={{ fontSize: 14 }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Student Category
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    Has Minimum Schedule
                  </Typography>
                  {loadingStats ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                      ₦{stats.studentCategory.withMinSchedule?.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {stats.studentCategory.minLabel}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    Has Maximum Amount
                  </Typography>
                  {loadingStats ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    <Typography variant="h3">
                      ₦{stats.studentCategory.withMaxSchedule?.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {stats.studentCategory.maxLabel}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {actionTab === 1 && (
        // Generate Invoice Stats
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Invoice Generated
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={5}>
                <Box
                  sx={{
                    bgcolor: '#FFF8E1',
                    borderRadius: 1,
                    px: 3,
                    py: 1.5,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  {loadingInvoiceStats ? (
                    <Skeleton width={80} height={36} />
                  ) : (
                    <Typography variant="h2" fontWeight={700} color="#F57C00">
                      {invoiceStats.invoiceGenerated}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" ml="auto" flexDirection="column" justifyContent="end">
                  {loadingInvoiceStats ? (
                    <Skeleton width={100} height={32} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(invoiceStats.totalAmount)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  Payment Name
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5}>
                {invoiceStats.paymentNames.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      bgcolor: idx === 0 ? 'rgba(139, 195, 74, 0.12)' : 'rgba(103, 58, 183, 0.12)',
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {item.name}
                    </Typography>
                    {loadingInvoiceStats ? (
                      <Skeleton width={120} height={32} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} mb={0.5}>
                        {formatCurrency(item.amount)} ({item.count})
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '4px',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  Category Name
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5}>
                {invoiceStats.categories.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      bgcolor: idx === 0 ? 'rgba(139, 195, 74, 0.12)' : 'rgba(103, 58, 183, 0.12)',
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {item.name}
                    </Typography>
                    {loadingInvoiceStats ? (
                      <Skeleton width={120} height={32} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} mb={0.5}>
                        {formatCurrency(item.amount)} ({item.count})
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {actionTab === 2 && (
        <Grid container spacing={3} mb={3}>
          {sendInvoiceStats.map((stat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <StatCard count={stat.value} label={stat.label} icon={stat.icon} color={stat.color} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={actionTab}
          onChange={handleActionTabChange}
          variant="scrollable"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab label="1. Set Schedule" />
          <Tab label="2. Generate Invoice" />
          <Tab label="3. Send Invoice" />
        </Tabs>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        {actionTab === 0 && (
          <>
            <Box
              sx={{
                px: 3,
                pt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
              }}
            >
              {/* Schedule Type Tabs */}
              <Box sx={{ width: { xs: '100%', sm: 'auto' }, overflowX: 'auto' }}>
                <Tabs
                  value={scheduleTab}
                  onChange={handleScheduleTabChange}
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Tab
                    label="Compulsory"
                    icon={
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: scheduleTab === 0 ? 'primary.main' : 'grey.300',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          mr: 1,
                        }}
                      >
                        1
                      </Box>
                    }
                    iconPosition="start"
                  />
                  <Tab
                    label="Optional Payment"
                    icon={
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: scheduleTab === 1 ? 'primary.main' : 'grey.300',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          mr: 1,
                        }}
                      >
                        2
                      </Box>
                    }
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              {canImportSchedule && (
                <Button variant="contained" size="small" startIcon={importing ? <CircularProgress color="inherit" /> : <UploadIcon />
                }
                  onClick={handleImportSchedule}
                  disabled={importing}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Import schedule for current term
                </Button>
              )}
            </Box>

            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', lg: 'center' },
                  gap: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SettingsIcon sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Payment Schedule
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Switch tabs to configure compulsory or optional items.
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    width: { xs: '100%', lg: 'auto' },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Session</InputLabel>
                    <Select
                      value={selectedSessionTerm}
                      label="Session Term"
                      onChange={(e) => handleSessionTermChange(e.target.value)}
                      disabled={loadingSessions}
                    >
                      {loadingSessions ? (
                        <MenuItem disabled>
                          <CircularProgress size={16} />
                        </MenuItem>
                      ) : (
                        sessions.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.session?.sesname}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { sm: 200 } }}>
                    <InputLabel>Student Pay Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Student Pay Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={loadingCategories}
                    >
                      {loadingCategories ? (
                        <MenuItem disabled>
                          <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
                        </MenuItem>
                      ) : (
                        categories.map((category) => (
                          <MenuItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                px: 3,
                pt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
              }}
            >
              {/* Schedule Type Tabs */}
              <Box sx={{ width: { xs: '100%', sm: 'auto' }, overflowX: 'auto' }}>
                <Tabs
                  value={scheduleTab}
                  onChange={handleScheduleTabChange}
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Tab
                    label="Compulsory"
                    icon={
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: scheduleTab === 0 ? 'primary.main' : 'grey.300',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          mr: 1,
                        }}
                      >
                        1
                      </Box>
                    }
                    iconPosition="start"
                  />
                  <Tab
                    label="Optional Payment"
                    icon={
                      <Box
                        component="span"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: scheduleTab === 1 ? 'primary.main' : 'grey.300',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          mr: 1,
                        }}
                      >
                        2
                      </Box>
                    }
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              {canImportSchedule && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={importing ? <CircularProgress color="inherit" /> : <UploadIcon />}
                  onClick={handleImportSchedule}
                  disabled={importing}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  Import schedule for current term
                </Button>
              )}
            </Box>
          </>
        )}

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {actionTab === 0 && (
            <>
              {scheduleTab === 0 && (
                <CompulsoryScheduleTab
                  showSnackbar={showSnackbar}
                  sessionId={selectedSession}
                  termId={selectedTerm}
                  categoryId={selectedCategory}
                  sessionLabel={selectedSessionLabel}
                  categoryLabel={selectedCategoryLabel}
                  payOption="compulsory"
                  payType="bursary"
                  onTermChange={setActiveSubTermId}
                  refreshStats={refreshStats}
                  scheduleRefreshKey={scheduleRefreshKey}
                />
              )}
              {scheduleTab === 1 && (
                <OptionalPaymentTab
                  showSnackbar={showSnackbar}
                  sessionId={selectedSession}
                  termId={selectedTerm}
                  categoryId={selectedCategory}
                  sessionLabel={selectedSessionLabel}
                  categoryLabel={selectedCategoryLabel}
                  payOption="optional"
                  payType="bursary"
                  onTermChange={setActiveSubTermId}
                  refreshStats={refreshStats}
                  scheduleRefreshKey={scheduleRefreshKey}
                />
              )}
            </>
          )}
          {actionTab === 1 && (
            <GenerateInvoiceTab
              showSnackbar={showSnackbar}
              onUpdateCategory={handleUpdateCategory}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
            />
          )}
          {actionTab === 2 && (
            <SendInvoiceTab showSnackbar={showSnackbar} refreshStats={refreshSendInvoiceStats} />
          )}
        </Box>
      </Paper>

      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="sm"
      // fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Import Payment Schedule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This will copy {scheduleTab === 0 ? 'compulsory' : 'optional'} payment schedules for{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {selectedCategoryLabel || 'the selected category'}
            </Box>{' '}
            from{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {getSubTermLabel(previousSubTerm)}
            </Box>{' '}
            into{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {getSubTermLabel(currentSubTerm)}
            </Box>
            . Existing schedules for the same payment items will be updated.
          </Typography>

          <Alert severity="warning">
            Review imported amounts before generating invoices for this term.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setImportDialogOpen(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmImportSchedule}
            disabled={importing}
            startIcon={importing ? <CircularProgress color="inherit" /> : <UploadIcon />}
          >
            {importing ? 'Importing...' : 'Import Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default PaymentShedule;
