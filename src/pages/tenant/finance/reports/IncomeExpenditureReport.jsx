import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Tabs, Tab, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import tenantApi from '@/api/tenant/tenant_api';
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

const TAB_COMPONENTS = {
  summary: AccountSummaryTab,
  income: IncomeDetailsTab,
  expenditure: ExpenditureDetailsTab,
  trend: TrendAnalysisTab,
};

const TAB_ENDPOINTS = {
  summary: '/finance_reports/income_expenditure_summary',
  income: '/finance_reports/income_details',
  expenditure: '/finance_reports/expenditure_details',
};

// Trend & Analysis's headline figures and 7-term trend are all already
// part of the Account Summary response — it reads that tab's cached data
// directly instead of triggering a second, redundant request for data the
// page already has.
const SHARED_DATA_KEY = { trend: 'summary' };

const IncomeExpenditureReport = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState('');
  const [comparePeriodId, setComparePeriodId] = useState('');
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];
  const activeDataKey = SHARED_DATA_KEY[activeTab] || activeTab;

  const fetchTab = useCallback((tabKey, currentPeriodId, currentComparePeriodId, periodList) => {
    const endpoint = TAB_ENDPOINTS[tabKey];
    if (!endpoint) return;
    const current = periodList.find((p) => p.id === currentPeriodId);
    if (!current) return;
    const compare = periodList.find((p) => p.id === currentComparePeriodId);

    setTabLoading((prev) => ({ ...prev, [tabKey]: true }));
    tenantApi
      .get(endpoint, {
        params: {
          session_id: current.session_id,
          term_id: current.term_id,
          ...(compare ? { compare_session_id: compare.session_id, compare_term_id: compare.term_id } : {}),
        },
      })
      .then((res) => setTabData((prev) => ({ ...prev, [tabKey]: res.data?.data || null })))
      .catch(() => setTabData((prev) => ({ ...prev, [tabKey]: null })))
      .finally(() => setTabLoading((prev) => ({ ...prev, [tabKey]: false })));
  }, []);

  useEffect(() => {
    tenantApi
      .get('/finance_reports/periods')
      .then((res) => {
        const list = res.data?.data || [];
        setPeriods(list);
        if (list.length > 0) {
          const activeIndex = list.findIndex((p) => p.is_active);
          const currentIndex = activeIndex !== -1 ? activeIndex : list.length - 1;
          const current = list[currentIndex];
          const previous = currentIndex > 0 ? list[currentIndex - 1] : null;
          setPeriodId(current.id);
          setComparePeriodId(previous?.id || '');
          fetchTab('summary', current.id, previous?.id || '', list);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch a tab's data lazily the first time it's visited for the current
  // period selection, instead of eagerly loading all 4 tabs up front.
  useEffect(() => {
    if (TAB_ENDPOINTS[activeDataKey] && !tabData[activeDataKey] && !tabLoading[activeDataKey] && periodId) {
      fetchTab(activeDataKey, periodId, comparePeriodId, periods);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataKey, periodId, comparePeriodId, periods]);

  const handleGenerateReport = () => {
    setTabData({});
    fetchTab(activeDataKey, periodId, comparePeriodId, periods);
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
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<IconPrinter size={15} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<IconZoomCode size={15} />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
            >
              Drill Down
            </Button>
          </Box>
        </Box>

        <ActiveTabComponent data={tabData[activeDataKey]} loading={tabLoading[activeDataKey]} />
      </Box>
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
