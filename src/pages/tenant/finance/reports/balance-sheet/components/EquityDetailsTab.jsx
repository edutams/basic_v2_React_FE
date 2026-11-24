import React from 'react';
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
import { IconClipboardList, IconCalendarEvent, IconChevronRight, IconChevronDown, IconCircleCheck, IconArrowUpRight } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import EquityTrendChart from './EquityTrendChart';
import {
  equityAccounts,
  recentEquityTransactions,
  equityTrend,
  equityDetailsInsights,
  balanceSheetStats,
  COLORS,
  formatCompact,
  formatNaira,
  formatDateDisplay,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const formatAmount = (n) => (n < 0 ? `(${Math.abs(n).toLocaleString('en-NG')})` : n.toLocaleString('en-NG'));
const formatPct = (n) => (n < 0 ? `(${Math.abs(n).toFixed(1)}%)` : `${n}%`);

const GroupBand = ({ group, color }) => (
  <TableRow sx={{ bgcolor: color }}>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconChevronDown size={14} />
        {group.label}
      </Box>
    </TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatAmount(group.balance)}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatPct(group.pct)}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{group.movement >= 0 ? `+${group.movement.toLocaleString('en-NG')}` : formatAmount(group.movement)}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#15803D' }} align="right">
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        <IconArrowUpRight size={13} />
        {group.changeLabel}
      </Box>
    </TableCell>
  </TableRow>
);

const EquityDetailsTab = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <ParentCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconClipboardList size={17} color={theme.palette.primary.main} />
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Equity Accounts (Chart of Accounts)</Typography>
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
                <TableCell sx={thCell}>Account / Equity Category</TableCell>
                <TableCell sx={thCell} align="right">Balance (₦)</TableCell>
                <TableCell sx={thCell} align="right">% of Total Equity</TableCell>
                <TableCell sx={thCell} align="right">Movement (₦)</TableCell>
                <TableCell sx={thCell} align="right">Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <GroupBand group={equityAccounts.accumulatedSurplus} color="#DBEAFE" />
              {equityAccounts.accumulatedSurplus.rows.map((row) => (
                <TableRow key={row.account} hover>
                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
                      <IconChevronRight size={12} color={theme.palette.text.disabled} />
                      {row.account}
                    </Box>
                  </TableCell>
                  <TableCell sx={tdCell} align="right">{formatAmount(row.balance)}</TableCell>
                  <TableCell sx={tdCell} align="right">{formatPct(row.pct)}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.movement === 0 ? '–' : (row.movement > 0 ? `+${row.movement.toLocaleString('en-NG')}` : formatAmount(row.movement))}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.changeLabel}</TableCell>
                </TableRow>
              ))}

              <GroupBand group={equityAccounts.currentPeriodSurplus} color="#DCFCE7" />
              {equityAccounts.currentPeriodSurplus.rows.map((row) => (
                <TableRow key={row.account} hover>
                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
                      <IconChevronRight size={12} color={theme.palette.text.disabled} />
                      {row.account}
                    </Box>
                  </TableCell>
                  <TableCell sx={tdCell} align="right">{formatAmount(row.balance)}</TableCell>
                  <TableCell sx={tdCell} align="right">{formatPct(row.pct)}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.movement > 0 ? `+${row.movement.toLocaleString('en-NG')}` : formatAmount(row.movement)}</TableCell>
                  <TableCell sx={{ ...tdCell, color: '#15803D' }} align="right">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <IconArrowUpRight size={13} />
                      {row.changeLabel}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow sx={{ bgcolor: '#F3E8FF' }}>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Equity (Net Assets)</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(balanceSheetStats.netAssets)}</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">+110,000</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800, color: '#15803D' }} align="right">
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                    <IconArrowUpRight size={13} />+10.1%
                  </Box>
                </TableCell>
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
              {recentEquityTransactions.map((row) => (
                <TableRow key={`${row.date}-${row.description}`} hover>
                  <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplay(row.date)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}</TableCell>
                  <TableCell sx={tdCell}>{row.account}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">{formatAmount(row.amount)}</TableCell>
                  <TableCell sx={tdCell}>{row.type}</TableCell>
                  <TableCell sx={tdCell}>
                    <Chip label={row.status} size="small" icon={<IconCircleCheck size={12} />} sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 11, height: 22 }} />
                  </TableCell>
                </TableRow>
              ))}
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
            <ReusableDonutChart
              data={[
                { name: 'Accumulated Surplus', value: equityAccounts.accumulatedSurplus.balance, color: COLORS.accumulatedSurplus },
                { name: 'Current Period Surplus', value: equityAccounts.currentPeriodSurplus.balance, color: COLORS.currentPeriodSurplus },
              ]}
              height={150}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              centerValue={formatCompact(balanceSheetStats.netAssets)}
              centerTitle="Total Equity"
              valueFontSize={16}
              tooltipFormatter={(value, name) => [formatNaira(value), name]}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.accumulatedSurplus, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Accumulated Surplus</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {formatCompact(equityAccounts.accumulatedSurplus.balance)} ({equityAccounts.accumulatedSurplus.pct}%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.currentPeriodSurplus, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Current Period Surplus</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {formatCompact(equityAccounts.currentPeriodSurplus.balance)} ({equityAccounts.currentPeriodSurplus.pct}%)
                </Typography>
              </Box>
            </Box>
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Equity Trend (Last 4 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            <EquityTrendChart data={equityTrend} />
          </ParentCard>

          <InsightsCard items={equityDetailsInsights} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default EquityDetailsTab;
