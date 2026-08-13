import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import tenantApi from '@/api/tenant/tenant_api';
import { fetchSessionTerms } from '@/api/tenant/curriculum/tenantCurriculumApi';

import StatCards from './component/statcard';
import Analytics from './component/analytics';
import RightPanel from './component/rightpanel';
import QuickActions from './component/quickactions';
import LearnerBreakdownModal from './component/LearnerBreakdownModal';

/**
 * Fetches a section once a session term is available — the request is
 * dependent on the term, so sections render skeletons until one is set.
 * Each section passes its own term id, so changing a card's dropdown only
 * refetches that card and never the rest of the page.
 */
const useSection = (path, sessionTermId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionTermId) {
      return;
    }
    let mounted = true;
    setLoading(true);
    tenantApi
      .get(path, { params: { session_term_id: sessionTermId } })
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
  }, [path, sessionTermId]);

  return { data, loading };
};

const LearnerDashboard = () => {
  const { user } = useContext(TenantAuthContext);
  const userName = user?.name || 'there';

  // Session terms the learner is registered in, newest first. The first term
  // becomes the default for every section; the two chart cards each keep their
  // own term so a dropdown only ever refetches its own card.
  const [sessionTerms, setSessionTerms] = useState([]);
  const [defaultTermId, setDefaultTermId] = useState('');
  const [academicTermId, setAcademicTermId] = useState('');
  const [attendanceTermId, setAttendanceTermId] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchSessionTerms()
      .then((res) => {
        if (!mounted) return;
        const terms = res?.status ? res.data || [] : [];
        setSessionTerms(terms);
        const first = terms.length > 0 ? String(terms[0].id) : '';
        setDefaultTermId(first);
        setAcademicTermId(first);
        setAttendanceTermId(first);
      })
      .catch((err) => console.error('Failed to fetch session terms:', err));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every section waits for a session term before fetching (dependent fetch).
  // Non-dropdown sections (stat cards, assignments, notifications, events) use
  // the default term; the two chart cards use their own term, so each dropdown
  // only affects its own card.
  const overview = useSection('/dashboard/learner/overview', defaultTermId);
  const academics = useSection('/dashboard/learner/academic-performance', academicTermId);
  const attendance = useSection('/dashboard/learner/attendance', attendanceTermId);
  const assignments = useSection('/dashboard/learner/assignments', defaultTermId);
  const notifications = useSection('/dashboard/learner/notifications', defaultTermId);
  const events = useSection('/dashboard/learner/events', defaultTermId);

  // Stat-card breakdown modal — holds the clicked card type.
  const [breakdownType, setBreakdownType] = useState(null);

  return (
    <PageContainer title="Student Dashboard" description="Student portal">
      {/* Greeting Header */}
      <Box mb={2}>
        <Typography
          fontWeight="800"
          sx={{
            fontSize: { xs: '1.15rem', md: '1.4rem' },
            color: '#111827',
            lineHeight: 1.2,
          }}
        >
          Welcome back, {userName} 👋
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', mt: 0.3 }}>
          Here is your academic overview and upcoming activities.
        </Typography>
      </Box>

      {/* Top Stat Cards Section (Wallet card wider) */}
      <StatCards
        overview={overview.data}
        loading={overview.loading}
        onCardClick={setBreakdownType}
      />

      {/* Main Grid: Left 2x2 Analytics vs Right Side Sidebar Panel */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Main Content Area (Analytics 2x2 grid: Academic & Attendance side-by-side; Results & Assignment side-by-side) */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
          <Analytics
            academics={academics.data}
            attendance={attendance.data}
            assignments={assignments.data}
            loading={academics.loading || attendance.loading || assignments.loading}
            sessionTerms={sessionTerms}
            academicTermId={academicTermId}
            attendanceTermId={attendanceTermId}
            onAcademicTermChange={setAcademicTermId}
            onAttendanceTermChange={setAttendanceTermId}
          />
        </Box>

        {/* Right Sidebar (Notifications & Events stacked) */}
        <Box
          sx={{
            width: { xs: '100%', lg: 310 },
            flexShrink: 0,
          }}
        >
          <RightPanel
            notifications={notifications.data}
            events={events.data}
            loading={notifications.loading || events.loading}
          />
        </Box>
      </Box>

      {/* Bottom Quick Actions Section (Full width underneath main section) */}
      <QuickActions />

      {/* Stat-card breakdown modal — its own term dropdown defaults to the
          active term (the same term the stat cards reflect), and the learner
          can switch terms inside the modal. */}
      <LearnerBreakdownModal
        open={Boolean(breakdownType)}
        type={breakdownType}
        onClose={() => setBreakdownType(null)}
      />
    </PageContainer>
  );
};

export default LearnerDashboard;
