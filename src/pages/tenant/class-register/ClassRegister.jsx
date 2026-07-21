import React, { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import SingleArmView from './components/SingleArmView';
import MultipleArmView from './components/MultipleArmView';
import ClassEnrollmentCard from './components/ClassEnrollmentCard';
import EnrollmentBreakdownModal from './components/EnrollmentBreakdownModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Class Register' },
];

const ClassRegister = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [selectedEnrollmentClass, setSelectedEnrollmentClass] = useState(null);

  // Dynamic stats (will be populated from API in the future)
  const [totalStudentsCount] = useState(1284);
  const [maleCount] = useState(642);
  const [femaleCount] = useState(642);

  return (
    <PageContainer title="Class Register" description="Manage class register and student enrollments">
      <Breadcrumb title="Class Register" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Students Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              bgcolor: '#1a2e4a',
              color: '#fff',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 0 20px rgba(0,0,0,.10)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.1 }}>
              <PeopleIcon sx={{ fontSize: 150, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                Total Students
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ my: 1, lineHeight: 1, fontSize: { xs: 36, md: 44 } }}>
                {totalStudentsCount.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ zIndex: 1, mt: 2 }}>
              <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>MALE</Typography>
                  <Typography variant="h6" fontWeight={700}>{maleCount.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>FEMALE</Typography>
                  <Typography variant="h6" fontWeight={700}>{femaleCount.toLocaleString()}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  +12% from last term
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Class Enrollment Breakdown */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ClassEnrollmentCard onClassClick={setSelectedEnrollmentClass} />
        </Grid>
      </Grid>

      {/* ── Tabs & Content ─────────────────────────────────────── */}
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
              <Tab label="Single Arm View" />
              <Tab label="Multiple Arm View" />
            </Tabs>
          </Box>
        }
      >
        {activeTab === 0 && <SingleArmView />}
        {activeTab === 1 && <MultipleArmView />}
      </ParentCard>

      {/* ── Enrollment Breakdown Modal ───────────────────────── */}
      <EnrollmentBreakdownModal
        selectedClass={selectedEnrollmentClass}
        onClose={() => setSelectedEnrollmentClass(null)}
      />
    </PageContainer>
  );
};

export default ClassRegister;
