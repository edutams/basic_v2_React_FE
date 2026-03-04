import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  FormControlLabel,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';
import eduTierApi from 'src/api/eduTierApi';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const categoryMap = {
  1: 'Dashboard',
  2: 'Setup',
  3: 'Academics Management',
  4: 'Class Management',
  5: 'Subscriptions',
};

const getCategoryName = (module) => {
  return categoryMap[module.packageId] || `Package ${module.packageId}`;
};

const ManageModulesModal = ({
  open,
  onClose,
  currentPackage,
  onModuleAssignment,
  isLoading: propLoading = false,
  error = null,
}) => {
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moduleAssignments, setModuleAssignments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch modules for the specific package when modal opens or when package changes
  useEffect(() => {
    if (open && currentPackage?.id) {
      setAllModules([]); // Clear previous modules
      fetchPackageModules(currentPackage.id);
    } else if (!open) {
      setAllModules([]); // Clear when closed
      setModuleAssignments({});
    }
  }, [open, currentPackage?.id]);

  const fetchPackageModules = async (packageId) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await eduTierApi.getPackageModules(packageId);
      setAllModules(res?.data || res || []);
    } catch (err) {
      console.error('Failed to fetch package modules:', err);
      setFetchError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  // Since API returns only modules for the package, use allModules directly
  const packageModulesOnly = allModules;

  // Initialize selections when modal opens
  useEffect(() => {
    if (open && currentPackage && packageModulesOnly.length > 0) {
      const assignments = {};
      packageModulesOnly.forEach((module) => {
        assignments[module.id] = true;
      });
      setModuleAssignments(assignments);
    }
  }, [open, currentPackage, packageModulesOnly]);

  const handleToggleModule = (moduleId, checked) => {
    setModuleAssignments((prev) => ({
      ...prev,
      [moduleId]: checked,
    }));
  };

  const handleSaveClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = () => {
    const assignedModules = packageModulesOnly.filter((module) => moduleAssignments[module.id]);
    const unassignedModules = packageModulesOnly.filter((module) => !moduleAssignments[module.id]);

    onModuleAssignment(currentPackage, assignedModules, unassignedModules);

    setConfirmDialogOpen(false);
    onClose();
  };

  const getAssignedCount = useMemo(() => {
    return Object.values(moduleAssignments).filter(Boolean).length;
  }, [moduleAssignments]);

  const filteredModules = useMemo(() => {
    return packageModulesOnly.filter((module) => {
      const name = (module.module_name || module.mod_name || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [packageModulesOnly, searchQuery]);

  const isLoading = loading || propLoading;

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={
        <>
          Manage{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {currentPackage?.package_name || currentPackage?.pac_name || 'Package'}
          </Box>{' '}
          modules
        </>
      }
      size="large"
      disableEnforceFocus
      disableAutoFocus
      aria-labelledby="manage-modules-modal"
    >
      <Box sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'info.light',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InfoOutlinedIcon color="info" />
          <Typography variant="body2" color="textSecondary">
            Select modules to assign to this package. Currently {getAssignedCount} of{' '}
            {packageModulesOnly.length} modules are assigned.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
        </Box>

        {(error || fetchError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || fetchError}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredModules.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchQuery ? 'No modules match your search.' : 'No modules available to assign.'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              p: 2,
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#f9f9f9'),
              borderRadius: 2,
            }}
          >
            {filteredModules.map((module) => {
              const name = module.module_name || module.mod_name;
              const status = module.module_status || module.mod_status || '';

              return (
                <FormControlLabel
                  key={module.id}
                  control={
                    <Checkbox
                      checked={moduleAssignments[module.id] || false}
                      onChange={(e) => handleToggleModule(module.id, e.target.checked)}
                      disabled={status === 'inactive'}
                    />
                  }
                  label={
                    <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                      {name}
                    </Typography>
                  }
                />
              );
            })}
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={isLoading || getAssignedCount === packageModulesOnly.length}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Assignment"
        message="Are you sure you want to save these module assignments?"
        confirmText="Save"
        cancelText="Cancel"
      />
    </ReusableModal>
  );
};

ManageModulesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentPackage: PropTypes.object,
  onModuleAssignment: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default React.memo(ManageModulesModal);
