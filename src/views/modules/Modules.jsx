import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from '../../components/shared/BlankCard';
import ModuleModal from '../../components/modules/ModuleModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Modules',
  },
];

const Modules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modules, setModules] = useState([
    {
      id: 1,
      mod_name: 'User Management',
      mod_description: 'Manage users and roles in the application.',
      mod_links: { link: '/users', permission: 'users.view' },
      mod_status: 'active',
    },
    {
      id: 2,
      mod_name: 'Reporting',
      mod_description: 'Generate and view system reports.',
      mod_links: { link: '/reports', permission: 'reports.view' },
      mod_status: 'inactive',
    },
    {
      id: 3,
      mod_name: 'Chart',
      mod_description: 'School portal dashboard chart',
      mod_links: { link: '/home', permission: 'dashboard.view' },
      mod_status: 'active',
    },
    {
      id: 4,
      mod_name: 'Billing',
      mod_description: 'Handle invoicing, transactions, and payment settings.',
      mod_links: { link: '/billing', permission: 'billing.manage' },
      mod_status: 'inactive',
    },
    {
      id: 5,
      mod_name: 'Notifications',
      mod_description: 'Manage alerts, emails, and push messages.',
      mod_links: { link: '/notifications', permission: 'notifications.view' },
      mod_status: 'active',
    },
    {
      id: 6,
      mod_name: 'Settings',
      mod_description: 'Configure system preferences.',
      mod_links: { link: '/settings', permission: 'settings.update' },
      mod_status: 'active',
    },
    {
      id: 7,
      mod_name: 'Audit Logs',
      mod_description: 'View system activity logs.',
      mod_links: { link: '/logs', permission: 'auditlogs.view' },
      mod_status: 'inactive',
    },
    {
      id: 8,
      mod_name: 'Help Center',
      mod_description: 'Access user guides and documentation.',
      mod_links: { link: '/help', permission: 'help.view' },
      mod_status: 'active',
    },
    {
      id: 9,
      mod_name: 'Analytics',
      mod_description: 'View insights and performance analytics.',
      mod_links: { link: '/analytics', permission: 'analytics.view' },
      mod_status: 'active',
    },
    {
      id: 10,
      mod_name: 'Feedback',
      mod_description: 'Collect and manage user feedback.',
      mod_links: { link: '/feedback', permission: 'feedback.view' },
      mod_status: 'inactive',
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleActionClick = (event, module) => {
    setAnchorEl(event.currentTarget);
    setSelectedModule(module);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedModule(null);
  };

  const handleRefresh = () => {
    console.log('Refreshing modules data...');
  };

  const updateModule = (updatedModule) => {
    setModules((prevModules) =>
      prevModules.map((module) => (module.id === updatedModule.id ? updatedModule : module)),
    );
  };

  const updateModuleStatus = (moduleId, newStatus) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === moduleId ? { ...module, mod_status: newStatus } : module,
      ),
    );
  };

  const deleteModule = (moduleId) => {
    setModules((prevModules) => prevModules.filter((module) => module.id !== moduleId));
  };

  const handleUpdateModule = (moduleData, actionType) => {
    setSelectedModule(moduleData);
    setActionType(actionType);
    setIsModalOpen(true);
  };

  const handleActivateModule = (moduleData) => {
    setSelectedModule(moduleData);
    setActionType('activate');
    setIsModalOpen(true);
  };

  const handleDeactivateModule = (moduleData) => {
    setSelectedModule(moduleData);
    setActionType('deactivate');
    setIsModalOpen(true);
  };

  const handleDeleteModule = (moduleData) => {
    setModuleToDelete(moduleData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      deleteModule(moduleToDelete.id);
    }
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredModules = modules.filter(
    (module) =>
      module.mod_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.mod_description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedModules = filteredModules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <PageContainer title="Modules" description="Manage system modules">
      <Breadcrumb title="Modules Manager" items={BCrumb} />

      <BlankCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="600">
              Available Modules
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Module Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Module Link</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedModules.length > 0 ? (
                    paginatedModules.map((module) => (
                      <TableRow
                        key={module.id}
                        sx={{
                          '&:hover': { bgcolor: 'grey.50' },
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
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
                          <Typography variant="body2" color="primary">
                            Link: {module.mod_links.link}, Permission: {module.mod_links.permission}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              bgcolor:
                                module.mod_status === 'active'
                                  ? (theme) => theme.palette.success.light
                                  : module.mod_status === 'inactive'
                                  ? (theme) => theme.palette.error.light
                                  : (theme) => theme.palette.secondary.light,
                              color:
                                module.mod_status === 'active'
                                  ? (theme) => theme.palette.success.main
                                  : module.mod_status === 'inactive'
                                  ? (theme) => theme.palette.error.main
                                  : (theme) => theme.palette.secondary.main,
                              borderRadius: '8px',
                            }}
                            size="small"
                            label={module.mod_status}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleActionClick(e, module)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No modules found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      colSpan={5}
                      count={filteredModules.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>

          {/* Action Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
            <MenuItem
              onClick={() => {
                handleActionClose();
                handleUpdateModule(selectedModule, 'update');
              }}
            >
              Edit Module
            </MenuItem>
            {selectedModule?.mod_status === 'active' ? (
              <MenuItem
                onClick={() => {
                  handleActionClose();
                  handleDeactivateModule(selectedModule);
                }}
              >
                Deactivate Module
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleActionClose();
                  handleActivateModule(selectedModule);
                }}
              >
                Activate Module
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleActionClose();
                handleDeleteModule(selectedModule);
              }}
            >
              Delete Module
            </MenuItem>
          </Menu>
        </CardContent>
      </BlankCard>

      <ModuleModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (actionType === 'update') {
            setSelectedModule(null);
          }
        }}
        handleRefresh={handleRefresh}
        updateModule={updateModule}
        updateModuleStatus={updateModuleStatus}
        selectedModule={selectedModule}
        actionType={actionType}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${moduleToDelete?.mod_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </PageContainer>
  );
};

export default Modules;
