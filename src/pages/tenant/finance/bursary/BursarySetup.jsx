import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import {
  IconSettings,
  IconFileText,
  IconDatabase,
  IconCalendarDollar,
  IconUsers,
  IconEdit,
  IconCalendarCheck,
  IconStack2,
  IconBuildingBank,
  IconTrophy,
} from '@tabler/icons-react';
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
    settlement_account_list: [],
    settlement_account_total: 0,
    settlement_account_verified: 0,
    top_settlement_account: null,
    fee_bearer: {},
    recent_update: null,
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

  return (
    <PageContainer title="Bursary Setup" description="Configure fees and payment settings">
      <Breadcrumb
        title="Bursary Setup"
        subtitle={
          currentTab === 1
            ? 'Configure payment items that parents can pay for and manage their settlement destinations.'
            : 'Configure how fees are collected for the current term'
        }
        items={currentTab === 1 ? [...BCrumb, { title: 'Payment Items' }] : BCrumb}
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
        // Payment Items Stats — four summary cards matching the Payment
        // Items reference design. Unscoped across both Bursary and
        // Admission payment names (confirmed against real data: these
        // totals match the combined count of both pay_types, not just
        // whichever sub-tab is currently selected inside PaymentNameTab).
        <Grid container spacing={3} mb={1}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={paymentNameStats.total}
              label="Payment Items"
              subtitle={`${paymentNameStats.compulsory} Compulsory · ${paymentNameStats.optional} Optional`}
              icon={IconStack2}
              colorIndex={0}
              loading={paymentNameStatsLoading}
              showChevron
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={paymentNameStats.settlement_account_total || 0}
              label="Settlement Accounts"
              subtitle={
                paymentNameStats.settlement_account_total > 0 &&
                paymentNameStats.settlement_account_verified === paymentNameStats.settlement_account_total
                  ? 'All Verified'
                  : `${paymentNameStats.settlement_account_verified || 0} Verified`
              }
              icon={IconBuildingBank}
              colorIndex={1}
              loading={paymentNameStatsLoading}
              showChevron
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={paymentNameStats.top_settlement_account?.bank_name || 'None yet'}
              countFontSize={16}
              label="Top Settlement Account"
              subtitle={
                paymentNameStats.top_settlement_account
                  ? `${paymentNameStats.top_settlement_account.item_count} Payment Items`
                  : undefined
              }
              icon={IconTrophy}
              colorIndex={3}
              loading={paymentNameStatsLoading}
              showChevron
              sx={{ bgcolor: '#FFFBEB', borderColor: '#FDE68A' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={paymentNameStats.total}
              label="Fee Bearer Distribution"
              subtitle={`${paymentNameStats.fee_bearer?.client || 0} Parent/Student · ${paymentNameStats.fee_bearer?.merchant || 0} School`}
              icon={IconUsers}
              colorIndex={2}
              loading={paymentNameStatsLoading}
              showChevron
            />
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
          stats={paymentNameStats}
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
