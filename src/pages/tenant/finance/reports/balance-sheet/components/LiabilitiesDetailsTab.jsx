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
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import ReusableSparkline from '@/components/shared/charts/ReusableSparkline';
import {
  IconClipboardList,
  IconCalendarEvent,
  IconChevronRight,
  IconChevronDown,
  IconCircleCheck,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import { COLORS, formatCompact, formatNaira, formatDateDisplay } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const GroupBand = ({ label, color, records, balance }) => (
  <TableRow sx={{ bgcolor: color }}>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconChevronDown size={14} />
        {label}
      </Box>
    </TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{records}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{balance.toLocaleString('en-NG')}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} />
  </TableRow>
);

function buildInsights(stats, accounts) {
  if (!stats) return [];
  const insights = [];

  if (stats.total_change_pct !== null && stats.total_change_pct !== undefined) {
    insights.push(`Total liabilities are ${formatNaira(stats.total)}, ${stats.total_change_pct >= 0 ? 'up' : 'down'} by ${Math.abs(stats.total_change_pct)}% from the comparison period.`);
  } else {
    insights.push(`Total liabilities are ${formatNaira(stats.total)} for the selected period.`);
  }

  insights.push(`Non-current liabilities account for ${stats.non_current_pct}% (${formatNaira(stats.non_current)}) of total liabilities.`);
  insights.push(`Current liabilities account for ${stats.current_pct}% (${formatNaira(stats.current)}) of total liabilities.`);

  const topMover = accounts.filter((a) => a.movement).sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))[0];
  if (topMover) {
    insights.push(`${topMover.account} moved by ${formatNaira(Math.abs(topMover.movement))} (${topMover.movement >= 0 ? '+' : '-'}${Math.abs(topMover.movement_pct ?? 0)}%) since the comparison period.`);
  }

  return insights;
}

const LiabilitiesDetailsTab = ({ data, loading, onViewAllTransactions }) => {
  const theme = useTheme();

  const stats = data?.stats;
  const accounts = data?.accounts || [];
  const recentTransactions = data?.recent_transactions || [];
  const composition = (data?.composition || []).filter((c) => c.value !== 0);
  const trend = data?.trend || [];

  const nonCurrentAccounts = accounts.filter((a) => a.classification === 'non_current');
  const currentAccounts = accounts.filter((a) => a.classification === 'current');

  const insights = useMemo(() => buildInsights(stats, accounts), [stats, accounts]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconClipboardList size={17} color={theme.palette.primary.main} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Liability Accounts (Chart of Accounts)</Typography>
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
                <TableCell sx={thCell}>Account / Liability Category</TableCell>
                <TableCell sx={thCell} align="right">Records</TableCell>
                <TableCell sx={thCell} align="right">Balance (₦)</TableCell>
                <TableCell sx={thCell}>Trend</TableCell>
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
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    No liabilities posted yet.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <GroupBand label="A. Non-Current Liabilities" color="#DBEAFE" records={nonCurrentAccounts.reduce((s, a) => s + (a.record_count || 0), 0)} balance={stats?.non_current ?? 0} />
                  {nonCurrentAccounts.map((row) => (
                    <AccountRow key={row.account} row={row} />
                  ))}

                  <GroupBand label="B. Current Liabilities" color="#DCFCE7" records={currentAccounts.reduce((s, a) => s + (a.record_count || 0), 0)} balance={stats?.current ?? 0} />
                  {currentAccounts.map((row) => (
                    <AccountRow key={row.account} row={row} />
                  ))}

                  <TableRow sx={{ bgcolor: '#F3E8FF' }}>
                    <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{stats?.record_count ?? 0}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(stats?.total ?? 0)}</TableCell>
                    <TableCell sx={tdCell} />
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </ParentCard>

        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconCalendarEvent size={17} color={theme.palette.primary.main} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Recent Liability Transactions</Typography>
              </Box>
              <Button size="small" endIcon={<IconChevronRight size={14} />} onClick={onViewAllTransactions} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}>
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
                <TableCell sx={thCell}>Liability Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Status</TableCell>
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
              ) : recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                    No liability transactions for this period.
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((row, idx) => (
                  <TableRow key={`${row.date}-${row.description}-${idx}`} hover>
                    <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplay(row.date)}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}</TableCell>
                    <TableCell sx={tdCell}>{row.account}</TableCell>
                    <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">
                      {row.amount < 0 ? `(${Math.abs(row.amount).toLocaleString('en-NG')})` : row.amount.toLocaleString('en-NG')}
                    </TableCell>
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
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Liabilities Composition</Typography>}
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
                  {[70, 55].map((w, idx) => (
                    <Skeleton key={idx} variant="text" width={`${w}%`} />
                  ))}
                </Box>
              </Box>
            ) : composition.length === 0 ? (
              <Box sx={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No liabilities posted yet.</Typography>
              </Box>
            ) : (
              <>
                <ReusableDonutChart
                  data={[
                    { name: 'Non-Current Liabilities', value: stats?.non_current ?? 0, color: COLORS.nonCurrentLiabilities },
                    { name: 'Current Liabilities', value: stats?.current ?? 0, color: COLORS.currentLiabilities },
                  ]}
                  height={150}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  centerValue={formatCompact(stats?.total ?? 0)}
                  centerTitle="Total Liabilities"
                  valueFontSize={16}
                  tooltipFormatter={(value, name) => [formatNaira(value), name]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.nonCurrentLiabilities, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Non-Current Liabilities</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{formatCompact(stats?.non_current ?? 0)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.currentLiabilities, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Current Liabilities</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>{formatCompact(stats?.current ?? 0)}</Typography>
                  </Box>
                </Box>
              </>
            )}
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Liability Trend (Last 7 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            {loading ? (
              <Box sx={{ height: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, px: 1 }}>
                {[80, 60, 70, 45].map((w, idx) => (
                  <Skeleton key={idx} variant="text" width={`${w}%`} height={16} />
                ))}
              </Box>
            ) : (
              <ReusableTrendChart
                data={trend}
                nameKey="term"
                series={[
                  { dataKey: 'total', name: 'Total Liabilities', color: COLORS.liabilities },
                  { dataKey: 'non_current', name: 'Non-Current', color: COLORS.nonCurrentLiabilities },
                  { dataKey: 'current', name: 'Current', color: COLORS.currentLiabilities },
                ]}
                type="line"
                height={190}
                showDots
                valueFormatter={formatCompact}
                cardSx={{ border: 'none' }}
              />
            )}
          </ParentCard>

          <InsightsCard items={insights} loading={loading} />
        </Box>
      </Grid>
    </Grid>
  );
};

const AccountRow = ({ row }) => {
  const theme = useTheme();
  const hasMovement = row.movement_pct !== null && row.movement_pct !== undefined;
  const isUp = hasMovement && row.movement_pct >= 0;

  return (
    <TableRow hover>
      <TableCell sx={tdCell}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
          <IconChevronRight size={12} color={theme.palette.text.disabled} />
          {row.account}
        </Box>
      </TableCell>
      <TableCell sx={tdCell} align="right">{row.record_count}</TableCell>
      <TableCell sx={tdCell} align="right">{row.balance.toLocaleString('en-NG')}</TableCell>
      <TableCell sx={{ ...tdCell, width: 110 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 50 }}>
            <ReusableSparkline data={row.trend.map((v) => ({ v }))} dataKey="v" color={hasMovement ? (isUp ? '#DC2626' : '#15803D') : COLORS.liabilities} height={24} />
          </Box>
          {hasMovement && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: isUp ? '#DC2626' : '#15803D', fontSize: 11, fontWeight: 700 }}>
              {isUp ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
              {Math.abs(row.movement_pct)}%
            </Box>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default LiabilitiesDetailsTab;
