import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { IconCheck, IconSchool, IconBuilding, IconBuildingBank } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import StatCard from '@/components/shared/StatCard';
import Chart from 'react-apexcharts';
import axios from '@/api/landlord/landlord_api';
import agentApi from '@/api/landlord/organizations/agent';
import SubscriptionSchoolsModal from './SubscriptionSchoolsModal';

const tooltipTexts = {
  totalOrgs: 'Total number of organizations (agents) registered under this account.',
  active: 'Schools with an active, paid subscription that is currently in use.',
  secondary: 'Subscription requests from secondary school types.',
  primary: 'Subscription requests from primary school types.',
};

const SubscriptionModal = ({ open, onClose }) => {
  const [stats, setStats] = useState({ total: 0, active: 0, secondary: 0, primary: 0 });
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const [schoolsModalOpen, setSchoolsModalOpen] = useState(false);
  const [schoolsCategory, setSchoolsCategory] = useState('total');

  const fetchData = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get('/v1/landlord/subscriptions/stats/school-type'),
        agentApi.getAnalytics(),
      ]);

      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }

      if (analyticsRes.status && analyticsRes.data) {
        setTotalOrgs(analyticsRes.data.totalOrganizations ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch subscription stats', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  const handleStatCardClick = (category) => {
    setSchoolsCategory(category);
    setSchoolsModalOpen(true);
  };

  const statCards = [
    {
      label: 'Total Organizations',
      count: totalOrgs,
      icon: IconBuildingBank,
      colorIndex: 0,
      tooltip: tooltipTexts.totalOrgs,
      category: 'total',
    },
    {
      label: 'Active',
      count: stats.active,
      icon: IconCheck,
      colorIndex: 1,
      tooltip: tooltipTexts.active,
      category: 'active',
    },
    {
      label: 'Secondary',
      count: stats.secondary,
      icon: IconSchool,
      colorIndex: 3,
      tooltip: tooltipTexts.secondary,
      category: 'secondary',
    },
    {
      label: 'Primary',
      count: stats.primary,
      icon: IconBuilding,
      colorIndex: 2,
      tooltip: tooltipTexts.primary,
      category: 'primary',
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
    theme: { mode: 'light' },
  };

  const chartSeries = [stats.active || 0, stats.secondary || 0, stats.primary || 0];

  return (
    <>
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
          <Grid container spacing={1.5} mb={3}>
            {statCards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
                <StatCard
                  count={card.count}
                  label={card.label}
                  icon={card.icon}
                  colorIndex={card.colorIndex}
                  loading={statsLoading}
                  tooltip={card.tooltip}
                  tooltipPlacement="top"
                  onClick={() => handleStatCardClick(card.category)}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ p: 3, borderRadius: 2 }}>
            {statsLoading ? (
              <Box sx={{ height: 300 }} />
            ) : (
              <Chart options={chartOptions} series={chartSeries} type="donut" height={300} />
            )}
          </Box>
        </Box>
      </ReusableModal>

      <SubscriptionSchoolsModal
        open={schoolsModalOpen}
        onClose={() => setSchoolsModalOpen(false)}
        category={schoolsCategory}
      />
    </>
  );
};

export default SubscriptionModal;
