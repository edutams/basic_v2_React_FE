import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  useTheme,
  Skeleton,
  Grid,
} from '@mui/material';
import { IconCreditCard, IconCheck, IconSchool, IconBuilding } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import Chart from 'react-apexcharts';
import axios from '@/api/landlord/landlord_api';

const SubscriptionModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [stats, setStats] = useState({ total: 0, active: 0, secondary: 0, primary: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get('/v1/landlord/subscriptions/stats/school-type');
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription stats', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchStats();
    }
  }, [open, fetchStats]);

  const statCards = [
    {
      label: 'Total Subscriptions',
      value: stats.total,
      icon: <IconCreditCard size={22} />,
      bg: '#DBEAFE',
      color: '#2563EB',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: <IconCheck size={22} />,
      bg: '#DCFCE7',
      color: '#16A34A',
    },
    {
      label: 'Secondary',
      value: stats.secondary,
      icon: <IconSchool size={22} />,
      bg: '#FEF3C7',
      color: '#D97706',
    },
    {
      label: 'Primary',
      value: stats.primary,
      icon: <IconBuilding size={22} />,
      bg: '#F3E8FF',
      color: '#9333EA',
    },
  ];

  const chartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
    },
    labels: ['Active', 'Secondary', 'Primary'],
    colors: ['#16A34A', '#D97706', '#9333EA'],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 600,
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => stats.total || 0,
            },
          },
        },
      },
    },
    theme: { mode: theme.palette.mode },
  };

  const chartSeries = [stats.active || 0, stats.secondary || 0, stats.primary || 0];

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="large"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Subscriptions Overview
        </Typography>
      }
    >
      <Box>
        {/* Stat cards */}
        <Grid container spacing={2} mb={3}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {statsLoading ? <Skeleton width={60} /> : card.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Chart */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {statsLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <Chart options={chartOptions} series={chartSeries} type="donut" height={300} />
          )}
        </Paper>
      </Box>
    </ReusableModal>
  );
};

export default SubscriptionModal;
