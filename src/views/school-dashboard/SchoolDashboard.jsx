import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
// import School-specific widgets/components here as you build them

export default function SchoolDashboard() {
  return (
    <PageContainer title="School Dashboard" description="This is the School Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* ------------------------- row 1 ------------------------- */}
          <Grid item xs={12} lg={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* <SchoolWelcomeCard /> */}
                <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
                  Welcome to the School Dashboard!
                </Box>
              </Grid>
              <Grid item xs={12} lg={6} sm={6}>
                {/* <SchoolStatsCard /> */}
                <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
                  School Stats
                </Box>
              </Grid>
              <Grid item xs={12} lg={6} sm={6}>
                {/* <SchoolNotificationsCard /> */}
                <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
                  Notifications
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={6}>
            {/* <SchoolOverview /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              School Overview
            </Box>
          </Grid>
          {/* ------------------------- row 2 ------------------------- */}
          <Grid item xs={12} lg={4}>
            {/* <SchoolAttendanceCard /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              Attendance
            </Box>
          </Grid>
          <Grid item xs={12} lg={8}>
            {/* <SchoolPerformance /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              Performance
            </Box>
          </Grid>
          {/* ------------------------- row 3 ------------------------- */}
          <Grid item xs={12} lg={4}>
            {/* <SchoolBlogCard /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              Blog
            </Box>
          </Grid>
          <Grid item xs={12} lg={4}>
            {/* <SchoolWeeklyStats /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              Weekly Stats
            </Box>
          </Grid>
          <Grid item xs={12} lg={4}>
            {/* <SchoolDailyActivities /> */}
            <Box p={3} bgcolor="background.paper" borderRadius={2} boxShadow={1}>
              Daily Activities
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
