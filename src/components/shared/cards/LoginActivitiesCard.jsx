import React, { useState, useEffect } from 'react';
import { Box, Paper, Stack, Typography, Skeleton, useTheme } from '@mui/material';
import { IconChartBar } from '@tabler/icons-react';
import activityLogApi from '@/api/landlord/activity-log/activityLogApi';
import LoggedInUsersModal from '@/pages/landlord/views/agent/components/LoggedInUsersModal';
import ViewUsersListModal from '@/pages/landlord/views/agent/components/ViewUsersListModal';

// Self-contained "Login Activities (30 days)" card — fetches its own data and
// owns the drill-down modal chain (LoggedInUsersModal -> ViewUsersListModal),
// so any page can just drop this in instead of re-wiring the same
// state/fetch/modal chain per page.
const LoginActivitiesCard = ({ sx }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loginActivities, setLoginActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewUsersOpen, setViewUsersOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLoginActivities = async () => {
      setLoading(true);
      try {
        const res = await activityLogApi.getLoginActivities30Days();
        if (!cancelled && res.status) {
          setLoginActivities(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch login activities', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLoginActivities();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayItems =
    loginActivities.length > 0
      ? loginActivities
      : [
          { label: 'Staffs', value: 0 },
          { label: 'Learners', value: 0 },
          { label: 'Agents', value: 0 },
          { label: 'Total', value: 0 },
        ];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: '10px !important',
          borderRadius: '14px',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#94a3b8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          },
          ...sx,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Login Activities
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#F3E8FF',
              color: isDark ? '#fff' : '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { opacity: 0.85 },
            }}
            onClick={() => setModalOpen(true)}
          >
            <IconChartBar size={18} color="currentColor" />
          </Box>
        </Box>

        <Stack spacing={0.5}>
          {loading
            ? [...Array(4)].map((_, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={30} height={20} />
                </Stack>
              ))
            : displayItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.5,
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: isDark ? '#ffffff' : '#9333EA' }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
        </Stack>
      </Paper>

      <LoggedInUsersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onViewUserList={(row, filters) => {
          setSelectedTenant(row);
          setSelectedFilters(filters);
          setViewUsersOpen(true);
        }}
        stats={loginActivities}
      />
      <ViewUsersListModal
        open={viewUsersOpen}
        onClose={() => setViewUsersOpen(false)}
        schoolId={selectedTenant?.id}
        schoolName={selectedTenant?.school}
        filters={selectedFilters}
      />
    </>
  );
};

export default LoginActivitiesCard;
