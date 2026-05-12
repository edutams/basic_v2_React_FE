import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Snackbar, CircularProgress, Button } from '@mui/material';
import ClassStructureTable from './ClassStructureTable';
import { fetchClassStructures, toggleClassStructureStatus } from '../../../api/classStructureApi';
import { saveClasses } from '../../../context/TenantContext/services/tenant.service';

const ClassStructureManager = () => {
  const [classStructures, setClassStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

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
            programme_id: programme.id,
            arms: cls.class_arms || [],
            arm_names: cls.class_arms?.map((a) => a.arm_names) || [],
            no_of_arms: cls.class_arms?.length || 0,
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

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
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

  const generateDefaultArmNames = (count) => {
    const letters = [];
    for (let i = 0; i < count; i++) {
      // Generate A, B, C, ... Z, AA, AB, etc.
      let letter = '';
      let num = i;
      while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
      }
      letters.push(letter);
    }
    return letters;
  };

  const handleNoOfArmsChange = (id, value) => {
    const numArms = parseInt(value) || 0;
    setClassStructures((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, no_of_arms: numArms };
        }
        return item;
      }),
    );
    setHasChanges(true);
  };

  const handleGenerateArms = (id) => {
    setClassStructures((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const defaultArms = generateDefaultArmNames(item.no_of_arms || 0);
          return { ...item, arm_names: defaultArms };
        }
        return item;
      }),
    );
    setHasChanges(true);
    showSnackbar('Class arm names generated successfully!', 'success');
  };

  const handleArmNameChange = (id, armIndex, value) => {
    setClassStructures((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newArmNames = [...item.arm_names];
          newArmNames[armIndex] = value;
          return { ...item, arm_names: newArmNames };
        }
        return item;
      }),
    );
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const classesData = classStructures.map((cls) => ({
        class_id: cls.class_id,
        programme_id: cls.programme_id,
        program_class_id: cls.id,
        class_name: cls.class_name,
        status: cls.status,
        no_of_arms: cls.no_of_arms || 0,
        arm_names: cls.arm_names || [],
      }));

      await saveClasses(classesData);
      await loadData(false);
      setHasChanges(false);
      showSnackbar('Classes saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save classes:', error);
      showSnackbar('Failed to save classes. Please try again.', 'error');
    } finally {
      setSaving(false);
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
        <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
          <Typography variant="body2" color="info.dark">
            💡 <strong>Remember:</strong> After generating or modifying class arms, click the "Save Changes" button below to persist your updates.
          </Typography>
        </Box>
      </Box>

      <Paper>
        <ClassStructureTable
          classStructures={classStructures}
          onToggleStatus={handleToggleStatus}
          onNoOfArmsChange={handleNoOfArmsChange}
          onGenerateArms={handleGenerateArms}
          onArmNameChange={handleArmNameChange}
          loading={loading}
        />
      </Paper>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSaveChanges}
          disabled={!hasChanges || saving}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

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
