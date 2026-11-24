import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconClipboardList, IconChartLine, IconChartDonut } from '@tabler/icons';
import InsightsCard from './InsightsCard';
import ActionsCard from './ActionsCard';
import {
  statementIncomeRows,
  statementExpenditureRows,
  incomeVsExpenditureTrend,
  expenditureByCategory,
  EXPENSE_CATEGORY_META,
  summaryStats,
  accountSummaryInsights,
  actionsNextSteps,
  formatCompact,
  formatNaira,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const SectionBand = ({ label, color }) => (
  <TableRow>
    <TableCell colSpan={3} sx={{ bgcolor: color, fontWeight: 700, fontSize: 13, py: 0.75, px: 1.25 }}>
      {label}
    </TableCell>
  </TableRow>
);

const AccountSummaryTab = () => {
  const theme = useTheme();
  const totalExpenditurePctOfIncome = (summaryStats.totalExpenditure / summaryStats.totalIncome) * 100;
  const surplusPctOfIncome = (summaryStats.surplus / summaryStats.totalIncome) * 100;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Statement table */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <ParentCard
            title={
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconClipboardList size={17} color={theme.palette.primary.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Income &amp; Expenditure Account</Typography>
                </Box>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25 }}>
                  For the First Term, 2025/2026
                </Typography>
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
                  <TableCell sx={thCell}>Item</TableCell>
                  <TableCell sx={thCell} align="right">
                    Amount (₦)
                  </TableCell>
                  <TableCell sx={thCell} align="right">
                    % of Income
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <SectionBand label="Income" color="#DCFCE7" />
                {statementIncomeRows.map((row) => (
                  <TableRow key={row.item} hover>
                    <TableCell sx={tdCell}>{row.item}</TableCell>
                    <TableCell sx={tdCell} align="right">
                      {row.amount.toLocaleString('en-NG')}
                    </TableCell>
                    <TableCell sx={tdCell} align="right">
                      {row.pctOfIncome}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#DCFCE7' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Income</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {formatNaira(summaryStats.totalIncome)}
                  </TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    100.0%
                  </TableCell>
                </TableRow>

                <SectionBand label="Expenditure" color="#FEE2E2" />
                {statementExpenditureRows.map((row) => (
                  <TableRow key={row.item} hover>
                    <TableCell sx={tdCell}>{row.item}</TableCell>
                    <TableCell sx={tdCell} align="right">
                      {row.amount.toLocaleString('en-NG')}
                    </TableCell>
                    <TableCell sx={tdCell} align="right">
                      {row.pctOfIncome}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#FEE2E2' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Expenditure</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {formatNaira(summaryStats.totalExpenditure)}
                  </TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {totalExpenditurePctOfIncome.toFixed(1)}%
                  </TableCell>
                </TableRow>

                <TableRow sx={{ bgcolor: '#DBEAFE' }}>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Surplus / (Deficit)</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {formatNaira(summaryStats.surplus)}
                  </TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                    {surplusPctOfIncome.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ParentCard>
        </Grid>

        {/* Right column: trend + category row, then insights + actions stacked under them */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Income vs Expenditure trend */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconChartLine size={17} color={theme.palette.primary.main} />
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Income vs Expenditure Trend</Typography>
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
                  type="line"
                  height={230}
                  showDots
                  valueFormatter={formatCompact}
                  cardSx={{ border: 'none' }}
                />
              </ParentCard>
            </Grid>

            {/* Expenditure by category */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconChartDonut size={17} color={theme.palette.primary.main} />
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Expenditure by Category</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 2 },
                  '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
                }}
              >
                <ExpenditureByCategoryMini />
              </ParentCard>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InsightsCard items={accountSummaryInsights} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ActionsCard items={actionsNextSteps} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

const ExpenditureByCategoryMini = () => {
  const total = expenditureByCategory.reduce((sum, c) => sum + c.value, 0);
  return (
    <>
      <Box sx={{ width: '100%', mb: 1 }}>
        <ReusableDonutChart
          data={expenditureByCategory.map((c) => ({
            name: c.name,
            value: c.value,
            color: EXPENSE_CATEGORY_META[c.name].color,
          }))}
          height={140}
          innerRadius={46}
          outerRadius={64}
          paddingAngle={2}
          centerValue={formatCompact(total)}
          centerTitle="Total"
          valueFontSize={15}
          tooltipFormatter={(value, name) => [`₦${Number(value).toLocaleString('en-NG')}`, name]}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {expenditureByCategory.map((c) => {
          const meta = EXPENSE_CATEGORY_META[c.name];
          const pct = ((c.value / total) * 100).toFixed(0);
          return (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary' }}>{pct}%</Typography>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default AccountSummaryTab;
