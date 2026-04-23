import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import {
  IconSchool,
  IconVideo,
  IconArrowRight,
  IconBooks,
  IconCalendar,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import ParentCard from 'src/components/shared/ParentCard';
import { getSetupStats } from '../../context/TenantContext/services/tenant.service';

import SetUpClassesTab from './tabs/SetUpClassesTab';
import UploadLearnersTab from './tabs/UploadLearnersTab';
import UploadTeachersTab from './tabs/UploadTeachersTab';
import SetCalendarTab from './tabs/SetCalendarTab';

const StatCard = ({ count, label, loading }) => (
  <Paper
    sx={{
      borderRadius: 2,
      px: 3,
      py: 2,
      width: { xs: '100%', sm: 320 },
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconSchool size={22} color="#3B5BDB" />
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <Typography fontSize={26} fontWeight={700}>
            {count}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            {label}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

const CompleteSetup = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({ classes: 0, arms: 0, learners: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getSetupStats();
      const statsData = data.data || data;
      setStats({
        classes: statsData.classes || 0,
        arms: statsData.arms || 0,
        learners: statsData.learners || 0,
        teachers: statsData.teachers || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize={20}>
            School Administration
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            Manage classes, learners, teachers and calendar
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            borderRadius: 1,
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13} fontWeight={500}>
            Complete your setup to proceed
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* STAT CARDS */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={1}>
          <StatCard count={stats.classes} label="Classes" loading={loading} />
          <StatCard count={stats.arms} label="Arms" loading={loading} />
          <StatCard count={stats.learners} label="Learners" loading={loading} />
          <StatCard count={stats.teachers} label="Teachers" loading={loading} />
        </Stack>
      </Box>

      {/* TABS */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<IconCalendar size={18} />} iconPosition="start" label="Set Calendar" />
          <Tab icon={<IconBooks size={18} />} iconPosition="start" label="Set-Up Classes" />
          <Tab icon={<IconUserPlus size={18} />} iconPosition="start" label="Upload Learners" />
          <Tab icon={<IconUsers size={18} />} iconPosition="start" label="Upload Teachers" />
        </Tabs>
      </Box>

      <ParentCard sx={{ p: 0 }}>
        {activeTab === 0 && <SetCalendarTab onSaveAndContinue={() => {}} />}
        {activeTab === 1 && (
          <SetUpClassesTab onSaveAndContinue={() => {}} onClassArmsAdded={fetchStats} />
        )}
        {activeTab === 2 && (
          <UploadLearnersTab onSaveAndContinue={() => {}} onLearnerAdded={fetchStats} />
        )}
        {activeTab === 3 && (
          <UploadTeachersTab onSaveAndContinue={() => {}} onTeacherAdded={fetchStats} />
        )}
      </ParentCard>
    </Box>
  );
};

export default CompleteSetup;
