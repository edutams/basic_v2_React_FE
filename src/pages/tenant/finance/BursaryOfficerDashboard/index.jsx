import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { ReceiptLong, AccountBalanceWallet, ErrorOutline } from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { formatCurrency } from './constants';
import DashboardHeader from './components/DashboardHeader';
import KpiCard from './components/KpiCard';
import EfficiencyRing from './components/EfficiencyRing';
import GrowthSparkline from './components/GrowthSparkline';
import FeeIntelligence from './components/FeeIntelligence';
import RevenueDistribution from './components/RevenueDistribution';
import PaymentCategories from './components/PaymentCategories';
import CollectionMatrix from './components/CollectionMatrix';
import OperationalAlerts from './components/OperationalAlerts';

/**
 * ── Bursary Officer Dashboard ─────────────────────────────────────────
 * Fetches bursary stats and composes the section components.
 */
const BursaryOfficerDashboard = () => {
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Session / term filtering
  const [sessionTerms, setSessionTerms] = useState([]);
  const [sessionTermsLoaded, setSessionTermsLoaded] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [sessionTermId, setSessionTermId] = useState('');

  // Class matrix status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch session terms for the selectors
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSessionTerms();
        if (res?.status) setSessionTerms(res.data || []);
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      } finally {
        setSessionTermsLoaded(true);
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

  // Fetch stats whenever a term is selected (skip until terms resolve)
  useEffect(() => {
    if (!sessionTermsLoaded) return;

    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const params = sessionTermId ? { session_term_id: sessionTermId } : {};
        const response = await tenantApi.get('/dashboard/bursary/stats', { params });

        if (response.data.status) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [sessionTermId, sessionTermsLoaded, notify]);

  const dataAsOf = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading || !dashboardData) {
    return (
      <PageContainer title="Bursary Dashboard" description="Overview of revenue performance and collections">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  const {
    revenue_performance: rp = {},
    fee_intelligence = [],
    revenue_distribution = [],
    payment_categories = [],
    operational_alerts = [],
    class_level_collection_matrix: matrix = [],
  } = dashboardData;

  const filteredMatrix =
    statusFilter === 'all' ? matrix : matrix.filter((r) => r.status === statusFilter);

  const totals = filteredMatrix.reduce(
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

  const totalRevenue = revenue_distribution.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleExport = () => {
    const rows = [
      ['Class', 'Expected Fees (₦)', 'Collected Fees (₦)', 'Outstanding Fees (₦)', 'Efficiency (%)', 'Status'],
      ...filteredMatrix.map((r) => [
        r.class,
        r.expected_fees,
        r.collected_fees,
        r.outstanding_fees,
        r.efficiency,
        r.status,
      ]),
      ['Total', totals.expected, totals.collected, totals.outstanding, totalEfficiency, ''],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bursary-collection-matrix-${(selectedSession || 'all').replace(/[\\/]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify.success('Report exported successfully');
  };

  const handleSessionChange = (value) => {
    setSelectedSession(value);
    const firstTerm = sessionTerms.find((s) => s.session?.sesname === value)
      ?.display_term?.display_name;
    setSelectedTerm(firstTerm || '');
  };

  return (
    <PageContainer title="Bursary Dashboard" description="Overview of revenue performance and collections">
      <DashboardHeader
        dataAsOf={dataAsOf}
        sessions={sessions}
        selectedSession={selectedSession}
        onSessionChange={handleSessionChange}
        termsForSession={termsForSession}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
        onExport={handleExport}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <Grid container columns={10} spacing={2} mb={3}>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Expected Income"
            value={formatCurrency(rp.total_expected_income)}
            sublabel="Projected for term"
            icon={ReceiptLong}
            colorName="info"
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Collected Income"
            value={formatCurrency(rp.total_collected_income)}
            sublabel="Actual collected"
            icon={AccountBalanceWallet}
            colorName="success"
            trend={rp.revenue_growth}
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Total Outstanding Balance"
            value={formatCurrency(rp.total_outstanding_balance)}
            sublabel="Remaining unpaid"
            icon={ErrorOutline}
            colorName="warning"
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Collection Efficiency"
            value={`${rp.collection_efficiency}%`}
            sublabel="Collected vs Expected"
            colorName="primary"
            rightElement={<EfficiencyRing value={rp.collection_efficiency} />}
          />
        </Grid>
        <Grid size={{ xs: 10, sm: 5, lg: 2 }}>
          <KpiCard
            label="Revenue Growth"
            value={`+${rp.revenue_growth}%`}
            sublabel="vs 1st Term"
            colorName="success"
            rightElement={<GrowthSparkline />}
          />
        </Grid>
      </Grid>

      {/* ── Fee Intelligence, Revenue Distribution, Payment Categories ─── */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <FeeIntelligence fee_intelligence={fee_intelligence} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RevenueDistribution
            revenue_distribution={revenue_distribution}
            totalRevenue={totalRevenue}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <PaymentCategories payment_categories={payment_categories} />
        </Grid>
      </Grid>

      {/* ── Class-Level Collection Matrix + Operational Alerts ─────── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CollectionMatrix
            matrix={filteredMatrix}
            totals={totals}
            totalEfficiency={totalEfficiency}
            statusFilter={statusFilter}
            onRowClick={(className) =>
              notify.info(`Detailed breakdown for ${className} is coming soon`)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <OperationalAlerts operational_alerts={operational_alerts} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default BursaryOfficerDashboard;
