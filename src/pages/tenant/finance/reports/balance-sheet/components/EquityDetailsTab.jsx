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
import {
  IconClipboardList,
  IconCalendarEvent,
  IconChevronRight,
  IconCircleCheck,
  IconArrowUpRight,
  IconArrowDownRight,
  IconInfoCircle,
} from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import { COLORS, formatCompact, formatNaira, formatDateDisplay } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const formatAmount = (n) => (n < 0 ? `(${Math.abs(n).toLocaleString('en-NG')})` : n.toLocaleString('en-NG'));

function buildInsights(stats) {
  if (!stats) return [];
  const insights = [];

  if (stats.total_equity_change_pct !== null && stats.total_equity_change_pct !== undefined) {
    insights.push(`Total equity (net assets) is ${formatNaira(stats.total_equity)}, ${stats.total_equity_change_pct >= 0 ? 'up' : 'down'} by ${Math.abs(stats.total_equity_change_pct)}% from the comparison period.`);
  } else {
    insights.push(`Total equity (net assets) is ${formatNaira(stats.total_equity)} for the selected period.`);
  }

  insights.push(`Accumulated surplus from prior terms accounts for ${stats.accumulated_surplus_pct}% (${formatNaira(stats.accumulated_surplus)}) of total equity.`);
  insights.push(`Current period surplus is ${formatNaira(stats.current_period_surplus)} (${stats.current_period_surplus_pct}% of equity).`);

  if (stats.equity_ratio !== null && stats.equity_ratio !== undefined) {
    insights.push(`Equity ratio is ${stats.equity_ratio}% of total assets.`);
  }

  return insights;
}

const EquityDetailsTab = ({ data, loading }) => {
  const theme = useTheme();

  const stats = data?.stats;
  const accounts = data?.accounts || [];
  const recentTransactions = data?.recent_transactions || [];
  const composition = data?.composition || [];
  const trend = data?.trend || [];

  const insights = useMemo(() => buildInsights(stats), [stats]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconClipboardList size={17} color={theme.palette.primary.main} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Equity (Chart of Accounts + Trading Surplus)</Typography>
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
                <TableCell sx={thCell}>Account / Equity Component</TableCell>
                <TableCell sx={thCell} align="right">Balance (₦)</TableCell>
                <TableCell sx={thCell} align="right">% of Total Equity</TableCell>
                <TableCell sx={thCell}>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    {loading ? 'Loading…' : 'No equity posted yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((row, idx) => (
                  <TableRow key={row.account} hover>
                    <TableCell sx={tdCell}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {row.account}
                        {idx < 2 && <IconInfoCircle size={12} color={theme.palette.text.disabled} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={tdCell} align="right">{formatAmount(row.balance)}</TableCell>
                    <TableCell sx={tdCell} align="right">{row.pct_of_total}%</TableCell>
                    <TableCell sx={{ ...tdCell, width: 90 }}>
                      {row.trend?.length > 0 && (
                        <ReusableSparkline data={row.trend.map((v) => ({ v }))} dataKey="v" color={COLORS.equity} height={24} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}

              <TableRow sx={{ bgcolor: '#F3E8FF' }}>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Equity (Net Assets)</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(stats?.total_equity ?? 0)}</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
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
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Equity Transactions</Typography>
              </Box>
              <Button size="small" endIcon={<IconChevronRight size={14} />} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}>
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
                <TableCell sx={thCell}>Description / Purpose</TableCell>
                <TableCell sx={thCell}>Equity Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    {loading ? 'Loading…' : 'No equity transactions for this period. (Most schools only post directly to Equity for one-off events like an investor contribution or a loan converted to equity.)'}
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((row, idx) => (
                  <TableRow key={`${row.date}-${row.description}-${idx}`} hover>
                    <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplay(row.date)}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}</TableCell>
                    <TableCell sx={tdCell}>{row.account}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{formatAmount(row.amount)}</TableCell>
                    <TableCell sx={tdCell}>{row.type}</TableCell>
                    <TableCell sx={tdCell}>
                      <Chip label="Posted" size="small" icon={<IconCircleCheck size={12} />} sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11, height: 22 }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ParentCard>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Equity Composition</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            {composition.length === 0 ? (
              <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{loading ? 'Loading…' : 'No equity posted yet.'}</Typography>
              </Box>
            ) : (
              <>
                <ReusableDonutChart
                  data={composition.map((c, idx) => ({ name: c.name, value: c.value, color: Object.values(COLORS)[idx % 7] }))}
                  height={150}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  centerValue={formatCompact(stats?.total_equity ?? 0)}
                  centerTitle="Total Equity"
                  valueFontSize={16}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {composition.map((c, idx) => (
                    <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: Object.values(COLORS)[idx % 7], flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{formatCompact(c.value)}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Equity Trend (Last 7 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            <ReusableAreaChart
              data={trend}
              nameKey="term"
              dataKey="equity"
              name="Total Equity"
              color={COLORS.equity}
              height={190}
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

export default EquityDetailsTab;
