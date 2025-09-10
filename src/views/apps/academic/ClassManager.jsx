import React from 'react';
import {
  Box,
  Card,
  Grid,
} from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import DivisionProgramme from './components/DivisionProgramme';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
];

const ClassManager = () => {
  return (
    <PageContainer title="Class Manager" description="Manage Class Manager">
      <Breadcrumb title="Class Manager" items={BCrumb} />
  
      <Grid item xs={12} lg={12}>
        <Card>
          <Box>
            <DivisionProgramme />
          </Box>
        </Card>
      </Grid>
    </PageContainer>
  );
};

export default ClassManager;