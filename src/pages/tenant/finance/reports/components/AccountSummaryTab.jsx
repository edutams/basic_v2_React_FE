import React, { useMemo } from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Skeleton, useTheme } from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconClipboardList, IconChartLine, IconChartDonut } from '@tabler/icons';
import InsightsCard from './InsightsCard';
import ActionsCard from './ActionsCard';
import { CATEGORY_DOT_COLORS, formatCompact, formatNaira } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const StatementRowsSkeleton = ({ rows = 3 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <TableRow key={idx}>
        <TableCell sx={tdCell}>
          <Skeleton variant="text" width="70%" />
        </TableCell>
        <TableCell sx={tdCell} align="right">
          <Skeleton variant="text" width="60%" sx={{ ml: 'auto' }} />
        </TableCell>
        <TableCell sx={tdCell} align="right">
          <Skeleton variant="text" width="40%" sx={{ ml: 'auto' }} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

const SectionBand = ({ label, color }) => (
  <TableRow>
    <TableCell colSpan={3} sx={{ bgcolor: color, fontWeight: 700, fontSize: 13, py: 0.75, px: 1.25 }}>
      {label}
    </TableCell>
  </TableRow>
);

/**
 * Builds the same style of plain-English bullets the original mockup
 * showed ("The school recorded a surplus of..."), but templated from the
 * real numbers the summary endpoint returns, instead of fixed mock text.
 */
function buildInsights(summary, incomeRows, expenditureRows) {
  if (!summary) return [];
  const insights = [];
  const surplusPct = summary.total_income > 0 ? Math.abs((summary.surplus / summary.total_income) * 100).toFixed(1) : '0.0';
  insights.push(
    `The school recorded a ${summary.surplus >= 0 ? 'surplus' : 'deficit'} of ${formatNaira(Math.abs(summary.surplus))} (${surplusPct}% of income) for the period.`,
  );

  if (summary.total_income_change_pct !== null && summary.total_income_change_pct !== undefined) {
    insights.push(
      `Total income ${summary.total_income_change_pct >= 0 ? 'grew' : 'declined'} by ${Math.abs(summary.total_income_change_pct)}% compared to the comparison period.`,
    );
  }

  if (summary.total_expenditure_change_pct !== null && summary.total_expenditure_change_pct !== undefined) {
    const comparisonNote =
      summary.total_income_change_pct !== null && summary.total_income_change_pct !== undefined
        ? `, which is ${summary.total_expenditure_change_pct < summary.total_income_change_pct ? 'below' : 'above'} the income growth rate.`
        : '.';
    insights.push(
      `Total expenditure ${summary.total_expenditure_change_pct >= 0 ? 'increased' : 'decreased'} by ${Math.abs(summary.total_expenditure_change_pct)}%${comparisonNote}`,
    );
  }

  if (expenditureRows.length >= 2) {
    const top2 = expenditureRows.slice(0, 2);
    const top2Pct = summary.total_expenditure > 0 ? ((top2[0].amount + top2[1].amount) / summary.total_expenditure * 100).toFixed(1) : '0.0';
    insights.push(`${top2[0].item} and ${top2[1].item} account for ${top2Pct}% of total expenditure.`);
  } else if (expenditureRows.length === 1) {
    insights.push(`${expenditureRows[0].item} accounts for all of total expenditure for the period.`);
  }

  return insights;
}

function buildActions(summary, expenditureRows, outstandingBalance) {
  const actions = [];
  if (outstandingBalance > 0) {
    actions.push({
      type: 'outstanding',
      icon: 'database',
      title: 'Review outstanding payments',
      description: `(${formatNaira(outstandingBalance)}) and raise installments.`,
    });
  }
  if (expenditureRows.length >= 2) {
    actions.push({
      type: 'high_cost',
      icon: 'chart',
      title: 'Monitor high-cost categories',
      description: `(${expenditureRows[0].item} & ${expenditureRows[1].item}).`,
    });
  } else if (expenditureRows.length === 1) {
    actions.push({ type: 'high_cost', icon: 'chart', title: 'Monitor high-cost categories', description: `(${expenditureRows[0].item}).` });
  }
  actions.push({ type: 'projection', icon: 'calendar', title: 'Project next term’s income and expenditure.', description: '' });
  return actions;
}

const AccountSummaryTab = ({ data, loading, onAction }) => {
  const theme = useTheme();

  const summary = data?.summary;
  const incomeRows = data?.statement?.income_rows || [];
  const expenditureRows = data?.statement?.expenditure_rows || [];
  const trend = data?.trend || [];
  const expenditureByCategory = data?.expenditure_by_category || [];

  const totalExpenditurePctOfIncome = summary?.expenditure_ratio ?? 0;
  const surplusPctOfIncome = summary && summary.total_income > 0 ? ((summary.surplus / summary.total_income) * 100).toFixed(1) : 0;

  const insights = useMemo(() => buildInsights(summary, incomeRows, expenditureRows), [summary, incomeRows, expenditureRows]);
  const actions = useMemo(
    () => buildActions(summary, expenditureRows, summary?.outstanding_expenditure_balance ?? 0),
    [summary, expenditureRows],
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Statement table — Income and Expenditure side by side (each its
            own scroll area) instead of one long stacked table, so a long
            account list can't dwarf the Key Insights/Next Steps cards on
            the right and leave them looking cut off. */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ParentCard
            title={
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconClipboardList size={17} color={theme.palette.primary.main} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Income &amp; Expenditure Account</Typography>
                </Box>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25 }}>
                  For the {data?.period?.label || 'selected period'}
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
              '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1, minWidth: 0, borderRight: { sm: `1px solid ${theme.palette.divider}` } }}>
                <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                        <TableCell sx={thCell}>Item</TableCell>
                        <TableCell sx={thCell} align="right">
                          Amount (₦)
                        </TableCell>
                        <TableCell sx={thCell} align="right">
                          %
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SectionBand label="Income" color="#DCFCE7" />
                      {loading ? (
                        <StatementRowsSkeleton />
                      ) : incomeRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                            No income posted for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        incomeRows.map((row) => (
                          <TableRow key={row.item} hover>
                            <TableCell sx={tdCell}>{row.item}</TableCell>
                            <TableCell sx={tdCell} align="right">
                              {row.amount.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={tdCell} align="right">
                              {row.pct_of_income}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ bgcolor: '#DCFCE7' }}>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Income</TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                        {formatNaira(summary?.total_income ?? 0)}
                      </TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                        100.0%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                        <TableCell sx={thCell}>Item</TableCell>
                        <TableCell sx={thCell} align="right">
                          Amount (₦)
                        </TableCell>
                        <TableCell sx={thCell} align="right">
                          %
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SectionBand label="Expenditure" color="#FEE2E2" />
                      {loading ? (
                        <StatementRowsSkeleton />
                      ) : expenditureRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                            No expenditure posted for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenditureRows.map((row) => (
                          <TableRow key={row.item} hover>
                            <TableCell sx={tdCell}>{row.item}</TableCell>
                            <TableCell sx={tdCell} align="right">
                              {row.amount.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={tdCell} align="right">
                              {row.pct_of_income}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ bgcolor: '#FEE2E2' }}>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Expenditure</TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                        {formatNaira(summary?.total_expenditure ?? 0)}
                      </TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                        {totalExpenditurePctOfIncome}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#DBEAFE',
                borderTop: `1px solid ${theme.palette.divider}`,
                px: 1.25,
                py: 0.75,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Surplus / (Deficit)</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                {formatNaira(summary?.surplus ?? 0)} ({surplusPctOfIncome}%)
              </Typography>
            </Box>
          </ParentCard>
        </Grid>

        {/* Right column: trend + category row, then insights + actions stacked under them */}
        <Grid size={{ xs: 12, lg: 6 }}>
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
                {loading ? (
                  <Box sx={{ height: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
                    {[85, 65, 75, 50, 70].map((w, idx) => (
                      <Skeleton key={idx} variant="text" width={`${w}%`} height={18} />
                    ))}
                  </Box>
                ) : (
                  <ReusableTrendChart
                    data={trend}
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
                )}
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
                <ExpenditureByCategoryMini data={expenditureByCategory} loading={loading} />
              </ParentCard>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InsightsCard items={insights} loading={loading} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ActionsCard items={actions} onItemClick={(action) => onAction?.(action.type)} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

const ExpenditureByCategoryMini = ({ data, loading }) => {
  const total = data.reduce((sum, c) => sum + c.value, 0) || 1;
  if (loading) {
    return (
      <Box sx={{ minHeight: 260 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={140} height={140} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="text" width={`${70 - idx * 10}%`} />
          ))}
        </Box>
      </Box>
    );
  }
  if (data.length === 0) {
    // Reserves the same height the donut + legend would occupy with data,
    // instead of collapsing the card down to a single line of text.
    return (
      <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No expenditure posted yet.</Typography>
      </Box>
    );
  }
  return (
    <>
      <Box sx={{ width: '100%', mb: 1 }}>
        <ReusableDonutChart
          data={data.map((c, idx) => ({
            name: c.name,
            value: c.value,
            color: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length],
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
        {data.map((c, idx) => {
          const pct = ((c.value / total) * 100).toFixed(0);
          return (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length], flexShrink: 0 }} />
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
