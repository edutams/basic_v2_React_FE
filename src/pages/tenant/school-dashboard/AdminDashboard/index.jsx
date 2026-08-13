import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import {
  BLUE,
  GREEN,
  ORANGE,
  PURPLE,
  RED,
  MOCK_TEACHER_ANALYTICS,
  num,
} from './constants';
import DashboardHeader from './components/DashboardHeader';
import GlobalOverviewPanel from './components/GlobalOverviewPanel';
import GlobalOverviewSkeleton from './components/GlobalOverviewSkeleton';
import TeacherAnalyticsPanel from './components/TeacherAnalyticsPanel';
import LearnerAnalyticsPanel from './components/LearnerAnalyticsPanel';
import AdmissionOverviewPanel from './components/AdmissionOverviewPanel';
import BursaryOverviewPanel from './components/BursaryOverviewPanel';
import OverviewBreakdownModal from './components/OverviewBreakdownModal';

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
 * ── Admin Dashboard ───────────────────────────────────────────────────
 * Each analytics section is fetched from its own endpoint and loads
 * independently, so panels appear as soon as their data is ready.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  // Breakdown modal state — holds the stat card type clicked on Global Overview.
  const [breakdownType, setBreakdownType] = useState(null);

  // Each section manages its own { data, loading } state.
  const useSection = (path) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path)
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
    }, [path]);

    return { data, loading };
  };

  const go = useSection('/dashboard/admin/global-overview');
  // Teacher analytics is mocked for now — the endpoint is implemented, but the
  // frontend call is commented out so the panel (including the Top Resource
  // Usage chart with Quizzes) renders mock data until it's reconnected.
  // const ta = useSection('/dashboard/admin/teacher-analytics');
  const ta = { data: MOCK_TEACHER_ANALYTICS, loading: false };
  // Learner analytics is one endpoint per card, so each card loads (and shows
  // its own built-in skeleton) independently.
  const laAttendance = useSection('/dashboard/admin/learner/attendance');
  const laExam = useSection('/dashboard/admin/learner/exam-performance');
  const laUnderperforming = useSection('/dashboard/admin/learner/underperforming');
  const laAtRisk = useSection('/dashboard/admin/learner/at-risk');
  const laDropOut = useSection('/dashboard/admin/learner/drop-out-risk');
  const laAssignment = useSection('/dashboard/admin/learner/assignment-completion');
  const laResources = useSection('/dashboard/admin/learner/resource-engagement');
  const ao = useSection('/dashboard/admin/admission-overview');
  const bo = useSection('/dashboard/admin/bursary-overview');

  const handleDownloadReport = () => {
    const g = go.data || {};
    const rp = bo.data?.revenue_performance || {};
    const rows = [
      ['Metric', 'Value'],
      ['Total Students', g.total_students],
      ['Teaching Staff', g.teaching_staff],
      ['Non-Teaching Staff', g.non_teaching_staff],
      ['Total Expected Income', rp.total_expected_income],
      ['Total Collected Income', rp.total_collected_income],
      ['Total Outstanding Balance', rp.total_outstanding_balance],
      ['Collection Efficiency (%)', rp.collection_efficiency],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-dashboard-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify.success('Report exported successfully');
  };

  // Derived chart data (computed from loaded sections).
  const staffDonut = (go.data?.staff_distribution || []).map((s) => ({
    name: s.name,
    value: num(s.value),
    count: num(s.count),
    color: s.name === 'Teaching' ? BLUE : ORANGE,
  }));

  const revenueColors = [BLUE, GREEN, ORANGE, PURPLE, RED];
  const revenueDonut = (bo.data?.revenue_distribution || []).map((r, i) => ({
    name: r.category,
    value: num(r.percentage),
    amount: num(r.amount),
    color: revenueColors[i % revenueColors.length],
  }));

  const paymentData = (bo.data?.payment_categories || []).map((p) => ({
    name: p.category,
    amount: num(p.amount),
    percentage: num(p.percentage),
  }));
  const maxPayment = Math.max(...paymentData.map((p) => p.amount), 1);

  const enrollmentByClass =
    (ao.data?.enrollment_by_class || []).length > 0
      ? ao.data.enrollment_by_class
      : [
          { class_name: 'JSS 1', applications: 245, enrollments: 210 },
          { class_name: 'JSS 2', applications: 220, enrollments: 198 },
          { class_name: 'SSS 1', applications: 192, enrollments: 176 },
          { class_name: 'SSS 2', applications: 170, enrollments: 158 },
          { class_name: 'SSS 3', applications: 162, enrollments: 156 },
        ];
  const enrollmentBySession =
    (ao.data?.enrollment_by_sessions || []).length > 0
      ? ao.data.enrollment_by_sessions
      : [
          { session: '2023/24', applications: 1960, enrollments: 1842 },
          { session: '2024/25', applications: 2240, enrollments: 2105 },
          { session: '2025/26', applications: 2510, enrollments: 2384 },
        ];
  // Domain must span both series so applications bars aren't clipped when enrollments are 0.
  const maxEnrollment = Math.max(
    ...enrollmentByClass.flatMap((c) => [num(c.applications), num(c.enrollments)]),
    1,
  );

  const matrix = bo.data?.class_level_collection_matrix || [];

  return (
    <PageContainer title="Admin Dashboard" description="School-wide overview">
      <DashboardHeader onDownload={handleDownloadReport} />

      {go.loading ? (
        <GlobalOverviewSkeleton />
      ) : (
        <GlobalOverviewPanel
          go={go.data}
          staffDonut={staffDonut}
          onCardClick={setBreakdownType}
        />
      )}

      {/* ── Teacher Analytics | Learner Analytics ───────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          {ta.loading ? (
            <PanelSkeleton height={340} />
          ) : (
            <TeacherAnalyticsPanel
              ta={ta.data}
              onViewAll={() => notify.info('Full teacher analytics coming soon')}
              onTileClick={setBreakdownType}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <LearnerAnalyticsPanel
            attendance={laAttendance}
            exam={laExam}
            underperforming={laUnderperforming}
            atRisk={laAtRisk}
            dropOut={laDropOut}
            assignment={laAssignment}
            resources={laResources}
            onViewAll={() => notify.info('Full learner analytics coming soon')}
            onTileClick={setBreakdownType}
          />
        </Grid>
      </Grid>

      {ao.loading ? (
        <PanelSkeleton height={330} />
      ) : (
        <AdmissionOverviewPanel
          ao={ao.data}
          enrollmentByClass={enrollmentByClass}
          enrollmentBySession={enrollmentBySession}
          maxEnrollment={maxEnrollment}
          onSwitchRole={() => navigate('/dashboard/admission')}
          onFooterClick={() => navigate('/dashboard/admission')}
          onTileClick={setBreakdownType}
        />
      )}

      {bo.loading ? (
        <PanelSkeleton height={340} />
      ) : (
        <BursaryOverviewPanel
          bo={bo.data}
          revenueDonut={revenueDonut}
          paymentData={paymentData}
          maxPayment={maxPayment}
          matrix={matrix}
          onSwitchRole={() => navigate('/dashboard/bursary')}
          onFooterClick={() => navigate('/dashboard/bursary')}
          onTileClick={setBreakdownType}
        />
      )}

      {/* ── Global Overview stat card breakdown modal ──────────────── */}
      <OverviewBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        onClose={() => setBreakdownType(null)}
      />
    </PageContainer>
  );
};

export default AdminDashboard;
