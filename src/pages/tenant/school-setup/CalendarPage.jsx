import { useState, useRef } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import SetCalendarTab from './components/SetCalendarTab';
import HolidaySection from './components/HolidaySection';

import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Calendar' }];

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  // HolidaySection owns its own tour (inside its own AclTourProvider) — this
  // ref is how the shared button below actually reaches it, since the
  // button itself lives outside that provider. It no longer auto-plays on
  // tab switch; this button is the only way to (re)start it.
  const holidayTourRef = useRef(null);

  const handleCalendarUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box>
      <Breadcrumb title="Calendar" items={BCrumb} />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Calendar Setup" />
          <Tab label="Holiday Setup" />
        </Tabs>
        {/* Only Holiday Setup has a guided tour right now — showing this on
            Calendar Setup would just be a dead button. */}
        {activeTab === 1 && (
          <Box sx={{ ml: 'auto' }}>
            <ShowTourGuideButton
              data-tour="calendar-tour"
              onClick={() => holidayTourRef.current?.startTour()}
            />
          </Box>
        )}
      </Box>

      {activeTab === 0 && <SetCalendarTab onUpdate={handleCalendarUpdate} />}

      {activeTab === 1 && <HolidaySection ref={holidayTourRef} refreshKey={refreshKey} />}
    </Box>
  );
};

export default CalendarPage;
