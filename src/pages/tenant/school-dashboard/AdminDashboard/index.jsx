import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { useNotification } from 'src/hooks/useNotification';
import tenantApi from '@/api/tenant/tenant_api';
import { BLUE, GREEN, ORANGE, PURPLE, RED, num } from './constants';
import DashboardHeader from './components/DashboardHeader';
import GlobalOverviewPanel from './components/GlobalOverviewPanel';
import TeacherAnalyticsPanel from './components/TeacherAnalyticsPanel';
import LearnerAnalyticsPanel from './components/LearnerAnalyticsPanel';
import AdmissionOverviewPanel from './components/AdmissionOverviewPanel';
import BursaryOverviewPanel from './components/BursaryOverviewPanel';

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
  const ta = useSection('/dashboard/admin/teacher-analytics');
  const la = useSection('/dashboard/admin/learner-analytics');
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

  // Attendance donut — only Present/Absent segments (Late/Excused were removed
  // from the backend tally, so they never appear here).
  const attendanceColors = { Present: GREEN, Absent: RED };
  const attendanceDonut = (la.data?.attendance_overview || []).map((a) => ({
    ...a,
    color: attendanceColors[a.name] || BLUE,
  }));

  // Exam performance bars — match by name prefix so "Excellent (80%+)" → Excellent etc.
  const examColors = [
    { match: 'Excellent', color: BLUE },
    { match: 'Good', color: ORANGE },
    { match: 'Average', color: RED },
  ];
  const examData = (la.data?.exam_performance_overview || []).map((e) => ({
    ...e,
    fill: examColors.find((c) => String(e.name || '').startsWith(c.match))?.color || BLUE,
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
        <PanelSkeleton height={170} />
      ) : (
        <GlobalOverviewPanel go={go.data} staffDonut={staffDonut} />
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
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          {la.loading ? (
            <PanelSkeleton height={340} />
          ) : (
            <LearnerAnalyticsPanel
              la={la.data}
              attendanceDonut={attendanceDonut}
              examData={examData}
              onViewAll={() => notify.info('Full learner analytics coming soon')}
            />
          )}
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
        />
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
