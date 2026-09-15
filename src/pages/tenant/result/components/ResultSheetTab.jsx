import { useState } from 'react';
import { Box, Tabs, Tab, Paper, Stack, Button, useTheme } from '@mui/material';
import { IconUsers, IconBook, IconAward, IconAlertTriangle, IconListNumbers, IconGridDots, IconCheck, IconX, IconDownload } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import BroadsheetTab from './BroadsheetTab';
import SummarySheetTab from './SummarySheetTab';
import CommentBankTab from './CommentBankTab';

const initialBankComments = [
  { id: 1, grade_score: '90-100', comment1: 'An excellent performance. Keep it up!', comment2: 'A brilliant student with outstanding results.', comment3: 'Exceptional performance across all areas.' },
  { id: 2, grade_score: '80-89', comment1: 'Very good effort. Sustained this standard.', comment2: 'Good performance with room for improvement.', comment3: 'A hardworking student.' },
  { id: 3, grade_score: '70-79', comment1: 'Good performance. Keep pushing higher.', comment2: 'Above average, can do better.', comment3: 'Consistent effort shown.' },
  { id: 4, grade_score: '60-69', comment2: 'Fair performance. More effort needed.', comment3: 'Needs to improve on weak areas.' },
  { id: 5, grade_score: '50-59', comment1: 'Average performance. Needs more dedication.', comment2: 'Below average. Requires parental support.', comment3: 'Needs serious attention.' },
  { id: 6, grade_score: '40-49', comment1: 'Below expectations. Needs serious attention.', comment2: 'Poor performance. More effort required.', comment3: 'Needs to attend tutorials.' },
  { id: 7, grade_score: '30-39', comment1: 'Poor performance. Urgent improvement needed.', comment2: 'Very poor. Requires immediate intervention.', comment3: 'Not meeting basic standards.' },
  { id: 8, grade_score: '0-29', comment1: 'Very poor performance. Needs urgent help.', comment2: 'Highly unsatisfactory. Seek help immediately.', comment3: 'Requires special attention.' },
];

const ResultSheetTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [bankComments, setBankComments] = useState(initialBankComments);

  const totalCells = bankComments.length * 3;
  const filledCells = bankComments.reduce((count, row) => {
    return count + (row.comment1 ? 1 : 0) + (row.comment2 ? 1 : 0) + (row.comment3 ? 1 : 0);
  }, 0);

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
          <Tab label="Comment Bank." />
        </Tabs>
        {activeTab === 0 && (
          <Button variant="contained" size="small" startIcon={<IconDownload size={16} />} sx={{ mr: 2 }}>
            Export Broadsheet
          </Button>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        {activeTab === 1 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <StatCard count={42} label="Total Students" subtitle="In selected class" icon={IconUsers} colorIndex={0} loading={false} />
            <StatCard count={12} label="Total Subjects" subtitle="Across all departments" icon={IconBook} colorIndex={1} loading={false} />
            <StatCard count={9} label="Grade Bands" subtitle="A+ through F" icon={IconAward} colorIndex={2} loading={false} />
            <StatCard count={0} label="Outliers" subtitle="Students below threshold" icon={IconAlertTriangle} colorIndex={3} loading={false} />
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <StatCard count={bankComments.length} label="Score Ranges" subtitle="Editable comment rows" icon={IconListNumbers} colorIndex={0} loading={false} />
            <StatCard count={totalCells} label="Total Cells" subtitle="8 rows x 3 columns" icon={IconGridDots} colorIndex={1} loading={false} />
            <StatCard count={filledCells} label="Filled" subtitle="Comments completed" icon={IconCheck} colorIndex={2} loading={false} />
            <StatCard count={totalCells - filledCells} label="Empty" subtitle="Awaiting input" icon={IconX} colorIndex={3} loading={false} />
          </Stack>
        )}

        {activeTab === 0 && <BroadsheetTab />}
        {activeTab === 1 && <SummarySheetTab />}
        {activeTab === 2 && <CommentBankTab bankComments={bankComments} setBankComments={setBankComments} />}
      </Box>
    </Paper>
  );
};

export default ResultSheetTab;
