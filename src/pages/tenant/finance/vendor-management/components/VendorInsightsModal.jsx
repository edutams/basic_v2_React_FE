import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Chip,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Skeleton,
  useTheme,
} from '@mui/material';
import { IconX, IconUsers, IconCoins, IconCalendar, IconCircleCheck } from '@tabler/icons';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import { fetchVendorTransactions } from '@/api/tenant/finance/vendorApi';
import { STATUS_META, formatNaira, formatCompact } from '../constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25 };
const tdCell = { py: 0.75, px: 1.25 };

const Stat = ({ icon: Icon, value, label, bg, color }) => (
  <Box sx={{ bgcolor: bg, borderRadius: '10px', p: 1.25, textAlign: 'center', minHeight: 72 }}>
    <Icon size={18} color={color} style={{ marginBottom: 4 }} />
    <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{value}</Typography>
    <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{label}</Typography>
  </Box>
);

/**
 * "Full data" drill-down for the Vendor Intelligence card's "View Insights"
 * button — the untruncated stats/spend-trend/quick-insights the card already
 * has, plus the vendor's actual transaction history (every Post Expenditure/
 * Post Income entry naming this vendor), which the compact card has no room
 * for and nothing else in the app surfaces.
 */
const VendorInsightsModal = ({ open, onClose, vendor }) => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  useEffect(() => {
    if (!open || !vendor?.id) return;
    setLoading(true);
    fetchVendorTransactions(vendor.id, { page, per_page: 10 })
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { last_page: 1, total: 0 });
      })
      .catch(() => {
        setRows([]);
        setMeta({ last_page: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [open, page, vendor?.id]);

  if (!vendor) return null;

  const statusMeta = STATUS_META[vendor.is_active ? 'Active' : 'Inactive'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{vendor.name}</Typography>
          <Chip
            label={vendor.is_active ? 'Active' : 'Inactive'}
            size="small"
            sx={{ bgcolor: statusMeta?.bg, color: statusMeta?.color, fontWeight: 700 }}
          />
        </Box>
        <IconButton size="small" onClick={onClose}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={4}>
            <Stat icon={IconUsers} value={vendor.transactions ?? 0} label="Transactions" bg="#DBEAFE" color="#2563EB" />
          </Grid>
          <Grid size={4}>
            <Stat icon={IconCoins} value={formatNaira(vendor.total_spend ?? 0)} label="Total Spend" bg="#DCFCE7" color="#16A34A" />
          </Grid>
          <Grid size={4}>
            <Stat icon={IconCalendar} value={vendor.years_active ?? 0} label="Years Active" bg="#FEF3C7" color="#D97706" />
          </Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Spend Trend (Last 12 Months)</Typography>
        <ReusableAreaChart
          data={vendor.spend_trend || []}
          nameKey="month"
          dataKey="spend"
          name="Spend"
          color={theme.palette.primary.main}
          height={180}
          valueFormatter={formatCompact}
        />

        <Box sx={{ bgcolor: '#DCFCE7', borderRadius: '10px', p: 1.5, mt: 2, mb: 2, minHeight: 90 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.75 }}>Quick Insights</Typography>
          {(vendor.quick_insights || []).length === 0 ? (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No activity with this vendor yet.</Typography>
          ) : (
            vendor.quick_insights.map((text) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 0.5, '&:last-of-type': { mb: 0 } }}>
                <IconCircleCheck size={14} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5 }}>{text}</Typography>
              </Box>
            ))
          )}
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Transaction History</Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={thCell}>Date</TableCell>
              <TableCell sx={thCell}>Type</TableCell>
              <TableCell sx={thCell}>Account</TableCell>
              <TableCell sx={thCell}>Reference</TableCell>
              <TableCell sx={thCell} align="right">Amount (₦)</TableCell>
              <TableCell sx={thCell}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 6 }).map((__, colIdx) => (
                    <TableCell key={colIdx} sx={tdCell}>
                      <Skeleton variant="text" height={18} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ ...tdCell, py: 3, color: 'text.secondary' }}>
                  No transactions with this vendor yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={`${row.date}-${row.reference}-${idx}`} hover>
                  <TableCell sx={tdCell}>{row.date}</TableCell>
                  <TableCell sx={tdCell}>
                    <Chip
                      label={row.type === 'income' ? 'Income' : 'Expenditure'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: 10.5,
                        bgcolor: row.type === 'income' ? '#DCFCE7' : '#FEE2E2',
                        color: row.type === 'income' ? '#16A34A' : '#DC2626',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={tdCell}>{row.account || '—'}</TableCell>
                  <TableCell sx={tdCell}>{row.reference || '—'}</TableCell>
                  <TableCell sx={tdCell} align="right">{formatNaira(row.amount)}</TableCell>
                  <TableCell sx={{ ...tdCell, textTransform: 'capitalize' }}>{row.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.25 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
          {meta.total} transaction{meta.total === 1 ? '' : 's'} total
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Pagination count={meta.last_page} page={page} onChange={(_, val) => setPage(val)} shape="rounded" size="small" />
          <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VendorInsightsModal;
