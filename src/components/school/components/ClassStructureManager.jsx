import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Snackbar, CircularProgress } from '@mui/material';
import ClassStructureTable from './ClassStructureTable';
import { fetchClassStructures, toggleClassStructureStatus } from '../../../api/classStructureApi';

const ClassStructureManager = () => {
  const [classStructures, setClassStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const flattenClassStructures = (divisions) => {
    if (!divisions || !Array.isArray(divisions)) return [];

    const flattened = [];

    divisions.forEach((division) => {
      division.programmes?.forEach((programme) => {
        programme.classes?.forEach((cls) => {
          const pivot = cls.pivot;

          flattened.push({
            id: pivot?.id,
            class_id: cls.id,
            class_name: cls.class_name || cls.class_display_name,
            class_code: cls.class_code,
            division: division.division_name,
            programme_code: programme.programme_code,
            arms: cls.class_arms || [],
            status: pivot?.status || cls.status || 'active', // ← Use pivot status first!
          });
        });
      });
    });

    return flattened;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchClassStructures();
      if (response.status && response.data) {
        const flattenedData = flattenClassStructures(response.data);
        setClassStructures(flattenedData);
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
        const newStatus =
          response.data?.status || (structure.status === 'active' ? 'inactive' : 'active');

        showSnackbar(`Class updated to ${newStatus} successfully`, 'success');
        setClassStructures((prev) =>
          prev.map((item) => (item.id === structure.id ? { ...item, status: newStatus } : item)),
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
