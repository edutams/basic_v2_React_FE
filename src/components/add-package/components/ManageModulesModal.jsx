import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  FormControlLabel,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';

import PropTypes from 'prop-types';
import { useNotification } from '../../../hooks/useNotification';
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
  allModules = [],
  packageModules = [],
  onModuleAssignment,
  isLoading = false,
  error = null,
}) => {
  const [moduleAssignments, setModuleAssignments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const notify = useNotification();

  useEffect(() => {
    if (open && currentPackage) {
      const assignments = {};
      allModules.forEach((module) => {
        assignments[module.id] = packageModules.some((pm) => pm.id === module.id);
      });
      setModuleAssignments(assignments);
    }
  }, [open, currentPackage, allModules, packageModules]);

  const handleToggleModule = (moduleId, checked) => {
    setModuleAssignments((prev) => ({
      ...prev,
      [moduleId]: checked,
    }));
  };

  const handleSelectAllCategory = (category, checked) => {
    const updatedAssignments = { ...moduleAssignments };
    allModules
      .filter((module) => {
        const cat = getCategoryName(module);
        const status = module.module_status || module.mod_status || '';
        return cat === category && status === 'active';
      })
      .forEach((module) => {
        updatedAssignments[module.id] = checked;
      });
    setModuleAssignments(updatedAssignments);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleSaveClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = () => {
    const assignedModules = allModules.filter((module) => moduleAssignments[module.id]);
    const unassignedModules = allModules.filter((module) => !moduleAssignments[module.id]);
    onModuleAssignment(currentPackage, assignedModules, unassignedModules);
    setConfirmDialogOpen(false);
    onClose();
  };

  const getAssignedCount = useMemo(() => {
    return Object.values(moduleAssignments).filter(Boolean).length;
  }, [moduleAssignments]);

  const groupedModules = useMemo(() => {
    const groups = {};
    allModules
      .filter((module) => {
        const name = module.module_name || module.mod_name || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .forEach((module) => {
        const category = getCategoryName(module);
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(module);
      });
    return groups;
  }, [allModules, searchQuery]);

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Manage ${(currentPackage?.package_name || currentPackage?.pac_name) || 'Package'} Modules`}
      size="large"
      disableEnforceFocus
      disableAutoFocus
      aria-labelledby="manage-modules-modal"
    >
      <Box sx={{ p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
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
            {allModules.length} modules are assigned.
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
            aria-label="Search modules"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : Object.keys(groupedModules).length === 0 ? (
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
            {allModules
              .filter((module) => {
                const name = module.module_name || module.mod_name || '';
                return name.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((module) => {
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
            disabled={isLoading || getAssignedCount === packageModules.length}
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
  allModules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      module_name: PropTypes.string,
      mod_name: PropTypes.string,
      module_description: PropTypes.string,
      mod_description: PropTypes.string,
      module_status: PropTypes.string,
      mod_status: PropTypes.string,
      packageId: PropTypes.number,
      module_links: PropTypes.object,
      mod_links: PropTypes.object,
    }),
  ),
  packageModules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ),
  onModuleAssignment: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default React.memo(ManageModulesModal);
