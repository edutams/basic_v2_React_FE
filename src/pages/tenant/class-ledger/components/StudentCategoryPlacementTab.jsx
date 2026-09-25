import React from 'react';
import { Grid, Box, Typography, Alert } from '@mui/material';
import StatCard from './StatCard';

const StudentCategoryPlacementTab = () => {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Total Students" value={0} colorIndex={0} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Correctly Placed" value={0} colorIndex={1} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard title="Needs Review" value={0} colorIndex={4} />
        </Grid>
      </Grid>

      <Alert severity="info">
        <Typography variant="body2">
          Student Category Placement content is coming next.
        </Typography>
      </Alert>
    </Box>
  );
};

export default StudentCategoryPlacementTab;
