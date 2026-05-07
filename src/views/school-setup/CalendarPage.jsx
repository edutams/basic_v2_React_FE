import React, { useState } from 'react';
import { Box } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import SetCalendarTab from './tabs/SetCalendarTab';
import HolidaySection from './tabs/HolidaySection';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Calendar' }];

const CalendarPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCalendarUpdate = () => {
    // Increment refresh key to trigger HolidaySection data refresh
    setRefreshKey(prev => {
      const newKey = prev + 1;
      return newKey;
    });
  };

  return (
    <Box>
      <Breadcrumb title="Calendar" items={BCrumb} />
      <SetCalendarTab onUpdate={handleCalendarUpdate} />
      <Box sx={{ mt: 3 }}>
        <HolidaySection refreshKey={refreshKey} />
      </Box>
    </Box>
  );
};

export default CalendarPage;
