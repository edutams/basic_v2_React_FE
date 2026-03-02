import React, { useState } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';
import ModuleModal from './ModuleModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';
import PropTypes from 'prop-types';
import { useNotification } from '../../../hooks/useNotification';

const ModuleManagement = ({
  packageModules = [],
  currentPackage,
  onModuleUpdate,
  onAttachModule = null,
  isLoading = false,
  onBack = null,
}) => {
  const [modSearch, setModSearch] = useState('');
  const [modulePage, setModulePage] = useState(0);
  const [moduleRowsPerPage, setModuleRowsPerPage] = useState(5);
  const [moduleAnchorEl, setModuleAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleActionType, setModuleActionType] = useState('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const notify = useNotification();

  const filteredModules = packageModules.filter((mod) => {
    const name = mod.module_name || mod.mod_name || '';
    const description = mod.module_description || mod.mod_description || '';
    return (
      name.toLowerCase().includes(modSearch.toLowerCase()) ||
      description.toLowerCase().includes(modSearch.toLowerCase())
    );
  });

  const paginatedModules = filteredModules.slice(
    modulePage * moduleRowsPerPage,
    modulePage * moduleRowsPerPage + moduleRowsPerPage,
  );

  const handleModuleMenuOpen = (event, mod) => {
    setModuleAnchorEl(event.currentTarget);
    setSelectedModule(mod);
  };

  const handleModuleMenuClose = () => {
    setModuleAnchorEl(null);
    setSelectedModule(null);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      onModuleUpdate(moduleToDelete, 'delete');
      notify.success('Module deleted successfully', 'Success');
    }
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  const handleStatusChange = (module, status) => {
    const updatedModule = { 
      ...module, 
      module_status: status 
    };
    onModuleUpdate(updatedModule, 'update');
    notify.success(
      `Module ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      'Success',
    );
    handleModuleMenuClose();
  };

  const renderEmptyState = () => {
    if (!currentPackage) {
      return (
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Here is where you can select, add, edit, and manage your package for the existing module
            of your preference.
          </Typography>
        </Box>
      );
    }

    if (packageModules.length === 0) {
      return (
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            No modules found for this package. Click "Attach Module" to get started.
          </Typography>
        </Box>
      );
    }

    return null;
  };

  return (
    <ParentCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" alignItems="center">
            {onBack && (
              <IconButton onClick={onBack} sx={{ mr: 2 }} color="primary">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h5">
              {packageModules.length > 0 && currentPackage ? (
                <>
                  Modules in{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {currentPackage.package_name || currentPackage.pac_name}
                  </Box>
                </>
              ) : (
                'Modules'
              )}
            </Typography>
          </Box>

          {currentPackage && onAttachModule && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAttachModule}
              sx={{ ml: 2 }}
            >
              Attach Module
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search modules..."
            value={modSearch}
            onChange={(e) => setModSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : packageModules.length === 0 ? (
          renderEmptyState()
        ) : (
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Module Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedModules.map((mod, index) => {
                    const name = mod.module_name || mod.mod_name;
                    const description = mod.module_description || mod.mod_description;
                    const status = mod.module_status || mod.mod_status || 'inactive';

                    return (
                      <TableRow key={mod.id || index} hover>
                        <TableCell>{modulePage * moduleRowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {name}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 300 }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            {description}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            sx={{
                              bgcolor:
                                status === 'active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                              color:
                                status === 'active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                              borderRadius: '8px',
                            }}
                            size="small"
                            label={status.toUpperCase()}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Menu
                            anchorEl={moduleAnchorEl}
                            open={Boolean(moduleAnchorEl) && selectedModule?.id === mod.id}
                            onClose={handleModuleMenuClose}
                          >
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      colSpan={5}
                      count={filteredModules.length}
                      rowsPerPage={moduleRowsPerPage}
                      page={modulePage}
                      onPageChange={(_, newPage) => setModulePage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setModuleRowsPerPage(parseInt(e.target.value, 10));
                        setModulePage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>

      <ModuleModal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        actionType={moduleActionType}
        selectedModule={selectedModule}
        currentPackage={currentPackage}
        onModuleUpdate={onModuleUpdate}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${moduleToDelete?.module_name || moduleToDelete?.mod_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </ParentCard>
  );
};

ModuleManagement.propTypes = {
  packageModules: PropTypes.array,
  currentPackage: PropTypes.object,
  onModuleUpdate: PropTypes.func.isRequired,
  onAttachModule: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ModuleManagement;
