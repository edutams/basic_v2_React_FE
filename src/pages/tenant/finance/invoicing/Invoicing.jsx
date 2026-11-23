import React, { useEffect, useMemo, useState } from 'react';
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
  useTheme,
  Skeleton,
  Menu,
  Tabs,
  Tab,
  Pagination,
  Alert,
  Divider,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import ReusableDonutChart from '@/components/shared/charts/ReusableDonutChart';
import ReusableAreaChart from '@/components/shared/charts/ReusableAreaChart';
import {
  IconCoins,
  IconSearch,
  IconPlus,
  IconFileInvoice,
  IconReceipt,
  IconFilter,
  IconArrowUp,
  IconDatabase,
  IconCircleCheck,
  IconClock,
  IconChartBar,
  IconInfoCircle,
  IconTrendingUp,
  IconAlertTriangle,
  IconCalendar,
} from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QuickEntryModal from './components/QuickEntryModal';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import RecordIncomeModal from './components/RecordIncomeModal';
import {
  INCOME_SOURCE_META,
  STATUS_META,
  INCOME_CATEGORIES,
  mockInvoices,
  mockReceipts,
  incomeBySource,
  incomeTrend,
  summaryStats,
  formatNaira,
  formatCompact,
} from './constants';

// Compact cell padding for the invoices/receipts table — keeps the card
// dense instead of MUI's default roomy table-cell padding.
const thCell = { fontWeight: 700, py: 1, px: 1.5 };
const tdCell = { py: 0.6, px: 1.5 };

const Invoicing = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [receipts, setReceipts] = useState(mockReceipts);
  const [activeTab, setActiveTab] = useState('invoices');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [quickEntryMode, setQuickEntryMode] = useState('receipt');

  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [recordIncomeOpen, setRecordIncomeOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const dataset = activeTab === 'invoices' ? invoices : receipts;

  const filteredData = useMemo(() => {
    return dataset.filter((row) => {
      const matchesCategory = categoryFilter === 'All' || row.incomeAccount === categoryFilter;
      const q = searchQuery.toLowerCase();
      const identifier = (row.invoiceNo || row.receiptNo || '').toLowerCase();
      const matchesSearch =
        !q ||
        row.description.toLowerCase().includes(q) ||
        row.payer.toLowerCase().includes(q) ||
        identifier.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [dataset, categoryFilter, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const columnCount = activeTab === 'invoices' ? 8 : 7;

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleMarkPaid = () => {
    setInvoices((prev) =>
      prev.map((item) => (item.id === selectedRow.id ? { ...item, status: 'Paid' } : item)),
    );
    handleMenuClose();
  };

  const handleDelete = () => {
    setInvoices((prev) => prev.filter((item) => item.id !== selectedRow.id));
    handleMenuClose();
  };

  const openQuickEntry = (mode) => {
    setQuickEntryMode(mode);
    setQuickEntryOpen(true);
  };

  const handleQuickEntrySubmit = (data) => {
    setInvoices((prev) => [
      {
        ...data,
        id: `${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        invoiceNo: `INV-${String(900 + prev.length).padStart(6, '0')}`,
        status: 'Unpaid',
      },
      ...prev,
    ]);
  };

  const handleCreateInvoiceSubmit = (invoice) => {
    setInvoices((prev) => [
      {
        id: `${Date.now()}`,
        date: invoice.invoiceDate,
        invoiceNo: invoice.invoiceNo,
        description: invoice.description,
        payer: invoice.payer,
        incomeAccount: invoice.invoiceCategory,
        amount: invoice.totalAmount,
        status: invoice.status,
      },
      ...prev,
    ]);
  };

  const handleRecordIncomeSubmit = (income) => {
    setReceipts((prev) => [
      {
        id: `${Date.now()}`,
        date: income.incomeDate,
        receiptNo: income.receiptNo,
        description: income.description,
        payer: income.payer,
        incomeAccount: income.incomeCategory,
        amount: income.amount,
      },
      ...prev,
    ]);
  };

  const totalInsightValue = incomeBySource.reduce((sum, s) => sum + s.value, 0);

  return (
    <PageContainer title="Receivables (Income)" description="Record and manage other school income">
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
              <IconCoins size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Receivables (Income Management)
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Record and manage other school income, and monitor income performance.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <Button
              variant="contained"
              onClick={() => setRecordIncomeOpen(true)}
              startIcon={<IconPlus size={18} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              Record Income
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setCreateInvoiceOpen(true)}
              startIcon={<IconFileInvoice size={18} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Create Invoice
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => openQuickEntry('receipt')}
              startIcon={<IconReceipt size={18} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Record Receipt
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* ===================== Left: stats + table ===================== */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={2} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  loading={loading}
                  label="Total Income"
                  count={formatCompact(summaryStats.totalIncome)}
                  icon={IconDatabase}
                  colorIndex={1}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  loading={loading}
                  label="Collected"
                  count={formatCompact(summaryStats.collected)}
                  icon={IconCircleCheck}
                  colorIndex={0}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  loading={loading}
                  label="Outstanding"
                  count={formatCompact(summaryStats.outstanding)}
                  icon={IconClock}
                  colorIndex={3}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  loading={loading}
                  label="Collection Rate"
                  count={`${summaryStats.collectionRate}%`}
                  icon={IconChartBar}
                  colorIndex={2}
                />
              </Grid>
            </Grid>

            <ParentCard
              sx={{
                '& .MuiCardContent-root': { p: 2, pt: 1.5, '&:last-child': { pb: 1 } },
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => {
                    setActiveTab(val);
                    setPage(1);
                    setCategoryFilter('All');
                    setSearchQuery('');
                  }}
                  sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14.5 } }}
                >
                  <Tab
                    icon={<IconFileInvoice size={16} />}
                    iconPosition="start"
                    label={`Invoices (${invoices.length})`}
                    value="invoices"
                  />
                  <Tab
                    icon={<IconReceipt size={16} />}
                    iconPosition="start"
                    label={`Receipts (${receipts.length})`}
                    value="receipts"
                  />
                </Tabs>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setPage(1);
                      }}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="All">All Income Categories</MenuItem>
                      {INCOME_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value="01 Jan 2025 - 31 Mar 2025"
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
                <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by invoice no., description or payer..."
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
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<IconFilter size={16} />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, height: '100%' }}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        '& .MuiTableCell-root': { borderBottom: `2px solid ${theme.palette.divider}` },
                      }}
                    >
                      <TableCell sx={thCell}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Date <IconArrowUp size={14} />
                        </Box>
                      </TableCell>
                      <TableCell sx={thCell}>
                        {activeTab === 'invoices' ? 'Invoice No.' : 'Receipt No.'}
                      </TableCell>
                      <TableCell sx={thCell}>Description</TableCell>
                      <TableCell sx={thCell}>Payer / Source</TableCell>
                      <TableCell sx={thCell}>Income Account</TableCell>
                      <TableCell sx={thCell}>Amount (₦)</TableCell>
                      {activeTab === 'invoices' && <TableCell sx={thCell}>Status</TableCell>}
                      <TableCell sx={thCell} align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx}>
                          {Array.from({ length: columnCount }).map((__, cellIdx) => (
                            <TableCell key={cellIdx} sx={tdCell}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((row) => {
                        const sourceMeta = INCOME_SOURCE_META[row.incomeAccount] || INCOME_SOURCE_META.Others;
                        const statusMeta = STATUS_META[row.status];
                        return (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>
                              {new Date(row.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600 }}>
                              {row.invoiceNo || row.receiptNo}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 600, maxWidth: 220 }}>
                              {row.description}
                            </TableCell>
                            <TableCell sx={{ ...tdCell, color: 'text.secondary' }}>{row.payer}</TableCell>
                            <TableCell sx={tdCell}>
                              <Chip
                                label={row.incomeAccount}
                                size="small"
                                sx={{
                                  bgcolor: sourceMeta.bg,
                                  color: sourceMeta.color,
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ ...tdCell, fontWeight: 700 }}>
                              {Number(row.amount).toLocaleString('en-NG')}
                            </TableCell>
                            {activeTab === 'invoices' && (
                              <TableCell sx={tdCell}>
                                <Chip
                                  label={row.status}
                                  size="small"
                                  sx={{
                                    bgcolor: statusMeta.bg,
                                    color: statusMeta.color,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                  }}
                                />
                              </TableCell>
                            )}
                            <TableCell sx={tdCell} align="center">
                              {activeTab === 'invoices' ? (
                                <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              ) : (
                                <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columnCount} align="center">
                          <Alert severity="info" sx={{ my: 2, justifyContent: 'center' }}>
                            {searchQuery
                              ? 'No records match the current search.'
                              : `No ${activeTab} found yet.`}
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
                    ? `Showing 0 of 0 ${activeTab}`
                    : `Showing ${(safePage - 1) * rowsPerPage + 1}–${Math.min(
                        safePage * rowsPerPage,
                        filteredData.length,
                      )} of ${filteredData.length} ${activeTab}`}
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
              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconChartBar size={18} color={theme.palette.primary.main} />
                      <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Income Insights</Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>Income by Source</Typography>
                  <IconInfoCircle size={13} color={theme.palette.text.disabled} />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ width: { xs: '100%', sm: 150 }, flexShrink: 0 }}>
                    <ReusableDonutChart
                      data={incomeBySource.map((s) => ({
                        name: s.name,
                        value: s.value,
                        color: (INCOME_SOURCE_META[s.name] || INCOME_SOURCE_META.Others).color,
                      }))}
                      height={150}
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={2}
                      centerValue={formatCompact(totalInsightValue)}
                      centerTitle="Total Income"
                      valueFontSize={16}
                      tooltipFormatter={(value, name) => [formatNaira(value), name]}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, minWidth: 0, width: '100%' }}>
                    {incomeBySource.map((s) => {
                      const meta = INCOME_SOURCE_META[s.name] || INCOME_SOURCE_META.Others;
                      const pct = ((s.value / totalInsightValue) * 100).toFixed(1);
                      return (
                        <Box key={s.name} sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                bgcolor: meta.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {s.name}
                              {s.caption ? ` (${s.caption})` : ''}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, pl: 2.25, color: 'text.secondary' }}>
                            {formatCompact(s.value)} ({pct}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1 }}>
                  Income Trend (Last 7 Terms)
                </Typography>
                <ReusableAreaChart
                  data={incomeTrend}
                  nameKey="term"
                  dataKey="income"
                  name="Income"
                  color={theme.palette.primary.main}
                  height={210}
                  showLabels={false}
                  valueFormatter={formatCompact}
                />
              </ParentCard>

              <ParentCard
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15.5 }}>Intelligent Insights</Typography>
                    <Chip
                      label="AI"
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.main,
                        fontWeight: 800,
                        fontSize: 10.5,
                        height: 20,
                      }}
                    />
                  </Box>
                }
                sx={{
                  '& .MuiCardHeader-root': { pb: 0.5, pt: 1.75, px: 2 },
                  '& .MuiCardContent-root': { p: 2, '&:last-child': { pb: 2 } },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: 178,
                    overflowY: 'auto',
                    pr: 0.5,
                  }}
                >
                  <InsightRow
                    icon={IconTrendingUp}
                    iconColor="#16A34A"
                    title="Income Growth"
                    description="Total income increased by 18.4% compared to the previous term (₦266.0M → ₦315.0M)."
                    tag="+18.4%"
                    tagBg="#DCFCE7"
                    tagColor="#15803D"
                  />
                  <InsightRow
                    icon={IconCircleCheck}
                    iconColor="#2563EB"
                    title="Collection Performance"
                    description="Collection rate is 92.9%, which is above the set target of 90%."
                    tag="On Target"
                    tagBg="#DBEAFE"
                    tagColor="#1D4ED8"
                  />
                  <InsightRow
                    icon={IconAlertTriangle}
                    iconColor="#D97706"
                    title="Outstanding Balance"
                    description="₦22.5M (7.1%) is still outstanding, 12 invoices are overdue (₦15.8M)."
                    tag="12 Overdue"
                    tagBg="#FEE2E2"
                    tagColor="#DC2626"
                  />
                  <InsightRow
                    icon={IconChartBar}
                    iconColor="#2563EB"
                    title="Top Income Source"
                    description="School Fees contributed 92.9% of total income."
                    tag="₦292.5M"
                    tagBg="#DBEAFE"
                    tagColor="#1D4ED8"
                  />
                </Box>
              </ParentCard>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Row action menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedRow?.status === 'Unpaid' && (
          <MenuItem onClick={handleMarkPaid}>Mark as Paid</MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>View</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <QuickEntryModal
        open={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        mode={quickEntryMode}
        onSubmit={handleQuickEntrySubmit}
      />

      <CreateInvoiceModal
        open={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onSubmit={handleCreateInvoiceSubmit}
      />

      <RecordIncomeModal
        open={recordIncomeOpen}
        onClose={() => setRecordIncomeOpen(false)}
        onSubmit={handleRecordIncomeSubmit}
      />
    </PageContainer>
  );
};

const InsightRow = ({ icon: Icon, iconColor, title, description, tag, tagBg, tagColor }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: '8px',
        bgcolor: `${iconColor}1A`,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={16} />
    </Box>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{title}</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>{description}</Typography>
      <Chip
        label={tag}
        size="small"
        sx={{ bgcolor: tagBg, color: tagColor, fontWeight: 700, fontSize: 11, mt: 0.75, height: 20 }}
      />
    </Box>
  </Box>
);

export default Invoicing;
