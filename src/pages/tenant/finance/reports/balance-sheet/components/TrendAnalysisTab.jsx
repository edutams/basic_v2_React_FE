import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconChartAreaLine, IconChartDonut, IconChartBar, IconReportAnalytics, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import {
  financialStructure,
  periodMovementAnalysis,
  financialRatiosTrend,
  trendAnalysisInsights,
  balanceSheetStats,
  COLORS,
  formatCompact,
  formatNaira,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

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
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Financial Position Trend (Last 7 Terms)</Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            <ReusableTrendChart
              data={periodMovementAnalysis}
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
            <ReusableDonutChart
              data={[
                { name: 'Equity (Net Assets)', value: financialStructure[0].value, color: COLORS.equity },
                { name: 'Liabilities', value: financialStructure[1].value, color: COLORS.liabilities },
              ]}
              height={180}
              innerRadius={60}
              outerRadius={84}
              paddingAngle={2}
              centerValue={formatCompact(balanceSheetStats.totalAssets)}
              centerTitle="Total Assets"
              valueFontSize={17}
              tooltipFormatter={(value, name) => [formatNaira(value), name]}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
              {financialStructure.map((c, idx) => (
                <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === 0 ? COLORS.equity : COLORS.liabilities, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary' }}>
                    {formatCompact(c.value)} ({c.pct}%)
                  </Typography>
                </Box>
              ))}
            </Box>
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
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={periodMovementAnalysis} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
                {financialRatiosTrend.map((row) => {
                  const DirectionIcon = row.direction === 'up' ? IconArrowUpRight : IconArrowDownRight;
                  const color = row.good ? '#15803D' : '#DC2626';
                  return (
                    <TableRow key={row.metric} hover>
                      <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.metric}</TableCell>
                      <TableCell sx={{ ...tdCell, color: 'text.secondary' }} align="right">{row.previous}</TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{row.current}</TableCell>
                      <TableCell sx={{ ...tdCell, color, fontWeight: 700 }} align="right">
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                          <DirectionIcon size={13} />
                          {row.changeLabel}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <InsightsCard title="Key Insights" items={trendAnalysisInsights} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendAnalysisTab;
