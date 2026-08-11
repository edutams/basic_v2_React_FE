import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
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
 * ── Admin Dashboard ───────────────────────────────────────────────────
 * Fetches school-wide stats and composes the section components.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await tenantApi.get('/dashboard/admin/stats');
        if (response.data.status) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard stats:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [notify]);

  const handleDownloadReport = () => {
    const go = dashboardData?.global_overview || {};
    const rp = dashboardData?.bursary_overview?.revenue_performance || {};
    const rows = [
      ['Metric', 'Value'],
      ['Total Students', go.total_students],
      ['Teaching Staff', go.teaching_staff],
      ['Non-Teaching Staff', go.non_teaching_staff],
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

  if (loading || !dashboardData) {
    return (
      <PageContainer title="Admin Dashboard" description="School-wide overview">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  const {
    global_overview: go = {},
    teacher_analytics: ta = {},
    learner_analytics: la = {},
    admission_overview: ao = {},
    bursary_overview: bo = {},
  } = dashboardData;

  // Staff distribution donut
  const staffDonut = (go.staff_distribution || []).map((s) => ({
    name: s.name,
    value: num(s.value),
    count: num(s.count),
    color: s.name === 'Teaching' ? BLUE : ORANGE,
  }));

  // Attendance donut
  const attendanceColors = { Present: GREEN, Late: ORANGE, Absent: RED };
  const attendanceDonut = (la.attendance_overview || []).map((a) => ({
    ...a,
    color: attendanceColors[a.name] || BLUE,
  }));

  // Exam performance bars — match by name prefix so "Excellent (80%+)" → Excellent etc.
  const examColors = [
    { match: 'Excellent', color: BLUE },
    { match: 'Good', color: ORANGE },
    { match: 'Average', color: RED },
  ];
  const examData = (la.exam_performance_overview || []).map((e) => ({
    ...e,
    fill: examColors.find((c) => String(e.name || '').startsWith(c.match))?.color || BLUE,
  }));

  // Revenue distribution donut
  const revenueColors = [BLUE, GREEN, ORANGE, PURPLE, RED];
  const revenueDonut = (bo.revenue_distribution || []).map((r, i) => ({
    name: r.category,
    value: num(r.percentage),
    amount: num(r.amount),
    color: revenueColors[i % revenueColors.length],
  }));

  // Payment categories — horizontal bars
  const paymentData = (bo.payment_categories || []).map((p) => ({
    name: p.category,
    amount: num(p.amount),
    percentage: num(p.percentage),
  }));
  const maxPayment = Math.max(...paymentData.map((p) => p.amount), 1);

  // Admission enrollment by class (bar) & by session (line)
  const enrollmentByClass =
    (ao.enrollment_by_class || []).length > 0
      ? ao.enrollment_by_class
      : [
          { class_name: 'JSS 1', enrollments: 210 },
          { class_name: 'JSS 2', enrollments: 198 },
          { class_name: 'SSS 1', enrollments: 176 },
          { class_name: 'SSS 2', enrollments: 158 },
          { class_name: 'SSS 3', enrollments: 156 },
        ];
  const enrollmentBySession =
    (ao.enrollment_by_sessions || []).length > 0
      ? ao.enrollment_by_sessions
      : [
          { session: '2023/24', enrollments: 1842 },
          { session: '2024/25', enrollments: 2105 },
          { session: '2025/26', enrollments: 2384 },
        ];
  const maxEnrollment = Math.max(...enrollmentByClass.map((c) => num(c.enrollments)), 1);

  // Class-level collection matrix
  const matrix = bo.class_level_collection_matrix || [];

  return (
    <PageContainer title="Admin Dashboard" description="School-wide overview">
      <DashboardHeader onDownload={handleDownloadReport} />

      <GlobalOverviewPanel go={go} staffDonut={staffDonut} />

      {/* ── Teacher Analytics | Learner Analytics ───────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TeacherAnalyticsPanel
            ta={ta}
            onViewAll={() => notify.info('Full teacher analytics coming soon')}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <LearnerAnalyticsPanel
            la={la}
            attendanceDonut={attendanceDonut}
            examData={examData}
            onViewAll={() => notify.info('Full learner analytics coming soon')}
          />
        </Grid>
      </Grid>

      <AdmissionOverviewPanel
        ao={ao}
        enrollmentByClass={enrollmentByClass}
        enrollmentBySession={enrollmentBySession}
        maxEnrollment={maxEnrollment}
        onSwitchRole={() => navigate('/dashboard')}
        onFooterClick={() => notify.info('Opening the admission dashboard')}
      />

      <BursaryOverviewPanel
        bo={bo}
        revenueDonut={revenueDonut}
        paymentData={paymentData}
        maxPayment={maxPayment}
        matrix={matrix}
        onSwitchRole={() => navigate('/dashboard')}
        onFooterClick={() => notify.info('Opening the bursary dashboard')}
      />
    </PageContainer>
  );
};

export default AdminDashboard;
