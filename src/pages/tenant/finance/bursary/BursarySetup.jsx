import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, Typography, Paper, Tabs, Tab, Alert, Snackbar, Skeleton } from '@mui/material';
import {
  IconSettings,
  IconFileText,
  IconChartBar,
  IconDatabase,
  IconCalendarDollar,
  IconUsers,
  IconEdit,
  IconCalendarCheck,
} from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import BursarySetupTab from '@/components/tenant/bursary/BursarySetupTab';
import PaymentNameTab from '@/components/tenant/bursary/PaymentNameTab';
import { fetchTenantSessions, fetchTenantSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { fetchActiveSessionTerm } from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchPaymentNameStats } from '@/api/tenant/bursary/paymentNameApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary Setup' }];

const BursarySetup = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const schemeMap = [
    { bg: '#DBEAFE', color: '#2563EB' },
    { bg: '#DCFCE7', color: '#16A34A' },
    { bg: '#F3E8FF', color: '#9333EA' },
    { bg: '#FEF3C7', color: '#D97706' },
    { bg: '#FEE2E2', color: '#DC2626' },
  ];

  const s0 = schemeMap[0];
  const s1 = schemeMap[1];
  const s2 = schemeMap[2];

  const [searchParams] = useSearchParams();
  // Lets a link from elsewhere (e.g. "no optional payments yet, set one up")
  // land directly on the Payment Name tab instead of just the page root.
  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') === 'payment-name' ? 1 : 0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Session & Term
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');

  // Academic Sessions summary card — a flat list of sessions (not terms),
  // fetched independently of sessionTerms since the "Academic Sessions"
  // stat card counts distinct sessions, not session-term combinations.
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // "Last Term Update" stat card — who last changed the bursary active
  // session term, and when. Backed by `fetchActiveSessionTerm()`'s
  // `last_activated_at`/`last_activated_by` fields; both are treated as
  // possibly absent (e.g. never changed, or not yet exposed by the API)
  // rather than assumed present.
  const [lastTermUpdate, setLastTermUpdate] = useState({ at: null, by: null });

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

  const [bursaryStatsLoading, setBursaryStatsLoading] = useState(true);
  const [paymentNameStatsLoading, setPaymentNameStatsLoading] = useState(true);

  useEffect(() => {
    loadSessionTerms();
    if (currentTab === 1) {
      loadPaymentNameStats();
    }
  }, [currentTab]);

  const loadPaymentNameStats = async () => {
    setPaymentNameStatsLoading(true);
    try {
      const res = await fetchPaymentNameStats();
      if (res.status) setPaymentNameStats(res.data);
    } catch {
      console.error('Failed to load payment name stats');
    } finally {
      setPaymentNameStatsLoading(false);
    }
  };

  const loadSessionTerms = async () => {
    // Independent requests: getActiveBursarySessionTerm 404s whenever the
    // bursary-specific active term hasn't been configured yet (the common
    // case for a fresh setup) — that must not stop the session-terms list
    // itself from loading, so these are settled independently rather than
    // via Promise.all (which fails the whole call on the first rejection).
    setSessionsLoading(true);
    const [termsResult, activeTermResult, sessionsResult] = await Promise.allSettled([
      fetchTenantSessionTerms({ per_page: 100 }),
      fetchActiveSessionTerm(),
      fetchTenantSessions({ pagination: false }),
    ]);

    if (termsResult.status === 'rejected') {
      console.error('Failed to fetch session terms:', termsResult.reason);
    }
    if (sessionsResult.status === 'rejected') {
      console.error('Failed to fetch sessions:', sessionsResult.reason);
    }

    const termsRes = termsResult.status === 'fulfilled' ? termsResult.value : null;
    const activeTermRes = activeTermResult.status === 'fulfilled' ? activeTermResult.value : null;
    const sessionsRes = sessionsResult.status === 'fulfilled' ? sessionsResult.value : null;

    if (termsRes?.status) {
      // List every session term (not just the active one) — this dropdown
      // is how an admin explicitly chooses which term bursary fees apply
      // to, which is deliberately independent of the tenant-wide active
      // term (e.g. setting it up ahead of time for an upcoming term).
      const sess_terms = termsRes.data.map((sterm) => ({
        id: sterm.id,
        label: `${sterm.session?.session_name || ''} ${sterm.term?.term_name || ''}`.trim(),
        status: sterm.status,
      }));
      setSessionTerms(sess_terms);
    }

    if (sessionsRes?.status) {
      setSessions(sessionsRes.data || []);
    }
    setSessionsLoading(false);

    if (activeTermRes?.status && activeTermRes.data) {
      // Bursary has its own explicitly-configured active session term.
      setSelectedSessionTerm(activeTermRes.data.session_term_id);
      setLastTermUpdate({
        at: activeTermRes.data.last_activated_at || null,
        by: activeTermRes.data.last_activated_by || null,
      });
    } else if (termsRes?.status) {
      // Not configured yet — default to whichever session term is
      // currently active tenant-wide, so the dropdown isn't left blank.
      const activeTerm = termsRes.data.find((sterm) => sterm.status === 'active');
      if (activeTerm) setSelectedSessionTerm(activeTerm.id);
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
        // Bursary Setup Stats — five summary cards matching the Bursary
        // Setup reference design.
        <Grid container spacing={3} mb={1}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={bursaryStats.totalCategories}
              label="Fee Categories"
              subtitle={`${bursaryStats.activeCategories} Active · ${Math.max(0, bursaryStats.totalCategories - bursaryStats.activeCategories)} Inactive`}
              icon={IconDatabase}
              colorIndex={0}
              loading={bursaryStatsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={bursaryStats.totalInstalments}
              label="Instalment Plans"
              subtitle={`${bursaryStats.activeInstalments} Active · ${Math.max(0, bursaryStats.totalInstalments - bursaryStats.activeInstalments)} Inactive`}
              icon={IconCalendarDollar}
              colorIndex={1}
              loading={bursaryStatsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={sessions.length}
              label="Academic Sessions"
              subtitle={`${sessions.filter((s) => s.status === 'active').length} Active · ${sessions.filter((s) => s.status === 'completed').length} Completed`}
              icon={IconUsers}
              colorIndex={2}
              loading={sessionsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={lastTermUpdate.at ? dayjs(lastTermUpdate.at).format('MMM D, YYYY') : 'Not yet updated'}
              countFontSize={16}
              label="Last Term Update"
              subtitle={lastTermUpdate.at && lastTermUpdate.by ? `by ${lastTermUpdate.by}` : undefined}
              icon={IconEdit}
              colorIndex={3}
              loading={sessionsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={selectedSessionTerm ? 1 : 0}
              label="Active Term"
              subtitle={sessionTerms.find((st) => st.id === selectedSessionTerm)?.label || 'Not set'}
              icon={IconCalendarCheck}
              colorIndex={4}
              loading={sessionsLoading}
            />
          </Grid>
        </Grid>
      ) : (
        // Payment Name Stats
        <Grid container spacing={3} mb={1}>
          {/* Total Payment Items Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              {paymentNameStatsLoading ? (
                <>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="text" width={140} height={24} />
                  </Box>
                  <Skeleton variant="text" width={60} height={48} sx={{ mb: 2 }} />
                  <Grid container spacing={2} mb={2}>
                    {[0, 1, 2, 3].map((i) => (
                      <Grid key={i} size={{ xs: 3 }}>
                        <Skeleton variant="text" width="80%" height={14} />
                        <Skeleton variant="text" width="50%" height={18} />
                      </Grid>
                    ))}
                  </Grid>
                  <Skeleton variant="text" width="70%" height={16} />
                </>
              ) : (
              <>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s0.bg,
                    color: isDark ? '#fff' : s0.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconChartBar size={18} color="currentColor" />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Total Payment Items
                </Typography>
              </Box>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : s0.color }}
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
              </>
              )}
            </Paper>
          </Grid>

          {/* Settlement Accounts Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              {paymentNameStatsLoading ? (
                <>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="text" width={140} height={24} />
                  </Box>
                  <Skeleton variant="text" width={60} height={48} sx={{ mb: 2 }} />
                  <Grid container spacing={2} mb={2}>
                    {[0, 1].map((i) => (
                      <Grid key={i} size={{ xs: 6 }}>
                        <Skeleton variant="text" width="80%" height={14} />
                        <Skeleton variant="text" width="50%" height={18} />
                      </Grid>
                    ))}
                  </Grid>
                  <Skeleton variant="text" width="70%" height={16} />
                </>
              ) : (
              <>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s1.bg,
                    color: isDark ? '#fff' : s1.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconChartBar size={18} color="currentColor" />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Settlement Accounts
                </Typography>
              </Box>

              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : s1.color }}
                mb={2}
              >
                {bankCount}
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
                    Banks Configured
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {bankCount}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">
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
                <Typography variant="caption" color="textSecondary">
                  {bankCount > 0
                    ? `${bankCount} bank(s) configured`
                    : 'No settlement accounts configured'}
                </Typography>
              </Box>
              </>
              )}
            </Paper>
          </Grid>

          {/* Fee Bearer Distribution Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: '14px',
                borderRadius: '14px',
                bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#94a3b8',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              {paymentNameStatsLoading ? (
                <>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '8px' }} />
                    <Skeleton variant="text" width={160} height={24} />
                  </Box>
                  <Skeleton variant="text" width={60} height={48} sx={{ mb: 2 }} />
                  <Grid container spacing={2} mb={2}>
                    {[0, 1].map((i) => (
                      <Grid key={i} size={{ xs: 6 }}>
                        <Skeleton variant="text" width="80%" height={14} />
                        <Skeleton variant="text" width="50%" height={18} />
                      </Grid>
                    ))}
                  </Grid>
                  <Skeleton variant="text" width="70%" height={16} />
                </>
              ) : (
              <>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : s2.bg,
                    color: isDark ? '#fff' : s2.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconChartBar size={18} color="currentColor" />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Fee Bearer Distribution
                </Typography>
              </Box>
              <Typography
                variant="h2"
                fontWeight={700}
                sx={{ color: isDark ? '#ffffff' : s2.color }}
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
              </>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab Navigation */}
      <Box sx={{ mb: 2 }}>
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
          lastTermUpdate={lastTermUpdate}
          onStatsChange={setBursaryStats}
          onLoadingChange={setBursaryStatsLoading}
          showSnackbar={showSnackbar}
        />
      )}

      {currentTab === 1 && (
        <PaymentNameTab
          showSnackbar={showSnackbar}
          onStatsRefresh={loadPaymentNameStats}
          autoOpenAdd={Boolean(searchParams.get('new'))}
          defaultPayOption={searchParams.get('new') || undefined}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
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
