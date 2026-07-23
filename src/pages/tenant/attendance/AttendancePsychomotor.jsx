import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';

import MarkAttendanceTab from './components/MarkAttendanceTab';
import MarkPsychomotorTab from './components/MarkPsychomotorTab';
import AttendanceAnalyticsCards from './components/AttendanceAnalyticsCards';
import PsychomotorAnalyticsCards from './components/PsychomotorAnalyticsCards';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Attendance & Psychomotor' },
];

const AttendancePsychomotor = () => {
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

  return (
    <PageContainer title="Attendance & Psychomotor" description="Mark attendance and psychomotor assessments">
      <Breadcrumb title="Attendance & Psychomotor" items={BCrumb} />

      {/* ── Dynamic Analytics Cards ─────────────────────────── */}
      {activeTab === 0 ? (
        <AttendanceAnalyticsCards
          metrics={attendanceMetrics}
        />
      ) : (
        <PsychomotorAnalyticsCards metrics={psychomotorMetrics} />
      )}

      {/* ── Main Section with Tabs ─────────────────────────────── */}
      <ParentCard
        title={
          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
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
              <Tab label="1. Mark Attendance" />
              <Tab label="2. Mark Psychomotor" />
            </Tabs>
          </Box>
        }
      >
        {activeTab === 0 && (
          <MarkAttendanceTab
            metrics={attendanceMetrics}
            onFilter={handleAttendanceFilter}
          />
        )}
        {activeTab === 1 && (
          <MarkPsychomotorTab
            metrics={psychomotorMetrics}
            onFilter={handlePsychomotorFilter}
          />
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default AttendancePsychomotor;
