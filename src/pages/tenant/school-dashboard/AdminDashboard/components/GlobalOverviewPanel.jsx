import React from 'react';
import { Grid, useTheme } from '@mui/material';
import { Public, Groups, School, Badge } from '@mui/icons-material';
import { Panel, SectionHeader } from '../common';
import { num } from '../constants';
import OverviewCard from './OverviewCard';
import StaffDistributionCard from './StaffDistributionCard';

/**
 * Global Overview — compact stat tiles + compact staff distribution donut.
 */
const GlobalOverviewPanel = ({ go, staffDonut, onCardClick }) => {
  const theme = useTheme();

  return (
    <Panel sx={{ mb: 3, p: 2 }}>
      <SectionHeader icon={Public} title="Global Overview" color={theme.palette.primary.main} />
      <Grid container spacing={1.5} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={Groups}
            colorName="info"
            title="Total Students"
            value={num(go.total_students).toLocaleString()}
            onClick={() => onCardClick && onCardClick('students')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={School}
            colorName="success"
            title="Teaching Staff"
            value={num(go.teaching_staff).toLocaleString()}
            onClick={() => onCardClick && onCardClick('teaching_staff')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverviewCard
            icon={Badge}
            colorName="warning"
            title="Non-Teaching Staff"
            value={num(go.non_teaching_staff).toLocaleString()}
            onClick={() => onCardClick && onCardClick('non_teaching_staff')}
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
