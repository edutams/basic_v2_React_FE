import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { useNotification } from '@/hooks/useNotification';

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
  CircularProgress,
  Alert,
} from '@mui/material';

import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

import ParentCard from '@/components/shared/ParentCard';
import FilterSideDrawer from '@/components/shared/FilterSideDrawer';
import PermissionAttachmentModal from '@/components/tenant/alc-manager/SchoolPermissionAttachmentModal';
import ViewPermissionModal from '@/components/tenant/alc-manager/SchoolViewPermissionModal';
import NewRoleModal from '@/components/tenant/alc-manager/SchoolNewRoleModal';
import SchoolAssignmentManagement from '@/components/tenant/alc-manager/SchoolAssignmentManagement';
import SchoolAccessAnalysis from '@/components/tenant/alc-manager/SchoolAccessAnalysis';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';

import aclApi from '@/api/tenant/acl/aclApi';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'ACL Manager' }];

// ── Tour steps ────────────────────────────────────────────────────────────────
const roleTourSteps = [
  {
    selector: '[data-tour="acl-role-heading"]',
    content: (
      <StepContent
        title="Role Management"
        body="Create and manage roles here. Use the New Role button to add a role, and the action menu on each row to attach or view its permissions."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-new"]',
    content: (
      <StepContent
        title="New Role"
        body="Click 'New Role' to create a new role with a name and description."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-filter"]',
    content: (
      <StepContent
        title="Filters"
        body="Use the Filters button to search for roles by name and narrow down the list."
      />
    ),
  },
  {
    selector: '[data-tour="acl-role-table"]',
    content: (
      <StepContent
        title="Roles Table"
        body="Each row shows a role and its description. Use the action menu (⋮) to attach or view permissions."
      />
    ),
  },
];

const assignTourSteps = [
  {
    selector: '[data-tour="acl-assign-heading"]',
    content: (
      <StepContent
        title="Permission Assignment"
        body="Assign roles and permissions to users. Search for a user, then use the columns to assign roles or direct permissions."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-search"]',
    content: (
      <StepContent
        title="Search"
        body="Search for a user by name to quickly find the one you want to manage."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-direct"]',
    content: (
      <StepContent
        title="Assign Direct Permission"
        body="Open the ⋮ (More) menu on any row and choose 'Assign Direct Permission'. Permissions are grouped by module — tick the ones to assign directly to the user."
      />
    ),
  },
  {
    selector: '[data-tour="acl-assign-view"]',
    content: (
      <StepContent
        title="View Permission"
        body="In the same ⋮ (More) menu, choose 'View Permission' to see all permissions attached to the user. Check or uncheck permissions, then submit your changes."
      />
    ),
  },
];

const analysisTourSteps = [
  {
    selector: '[data-tour="acl-analysis-tabs"]',
    content: (
      <StepContent
        title="Access Analysis"
        body="Analyze access across your school using the Role Based or Permission Based views."
      />
    ),
  },
  {
    selector: '[data-tour="acl-analysis-content"]',
    content: (
      <StepContent
        title="Analysis Views"
        body="Role Based shows each role with its total permissions and the users assigned to it. Permission Based shows each permission with the roles and users that use it. Click the numbers to drill down."
      />
    ),
  },
];

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

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const schoolFilterDefs = [
    { key: 'name', label: 'Role Name', type: 'text', placeholder: 'Search by role name…' },
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
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
      };

      // Add filter parameters
      Object.keys(activeFilters).forEach((key) => {
        if (activeFilters[key]) {
          params[key] = activeFilters[key];
        }
      });

      const res = await aclApi.getSchoolRoles(params);

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
      const res = await aclApi.getSchoolAllRolePermissions(row.id);
      setSelectedPermissions(res?.data ?? []);

      setPermissionModalOpen(true);
      handleMenuClose();
    } catch (err) {
      notify.error('Failed to load attached permissions');
    }
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => {
      if (!Array.isArray(prev)) {
        return [permission];
      }
      const exists = prev.some((p) => p.id === permission.id);

      return exists ? prev.filter((p) => p.id !== permission.id) : [...prev, permission];
    });
  };

  const handleSavePermissions = async () => {
    try {
      // Check if any permissions are selected
      if (!selectedPermissions || selectedPermissions.length === 0) {
        notify.error('Please select at least one permission');
        return;
      }

      const response = await aclApi.attachSchoolRolePermissions(
        selectedRow.id,
        selectedPermissions.map((p) => p.name),
      );

      if (response.status) {
        notify.success('Permissions updated successfully!');
        setPermissionModalOpen(false);
        fetchRoles();
      } else {
        // Handle validation errors
        if (response.errors) {
          notify.error(
            response.errors.permissions?.[0] || response.message || 'Failed to update permissions',
          );
        } else {
          notify.error(response.message || 'Failed to update permissions');
        }
      }
    } catch (err) {
      console.error('Save permissions error:', err);

      // Handle validation errors from API response
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        notify.error(errorMessages[0] || 'Validation failed');
      } else {
        notify.error(err.response?.data?.message || 'Permission update failed');
      }
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

  const handleViewPermissions = async (row) => {
    try {
      setSelectedRow(row);
      const res = await aclApi.getSchoolAllRolePermissions(row.id);
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

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setPage(0);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
  };

  const resetFilters = () => {
    setRoleType('');
    setPage(0);
  };

  const hasFilters = roleType !== '';

  return (
    <PageContainer title="Acl Manager" description="Access Control List Management for School">
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
        >
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Permission Assignment" />
          <Tab label="Access Analysis" value="Access Analysis" />
        </Tabs>
      </Box>

      {activeTab === 'Role Management' && (
        <AclTourProvider steps={roleTourSteps} autoPlay storageKey="acl_role_tour_seen">
          <ParentCard
            title={
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography variant="h5" data-tour="acl-role-heading">Manage Roles</Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  <ShowTourGuideButton />
                  <Button variant="contained" size="small" color="primary" data-tour="acl-role-new" onClick={() => setNewRoleModalOpen(true)}>
                    New Role
                  </Button>
                </Box>
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
            <Button variant="contained" size="small" startIcon={<IconAdjustmentsHorizontal />}
              onClick={() => setFilterDrawerOpen(true)}
              data-tour="acl-role-filter"
              sx={{
                borderRadius: 2,
                px: 2.5,
                fontWeight: activeFilterCount > 0 ? 700 : 400,
              }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.1,
                    bgcolor: 'primary.main',
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

          {/* <Paper> */}
          <Box data-tour="acl-role-table">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 70 }}>S/N</TableCell>
                    <TableCell>Role Name</TableCell>
                    {/* <TableCell>Guard Name</TableCell> */}
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
                      {/* <TableCell>{row.guard_name}</TableCell> */}
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

                          <MenuItem onClick={() => handleViewPermissions(row)}>
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
          {/* </Paper> */}
          </Box>
        </ParentCard>
        </AclTourProvider>
      )}

      {activeTab === 'Permission Assignment' && (
        <AclTourProvider steps={assignTourSteps} autoPlay storageKey="acl_assign_tour_seen">
          <SchoolAssignmentManagement />
        </AclTourProvider>
      )}

      {activeTab === 'Access Analysis' && (
        <AclTourProvider steps={analysisTourSteps} autoPlay storageKey="acl_analysis_tour_seen">
          <SchoolAccessAnalysis />
        </AclTourProvider>
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
        filters={schoolFilterDefs}
        activeFilters={activeFilters}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </PageContainer>
  );
};

export default SchoolAlcManager;
