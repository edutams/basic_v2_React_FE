import React, { useState } from 'react';
import { Box, Typography, Button, Card, Grid, TextField, IconButton } from '@mui/material';
import { IconTrash } from '@tabler/icons';
import HolidayTable from './HolidayTable';
import PropTypes from 'prop-types';

const HolidayTab = ({ handleRefresh }) => {
  const [holidayForms, setHolidayForms] = useState([
    { id: 1, holiday_date: '', holiday_description: '' }
  ]);
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
      sessionTerm: '2023/2024 - First Term',
      weekName: 'Week 3',
      holiday_description: 'Teachers Day',
      holiday_date: '2023-10-05',
    },
  ]);

  const handleAddMore = () => {
    const newForm = {
      id: Date.now(),
      holiday_date: '',
      holiday_description: ''
    };
    setHolidayForms([...holidayForms, newForm]);
  };

  const handleRemoveForm = (formId) => {
    if (holidayForms.length > 1) {
      setHolidayForms(holidayForms.filter(form => form.id !== formId));
    }
  };

  const handleFormChange = (formId, field, value) => {
    setHolidayForms(holidayForms.map(form => 
      form.id === formId ? { ...form, [field]: value } : form
    ));
  };

  const handleSubmitAllHolidays = () => {
    const validForms = holidayForms.filter(form => 
      form.holiday_date && form.holiday_description
    );
    
    if (validForms.length > 0) {
      const newHolidays = validForms.map(form => ({
        id: Date.now() + Math.random(),
        sessionTerm: '2023/2024 - First Term',
        weekName: 'Week 4',
        holiday_description: form.holiday_description,
        holiday_date: form.holiday_date
      }));
      
      setHolidays([...holidays, ...newHolidays]);
      
      // Reset forms
      setHolidayForms([{ id: Date.now(), holiday_date: '', holiday_description: '' }]);
    }
  };

  const handleHolidayAction = (action, holiday) => {
    if (action === 'delete') {
      setHolidays(holidays.filter((h) => h.id !== holiday.id));
    }
  };

  const handleSave = () => {
    console.log('Saving holidays:', holidays);
    handleRefresh();
  };



  return (
    <Grid container spacing={3}>
      <Card variant="outlined" sx={{ p: 3, width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Set Holiday
          </Typography>
        </Box>

        {/* Holiday Form Card */}
        <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
          {holidayForms.map((form, index) => (
            <Box key={form.id} sx={{ mb: index < holidayForms.length - 1 ? 2 : 0 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Date"
                    type="date"
                    value={form.holiday_date}
                    onChange={(e) => handleFormChange(form.id, 'holiday_date', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description"
                    value={form.holiday_description}
                    onChange={(e) => handleFormChange(form.id, 'holiday_description', e.target.value)}
                    fullWidth
                    placeholder="Enter holiday description"
                  />
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  {holidayForms.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveForm(form.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <IconTrash size={16} />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Button
              variant="outlined"
              onClick={handleAddMore}
            >
              Add More
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSubmitAllHolidays}
              disabled={holidayForms.every(form => !form.holiday_date || !form.holiday_description)}
            >
              Add Holidays
            </Button>
          </Box>
        </Card>

        <HolidayTable holidays={holidays} onHolidayAction={handleHolidayAction} />

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};

HolidayTab.propTypes = {
  handleRefresh: PropTypes.func.isRequired,
};

export default HolidayTab;
