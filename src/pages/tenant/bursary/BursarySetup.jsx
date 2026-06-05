import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import { IconSettings, IconFileText } from '@tabler/icons-react';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import BursarySetupTab from '@/components/tenant/bursary/BursarySetupTab';
import PaymentNameTab from '@/components/tenant/bursary/PaymentNameTab';
import { fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchActiveSessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary Setup' }];

const BursarySetup = () => {
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

  const paymentNameStats = {
    totalItems: 164,
    compulsory: 98,
    optional: 66,
    active: 164,
    inactive: 0,
    settlementAccounts: {
      total: 164,
      gtb: 98,
      fcmb: 98,
      wema: 98,
    },
    feeBearer: {
      total: 164,
      client: 400,
      student: 0,
    },
  };

  useEffect(() => {
    loadSessionTerms();
  }, []);

  const loadSessionTerms = async () => {
    try {
      const [termsRes, activeTermRes] = await Promise.all([
        fetchSessionTerms(),
        fetchActiveSessionTerm(),
      ]);

      if (termsRes.status) {
        const sess_terms = termsRes.data.map((sterm) => ({
          id: sterm.id,
          label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeCategories}
              label="Active Categories"
              icon={CheckCircleIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.totalInstalments}
              label="Instalment Plans"
              icon={CreditCardIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={bursaryStats.activeInstalments}
              label="Active Plans"
              icon={CheckCircleIcon}
            />
          </Grid>
        </Grid>
      ) : (
        // Payment Name Stats
        <Grid container spacing={3} mb={3}>
          {/* Total Payment Items Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Total Payment Items
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.totalItems}
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
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  All payment items are currently active
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Settlement Accounts Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Settlement Accounts
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.settlementAccounts.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    GTB
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.gtb} Items
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    FCMB
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.fcmb} Items
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="textSecondary">
                    Wema
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.settlementAccounts.wema} Items
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  GTB is the most Useeland Settlement account
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Fee Bearer Distribution Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Fee Bearer Distribution
              </Typography>
              <Typography variant="h2" fontWeight={700} color="primary.main" mb={2}>
                {paymentNameStats.feeBearer.total}
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Client
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.feeBearer.client}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Student
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {paymentNameStats.feeBearer.student}
                  </Typography>
                </Grid>
              </Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  All Fees are Currently Borne by client
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

      {currentTab === 1 && <PaymentNameTab />}

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
