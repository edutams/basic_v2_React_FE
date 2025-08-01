import React from 'react';
import {
  Box,
  Card,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import EmisCentralTab from './components/DivisionProgramme';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Manager' },
];

const ContentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '& .MuiCardContent-root': {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
}));

const SchoolManager = () => {
  return (
    <PageContainer title="School Manager" description="Manage School Manager">
      <Breadcrumb title="School Manager" items={BCrumb} />

      <Grid item size={{ xs: 12, lg: 12 }}>
        <ContentCard>
          <Box>
            <EmisCentralTab />
          </Box>
        </ContentCard>
      </Grid>
    </PageContainer>
  );
};

export default SchoolManager;
