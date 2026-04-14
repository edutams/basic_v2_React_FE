import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {} from '@mui/icons-material';
import ClassStructureTable from './ClassStructureTable';
import {
  fetchClassStructures,
  toggleClassStructureStatus,
  fetchClassStructureStats,
} from '../../../api/classStructureApi';

const ClassStructureManager = () => {
  const [classStructures, setClassStructures] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [structuresResponse, statsResponse] = await Promise.all([
        fetchClassStructures(),
        fetchClassStructureStats(),
      ]);
      
      if (structuresResponse.status) {
        setClassStructures(structuresResponse.data);
      }
      
      if (statsResponse.status) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      showSnackbar('Failed to load class structures', 'error');
      console.error('Error loading class structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleToggleStatus = async (structure) => {
    try {
      const response = await toggleClassStructureStatus(structure.id);
      if (response.status) {
        showSnackbar(`Class structure ${structure.status === 'active' ? 'deactivated' : 'activated'} successfully`);
        // Update the specific item in the array instead of reloading all data
        setClassStructures(prev => 
          prev.map(item => 
            item.id === structure.id 
              ? { ...item, status: response.data.status }
              : item
          )
        );
      } else {
        showSnackbar(response.message || 'Failed to toggle status', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to toggle status', 'error');
      console.error('Error toggling status:', error);
    }
  };

  const handleRefresh = () => {
    loadData();
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
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Structure Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your school's class structures and arms
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box mb={3}>
          <Stack direction="row" spacing={2}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Classes
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Classes
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" color="error.main">
                {stats.inactive}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inactive Classes
              </Typography>
            </Paper>
          </Stack>
        </Box>
      )}

      
      {/* Table */}
      <Paper>
        <ClassStructureTable
          classStructures={classStructures}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassStructureManager;
