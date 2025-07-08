import React from 'react';
import { Box, Typography } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';

const StimulationLinks = () => {
  return (
    <Box>
      <Breadcrumb
        subtitle="PHET Stimulation"
        title="Stimulation Links"
        items={[
          { title: 'Home', to: '/' },
          { title: 'PHET Stimulation' },
          { title: 'Stimulation Links' },
        ]}
      />
      <Typography variant="body1">
        This is the Stimulation Links view for PHET Stimulation.
      </Typography>
    </Box>
  );
};

export default StimulationLinks; 