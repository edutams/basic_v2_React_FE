import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { useNotification } from '../../hooks/useNotification';

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
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

import ParentCard from '../../components/shared/ParentCard';
import FilterSideDrawer from '../../components/shared/FilterSideDrawer';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import PermissionAttachmentModal from 'src/components/alc-manager/components/PermissionAttachmentModal';
import ViewPermissionModal from 'src/components/alc-manager/components/ViewPermissionModal';
import NewRoleModal from 'src/components/alc-manager/components/NewRoleModal';
import AssignmentManagement from 'src/components/alc-manager/components/AssignmentManagement';
import AccessAnalysis from 'src/components/alc-manager/components/AccessAnalysis';

import aclApi from 'src/api/aclApi';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'ACL Manager' }];

const AlcManager = () => {
  const notify = useNotification();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('Role Management');
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [viewPermissionModalOpen, setViewPermissionModalOpen] = useState(false);
  const [permissionsToView, setPermissionsToView] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [totalRoles, setTotalRoles] = useState(0);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const alcFilterDefs = [
    { key: 'name', label: 'Role Name', type: 'text', placeholder: 'Search by role name…' },
    // {
    //   key: 'guard_name',
    //   label: 'Guard',
    //   type: 'select',
    //   options: [
    //     { value: 'web', label: 'Web' },
    //     { value: 'api', label: 'API' },
    //   ],
    // },
  ];

  const [newRoleForm, setNewRoleForm] = useState({
    roleName: '',
    guardName: 'web',
    description: '',
  });

  const handleNewRoleFieldChange = (field, value) => {
    setNewRoleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await aclApi.getRoles({
        page: page + 1,
        per_page: rowsPerPage,
        ...activeFilters,
      });

      const rolesArray = res?.data?.data ?? [];
      const total = res?.data?.total ?? 0;

      setRows(Array.isArray(rolesArray) ? rolesArray : []);
      setTotalRoles(total);
    } catch (error) {
      setRows([]);
      notify.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, [page, rowsPerPage, activeFilters]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleAttachPermission = async (row) => {
    try {
      setSelectedRow(row);
      const res = await aclApi.getRolePermissions(row.id);

      // Extract permissions already attached to this role
      setSelectedPermissions(res?.data?.permissions ?? []);

      // Store all available permissions for the modal
      setAllPermissions(res?.data?.available_permissions ?? []);

      setPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load attached permissions');
    }
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => {
      const exists = prev.some((p) => p.id === permission.id);

      return exists ? prev.filter((p) => p.id !== permission.id) : [...prev, permission];
    });
  };

  const handleSavePermissions = async (permissions) => {
    try {
      const permissionsToSave = permissions || selectedPermissions;

      // Send permission IDs to the backend (not names)
      await aclApi.attachPermissions(
        selectedRow.id,
        permissionsToSave.map((p) => p.id),
      );

      notify.success('Permissions updated successfully!');
      setPermissionModalOpen(false);
      fetchRoles();
    } catch (err) {
      notify.error('Permission update failed');
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await aclApi.getAllPermissions();
      setAllPermissions(res?.data ?? []);
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleViewPermission = async (row) => {
    try {
      const res = await aclApi.getRolePermissions(row.id);
      setPermissionsToView(res.data?.permissions ?? []);
      setViewPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleCreateRole = async () => {
    try {
      await aclApi.createRole({
        name: newRoleForm.roleName,
        guard_name: newRoleForm.guardName,
        description: newRoleForm.description,
      });

      notify.success('Role created successfully!');

      setNewRoleModalOpen(false);

      setNewRoleForm({
        roleName: '',
        // guardName: 'web',
        description: '',
      });

      fetchRoles();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to create role');
    }
  };

  const filteredRows = rows;

  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
    setPage(0); // Reset to first page when filters change
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
  };

  const hasFilters = activeFilterCount > 0;

  return (
    <PageContainer title="ACL Manager" description="Access Control List Management Dashboard">
      <Breadcrumb title="ACL Manager" items={BCrumb} />

      <Box
        sx={{
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          '& .MuiTabs-root': {
            minWidth: '300px',
          },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Assignment Management" />
          <Tab label="Access Analysis" value="Analysis Report" />
        </Tabs>
      </Box>

      {activeTab === 'Assignment Management' && <AssignmentManagement />}
      {activeTab === 'Analysis Report' && <AccessAnalysis />}

      {activeTab === 'Role Management' && (
        <ParentCard
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">Manage Roles</Typography>

              <Button variant="contained" color="primary" onClick={() => setNewRoleModalOpen(true)}>
                New Role
              </Button>
            </Box>
          }
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<IconAdjustmentsHorizontal size={18} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                borderColor: activeFilterCount > 0 ? '#3949ab' : 'divider',
                color: activeFilterCount > 0 ? '#3949ab' : 'text.secondary',
                fontWeight: activeFilterCount > 0 ? 700 : 400,
                '&:hover': { borderColor: '#3949ab', color: '#fff' },
              }}
            >
              Show Filters
              {activeFilterCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.1,
                    bgcolor: '#3949ab',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
            </Button>
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Guard Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length > 0 ? (
                    filteredRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.guard_name}</TableCell>
                        <TableCell>{row.description}</TableCell>

                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleAttachPermission(row)}>
                              Attach Permission
                            </MenuItem>

                            <MenuItem onClick={() => handleViewPermission(row)}>
                              View Permission
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Alert
                          severity="info"
                          sx={{
                            mb: 3,
                            justifyContent: 'center',
                            textAlign: 'center',
                            '& .MuiAlert-icon': {
                              mr: 1.5,
                            },
                          }}
                        >
                          {hasFilters
                            ? 'No roles match the current filters.'
                            : 'No roles available. Create a new role to get started.'}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={hasFilters ? filteredRows.length : totalRoles}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </ParentCard>
      )}

      <PermissionAttachmentModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        selectedRow={selectedRow}
        availablePermissions={allPermissions}
        selectedPermissions={selectedPermissions || []}
        permissionSearch={permissionSearch}
        onPermissionSearchChange={setPermissionSearch}
        onPermissionChange={handlePermissionChange}
        onSave={handleSavePermissions}
      />

      <ViewPermissionModal
        open={viewPermissionModalOpen}
        onClose={() => setViewPermissionModalOpen(false)}
        selectedRow={selectedRow}
        permissionsToView={permissionsToView}
      />

      <NewRoleModal
        open={newRoleModalOpen}
        onClose={() => setNewRoleModalOpen(false)}
        formData={newRoleForm}
        onFieldChange={handleNewRoleFieldChange}
        onSave={handleCreateRole}
      />

      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={alcFilterDefs}
        title="Filter Roles"
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </PageContainer>
  );
};

export default AlcManager;
