import React, { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';

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
  const [activeTab, setActiveTab] = useState(0); // 0 = Mark Attendance, 1 = Mark Psychomotor

  // ── Metrics that respond to filter changes ──────────────────
  const [attendanceMetrics, setAttendanceMetrics] = useState({
    daysOpen: 97,
    weekRate: 56,
    termRate: 44,
    totalAbsentees: 72,
    atRisk: 1,
  });

  const [psychomotorMetrics, setPsychomotorMetrics] = useState({
    avgAffective: 4.2,
    avgPsychomotor: 3.8,
    needingSupport: 12,
    maleRating: 4.1,
    femaleRating: 4.3,
  });

  // ── Filter update callbacks from child tabs ─────────────────
  const handleAttendanceFilter = (programme) => {
    const isJS = programme === 'Junior Secondary';
    setAttendanceMetrics({
      daysOpen: 97,
      weekRate: isJS ? 56 : 64,
      termRate: isJS ? 44 : 52,
      totalAbsentees: isJS ? 72 : 48,
      atRisk: isJS ? 1 : 0,
    });
  };

  const handlePsychomotorFilter = (term) => {
    const isThirdTerm = term === 'Third Term';
    setPsychomotorMetrics({
      avgAffective: isThirdTerm ? 4.2 : 4.0,
      avgPsychomotor: isThirdTerm ? 3.8 : 3.6,
      needingSupport: isThirdTerm ? 12 : 8,
      maleRating: 4.1,
      femaleRating: 4.3,
    });
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
