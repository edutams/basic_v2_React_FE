import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { fetchSessionTerms, fetchActiveSessionTerm } from '@/api/tenant/curriculum/tenantCurriculumApi';
import tenantApi from '@/api/tenant/tenant_api';

import DashboardHeader from './components/DashboardHeader';
import TopStatCards from './components/TopStatCards';
import QuickActions from './components/QuickActions';
import SearchAndRoleBar from './components/SearchAndRoleBar';
import FinancialOverviewBar from './components/FinancialOverviewBar';
import AcademicPerformanceOverview from './components/AcademicPerformanceOverview';
import AttendanceOverview from './components/AttendanceOverview';
import TermCalendarCard from './components/TermCalendarCard';
import QuickReportsCard from './components/QuickReportsCard';
import AnnouncementsCard from './components/AnnouncementsCard';
import EnrolmentByClass from './components/EnrolmentByClass';
import OverviewBreakdownModal from './components/OverviewBreakdownModal';

const AdminDashboard = () => {
  const [breakdownType, setBreakdownType] = useState(null);
  const [breakdownExtra, setBreakdownExtra] = useState({});
  const [sessionTerm, setSessionTerm] = useState('all');
  const [sessionTerms, setSessionTerms] = useState([{ id: 'all', label: 'All Sessions' }]);
  const [sessionTermsLoaded, setSessionTermsLoaded] = useState(false);

  // Load session terms
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
      } finally {
        setSessionTermsLoaded(true);
      }
    };

    loadSessionTerms();
  }, []);

  // Section data hook
  const useSection = (path, extra = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!sessionTermsLoaded) return;
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, {
          params: {
            ...(sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {}),
            ...extra,
          },
        })
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
    }, [path, sessionTerm, sessionTermsLoaded, JSON.stringify(extra)]);

    return { data, loading };
  };

  const overview = useSection('/dashboard/admin/global-overview');
  const financial = useSection('/dashboard/bursary/revenue-performance');
  const termCalendar = useSection('/dashboard/admin/term-calendar');
  const enrollmentByClass = useSection('/dashboard/admin/enrollment-by-class');

  // Attendance needs its own period state
  const [attendancePeriod, setAttendancePeriod] = useState('this_term');
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!sessionTermsLoaded) return;
    setAttendanceLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/attendance-overview', {
        params: {
          period: attendancePeriod,
          ...(sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {}),
        },
      });
      setAttendanceData(res.data?.status ? res.data.data : {});
    } catch {
      setAttendanceData({});
    } finally {
      setAttendanceLoading(false);
    }
  }, [attendancePeriod, sessionTerm, sessionTermsLoaded]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Enrollment by class period filter
  const [enrollmentPeriod, setEnrollmentPeriod] = useState('this_term');
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  const fetchEnrollment = useCallback(async () => {
    if (!sessionTermsLoaded) return;
    setEnrollmentLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/enrollment-by-class', {
        params: {
          period: enrollmentPeriod,
          ...(sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {}),
        },
      });
      setEnrollmentData(res.data?.status ? res.data.data : []);
    } catch {
      setEnrollmentData([]);
    } finally {
      setEnrollmentLoading(false);
    }
  }, [enrollmentPeriod, sessionTerm, sessionTermsLoaded]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const handleBreakdownClick = (type, extra = {}) => {
    setBreakdownType(type);
    setBreakdownExtra(extra);
  };

  return (
    <PageContainer title="Admin Dashboard" description="School Administrator Overview">
      {/* ── Top Header Bar (Greeting + Session Term dropdown ONLY) ─────── */}
      <DashboardHeader
        sessionTerm={sessionTerm}
        sessionTerms={sessionTerms}
        onSessionChange={setSessionTerm}
      />

      {/* ── Top 4 KPI Stat Cards ────────────────────────────────────── */}
      <TopStatCards
        total_students={overview.data?.total_students ?? 0}
        teaching_staff={overview.data?.teaching_staff ?? 0}
        non_teaching_staff={overview.data?.non_teaching_staff ?? 0}
        attendance_rate={overview.data?.attendance_rate != null ? `${overview.data.attendance_rate}%` : '0%'}
        student_growth={overview.data?.student_growth}
        teaching_growth={overview.data?.teaching_growth}
        non_teaching_growth={overview.data?.non_teaching_growth}
        attendance_growth={overview.data?.attendance_growth}
        onCardClick={handleBreakdownClick}
      />

      {/* ── Quick Actions Bar ───────────────────────────────────────── */}
      <QuickActions />

      {/* ── Middle Section: Left (Search + Financial + Charts) | Right (Enrolment) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Search Student/Staff & Switch Role Bar */}
          <SearchAndRoleBar currentRole="administrator" />

          {/* Financial Overview Bar (4 Mini Fee Cards) */}
          <FinancialOverviewBar
            expectedIncome={financial.data?.total_expected_income != null ? `₦ ${Number(financial.data.total_expected_income).toLocaleString()}` : '₦ 0'}
            collectedIncome={financial.data?.total_collected_income != null ? `₦ ${Number(financial.data.total_collected_income).toLocaleString()}` : '₦ 0'}
            outstandingBalance={financial.data?.total_outstanding_balance != null ? `₦ ${Number(financial.data.total_outstanding_balance).toLocaleString()}` : '₦ 0'}
            efficiency={financial.data?.collection_efficiency != null ? `${financial.data.collection_efficiency}%` : '0%'}
            efficiencyTrend={financial.data?.efficiency_trend}
            collectedTrend={financial.data?.collected_trend}
            outstandingTrend={financial.data?.outstanding_trend}
            expectedTrend={financial.data?.expected_trend}
            onCardClick={handleBreakdownClick}
          />

          {/* Row: Academic Performance & Attendance */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AcademicPerformanceOverview />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AttendanceOverview
                data={attendanceData.chart}
                avgAttendance={attendanceData.avg_attendance ? `${attendanceData.avg_attendance}%` : '—'}
                trend={attendanceData.trend ? `${attendanceData.trend}%` : '0%'}
                period={attendancePeriod}
                onPeriodChange={setAttendancePeriod}
                loading={attendanceLoading}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Right Column: Enrolment By Class */}
        <Box sx={{ height: '100%' }}>
          <EnrolmentByClass
            classData={enrollmentData}
            loading={enrollmentLoading}
            period={enrollmentPeriod}
            onPeriodChange={setEnrollmentPeriod}
            onCellClick={(classCode, sex) => {
              handleBreakdownClick('enrollment_by_class', { class_code: classCode, sex });
            }}
          />
        </Box>
      </Box>

      {/* ── Bottom Row: Term Calendar, Quick Reports, Announcements (FULL WIDTH) ── */}
      <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TermCalendarCard
            dayCurrent={termCalendar.data?.day_current}
            dayTotal={termCalendar.data?.day_total}
            termStart={termCalendar.data?.term_start}
            expectedEnd={termCalendar.data?.expected_end}
            progressPct={termCalendar.data?.progress_pct}
            loading={termCalendar.loading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <QuickReportsCard />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <AnnouncementsCard />
        </Grid>
      </Grid>

      {/* ── Stat Card Breakdown Modal ──────────────────────────────── */}
      <OverviewBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        extra={breakdownExtra}
        onClose={() => { setBreakdownType(null); setBreakdownExtra({}); }}
      />
    </PageContainer>
  );
};

export default AdminDashboard;
