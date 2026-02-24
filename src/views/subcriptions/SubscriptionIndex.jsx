import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ManageSubscriptions from './manage-subcription';
import SubscriptionHistory from './subscription-history';

const SubscriptionIndex = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Subscriptions',
    },
  ];

  return (
    <PageContainer title="Subscriptions" description="Manage your subscriptions and history">
      <Breadcrumb title="Subscriptions" items={BCrumb} />
      
      <Box sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="subscription tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Manage Subscription" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Subscription History" id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {value === 0 && (
            <Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0">
              <ManageSubscriptions />
            </Box>
          )}
          {value === 1 && (
            <Box role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1">
              <SubscriptionHistory />
            </Box>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default SubscriptionIndex;
