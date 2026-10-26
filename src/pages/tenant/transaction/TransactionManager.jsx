import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Grid, Typography, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import { IconWallet, IconCalendarStats, IconChartBar, IconUsers } from '@tabler/icons';
import Overview from './components/AllTransaction/Overview';
import Revenue from './components/TransactionByRevenue/Revenue';
import Settlement from './components/TransactionSettlement/Settlement';
import SettlementReconcillation from './components/TransactionSettlementReconcillation/SettlementReconcillation';
import {
  fetchTransactionValues,
  fetchRevenueTransactionValues,
  fetchBursarySettlementValues,
  fetchSettlementReconciliationValues,
} from '@/api/tenant/bursary/transactionApi';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Online Transaction',
  },
];

const TransactionManager = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      let res;
      if (tab === 0) {
        // Overview Tab
        res = await fetchTransactionValues();
      } else if (tab === 1) {
        // Revenue Tab
        res = await fetchRevenueTransactionValues();
      } else if (tab === 2) {
        // Settlement Tab
        res = await fetchBursarySettlementValues();
      } else if (tab === 3) {
        // Reconciliation Tab
        res = await fetchSettlementReconciliationValues();
      }
      setStats(res?.data || res);
    } catch (err) {
      console.error('Failed to load stats', err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [tab]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Shared by the Collected-Today/Week/Month cards — a colored "↑/↓ N% vs
  // {prior}" line under the amount, computed from this same stats payload
  // so it can never disagree with the amount beside it.
  const trendSubtitle = (current, previous, comparisonLabel) => {
    const curr = Number(current || 0);
    const prev = Number(previous || 0);
    if (prev === 0) {
      return curr > 0 ? (
        <Typography component="span" sx={{ fontSize: 11, fontWeight: 700, color: 'success.main' }}>
          New activity {comparisonLabel}
        </Typography>
      ) : null;
    }
    const change = ((curr - prev) / prev) * 100;
    const isUp = change >= 0;

    return (
      <Typography
        component="span"
        sx={{ fontSize: 11, fontWeight: 700, color: isUp ? 'success.main' : 'error.main' }}
      >
        {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(0)}% {comparisonLabel}
      </Typography>
    );
  };

  return (
    <PageContainer title="Online Transaction" description="This is the Online transaction">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Online Transaction" items={BCrumb} />
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              label="Collected Today"
              count={`₦${(stats?.today_total || 0).toLocaleString()}`}
              icon={IconWallet}
              colorIndex={1}
              align="left"
              subtitle={trendSubtitle(stats?.today_total, stats?.yesterday_total, 'vs yesterday')}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              label="This Week"
              count={`₦${(stats?.this_week_total || 0).toLocaleString()}`}
              icon={IconCalendarStats}
              colorIndex={0}
              align="left"
              subtitle={trendSubtitle(stats?.this_week_total, stats?.last_week_total, 'vs last week')}
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              label="This Month"
              count={`₦${(stats?.this_month_total || 0).toLocaleString()}`}
              icon={IconChartBar}
              colorIndex={2}
              align="left"
              subtitle={trendSubtitle(stats?.this_month_total, stats?.last_month_total, 'vs last month')}
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            {tab === 0 ? (
              <StatCard
                label="Success Rate"
                count={`${stats?.success_rate ?? 0}%`}
                icon={IconUsers}
                colorIndex={3}
                align="left"
                subtitle={
                  <Typography component="span" sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
                    {stats?.successful_count ?? 0} of {stats?.total_count ?? 0} transactions
                  </Typography>
                }
                loading={statsLoading}
              />
            ) : (
              <StatCard
                label="This Year"
                count={`₦${(stats?.this_year_total || 0).toLocaleString()}`}
                icon={IconWallet}
                colorIndex={3}
                align="left"
                loading={statsLoading}
              />
            )}
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Box
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            overflowX: 'auto',
            '& .MuiTabs-root': {
              minWidth: '300px',
            },
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="online management tabs"
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
          >
            <Tab
              label="Transactions"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Revenue"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Settlement"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Reconcillation"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
          </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
          <Overview />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Revenue />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Settlement />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <SettlementReconcillation />
        </TabPanel>
      </Box>
    </PageContainer>
  );
};

export default TransactionManager;
