import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Checkbox,
  useTheme,
  Skeleton,
  Menu,
  Pagination,
  Alert,
  Divider,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import PostingTrendChart from './components/PostingTrendChart';
import PostExpenditureModal from './components/PostExpenditureModal';
import {
  IconLayersIntersect,
  IconSearch,
  IconPlus,
  IconDownload,
  IconChevronDown,
  IconCalendar,
  IconCircleCheck,
  IconClockHour4,
  IconUsers,
  IconChartBar,
  IconInfoCircle,
  IconBulb,
  IconEye,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  EXPENSE_CATEGORY_META,
  STATUS_TABS,
  mockExpenditures,
  expenditureByCategory,
  postingTrend,
  vendorConcentration,
  keyInsights,
  keyInsightsRecommendation,
  summaryStats,
  formatNaira,
  formatCompact,
} from './constants';

const thCell = { fontWeight: 700, py: 1, px: 1.25, whiteSpace: 'nowrap' };
const tdCell = { py: 0.75, px: 1.25 };

const VENDOR_DOT_COLORS = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#64748B'];

const PostExpenditure = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [expenditures] = useState(mockExpenditures);
  const [activeStatus, setActiveStatus] = useState('Pending Approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [postExpenditureOpen, setPostExpenditureOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = useMemo(() => {
    return expenditures.filter((row) => {
      const matchesStatus = activeStatus === 'All' || row.status === activeStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        row.refNo.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.vendor.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [expenditures, activeStatus, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAllOnPage = () => {
    const pageIds = paginatedData.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])],
    );
  };
  const clearSelection = () => setSelectedIds([]);

  const selectedRows = expenditures.filter((r) => selectedIds.includes(r.id));
  const selectedInstallmentTotal = selectedRows.reduce((sum, r) => sum + (r.requestAmount || 0), 0);

  const statusLabel = STATUS_TABS.find((s) => s.value === activeStatus)?.label.toLowerCase() || '';

  return (
    <PageContainer title="Post Expenditure" description="Record, approve and post school expenditure">
      <Box sx={{ mt: 1 }}>
        {/* ===================== Header ===================== */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconLayersIntersect size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Post Expenditure
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Record, approve and post school expenditure (goods, services and operational costs),
                with installment payments.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => setPostExpenditureOpen(true)}
            startIcon={<IconPlus size={18} />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Post Expenditure
          </Button>
        </Box>

        {/* ===================== Stats (full row) ===================== */}
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Expenditure (Actual Value)"
              count={formatNaira(summaryStats.totalExpenditure)}
              subtitle={`↑ +${summaryStats.totalExpenditureChangePct}% vs. last term`}
              icon={IconLayersIntersect}
              colorIndex={0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Paid"
              count={formatNaira(summaryStats.totalPaid)}
              subtitle={`${summaryStats.totalPaidPctOfActual}% of actual`}
              icon={IconCircleCheck}
              colorIndex={1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Outstanding Balance"
              count={formatNaira(summaryStats.outstandingBalance)}
              subtitle={`${summaryStats.outstandingPctOfActual}% of actual`}
              icon={IconClockHour4}
              colorIndex={3}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              align="left"
              subtitleAfterValue
              loading={loading}
              label="Total Vendors (in Use)"
              count={summaryStats.totalVendorsInUse}
              icon={IconUsers}
              colorIndex={2}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {/* ===================== Left: table ===================== */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <ParentCard
              sx={{
                '& .MuiCardContent-root': { p: 2, pt: 1.5, '&:last-child': { pb: 1 } },
              }}
            >
              {/* ===================== Status pills ===================== */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {STATUS_TABS.map((tab) => {
                  const active = activeStatus === tab.value;
                  return (
                    <Chip
                      key={tab.value}
                      label={`${tab.label} (${tab.count})`}
                      onClick={() => {
                        setActiveStatus(tab.value);
                        setPage(1);
                      }}
                      sx={{
                        fontWeight: 700,
                        borderRadius: '8px',
                        bgcolor: active ? theme.palette.primary.main : 'transparent',
                        color: active ? '#fff' : 'text.secondary',
                        border: '1px solid',
                        borderColor: active ? theme.palette.primary.main : theme.palette.divider,
                        '&:hover': {
                          bgcolor: active ? theme.palette.primary.dark : theme.palette.action.hover,
                        },
                      }}
                    />
                  );
                })}
              </Box>

              {/* ===================== Search + filters ===================== */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by ref. no., description, vendor or account..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value="01 Nov 2025 – 14 Nov 2025"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconCalendar size={16} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <Select defaultValue="all" sx={{ borderRadius: '8px' }}>
                      <MenuItem value="all">All (Full & Installment)</MenuItem>
                      <MenuItem value="full">Full Payment</MenuItem>
                      <MenuItem value="installment">Installment Payment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    endIcon={<IconChevronDown size={14} />}
                    startIcon={<IconDownload size={16} />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, height: '100%' }}
                  >
                    Export
                  </Button>
                </Grid>
              </Grid>

              {/* ===================== Bulk selection bar ===================== */}
              {selectedIds.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.12)' : '#EFF6FF',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.3)' : '#BFDBFE'}`,
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCircleCheck size={16} color={theme.palette.primary.main} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      {selectedIds.length} selected
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      Total Installment: {formatNaira(selectedInstallmentTotal)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<IconCircleCheck size={15} />}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Approve Selected ({selectedIds.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Reject Selected ({selectedIds.length})
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={clearSelection}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Clear Selection
                    </Button>
                  </Box>
                </Box>
              )}

              {/* ===================== Table ===================== */}
              <TableContainer>
                <Table size="small" sx={{ minWidth: 980 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }} padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={
                            paginatedData.length > 0 &&
                            paginatedData.every((r) => selectedIds.includes(r.id))
                          }
                          indeterminate={
                            paginatedData.some((r) => selectedIds.includes(r.id)) &&
                            !paginatedData.every((r) => selectedIds.includes(r.id))
                          }
                          onChange={toggleAllOnPage}
                        />
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Ref. No.
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Description
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Vendor / Supplier
                      </TableCell>
                      <TableCell colSpan={3} align="center" sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>
                        Expenditure
                      </TableCell>
                      <TableCell colSpan={2} align="center" sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>
                        Payment Request
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ ...thCell, verticalAlign: 'bottom', borderLeft: `1px solid ${theme.palette.divider}` }}>
                        Balance After (₦)
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ ...thCell, verticalAlign: 'bottom' }}>
                        Action
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        '& .MuiTableCell-root': { borderBottom: `2px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>Actual (₦)</TableCell>
                      <TableCell sx={thCell}>Paid (₦)</TableCell>
                      <TableCell sx={thCell}>Balance (₦)</TableCell>
                      <TableCell sx={{ ...thCell, borderLeft: `1px solid ${theme.palette.divider}` }}>Amount (₦)</TableCell>
                      <TableCell sx={thCell}>Installment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: 10 }).map((__, cellIdx) => (
                            <TableCell key={cellIdx} sx={tdCell}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((row) => {
                        const categoryMeta = EXPENSE_CATEGORY_META[row.category];
                        const isSelected = selectedIds.includes(row.id);
                        return (
                          <TableRow key={row.id} hover selected={isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox size="small" checked={isSelected} onChange={() => toggleRow(row.id)} />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700, color: theme.palette.primary.main }}>
                              {row.refNo}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600, maxWidth: 180 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.description}</Typography>
                              <Chip
                                label={row.category}
                                size="small"
                                sx={{
                                  bgcolor: categoryMeta.bg,
                                  color: categoryMeta.color,
                                  fontWeight: 700,
                                  fontSize: 10.5,
                                  height: 18,
                                  mt: 0.25,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{row.vendor}</TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600 }}>
                              {row.actual.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, color: '#15803D', fontWeight: 600 }}>
                              {row.paid.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, color: row.balance ? '#B45309' : 'text.disabled', fontWeight: 600 }}>
                              {row.balance.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700 }}>
                              {row.requestAmount ? row.requestAmount.toLocaleString('en-NG') : '–'}
                            </TableCell>
                            <TableCell sx={tdCell}>
                              <Chip
                                label={row.installmentLabel}
                                size="small"
                                sx={{
                                  bgcolor: row.installmentStatus === 'final' ? '#DCFCE7' : '#DBEAFE',
                                  color: row.installmentStatus === 'final' ? '#15803D' : '#1D4ED8',
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700 }}>
                              {row.balanceAfter.toLocaleString('en-NG')}
                            </TableCell>
                            <TableCell sx={tdCell} align="center">
                              <IconButton size="small">
                                <IconEye size={16} />
                              </IconButton>
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Alert severity="info" sx={{ my: 2, justifyContent: 'center' }}>
                            {searchQuery
                              ? 'No records match the current search.'
                              : `No ${statusLabel} entries found yet.`}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 1,
                  pt: 1.5,
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {filteredData.length === 0
                    ? `Showing 0 of 0 ${statusLabel} entries`
                    : `Showing ${(safePage - 1) * rowsPerPage + 1}–${Math.min(
                        safePage * rowsPerPage,
                        filteredData.length,
                      )} of ${filteredData.length} ${statusLabel} entries`}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={safePage}
                  onChange={(_, val) => setPage(val)}
                  shape="rounded"
                  color="primary"
                  size="small"
                />
              </Box>
            </ParentCard>
          </Grid>

          {/* ===================== Right: insights ===================== */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Expenditure by Category */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconChartBar size={18} color={theme.palette.primary.main} />
                      <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>
                        Expenditure by Category
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: 12.5 }}
                    >
                      View Details
                    </Button>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
                  '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 1 }}>
                  (Actual Value)
                </Typography>
                <ExpenditureByCategory theme={theme} />
              </ParentCard>

              {/* Posting Trend */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Posting Trend</Typography>
                      <IconInfoCircle size={13} color={theme.palette.text.disabled} />
                    </Box>
                    <Chip
                      label="Last 7 Terms"
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 11.5, bgcolor: theme.palette.action.hover }}
                    />
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.25, px: 1.75 },
                  '& .MuiCardContent-root': { p: 1.5, pt: 0.5, '&:last-child': { pb: 1 } },
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 0.5 }}>
                  (Actual, Paid &amp; Balance)
                </Typography>
                <PostingTrendChart data={postingTrend} />
              </ParentCard>

              {/* Vendor Concentration */}
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
                  (Top 5 Vendors)
                </Typography>
                <Box sx={{ maxHeight: 240, overflowX: 'auto', overflowY: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 480 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...thCell, px: 0.75 }}>#</TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }}>Vendor / Supplier</TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Actual (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Paid (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Balance (₦)
                        </TableCell>
                        <TableCell sx={{ ...thCell, px: 0.75 }} align="right">
                          Share
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorConcentration.map((v, idx) => (
                        <TableRow key={v.vendor} hover>
                          <TableCell sx={{ px: 0.75, py: 0.5 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: VENDOR_DOT_COLORS[idx % VENDOR_DOT_COLORS.length],
                                display: 'inline-block',
                                mr: 0.75,
                              }}
                            />
                            {idx + 1}
                          </TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 600, fontSize: 12.5 }}>
                            {v.vendor}
                          </TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5 }} align="right">
                            {v.actual.toLocaleString('en-NG')}
                          </TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: '#15803D' }} align="right">
                            {v.paid.toLocaleString('en-NG')}
                          </TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontSize: 12.5, color: v.balance ? '#B45309' : 'text.disabled' }} align="right">
                            {v.balance.toLocaleString('en-NG')}
                          </TableCell>
                          <TableCell sx={{ px: 0.75, py: 0.5, fontWeight: 700, fontSize: 12.5 }} align="right">
                            {v.sharePct}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </ParentCard>

              {/* Key Insights */}
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconBulb size={18} color="#D97706" />
                    <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Key Insights</Typography>
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.75, px: 2 },
                  '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } },
                }}
              >
                <Box sx={{ maxHeight: 220, overflowX: 'auto', overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 220 }}>
                    {keyInsights.map((text) => (
                      <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <IconCircleCheck size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12.5 }}>{text}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <IconCircleCheck size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                        Recommendation:{' '}
                        <Box component="span" sx={{ fontWeight: 400 }}>
                          {keyInsightsRecommendation}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ParentCard>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Row action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Approve</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Reject
        </MenuItem>
      </Menu>

      <PostExpenditureModal open={postExpenditureOpen} onClose={() => setPostExpenditureOpen(false)} />
    </PageContainer>
  );
};

const ExpenditureByCategory = ({ theme }) => {
  const total = expenditureByCategory.reduce((sum, c) => sum + c.value, 0);
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: { xs: '100%', sm: 140 }, flexShrink: 0 }}>
        <ReusableDonutChart
          data={expenditureByCategory.map((c) => ({
            name: c.name,
            value: c.value,
            color: EXPENSE_CATEGORY_META[c.name].color,
          }))}
          height={140}
          innerRadius={48}
          outerRadius={66}
          paddingAngle={2}
          centerValue={formatCompact(total)}
          centerTitle="Total Actual"
          valueFontSize={15}
          tooltipFormatter={(value, name) => [formatNaira(value), name]}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flexGrow: 1, minWidth: 0, width: '100%' }}>
        {expenditureByCategory.map((c) => {
          const meta = EXPENSE_CATEGORY_META[c.name];
          const pct = ((c.value / total) * 100).toFixed(0);
          return (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  flexGrow: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.name}
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
                {formatCompact(c.value)} ({pct}%)
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PostExpenditure;
