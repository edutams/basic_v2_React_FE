import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { BLUE, GREEN, num, shortSession } from './constants';
import DashboardHeader from './components/DashboardHeader';
import MetricCards from './components/MetricCards';
import FinancialMetrics from './components/FinancialMetrics';
import EnrollmentAcrossClasses from './components/EnrollmentAcrossClasses';
import RatioAndFunnel from './components/RatioAndFunnel';
import EnrollmentAcrossSessions from './components/EnrollmentAcrossSessions';
import AtAGlance from './components/AtAGlance';
import DashboardFooter from './components/DashboardFooter';

/**
 * ── Admission Officer Dashboard ───────────────────────────────────────
 * Fetches admission dashboard stats and composes the section components.
 */
const AdmissionOfficerDashboard = () => {
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadSessionTerms = async () => {
      try {
        const response = await fetchSessionTerms();
        if (response.status) {
          const sess_terms = [
            { id: 'all', label: 'All Sessions' },
            ...response.data.map((sterm) => ({
              id: sterm.id,
              label: `${sterm.session?.sesname || ''} ${sterm.display_term?.display_name || ''}`.trim(),
            })),
          ];
          setSessionTerms(sess_terms);
        }
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      }
    };

    loadSessionTerms();
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const params = sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {};
        const response = await tenantApi.get('/dashboard/admission/stats', { params });

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
  }, [sessionTerm, notify]);

  // Previous-session label, e.g. "2024/2025" → "2023/24"
  const prevSessionLabel = useMemo(() => {
    const st = sessionTerms.find((s) => s.id === sessionTerm);
    const name = st?.label || '';
    const m = String(name).match(/(\d{4})\/(\d{4})/);
    if (m) return `${num(m[1]) - 1}/${String(num(m[2]) - 1).slice(2)}`;
    return 'previous session';
  }, [sessionTerms, sessionTerm]);

  const lastUpdated = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (loading || !dashboardData) {
    return (
      <PageContainer title="Admission Dashboard" description="Overview of admissions performance">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  const {
    total_applicants,
    total_batches,
    total_admitted,
    total_accepted,
    financial_metrics,
    enrollment_insights,
    conversion_funnel,
    at_a_glance,
  } = dashboardData;

  const byClass = (enrollment_insights.enrollment_by_class || []).map((c) => ({
    ...c,
    class_name: c.class_name,
  }));
  const bySessions = (enrollment_insights.enrollment_by_sessions || []).map((s) => ({
    ...s,
    session: shortSession(s.session),
  }));

  const totalFees = num(financial_metrics.total_fees_collected);
  const prePct = num(financial_metrics.revenue_breakdown?.pre_application);
  const postPct = num(financial_metrics.revenue_breakdown?.post_application);
  const donutData = [
    { name: 'Post-Application', value: postPct, color: BLUE },
    { name: 'Pre-Application', value: prePct, color: GREEN },
  ];

  const overallRatio = num(enrollment_insights.overall_enrollment_ratio);
  const funnelAdmittedRate = num(conversion_funnel.admitted_rate);
  const enrollmentRate = num(at_a_glance.enrollment_rate);

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance">
      <DashboardHeader
        sessionTerm={sessionTerm}
        sessionTerms={sessionTerms}
        onSessionChange={setSessionTerm}
      />

      <MetricCards
        total_applicants={total_applicants}
        total_batches={total_batches}
        total_admitted={total_admitted}
        total_accepted={total_accepted}
        prevSessionLabel={prevSessionLabel}
      />

      {/* ── Row 2: Financial Metrics ───────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14, mb: 1.5 }}>
        Financial Metrics
      </Typography>
      <FinancialMetrics
        financial_metrics={financial_metrics}
        totalFees={totalFees}
        total_applicants={total_applicants}
        total_accepted={total_accepted}
        prevSessionLabel={prevSessionLabel}
        donutData={donutData}
      />

      {/* ── Row 3: Enrollment Insights ─────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14, mb: 1.5 }}>
        Enrollment Insights
      </Typography>
      <Grid container spacing={3}>
        {/* Left column (~42%): two stacked cards — bar chart, then ratio + funnel */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <EnrollmentAcrossClasses byClass={byClass} />
            <RatioAndFunnel
              overallRatio={overallRatio}
              conversionFunnel={conversion_funnel}
              funnelAdmittedRate={funnelAdmittedRate}
              enrollmentRate={enrollmentRate}
            />
          </Stack>
        </Grid>

        {/* Enrollment Across Sessions (middle ~33%) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <EnrollmentAcrossSessions bySessions={bySessions} />
        </Grid>

        {/* At a Glance (right ~25%) */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <AtAGlance
            at_a_glance={at_a_glance}
            onViewFullReports={() => notify.info('Full reports are coming soon')}
          />
        </Grid>
      </Grid>

      <DashboardFooter lastUpdated={lastUpdated} />
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
