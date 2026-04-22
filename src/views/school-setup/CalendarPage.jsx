import React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import SetCalendarTab from './tabs/SetCalendarTab';
import HolidaySection from './tabs/HolidaySection';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Calendar' }];

const CalendarPage = () => {
  return (
    <Box>
      <Breadcrumb title="Calendar" items={BCrumb} />
      <SetCalendarTab />
      <Box sx={{ mt: 3 }}>
        <HolidaySection />
      </Box>
    </Box>
  );
};

export default CalendarPage;
