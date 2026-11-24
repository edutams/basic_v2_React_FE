import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Tabs, Tab, useTheme } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
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
import { AS_AT_DATES, COMPARE_DATES, BALANCE_SHEET_TABS } from './constants';
import ReportStatsRow from './components/ReportStatsRow';
import BalanceSheetTab from './components/BalanceSheetTab';
import AssetDetailsTab from './components/AssetDetailsTab';
import LiabilitiesDetailsTab from './components/LiabilitiesDetailsTab';
import EquityDetailsTab from './components/EquityDetailsTab';
import TrendAnalysisTab from './components/TrendAnalysisTab';

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

const BalanceSheetReport = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [asAt, setAsAt] = useState(AS_AT_DATES[0]);
  const [compareWith, setCompareWith] = useState(COMPARE_DATES[0]);

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

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
                value={asAt}
                onChange={(e) => setAsAt(e.target.value)}
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
                    {val}
                  </Box>
                )}
              >
                {AS_AT_DATES.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 190, flexShrink: 0 }}>
              <Select
                value={compareWith}
                onChange={(e) => setCompareWith(e.target.value)}
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
                {COMPARE_DATES.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
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
          </Box>
        </Box>

        <ActiveTabComponent />
      </Box>
    </PageContainer>
  );
};

export default BalanceSheetReport;
