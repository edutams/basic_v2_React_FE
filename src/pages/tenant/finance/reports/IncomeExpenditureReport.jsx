import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Select, MenuItem, FormControl, Tabs, Tab, Menu, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import {
  fetchFinancePeriods,
  fetchIncomeExpenditureSummary,
  fetchIncomeDetails,
  fetchExpenditureDetails,
  fetchIncomeTransactions,
  fetchExpenditureTransactions,
} from '@/api/tenant/finance/financeReportsApi';
import {
  IconChartBar,
  IconFileText,
  IconLayersIntersect,
  IconTrendingUp,
  IconRefresh,
  IconCalendar,
  IconDownload,
  IconChevronDown,
  IconPrinter,
  IconZoomCode,
  IconReportMoney,
} from '@tabler/icons';
import { REPORT_TABS } from './constants';
import ReportStatsRow from './components/ReportStatsRow';
import AccountSummaryTab from './components/AccountSummaryTab';
import IncomeDetailsTab from './components/IncomeDetailsTab';
import ExpenditureDetailsTab from './components/ExpenditureDetailsTab';
import TrendAnalysisTab from './components/TrendAnalysisTab';
import AllTransactionsModal from './components/AllTransactionsModal';
import CardsPeriodFilter from './components/CardsPeriodFilter';

// Builds a CSV from whichever table is this tab's "primary" dataset — the
// same rows already rendered on screen for that tab, not a re-derivation.
function buildCsv(tab, data) {
  if (tab === 'income') {
    const rows = data?.income_by_account || [];
    const header = ['Income Account', 'Amount', '% of Total', 'vs. Prior Term (%)'];
    const body = rows.map((r) => [r.account, r.amount, r.pct_of_total, r.vs_prior_term_pct ?? '']);
    return [header, ...body];
  }
  if (tab === 'expenditure') {
    const rows = data?.expenditure_by_account || [];
    const header = ['Expenditure Account', 'Amount', '% of Total', 'vs. Prior Term (%)'];
    const body = rows.map((r) => [r.account, r.amount, r.pct_of_total, r.vs_prior_term_pct ?? '']);
    return [header, ...body];
  }
  if (tab === 'trend') {
    const rows = data?.trend || [];
    const header = ['Term', 'Income', 'Expenditure'];
    const body = rows.map((r) => [r.term, r.income, r.expenditure]);
    return [header, ...body];
  }
  // summary
  const incomeRows = data?.statement?.income_rows || [];
  const expenditureRows = data?.statement?.expenditure_rows || [];
  const header = ['Item', 'Section', 'Amount', '% of Income'];
  const body = [
    ...incomeRows.map((r) => [r.item, 'Income', r.amount, r.pct_of_income]),
    ...expenditureRows.map((r) => [r.item, 'Expenditure', r.amount, r.pct_of_income]),
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

const TAB_COMPONENTS = {
  summary: AccountSummaryTab,
  income: IncomeDetailsTab,
  expenditure: ExpenditureDetailsTab,
  trend: TrendAnalysisTab,
};

const TAB_FETCHERS = {
  summary: fetchIncomeExpenditureSummary,
  income: fetchIncomeDetails,
  expenditure: fetchExpenditureDetails,
};

// Trend & Analysis's headline figures and 7-term trend are all already
// part of the Account Summary response — it reads that tab's cached data
// directly instead of triggering a second, redundant request for data the
// page already has.
const SHARED_DATA_KEY = { trend: 'summary' };

const IncomeExpenditureReport = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState('');
  const [comparePeriodId, setComparePeriodId] = useState('');
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});
  const [transactionsLedger, setTransactionsLedger] = useState(null); // 'income' | 'expenditure' | null
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // The "cards" filter — fully independent of periodId/comparePeriodId
  // above (those stay dedicated to the stats row only). Drives everything
  // the active tab's tables/charts actually show.
  const [cardsFilter, setCardsFilter] = useState({ periodId: '', weekFromId: '', weekToId: '' });

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
        ...(currentCardsFilter?.weekFromId && currentCardsFilter?.weekToId
          ? { week_from_id: currentCardsFilter.weekFromId, week_to_id: currentCardsFilter.weekToId }
          : {}),
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
          const initialCardsFilter = { periodId: current.id, weekFromId: '', weekToId: '' };
          setCardsFilter(initialCardsFilter);
          fetchTab('summary', current.id, previous?.id || '', list, initialCardsFilter);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch a tab's data lazily the first time it's visited for the current
  // period selection, instead of eagerly loading all 4 tabs up front.
  useEffect(() => {
    if (TAB_FETCHERS[activeDataKey] && !tabData[activeDataKey] && !tabLoading[activeDataKey] && periodId) {
      fetchTab(activeDataKey, periodId, comparePeriodId, periods, cardsFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataKey, periodId, comparePeriodId, periods]);

  const handleGenerateReport = () => {
    setTabData({});
    fetchTab(activeDataKey, periodId, comparePeriodId, periods, cardsFilter);
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const rows = buildCsv(activeTab, tabData[activeDataKey]);
    const tabLabel = REPORT_TABS.find((t) => t.value === activeTab)?.label || activeTab;
    downloadCsv(rows, `${tabLabel.replace(/\s+/g, '-').toLowerCase()}-${currentPeriod?.period_label || 'report'}.csv`);
    setExportAnchorEl(null);
  };

  // "Review outstanding payments" sends the bursar to where they'd actually
  // raise/approve an installment (a different page, not this report);
  // "Monitor high-cost categories"/"Project next term's..." just switch
  // this same report to the tab that already shows that detail.
  const handleSummaryAction = (type) => {
    if (type === 'outstanding') navigate('/post-expenditure');
    else if (type === 'high_cost') setActiveTab('expenditure');
    else if (type === 'projection') setActiveTab('trend');
  };

  // Drill Down always means "show me the transactions behind these
  // numbers" — on Income/Expenditure Details that's this tab's own ledger;
  // on Summary/Trend (which show both) it defaults to Income.
  const handleDrillDown = () => {
    setTransactionsLedger(activeTab === 'expenditure' ? 'expenditure' : 'income');
  };

  return (
    <PageContainer title="Income & Expenditure Account" description="Statement of income, expenditure and surplus/deficit">
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
              <IconReportMoney size={24} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700 }}>
                Income &amp; Expenditure Account
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
                Statement of income, expenditure and surplus/deficit for the selected period.
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
            <FormControl size="small" sx={{ minWidth: 180, flexShrink: 0 }}>
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
                      Period
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
          <CardsPeriodFilter mode="range" periods={periods} value={cardsFilter} onChange={setCardsFilter} />
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
            {REPORT_TABS.map((tab) => (
              <Tab
                key={tab.value}
                icon={<TabIcon tab={tab.value} />}
                iconPosition="start"
                label={tab.label}
                value={tab.value}
              />
            ))}
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
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<IconZoomCode size={15} />}
              onClick={handleDrillDown}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Drill Down
            </Button>
          </Box>
        </Box>

        <ActiveTabComponent
          data={tabData[activeDataKey]}
          loading={tabLoading[activeDataKey]}
          onAction={handleSummaryAction}
          onViewAllTransactions={() => setTransactionsLedger(activeTab)}
        />
      </Box>

      <AllTransactionsModal
        open={Boolean(transactionsLedger)}
        onClose={() => setTransactionsLedger(null)}
        title={transactionsLedger === 'expenditure' ? 'All Expenditure Transactions' : 'All Income Transactions'}
        fetchFn={transactionsLedger === 'expenditure' ? fetchExpenditureTransactions : fetchIncomeTransactions}
        periodParams={{
          session_id: currentPeriod?.session_id,
          term_id: currentPeriod?.term_id,
          cards_session_id: cardsCurrentPeriod?.session_id,
          cards_term_id: cardsCurrentPeriod?.term_id,
          ...(cardsFilter.weekFromId && cardsFilter.weekToId
            ? { week_from_id: cardsFilter.weekFromId, week_to_id: cardsFilter.weekToId }
            : {}),
        }}
        columns={
          transactionsLedger === 'expenditure'
            ? [
                { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { header: 'Description / Purpose', render: (row) => row.description },
                { header: 'Expenditure Account', render: (row) => row.account },
                { header: 'Amount (₦)', align: 'right', render: (row) => row.amount.toLocaleString('en-NG') },
                { header: 'Vendor / Supplier', render: (row) => row.vendor || '—' },
              ]
            : [
                { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { header: 'Description / Payer', render: (row) => `${row.description}${row.payer ? ` – ${row.payer}` : ''}` },
                { header: 'Income Account', render: (row) => row.account },
                { header: 'Amount (₦)', align: 'right', render: (row) => row.amount.toLocaleString('en-NG') },
              ]
        }
      />
    </PageContainer>
  );
};

const TabIcon = ({ tab }) => {
  const icons = {
    summary: <IconChartBar size={15} />,
    income: <IconFileText size={15} />,
    expenditure: <IconLayersIntersect size={15} />,
    trend: <IconTrendingUp size={15} />,
  };
  return icons[tab] || null;
};

export default IncomeExpenditureReport;
