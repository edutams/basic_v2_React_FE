import React from 'react';
import { Grid, useTheme } from '@mui/material';
import { Public, Groups, School, Badge } from '@mui/icons-material';
import { Panel, SectionHeader } from '../common';
import { num } from '../constants';
import OverviewCard from './OverviewCard';
import StaffDistributionCard from './StaffDistributionCard';

/**
 * Global Overview — 3 stat cards + staff distribution donut.
 */
const GlobalOverviewPanel = ({ go, staffDonut }) => {
  const theme = useTheme();

  return (
    <Panel sx={{ mb: 3 }}>
      <SectionHeader icon={Public} title="Global Overview" color={theme.palette.primary.main} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={Groups}
            colorName="info"
            title="Total Students"
            value={num(go.total_students).toLocaleString()}
            trend={go.student_growth}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={School}
            colorName="success"
            title="Teaching Staff"
            value={num(go.teaching_staff).toLocaleString()}
            trend={go.teaching_growth}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={Badge}
            colorName="warning"
            title="Non-Teaching Staff"
            value={num(go.non_teaching_staff).toLocaleString()}
            trend={go.non_teaching_growth}
            down
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StaffDistributionCard staffDonut={staffDonut} />
        </Grid>
      </Grid>
    </Panel>
  );
};

export default GlobalOverviewPanel;
