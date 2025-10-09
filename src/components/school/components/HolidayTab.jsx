import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import HolidayTable from './HolidayTable';
import HolidayModal from './HolidayModal';
import PropTypes from 'prop-types';
import { IconCalendar, IconCalendarX, IconSchool, IconCheck, IconX } from '@tabler/icons-react';

const HolidayTab = ({ handleRefresh }) => {
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeTerm, setActiveTerm] = useState('First');
  const [holidays, setHolidays] = useState([
    {
      id: 1,
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 2',
      holiday_description: 'Maulud Nabiyyu',
      holiday_date: '2023-09-27',
    },
    {
      id: 2,
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 3',
      holiday_description: 'Independence Day',
      holiday_date: '2023-10-02',
    },
    {
      id: 3,
      sessionTerm: '2023/2024 - Second Term',
      weekName: 'Week 5',
      holiday_description: 'Christmas Holiday',
      holiday_date: '2023-12-25',
    },
    {
      id: 4,
      sessionTerm: '2023/2024 - Third Term',
      weekName: 'Week 2',
      holiday_description: 'Easter Holiday',
      holiday_date: '2024-03-29',
    },
  ]);

  // Get unique sessions from holidays data for current term
  const availableSessions = useMemo(() => {
    const termHolidays = holidays.filter((holiday) =>
      holiday.sessionTerm.includes(activeTerm + ' Term'),
    );
    const sessions = [...new Set(termHolidays.map((holiday) => holiday.sessionTerm))];
    return sessions;
  }, [holidays, activeTerm]);

  // Filter holidays based on selected session and active term
  const filteredHolidays = useMemo(() => {
    let filtered = holidays.filter((holiday) => holiday.sessionTerm.includes(activeTerm + ' Term'));

    if (selectedSession) {
      filtered = filtered.filter((holiday) => holiday.sessionTerm === selectedSession);
    }

    return filtered;
  }, [holidays, selectedSession, activeTerm]);

  const handleSessionFilterChange = (event) => {
    setSelectedSession(event.target.value);
  };

  const handleTermChange = (event, newValue) => {
    console.log('HolidayTab: activeTerm changing from', activeTerm, 'to', newValue);
    setActiveTerm(newValue);
    setSelectedSession(''); // Reset session filter when changing terms
  };

  const handleHolidaySubmit = (values) => {
    if (modalMode === 'edit' && selectedHoliday) {
      // Update existing holiday
      const updatedHoliday = {
        ...selectedHoliday,
        holiday_description: values.holiday_description,
        holiday_date: values.holiday_date,
      };
      setHolidays(
        holidays.map((holiday) => (holiday.id === selectedHoliday.id ? updatedHoliday : holiday)),
      );
    } else {
      // Create new holiday - values is a single holiday object from modal
      const newHoliday = {
        id: Date.now() + Math.random(), // Ensure unique ID
        sessionTerm: `2023/2024 - ${activeTerm} Term`,
        weekName: 'Week 4',
        holiday_description: values.holiday_description,
        holiday_date: values.holiday_date,
      };
      setHolidays([...holidays, newHoliday]);
    }
    setHolidayModalOpen(false);
    setSelectedHoliday(null);
    setModalMode('create');
  };

  const handleSetHolidayClick = () => {
    console.log('HolidayTab: Opening modal with activeTerm:', activeTerm);
    setModalMode('create');
    setSelectedHoliday(null);
    setHolidayModalOpen(true);
  };

  const handleCloseHolidayModal = () => {
    setHolidayModalOpen(false);
    setSelectedHoliday(null);
    setModalMode('create');
  };

  const handleHolidayAction = (action, holiday) => {
    if (action === 'delete') {
      setHolidays(holidays.filter((h) => h.id !== holiday.id));
    } else if (action === 'edit') {
      setSelectedHoliday(holiday);
      setModalMode('edit');
      setHolidayModalOpen(true);
    }
  };

  const handleSave = () => {
    console.log('Saving holidays:', holidays);
    handleRefresh();
  };

  return (
    <Grid container spacing={3}>
      <Card sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
            Width: '100%',
            mb: 3,
          }}
        >
          {[
            {
              label: 'Term Weeks',
              value: 0,
              bg: 'primary',
              icon: <IconCalendar width={22} color="#fff" />,
            },
            {
              label: 'Holidays For the Term',
              value: 0,
              bg: 'secondary',
              icon: <IconCalendarX width={22} color="#fff" />,
            },
          ].map((item, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
                height: '100%',
                width: '100%',
                borderRadius: 2,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                gap: 2,
                px: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Box
                  width={38}
                  height={38}
                  bgcolor={`${item.bg}.main`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={1}
                >
                  {item.icon}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {item.label}
                  </Typography>
                  {/* <Typography variant="body2" sx={{ fontSize: '14px', color: 'text.secondary' }}>
                    Schools
                  </Typography> */}
                </Box>
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '36px',
                  color: '#28a745',
                  minWidth: 56,
                  textAlign: 'center',
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Card>
      <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Set Holiday
          </Typography>
        </Box>

        {/* Term Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTerm} onChange={handleTermChange} aria-label="term tabs">
            <Tab label="First Term" value="First" />
            <Tab label="Second Term" value="Second" />
            <Tab label="Third Term" value="Third" />
          </Tabs>
        </Box>

        {/* Session Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Session</InputLabel>
            <Select
              value={selectedSession}
              onChange={handleSessionFilterChange}
              label="Filter by Session"
            >
              <MenuItem value="">
                <em>All Sessions</em>
              </MenuItem>
              <MenuItem value="">2025/2026</MenuItem>
              <MenuItem value="">2024/2025</MenuItem>
            </Select>
          </FormControl>

          <Button
            sx={{ ml: 2 }}
            variant="contained"
            color="primary"
            onClick={handleSetHolidayClick}
          >
            Set Holiday
          </Button>
        </Box>

        <HolidayTable holidays={filteredHolidays} onHolidayAction={handleHolidayAction} />

        {/* <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box> */}

        <HolidayModal
          open={holidayModalOpen}
          onClose={handleCloseHolidayModal}
          onSubmit={handleHolidaySubmit}
          initialValues={modalMode === 'edit' ? selectedHoliday : {}}
          mode={modalMode}
          activeTerm={activeTerm}
        />
      </Card>
    </Grid>
  );
};

HolidayTab.propTypes = {
  handleRefresh: PropTypes.func.isRequired,
};

export default HolidayTab;
