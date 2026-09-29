import React from 'react';
import { Grid, Typography } from '@mui/material';
import FeeCard from './FeeCard';
import RevenueBreakdownCard from './RevenueBreakdownCard';
import { formatCurrency, num } from '../constants';

/**
 * Row 2: Financial Metrics — three fee cards + revenue breakdown donut card.
 * Each fee card opens a breakdown modal via `onCardClick(type)` (the donut card
 * stays static).
 */
const FinancialMetrics = ({
  financial_metrics = {},
  totalFees,
  total_applicants = {},
  total_accepted = {},
  donutData,
  onCardClick,
}) => {
  return (
    <Grid container spacing={2} mb={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <FeeCard
          colorIndex={0}
          title="Pre-Application Fees"
          value={formatCurrency(financial_metrics.pre_application_fees)}
          sub={
            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
              from {num(total_applicants.count).toLocaleString()} forms
            </Typography>
          }
          onClick={onCardClick ? () => onCardClick('pre_application_fees') : undefined}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <FeeCard
          colorIndex={1}
          title="Post-Application Fees"
          value={formatCurrency(financial_metrics.post_application_fees)}
          sub={
            <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
              from {num(total_accepted.count).toLocaleString()} acceptances
            </Typography>
          }
          onClick={onCardClick ? () => onCardClick('post_application_fees') : undefined}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <FeeCard
          colorIndex={2}
          title="Total Fees Collected"
          value={formatCurrency(totalFees)}
          onClick={onCardClick ? () => onCardClick('total_fees') : undefined}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <RevenueBreakdownCard donutData={donutData} totalFees={totalFees} />
      </Grid>
    </Grid>
  );
};

export default FinancialMetrics;
