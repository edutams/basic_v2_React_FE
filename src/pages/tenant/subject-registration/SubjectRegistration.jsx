import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';

import GeneralSubjectsTab from './components/GeneralSubjectsTab';
import OptionalSubjectsTab from './components/OptionalSubjectsTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Subject Registration' },
];

// ── Theme-aware stat card component ─────────────────────────────
const AnalyticsStatCard = ({ icon: Icon, value, label, colorName, colorIndex = 0, loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor(colorName, colorIndex, isDark, theme);

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
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: colors.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isDark
            ? '0 6px 16px rgba(0,0,0,.3)'
            : `0 8px 22px -2px ${colors.iconGlow}`,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 26, color: colors.iconColor }} />}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : colors.accentColor }}
          >
            {value}
          </Typography>
        )}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563',
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// ── Learner Progress Card (uses getStatCardColor) ──────────────
const LearnerProgressCard = ({ progress = 0, details = '', loading = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = getStatCardColor('info', 2, isDark, theme);

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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.72)' : '#4B5563',
            textTransform: 'uppercase',
          }}
        >
          LEARNERS REGISTRATION
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            background: colors.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GridViewIcon sx={{ fontSize: 14, color: colors.iconColor }} />
        </Box>
      </Stack>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: isDark ? '#fff' : colors.accentColor }}
          >
            {progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              my: 1,
              height: 7,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.15)' : '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.accentColor,
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>
            {details}
          </Typography>
        </>
      )}
    </Paper>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const SubjectRegistration = () => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Use a general stats endpoint - for now show total counts
      const res = await subjectRegistrationApi.getSubjects();
      if (res.data?.status && res.data?.data) {
        const subjects = res.data.data;
        setTotalSubjects(subjects.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch subject stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <PageContainer title="Subject Registration" description="Manage learner subject registration">
      <Breadcrumb title="Subject Registration" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <AnalyticsStatCard
            icon={BarChartIcon}
            value={totalSubjects}
            label="Total Subjects"
            colorName="success"
            colorIndex={1}
            loading={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <LearnerProgressCard
            progress={completionPercent}
            details={registeredCount > 0 ? `${registeredCount} registrations out of ${totalLearners} learners` : 'Select class to view progress'}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Main Section ───────────────────────────────────────── */}
      <ParentCard title="Learners Subject Registration">
        <Box sx={{ pt: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
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
              <Tab label="1. General Subjects" />
              <Tab label="2. Optional Subjects" />
            </Tabs>
          </Box>
          {activeTab === 0 && <GeneralSubjectsTab />}
          {activeTab === 1 && <OptionalSubjectsTab />}
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default SubjectRegistration;
