import React, { useMemo } from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Skeleton, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import {
  IconChartAreaLine,
  IconChartBar,
  IconReportAnalytics,
  IconChartDonut,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCoins,
  IconReportMoney,
  IconScale,
  IconPercentage,
} from '@tabler/icons';
import InsightsCard from './InsightsCard';
import { formatCompact, formatNaira } from '../constants';

const METRIC_ICONS = {
  income: IconCoins,
  expenditure: IconReportMoney,
  scale: IconScale,
  percent: IconPercentage,
};

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

/** Staggered text-line placeholder for a chart card while it's loading —
 * keeps the whole module's loading language to text-shaped skeletons
 * instead of a solid block, matching the row-skeleton convention already
 * used elsewhere in the Finance module. */
const ChartSkeleton = ({ height = 260 }) => (
  <Box sx={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
    {[85, 65, 75, 50, 70].map((w, idx) => (
      <Skeleton key={idx} variant="text" width={`${w}%`} height={18} />
    ))}
  </Box>
);

const SurplusDeficitBarLabel = (props) => {
  const { x, y, width, value } = props;
  const text = formatCompact(value);
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#7C3AED">
      {text}
    </text>
  );
};

function pctChange(current, previous) {
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

/**
 * Current-vs-previous-term rows for the Key Financial Trends table, all
 * derived from the same 7-term trend array the Income vs Expenditure chart
 * already renders — no separate endpoint for this tab.
 */
function buildKeyFinancialTrends(trendData) {
  if (trendData.length === 0) return [];

  const current = trendData[trendData.length - 1];
  const previous = trendData.length >= 2 ? trendData[trendData.length - 2] : null;

  const incomeTrend = trendData.map((t) => t.income);
  const expenditureTrend = trendData.map((t) => t.expenditure);
  const surplusTrend = trendData.map((t) => t.income - t.expenditure);
  const ratioTrend = trendData.map((t) => (t.income > 0 ? (t.expenditure / t.income) * 100 : 0));

  const currentSurplus = current.income - current.expenditure;
  const previousSurplus = previous ? previous.income - previous.expenditure : null;
  const currentRatio = current.income > 0 ? (current.expenditure / current.income) * 100 : 0;
  const previousRatio = previous && previous.income > 0 ? (previous.expenditure / previous.income) * 100 : null;

  const incomeChange = pctChange(current.income, previous?.income);
  const expenditureChange = pctChange(current.expenditure, previous?.expenditure);
  const surplusChange = pctChange(currentSurplus, previousSurplus);
  const ratioChangePp = previousRatio !== null ? Math.round((currentRatio - previousRatio) * 10) / 10 : null;

  return [
    {
      metric: 'Total Income', icon: 'income', current: current.income, previous: previous?.income ?? null,
      change: incomeChange, changeLabel: incomeChange !== null ? `${incomeChange >= 0 ? '+' : ''}${incomeChange}%` : '—',
      direction: incomeChange === null ? null : incomeChange >= 0 ? 'up' : 'down', good: incomeChange === null ? null : incomeChange >= 0,
      trend: incomeTrend,
    },
    {
      metric: 'Total Expenditure', icon: 'expenditure', current: current.expenditure, previous: previous?.expenditure ?? null,
      change: expenditureChange, changeLabel: expenditureChange !== null ? `${expenditureChange >= 0 ? '+' : ''}${expenditureChange}%` : '—',
      direction: expenditureChange === null ? null : expenditureChange >= 0 ? 'up' : 'down', good: expenditureChange === null ? null : expenditureChange < 0,
      trend: expenditureTrend,
    },
    {
      metric: 'Surplus / (Deficit)', icon: 'scale', current: currentSurplus, previous: previousSurplus,
      change: surplusChange, changeLabel: surplusChange !== null ? `${surplusChange >= 0 ? '+' : ''}${surplusChange}%` : '—',
      direction: surplusChange === null ? null : surplusChange >= 0 ? 'up' : 'down', good: surplusChange === null ? null : surplusChange >= 0,
      trend: surplusTrend,
    },
    {
      metric: 'Expenditure Ratio', icon: 'percent', current: `${currentRatio.toFixed(1)}%`, previous: previousRatio !== null ? `${previousRatio.toFixed(1)}%` : null,
      change: ratioChangePp, changeLabel: ratioChangePp !== null ? `${ratioChangePp >= 0 ? '+' : '−'}${Math.abs(ratioChangePp)} pp` : '—',
      direction: ratioChangePp === null ? null : ratioChangePp >= 0 ? 'up' : 'down', good: ratioChangePp === null ? null : ratioChangePp <= 0,
      trend: ratioTrend,
    },
  ];
}

function buildInsights(summary, keyFinancialTrends) {
  if (!summary) return [];
  const insights = [];

  const income = keyFinancialTrends.find((m) => m.metric === 'Total Income');
  const expenditure = keyFinancialTrends.find((m) => m.metric === 'Total Expenditure');
  const surplus = keyFinancialTrends.find((m) => m.metric === 'Surplus / (Deficit)');
  const ratio = keyFinancialTrends.find((m) => m.metric === 'Expenditure Ratio');

  if (income?.change !== null && income?.change !== undefined) {
    insights.push(`Income ${income.change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(income.change)}% (${formatNaira(Math.abs(income.current - (income.previous ?? income.current)))}) compared to the prior term.`);
  }
  if (expenditure?.change !== null && expenditure?.change !== undefined) {
    const pace = income?.change !== null && income?.change !== undefined
      ? `, ${expenditure.change < income.change ? 'at a slower rate than income' : 'at a faster rate than income'}.`
      : '.';
    insights.push(`Expenditure ${expenditure.change >= 0 ? 'grew' : 'fell'} by ${Math.abs(expenditure.change)}%${pace}`);
  }
  if (surplus?.change !== null && surplus?.change !== undefined) {
    insights.push(`Surplus ${surplus.change >= 0 ? 'improved' : 'declined'} by ${Math.abs(surplus.change)}% to ${formatNaira(surplus.current)}.`);
  }
  if (ratio?.change !== null && ratio?.change !== undefined) {
    insights.push(`Expenditure ratio ${ratio.change <= 0 ? 'reduced' : 'rose'} to ${ratio.current} (${ratio.change >= 0 ? '+' : '−'}${Math.abs(ratio.change)} percentage points), ${ratio.change <= 0 ? 'indicating better cost control' : 'indicating rising cost pressure'}.`);
  }

  return insights;
}

const TrendAnalysisTab = ({ data, loading }) => {
  const theme = useTheme();

  const summary = data?.summary;
  const trendData = data?.trend || [];
  const surplusDeficitTrend = useMemo(() => trendData.map((t) => ({ term: t.term, value: t.income - t.expenditure })), [trendData]);
  const keyFinancialTrends = useMemo(() => buildKeyFinancialTrends(trendData), [trendData]);
  const insights = useMemo(() => buildInsights(summary, keyFinancialTrends), [summary, keyFinancialTrends]);

  const totalIncome = summary?.total_income ?? 0;
  const totalExpenditure = summary?.total_expenditure ?? 0;
  const surplus = summary?.surplus ?? 0;
  const expenditurePct = summary?.expenditure_ratio ?? 0;
  const surplusPct = totalIncome > 0 ? Math.round((surplus / totalIncome) * 1000) / 10 : 0;

  const currentLabel = trendData[trendData.length - 1]?.term || 'Current Term';
  const previousLabel = trendData.length >= 2 ? trendData[trendData.length - 2].term : 'N/A';

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconChartAreaLine size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                  Income vs Expenditure Trend (Last 7 Terms)
                </Typography>
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
                  { dataKey: 'income', name: 'Income', color: '#16A34A' },
                  { dataKey: 'expenditure', name: 'Expenditure', color: '#2563EB' },
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
                <IconChartBar size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Surplus / (Deficit) Trend</Typography>
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
                <BarChart data={surplusDeficitTrend} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f0f0'} />
                  <XAxis dataKey="term" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                  <Tooltip formatter={(v) => formatNaira(v)} />
                  <Bar dataKey="value" name="Surplus" fill="#A78BFA" radius={[6, 6, 0, 0]} barSize={26} label={<SurplusDeficitBarLabel />} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ParentCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconReportAnalytics size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Key Financial Trends</Typography>
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
                  <TableCell sx={thCell} align="right">Current Term ({currentLabel})</TableCell>
                  <TableCell sx={thCell} align="right">Previous Term ({previousLabel})</TableCell>
                  <TableCell sx={thCell} align="right">Change</TableCell>
                  <TableCell sx={thCell}>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {Array.from({ length: 5 }).map((__, cellIdx) => (
                        <TableCell key={cellIdx} sx={tdCell}>
                          <Skeleton variant="text" height={18} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : keyFinancialTrends.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                      No data for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  keyFinancialTrends.map((row) => {
                    const Icon = METRIC_ICONS[row.icon] || IconCoins;
                    const DirectionIcon = row.direction === 'down' ? IconArrowDownRight : IconArrowUpRight;
                    const changeColor = row.good === null ? theme.palette.text.secondary : row.good ? '#15803D' : '#DC2626';
                    return (
                      <TableRow key={row.metric} hover>
                        <TableCell sx={tdCell}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Icon size={15} color={theme.palette.text.secondary} />
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{row.metric}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">
                          {typeof row.current === 'number' ? formatNaira(row.current) : row.current}
                        </TableCell>
                        <TableCell sx={{ ...tdCell, color: 'text.secondary' }} align="right">
                          {row.previous === null ? '—' : typeof row.previous === 'number' ? formatNaira(row.previous) : row.previous}
                        </TableCell>
                        <TableCell sx={{ ...tdCell, color: changeColor, fontWeight: 700 }} align="right">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                            {row.direction && <DirectionIcon size={13} />}
                            {row.changeLabel}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdCell, width: 90 }}>
                          <ReusableSparkline
                            data={row.trend.map((v) => ({ v }))}
                            dataKey="v"
                            color={changeColor === theme.palette.text.secondary ? theme.palette.primary.main : changeColor}
                            height={28}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ParentCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconChartDonut size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Income-Expenditure Composition</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            {loading ? (
              <Box sx={{ minHeight: 160 + 8 + 2 * 20 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={148} height={148} />
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
                    { name: 'Expenditure', value: totalExpenditure, color: '#2563EB' },
                    { name: 'Surplus', value: Math.max(surplus, 0), color: '#16A34A' },
                  ]}
                  height={160}
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={2}
                  centerValue={formatCompact(totalIncome)}
                  centerTitle="Total Income"
                  valueFontSize={16}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {[
                    { name: 'Expenditure', color: '#2563EB', value: totalExpenditure, pct: expenditurePct },
                    { name: 'Surplus', color: '#16A34A', value: surplus, pct: surplusPct },
                  ].map((row) => (
                    <Box key={row.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>
                        {row.name} ({row.pct}%)
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                        {formatCompact(row.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <InsightsCard title="Insights & Analysis" items={insights} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendAnalysisTab;
