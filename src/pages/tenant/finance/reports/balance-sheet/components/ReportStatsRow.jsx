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
import { formatNaira, balanceSheetStats, assetDetailsStats, liabilityDetailsStats, equityDetailsStats } from '../constants';

const ReportStatsRow = ({ tab }) => {
  if (tab === 'assets') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Assets"
            count={formatNaira(assetDetailsStats.totalAssets)}
            subtitle={`↑ +${assetDetailsStats.totalAssetsChangePct}% vs. 31 Dec, 2025`}
            icon={IconCoins}
            colorIndex={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Non-Current Assets"
            count={formatNaira(assetDetailsStats.nonCurrentAssets)}
            subtitle={`${assetDetailsStats.nonCurrentAssetsPct}% of total assets`}
            icon={IconBuildingBank}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Current Assets"
            count={formatNaira(assetDetailsStats.currentAssets)}
            subtitle={`${assetDetailsStats.currentAssetsPct}% of total assets`}
            icon={IconCoins}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Asset Records"
            count={assetDetailsStats.assetRecords}
            subtitle="registered assets"
            icon={IconClipboardList}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Net Asset Movement"
            count={`+${formatNaira(assetDetailsStats.netAssetMovement)}`}
            subtitle={`(+${assetDetailsStats.netAssetMovementPct}%)`}
            icon={IconTrendingUp}
            colorIndex={1}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'liabilities') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Liabilities"
            count={formatNaira(liabilityDetailsStats.totalLiabilities)}
            subtitle={`↑ +${liabilityDetailsStats.totalLiabilitiesChangePct}% vs. 31 Dec, 2025`}
            icon={IconLayersIntersect}
            colorIndex={4}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Non-Current Liabilities"
            count={formatNaira(liabilityDetailsStats.nonCurrentLiabilities)}
            subtitle={`${liabilityDetailsStats.nonCurrentLiabilitiesPct}% of total liabilities`}
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
            label="Current Liabilities"
            count={formatNaira(liabilityDetailsStats.currentLiabilities)}
            subtitle={`${liabilityDetailsStats.currentLiabilitiesPct}% of total liabilities`}
            icon={IconReceipt}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Liability Records"
            count={liabilityDetailsStats.liabilityRecords}
            subtitle="active accounts"
            icon={IconClipboardList}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Liability Movement"
            count={`+${formatNaira(liabilityDetailsStats.liabilityMovement)}`}
            subtitle={`(+${liabilityDetailsStats.liabilityMovementPct}%)`}
            icon={IconTrendingUp}
            colorIndex={4}
          />
        </Grid>
      </Grid>
    );
  }

  if (tab === 'equity') {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Total Equity (Net Assets)"
            count={formatNaira(equityDetailsStats.totalEquity)}
            subtitle={`↑ +${equityDetailsStats.totalEquityChangePct}% vs. 31 Dec, 2025`}
            icon={IconCoins}
            colorIndex={1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Accumulated Surplus"
            count={formatNaira(equityDetailsStats.accumulatedSurplus)}
            subtitle={`${equityDetailsStats.accumulatedSurplusPct}% of equity`}
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
            label="Current Period Surplus"
            count={formatNaira(equityDetailsStats.currentPeriodSurplus)}
            subtitle={`${equityDetailsStats.currentPeriodSurplusPct}% of equity`}
            icon={IconChartBar}
            colorIndex={2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Equity Ratio"
            count={`${equityDetailsStats.equityRatio}%`}
            subtitle="of total assets"
            icon={IconScale}
            colorIndex={3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            align="left"
            subtitleAfterValue
            label="Equity Movement"
            count={`+${formatNaira(equityDetailsStats.equityMovement)}`}
            subtitle={`(+${equityDetailsStats.equityMovementPct}%)`}
            icon={IconTrendingUp}
            colorIndex={1}
          />
        </Grid>
      </Grid>
    );
  }

  // Balance Sheet and Trend & Analysis share the same headline figures.
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Total Assets"
          count={formatNaira(balanceSheetStats.totalAssets)}
          subtitle={`↑ +${balanceSheetStats.totalAssetsChangePct}% vs. 31 Dec, 2025`}
          icon={IconCoins}
          colorIndex={0}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Total Liabilities"
          count={formatNaira(balanceSheetStats.totalLiabilities)}
          subtitle={`↑ +${balanceSheetStats.totalLiabilitiesChangePct}% vs. 31 Dec, 2025`}
          icon={IconLayersIntersect}
          colorIndex={4}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Net Assets (Equity)"
          count={formatNaira(balanceSheetStats.netAssets)}
          subtitle={`↑ +${balanceSheetStats.netAssetsChangePct}% vs. 31 Dec, 2025`}
          icon={IconBuildingBank}
          colorIndex={1}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Current Ratio"
          count={balanceSheetStats.currentRatio}
          subtitle={balanceSheetStats.currentRatioNote}
          icon={IconScale}
          colorIndex={2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          align="left"
          subtitleAfterValue
          label="Equity Ratio"
          count={`${balanceSheetStats.equityRatio}%`}
          subtitle={balanceSheetStats.equityRatioNote}
          icon={IconChartBar}
          colorIndex={3}
        />
      </Grid>
    </Grid>
  );
};

export default ReportStatsRow;
