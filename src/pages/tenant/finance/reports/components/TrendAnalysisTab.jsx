import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
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
  IconTarget,
} from '@tabler/icons';
import InsightsCard from './InsightsCard';
import {
  incomeVsExpenditureTrend,
  surplusDeficitTrend,
  keyFinancialTrends,
  incomeExpenditureComposition,
  trendAnalysisInsights,
  summaryStats,
  formatCompact,
  formatNaira,
} from '../constants';

const METRIC_ICONS = {
  income: IconCoins,
  expenditure: IconReportMoney,
  scale: IconScale,
  percent: IconPercentage,
  target: IconTarget,
};

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const SurplusDeficitBarLabel = (props) => {
  const { x, y, width, value } = props;
  const text = formatCompact(value);
  return (
    <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#7C3AED">
      {text}
    </text>
  );
};

const TrendAnalysisTab = () => {
  const theme = useTheme();

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
            <ReusableTrendChart
              data={incomeVsExpenditureTrend}
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
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={surplusDeficitTrend} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f0f0f0'} />
                <XAxis dataKey="term" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                <Tooltip formatter={(v) => formatNaira(v)} />
                <Bar dataKey="value" name="Surplus" fill="#A78BFA" radius={[6, 6, 0, 0]} barSize={26} label={<SurplusDeficitBarLabel />} />
              </BarChart>
            </ResponsiveContainer>
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
                  <TableCell sx={thCell} align="right">Current Term (T1, 2025/2026)</TableCell>
                  <TableCell sx={thCell} align="right">Previous Term (T1, 2024/2025)</TableCell>
                  <TableCell sx={thCell} align="right">Change</TableCell>
                  <TableCell sx={thCell}>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keyFinancialTrends.map((row) => {
                  const Icon = METRIC_ICONS[row.icon] || IconCoins;
                  const DirectionIcon = row.direction === 'up' ? IconArrowUpRight : IconArrowDownRight;
                  const changeColor = row.good ? '#15803D' : '#DC2626';
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
                        {typeof row.previous === 'number' ? formatNaira(row.previous) : row.previous}
                      </TableCell>
                      <TableCell sx={{ ...tdCell, color: changeColor, fontWeight: 700 }} align="right">
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                          <DirectionIcon size={13} />
                          {row.changeLabel}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...tdCell, width: 90 }}>
                        <ReusableSparkline
                          data={row.trend.map((v) => ({ v }))}
                          dataKey="v"
                          color={changeColor}
                          height={28}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            <ReusableDonutChart
              data={[
                { name: 'Expenditure', value: incomeExpenditureComposition[0].value, color: '#2563EB' },
                { name: 'Surplus', value: incomeExpenditureComposition[1].value, color: '#16A34A' },
              ]}
              height={160}
              innerRadius={54}
              outerRadius={74}
              paddingAngle={2}
              centerValue={formatCompact(summaryStats.totalIncome)}
              centerTitle="Total Income"
              valueFontSize={16}
              tooltipFormatter={(value, name) => [formatNaira(value), name]}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              {[
                { name: 'Expenditure', color: '#2563EB', value: incomeExpenditureComposition[0] },
                { name: 'Surplus', color: '#16A34A', value: incomeExpenditureComposition[1] },
              ].map((row) => (
                <Box key={row.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>
                    {row.name} ({row.value.pct}%)
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                    {formatCompact(row.value.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <InsightsCard title="Insights & Analysis" items={trendAnalysisInsights} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendAnalysisTab;
