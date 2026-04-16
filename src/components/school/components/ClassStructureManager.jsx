import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import ClassStructureTable from './ClassStructureTable';
import { fetchClassStructures, toggleClassStructureStatus } from '../../../api/classStructureApi';

const ClassStructureManager = () => {
  const [classStructures, setClassStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchClassStructures();
      if (response.status) {
        setClassStructures(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleToggleStatus = async (structure) => {
    try {
      const response = await toggleClassStructureStatus(structure.id);
      if (response.status) {
        showSnackbar(`Class ${structure.status === 'active' ? 'deactivated' : 'activated'} successfully`);
        setClassStructures((prev) =>
          prev.map((item) =>
            item.id === structure.id ? { ...item, status: response.data.status } : item
          )
        );
      } else {
        showSnackbar(response.message || 'Failed to toggle status', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to toggle status', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Structure
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View classes and their arms. Activate or deactivate as needed.
        </Typography>
      </Box>

      <Paper>
        <ClassStructureTable
          classStructures={classStructures}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassStructureManager;
