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
  Skeleton,
  useTheme,
} from '@mui/material';
import ParentCard from '@/components/shared/ParentCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import { IconClipboardList, IconCalendarEvent, IconChevronRight, IconArrowUpRight, IconArrowDownRight, IconInfoCircle } from '@tabler/icons';
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
function pctChange(current, previous) {
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

// `cardsTotalIncome` (sum of the cards-scoped `incomeByAccount` rows) is the
// amount actually described by this card's own breakdown — `stats.total_income`
// is the separate, independent stats-dropdown period and can legitimately
// be a different term entirely. The one exception is `total_income_change_pct`,
// which is specifically the stats-period-vs-compare-period growth figure by
// design, so that one clause stays sourced from `stats`.
function buildInsights(stats, incomeByAccount, cardsTotalIncome, vendorConcentration) {
  if (!stats) return [];
  const insights = [];

  if (stats.total_income_change_pct !== null && stats.total_income_change_pct !== undefined) {
    insights.push(
      `Total income is ${formatNaira(cardsTotalIncome)}, ${stats.total_income_change_pct >= 0 ? 'up' : 'down'} by ${Math.abs(stats.total_income_change_pct)}% compared to the comparison period.`,
    );
  } else {
    insights.push(`Total income is ${formatNaira(cardsTotalIncome)} for the period.`);
  }

  if (stats.cards_top_account_name) {
    insights.push(`${stats.cards_top_account_name} accounts for ${stats.cards_top_account_share_pct}% of total income (${formatNaira(incomeByAccount[0]?.amount ?? 0)}).`);
  }

  if (incomeByAccount.length > 1) {
    const restPct = incomeByAccount.slice(1).reduce((sum, r) => sum + r.pct_of_total, 0).toFixed(1);
    insights.push(`The remaining ${incomeByAccount.length - 1} account${incomeByAccount.length - 1 === 1 ? '' : 's'} contributed ${restPct}% of total income.`);
  }

  if (stats.cards_school_fees_collection_rate !== null && stats.cards_school_fees_collection_rate !== undefined) {
    insights.push(`School fees collection rate is ${stats.cards_school_fees_collection_rate}% for the period.`);
  }

  if (vendorConcentration.length >= 1) {
    insights.push(`${vendorConcentration[0].vendor} is the top payer/source by income, accounting for ${vendorConcentration[0].share_pct}% of total income.`);
  }

  return insights;
}

const IncomeDetailsTab = ({ data, loading, onViewAllTransactions }) => {
  const theme = useTheme();

  const stats = data?.stats;
  const incomeByAccount = data?.income_by_account || [];
  const recentTransactions = data?.recent_transactions || [];
  const composition = data?.composition || [];
  const trend = data?.trend || [];
  const vendorConcentration = data?.vendor_concentration || [];
  const totalComposition = composition.reduce((sum, c) => sum + c.value, 0);

  // Cards-scoped total — this table's own footer must match the rows it's
  // actually totaling, not the separate stats-dropdown period's figure.
  const cardsTotalIncome = incomeByAccount.reduce((sum, row) => sum + Number(row.amount), 0);
  const cardsIncomeChangePct = (() => {
    const current = trend[trend.length - 1]?.income;
    const prior = trend.length >= 2 ? trend[trend.length - 2]?.income : null;
    return pctChange(current, prior);
  })();

  const insights = useMemo(
    () => buildInsights(stats, incomeByAccount, cardsTotalIncome, vendorConcentration),
    [stats, incomeByAccount, cardsTotalIncome, vendorConcentration],
  );

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
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 6 }).map((__, cellIdx) => (
                      <TableCell key={cellIdx} sx={tdCell}>
                        <Skeleton variant="text" height={18} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : incomeByAccount.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    No income posted for this period.
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
                  {formatNaira(cardsTotalIncome)}
                </TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#15803D' }} align="right">
                  {cardsIncomeChangePct !== null
                    ? `${cardsIncomeChangePct >= 0 ? '+' : ''}${cardsIncomeChangePct}%`
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
                onClick={onViewAllTransactions}
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
              ) : recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    No income transactions for this period.
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

        {/* Vendor Concentration — same ranked-table shape as the widget already
            built on Post Income/Post Expenditure (dot + rank, actual/paid/
            balance/share), just backed by one grouped query here instead of
            client-derived from raw entries. */}
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Vendor Concentration</Typography>
              <IconInfoCircle size={13} color={theme.palette.text.disabled} />
            </Box>
          }
          sx={{
            '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
            '& .MuiCardContent-root': { p: 1, '&:last-child': { pb: 1 } },
          }}
        >
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', px: 0.75, mb: 0.5 }}>
            (Top 5 Payers / Sources)
          </Typography>
          <Box sx={{ maxHeight: 240, overflowX: 'auto', overflowY: 'auto' }}>
            <Table size="small" sx={{ minWidth: 480 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...thCell, px: 0.75 }}>#</TableCell>
                  <TableCell sx={{ ...thCell, px: 0.75 }}>Payer / Source</TableCell>
                  <TableCell sx={{ ...thCell, px: 0.75 }} align="right">Actual (₦)</TableCell>
                  <TableCell sx={{ ...thCell, px: 0.75 }} align="right">Received (₦)</TableCell>
                  <TableCell sx={{ ...thCell, px: 0.75 }} align="right">Balance (₦)</TableCell>
                  <TableCell sx={{ ...thCell, px: 0.75 }} align="right">Share</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {Array.from({ length: 6 }).map((__, cellIdx) => (
                        <TableCell key={cellIdx} sx={{ px: 0.75, py: 0.5 }}>
                          <Skeleton variant="text" height={16} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : vendorConcentration.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ px: 0.75, py: 3, fontSize: 12, color: 'text.secondary' }}>
                      No payer/source income yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorConcentration.map((v, idx) => (
                    <TableRow key={v.vendor} hover>
                      <TableCell sx={{ px: 0.75, py: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORY_DOT_COLORS[idx % CATEGORY_DOT_COLORS.length], display: 'inline-block', mr: 0.75 }} />
                        {idx + 1}
                      </TableCell>
                      <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 600, fontSize: 12.5 }}>{v.vendor}</TableCell>
                      <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5 }} align="right">{v.actual.toLocaleString('en-NG')}</TableCell>
                      <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: '#15803D' }} align="right">{v.paid.toLocaleString('en-NG')}</TableCell>
                      <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: v.balance ? '#B45309' : 'text.disabled' }} align="right">{v.balance.toLocaleString('en-NG')}</TableCell>
                      <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 12.5 }} align="right">{v.share_pct}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
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
            {loading ? (
              <Box sx={{ minHeight: 260 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={140} height={140} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {[70, 55, 60].map((w, idx) => (
                    <Skeleton key={idx} variant="text" width={`${w}%`} />
                  ))}
                </Box>
              </Box>
            ) : composition.length === 0 ? (
              <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No income posted yet.</Typography>
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
            {loading ? (
              <Box sx={{ height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
                {[80, 60, 70, 45].map((w, idx) => (
                  <Skeleton key={idx} variant="text" width={`${w}%`} height={16} />
                ))}
              </Box>
            ) : (
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
            )}
          </ParentCard>

          <InsightsCard items={insights} loading={loading} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default IncomeDetailsTab;
