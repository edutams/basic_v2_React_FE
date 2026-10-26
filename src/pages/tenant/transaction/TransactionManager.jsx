import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Grid, Typography, Paper, Skeleton, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
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

// A dedicated card for this page's KPI row — the shared `StatCard` stacks
// icon/label/value/subtitle in one left-aligned column, but this design is
// a genuine two-zone layout (icon+value+label on the left, a trend block
// pinned to the right edge), which that component's API can't produce.
// Scoped to this file only so the shared component (used elsewhere) stays
// untouched.
const TransactionStatCard = ({ icon: Icon, iconBg, iconColor, value, valueColor, label, rightContent, loading }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: '14px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {loading ? (
      <Skeleton variant="rounded" height={44} width="100%" />
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.15, color: valueColor || iconColor }} noWrap>
              {value}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25 }} noWrap>
              {label}
            </Typography>
          </Box>
        </Box>
        {rightContent && (
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>{rightContent}</Box>
        )}
      </Box>
    )}
  </Paper>
);

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

  // The right-pinned trend block on the Collected-Today/Week/Month cards —
  // a colored "↑/↓ N%" line plus a "vs {prior}" caption underneath,
  // computed from this same stats payload so it can never disagree with
  // the amount beside it.
  const trendBlock = (current, previous, comparisonLabel) => {
    const curr = Number(current || 0);
    const prev = Number(previous || 0);

    if (prev === 0) {
      return (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: curr > 0 ? 'success.main' : 'text.secondary' }}>
            {curr > 0 ? 'New' : '0%'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{comparisonLabel}</Typography>
        </>
      );
    }

    const change = ((curr - prev) / prev) * 100;
    const isUp = change >= 0;

    return (
      <>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: isUp ? 'success.main' : 'error.main' }}>
          {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{comparisonLabel}</Typography>
      </>
    );
  };

  return (
    <PageContainer title="Online Transaction" description="This is the Online transaction">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Online Transaction" items={BCrumb} />
        <Grid container spacing={2} sx={{ mb: 1.5, alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TransactionStatCard
              label="Collected Today"
              value={`₦${(stats?.today_total || 0).toLocaleString()}`}
              icon={IconWallet}
              iconBg={isDark ? 'rgba(22,163,74,0.18)' : '#DCFCE7'}
              iconColor="#16A34A"
              rightContent={trendBlock(stats?.today_total, stats?.yesterday_total, 'vs yesterday')}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TransactionStatCard
              label="This Week"
              value={`₦${(stats?.this_week_total || 0).toLocaleString()}`}
              icon={IconCalendarStats}
              iconBg={isDark ? 'rgba(37,99,235,0.18)' : '#DBEAFE'}
              iconColor="#2563EB"
              rightContent={trendBlock(stats?.this_week_total, stats?.last_week_total, 'vs last week')}
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <TransactionStatCard
              label="This Month"
              value={`₦${(stats?.this_month_total || 0).toLocaleString()}`}
              icon={IconChartBar}
              iconBg={isDark ? 'rgba(147,51,234,0.18)' : '#F3E8FF'}
              iconColor="#9333EA"
              rightContent={trendBlock(stats?.this_month_total, stats?.last_month_total, 'vs last month')}
              loading={statsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {tab === 0 ? (
              <TransactionStatCard
                label="Success Rate"
                value={`${stats?.success_rate ?? 0}%`}
                icon={IconUsers}
                iconBg={isDark ? 'rgba(217,119,6,0.18)' : '#FFEDD5'}
                iconColor="#D97706"
                rightContent={
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary', maxWidth: 110 }}>
                    {stats?.successful_count ?? 0} of {stats?.total_count ?? 0} transactions
                  </Typography>
                }
                loading={statsLoading}
              />
            ) : (
              <TransactionStatCard
                label="This Year"
                value={`₦${(stats?.this_year_total || 0).toLocaleString()}`}
                icon={IconWallet}
                iconBg={isDark ? 'rgba(217,119,6,0.18)' : '#FFEDD5'}
                iconColor="#D97706"
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
