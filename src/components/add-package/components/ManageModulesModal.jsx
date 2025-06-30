import React, { useState, useEffect } from 'react';
import {
  Box,
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
} from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import PropTypes from 'prop-types';
import { useNotification } from '../../../hooks/useNotification';

const ManageModulesModal = ({
  open,
  onClose,
  currentPackage,
  allModules = [],
  packageModules = [],
  onModuleAssignment,
  isLoading = false
}) => {
  const [moduleAssignments, setModuleAssignments] = useState({});
  const notify = useNotification();

  useEffect(() => {
    if (open && currentPackage) {
      const assignments = {};
      allModules.forEach(module => {
        assignments[module.id] = packageModules.some(pm => pm.id === module.id);
      });
      setModuleAssignments(assignments);
    }
  }, [open, currentPackage, allModules, packageModules]);

  const handleToggleModule = (moduleId, checked) => {
    setModuleAssignments(prev => ({
      ...prev,
      [moduleId]: checked
    }));
  };

  const handleSave = () => {
    const assignedModules = allModules.filter(module => moduleAssignments[module.id]);
    const unassignedModules = allModules.filter(module => !moduleAssignments[module.id]);
    
    onModuleAssignment(currentPackage, assignedModules, unassignedModules);
    notify.success('Module assignments updated successfully', 'Success');
    onClose();
  };

  const getAssignedCount = () => {
    return Object.values(moduleAssignments).filter(Boolean).length;
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Manage ${currentPackage?.pac_name} Modules`}
      size="large"
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.dark' }}>
          <Typography variant="body2" color="textSecondary">
            Select modules to assign to this package. Currently {getAssignedCount()} of {allModules.length} modules are assigned.
          </Typography>
        </Box>

        {isLoading ? (
          <Typography>Loading modules...</Typography>
        ) : allModules.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No modules available to assign.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Module Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Assigned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allModules.map((module, index) => (
                  <TableRow key={module.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {module.mod_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {module.mod_description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={module.mod_status === 'active' ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {module.mod_status.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={moduleAssignments[module.id] || false}
                        onChange={(e) => handleToggleModule(module.id, e.target.checked)}
                        disabled={module.mod_status === 'inactive'}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

ManageModulesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentPackage: PropTypes.object,
  allModules: PropTypes.array,
  packageModules: PropTypes.array,
  onModuleAssignment: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ManageModulesModal;
