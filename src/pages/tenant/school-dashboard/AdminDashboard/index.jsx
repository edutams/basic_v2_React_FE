import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchWeeks } from '@/api/tenant/term-weeks/weekApi';
import { fetchHolidays } from '@/api/tenant/holidays/holidayApi';

import DashboardHeader from './components/DashboardHeader';
import TopStatCards from './components/TopStatCards';
import QuickActions from './components/QuickActions';
import SearchAndRoleBar from './components/SearchAndRoleBar';
import FinancialOverviewBar from './components/FinancialOverviewBar';
import AcademicPerformanceOverview from './components/AcademicPerformanceOverview';
import AttendanceOverview from './components/AttendanceOverview';
import TermCalendarCard from './components/TermCalendarCard';
import AnnouncementsCard from './components/AnnouncementsCard';
import EnrolmentByClass from './components/EnrolmentByClass';
import OverviewBreakdownModal from './components/OverviewBreakdownModal';
import { SchoolCalendarModal as CalendarModal } from '@/pages/tenant/staff-manager/non-teaching-dashboard/components/School-calendar';

const AdminDashboard = () => {
  const [breakdownType, setBreakdownType] = useState(null);
  const [breakdownExtra, setBreakdownExtra] = useState({});
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarWeeks, setCalendarWeeks] = useState([]);
  const [calendarHolidays, setCalendarHolidays] = useState([]);
  const [calendarTermStats, setCalendarTermStats] = useState({
    totalSchoolDays: 0,
    daysSpent: 0,
    daysRemaining: 0,
    totalHolidays: 0,
    pctCompleted: 0,
  });

  useEffect(() => {
    if (!calendarModalOpen) return;
    let mounted = true;
    const load = async () => {
      try {
        const activeRes = await tenantApi.get('/curriculum/active-session-term');
        const activeTermId = activeRes?.data?.data?.session_term_id;
        if (!activeTermId) return;

        const [weeksRes, holidaysRes] = await Promise.allSettled([
          fetchWeeks(activeTermId),
          fetchHolidays(activeTermId),
        ]);

        if (!mounted) return;

        const weeksData = weeksRes.status === 'fulfilled' ? weeksRes.value : null;
        const fetchedWeeks = Array.isArray(weeksData) ? weeksData : weeksData?.data || [];
        setCalendarWeeks(fetchedWeeks);

        const holidaysData = holidaysRes.status === 'fulfilled' ? holidaysRes.value : null;
        const fetchedHolidays = Array.isArray(holidaysData) ? holidaysData : holidaysData?.data || [];
        setCalendarHolidays(fetchedHolidays);

        if (weeksData?.stats) {
          const s = weeksData.stats;
          setCalendarTermStats({
            totalSchoolDays: s.total_school_days ?? 0,
            daysSpent: s.days_spent ?? 0,
            daysRemaining: s.remaining_school_days ?? 0,
            totalHolidays: s.holiday_days_allocated ?? 0,
            pctCompleted: s.pct_completed ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [calendarModalOpen]);

  // Section data hook — no session_term_id, backend uses active term
  const useSection = (path, extra = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, { params: { ...extra } })
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
    }, [path, JSON.stringify(extra)]);

    return { data, loading };
  };

  const overview = useSection('/dashboard/admin/global-overview');
  const financial = useSection('/dashboard/bursary/revenue-performance');
  const termCalendar = useSection('/dashboard/admin/term-calendar');

  // Attendance — backend uses active session term
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/attendance-overview');
      setAttendanceData(res.data?.status ? res.data.data : {});
    } catch {
      setAttendanceData({});
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Enrollment by class — backend uses active session term
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);

  const fetchEnrollment = useCallback(async () => {
    setEnrollmentLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/enrollment-by-class');
      setEnrollmentData(res.data?.status ? res.data.data : []);
    } catch {
      setEnrollmentData([]);
    } finally {
      setEnrollmentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  // Academic performance — backend uses active session term
  const [academicData, setAcademicData] = useState({});
  const [academicLoading, setAcademicLoading] = useState(true);

  const fetchAcademic = useCallback(async () => {
    setAcademicLoading(true);
    try {
      const res = await tenantApi.get('/dashboard/admin/learner/exam-performance');
      setAcademicData(res.data?.status ? res.data.data : {});
    } catch {
      setAcademicData({});
    } finally {
      setAcademicLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademic();
  }, [fetchAcademic]);

  const handleBreakdownClick = (type, extra = {}) => {
    setBreakdownType(type);
    setBreakdownExtra(extra);
  };

  return (
    <PageContainer title="Admin Dashboard" description="School Administrator Overview">
      {/* ── Top Header Bar (Greeting + Role Switcher) ─────── */}
      <DashboardHeader currentRole="administrator" />

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
        loading={overview.loading}
      />

      {/* ── Middle Section: Left (Search + Calendar + Financial + Charts) | Right (Enrolment + Announcements) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
          gap: 1.3,
          alignItems: 'start',
        }}
      >
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <SearchAndRoleBar />
          <QuickActions loading={overview.loading} />

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
            loading={financial.loading}
          />

          {/* Row: Academic Performance & Attendance */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AcademicPerformanceOverview
                data={academicData.exam_performance_overview}
                avgScore={academicData.exam_performance != null ? `${academicData.exam_performance}%` : '0%'}
                loading={academicLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AttendanceOverview
                data={attendanceData.current_week_days}
                avgAttendance={attendanceData.avg_attendance ? `${attendanceData.avg_attendance}%` : '—'}
                trend={attendanceData.trend ? `${attendanceData.trend > 0 ? '+' : ''}${attendanceData.trend}%` : '0%'}
                loading={attendanceLoading}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Right Column: Term Calendar, Announcements, Enrolment By Class */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
          <Box sx={{ flexShrink: 0 }}>
            <TermCalendarCard
              dayCurrent={termCalendar.data?.day_current}
              dayTotal={termCalendar.data?.day_total}
              termStart={termCalendar.data?.term_start}
              expectedEnd={termCalendar.data?.expected_end}
              progressPct={termCalendar.data?.progress_pct}
              loading={termCalendar.loading}
              onViewCalendar={() => setCalendarModalOpen(true)}
            />
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <AnnouncementsCard />
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <EnrolmentByClass
              classData={enrollmentData}
              loading={enrollmentLoading}
              onCellClick={(classCode, sex) => {
                handleBreakdownClick('enrollment_by_class', { class_code: classCode, sex });
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Stat Card Breakdown Modal ──────────────────────────────── */}
      <OverviewBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        extra={breakdownExtra}
        onClose={() => { setBreakdownType(null); setBreakdownExtra({}); }}
      />

      {/* ── Full Calendar Modal ────────────────────────────────────── */}
      <CalendarModal
        open={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        weeks={calendarWeeks}
        holidays={calendarHolidays}
        termStats={calendarTermStats}
      />
    </PageContainer>
  );
};

export default AdminDashboard;
