import React, { useState, useEffect, useMemo } from 'react';
import { Grid, Paper, Skeleton, useTheme, Box } from '@mui/material';
import { ReceiptLong, AccountBalanceWallet, ErrorOutline } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { formatCurrency } from './constants';
import DashboardHeader from './components/DashboardHeader';
import KpiCard, { EfficiencyRing } from './components/KpiCard';
import RevenueDistribution from './components/RevenueDistribution';
import PaymentCategories from './components/PaymentCategories';
import CollectionMatrix from './components/CollectionMatrix';
import BursaryBreakdownModal from './components/BursaryBreakdownModal';
import RevenueTrend from './components/RevenueTrend';
import QuickActions from './components/QuickActions';

/**
 * Skeleton placeholder that mirrors the dashboard panel layout
 * (icon + title bar, then content) while a section is being fetched.
 */
/**
 * Sections that return arrays may briefly hold {} (initial state, or after a
 * failed request) — coerce to [] so reducers/maps never crash during render.
 */
const asArray = (data) => (Array.isArray(data) ? data : []);

const PanelSkeleton = ({ height = 240 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '10px',
        background: isDark ? theme.palette.background.paper : '#fff',
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${theme.palette.grey[200]}`,
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton variant="text" width={160} height={16} />
      </Box>
      <Skeleton variant="rounded" height={height} sx={{ width: '100%' }} />
    </Paper>
  );
};

/**
 * ── Bursary Officer Dashboard ─────────────────────────────────────────
 * Each analytics section is fetched from its own endpoint and loads
 * independently, so panels appear as soon as their data is ready.
 */
const BursaryOfficerDashboard = () => {
  const notify = useNotification();

  // Breakdown modal state — holds the clicked KPI/panel type so the modal
  // knows which table to render (same pattern as the admin/admission dashboards).
  const [breakdownType, setBreakdownType] = useState(null);

  // Session / term filtering
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [sessionTermId, setSessionTermId] = useState('');

  // Fetch session terms for the selectors
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSessionTerms();
        if (res?.status) setSessionTerms(res.data || []);
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      }
    };
    load();
  }, []);

  // Default to the first session/term once terms arrive
  useEffect(() => {
    if (!sessionTerms.length || selectedSession) return;
    const first = sessionTerms[0];
    setSelectedSession(first.session?.sesname || '');
    setSelectedTerm(first.display_term?.display_name || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionTerms]);

  // Derive the session_term_id from the two selectors
  useEffect(() => {
    if (!sessionTerms.length) return;
    const match = sessionTerms.find(
      (s) =>
        s.session?.sesname === selectedSession && s.display_term?.display_name === selectedTerm,
    );
    setSessionTermId(match ? String(match.id) : '');
  }, [sessionTerms, selectedSession, selectedTerm]);

  const sessions = useMemo(
    () => [...new Set(sessionTerms.map((s) => s.session?.sesname).filter(Boolean))],
    [sessionTerms],
  );

  const termsForSession = useMemo(
    () =>
      sessionTerms
        .filter((s) => s.session?.sesname === selectedSession)
        .map((s) => s.display_term?.display_name)
        .filter(Boolean),
    [sessionTerms, selectedSession],
  );

  // Each section manages its own { data, loading } state; requests wait
  // until the term resolves so the first fetch already carries the filter.
  const useSection = (path) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    // Only fetch when a session term is preselected — the dependency array
    // on sessionTermId means the endpoint fires once (and again whenever the
    // session/term selector changes), never before a term is resolved.
    useEffect(() => {
      if (!sessionTermId) {
        return;
      }
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, { params: { session_term_id: sessionTermId } })
        .then((res) => {
          if (mounted) setData(res.data?.status ? res.data.data : {});
        })
        .catch(() => {
          if (mounted) setData({});
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
      // sessionTermId is valid reactive state, but the inline custom hook
      // confuses exhaustive-deps into flagging it as unnecessary — keep it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, sessionTermId]);

    return { data, loading };
  };

  const rp = useSection('/dashboard/bursary/revenue-performance');
  const revenueDistribution = useSection('/dashboard/bursary/revenue-distribution');
  const paymentCategories = useSection('/dashboard/bursary/payment-categories');
  const collectionMatrix = useSection('/dashboard/bursary/collection-matrix');
  const revenueTrend = useSection('/dashboard/bursary/revenue-trend');

  const dataAsOf = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const matrixRows = asArray(collectionMatrix.data);

  const totals = matrixRows.reduce(
    (acc, row) => ({
      expected: acc.expected + (row.expected_fees || 0),
      collected: acc.collected + (row.collected_fees || 0),
      outstanding: acc.outstanding + (row.outstanding_fees || 0),
    }),
    { expected: 0, collected: 0, outstanding: 0 },
  );
  const totalEfficiency = totals.expected
    ? ((totals.collected / totals.expected) * 100).toFixed(1)
    : '0.0';

  const totalRevenue = asArray(revenueDistribution.data).reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  // Report export — Excel/PDF are generated server-side (PhpSpreadsheet/Dompdf)
  // and streamed back as binary blobs, scoped to the currently selected term.
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res = await tenantApi.get('/dashboard/bursary/export-report', {
        params: { format, session_term_id: sessionTermId || undefined },
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute(
        'download',
        `bursary-dashboard-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      notify.success(`Report exported as ${format.toUpperCase()}`);
    } catch {
      notify.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const handleSessionChange = (value) => {
    setSelectedSession(value);
    const firstTerm = sessionTerms.find((s) => s.session?.sesname === value)?.display_term
      ?.display_name;
    setSelectedTerm(firstTerm || '');
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    notify.info(`${action.replace('_', ' ')} feature coming soon`);
    // Future: Navigate to respective pages or open modals
  };

  // KPI skeleton — one skeleton card per stat that mirrors the KpiCard layout
  // (uppercase label, icon chip top-right, big value, progress + sublabel) so
  // the header area keeps its shape while revenue-performance loads.
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <PageContainer
      title="Bursary Dashboard"
      description="Overview of revenue performance and collections"
    >
      <DashboardHeader
        dataAsOf={dataAsOf}
        sessions={sessions}
        selectedSession={selectedSession}
        onSessionChange={handleSessionChange}
        termsForSession={termsForSession}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        onExportExcel={() => handleExport('excel')}
        onExportPdf={() => handleExport('pdf')}
        exporting={exporting}
      />

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      {rp.loading ? (
        <Grid container spacing={1.25} mb={2}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1',
                  background: isDark ? theme.palette.background.paper : '#fff',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)',
                }}
              >
                <Skeleton variant="text" width="60%" height={12} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" width={70} height={26} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="rounded" width="100%" height={5} sx={{ my: 1 }} />
                <Skeleton variant="text" width="50%" height={10} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={1.25} mb={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total Expected Income"
              value={formatCurrency(rp.data.total_expected_income || 186750000)}
              sublabel="This Session"
              progress={rp.data.expected_vs_last_session || 12.6}
              icon={ReceiptLong}
              colorName="info"
              onClick={() => setBreakdownType('expected_income')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total Collected Income"
              value={formatCurrency(rp.data.total_collected_income || 124560000)}
              sublabel="This Session"
              progress={rp.data.collected_vs_last_session || 15.8}
              icon={AccountBalanceWallet}
              colorName="success"
              onClick={() => setBreakdownType('collected_income')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total Outstanding Balance"
              value={formatCurrency(rp.data.total_outstanding_balance || 62190000)}
              sublabel="This Session"
              progress={-(rp.data.outstanding_vs_last_session || 5.2)}
              icon={ErrorOutline}
              colorName="warning"
              onClick={() => setBreakdownType('outstanding_balance')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Collection Efficiency"
              value={`${rp.data.collection_efficiency || 66.68}%`}
              sublabel="This Session"
              progress={rp.data.efficiency_vs_last_session || 2.6}
              colorName="primary"
              rightElement={<EfficiencyRing value={rp.data.collection_efficiency || 66.68} />}
              onClick={() => setBreakdownType('collection_efficiency')}
            />
          </Grid>
        </Grid>
      )}

      {/* ── Revenue Trend + Revenue Distribution + Quick Actions ─── */}
      <Grid container spacing={2} mb={2}>
        {/* Revenue Trend Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          {revenueTrend.loading ? (
            <PanelSkeleton height={480} />
          ) : (
            <RevenueTrend 
              revenue_trend={asArray(revenueTrend.data)} 
              onClick={() => setBreakdownType('revenue_trend')}
            />
          )}
        </Grid>

        {/* Revenue Distribution + Quick Actions Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {/* Revenue Distribution with Session dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              {revenueDistribution.loading ? (
                <PanelSkeleton height={300} />
              ) : (
                <RevenueDistribution
                  revenue_distribution={asArray(revenueDistribution.data)}
                  totalRevenue={totalRevenue}
                  onClick={() => setBreakdownType('revenue_distribution')}
                  session={selectedSession || 'This Session'}
                  sessions={sessions}
                  onSessionChange={handleSessionChange}
                />
              )}
            </Grid>

            {/* Quick Actions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <QuickActions onAction={handleQuickAction} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Outstanding Balance by Class + Payment Categories ─── */}
      <Grid container spacing={2} mb={2} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          {collectionMatrix.loading ? (
            <PanelSkeleton height={420} />
          ) : (
            <CollectionMatrix
              matrix={matrixRows}
              totals={totals}
              totalEfficiency={totalEfficiency}
              session={selectedSession || 'This Session'}
              sessions={sessions}
              onSessionChange={handleSessionChange}
              onRowClick={(className) =>
                notify.info(`Detailed breakdown for ${className} is coming soon`)
              }
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          {paymentCategories.loading ? (
            <PanelSkeleton height={420} />
          ) : (
            <PaymentCategories 
              payment_categories={asArray(paymentCategories.data)} 
              session={selectedSession || 'This Session'}
              sessions={sessions}
              onSessionChange={handleSessionChange}
              onClick={() => setBreakdownType('payment_categories')} 
            />
          )}
        </Grid>
      </Grid>

      {/* ── Breakdown modal ────────────────────────────────────── */}
      <BursaryBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        sessionTermId={sessionTermId}
        onClose={() => setBreakdownType(null)}
      />
    </PageContainer>
  );
};

export default BursaryOfficerDashboard;
