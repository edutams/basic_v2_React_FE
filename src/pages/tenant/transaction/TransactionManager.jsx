import React, { useState } from 'react';


import {
  Box,
  Tabs,
  Tab,
  Grid,
  useTheme,


} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from './components/StatCard';
import { IconWallet } from '@tabler/icons';
import Overview from './components/AllTransaction/Overview';
import Revenue from './components/TransactionByRevenue/Revenue';
import SettlementReconcillation from './components/TransactionSettlementReconcillation/SettlementReconcillation';



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
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };



  return (
    <PageContainer title="Online Transaction" description="This is the Online transaction">
      <Box sx={{ mt: 1 }}>
        <Breadcrumb title="Online Transaction" items={BCrumb} />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              title="Transaction Week"
              value="₦7,000,234.00"
              icon={IconWallet}
              color={'#5CB979'}
              lightColor={'#E3F2FD'}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              title="Transaction Week"
              value="₦7,000,234.00"
              icon={IconWallet}
              color={'#EF5350'}
              lightColor={'#FDECEA'}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              title="Transaction This Month"
              value="₦7,000,234.00"
              icon={IconWallet}
              color={'#273DA9'}
              lightColor={'#E3F2FD'}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 3, md: 3 }}>
            <StatCard
              title="Transaction This Year"
              value="₦7,000,234.00"
              icon={IconWallet}
              color={'#F59E0B'}
              lightColor={'#FEF3C7'}
            />
          </Grid>


        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="online management tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Overview"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Revenue Transactions"
              sx={{ fontWeight: 600, textTransform: 'none', fontSize: '15px' }}
            />
            <Tab
              label="Settlement Reconcillation"
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
          <SettlementReconcillation />
        </TabPanel>
      </Box>
    </PageContainer>
  );
};

export default TransactionManager;
