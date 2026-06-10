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
} from '@mui/material';
import { Receipt as ReceiptIcon, FileUpload as UploadIcon, Wallet as WalletIcon, Message as MessageIcon, Email as EmailIcon, Article as ArticleIcon,   Settings as SettingsIcon,} from '@mui/icons-material';
import StatCard from '@/components/shared/StatCard';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CompulsoryScheduleTab from '@/components/tenant/bursary/payment-shedule/CompulsoryScheduleTab';
import OptionalPaymentTab from '@/components/tenant/bursary/payment-shedule/OptionalPaymentTab';
import GenerateInvoiceTab from '@/components/tenant/bursary/payment-shedule/GenerateInvoiceTab';
import SendInvoiceTab from '@/components/tenant/bursary/payment-shedule/SendInvoiceTab';
import { fetchBursarySessionTerms, fetchActiveCategories } from '@/api/tenant/bursary/bursarySettingsApi';

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

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    sessions.find((s) => s.id === selectedSessionTerm)
      ?.session?.sesname || '';

  const selectedCategoryLabel =
    categories.find((c) => String(c.id) === String(selectedCategory))?.name ||
    '';

  const handleSessionTermChange = (sessionTermId) => {
    const selectedItem = sessions.find((s) => s.id === sessionTermId);
    if (selectedItem) {
      setSelectedSessionTerm(sessionTermId);
      setSelectedSession(selectedItem.session_id);
      setSelectedTerm(selectedItem.term_id);
    }
  };

  const handleActionTabChange = (e, v) => setActionTab(v);
  const handleScheduleTabChange = (e, v) => setScheduleTab(v);

  const handleImportSchedule = () => {
    showSnackbar('Import schedule triggered');
  };

  const stats = {
    compulsorySchedule: {
      total: 2000,
      classes: 6,
    },
    paymentName: {
      withMinSchedule: 799,
      withMaxSchedule: 989,
      minLabel: 'School Fee',
      maxLabel: 'Acceptance Fee',
    },
    studentCategory: {
      withMinSchedule: 989,
      withMaxSchedule: 187,
      minLabel: 'Returning Student',
      maxLabel: 'Staff ward',
    },
  };

  // Stats for Generate Invoice Tab
  const invoiceStats = {
    invoiceGenerated: 382,
    totalAmount: '₦900,805,000.00',
    paymentNames: [
      { name: 'With Minimum Invoice', count: 798, amount: '₦539,253,760.00', label: 'School Fee' },
      {
        name: 'With Maximum Invoice',
        count: 798,
        amount: '₦539,455,900.00',
        label: 'Acceptance Fee',
      },
    ],
    categories: [
      {
        name: 'With Minimum Invoice',
        count: 798,
        amount: '₦539,253,760.00',
        label: 'Returning Student',
      },
      { name: 'With Maximum Invoice', count: 798, amount: '₦539,495,900.00', label: 'New Student' },
    ],
  };

  const sendInvoiceStats = [
    { label: 'Total Invoice Sent', value: 522, icon: MessageIcon },
    { label: 'Invoice Sent by Mail', value: 522, icon: EmailIcon },
    { label: 'Invoice Sent by SMS', value: 522, icon: EmailIcon },
    { label: 'Excel Generated', value: 522, icon: ArticleIcon },
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
                Compulsory Schedule
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
                  <Typography variant="h2" fontWeight={700} color="primary" sx={{ lineHeight: 1 }}>
                    {stats.compulsorySchedule.total}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stats.compulsorySchedule.classes}
                  </Typography>
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
                    With Minimum Schedule
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stats.paymentName.withMinSchedule}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.paymentName.minLabel}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    With Maximum Schedule
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stats.paymentName.withMaxSchedule}
                  </Typography>
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
                    With Minimum Schedule
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                    {stats.studentCategory.withMinSchedule}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.studentCategory.minLabel}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    With Maximum Schedule
                  </Typography>
                  <Typography variant="h3">{stats.studentCategory.withMaxSchedule}</Typography>
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
                  <Typography variant="h2" fontWeight={700} color="#F57C00">
                    {invoiceStats.invoiceGenerated}
                  </Typography>
                </Box>
                <Box display="flex" ml="auto" flexDirection="column" justifyContent="end">
                  <Typography variant="h4" fontWeight={700}>
                    {invoiceStats.totalAmount}
                  </Typography>
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
                    <Typography variant="h5" fontWeight={700} mb={0.5}>
                      {item.count}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      {item.amount}
                    </Typography>
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
                    <Typography variant="h5" fontWeight={700} mb={0.5}>
                      {item.count}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>
                      {item.amount}
                    </Typography>
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

                  <FormControl size="small" sx={{ minWidth: { sm: 100 } }}>
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

                  {/* <FormControlLabel
                    control={
                      <Switch
                        checked={enableFullSession}
                        onChange={(e) => setEnableFullSession(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ whiteSpace: { sm: 'nowrap' } }}>
                        Enable full-session payment
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  /> */}
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
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleImportSchedule}
                size="medium"
                sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Import schedule for current term
              </Button>
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
                />
              )}
            </>
          )}
          {actionTab === 1 && <GenerateInvoiceTab showSnackbar={showSnackbar} />}
          {actionTab === 2 && <SendInvoiceTab showSnackbar={showSnackbar} />}
        </Box>
      </Paper>

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
