import React from 'react';
import { Grid } from '@mui/material';
import StatCard from '@/components/shared/StatCard';
import {
  IconCoins,
  IconReportMoney,
  IconScale,
  IconPercentage,
  IconTrendingUp,
  IconSchool,
  IconGift,
  IconTarget,
  IconClipboardList,
  IconCircleCheck,
  IconClockHour4,
  IconCash,
} from '@tabler/icons';
import {
  formatNaira,
  summaryStats,
  incomeDetailsStats,
  expenditureDetailsStats,
} from '../constants';

// One stat row, swapped by tab — each Income & Expenditure report tab has
// its own set of headline numbers, but they all render as the same
// StatCard grid directly below the page header (above the tab bar itself).
const ReportStatsRow = ({ tab }) => {
  if (tab === 'income') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Income"
            count={formatNaira(incomeDetailsStats.totalIncome)}
            subtitle={`↑ +${incomeDetailsStats.totalIncomeChangePct}% vs. prior term`}
            icon={IconCoins}
            colorIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="School Fees"
            count={formatNaira(incomeDetailsStats.schoolFees)}
            subtitle={`${incomeDetailsStats.schoolFeesPct}% of total income`}
            icon={IconSchool}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Other Income"
            count={formatNaira(incomeDetailsStats.otherIncome)}
            subtitle={`${incomeDetailsStats.otherIncomePct}% of total income`}
            icon={IconGift}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Income Growth"
            count={`+${incomeDetailsStats.incomeGrowthPct}%`}
            subtitle="vs. prior term"
            icon={IconTrendingUp}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Collection Efficiency"
            count={`${incomeDetailsStats.collectionEfficiency}%`}
            icon={IconTarget}
            colorIndex={4}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'expenditure') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Expenditure"
            count={formatNaira(expenditureDetailsStats.totalExpenditure)}
            subtitle={`↑ +${expenditureDetailsStats.totalExpenditureChangePct}% vs. prior term`}
            icon={IconReportMoney}
            colorIndex={4}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Expenditure Records"
            count={expenditureDetailsStats.expenditureRecords}
            subtitle="Approved expenditure entries"
            icon={IconClipboardList}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Amount Paid"
            count={formatNaira(expenditureDetailsStats.totalAmountPaid)}
            subtitle={`${expenditureDetailsStats.totalAmountPaidPct}% of total expenditure`}
            icon={IconCash}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Paid Records"
            count={expenditureDetailsStats.paidRecords}
            subtitle={`${expenditureDetailsStats.paidRecordsPct}% of records`}
            icon={IconCircleCheck}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Outstanding Records"
            count={expenditureDetailsStats.outstandingRecords}
            subtitle={`${expenditureDetailsStats.outstandingRecordsPct}% of records`}
            icon={IconClockHour4}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Outstanding Amount"
            count={formatNaira(expenditureDetailsStats.outstandingAmount)}
            subtitle={`${expenditureDetailsStats.outstandingAmountPct}% of total expenditure`}
            icon={IconScale}
            colorIndex={0}
            iconBg="#F3E8FF"
            iconColor="#9333EA"
          />
        </Grid>
      </Grid>
    );
  }

  // Account Summary and Trend & Analysis share the same headline figures.
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Total Income"
          count={formatNaira(summaryStats.totalIncome)}
          subtitle={`↑ +${summaryStats.totalIncomeChangePct}% vs. prior term`}
          icon={IconCoins}
          colorIndex={1}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Total Expenditure"
          count={formatNaira(summaryStats.totalExpenditure)}
          subtitle={`↑ +${summaryStats.totalExpenditureChangePct}% vs. prior term`}
          icon={IconReportMoney}
          colorIndex={4}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Surplus / (Deficit)"
          count={formatNaira(summaryStats.surplus)}
          subtitle={`↑ +${summaryStats.surplusChangePct}% vs. prior term`}
          icon={IconScale}
          colorIndex={0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Expenditure Ratio"
          count={`${summaryStats.expenditureRatio}%`}
          subtitle="of total income"
          icon={IconPercentage}
          colorIndex={2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Income Growth"
          count={`+${summaryStats.incomeGrowthPct}%`}
          subtitle="vs. prior term"
          icon={IconTrendingUp}
          colorIndex={3}
        />
      </Grid>
    </Grid>
  );
};

export default ReportStatsRow;
