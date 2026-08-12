import React from 'react';
import { Grid, Typography } from '@mui/material';
import FeeCard from './FeeCard';
import RevenueBreakdownCard from './RevenueBreakdownCard';
import { GrowthRow } from '../common';
import { BLUE, GREEN, PURPLE, formatCurrency, num } from '../constants';

/**
 * Row 2: Financial Metrics — three fee cards + revenue breakdown donut card.
 */
const FinancialMetrics = ({
  financial_metrics = {},
  totalFees,
  total_applicants = {},
  total_accepted = {},
  prevSessionLabel,
  donutData,
}) => (
  <Grid container spacing={2} mb={3}>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <FeeCard
        color={BLUE}
        colorName="info"
        title="Pre-Application Fees"
        value={formatCurrency(financial_metrics.pre_application_fees)}
        total={financial_metrics.pre_application_fees}
        sub={
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            from {num(total_applicants.count).toLocaleString()} forms
          </Typography>
        }
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <FeeCard
        color={GREEN}
        colorName="success"
        title="Post-Application Fees"
        value={formatCurrency(financial_metrics.post_application_fees)}
        total={financial_metrics.post_application_fees}
        sub={
          <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
            from {num(total_accepted.count).toLocaleString()} acceptances
          </Typography>
        }
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <FeeCard
        color={PURPLE}
        colorName="secondary"
        title="Total Fees Collected"
        value={formatCurrency(totalFees)}
        total={totalFees}
        sub={
          <GrowthRow
            pct={financial_metrics.growth_percentage}
            type={financial_metrics.growth_percentage >= 0 ? 'increase' : 'decrease'}
            label={prevSessionLabel}
          />
        }
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <RevenueBreakdownCard donutData={donutData} totalFees={totalFees} />
    </Grid>
  </Grid>
);

export default FinancialMetrics;
