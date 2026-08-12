import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Stack, Typography, Paper, Skeleton, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms, fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import { fetchClasses } from '@/api/tenant/bursary/bursarySettingsApi';
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
 * Skeleton placeholder that mirrors the dashboard panel layout
 * (icon + title bar, then content) while a section is being fetched.
 */
const PanelSkeleton = ({ height = 240 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: isDark ? theme.palette.background.paper : '#fff',
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${theme.palette.grey[200]}`,
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.07)',
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
 * ── Admission Officer Dashboard ───────────────────────────────────────
 * Each analytics section is fetched from its own endpoint and loads
 * independently, so panels appear as soon as their data is ready.
 */
const AdmissionOfficerDashboard = () => {
  const notify = useNotification();

  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSessionsClass, setSelectedSessionsClass] = useState('all');

  // Each section manages its own { data, loading } state.
  const params = useMemo(
    () => (sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {}),
    [sessionTerm],
  );
  const paramsKey = JSON.stringify(params);

  const useSection = (path, extra = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, { params: { ...params, ...extra } })
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
    }, [path, paramsKey, JSON.stringify(extra)]);

    return { data, loading };
  };

  const overview = useSection('/dashboard/admission/overview');
  const financialMetrics = useSection('/dashboard/admission/financial-metrics');
  // Each chart has its own endpoint and its own class dropdown, so filtering
  // one panel never reloads or reshapes the other.
  const enrollmentByClass = useSection(
    '/dashboard/admission/enrollment-insights',
    selectedClass !== 'all' ? { class_id: selectedClass } : {},
  );
  const enrollmentBySessions = useSection(
    '/dashboard/admission/enrollment-by-sessions',
    selectedSessionsClass !== 'all' ? { class_id: selectedSessionsClass } : {},
  );
  const conversionFunnel = useSection('/dashboard/admission/conversion-funnel');
  const atAGlance = useSection('/dashboard/admission/at-a-glance');

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

          // Preselect the school's active session term by default, falling
          // back to "All Sessions" when it isn't in the subscribed list.
          try {
            const active = await fetchActiveSessionTerm();
            const activeId = active?.data?.session_term_id;
            if (active?.status && activeId != null) {
              const match = sess_terms.find((s) => String(s.id) === String(activeId));
              if (match) setSessionTerm(match.id);
            }
          } catch (err) {
            console.error('Failed to fetch active session term:', err);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session terms:', error);
      }
    };

    loadSessionTerms();
  }, []);

  // All classes for the school — powers the class filter on Enrollment Across Classes.
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await fetchClasses();
        if (res?.status) setClasses(res.data || []);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };
    loadClasses();
  }, []);

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

  const byClass = (enrollmentByClass.data.enrollment_by_class || []).map((c) => ({
    ...c,
    class_name: c.class_name,
  }));
  const bySessions = (enrollmentBySessions.data.enrollment_by_sessions || []).map((s) => ({
    ...s,
    session: shortSession(s.session),
  }));

  const totalFees = num(financialMetrics.data.total_fees_collected);
  const prePct = num(financialMetrics.data.revenue_breakdown?.pre_application);
  const postPct = num(financialMetrics.data.revenue_breakdown?.post_application);
  const donutData = [
    { name: 'Post-Application', value: postPct, color: BLUE },
    { name: 'Pre-Application', value: prePct, color: GREEN },
  ];

  const overallRatio = num(enrollmentByClass.data.overall_enrollment_ratio);
  const funnelAdmittedRate = num(conversionFunnel.data.admitted_rate);
  const enrollmentRate = num(atAGlance.data.enrollment_rate);

  return (
    <PageContainer title="Admission Dashboard" description="Overview of admissions performance">
      <DashboardHeader
        sessionTerm={sessionTerm}
        sessionTerms={sessionTerms}
        onSessionChange={setSessionTerm}
      />

      {/* ── Row 1: Overview metric cards ──────────────────────────── */}
      {overview.loading ? (
        <Box mb={3}>
          <PanelSkeleton height={150} />
        </Box>
      ) : (
        <MetricCards
          total_applicants={overview.data.total_applicants || {}}
          total_batches={overview.data.total_batches || {}}
          total_admitted={overview.data.total_admitted || {}}
          total_accepted={overview.data.total_accepted || {}}
          prevSessionLabel={prevSessionLabel}
        />
      )}

      {/* ── Row 2: Financial Metrics ───────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14, mb: 1.5 }}>
        Financial Metrics
      </Typography>
      {/* Financial Metrics reads overview counts (total_applicants/total_accepted),
          so it waits for both sections — otherwise it can render while overview is
          still loading (or failed) and crash on a missing .count. */}
      {financialMetrics.loading || overview.loading ? (
        <Box mb={3}>
          <PanelSkeleton height={170} />
        </Box>
      ) : (
        <FinancialMetrics
          financial_metrics={financialMetrics.data}
          totalFees={totalFees}
          total_applicants={overview.data.total_applicants || {}}
          total_accepted={overview.data.total_accepted || {}}
          prevSessionLabel={prevSessionLabel}
          donutData={donutData}
        />
      )}

      {/* ── Row 3: Enrollment Insights ─────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 14, mb: 1.5 }}>
        Enrollment Insights
      </Typography>
      <Grid container spacing={3} mb={3}>
        {/* Left column (~42%): two stacked cards — bar chart, then ratio + funnel */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {enrollmentByClass.loading ? (
              <PanelSkeleton height={300} />
            ) : (
              <EnrollmentAcrossClasses
                byClass={byClass}
                classes={classes}
                selectedClass={selectedClass}
                onClassChange={setSelectedClass}
              />
            )}
            {conversionFunnel.loading ? (
              <PanelSkeleton height={220} />
            ) : (
              <RatioAndFunnel
                overallRatio={overallRatio}
                conversionFunnel={conversionFunnel.data}
                funnelAdmittedRate={funnelAdmittedRate}
                enrollmentRate={enrollmentRate}
              />
            )}
          </Stack>
        </Grid>

        {/* Enrollment Across Sessions (middle ~33%) */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {enrollmentBySessions.loading ? (
            <PanelSkeleton height={540} />
          ) : (
            <EnrollmentAcrossSessions
              bySessions={bySessions}
              classes={classes}
              selectedClass={selectedSessionsClass}
              onClassChange={setSelectedSessionsClass}
            />
          )}
        </Grid>

        {/* At a Glance (right ~25%) */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          {atAGlance.loading ? (
            <PanelSkeleton height={540} />
          ) : (
            <AtAGlance
              at_a_glance={atAGlance.data}
              onViewFullReports={() => notify.info('Full reports are coming soon')}
            />
          )}
        </Grid>
      </Grid>

      <DashboardFooter lastUpdated={lastUpdated} />
    </PageContainer>
  );
};

export default AdmissionOfficerDashboard;
