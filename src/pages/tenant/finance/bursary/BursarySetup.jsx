import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import { IconSettings, IconFileText } from '@tabler/icons-react';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import { getStatCardColor } from '@/utils/statCardColors';
import BursarySetupTab from '@/components/tenant/bursary/BursarySetupTab';
import PaymentNameTab from '@/components/tenant/bursary/PaymentNameTab';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchActiveSessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchPaymentNameStats } from '@/api/tenant/bursary/paymentNameApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary Setup' }];

const BursarySetup = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const statColor0 = getStatCardColor(null, 0, isDark, theme);
  const statColor1 = getStatCardColor(null, 1, isDark, theme);
  const statColor2 = getStatCardColor(null, 2, isDark, theme);

  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Session & Term
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');

  // Stats data for different tabs
  const [bursaryStats, setBursaryStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalInstalments: 0,
    activeInstalments: 0,
  });

  const [paymentNameStats, setPaymentNameStats] = useState({
    total: 0,
    compulsory: 0,
    optional: 0,
    active: 0,
    inactive: 0,
    settlement_accounts: {},
    fee_bearer: {},
  });

  useEffect(() => {
    loadSessionTerms();
    if (currentTab === 1) {
      loadPaymentNameStats();
    }
  }, [currentTab]);

  const loadPaymentNameStats = async () => {
    try {
      const res = await fetchPaymentNameStats();
      if (res.status) setPaymentNameStats(res.data);
    } catch {
      console.error('Failed to load payment name stats');
    }
  };

  const loadSessionTerms = async () => {
    try {
      const [termsRes, activeTermRes] = await Promise.all([
        fetchSessionTerms(),
        fetchActiveSessionTerm(),
      ]);

      if (termsRes.status) {
        const sess_terms = termsRes.data.map((sterm) => ({
          id: sterm.id,
          label:
            `${sterm.session?.session_name || ''} ${sterm.term?.term_name || ''}`.trim(),
        }));
        setSessionTerms(sess_terms);
      }

      if (activeTermRes.status && activeTermRes.data) {
        setSelectedSessionTerm(activeTermRes.data.session_term_id);
      }
    } catch (error) {
      console.error('Failed to fetch session terms:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const bankCount = Object.keys(paymentNameStats.settlement_accounts || {}).length;

  return (
    <PageContainer title="Bursary Setup" description="Configure fees and payment settings">
      <Breadcrumb
        title="Bursary Setup"
        subtitle="Configure how fees are collected for the current term"
        items={BCrumb}
      />

      {/* Stats Cards - Dynamic based on active tab */}
      {currentTab === 0 ? (
        // Bursary Setup Stats
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.totalCategories}
              label="Total Categories"
              icon={SettingsIcon}
              colorIndex={0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeCategories}
              label="Active Categories"
              icon={CheckCircleIcon}
              colorIndex={1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.totalInstalments}
              label="Instalment Plans"
              icon={CreditCardIcon}
              colorIndex={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeInstalments}
              label="Active Plans"
              icon={CheckCircleIcon}
              colorIndex={3}
            />
          </Grid>
        </Grid>
      ) : (
        // Payment Name Stats
        <Grid container spacing={3} mb={3}>
          {/* Total Payment Items Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                height: '100%',
                background: isDark
                  ? theme.palette.background.paper
                  : `${statColor0.cardBg} !important`,
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : `1px solid ${statColor0.borderColor}`,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 6px 24px rgba(0,0,0,0.28)'
                    : '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Total Payment Items
              </Typography>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : statColor0.accentColor }}
                mb={2}
              >
                {paymentNameStats.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Compulsory
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.compulsory}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Optional
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.optional}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Active
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.active}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="caption" color="textSecondary">
                    Inactive
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.inactive}
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: paymentNameStats.inactive > 0 ? 'warning.main' : 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  {paymentNameStats.inactive > 0
                    ? `${paymentNameStats.inactive} item(s) currently inactive`
                    : 'All payment items are currently active'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Settlement Accounts Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                height: '100%',
                background: isDark
                  ? theme.palette.background.paper
                  : `${statColor1.cardBg} !important`,
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : `1px solid ${statColor1.borderColor}`,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 6px 24px rgba(0,0,0,0.28)'
                    : '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Settlement Accounts
              </Typography>

              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : statColor1.accentColor }}
                mb={2}
              >
                {bankCount}
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Banks Configured
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {bankCount}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {bankCount > 0 ? 'Configured' : 'Not Configured'}
                  </Typography>
                </Grid>
              </Grid>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: bankCount > 0 ? 'success.main' : 'warning.main',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {bankCount > 0
                    ? `${bankCount} bank(s) configured`
                    : 'No settlement accounts configured'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Fee Bearer Distribution Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                height: '100%',
                background: isDark
                  ? theme.palette.background.paper
                  : `${statColor2.cardBg} !important`,
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : `1px solid ${statColor2.borderColor}`,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 6px 24px rgba(0,0,0,0.28)'
                    : '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Fee Bearer Distribution
              </Typography>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : statColor2.accentColor }}
                mb={2}
              >
                {paymentNameStats.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Parent
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.fee_bearer?.client || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    School
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.fee_bearer?.merchant || 0}
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                <Typography variant="caption" color="textSecondary">
                  {paymentNameStats.fee_bearer?.merchant > 0
                    ? 'School absorbs some gateway charges'
                    : 'All charges currently borne by parent'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            label="Bursary Setup"
            icon={<IconSettings size={18} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label="Payment Name"
            icon={<IconFileText size={18} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <BursarySetupTab
          sessionTerms={sessionTerms}
          selectedSessionTerm={selectedSessionTerm}
          setSelectedSessionTerm={setSelectedSessionTerm}
          onStatsChange={setBursaryStats}
          showSnackbar={showSnackbar}
        />
      )}

      {currentTab === 1 && (
        <PaymentNameTab showSnackbar={showSnackbar} onStatsRefresh={loadPaymentNameStats} />
      )}

      {/* Snackbar */}
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

export default BursarySetup;
