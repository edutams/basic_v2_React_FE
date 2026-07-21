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
} from '@mui/icons-material';

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

const SubjectRegistration = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0); // 0 = General, 1 = Optional
  const [session] = useState('2025/2026');
  const [term] = useState('Third Term');

  // Derived stats
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
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '18px', md: '22px' } }}>
              Unity High School (junior), Ijoko
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <Box component="span" color="success.main" fontWeight={600}>
                Active Term:
              </Box>{' '}
              {session} | {term} | Week 13
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BarChartIcon sx={{ color: 'success.main', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {totalSubjects}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                REGISTERED SUBJECTS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Male 52 | Female 55
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
              bgcolor: isDark ? 'background.paper' : '#fff',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                LEARNER PROGRESS
              </Typography>
              <GridViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              98%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={98}
              color="success"
              sx={{ my: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" color="text.secondary">
              107 out of 109 Learners
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Main Section ───────────────────────────────────────── */}
      <ParentCard title={`Learners Subject Registration ${session} - ${term}`}>
        <Box sx={{ pt: 1 }}>
          {/* Tab Navigation */}
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

          {/* Tab Content */}
          {activeTab === 0 && <GeneralSubjectsTab />}
          {activeTab === 1 && <OptionalSubjectsTab />}
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default SubjectRegistration;
