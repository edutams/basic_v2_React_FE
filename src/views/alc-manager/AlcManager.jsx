import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
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
  Chip,
  Tabs,
  Tab,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ParentCard from '../../components/shared/ParentCard';
import PermissionAttachmentModal from 'src/components/alc-manager/components/PermissionAttachmentModal';
import ViewPermissionModal from 'src/components/alc-manager/components/ViewPermissionModal';
import NewRoleModal from 'src/components/alc-manager/components/NewRoleModal';
import AssignmentManagement from 'src/components/alc-manager/components/AssignmentManagement';
import AccessAnalysis from 'src/components/alc-manager/components/AccessAnalysis';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  { title: 'ALC Manager' },
];
const AlcManager = () => {
  const [rows, setRows] = useState([]);
  const [allRolesData] = useState([
    {
      id: 1,
      roleName: 'Agent',
      guardName: 'web',
      description: 'Agent',
    },
    {
      id: 2,
      roleName: 'Customer',
      guardName: 'web',
      description: 'Customer',
    },
    {
      id: 3,
      roleName: 'Super_Admin',
      guardName: 'web',
      description: 'Super Admin',
    },
    {
      id: 4,
      roleName: 'Super_Agent',
      guardName: 'web',
      description: 'Super Agent',
    },
  ]);

  useEffect(() => {
    setRows([...allRolesData]);
  }, [allRolesData]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('Role Management');
  const [roleType, setRoleType] = useState('');
  const [roleLevel, setRoleLevel] = useState('');
  const [roleCategory, setRoleCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newRoleModalOpen, setNewRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    roleName: '',
    guardName: '',
    description: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState('create');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [viewPermissionModalOpen, setViewPermissionModalOpen] = useState(false);
  const [permissionsToView, setPermissionsToView] = useState([]);

  const notify = useNotification();

  // Define available permissions
  const availablePermissions = [
    'censis.aci.index',
    'censis.aci.role.delete',
    'censis.aci.user.manage.permission',
    'censis.aci.auth.profile.edit',
    'censis.dashboard',
    'support.chat.index',
    'support.ticket.admin.index',
    'support.ticket.conversation',
    'censis.aci.role.update',
    'censis.aci.user.manage.role',
    'censis.auth.profile.view',
    'censis.users.update_user_info',
    'support.setup.index',
    'support.ticket.client.index',
  ];

  const hasFilters = roleType !== '' || roleLevel !== '' || roleCategory !== '';

  const filteredRows = useMemo(() => {
    if (!roleType && !roleLevel && !roleCategory) {
      return rows;
    }

    return rows.filter((item) => {
      const matchesRoleName = roleType
        ? item.roleName.toLowerCase().includes(roleType.toLowerCase())
        : true;
      const matchesGuardName = roleLevel
        ? item.guardName.toLowerCase().includes(roleLevel.toLowerCase())
        : true;
      const matchesDescription = roleCategory
        ? item.description.toLowerCase().includes(roleCategory.toLowerCase())
        : true;

      if (roleType && !roleLevel && !roleCategory) {
        return (
          item.roleName.toLowerCase().includes(roleType.toLowerCase()) ||
          item.guardName.toLowerCase().includes(roleType.toLowerCase()) ||
          item.description.toLowerCase().includes(roleType.toLowerCase())
        );
      }

      return matchesRoleName && matchesGuardName && matchesDescription;
    });
  }, [rows, roleType, roleLevel, roleCategory]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action, row) => {
    if (action === 'attachpermission') {
      handleAttachPermission(row);
    } else if (action === 'viewpermission') {
      handleViewPermission(row);
    }
    handleMenuClose();
  };

  const handleItemUpdate = (updatedItem, actionType) => {
    if (actionType === 'update') {
      setRows((prev) => prev.map((row) => (row.id === updatedItem.id ? updatedItem : row)));
      notify.success('updated successfully!');
    } else if (actionType === 'create') {
      const newItem = {
        ...updatedItem,
        id: Math.max(...rows.map((r) => r.id), 0) + 1,
      };
      setRows((prev) => [...prev, newItem]);
      notify.success('Item added successfully!');
    }
  };

  const handleFetchRoles = () => {
    const hasAnyFilter = roleType || roleLevel || roleCategory;

    if (!hasAnyFilter) {
      setRows([...allRolesData]);
      notify.info('Showing all roles');
      return;
    }

    const fetchedData = allRolesData.filter((item) => {
      const matchesRoleName = roleType
        ? item.roleName.toLowerCase().includes(roleType.toLowerCase())
        : true;
      const matchesGuardName = roleLevel
        ? item.guardName.toLowerCase().includes(roleLevel.toLowerCase())
        : true;
      const matchesDescription = roleCategory
        ? item.description.toLowerCase().includes(roleCategory.toLowerCase())
        : true;

      if (roleType && !roleLevel && !roleCategory) {
        return (
          item.roleName.toLowerCase().includes(roleType.toLowerCase()) ||
          item.guardName.toLowerCase().includes(roleType.toLowerCase()) ||
          item.description.toLowerCase().includes(roleType.toLowerCase())
        );
      }

      return matchesRoleName && matchesGuardName && matchesDescription;
    });

    setRows(fetchedData);
    setPage(0);

    if (fetchedData.length > 0) {
      notify.success(`Found ${fetchedData.length} roles matching filters`);
    } else {
      notify.warning('No roles match the selected filters');
    }
  };

  const handleAddRoleClick = () => {
    setNewRoleModalOpen(true);
  };

  const handleNewRoleChange = (field, value) => {
    setNewRoleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewRole = () => {
    if (!newRoleData.roleName.trim() || !newRoleData.guardName.trim()) {
      notify.warning('Role Name and Guard Name are required!');
      return;
    }

    const newRole = {
      id: Math.max(...rows.map((r) => r.id), 0) + 1,
      ...newRoleData,
    };

    setRows((prev) => [...prev, newRole]);
    notify.success('New role added successfully!');
    setNewRoleModalOpen(false);
    setNewRoleData({
      roleName: '',
      guardName: '',
      description: '',
    });
  };

  const handleCancelNewRole = () => {
    setNewRoleModalOpen(false);
    setNewRoleData({
      roleName: '',
      guardName: '',
      description: '',
    });
  };

  const handleConfirmLoad = () => {
    notify.success('New role added successfully!');
    setOpenDialog(false);
  };

  const handleCancelLoad = () => {
    setOpenDialog(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setModalActionType('create');
    setConfirmDialogOpen(false);
  };

  const handleConfirmAdd = () => {
    setConfirmDialogOpen(false);
  };

  const handleAttachPermission = (row) => {
    setSelectedRow(row);
    const existingPermissions = row.permissions || [];
    setSelectedPermissions(existingPermissions);
    setPermissionModalOpen(true);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  const handleSavePermissions = () => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === selectedRow.id ? { ...row, permissions: selectedPermissions } : row,
      ),
    );

    notify.success('Permissions updated successfully!');
    setPermissionModalOpen(false);
  };

  const handleCancelPermissions = () => {
    setPermissionModalOpen(false);
    setSelectedPermissions([]);
  };

  const handleViewPermission = (row) => {
    setPermissionsToView(row.permissions || []);
    setViewPermissionModalOpen(true);
  };

  const handleViewPermissionClose = () => {
    setViewPermissionModalOpen(false);
    setPermissionsToView([]);
  };

  const renderPermissions = (permissions) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {permissions.map((permission, idx) => (
          <Chip
            key={`${permission}-${idx}`}
            label={permission}
            size="small"
            sx={{ borderRadius: '8px' }}
          />
        ))}
      </Box>
    );
  };

  return (
    <PageContainer title="ALC Manager" description="Access Control List Management Dashboard">
      <Breadcrumb title="ALC Manager" items={BCrumb} />

      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(0);
            setRoleType('');
            setRoleLevel('');
            setRoleCategory('');
            setRows([...allRolesData]);
          }}
          aria-label="acl tabs"
        >
          <Tab label="Role Management" value="Role Management" />
          <Tab label="Permission Assignment" value="Assignment Management" />
          <Tab label="Access Analysis" value="Analysis Report" />
        </Tabs>
      </Box>

      {activeTab === 'Assignment Management' && <AssignmentManagement />}

      {activeTab === 'Analysis Report' && <AccessAnalysis />}

      {(activeTab === 'Role Management' || !activeTab) && (
        <ParentCard
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">Manage Roles</Typography>
              <Button
                variant="contained"
                onClick={handleAddRoleClick}
                sx={{ minWidth: 120, fontSize: { xs: '0.95rem', md: '1rem' } }}
              >
                New Role
              </Button>
            </Box>
          }
        >
          <Box sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
              <TextField
                placeholder="Search by Role name"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
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
                  onClick={() => {
                    setRoleType('');
                    setRoleLevel('');
                    setRoleCategory('');
                    setRows([...allRolesData]);
                    setPage(0);
                  }}
                  sx={{ height: 'fit-content' }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
            <Paper variant="outlined">
              <TableContainer>
                <Table sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '10%' }}>S/N</TableCell>
                      <TableCell sx={{ width: '25%' }}>Role Name</TableCell>
                      <TableCell sx={{ width: '25%' }}>Guard Name</TableCell>
                      <TableCell sx={{ width: '30%' }}>Description</TableCell>
                      <TableCell sx={{ width: '10%' }} align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((row, index) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{row.roleName}</TableCell>
                          <TableCell>{row.guardName}</TableCell>
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
                              <MenuItem onClick={() => handleAction('attachpermission', row)}>
                                Attach Permission
                              </MenuItem>
                              <MenuItem onClick={() => handleAction('viewpermission', row)}>
                                View Permission
                              </MenuItem>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
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
                              : 'No roles available. Add new roles or adjust filters.'}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        colSpan={6}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </ParentCard>
      )}

      <NewRoleModal
        open={newRoleModalOpen}
        onClose={handleCancelNewRole}
        formData={newRoleData}
        onFieldChange={handleNewRoleChange}
        onSave={handleSaveNewRole}
      />

      <PermissionAttachmentModal
        open={permissionModalOpen}
        onClose={handleCancelPermissions}
        selectedRow={selectedRow}
        availablePermissions={availablePermissions}
        selectedPermissions={selectedPermissions}
        permissionSearch={permissionSearch}
        onPermissionSearchChange={setPermissionSearch}
        onPermissionChange={handlePermissionChange}
        onSave={handleSavePermissions}
      />

      <ViewPermissionModal
        open={viewPermissionModalOpen}
        onClose={handleViewPermissionClose}
        selectedRow={selectedRow}
        permissionsToView={permissionsToView}
      />
    </PageContainer>
  );
};

export default AlcManager;
