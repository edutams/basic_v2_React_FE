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
import { getStatCardColor } from '@/utils/statCardColors';

import SingleArmView from './components/SingleArmView';
import MultipleArmView from './components/MultipleArmView';
import ClassEnrollmentCard from './components/ClassEnrollmentCard';
import EnrollmentBreakdownModal from './components/EnrollmentBreakdownModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Class Register' },
];

// ── Local Stat Card using getStatCardColor ──────────────────────
const TotalStudentsCard = ({ totalStudentsCount, maleCount, femaleCount }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('primary', 0, isDark, theme);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: isDark ? theme.palette.background.paper : colors.cardBg,
        border: isDark
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${colors.borderColor}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0,0,0,0.35)'
          : '0 4px 20px rgba(0,0,0,0.07)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -15,
          bottom: -15,
          opacity: 0.08,
          color: colors.accentColor,
        }}
      >
        <PeopleIcon sx={{ fontSize: 150 }} />
      </Box>

      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.7)' : colors.accentColor,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 700,
          }}
        >
          Total Students
        </Typography>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            my: 1,
            lineHeight: 1,
            fontSize: { xs: 36, md: 44 },
            color: isDark ? '#fff' : colors.accentColor,
          }}
        >
          {totalStudentsCount.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ zIndex: 1, mt: 2 }}>
        <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : '#4B5563',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              MALE
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: isDark ? '#fff' : '#1a1a1a' }}
            >
              {maleCount.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : '#4B5563',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              FEMALE
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: isDark ? '#fff' : '#1a1a1a' }}
            >
              {femaleCount.toLocaleString()}
            </Typography>
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
  );
};

// ── Main Page ───────────────────────────────────────────────────
const ClassRegister = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEnrollmentClass, setSelectedEnrollmentClass] = useState(null);

  const [totalStudentsCount] = useState(1284);
  const [maleCount] = useState(642);
  const [femaleCount] = useState(642);

  return (
    <PageContainer title="Class Register" description="Manage class register and student enrollments">
      <Breadcrumb title="Class Register" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TotalStudentsCard
            totalStudentsCount={totalStudentsCount}
            maleCount={maleCount}
            femaleCount={femaleCount}
          />
        </Grid>
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

      <EnrollmentBreakdownModal
        selectedClass={selectedEnrollmentClass}
        onClose={() => setSelectedEnrollmentClass(null)}
      />
    </PageContainer>
  );
};

export default ClassRegister;
