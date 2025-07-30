import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab,
  TextField,
  Button,
  Stack
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ManageSessions from 'src/components/school/components/ManageSessions';
import ManageWeeks from 'src/components/school/components/ManageWeeks';
import HolidayModal from 'src/components/school/components/HolidayModal';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'School Dashboard',
  },
  {
    title: 'Session/Week Manager',
  },
];

const SessionWeekManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [modalActionType, setModalActionType] = useState('');

  const handleOpenModal = (actionType) => {
    setModalActionType(actionType);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalActionType('');
  };

  const handleRefresh = () => {
    // Add your refresh logic here
    console.log('Refreshing data...');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer title="Session/Week Manager" description="Manage academic sessions and weeks">
      <Breadcrumb title="Session/Week Manager" items={BCrumb} />
      
      <Card variant="outlined">
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={600}>
              Session/Week Manager
            </Typography>
            <Button variant="contained" size="small"   sx={{ backgroundColor: 'black', color: '#fff', '&:hover': { backgroundColor: 'grey.700' } }}
              onClick={() => handleOpenModal('holiday')}
            >
              Set Holiday
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight={600}>
                      Manage Sessions
                    </Typography>
                    <Button variant="contained" color="primary" size="small">
                      {activeTab === 0 ? 'Add Session' : 'Set Session/Term'}
                    </Button>
                  </Box>
                  
                  <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="All Sessions" />
                    <Tab label="Session/Term" />
                  </Tabs>

                  <ManageSessions activeTab={activeTab} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight={600}>
                      Manage Weeks
                    </Typography>
                  </Box>
                  
                  <ManageWeeks />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <HolidayModal
        open={openModal}
        onClose={handleCloseModal}
        handleRefresh={handleRefresh}
        actionType={modalActionType}
      />
    </PageContainer>
  );
};

export default SessionWeekManager;
