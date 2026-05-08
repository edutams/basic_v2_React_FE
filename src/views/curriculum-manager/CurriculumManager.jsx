import React, { useState } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';
import CurriculumSetup from './components/CurriculumSetup';
import SubjectBank from './components/SubjectBank';
import ClassSubject from './components/ClassSubject';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Dashboard' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

const CurriculumManager = () => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <PageContainer title="Curriculum Manager">
      <Breadcrumb title="Curriculum Manager" items={BCrumb} />
      <Box>
        {/* TABS */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="Curriculum Setup" />
            <Tab label="Subject Bank" />
            <Tab label="Class Subject" />
          </Tabs>
        </Box>

        {/* CONTENT */}
        <ParentCard>
          <TabPanel value={tab} index={0}>
            <CurriculumSetup />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <SubjectBank />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <ClassSubject />
          </TabPanel>
        </ParentCard>
      </Box>
    </PageContainer>
  );
};

export default CurriculumManager;

