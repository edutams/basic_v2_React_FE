import { useState } from 'react';
import { Box, Tabs, Tab, Paper, useTheme } from '@mui/material';
import BroadsheetTab from './BroadsheetTab';
import SummarySheetTab from './SummarySheetTab';
import CommentBankTab from './CommentBankTab';

const ResultSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
        }}
      >
        <Tab label="Broadsheet." />
        <Tab label="Summary Sheet." />
        <Tab label="Comment Bank." />
      </Tabs>

      <Box sx={{ p: activeTab === 2 ? 0 : 2 }}>
        {activeTab === 0 && <BroadsheetTab />}
        {activeTab === 1 && <SummarySheetTab />}
        {activeTab === 2 && <CommentBankTab />}
      </Box>
    </Paper>
  );
};

export default ResultSheetTab;
