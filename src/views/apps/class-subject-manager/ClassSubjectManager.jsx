import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Tabs, 
  Tab,
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import SubjectAnalytics from "./component/SubjectAnalytics";
import SubjectCurriculum from "./component/SubjectCurriculum";


const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'School Dashboard',
  },
  {
    title: 'Subject Manager',
  },
];

const ClassSubjectManager = () => {
  const [mainTab, setMainTab] = useState(0);
  
  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  return (
    <PageContainer title="Subject Manager" description="Manage subjects">
      <Breadcrumb title="Subject Manager" items={BCrumb} />
      
      {/* Analytics Cards */}
      <Box sx={{ mb: 3 }}>
        <SubjectAnalytics selectedTab={mainTab} />
      </Box>
      
      <Card variant="outlined">
        <CardContent>
          {/* Main Tabs */}
          <Tabs value={mainTab} onChange={handleMainTabChange} sx={{ mb: 3 }}>
            <Tab label="Pry" />
            <Tab label="JS" />
            <Tab label="SS" />
            <Tab label="TVET" />
          </Tabs>

          {/* Subject Curriculum Content */}
          <SubjectCurriculum selectedTab={mainTab} />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ClassSubjectManager;
