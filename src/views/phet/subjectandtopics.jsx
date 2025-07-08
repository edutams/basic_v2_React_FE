import React from 'react';
import { Box, Typography } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';

const SubjectAndTopics = () => {
  return (
    <Box>
      <Breadcrumb
        // subtitle="PHET Stimulation"
        title="Subject & Topics"
        items={[
          { title: 'Home', to: '/' },
          { title: 'PHET Stimulation' },
          { title: 'Subject & Topics' },
        ]}
      />
      <Typography variant="body1">
        This is the Subject & Topics view for PHET Stimulation.
      </Typography>
    </Box>
  );
};

export default SubjectAndTopics; 