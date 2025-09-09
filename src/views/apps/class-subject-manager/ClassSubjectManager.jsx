import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Tabs, 
  Tab,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

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
  const [sessionTab, setSessionTab] = useState(0);
  const theme = useTheme();
  const borderColor = theme.palette.divider;
  
  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleSessionTabChange = (event, newValue) => {
    setSessionTab(newValue);
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
          <Tabs 
            value={mainTab} 
            onChange={handleMainTabChange} 
            sx={{ 
              mb: 3,
              '& .MuiTab-root': {
                flex: 1,
                maxWidth: 'none',
                minWidth: 'auto',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600
              }
            }}
            variant="fullWidth"
          >
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
