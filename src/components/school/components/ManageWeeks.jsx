import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import useNotification from '../../../hooks/useNotification';

const ManageWeeks = () => {
  const notify = useNotification();
  const [firstMonday, setFirstMonday] = useState('');
  const [weeks, setWeeks] = useState([
    { week: 'Week 1', startsOn: '2025-02-24', endsOn: '2025-02-28' },
    { week: 'Week 2', startsOn: '2025-03-03', endsOn: '2025-03-07' },
    { week: 'Week 3', startsOn: '2025-03-10', endsOn: '2025-03-14' },
    { week: 'Week 4', startsOn: '2025-03-17', endsOn: '2025-03-21' },
    { week: 'Week 5', startsOn: '2025-03-24', endsOn: '2025-03-28' },
    { week: 'Week 6', startsOn: '2025-03-31', endsOn: '2025-04-04' },
    { week: 'Week 7', startsOn: '2025-04-07', endsOn: '2025-04-11' },
    { week: 'Week 8', startsOn: '2025-04-14', endsOn: '2025-04-18' },
    { week: 'Week 9', startsOn: '2025-04-21', endsOn: '2025-04-25' },
    { week: 'Week 10', startsOn: '2025-04-28', endsOn: '2025-05-02' },
    { week: 'Week 11', startsOn: '2025-05-05', endsOn: '2025-05-09' },
  ]);

  const handleGenerateWeeks = () => {
    if (!firstMonday) {
      notify.warning('Please select the first Monday of the term', 'Warning');
      return;
    }

    const startDate = new Date(firstMonday);
    const generatedWeeks = [];

    for (let i = 0; i < 11; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);

      generatedWeeks.push({
        week: `Week ${i + 1}`,
        startsOn: weekStart.toISOString().split('T')[0],
        endsOn: weekEnd.toISOString().split('T')[0],
      });
    }

    setWeeks(generatedWeeks);
  };

  const handleWeekChange = (index, field, value) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[index][field] = value;
    setWeeks(updatedWeeks);
  };

  const handleSaveAll = () => {
    // console.log('Saving all weeks:', weeks);
    notify.success('Weeks saved successfully', 'Success');
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }} icon={false}>
        Set the first Monday of the term from the calendar, click generate weeks, then click "Save
        All".
      </Alert>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          type="date"
          value={firstMonday}
          onChange={(e) => setFirstMonday(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" color="primary" onClick={handleGenerateWeeks} size="small">
          Generate Weeks
        </Button>
      </Stack>

      <Paper variant="outlined">
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Week</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Starts On</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ends On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, index) => (
                <TableRow key={index} hover>
                  <TableCell>{week.week}</TableCell>
                  <TableCell>
                    <TextField
                      type="date"
                      value={week.startsOn}
                      onChange={(e) => handleWeekChange(index, 'startsOn', e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 150 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="date"
                      value={week.endsOn}
                      onChange={(e) => handleWeekChange(index, 'endsOn', e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 150 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button variant="contained" onClick={handleSaveAll}>
            Save All
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManageWeeks;
