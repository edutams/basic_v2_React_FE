import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import useNotification from '../../../hooks/useNotification';
import tenantApi from '../../../api/tenant_api';

const ManageWeeks = ({ sessionTermId }) => {
  const notify = useNotification();
  const [firstMonday, setFirstMonday] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionTermId) {
      fetchWeeks();
    }
  }, [sessionTermId]);

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const response = await tenantApi.get(`/session-mappings/${sessionTermId}/weeks`);
      setWeeks(response.data);
    } catch (error) {
      console.error('Error fetching weeks:', error);
      notify.error('Failed to fetch weeks', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeeks = async () => {
    if (!firstMonday) {
      notify.warning('Please select the first Monday of the term', 'Warning');
      return;
    }

    setLoading(true);
    try {
      const response = await tenantApi.post(`/session-mappings/${sessionTermId}/weeks/auto-generate`, {
        start_date: firstMonday,
      });
      setWeeks(response.data);
      notify.success('Weeks generated and saved successfully', 'Success');
    } catch (error) {
      console.error('Error generating weeks:', error);
      notify.error('Failed to generate weeks', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (index, field, value) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[index][field] = value;
    setWeeks(updatedWeeks);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      await tenantApi.post(`/session-mappings/${sessionTermId}/weeks`, {
        weeks: weeks.map(w => ({
          week_id: w.week_id,
          start_date: w.start_date,
          end_date: w.end_date
        }))
      });
      notify.success('Weeks saved successfully', 'Success');
      fetchWeeks();
    } catch (error) {
      console.error('Error saving weeks:', error);
      notify.error('Failed to save weeks', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionTermId) {
    return (
      <Box p={3} textAlign="center">
        <Alert severity="warning">Please select or activate a session-term mapping first.</Alert>
      </Box>
    );
  }

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
          size="small"
          sx={{ minWidth: 200 }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGenerateWeeks} 
          size="small"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Generate Weeks'}
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
              {loading && weeks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : (
                weeks.map((week, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{week.week_name}</TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        value={week.start_date || ''}
                        onChange={(e) => handleWeekChange(index, 'start_date', e.target.value)}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 150 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="date"
                        value={week.end_date || ''}
                        onChange={(e) => handleWeekChange(index, 'end_date', e.target.value)}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 150 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button variant="contained" onClick={handleSaveAll} disabled={loading || weeks.length === 0}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save All'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManageWeeks;
