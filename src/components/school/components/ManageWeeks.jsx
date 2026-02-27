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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import useNotification from '../../../hooks/useNotification';
import tenantApi from '../../../api/tenant_api';

const ManageWeeks = ({ sessionTermId }) => {
  const notify = useNotification();
  const [firstMonday, setFirstMonday] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, week: null });

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

  const handleAddWeek = async () => {
    setLoading(true);
    try {
      const response = await tenantApi.post(`/session-mappings/${sessionTermId}/weeks/add`);
      setWeeks(response.data);
      notify.success('New week added successfully', 'Success');
    } catch (error) {
      console.error('Error adding week:', error);
      notify.error('Failed to add week', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async () => {
    const weekId = deleteDialog.week?.week_id;
    if (!weekId) return;

    setLoading(true);
    setDeleteDialog({ open: false, week: null });
    try {
      const response = await tenantApi.delete(`/session-mappings/${sessionTermId}/weeks/${weekId}`);
      setWeeks(response.data);
      notify.success('Week deleted successfully', 'Success');
    } catch (error) {
      console.error('Error deleting week:', error);
      notify.error('Failed to delete week', 'Error');
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
        All". You can also add or delete individual weeks as needed.
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
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleAddWeek}
          size="small"
          disabled={loading}
        >
          Add Week
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
                <TableCell sx={{ fontWeight: 'bold', width: 60 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && weeks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
                    <TableCell align="center">
                      <Tooltip title={`Delete ${week.week_name}`}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, week })}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, week: null })}>
        <DialogTitle>Delete Week</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.week?.week_name}</strong>? This will remove
            the week and its dates from this term.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, week: null })}>Cancel</Button>
          <Button onClick={handleDeleteWeek} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageWeeks;

