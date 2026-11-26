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
import { formatNaira } from '../constants';

function changeSubtitle(pct, suffix = 'vs. compare period') {
  if (pct === null || pct === undefined) return suffix;
  return `${pct >= 0 ? '↑ +' : '↓ '}${Math.abs(pct)}% ${suffix}`;
}

// One stat row, swapped by tab — each Income & Expenditure report tab has
// its own set of headline numbers, but they all render as the same
// StatCard grid directly below the page header (above the tab bar itself).
// `data`/`loading` are the real /finance_reports/income_expenditure_summary
// response — only the Account Summary/Trend & Analysis branch consumes
// them so far; Income/Expenditure Details still use their own mock stats.
const ReportStatsRow = ({ tab, data, loading }) => {
  if (tab === 'income') {
    const stats = data?.stats;
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Income"
            count={formatNaira(stats?.total_income ?? 0)}
            subtitle={changeSubtitle(stats?.total_income_change_pct, 'vs. compare period')}
            icon={IconCoins}
            colorIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Income Growth"
            count={stats?.total_income_change_pct !== null && stats?.total_income_change_pct !== undefined ? `${stats.total_income_change_pct >= 0 ? '+' : ''}${stats.total_income_change_pct}%` : '—'}
            subtitle="vs. compare period"
            icon={IconTrendingUp}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Accounts in Use"
            count={stats?.accounts_in_use ?? 0}
            subtitle="income accounts posted this period"
            icon={IconGift}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Top Income Account"
            count={stats?.top_account_share_pct !== null && stats?.top_account_share_pct !== undefined ? `${stats.top_account_share_pct}%` : '—'}
            subtitle={stats?.top_account_name || 'of total income'}
            icon={IconSchool}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="School Fees Collection Rate"
            count={stats?.school_fees_collection_rate !== null && stats?.school_fees_collection_rate !== undefined ? `${stats.school_fees_collection_rate}%` : '—'}
            subtitle="of expected school fees"
            icon={IconTarget}
            colorIndex={4}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'expenditure') {
    const stats = data?.stats;
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Expenditure"
            count={formatNaira(stats?.total_expenditure ?? 0)}
            subtitle={changeSubtitle(stats?.total_expenditure_change_pct, 'vs. compare period')}
            icon={IconReportMoney}
            colorIndex={4}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Expenditure Records"
            count={stats?.expenditure_records ?? 0}
            subtitle="Active expenditure entries"
            icon={IconClipboardList}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Amount Paid"
            count={formatNaira(stats?.total_amount_paid ?? 0)}
            subtitle={`${stats?.total_amount_paid_pct ?? 0}% of total expenditure`}
            icon={IconCash}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Paid Records"
            count={stats?.paid_records ?? 0}
            subtitle={`${stats?.paid_records_pct ?? 0}% of records`}
            icon={IconCircleCheck}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Outstanding Records"
            count={stats?.outstanding_records ?? 0}
            subtitle={`${stats?.outstanding_records_pct ?? 0}% of records`}
            icon={IconClockHour4}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Outstanding Amount"
            count={formatNaira(stats?.outstanding_amount ?? 0)}
            subtitle={`${stats?.outstanding_amount_pct ?? 0}% of total expenditure`}
            icon={IconScale}
            colorIndex={0}
            iconBg="#F3E8FF"
            iconColor="#9333EA"
          />
        </Grid>
      </Grid>
    );
  }

  // Account Summary and Trend & Analysis share the same headline figures,
  // computed for real from the summary endpoint.
  const summary = data?.summary;
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Total Income"
          count={formatNaira(summary?.total_income ?? 0)}
          subtitle={changeSubtitle(summary?.total_income_change_pct)}
          icon={IconCoins}
          colorIndex={1}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Total Expenditure"
          count={formatNaira(summary?.total_expenditure ?? 0)}
          subtitle={changeSubtitle(summary?.total_expenditure_change_pct)}
          icon={IconReportMoney}
          colorIndex={4}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Surplus / (Deficit)"
          count={formatNaira(summary?.surplus ?? 0)}
          subtitle={changeSubtitle(summary?.surplus_change_pct)}
          icon={IconScale}
          colorIndex={0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Expenditure Ratio"
          count={`${summary?.expenditure_ratio ?? 0}%`}
          subtitle="of total income"
          icon={IconPercentage}
          colorIndex={2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Income Growth"
          count={`${summary?.total_income_change_pct >= 0 ? '+' : ''}${summary?.total_income_change_pct ?? 0}%`}
          subtitle="vs. compare period"
          icon={IconTrendingUp}
          colorIndex={3}
        />
      </Grid>
    </Grid>
  );
};

export default ReportStatsRow;
