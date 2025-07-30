import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import HolidayForm from './HolidayForm';
import HolidayTable from './HolidayTable';
import PropTypes from 'prop-types';

const HolidayModal = ({ open, onClose, handleRefresh, actionType }) => {
  const [holidays, setHolidays] = useState([
    {
      id: 1,
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 2',
      holiday_description: 'Maulud Nabiyyu',
      holiday_date: '2023-09-27'
    },
    {
      id: 2,
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 3',
      holiday_description: 'Independence Day',
      holiday_date: '2023-10-02'
    },
    {
      id: 3,
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 3',
      holiday_description: 'Teachers Day',
      holiday_date: '2023-10-05'
    }
  ]);

  const modalConfig = {
    setHoliday: { title: 'Set Holiday', size: 'large' },
    holiday: { title: 'Set Holiday', size: 'large' },
  };

  const config = modalConfig[actionType] || { title: 'Set Holiday', size: 'large' };

  const handleHolidaySubmit = (values) => {
    const newHoliday = {
      id: Date.now(),
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 4',
      holiday_description: values.holiday_description,
      holiday_date: values.holiday_date
    };
    setHolidays([...holidays, newHoliday]);
  };

  const handleHolidayAction = (action, holiday) => {
    if (action === 'delete') {
      setHolidays(holidays.filter(h => h.id !== holiday.id));
    }
  };

  const handleSave = () => {
    console.log('Saving holidays:', holidays);
    handleRefresh();
    onClose();
  };

  const renderHolidayContent = () => (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Set Holiday
        </Typography>
        <Chip 
          label="?" 
          size="small" 
          sx={{ 
            backgroundColor: '#2196f3', 
            color: 'white',
            minWidth: '24px',
            height: '24px'
          }} 
        />
      </Box>

      <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <HolidayForm onSubmit={handleHolidaySubmit} />
      </Box>

      <HolidayTable 
        holidays={holidays}
        onHolidayAction={handleHolidayAction}
      />

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={config.title}
      size={config.size}
      disableEnforceFocus
      disableAutoFocus
    >
      {renderHolidayContent()}
    </ReusableModal>
  );
};

export default HolidayModal;
