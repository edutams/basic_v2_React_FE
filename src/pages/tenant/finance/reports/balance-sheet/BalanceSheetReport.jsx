import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Tabs, Tab, Menu, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import {
  fetchFinancePeriods,
  fetchBalanceSheetSummary,
  fetchAssetDetails,
  fetchLiabilityDetails,
  fetchEquityDetails,
  fetchCategoryTransactions,
} from '@/api/tenant/finance/financeReportsApi';
import {
  IconLayersIntersect,
  IconChartBar,
  IconUsers,
  IconTrendingUp,
  IconRefresh,
  IconCalendar,
  IconDownload,
  IconChevronDown,
  IconPrinter,
} from '@tabler/icons';
import { BALANCE_SHEET_TABS } from './constants';
import ReportStatsRow from './components/ReportStatsRow';
import BalanceSheetTab from './components/BalanceSheetTab';
import AssetDetailsTab from './components/AssetDetailsTab';
import LiabilitiesDetailsTab from './components/LiabilitiesDetailsTab';
import EquityDetailsTab from './components/EquityDetailsTab';
import TrendAnalysisTab from './components/TrendAnalysisTab';
import AllTransactionsModal from '../components/AllTransactionsModal';
import CardsPeriodFilter from '../components/CardsPeriodFilter';

// Builds a CSV from whichever table is this tab's "primary" dataset — the
// same rows already rendered on screen for that tab.
function buildCsv(tab, data) {
  if (tab === 'assets' || tab === 'liabilities' || tab === 'equity') {
    const rows = data?.accounts || [];
    const header = ['Account', 'Classification', 'Balance', '% of Total', 'Movement', 'Movement (%)'];
    const body = rows.map((r) => [r.account, r.classification ?? '', r.balance, r.pct_of_total, r.movement ?? '', r.movement_pct ?? '']);
    return [header, ...body];
  }
  if (tab === 'trend') {
    const rows = data?.trend || [];
    const header = ['Term', 'Assets', 'Liabilities', 'Equity'];
    const body = rows.map((r) => [r.term, r.assets, r.liabilities, r.equity]);
    return [header, ...body];
  }
  // balance-sheet (the statement itself)
  const header = ['Item', 'Section', 'Amount', '% of Total'];
  const body = [
    ...(data?.statement?.assets || []).map((r) => [r.item, 'Assets', r.amount, r.pct]),
    ...(data?.statement?.liabilities || []).map((r) => [r.item, 'Liabilities', r.amount, r.pct]),
    ...(data?.statement?.equity || []).map((r) => [r.item, 'Equity', r.amount, r.pct]),
  ];
  return [header, ...body];
}

function downloadCsv(rows, filename) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const CATEGORY_COLUMNS = {
  assets: [
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { header: 'Description', render: (row) => row.description },
    { header: 'Asset Account', render: (row) => row.account },
    { header: 'Amount (₦)', align: 'right', render: (row) => (row.amount < 0 ? `(${Math.abs(row.amount).toLocaleString('en-NG')})` : row.amount.toLocaleString('en-NG')) },
    { header: 'Type', render: (row) => row.type },
  ],
  liabilities: [
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { header: 'Description / Purpose', render: (row) => row.description },
    { header: 'Liability Account', render: (row) => row.account },
    { header: 'Amount (₦)', align: 'right', render: (row) => (row.amount < 0 ? `(${Math.abs(row.amount).toLocaleString('en-NG')})` : row.amount.toLocaleString('en-NG')) },
    { header: 'Type', render: (row) => row.type },
  ],
  equity: [
    { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { header: 'Description / Purpose', render: (row) => row.description },
    { header: 'Equity Account', render: (row) => row.account },
    { header: 'Amount (₦)', align: 'right', render: (row) => (row.amount < 0 ? `(${Math.abs(row.amount).toLocaleString('en-NG')})` : row.amount.toLocaleString('en-NG')) },
    { header: 'Type', render: (row) => row.type },
  ],
};

const CATEGORY_TITLES = {
  assets: 'All Asset Transactions',
  liabilities: 'All Liability Transactions',
  equity: 'All Equity Transactions',
};

const TAB_COMPONENTS = {
  'balance-sheet': BalanceSheetTab,
  assets: AssetDetailsTab,
  liabilities: LiabilitiesDetailsTab,
  equity: EquityDetailsTab,
  trend: TrendAnalysisTab,
};

const TAB_ICONS = {
  'balance-sheet': IconLayersIntersect,
  assets: IconChartBar,
  liabilities: IconLayersIntersect,
  equity: IconUsers,
  trend: IconTrendingUp,
};

const TAB_FETCHERS = {
  'balance-sheet': fetchBalanceSheetSummary,
  assets: fetchAssetDetails,
  liabilities: fetchLiabilityDetails,
  equity: fetchEquityDetails,
};

// Trend & Analysis's headline figures and 7-term trend are all already
// part of the Balance Sheet summary response — it reads that tab's cached
// data directly instead of triggering a second, redundant request.
const SHARED_DATA_KEY = { trend: 'balance-sheet' };

const BalanceSheetReport = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState('');
  const [comparePeriodId, setComparePeriodId] = useState('');
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});
  const [transactionsCategory, setTransactionsCategory] = useState(null); // 'assets' | 'liabilities' | 'equity' | null
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // The "cards" filter — fully independent of periodId/comparePeriodId
  // above (those stay dedicated to the summary stats only). Drives
  // everything the active tab's tables/charts actually show, "as at the
  // end of" a chosen week rather than a from/to range (Balance Sheet is a
  // point-in-time snapshot, not a flow over a period).
  const [cardsFilter, setCardsFilter] = useState({ periodId: '', asAtWeekId: '' });

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];
  const activeDataKey = SHARED_DATA_KEY[activeTab] || activeTab;
  const currentPeriod = periods.find((p) => p.id === periodId);
  const cardsCurrentPeriod = periods.find((p) => p.id === cardsFilter.periodId);

  const fetchTab = useCallback((tabKey, currentPeriodId, currentComparePeriodId, periodList, currentCardsFilter) => {
    const fetchFn = TAB_FETCHERS[tabKey];
    if (!fetchFn) return;
    const current = periodList.find((p) => p.id === currentPeriodId);
    if (!current) return;
    const compare = periodList.find((p) => p.id === currentComparePeriodId);
    const cardsPeriod = periodList.find((p) => p.id === currentCardsFilter?.periodId);

    setTabLoading((prev) => ({ ...prev, [tabKey]: true }));
    fetchFn({
        session_id: current.session_id,
        term_id: current.term_id,
        ...(compare ? { compare_session_id: compare.session_id, compare_term_id: compare.term_id } : {}),
        ...(cardsPeriod ? { cards_session_id: cardsPeriod.session_id, cards_term_id: cardsPeriod.term_id } : {}),
        ...(currentCardsFilter?.asAtWeekId ? { as_at_week_id: currentCardsFilter.asAtWeekId } : {}),
      })
      .then((res) => setTabData((prev) => ({ ...prev, [tabKey]: res?.data || null })))
      .catch(() => setTabData((prev) => ({ ...prev, [tabKey]: null })))
      .finally(() => setTabLoading((prev) => ({ ...prev, [tabKey]: false })));
  }, []);

  useEffect(() => {
    fetchFinancePeriods()
      .then((res) => {
        const list = res?.data || [];
        setPeriods(list);
        if (list.length > 0) {
          const activeIndex = list.findIndex((p) => p.is_active);
          const currentIndex = activeIndex !== -1 ? activeIndex : list.length - 1;
          const current = list[currentIndex];
          const previous = currentIndex > 0 ? list[currentIndex - 1] : null;
          setPeriodId(current.id);
          setComparePeriodId(previous?.id || '');
          const initialCardsFilter = { periodId: current.id, asAtWeekId: '' };
          setCardsFilter(initialCardsFilter);
          fetchTab('balance-sheet', current.id, previous?.id || '', list, initialCardsFilter);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch a tab's data lazily the first time it's visited for the current
  // period selection, instead of eagerly loading all 5 tabs up front.
  useEffect(() => {
    if (TAB_FETCHERS[activeDataKey] && !tabData[activeDataKey] && !tabLoading[activeDataKey] && periodId) {
      fetchTab(activeDataKey, periodId, comparePeriodId, periods, cardsFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataKey, periodId, comparePeriodId, periods]);

  // The Cards filter (unlike the main Period/Compare row) has no Generate/
  // Apply button of its own, so picking a week must apply immediately
  // instead of silently waiting on a distant, unrelated button — clear the
  // cache and refetch the active tab with the fresh cardsFilter as soon as
  // it changes.
  const skipFirstCardsFilterRun = useRef(true);
  useEffect(() => {
    if (skipFirstCardsFilterRun.current) {
      skipFirstCardsFilterRun.current = false;
      return;
    }
    if (!periodId) return;
    setTabData({});
    fetchTab(activeDataKey, periodId, comparePeriodId, periods, cardsFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsFilter.periodId, cardsFilter.asAtWeekId]);

  const handleGenerateReport = () => {
    setTabData({});
    fetchTab(activeDataKey, periodId, comparePeriodId, periods, cardsFilter);
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const rows = buildCsv(activeTab, tabData[activeDataKey]);
    const tabLabel = BALANCE_SHEET_TABS.find((t) => t.value === activeTab)?.label || activeTab;
    downloadCsv(rows, `${tabLabel.replace(/\s+/g, '-').toLowerCase()}-${currentPeriod?.period_label || 'report'}.csv`);
    setExportAnchorEl(null);
  };

  return (
    <PageContainer title="Balance Sheet Report" description="Statement of financial position showing assets, liabilities and equity">
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
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>Balance Sheet Report</Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Statement of financial position showing the school&apos;s assets, liabilities and equity as at the
                selected period.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: 1.25,
              width: { xs: '100%', md: 'auto' },
              overflowX: { xs: 'auto', md: 'visible' },
            }}
          >
            <FormControl size="small" sx={{ minWidth: 170, flexShrink: 0 }}>
              <Select
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                startAdornment={<IconCalendar size={15} style={{ marginRight: 6 }} />}
                sx={{
                  borderRadius: '8px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
                renderValue={(val) => (
                  <Box component="span">
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, mr: 0.5 }}>
                      As at
                    </Box>
                    {periods.find((p) => p.id === val)?.period_label || ''}
                  </Box>
                )}
              >
                {periods.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.period_label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 190, flexShrink: 0 }}>
              <Select
                value={comparePeriodId}
                onChange={(e) => setComparePeriodId(e.target.value)}
                startAdornment={<IconCalendar size={15} style={{ marginRight: 6 }} />}
                sx={{
                  borderRadius: '8px',
                  fontSize: 13.5,
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
                renderValue={(val) => (
                  <Box component="span">
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, mr: 0.5 }}>
                      Compare With
                    </Box>
                    {periods.find((p) => p.id === val)?.period_label || 'None'}
                  </Box>
                )}
              >
                <MenuItem value="">None</MenuItem>
                {periods.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.period_label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              startIcon={<IconRefresh size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>

        <ReportStatsRow tab={activeTab} data={tabData[activeDataKey]} loading={tabLoading[activeDataKey]} />

        <Box
          sx={{
            mb: 2,
            p: 1.25,
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardsPeriodFilter mode="asAt" periods={periods} value={cardsFilter} onChange={setCardsFilter} />
        </Box>

        {/* ===================== Tabs + toolbar ===================== */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 2.5,
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#94a3b8',
            borderRadius: '10px',
            p: 0.75,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              minHeight: 0,
              '& .MuiTabs-flexContainer': { gap: 0.5 },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13.5,
                minHeight: 0,
                borderRadius: '8px',
                mr: 0,
                color: 'text.secondary',
              },
              '& .MuiTabs-indicator': { display: 'none' },
              '& .Mui-selected': { bgcolor: theme.palette.primary.main, color: '#fff !important' },
            }}
          >
            {BALANCE_SHEET_TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.value];
              return <Tab key={tab.value} icon={<Icon size={15} />} iconPosition="start" label={tab.label} value={tab.value} />;
            })}
          </Tabs>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<IconDownload size={15} />}
              endIcon={<IconChevronDown size={13} />}
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Export
            </Button>
            <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
              <MenuItem onClick={handleExport}>Export as CSV</MenuItem>
            </Menu>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<IconPrinter size={15} />}
              onClick={handlePrint}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Print
            </Button>
          </Box>
        </Box>

        <ActiveTabComponent
          data={tabData[activeDataKey]}
          loading={tabLoading[activeDataKey]}
          onViewAllTransactions={() => setTransactionsCategory(activeTab)}
        />
      </Box>

      <AllTransactionsModal
        open={Boolean(transactionsCategory)}
        onClose={() => setTransactionsCategory(null)}
        title={CATEGORY_TITLES[transactionsCategory] || 'All Transactions'}
        fetchFn={fetchCategoryTransactions}
        periodParams={{
          session_id: currentPeriod?.session_id,
          term_id: currentPeriod?.term_id,
          cards_session_id: cardsCurrentPeriod?.session_id,
          cards_term_id: cardsCurrentPeriod?.term_id,
          ...(cardsFilter.asAtWeekId ? { as_at_week_id: cardsFilter.asAtWeekId } : {}),
          category: transactionsCategory,
        }}
        columns={CATEGORY_COLUMNS[transactionsCategory] || CATEGORY_COLUMNS.assets}
      />
    </PageContainer>
  );
};

export default BalanceSheetReport;
