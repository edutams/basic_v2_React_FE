import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { IconClipboardList, IconCalendarEvent, IconChevronRight, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons';
import InsightsCard from './InsightsCard';
import { CATEGORY_DOT_COLORS, formatCompact, formatNaira } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

function formatDateDisplayLocal(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Plain-English bullets templated from the real income_details response,
 * matching AccountSummaryTab's buildInsights pattern.
 */
function buildInsights(stats, incomeByAccount) {
  if (!stats) return [];
  const insights = [];

  if (stats.total_income_change_pct !== null && stats.total_income_change_pct !== undefined) {
    insights.push(
      `Total income is ${formatNaira(stats.total_income)}, ${stats.total_income_change_pct >= 0 ? 'up' : 'down'} by ${Math.abs(stats.total_income_change_pct)}% compared to the comparison period.`,
    );
  } else {
    insights.push(`Total income is ${formatNaira(stats.total_income)} for the period.`);
  }

  if (stats.top_account_name) {
    insights.push(`${stats.top_account_name} accounts for ${stats.top_account_share_pct}% of total income (${formatNaira(incomeByAccount[0]?.amount ?? 0)}).`);
  }

  if (incomeByAccount.length > 1) {
    const restPct = incomeByAccount.slice(1).reduce((sum, r) => sum + r.pct_of_total, 0).toFixed(1);
    insights.push(`The remaining ${incomeByAccount.length - 1} account${incomeByAccount.length - 1 === 1 ? '' : 's'} contributed ${restPct}% of total income.`);
  }

  if (stats.school_fees_collection_rate !== null && stats.school_fees_collection_rate !== undefined) {
    insights.push(`School fees collection rate is ${stats.school_fees_collection_rate}% for the period.`);
  }

  return insights;
}

const IncomeDetailsTab = ({ data, loading }) => {
  const theme = useTheme();

  const stats = data?.stats;
  const incomeByAccount = data?.income_by_account || [];
  const recentTransactions = data?.recent_transactions || [];
  const composition = data?.composition || [];
  const trend = data?.trend || [];
  const totalComposition = composition.reduce((sum, c) => sum + c.value, 0);

  const insights = useMemo(() => buildInsights(stats, incomeByAccount), [stats, incomeByAccount]);

  return (
    <Grid container spacing={2}>
      {/* ===================== Left ===================== */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconClipboardList size={17} color={theme.palette.primary.main} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Income by Account</Typography>
            </Box>
          }
          sx={{
            '& .MuiCardHeader-root': { pb: 1, pt: 1.5, px: 2 },
            '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
            mb: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                <TableCell sx={thCell}>#</TableCell>
                <TableCell sx={thCell}>Income Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell} align="right">% of Total</TableCell>
                <TableCell sx={thCell} align="right">vs. Prior Term</TableCell>
                <TableCell sx={thCell}>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomeByAccount.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    {loading ? 'Loading…' : 'No income posted for this period.'}
                  </TableCell>
                </TableRow>
              ) : (
                incomeByAccount.map((row, idx) => {
                  const color = CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length];
                  const hasChange = row.vs_prior_term_pct !== null && row.vs_prior_term_pct !== undefined;
                  const isUp = hasChange && row.vs_prior_term_pct >= 0;
                  return (
                    <TableRow key={row.account} hover>
                      <TableCell sx={tdCell}>{idx + 1}</TableCell>
                      <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.account}</TableCell>
                      <TableCell sx={tdCell} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                      <TableCell sx={tdCell} align="right">{row.pct_of_total}%</TableCell>
                      <TableCell sx={{ ...tdCell, color: hasChange ? (isUp ? '#15803D' : '#B91C1C') : 'text.secondary', fontWeight: 600 }} align="right">
                        {hasChange ? (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                            {isUp ? <IconArrowUpRight size={13} /> : <IconArrowDownRight size={13} />}
                            {isUp ? '+' : ''}{row.vs_prior_term_pct}%
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ ...tdCell, width: 110 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 70 }}>
                            <ReusableSparkline
                              data={row.trend.map((v) => ({ v }))}
                              dataKey="v"
                              color={color}
                              height={28}
                            />
                          </Box>
                          <IconChevronRight size={14} color={theme.palette.text.disabled} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              <TableRow sx={{ bgcolor: '#DCFCE7' }}>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} colSpan={2}>Total Income</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">
                  {formatNaira(stats?.total_income ?? 0)}
                </TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#15803D' }} align="right">
                  {stats?.total_income_change_pct !== null && stats?.total_income_change_pct !== undefined
                    ? `${stats.total_income_change_pct >= 0 ? '+' : ''}${stats.total_income_change_pct}%`
                    : '—'}
                </TableCell>
                <TableCell sx={tdCell} />
              </TableRow>
            </TableBody>
          </Table>
        </ParentCard>

        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconCalendarEvent size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Income Transactions</Typography>
              </Box>
              <Button
                size="small"
                endIcon={<IconChevronRight size={14} />}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}
              >
                View All Transactions
              </Button>
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
                <TableCell sx={thCell}>Date</TableCell>
                <TableCell sx={thCell}>Description / Payer</TableCell>
                <TableCell sx={thCell}>Income Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    {loading ? 'Loading…' : 'No income transactions for this period.'}
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((row, idx) => (
                  <TableRow key={`${row.date}-${row.description}-${idx}`} hover>
                    <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplayLocal(row.date)}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}{row.payer ? ` – ${row.payer}` : ''}</TableCell>
                    <TableCell sx={tdCell}>{row.account}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{row.amount.toLocaleString('en-NG')}</TableCell>
                    <TableCell sx={tdCell}>
                      <Chip
                        label="Received"
                        size="small"
                        icon={<IconArrowUpRight size={12} />}
                        sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11, height: 22 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ParentCard>
      </Grid>

      {/* ===================== Right ===================== */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Income Composition</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            {composition.length === 0 ? (
              <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {loading ? 'Loading…' : 'No income posted yet.'}
                </Typography>
              </Box>
            ) : (
              <>
                <ReusableDonutChart
                  data={composition.map((c, idx) => ({
                    name: c.name,
                    value: c.value,
                    color: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length],
                  }))}
                  height={150}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  centerValue={formatCompact(totalComposition)}
                  centerTitle="Total Income"
                  valueFontSize={16}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {composition.map((c, idx) => {
                    const color = CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length];
                    const pct = totalComposition > 0 ? ((c.value / totalComposition) * 100).toFixed(0) : 0;
                    return (
                      <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>
                          {c.name} ({pct}%)
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                          {formatCompact(c.value)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Income Trend (Last 7 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1 } },
            }}
          >
            <ReusableAreaChart
              data={trend}
              nameKey="term"
              dataKey="income"
              name="Income"
              color={theme.palette.success.main}
              height={180}
              showLabels={false}
              valueFormatter={formatCompact}
            />
          </ParentCard>

          <InsightsCard items={insights} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default IncomeDetailsTab;
