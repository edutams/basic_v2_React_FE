import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { Box, Tabs, Tab, Divider } from '@mui/material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import { usePermissions } from '@/context/TenantContext/permissions';

import SetupAffectivePsychomotorTab from './components/SetupAffectivePsychomotorTab';
import MarkAttendanceTab from './components/MarkAttendanceTab';
import MarkPsychomotorTab from './components/MarkPsychomotorTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Attendance & Psychomotor' },
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`psychomotor-tabpanel-${index}`}
      aria-labelledby={`psychomotor-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const AttendancePsychomotor = () => {
  const { can } = usePermissions();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(0);

  // ── Metrics that respond to filter changes ──────────────────
  const [attendanceMetrics, setAttendanceMetrics] = useState({
    weekRate: 0,
    weekRateChange: null,
    weekTrendText: '',
    termRate: 0,
    termRateChange: null,
    termTrendText: '',
    totalAbsentees: 0,
    atRisk: 0,
    totalStudents: 0,
  });

  const [psychomotorMetrics, setPsychomotorMetrics] = useState({
    avgAffective: 0,
    avgPsychomotor: 0,
    needingSupport: 0,
    maleRating: 0,
    femaleRating: 0,
    maxRating: 5,
    affectiveChange: null,
    affectiveTrendText: '',
    psychoChange: null,
    psychoTrendText: '',
  });

  // Start as loading so the analytics cards show skeletons on first paint
  // until the active tab's stats arrive.
  const [loading, setLoading] = useState(true);
  // Counter of in-flight stat fetches so overlapping requests (e.g. rapid tab
  // switches) don't clear the skeleton state before the newest fetch resolves.
  const pendingFetchesRef = useRef(0);
  const [selectedClassArmId, setSelectedClassArmId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // ── Fetch Attendance Stats from API ─────────────────────────
  const fetchAttendanceStats = useCallback(async (params = {}) => {
    pendingFetchesRef.current += 1;
    setLoading(true);
    try {
      const res = await attendanceApi.getAttendanceStats(params);
      if (res.data?.data) {
        const stats = res.data.data;
        setAttendanceMetrics({
          weekRate: stats.week_rate || 0,
          weekRateChange: stats.week_rate_change ?? null,
          weekTrendText: stats.week_trend_text || '',
          termRate: stats.term_rate || 0,
          termRateChange: stats.term_rate_change ?? null,
          termTrendText: stats.term_trend_text || '',
          totalAbsentees: stats.total_absentees || 0,
          atRisk: stats.at_risk || 0,
          totalStudents: stats.total_students || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
    } finally {
      pendingFetchesRef.current = Math.max(0, pendingFetchesRef.current - 1);
      setLoading(pendingFetchesRef.current > 0);
    }
  }, []);

  // ── Fetch Psychomotor Stats from API ────────────────────────
  const fetchPsychomotorStats = useCallback(async (params = {}) => {
    pendingFetchesRef.current += 1;
    setLoading(true);
    try {
      const [statsRes, genderRes] = await Promise.all([
        attendanceApi.getPsychomotorStats(params),
        attendanceApi.getRatingByGender(params).catch(() => ({ data: { data: {} } })),
      ]);

      const stats = statsRes.data?.data || {};
      const genderData = genderRes.data?.data || {};

      setPsychomotorMetrics({
        avgAffective: stats.avg_affective || 0,
        avgPsychomotor: stats.avg_psychomotor || 0,
        needingSupport: stats.needing_support || 0,
        maleRating: genderData.male_rating || 0,
        femaleRating: genderData.female_rating || 0,
        maxRating: stats.max_rating || 5,
        affectiveChange: stats.affective_change ?? null,
        affectiveTrendText: stats.affective_trend_text || '',
        psychoChange: stats.psycho_change ?? null,
        psychoTrendText: stats.psycho_trend_text || '',
      });
    } catch (error) {
      console.error('Failed to fetch psychomotor stats:', error);
    } finally {
      pendingFetchesRef.current = Math.max(0, pendingFetchesRef.current - 1);
      setLoading(pendingFetchesRef.current > 0);
    }
  }, []);

  // ── Filter update callbacks from child tabs ─────────────────
  const handleAttendanceFilter = (classArmId, sessionId, termId, weekId, programmeId, classId) => {
    if (classArmId) setSelectedClassArmId(classArmId);
    if (sessionId) setSelectedSessionId(sessionId);
    if (termId) setSelectedTermId(termId);
    if (weekId) setSelectedWeekId(weekId);
    if (programmeId) setSelectedProgrammeId(programmeId);
    if (classId) setSelectedClassId(classId);
    fetchAttendanceStats({
      class_arm_id: classArmId || undefined,
      session_id: sessionId || undefined,
      term_id: termId || undefined,
      week_term_id: weekId || undefined,
    });
  };

  const handlePsychomotorFilter = (classArmId, sessionId, termId, weekId, programmeId, classId) => {
    if (classArmId) setSelectedClassArmId(classArmId);
    if (sessionId) setSelectedSessionId(sessionId);
    if (termId) setSelectedTermId(termId);
    if (weekId) setSelectedWeekId(weekId);
    if (programmeId) setSelectedProgrammeId(programmeId);
    if (classId) setSelectedClassId(classId);
    fetchPsychomotorStats({
      class_arm_id: classArmId || undefined,
      session_id: sessionId || undefined,
      term_id: termId || undefined,
      week_term_id: weekId || undefined,
    });
  };

  // ── Build available tabs based on permissions (like PackageManager.jsx) ──
  const availableTabs = useMemo(() => {
    const tabs = [];
    let counter = 1;

    if (can('manage.class_manager.attendance_psychomotor.setup')) {
      tabs.push({
        id: 'setup',
        label: `${counter}. Setup`,
        component: <SetupAffectivePsychomotorTab />,
        analytics: null, // no analytics on setup tab
      });
      counter++;
    }

    tabs.push({
      id: 'mark-attendance',
      label: `${counter}. Mark Attendance`,
      component: (
        <MarkAttendanceTab metrics={attendanceMetrics} onFilter={handleAttendanceFilter} />
      ),
      // The redesigned Mark Attendance tab now renders its own stats row
      // (Class Learners / Marked Today / Attendance This Week / Needs
      // Follow-up) inline, so the old standalone analytics row would just
      // duplicate it above the tab bar.
      analytics: null,
    });
    counter++;

    tabs.push({
      id: 'mark-psychomotor',
      label: `${counter}. Mark Psychomotor`,
      component: (
        <MarkPsychomotorTab metrics={psychomotorMetrics} onFilter={handlePsychomotorFilter} />
      ),
      // The redesigned Mark Psychomotor tab now renders its own 6-card
      // stats row inline (fed by this same `psychomotorMetrics`), so the
      // old standalone analytics row would just duplicate it above the tab
      // bar — same reasoning as Mark Attendance's `analytics: null` above.
      analytics: null,
    });

    return tabs;
  }, [
    can,
    attendanceMetrics,
    psychomotorMetrics,
    loading,
    handleAttendanceFilter,
    handlePsychomotorFilter,
    selectedClassArmId,
    selectedSessionId,
    selectedTermId,
    selectedWeekId,
    selectedProgrammeId,
    selectedClassId,
  ]);

  // ── Ensure activeTab stays within bounds ────────────────────
  useEffect(() => {
    if (activeTab >= availableTabs.length) {
      setActiveTab(0);
    }
  }, [availableTabs.length, activeTab]);

  // ── Deep-link to a specific tab (e.g. Class Register's "Mark
  // Attendance"/"Mark Psychomotor" buttons) via ?tab=mark-attendance or
  // navigate(..., { state: { initialTabId: 'mark-psychomotor' } }) — tab
  // order depends on the viewer's permissions, so this matches by id, not
  // a hardcoded index. Only re-applies once per distinct navigation
  // (tracked via location.key) — `availableTabs` is still a dependency so
  // this retries once permissions/stats finish loading and the tab
  // actually exists, but otherwise `availableTabs` changing identity on
  // every stat refresh must NOT re-force the URL's tab, or clicking a
  // different tab while `?tab=` is still in the address bar would keep
  // snapping back to it.
  const appliedTabKeyRef = useRef(null);
  useEffect(() => {
    if (appliedTabKeyRef.current === location.key) return;
    const desiredId = new URLSearchParams(location.search).get('tab') || location.state?.initialTabId;
    if (!desiredId) return;
    const idx = availableTabs.findIndex((t) => t.id === desiredId);
    if (idx >= 0) {
      setActiveTab(idx);
      appliedTabKeyRef.current = location.key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTabs, location.key, location.search, location.state]);

  // ── Load stats for the currently active tab only ─────────────
  // Fires on mount and whenever the user switches tabs so the
  // analytics cards always reflect the tab currently in view.
  // Filters already trigger their own fetch inside the handlers,
  // so this intentionally only re-runs when the tab changes.
  useEffect(() => {
    const tab = availableTabs[activeTab];
    if (!tab) return;

    const params = {
      class_arm_id: selectedClassArmId || undefined,
      session_id: selectedSessionId || undefined,
      term_id: selectedTermId || undefined,
      week_term_id: selectedWeekId || undefined,
    };

    if (tab.id === 'mark-attendance') {
      fetchAttendanceStats(params);
    } else if (tab.id === 'mark-psychomotor') {
      fetchPsychomotorStats(params);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageContainer
      title="Attendance & Psychomotor"
      description="Mark attendance and psychomotor assessments"
    >
      <Breadcrumb title="Attendance & Psychomotor" items={BCrumb} />

      {/* ── Dynamic Analytics Cards ─────────────────────────── */}
      {availableTabs[activeTab]?.analytics}

      {/* ── Main Section with Tabs ─────────────────────────────── */}
      <ParentCard
        title={
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                },
              }}
            >
              {availableTabs.map((tab, idx) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  id={`psychomotor-tab-${idx}`}
                  aria-controls={`psychomotor-tabpanel-${idx}`}
                />
              ))}
            </Tabs>
            <Divider />
          </Box>
        }
        sx={{
          '& .MuiCardHeader-root': {
            p: 0,
          },
          '& .MuiCardContent-root': {
            p: 1.5,
            '&:last-child': { pb: 1.5 },
          },
        }}
      >
        {availableTabs.map((tab, idx) => (
          <TabPanel key={tab.id} value={activeTab} index={idx}>
            {tab.component}
          </TabPanel>
        ))}
      </ParentCard>
    </PageContainer>
  );
};

export default AttendancePsychomotor;
