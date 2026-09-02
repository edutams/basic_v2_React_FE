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
  Tabs,
  Tab,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
} from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';

import SingleArmView from './components/SingleArmView';
import MultipleArmView from './components/MultipleArmView';
import ClassEnrollmentCard from './components/ClassEnrollmentCard';
import EnrollmentBreakdownModal from './components/EnrollmentBreakdownModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Class Register' },
];

const schemeMap = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

const TotalStudentsCard = ({ totalStudentsCount, maleCount, femaleCount, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = schemeMap[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: '14px',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#94a3b8',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        },
        height: '100%',
        maxHeight: 250,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -15,
          bottom: -15,
          opacity: 0.08,
          color: scheme.color,
        }}
      >
        <PeopleIcon sx={{ fontSize: 130 }} />
      </Box>

      <Box sx={{ zIndex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'rgba(255,255,255,0.7)' : scheme.color,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 700,
          }}
        >
          Total Student
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={60} height={40} sx={{ my: 0.5 }} />
        ) : (
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              my: 0.5,
              lineHeight: 1,
              fontSize: { xs: 26, md: 32 },
              color: isDark ? '#fff' : scheme.color,
            }}
          >
            {totalStudentsCount.toLocaleString()}
          </Typography>
        )}
      </Box>

      <Box sx={{ zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : '#4B5563',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            >
              MALE
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: isDark ? '#fff' : '#1a1a1a', lineHeight: 1.1 }}
            >
              {loading ? <Skeleton variant="text" width={35} height={28} /> : maleCount.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : '#4B5563',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            >
              FEMALE
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: isDark ? '#fff' : '#1a1a1a', lineHeight: 1.1 }}
            >
              {loading ? <Skeleton variant="text" width={35} height={28} sx={{ ml: 'auto' }} /> : femaleCount.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

const ClassRegister = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEnrollmentClass, setSelectedEnrollmentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classFilterData, setClassFilterData] = useState(null);

  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState([]);

  const handleClassCardClick = (cls) => {
    setActiveTab(0);

    setClassFilterData({
      programme_id: cls.programme_id,
      class_id: cls.class_id,
      timestamp: Date.now(),
    });

    setSelectedEnrollmentClass(cls);
  };

  const fetchEnrollmentStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classRegisterApi.getEnrollmentStats();
      if (res.data?.status && res.data?.data) {
        const stats = res.data.data;
        setTotalStudentsCount(stats.total_students || 0);
        setMaleCount(stats.male_count || 0);
        setFemaleCount(stats.female_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch enrollment stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnrollmentBreakdown = useCallback(async () => {
    try {
      const res = await classRegisterApi.getClassEnrollmentBreakdown();
      if (res.data?.status && res.data?.data) {
        setEnrollmentData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollment breakdown:', error);
    }
  }, []);

  useEffect(() => {
    fetchEnrollmentStats();
    fetchEnrollmentBreakdown();
  }, [fetchEnrollmentStats, fetchEnrollmentBreakdown]);

  return (
    <PageContainer title="Class Register" description="Manage class register and student enrollments">
      <Breadcrumb title="Class Register" items={BCrumb} />

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 2 }}>
          <TotalStudentsCard
            totalStudentsCount={totalStudentsCount}
            maleCount={maleCount}
            femaleCount={femaleCount}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 10 }}>
          <ClassEnrollmentCard
            enrollmentData={enrollmentData}
            onClassClick={handleClassCardClick}
            loading={loading}
          />
        </Grid>
      </Grid>

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
        {activeTab === 0 && (
          <SingleArmView
            classFilterData={classFilterData}
            onEnrollmentChange={() => {
              fetchEnrollmentStats();
              fetchEnrollmentBreakdown();
            }}
          />
        )}
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
