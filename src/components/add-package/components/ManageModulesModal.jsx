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
      .filter((module) => getCategoryName(module) === category && module.mod_status === 'active')
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
    // notify.success('Module assignments updated successfully', 'Success');
    setConfirmDialogOpen(false);
    onClose();
  };

  const getAssignedCount = useMemo(() => {
    return Object.values(moduleAssignments).filter(Boolean).length;
  }, [moduleAssignments]);

  const groupedModules = useMemo(() => {
    const groups = {};
    allModules
      .filter((module) => module.mod_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
      title={`Manage ${currentPackage?.pac_name || 'Package'} Modules`}
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
          // <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '50vh' }}>
          //   <Table stickyHeader aria-label="Module assignment table">
          //     <TableHead>
          //       <TableRow>
          //         <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
          //         <TableCell sx={{ fontWeight: 'bold' }}>Module Name</TableCell>
          //         <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
          //         <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
          //         <TableCell align="center" sx={{ fontWeight: 'bold' }}>
          //           Assign
          //         </TableCell>
          //       </TableRow>
          //     </TableHead>
          //     <TableBody>
          //       {Object.entries(groupedModules).map(([category, modules], catIndex) => (
          //         <React.Fragment key={category}>
          //           <TableRow>
          //             <TableCell colSpan={5} sx={{ bgcolor: 'grey.200', fontWeight: 'bold' }}>
          //               <Box
          //                 sx={{
          //                   display: 'flex',
          //                   alignItems: 'center',
          //                   justifyContent: 'space-between',
          //                 }}
          //               >
          //                 <Typography variant="subtitle1">{category}</Typography>
          //                 <Checkbox
          //                   checked={modules
          //                     .filter((m) => m.mod_status === 'active')
          //                     .every((m) => moduleAssignments[m.id])}
          //                   indeterminate={
          //                     modules.some((m) => moduleAssignments[m.id]) &&
          //                     !modules
          //                       .filter((m) => m.mod_status === 'active')
          //                       .every((m) => moduleAssignments[m.id])
          //                   }
          //                   onChange={(e) => handleSelectAllCategory(category, e.target.checked)}
          //                   aria-label={`Select all modules in ${category}`}
          //                 />
          //               </Box>
          //             </TableCell>
          //           </TableRow>
          //           {modules.map((module, index) => (
          //             <TableRow
          //               key={module.id}
          //               sx={{ '&:hover': { bgcolor: 'grey.100' } }}
          //               role="checkbox"
          //               aria-checked={moduleAssignments[module.id] || false}
          //             >
          //               <TableCell>
          //                 {catIndex + 1}.{index + 1}
          //               </TableCell>
          //               <TableCell>
          //                 <Typography variant="body2" fontWeight="medium">
          //                   {module.mod_name}
          //                 </Typography>
          //               </TableCell>
          //               <TableCell>
          //                 <Typography variant="body2" color="textSecondary">
          //                   {module.mod_description || 'No description available'}
          //                 </Typography>
          //               </TableCell>
          //               <TableCell>
          //                 {/* <Typography
          //                   variant="body2"
          //                   color={module.mod_status === 'active' ? 'success.main' : 'error.main'}
          //                   fontWeight="medium"
          //                 >
          //                   {module.mod_status.toUpperCase()}
          //                 </Typography> */}
          //               </TableCell>
          //               <TableCell align="center">
          //                 <Checkbox
          //                   checked={moduleAssignments[module.id] || false}
          //                   onChange={(e) => handleToggleModule(module.id, e.target.checked)}
          //                   disabled={module.mod_status === 'inactive'}
          //                   color="primary"
          //                   inputProps={{ 'aria-label': `Assign ${module.mod_name} to package` }}
          //                 />
          //               </TableCell>
          //             </TableRow>
          //           ))}
          //         </React.Fragment>
          //       ))}
          //     </TableBody>
          //   </Table>
          // </TableContainer>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              p: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: 2,
            }}
          >
            {allModules
              .filter((module) => module.mod_name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((module) => (
                <FormControlLabel
                  key={module.id}
                  control={
                    <Checkbox
                      checked={moduleAssignments[module.id] || false}
                      onChange={(e) => handleToggleModule(module.id, e.target.checked)}
                      disabled={module.mod_status === 'inactive'}
                    />
                  }
                  label={
                    <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                      {module.mod_name}
                    </Typography>
                  }
                />
              ))}
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
      mod_name: PropTypes.string.isRequired,
      mod_description: PropTypes.string,
      mod_status: PropTypes.string.isRequired,
      packageId: PropTypes.number,
      mod_links: PropTypes.shape({
        link: PropTypes.string,
        permission: PropTypes.string,
      }),
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
