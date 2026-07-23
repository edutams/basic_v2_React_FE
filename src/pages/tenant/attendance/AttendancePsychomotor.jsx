import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Tabs,
  Tab,
  CardContent,
  Divider,
} from '@mui/material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import { usePermissions } from '@/context/TenantContext/permissions';

import SetupAffectivePsychomotorTab from './components/SetupAffectivePsychomotorTab';
import MarkAttendanceTab from './components/MarkAttendanceTab';
import MarkPsychomotorTab from './components/MarkPsychomotorTab';
import AttendanceAnalyticsCards from './components/AttendanceAnalyticsCards';
import PsychomotorAnalyticsCards from './components/PsychomotorAnalyticsCards';

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

  const [activeTab, setActiveTab] = useState(0);

  // ── Metrics that respond to filter changes ──────────────────
  const [attendanceMetrics, setAttendanceMetrics] = useState({
    daysOpen: 0,
    weekRate: 0,
    termRate: 0,
    totalAbsentees: 0,
    atRisk: 0,
  });

  const [psychomotorMetrics, setPsychomotorMetrics] = useState({
    avgAffective: 0,
    avgPsychomotor: 0,
    needingSupport: 0,
    maleRating: 0,
    femaleRating: 0,
  });

  const [loading, setLoading] = useState(false);

  // ── Fetch Attendance Stats from API ─────────────────────────
  const fetchAttendanceStats = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAttendanceStats(params);
      if (res.data?.data) {
        const stats = res.data.data;
        setAttendanceMetrics({
          daysOpen: stats.days_open || 0,
          weekRate: stats.week_rate || 0,
          termRate: stats.term_rate || 0,
          totalAbsentees: stats.total_absentees || 0,
          atRisk: stats.at_risk || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Psychomotor Stats from API ────────────────────────
  const fetchPsychomotorStats = useCallback(async (params = {}) => {
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
      });
    } catch (error) {
      console.error('Failed to fetch psychomotor stats:', error);
    }
  }, []);

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    fetchAttendanceStats();
    fetchPsychomotorStats();
  }, [fetchAttendanceStats, fetchPsychomotorStats]);

  // ── Filter update callbacks from child tabs ─────────────────
  const handleAttendanceFilter = (classArmId) => {
    fetchAttendanceStats({ class_arm_id: classArmId || undefined });
  };

  const handlePsychomotorFilter = (classArmId) => {
    fetchPsychomotorStats({ class_arm_id: classArmId || undefined });
  };

  // ── Build available tabs based on permissions (like PackageManager.jsx) ──
  const availableTabs = useMemo(() => {
    const tabs = [];
    let counter = 1;

    if (can('manage.class_manager.attendance_psychomotor.setup')) {
      tabs.push({
        id: 'setup',
        label: `${counter}. Setup Affective & Psychomotor Domain`,
        component: <SetupAffectivePsychomotorTab />,
        analytics: null, // no analytics on setup tab
      });
      counter++;
    }

    tabs.push({
      id: 'mark-attendance',
      label: `${counter}. Mark Attendance`,
      component: (
        <MarkAttendanceTab
          metrics={attendanceMetrics}
          onFilter={handleAttendanceFilter}
        />
      ),
      analytics: <AttendanceAnalyticsCards metrics={attendanceMetrics} />,
    });
    counter++;

    tabs.push({
      id: 'mark-psychomotor',
      label: `${counter}. Mark Psychomotor`,
      component: (
        <MarkPsychomotorTab
          metrics={psychomotorMetrics}
          onFilter={handlePsychomotorFilter}
        />
      ),
      analytics: <PsychomotorAnalyticsCards metrics={psychomotorMetrics} />,
    });

    return tabs;
  }, [can, attendanceMetrics, psychomotorMetrics, handleAttendanceFilter, handlePsychomotorFilter]);

  // ── Ensure activeTab stays within bounds ────────────────────
  useEffect(() => {
    if (activeTab >= availableTabs.length) {
      setActiveTab(0);
    }
  }, [availableTabs.length, activeTab]);

  return (
    <PageContainer title="Attendance & Psychomotor" description="Mark attendance and psychomotor assessments">
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
                  py: 1.5,
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
      >
        <CardContent>
          {availableTabs.map((tab, idx) => (
            <TabPanel key={tab.id} value={activeTab} index={idx}>
              {tab.component}
            </TabPanel>
          ))}
        </CardContent>
      </ParentCard>
    </PageContainer>
  );
};

export default AttendancePsychomotor;
