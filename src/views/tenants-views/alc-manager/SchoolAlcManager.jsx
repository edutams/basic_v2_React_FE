import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { useNotification } from 'src/hooks/useNotification';

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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

import ParentCard from 'src/components/shared/ParentCard';
import PermissionAttachmentModal from 'src/components/alc-manager/components/PermissionAttachmentModal';
import ViewPermissionModal from 'src/components/alc-manager/components/ViewPermissionModal';
import NewRoleModal from 'src/components/alc-manager/components/NewRoleModal';
import SchoolAssignmentManagement from 'src/components/tenant-components/alc-manager/SchoolAssignmentManagement';
import SchoolAccessAnalysis from 'src/components/tenant-components/alc-manager/SchoolAccessAnalysis';

import aclApi from 'src/api/aclApi';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'ACL Manager' }];

const SchoolAlcManager = () => {
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

  const [roleType, setRoleType] = useState('');
  const [totalRoles, setTotalRoles] = useState(0);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const res = await aclApi.getSchoolRoles({
        page: page + 1,
        per_page: rowsPerPage,
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
  }, [page, rowsPerPage]);

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
      const res = await aclApi.getSchoolRolePermissions(row.id);
      setSelectedPermissions(res?.data ?? []);

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

  const handleSavePermissions = async () => {
    try {
      await aclApi.attachSchoolRolePermissions(
        selectedRow.id,
        selectedPermissions.map((p) => p.name),
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
      const res = await aclApi.getSchoolAllPermissions();
      setAllPermissions(res?.data ?? []);
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleViewPermission = async (row) => {
    try {
      const res = await aclApi.getSchoolRolePermissions(row.id);
      setPermissionsToView(res.data ?? []);
      setViewPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load permissions');
    }
  };

  const handleCreateRole = async () => {
    try {
      await aclApi.createSchoolRole({
        name: newRoleForm.roleName,
        guard_name: newRoleForm.guardName,
        description: newRoleForm.description,
      });

      notify.success('Role created successfully!');

      setNewRoleModalOpen(false);

      setNewRoleForm({
        roleName: '',
        guardName: 'web',
        description: '',
      });

      fetchRoles();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to create role');
    }
  };

  const filteredRows = useMemo(() => {
    if (!rows || !Array.isArray(rows)) return [];

    if (!roleType) return rows;

    const term = roleType.toLowerCase();

    return rows.filter((row) => row?.name?.toLowerCase()?.includes(term));
  }, [rows, roleType]);

  const resetFilters = () => {
    setRoleType('');
    setPage(0);
  };

  const hasFilters = roleType !== '';

  return (
    <PageContainer
      title="School Acl Manager"
      description="Access Control List Management for School"
    >
      <Breadcrumb title="School ACL Manager" items={BCrumb} />

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Permission Assignment" />
          <Tab label="Access Analysis" value="Access Analysis" />
        </Tabs>
      </Box>

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
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              placeholder="Search by role name"
              value={roleType}
              onChange={(e) => {
                setRoleType(e.target.value);
                setPage(0);
              }}
              // sx={{ width: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            {hasFilters && (
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{ height: 'fit-content', mb: 0.5 }}
              >
                Clear Filters
              </Button>
            )}
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
                      rowsPerPageOptions={[5, 10, 25, 50, 100]}
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

      {activeTab === 'Permission Assignment' && <SchoolAssignmentManagement />}

      {activeTab === 'Access Analysis' && <SchoolAccessAnalysis />}

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
    </PageContainer>
  );
};

export default SchoolAlcManager;
