import { useState } from 'react';
import { Box, Tabs, Tab, Paper, useTheme } from '@mui/material';
import UploadScoresTab from './UploadScoresTab';
import ScoreSheetTab from './ScoreSheetTab';

const ScoreManagerTab = () => {
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
        <Tab label="Upload Scores." />
        <Tab label="Score Sheet." />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {activeTab === 0 && <UploadScoresTab />}
        {activeTab === 1 && <ScoreSheetTab />}
      </Box>
    </Paper>
  );
};

export default ScoreManagerTab;
