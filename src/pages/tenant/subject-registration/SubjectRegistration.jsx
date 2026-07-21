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
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  GridView as GridViewIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { getStatCardColor } from '@/utils/statCardColors';

import GeneralSubjectsTab from './components/GeneralSubjectsTab';
import OptionalSubjectsTab from './components/OptionalSubjectsTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Subject Registration' },
];

const GENERAL_SUBJECTS_DATA = [
  { id: 'bs', name: 'BUSINESS STUDIES', count: 107 },
  { id: 'crs', name: 'CHRISTIAN RELIGIOUS STUDIES', count: 57 },
  { id: 'cca', name: 'CULTURE & CREATIVE ARTS', count: 107 },
  { id: 'dt', name: 'DIGITAL TECHNOLOGIES', count: 107 },
  { id: 'eng', name: 'ENGLISH LANGUAGE', count: 107 },
  { id: 'fr', name: 'FRENCH LANGUAGE', count: 0 },
  { id: 'math', name: 'MATHEMATICS', count: 107 },
  { id: 'bsc', name: 'BASIC SCIENCE', count: 104 },
];

const OPTIONAL_SUBJECTS_DATA = [
  { id: 'music', name: 'MUSIC', count: 42 },
  { id: 'home_ec', name: 'HOME ECONOMICS', count: 65 },
  { id: 'agric', name: 'AGRICULTURAL SCIENCE', count: 80 },
  { id: 'pru', name: 'ARABIC LANGUAGE', count: 15 },
];

// ── Theme-aware stat card component ─────────────────────────────
const AnalyticsStatCard = ({ icon: Icon, value, label, subtitle, colorName, colorIndex = 0, children }) => {
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
      <Box>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: isDark ? '#fff' : colors.accentColor }}
        >
          {value}
        </Typography>
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
        {subtitle && (
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Box>
    </Paper>
  );
};

// ── Learner Progress Card (uses getStatCardColor) ──────────────
const LearnerProgressCard = ({ theme }) => {
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
          LEARNER PROGRESS
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
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ color: isDark ? '#fff' : colors.accentColor }}
      >
        98%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={98}
        color="success"
        sx={{ my: 1, height: 6, borderRadius: 3 }}
      />
      <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>
        107 out of 109 Learners
      </Typography>
    </Paper>
  );
};

// ── Main Page ───────────────────────────────────────────────────
const SubjectRegistration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [session] = useState('2025/2026');
  const [term] = useState('Third Term');

  const totalSubjects = GENERAL_SUBJECTS_DATA.length + OPTIONAL_SUBJECTS_DATA.length;

  return (
    <PageContainer title="Subject Registration" description="Manage learner subject registration">
      <Breadcrumb title="Subject Registration" items={BCrumb} />

      {/* ── Analytics Header ──────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              background: isDark ? theme.palette.background.paper : '#fff',
              border: isDark
                ? '1px solid rgba(255,255,255,0.12)'
                : `1px solid ${theme.palette.grey[200]}`,
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.35)'
                : '0 4px 20px rgba(0,0,0,0.07)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1e4db7 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SchoolIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '18px', md: '22px' } }}>
                Unity High School (junior), Ijoko
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              <Box component="span" color="success.main" fontWeight={600}>
                Active Term:
              </Box>{' '}
              {session} | {term} | Week 13
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <AnalyticsStatCard
            icon={BarChartIcon}
            value={totalSubjects}
            label="Registered Subjects"
            subtitle="Male 52 | Female 55"
            colorName="success"
            colorIndex={1}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <LearnerProgressCard theme={theme} isDark={isDark} />
        </Grid>
      </Grid>

      {/* ── Main Section ───────────────────────────────────────── */}
      <ParentCard title={`Learners Subject Registration ${session} - ${term}`}>
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
