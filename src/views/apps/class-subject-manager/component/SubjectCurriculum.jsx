import React from 'react';
import { Grid } from '@mui/material';
import CategorySection from './CategorySection';
import SubjectSection from './SubjectSection';

const SubjectCurriculum = ({ selectedTab = 0 }) => {
  return (
    <Grid container spacing={3}>
      <CategorySection selectedTab={selectedTab} />
      <SubjectSection selectedTab={selectedTab} />
    </Grid>
  );
};

export default SubjectCurriculum;
