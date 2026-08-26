import React, { useState, useEffect } from 'react';
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
  const useSection = (path) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!sessionTermsLoaded) return;
      let mounted = true;
      setLoading(true);
      tenantApi
        .get(path, {
          params: sessionTerm !== 'all' ? { session_term_id: sessionTerm } : {},
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
    }, [path, sessionTerm, sessionTermsLoaded]);

    return { data, loading };
  };

  const overview = useSection('/dashboard/admin/global-overview');
  const financial = useSection('/dashboard/bursary/revenue-performance');

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
        total_students={overview.data?.students_count ?? 2486}
        teaching_staff={overview.data?.teachers_count ?? 142}
        non_teaching_staff={overview.data?.non_teaching_staff_count ?? 58}
        attendance_rate={overview.data?.attendance_rate ? `${overview.data.attendance_rate}%` : '94.6%'}
        onCardClick={setBreakdownType}
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
            expectedIncome={financial.data?.total_expected_income ? `₦ ${Number(financial.data.total_expected_income).toLocaleString()}` : '₦ 98,450,000'}
            collectedIncome={financial.data?.total_collected_income ? `₦ ${Number(financial.data.total_collected_income).toLocaleString()}` : '₦ 62,340,000'}
            outstandingBalance={financial.data?.total_outstanding_balance ? `₦ ${Number(financial.data.total_outstanding_balance).toLocaleString()}` : '₦ 36,110,000'}
            efficiency={financial.data?.collection_efficiency ? `${financial.data.collection_efficiency}%` : '63.3%'}
            onCardClick={setBreakdownType}
          />

          {/* Row: Academic Performance & Attendance */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AcademicPerformanceOverview />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AttendanceOverview />
            </Grid>
          </Grid>
        </Box>

        {/* Right Column: Enrolment By Class */}
        <Box sx={{ height: '100%' }}>
          <EnrolmentByClass />
        </Box>
      </Box>

      {/* ── Bottom Row: Term Calendar, Quick Reports, Announcements (FULL WIDTH) ── */}
      <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TermCalendarCard />
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
        onClose={() => setBreakdownType(null)}
      />
    </PageContainer>
  );
};

export default AdminDashboard;
