import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import SetCalendarTab from './components/SetCalendarTab';
import HolidaySection from './components/HolidaySection';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Calendar' }];

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCalendarUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box>
      <Breadcrumb title="Calendar" items={BCrumb} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Calendar Setup" />
          <Tab label="Holiday Setup" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <SetCalendarTab onUpdate={handleCalendarUpdate} />
      )}

      {activeTab === 1 && (
        <HolidaySection refreshKey={refreshKey} />
      )}
    </Box>
  );
};

export default CalendarPage;
