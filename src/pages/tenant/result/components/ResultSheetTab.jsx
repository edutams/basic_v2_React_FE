import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper, useTheme } from '@mui/material';
import BroadsheetTab from './BroadsheetTab';
import SummarySheetTab from './SummarySheetTab';
import CommentBankTab from './CommentBankTab';
import { usePermissions } from '@/context/TenantContext/permissions';

// Combined shell for the Result Sheet module: Broadsheet, Summary Sheet
// and Comment Bank. Each tab manages its own data (all backed by the
// /result-sheet API), so this shell only owns the tab bar.
//
// Comment Bank is explicitly permission-gated here (not just left to the
// page-level route guard) — only whoever can actually fill one in (class
// teacher, school admin, super admin — same roles as
// result.admin.manage_comment_bank) sees the tab at all.
const ResultSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const { can } = usePermissions();
  const canManageCommentBank = can('result.admin.manage_comment_bank');

  // If the tab a user was on disappears (e.g. permissions changed), don't
  // strand them on a hidden panel.
  useEffect(() => {
    if (activeTab === 2 && !canManageCommentBank) {
      setActiveTab(0);
    }
  }, [activeTab, canManageCommentBank]);

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            flex: 1,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
          }}
        >
          <Tab label="Broadsheet." />
          <Tab label="Summary Sheet." />
          {canManageCommentBank && <Tab label="Comment Bank." />}
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <BroadsheetTab />}
        {activeTab === 1 && <SummarySheetTab />}
        {activeTab === 2 && canManageCommentBank && <CommentBankTab />}
      </Box>
    </Paper>
  );
};

export default ResultSheetTab;
