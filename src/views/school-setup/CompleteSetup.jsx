import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, Button, Stack, Paper, Tabs, Tab, Skeleton } from '@mui/material';
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

// Tab Components
import SetUpClassesTab from './tabs/SetUpClassesTab';
import UploadLearnersTab from './tabs/UploadLearnersTab';
import UploadTeachersTab from './tabs/UploadTeachersTab';
import SetCalendarTab from './tabs/SetCalendarTab';
import { getSetupStats } from '../../context/TenantContext/services/tenant.service';

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card — reusable
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <Paper
    sx={{
      borderRadius: 2,
      px: 3,
      py: 2,
      width: { xs: '100%', sm: 220 },
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#E3E8F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={22} color="#3B5BDB" />
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      {loading ? (
        <Skeleton variant="text" width={40} height={36} sx={{ mx: 'auto' }} />
      ) : (
        <Typography fontSize={26} fontWeight={700}>
          {value ?? 0}
        </Typography>
      )}
      <Typography fontSize={14} color="#6B7280">
        {label}
      </Typography>
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const CompleteSetup = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getSetupStats();
      setStats(data);

      // If stage data tells us a stage is already complete, jump to the
      // next incomplete tab automatically on first load.
      if (data?.stage) {
        const { stage1, stage2, stage3 } = data.stage;
        if (stage1 === '1' && stage2 === '0') setActiveTab(1);
        else if (stage2 === '1' && stage3 === '0') setActiveTab(2);
        else if (stage3 === '1') setActiveTab(3);
      }
    } catch {
      // Non-fatal: stats will just show 0
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Tab navigation ─────────────────────────────────────────────────────────
  const handleSaveAndContinue = () => {
    fetchStats(); // refresh stats after each save
    if (activeTab < 3) setActiveTab((prev) => prev + 1);
  };

  // ── Stage-based tab locking ────────────────────────────────────────────────
  // A tab is disabled if the previous stage hasn't been completed yet.
  const isTabDisabled = (tabIndex) => {
    if (!stats?.stage) return tabIndex > 0; // lock all except first until loaded
    const { stage1, stage2, stage3 } = stats.stage;
    if (tabIndex === 1) return stage1 !== '1';
    if (tabIndex === 2) return stage2 !== '1';
    if (tabIndex === 3) return stage3 !== '1';
    return false;
  };

  const statCards = [
    { icon: IconSchool, label: 'Classes', key: 'classes' },
    { icon: IconBooks, label: 'Arms', key: 'arms' },
    { icon: IconUsers, label: 'Learners', key: 'learners' },
    { icon: IconUsers, label: 'Teachers', key: 'teachers' },
  ];

  return (
    <Box>
      {/* PAGE HEADER */}
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
          <Typography fontSize={13} color="#8A8D91">
            Manage classes, learners, teachers and calendar
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            borderRadius: 1,
            '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' },
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13} fontWeight={500}>
            Complete your setup to proceed
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* STATS CARDS */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={1} flexWrap="wrap">
          {statCards.map(({ icon, label, key }) => (
            <StatCard
              key={key}
              icon={icon}
              label={label}
              value={stats?.[key]}
              loading={statsLoading}
            />
          ))}
        </Stack>
      </Box>

      {/* TABS */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, v) => !isTabDisabled(v) && setActiveTab(v)}>
          <Tab icon={<IconBooks size={18} />} iconPosition="start" label="Set-Up Classes" />
          <Tab
            icon={<IconUserPlus size={18} />}
            iconPosition="start"
            label="Upload Learners"
            disabled={isTabDisabled(1)}
          />
          <Tab
            icon={<IconUsers size={18} />}
            iconPosition="start"
            label="Upload Teachers"
            disabled={isTabDisabled(2)}
          />
          <Tab
            icon={<IconCalendar size={18} />}
            iconPosition="start"
            label="Set Calendar"
            disabled={isTabDisabled(3)}
          />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      <ParentCard sx={{ p: 0 }}>
        {activeTab === 0 && (
          <SetUpClassesTab onSaveAndContinue={handleSaveAndContinue} onStatsRefresh={fetchStats} />
        )}
        {activeTab === 1 && (
          <UploadLearnersTab
            onSaveAndContinue={handleSaveAndContinue}
            onStatsRefresh={fetchStats}
          />
        )}
        {activeTab === 2 && (
          <UploadTeachersTab
            onSaveAndContinue={handleSaveAndContinue}
            onStatsRefresh={fetchStats}
          />
        )}
        {activeTab === 3 && (
          <SetCalendarTab onSaveAndContinue={handleSaveAndContinue} onStatsRefresh={fetchStats} />
        )}
      </ParentCard>
    </Box>
  );
};

export default CompleteSetup;
