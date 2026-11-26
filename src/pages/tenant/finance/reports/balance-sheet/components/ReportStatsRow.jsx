import React from 'react';
import { Grid } from '@mui/material';
import StatCard from '@/components/shared/StatCard';
import {
  IconCoins,
  IconBuildingBank,
  IconLayersIntersect,
  IconScale,
  IconChartBar,
  IconClipboardList,
  IconTrendingUp,
  IconReceipt,
} from '@tabler/icons';
import { formatNaira } from '../constants';

function changeSubtitle(pct, suffix = 'vs. compare period') {
  if (pct === null || pct === undefined) return suffix;
  return `${pct >= 0 ? '↑ +' : '↓ '}${Math.abs(pct)}% ${suffix}`;
}

const ReportStatsRow = ({ tab, data, loading }) => {
  if (tab === 'assets') {
    const stats = data?.stats;
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Assets"
            count={formatNaira(stats?.total ?? 0)}
            subtitle={changeSubtitle(stats?.total_change_pct)}
            icon={IconCoins}
            colorIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Non-Current Assets"
            count={formatNaira(stats?.non_current ?? 0)}
            subtitle={`${stats?.non_current_pct ?? 0}% of total assets`}
            icon={IconBuildingBank}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Current Assets"
            count={formatNaira(stats?.current ?? 0)}
            subtitle={`${stats?.current_pct ?? 0}% of total assets`}
            icon={IconCoins}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Asset Records"
            count={stats?.record_count ?? 0}
            subtitle="postings to asset accounts"
            icon={IconClipboardList}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Net Asset Movement"
            count={stats?.movement !== null && stats?.movement !== undefined ? formatNaira(stats.movement) : '—'}
            subtitle={stats?.movement_pct !== null && stats?.movement_pct !== undefined ? `(${stats.movement_pct >= 0 ? '+' : ''}${stats.movement_pct}%)` : 'vs. compare period'}
            icon={IconTrendingUp}
            colorIndex={1}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'liabilities') {
    const stats = data?.stats;
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Liabilities"
            count={formatNaira(stats?.total ?? 0)}
            subtitle={changeSubtitle(stats?.total_change_pct)}
            icon={IconLayersIntersect}
            colorIndex={4}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Non-Current Liabilities"
            count={formatNaira(stats?.non_current ?? 0)}
            subtitle={`${stats?.non_current_pct ?? 0}% of total liabilities`}
            icon={IconScale}
            colorIndex={0}
            iconBg="#F3E8FF"
            iconColor="#9333EA"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Current Liabilities"
            count={formatNaira(stats?.current ?? 0)}
            subtitle={`${stats?.current_pct ?? 0}% of total liabilities`}
            icon={IconReceipt}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Liability Records"
            count={stats?.record_count ?? 0}
            subtitle="postings to liability accounts"
            icon={IconClipboardList}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Liability Movement"
            count={stats?.movement !== null && stats?.movement !== undefined ? formatNaira(stats.movement) : '—'}
            subtitle={stats?.movement_pct !== null && stats?.movement_pct !== undefined ? `(${stats.movement_pct >= 0 ? '+' : ''}${stats.movement_pct}%)` : 'vs. compare period'}
            icon={IconTrendingUp}
            colorIndex={4}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'equity') {
    const stats = data?.stats;
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Total Equity (Net Assets)"
            count={formatNaira(stats?.total_equity ?? 0)}
            subtitle={changeSubtitle(stats?.total_equity_change_pct)}
            icon={IconCoins}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Accumulated Surplus"
            count={formatNaira(stats?.accumulated_surplus ?? 0)}
            subtitle={`${stats?.accumulated_surplus_pct ?? 0}% of equity`}
            icon={IconBuildingBank}
            colorIndex={0}
            iconBg="#F3E8FF"
            iconColor="#9333EA"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Current Period Surplus"
            count={formatNaira(stats?.current_period_surplus ?? 0)}
            subtitle={`${stats?.current_period_surplus_pct ?? 0}% of equity`}
            icon={IconChartBar}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Equity Ratio"
            count={stats?.equity_ratio !== null && stats?.equity_ratio !== undefined ? `${stats.equity_ratio}%` : '—'}
            subtitle="of total assets"
            icon={IconScale}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            loading={loading}
            label="Equity Growth"
            count={stats?.total_equity_change_pct !== null && stats?.total_equity_change_pct !== undefined ? `${stats.total_equity_change_pct >= 0 ? '+' : ''}${stats.total_equity_change_pct}%` : '—'}
            subtitle="vs. compare period"
            icon={IconTrendingUp}
            colorIndex={1}
          />
        </Grid>
      </Grid>
    );
  }

  // Balance Sheet and Trend & Analysis share the same headline figures,
  // computed for real from the balance_sheet_summary endpoint.
  const summary = data?.summary;
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Total Assets"
          count={formatNaira(summary?.total_assets ?? 0)}
          subtitle={changeSubtitle(summary?.total_assets_change_pct)}
          icon={IconCoins}
          colorIndex={0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Total Liabilities"
          count={formatNaira(summary?.total_liabilities ?? 0)}
          subtitle={changeSubtitle(summary?.total_liabilities_change_pct)}
          icon={IconLayersIntersect}
          colorIndex={4}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Net Assets (Equity)"
          count={formatNaira(summary?.total_equity ?? 0)}
          subtitle={changeSubtitle(summary?.total_equity_change_pct)}
          icon={IconBuildingBank}
          colorIndex={1}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Current Ratio"
          count={summary?.current_ratio !== null && summary?.current_ratio !== undefined ? `${summary.current_ratio} : 1` : '—'}
          subtitle={summary?.current_ratio === null || summary?.current_ratio === undefined ? 'no current liabilities posted' : summary.current_ratio >= 1 ? 'Good liquidity' : 'Liquidity risk'}
          icon={IconScale}
          colorIndex={2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          loading={loading}
          label="Equity Ratio"
          count={summary?.equity_ratio !== null && summary?.equity_ratio !== undefined ? `${summary.equity_ratio}%` : '—'}
          subtitle={summary?.equity_ratio !== null && summary?.equity_ratio >= 50 ? 'Financially stable' : 'of total assets'}
          icon={IconChartBar}
          colorIndex={3}
        />
      </Grid>
    </Grid>
  );
};

export default ReportStatsRow;
