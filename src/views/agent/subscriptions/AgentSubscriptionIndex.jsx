import React, { useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AgentSubscriptionList from './AgentSubscriptionList';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Subscriptions',
  },
];

const AgentSubscriptionIndex = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Tenant Subscriptions" description="Manage tenant subscription requests">
      <Breadcrumb title="Tenant Subscriptions" items={BCrumb} />
      <ParentCard title="Manage Subscriptions">
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="subscription tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Requests" id="tab-0" />
              <Tab label="Pending" id="tab-1" />
              <Tab label="Active" id="tab-2" />
              <Tab label="Expired" id="tab-3" />
            </Tabs>
          </Box>
          <Box>
            {value === 0 && <AgentSubscriptionList status="" />}
            {value === 1 && <AgentSubscriptionList status="pending" />}
            {value === 2 && <AgentSubscriptionList status="active" />}
            {value === 3 && <AgentSubscriptionList status="expired" />}
          </Box>
        </Box>
      </ParentCard>
    </PageContainer>
  );
};

export default AgentSubscriptionIndex;
