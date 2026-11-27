import React, { useMemo } from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Skeleton, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconChartAreaLine, IconChartDonut, IconChartBar, IconReportAnalytics, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import { COLORS, formatCompact, formatNaira } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const ChartSkeleton = ({ height = 260 }) => (
  <Box sx={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
    {[85, 65, 75, 50, 70].map((w, idx) => (
      <Skeleton key={idx} variant="text" width={`${w}%`} height={18} />
    ))}
  </Box>
);

function pctChange(current, previous) {
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function ppChange(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  return Math.round((current - previous) * 10) / 10;
}

/**
 * Current-vs-previous-term rows for the Financial Ratios Trend table, all
 * derived from the same 7-term trend array the Financial Position chart
 * already renders — no separate endpoint for this tab.
 */
function buildFinancialRatios(trendData) {
  if (trendData.length === 0) return [];
  const current = trendData[trendData.length - 1];
  const previous = trendData.length >= 2 ? trendData[trendData.length - 2] : null;

  const currentRatioChange = ppChange(current.current_ratio, previous?.current_ratio);
  const equityRatioChange = ppChange(current.equity_ratio, previous?.equity_ratio);
  const liabilitiesRatioChange = ppChange(current.liabilities_ratio, previous?.liabilities_ratio);
  const assetGrowth = pctChange(current.assets, previous?.assets);

  return [
    {
      metric: 'Current Ratio',
      previous: previous?.current_ratio !== null && previous?.current_ratio !== undefined ? `${previous.current_ratio} : 1` : '—',
      current: current.current_ratio !== null && current.current_ratio !== undefined ? `${current.current_ratio} : 1` : '—',
      change: currentRatioChange,
      changeLabel: currentRatioChange !== null ? `${currentRatioChange >= 0 ? '+' : ''}${currentRatioChange}` : '—',
      good: currentRatioChange === null ? null : currentRatioChange >= 0,
    },
    {
      metric: 'Equity Ratio',
      previous: previous?.equity_ratio !== null && previous?.equity_ratio !== undefined ? `${previous.equity_ratio}%` : '—',
      current: current.equity_ratio !== null && current.equity_ratio !== undefined ? `${current.equity_ratio}%` : '—',
      change: equityRatioChange,
      changeLabel: equityRatioChange !== null ? `${equityRatioChange >= 0 ? '+' : '−'}${Math.abs(equityRatioChange)} pp` : '—',
      good: equityRatioChange === null ? null : equityRatioChange >= 0,
    },
    {
      metric: 'Liabilities Ratio',
      previous: previous?.liabilities_ratio !== null && previous?.liabilities_ratio !== undefined ? `${previous.liabilities_ratio}%` : '—',
      current: current.liabilities_ratio !== null && current.liabilities_ratio !== undefined ? `${current.liabilities_ratio}%` : '—',
      change: liabilitiesRatioChange,
      changeLabel: liabilitiesRatioChange !== null ? `${liabilitiesRatioChange >= 0 ? '+' : '−'}${Math.abs(liabilitiesRatioChange)} pp` : '—',
      good: liabilitiesRatioChange === null ? null : liabilitiesRatioChange <= 0,
    },
    {
      metric: 'Asset Growth',
      previous: previous ? formatNaira(previous.assets) : '—',
      current: formatNaira(current.assets),
      change: assetGrowth,
      changeLabel: assetGrowth !== null ? `${assetGrowth >= 0 ? '+' : ''}${assetGrowth}%` : '—',
      good: assetGrowth === null ? null : assetGrowth >= 0,
    },
  ];
}

function buildInsights(summary, ratios) {
  if (!summary) return [];
  const insights = [];

  if (summary.total_assets_change_pct !== null && summary.total_assets_change_pct !== undefined) {
    insights.push(`Total assets ${summary.total_assets_change_pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(summary.total_assets_change_pct)}% to ${formatNaira(summary.total_assets)}.`);
  }
  if (summary.total_liabilities_change_pct !== null && summary.total_liabilities_change_pct !== undefined) {
    insights.push(`Total liabilities ${summary.total_liabilities_change_pct >= 0 ? 'rose' : 'fell'} by ${Math.abs(summary.total_liabilities_change_pct)}% to ${formatNaira(summary.total_liabilities)}.`);
  }
  if (summary.total_equity_change_pct !== null && summary.total_equity_change_pct !== undefined) {
    insights.push(`Total equity (net assets) ${summary.total_equity_change_pct >= 0 ? 'grew' : 'shrank'} by ${Math.abs(summary.total_equity_change_pct)}% to ${formatNaira(summary.total_equity)}.`);
  }
  if (summary.equity_ratio !== null && summary.equity_ratio !== undefined) {
    insights.push(`Equity ratio is ${summary.equity_ratio}%, ${summary.equity_ratio >= 50 ? 'indicating a strong and stable financial position' : 'below the 50% mark typically considered stable'}.`);
  }
  if (summary.current_ratio !== null && summary.current_ratio !== undefined) {
    insights.push(`Current ratio is ${summary.current_ratio}:1, ${summary.current_ratio >= 1 ? 'showing good short-term liquidity' : 'suggesting a short-term liquidity risk'}.`);
  }

  return insights;
}

const TrendAnalysisTab = ({ data, loading }) => {
  const theme = useTheme();

  const summary = data?.summary;
  const trendData = data?.trend || [];

  const financialRatios = useMemo(() => buildFinancialRatios(trendData), [trendData]);
  const insights = useMemo(() => buildInsights(summary, financialRatios), [summary, financialRatios]);

  const totalLiabilities = summary?.total_liabilities ?? 0;
  const totalEquity = summary?.total_equity ?? 0;
  const totalFunds = totalLiabilities + totalEquity;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconChartAreaLine size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Position Trend (Last 7 Terms)</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            {loading ? (
              <ChartSkeleton height={260} />
            ) : (
              <ReusableTrendChart
                data={trendData}
                nameKey="term"
                series={[
                  { dataKey: 'assets', name: 'Total Assets', color: COLORS.assets },
                  { dataKey: 'equity', name: 'Total Equity', color: COLORS.equity },
                  { dataKey: 'liabilities', name: 'Total Liabilities', color: COLORS.liabilities },
                ]}
                type="area"
                height={260}
                valueFormatter={formatCompact}
                cardSx={{ border: 'none' }}
              />
            )}
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconChartDonut size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Structure (Current Period)</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            {loading ? (
              <Box sx={{ minHeight: 180 + 12 + 2 * 20 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={168} height={168} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Skeleton variant="text" width="75%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Box>
            ) : (
              <>
                <ReusableDonutChart
                  data={[
                    { name: 'Equity (Net Assets)', value: totalEquity, color: COLORS.equity },
                    { name: 'Liabilities', value: totalLiabilities, color: COLORS.liabilities },
                  ]}
                  height={180}
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={2}
                  centerValue={formatCompact(totalFunds)}
                  centerTitle="Total Funds"
                  valueFontSize={17}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
                  {[
                    { name: 'Equity (Net Assets)', color: COLORS.equity, value: totalEquity },
                    { name: 'Liabilities', color: COLORS.liabilities, value: totalLiabilities },
                  ].map((c) => (
                    <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary' }}>
                        {formatCompact(c.value)} ({totalFunds > 0 ? (c.value / totalFunds * 100).toFixed(1) : 0}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconChartBar size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Period Movement Analysis (Last 7 Terms)</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            {loading ? (
              <ChartSkeleton height={260} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f0f0'} />
                  <XAxis dataKey="term" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                  <Tooltip formatter={(v) => formatNaira(v)} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <Bar dataKey="assets" name="Assets" fill={COLORS.assets} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="liabilities" name="Liabilities" fill={COLORS.liabilities} radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="equity" name="Equity" fill={COLORS.equity} radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconReportAnalytics size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Ratios Trend</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                  <TableCell sx={thCell}>Metric</TableCell>
                  <TableCell sx={thCell} align="right">Previous</TableCell>
                  <TableCell sx={thCell} align="right">Current</TableCell>
                  <TableCell sx={thCell} align="right">Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {Array.from({ length: 4 }).map((__, cellIdx) => (
                        <TableCell key={cellIdx} sx={tdCell}>
                          <Skeleton variant="text" height={18} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : financialRatios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                      No data for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  financialRatios.map((row) => {
                    const DirectionIcon = (row.change ?? 0) < 0 ? IconArrowDownRight : IconArrowUpRight;
                    const color = row.good === null ? theme.palette.text.secondary : row.good ? '#15803D' : '#DC2626';
                    return (
                      <TableRow key={row.metric} hover>
                        <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.metric}</TableCell>
                        <TableCell sx={{ ...tdCell, color: 'text.secondary' }} align="right">{row.previous}</TableCell>
                        <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{row.current}</TableCell>
                        <TableCell sx={{ ...tdCell, color, fontWeight: 700 }} align="right">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                            {row.change !== null && <DirectionIcon size={13} />}
                            {row.changeLabel}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <InsightsCard title="Key Insights" items={insights} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendAnalysisTab;
