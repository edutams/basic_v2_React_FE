import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid, Paper, Skeleton, useTheme, Box } from '@mui/material';
import { ReceiptLong, AccountBalanceWallet, ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { formatCurrency } from './constants';
import KpiCard, { EfficiencyRing } from './components/KpiCard';
import RevenueDistribution from './components/RevenueDistribution';
import PaymentCategories from './components/PaymentCategories';
import CollectionMatrix from './components/CollectionMatrix';
import BursaryBreakdownModal from './components/BursaryBreakdownModal';
import RevenueTrend from './components/RevenueTrend';
import QuickActions from './components/QuickActions';
import SearchStudent from './components/SearchStudent';
import StudentDetailModal from './components/StudentDetailModal';

const asArray = (data) => (Array.isArray(data) ? data : []);

const PanelSkeleton = ({ height = 240 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
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

const BursaryOfficerDashboard = () => {
  const notify = useNotification();
  const navigate = useNavigate();

  const [breakdownType, setBreakdownType] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('this_month');
  const [periodValue, setPeriodValue] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [ready, setReady] = useState(false);

  // Fetch active session term once
  useEffect(() => {
    const load = async () => {
      try {
        const active = await fetchActiveSessionTerm();
        const activeId = active?.data?.session_term_id;
        if (active?.status && activeId != null) {
          setActiveSessionTermId(activeId);
        }
      } catch (err) {
        console.error('Failed to fetch active session term:', err);
      } finally {
        setReady(true);
      }
    };
    load();
  }, []);

  const handleTrendPeriodChange = (newPeriod) => {
    setTrendPeriod(newPeriod);
    setPeriodValue(null);
  };

  // Section loader — auto-uses active session term
  const useSection = (path) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!ready || !activeSessionTermId) return;
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, { params: { session_term_id: activeSessionTermId } })
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, ready, activeSessionTermId]);

    return { data, loading };
  };

  const rp = useSection('/dashboard/bursary/revenue-performance');
  const revenueDistribution = useSection('/dashboard/bursary/revenue-distribution');
  const paymentCategories = useSection('/dashboard/bursary/payment-categories');
  const collectionMatrix = useSection('/dashboard/bursary/collection-matrix');

  // Revenue trend
  const [revenueTrendData, setRevenueTrendData] = useState({});
  const [revenueTrendLoading, setRevenueTrendLoading] = useState(true);

  useEffect(() => {
    if (!ready || !activeSessionTermId) return;
    let mounted = true;
    setRevenueTrendLoading(true);

    const params = {
      session_term_id: activeSessionTermId,
      period: trendPeriod,
    };

    if (trendPeriod === 'today' && periodValue) {
      params.selected_date = periodValue;
    } else if (trendPeriod === 'this_week' && periodValue?.week) {
      params.selected_week = periodValue.week;
      params.selected_year = periodValue.year;
    } else if (trendPeriod === 'this_month' && periodValue?.month) {
      params.selected_month = periodValue.month;
      params.selected_year = periodValue.year;
    } else if (trendPeriod === 'this_year' && periodValue) {
      params.selected_year = periodValue;
    }

    tenantApi
      .get('/dashboard/bursary/revenue-trend', { params })
      .then((res) => {
        if (mounted) setRevenueTrendData(res.data?.status ? res.data.data : {});
      })
      .catch(() => {
        if (mounted) setRevenueTrendData({});
      })
      .finally(() => {
        if (mounted) setRevenueTrendLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [ready, activeSessionTermId, trendPeriod, periodValue]);

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

  // Report export
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res = await tenantApi.get('/dashboard/bursary/export-report', {
        params: { format, session_term_id: activeSessionTermId || undefined },
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

  const handleQuickAction = useCallback((action) => {
    const routes = {
      create_invoice: '/payment-schedule',
      bulk_invoice: '/payment-schedule',
      record_payment: '/class-ledger',
      manage_fees: '/class-ledger',
      generate_report: null,
      send_reminder: '/bursary-setup',
      fee_structure: '/bursary-setup',
      export_data: null,
    };
    if (action === 'generate_report') {
      handleExport('excel');
      return;
    }
    if (action === 'export_data') {
      handleExport('excel');
      return;
    }
    const route = routes[action];
    if (route) {
      navigate(route);
    } else {
      notify.info(`${action.replace(/_/g, ' ')} feature coming soon`);
    }
  }, [navigate, notify]);

  const handleSearchStudent = useCallback(async (query) => {
    setSearchLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/bursary/search-student', {
        params: { q: query },
      });
      if (res.data?.status) {
        setSearchResults(res.data.data || []);
        if (res.data.data?.length === 0) {
          notify.info('No students found matching your search');
        }
      } else {
        setSearchResults([]);
        notify.info('No students found matching your search');
      }
    } catch {
      setSearchResults([]);
      notify.error('Failed to search students');
    } finally {
      setSearchLoading(false);
    }
  }, [notify]);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <PageContainer
      title="Bursary Dashboard"
      description="Overview of revenue performance and collections"
    >
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
              value={formatCurrency(rp.data.total_expected_income)}
              sublabel="This Session"
              progress={rp.data.expected_vs_last_session}
              icon={ReceiptLong}
              colorName="info"
              onClick={() => setBreakdownType('expected_income')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total Collected Income"
              value={formatCurrency(rp.data.total_collected_income)}
              sublabel="This Session"
              progress={rp.data.collected_vs_last_session}
              icon={AccountBalanceWallet}
              colorName="success"
              onClick={() => setBreakdownType('collected_income')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Total Outstanding Balance"
              value={formatCurrency(rp.data.total_outstanding_balance)}
              sublabel="This Session"
              progress={rp.data.outstanding_vs_last_session ? -rp.data.outstanding_vs_last_session : undefined}
              icon={ErrorOutline}
              colorName="warning"
              onClick={() => setBreakdownType('outstanding_balance')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Collection Efficiency"
              value={`${rp.data.collection_efficiency ?? 0}%`}
              sublabel="This Session"
              progress={rp.data.efficiency_vs_last_session}
              colorName="primary"
              rightElement={<EfficiencyRing value={rp.data.collection_efficiency ?? 0} />}
              onClick={() => setBreakdownType('collection_efficiency')}
            />
          </Grid>
        </Grid>
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                {revenueTrendLoading ? (
                  <PanelSkeleton height={480} />
                ) : (
                  <RevenueTrend
                    revenue_trend={asArray(revenueTrendData)}
                    onClick={() => setBreakdownType('revenue_trend')}
                    period={trendPeriod}
                    periodValue={periodValue}
                    onPeriodChange={handleTrendPeriodChange}
                    onPeriodValueChange={setPeriodValue}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {revenueDistribution.loading ? (
                  <PanelSkeleton height={300} />
                ) : (
                  <RevenueDistribution
                    revenue_distribution={asArray(revenueDistribution.data)}
                    totalRevenue={totalRevenue}
                    onClick={() => setBreakdownType('revenue_distribution')}
                  />
                )}
              </Grid>
            </Grid>
            {collectionMatrix.loading ? (
              <PanelSkeleton height={420} />
            ) : (
              <CollectionMatrix
                matrix={matrixRows}
                totals={totals}
                totalEfficiency={totalEfficiency}
                onRowClick={(className) =>
                  notify.info(`Detailed breakdown for ${className} is coming soon`)
                }
              />
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SearchStudent
              onSearch={handleSearchStudent}
              loading={searchLoading}
              results={searchResults}
              onStudentClick={(student) => setSelectedStudent(student)}
              onClear={() => setSearchResults(null)}
            />
            <QuickActions onAction={handleQuickAction} />
            {paymentCategories.loading ? (
              <PanelSkeleton height={420} />
            ) : (
              <PaymentCategories
                payment_categories={asArray(paymentCategories.data)}
                onClick={() => setBreakdownType('payment_categories')}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ── Breakdown modal ────────────────────────────────────── */}
      <BursaryBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        sessionTermId={activeSessionTermId}
        onClose={() => setBreakdownType(null)}
      />

      {/* ── Student detail modal ────────────────────────────────── */}
      <StudentDetailModal
        open={Boolean(selectedStudent)}
        student={selectedStudent}
        sessionTermId={activeSessionTermId}
        onClose={() => setSelectedStudent(null)}
      />
    </PageContainer>
  );
};

export default BursaryOfficerDashboard;
