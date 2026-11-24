import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Tabs, Tab, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
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
import { PERIODS, COMPARE_PERIODS, REPORT_TABS } from './constants';
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

const IncomeExpenditureReport = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [period, setPeriod] = useState(PERIODS[0]);
  const [comparePeriod, setComparePeriod] = useState(COMPARE_PERIODS[0]);

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

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
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
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
                    {val}
                  </Box>
                )}
              >
                {PERIODS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 190, flexShrink: 0 }}>
              <Select
                value={comparePeriod}
                onChange={(e) => setComparePeriod(e.target.value)}
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
                    {val}
                  </Box>
                )}
              >
                {COMPARE_PERIODS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
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

        <ReportStatsRow tab={activeTab} />

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

        <ActiveTabComponent />
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
