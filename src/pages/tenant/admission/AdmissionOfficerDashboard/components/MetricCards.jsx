import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Groups, Layers, HowToReg, TaskAlt } from '@mui/icons-material';
import StatCard from './StatCard';
import { GenderSplit } from '../common';
import { GREEN, num } from '../constants';

/**
 * Row 1: Top metric cards — Total Applicants / Total Batches / Total Admitted / Total Accepted.
 * Each card opens a breakdown modal via `onCardClick(type)` (same as the AdminDashboard cards).
 */
const MetricCards = ({
  total_applicants,
  total_batches,
  total_admitted,
  total_accepted,
  onCardClick,
}) => (
  <Grid container spacing={2} mb={3}>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon={Groups}
        colorName="info"
        title="Total Applicants"
        value={num(total_applicants.count).toLocaleString()}
        right={<GenderSplit male={total_applicants.male} female={total_applicants.female} />}
        onClick={onCardClick ? () => onCardClick('applicants') : undefined}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon={Layers}
        colorName="success"
        title="Total Batches Created"
        value={num(total_batches.count).toLocaleString()}
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GREEN }} />
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>
                Active {num(total_batches.active)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: 'text.secondary' }}>
                Completed {num(total_batches.completed)}
              </Typography>
            </Box>
          </Box>
        }
        onClick={onCardClick ? () => onCardClick('batches') : undefined}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon={HowToReg}
        colorName="secondary"
        title="Total Admitted"
        value={num(total_admitted.count).toLocaleString()}
        right={<GenderSplit male={total_admitted.male} female={total_admitted.female} />}
        onClick={onCardClick ? () => onCardClick('admitted') : undefined}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <StatCard
        icon={TaskAlt}
        colorName="success"
        title="Total Accepted"
        value={num(total_accepted.count).toLocaleString()}
        right={<GenderSplit male={total_accepted.male} female={total_accepted.female} />}
        onClick={onCardClick ? () => onCardClick('accepted') : undefined}
      />
    </Grid>
  </Grid>
);

export default MetricCards;
