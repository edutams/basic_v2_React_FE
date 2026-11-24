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
import ReusableTrendChart from '@/components/shared/charts/ReusableTrendChart';
import { IconClipboardList, IconCalendarEvent, IconChevronRight, IconChevronDown, IconCircleCheck } from '@tabler/icons';
import InsightsCard from '../../components/InsightsCard';
import {
  liabilityAccounts,
  recentLiabilityTransactions,
  liabilityTrend,
  liabilityDetailsInsights,
  balanceSheetStats,
  COLORS,
  formatCompact,
  formatNaira,
  formatDateDisplay,
} from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const GroupBand = ({ group, color }) => (
  <TableRow sx={{ bgcolor: color }}>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconChevronDown size={14} />
        {group.label}
      </Box>
    </TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{group.records}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{group.balance.toLocaleString('en-NG')}</TableCell>
    <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{group.pct}%</TableCell>
  </TableRow>
);

const LiabilitiesDetailsTab = () => {
  const theme = useTheme();
  const totalRecords = liabilityAccounts.nonCurrent.records + liabilityAccounts.current.records;

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
                <TableCell sx={thCell} align="right">No. of Records</TableCell>
                <TableCell sx={thCell} align="right">Balance (₦)</TableCell>
                <TableCell sx={thCell} align="right">% of Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <GroupBand group={liabilityAccounts.nonCurrent} color="#DBEAFE" />
              {liabilityAccounts.nonCurrent.rows.map((row) => (
                <TableRow key={row.account} hover>
                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
                      <IconChevronRight size={12} color={theme.palette.text.disabled} />
                      {row.account}
                    </Box>
                  </TableCell>
                  <TableCell sx={tdCell} align="right">{row.records}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.balance.toLocaleString('en-NG')}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
                </TableRow>
              ))}

              <GroupBand group={liabilityAccounts.current} color="#DCFCE7" />
              {liabilityAccounts.current.rows.map((row) => (
                <TableRow key={row.account} hover>
                  <TableCell sx={tdCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 2 }}>
                      <IconChevronRight size={12} color={theme.palette.text.disabled} />
                      {row.account}
                    </Box>
                  </TableCell>
                  <TableCell sx={tdCell} align="right">{row.records}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.balance.toLocaleString('en-NG')}</TableCell>
                  <TableCell sx={tdCell} align="right">{row.pct}%</TableCell>
                </TableRow>
              ))}

              <TableRow sx={{ bgcolor: '#F3E8FF' }}>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }}>Total Liabilities</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{totalRecords}</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">{formatNaira(balanceSheetStats.totalLiabilities)}</TableCell>
                <TableCell sx={{ ...tdCell, fontWeight: 800 }} align="right">100.0%</TableCell>
              </TableRow>
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
                <TableCell sx={thCell}>Liability Account</TableCell>
                <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
                <TableCell sx={thCell}>Type</TableCell>
                <TableCell sx={thCell}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentLiabilityTransactions.map((row) => (
                <TableRow key={`${row.date}-${row.description}`} hover>
                  <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{formatDateDisplay(row.date)}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 600 }}>{row.description}</TableCell>
                  <TableCell sx={tdCell}>{row.account}</TableCell>
                  <TableCell sx={{ ...tdCell, fontWeight: 700 }} align="right">
                    {row.amount < 0 ? `(${Math.abs(row.amount).toLocaleString('en-NG')})` : row.amount.toLocaleString('en-NG')}
                  </TableCell>
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
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Liabilities Composition</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
            }}
          >
            <ReusableDonutChart
              data={[
                { name: 'Non-Current Liabilities', value: liabilityAccounts.nonCurrent.balance, color: COLORS.nonCurrentLiabilities },
                { name: 'Current Liabilities', value: liabilityAccounts.current.balance, color: COLORS.currentLiabilities },
              ]}
              height={150}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              centerValue={formatCompact(balanceSheetStats.totalLiabilities)}
              centerTitle="Total Liabilities"
              valueFontSize={16}
              tooltipFormatter={(value, name) => [formatNaira(value), name]}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.nonCurrentLiabilities, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Non-Current Liabilities</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {formatCompact(liabilityAccounts.nonCurrent.balance)} ({liabilityAccounts.nonCurrent.pct}%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.currentLiabilities, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, flexGrow: 1 }}>Current Liabilities</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {formatCompact(liabilityAccounts.current.balance)} ({liabilityAccounts.current.pct}%)
                </Typography>
              </Box>
            </Box>
          </ParentCard>

          <ParentCard
            title={<Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Liability Trend (Last 4 Terms)</Typography>}
            sx={{
              '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
              '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
            }}
          >
            <ReusableTrendChart
              data={liabilityTrend}
              nameKey="term"
              series={[
                { dataKey: 'total', name: 'Total Liabilities', color: COLORS.liabilities },
                { dataKey: 'nonCurrent', name: 'Non-Current', color: COLORS.nonCurrentLiabilities },
                { dataKey: 'current', name: 'Current', color: COLORS.currentLiabilities },
              ]}
              type="line"
              height={190}
              showDots
              valueFormatter={formatCompact}
              cardSx={{ border: 'none' }}
            />
          </ParentCard>

          <InsightsCard items={liabilityDetailsInsights} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default LiabilitiesDetailsTab;
