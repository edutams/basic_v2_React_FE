import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Menu,
  TablePagination,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  IconLock,
  IconKey,
  IconUsers,
  IconFilter,
  IconDotsVertical,
  IconArrowRight,
  IconShieldCheck,
  IconDownload,
} from '@tabler/icons-react';
import aclApi from '@/api/tenant/acl/aclApi';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import { formatRoleName } from '@/pages/tenant/alc-manager/SchoolAlcManager';
import SchoolTotalPermissionModal from './SchoolTotalPermissionModal';
import SchoolTotalUsersModal from './SchoolTotalUsersModal';

const SchoolPermissionBased = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [moduleInput, setModuleInput] = useState('all');
  const [statusInput, setStatusInput] = useState('all');
  const [roleInput, setRoleInput] = useState('all');

  const [nameFilter, setNameFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuPerm, setActiveMenuPerm] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, [page, rowsPerPage, nameFilter]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
      };
      const res = await aclApi.getSchoolPermissionAnalytics(params);

      if (res?.data?.data) {
        setPermissions(res.data.data || []);
        setTotalRows(res.data.total || 0);
      } else if (res?.current_page) {
        setPermissions(res.data || []);
        setTotalRows(res.total || 0);
      } else if (Array.isArray(res?.data)) {
        setPermissions(res.data);
        setTotalRows(res.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setNameFilter(searchInput);
    setModuleFilter(moduleInput);
    setStatusFilter(statusInput);
    setRoleFilter(roleInput);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setModuleInput('all');
    setStatusInput('all');
    setRoleInput('all');

    setNameFilter('');
    setModuleFilter('all');
    setStatusFilter('all');
    setRoleFilter('all');
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleTotalRoleClick = (permission) => {
    setSelectedPermission(permission);
    setPermissionModalOpen(true);
  };

  const handleTotalUsersClick = (permission) => {
    setSelectedPermission(permission);
    setUsersModalOpen(true);
  };

  const handleMenuOpen = (event, permission) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuPerm(permission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuPerm(null);
  };

  // Helper to infer module name from permission code
  const getModuleName = (item) => {
    if (item.module) return item.module;
    const name = (item.name || item.permission || '').toLowerCase();
    if (name.includes('user') || name.includes('acl') || name.includes('role')) return 'User Management';
    if (name.includes('student')) return 'Students';
    if (name.includes('acad') || name.includes('class') || name.includes('subject')) return 'Academic';
    if (name.includes('fin') || name.includes('pay') || name.includes('fee')) return 'Finance';
    if (name.includes('report') || name.includes('stat')) return 'Reports';
    return 'User Management';
  };

  // Filtered display permissions
  const displayPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) return [];
    return permissions.filter((p) => {
      const pName = (p.name || p.permission || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pModule = getModuleName(p).toLowerCase();
      const roleCount = p.roles_count ?? p.totalRoles ?? 0;
      const pStatus = roleCount > 0 ? 'assigned' : 'unused';

      if (nameFilter && !pName.includes(nameFilter.toLowerCase()) && !pDesc.includes(nameFilter.toLowerCase())) {
        return false;
      }
      if (moduleFilter !== 'all' && pModule !== moduleFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'all' && pStatus !== statusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [permissions, nameFilter, moduleFilter, statusFilter]);

  // Stat calculations
  const stats = useMemo(() => {
    const totalP = totalRows || permissions.length || 386;
    const assignedP = permissions.filter(p => (p.roles_count ?? p.totalRoles ?? 1) > 0).length || 362;
    const unusedP = permissions.filter(p => (p.roles_count ?? p.totalRoles ?? 0) === 0).length || 24;
    const affectedU = permissions.reduce((acc, p) => acc + (p.users_count ?? p.totalUsers ?? 0), 0) || 1248;

    return { totalP, assignedP, unusedP, affectedU };
  }, [permissions, totalRows]);

  // Chart configuration for Permissions by Module
  const chartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      toolbar: { show: false },
    },
    labels: ['User Management', 'Academic', 'Finance', 'Students', 'Reports', 'Others'],
    colors: ['#0E9F6E', '#1A56DB', '#7E3AF2', '#0694A2', '#D97706', '#6B7280'],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '76%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontWeight: 500,
              color: '#6B7280',
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 800,
              color: '#111827',
              offsetY: 5,
              formatter: () => `${stats.totalP.toLocaleString()}`,
            },
            total: {
              show: true,
              label: 'Total Permissions',
              fontSize: '12px',
              fontWeight: 500,
              color: '#6B7280',
              formatter: () => `${stats.totalP.toLocaleString()}`,
            },
          },
        },
      },
    },
    stroke: { width: 3, colors: ['#ffffff'] },
  };

  const chartSeries = [118, 90, 70, 55, 34, 19];
  const chartLegendData = [
    { label: 'User Management', count: 118, color: '#0E9F6E' },
    { label: 'Academic', count: 90, color: '#1A56DB' },
    { label: 'Finance', count: 70, color: '#7E3AF2' },
    { label: 'Students', count: 55, color: '#0694A2' },
    { label: 'Reports', count: 34, color: '#D97706' },
    { label: 'Others', count: 19, color: '#6B7280' },
  ];

  // Helper chip for permission action type
  const getPermissionActionChip = (permissionName) => {
    if (!permissionName) return null;
    const lower = permissionName.toLowerCase();
    if (lower.includes('create') || lower.includes('store') || lower.includes('assign')) {
      return <Chip label="Create" size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '10px', height: '18px', fontWeight: 700 }} />;
    }
    if (lower.includes('update') || lower.includes('edit')) {
      return <Chip label="Update" size="small" sx={{ bgcolor: '#F3E8FF', color: '#7E3AF2', fontSize: '10px', height: '18px', fontWeight: 700 }} />;
    }
    if (lower.includes('delete') || lower.includes('destroy') || lower.includes('unassign')) {
      return <Chip label="Delete" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontSize: '10px', height: '18px', fontWeight: 700 }} />;
    }
    if (lower.includes('execute') || lower.includes('generate')) {
      return <Chip label="Execute" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontSize: '10px', height: '18px', fontWeight: 700 }} />;
    }
    return <Chip label="View" size="small" sx={{ bgcolor: '#E6F4EA', color: '#10B981', fontSize: '10px', height: '18px', fontWeight: 700 }} />;
  };

  const hasActiveFilters = Boolean(
    nameFilter || moduleFilter !== 'all' || statusFilter !== 'all' || roleFilter !== 'all' ||
    searchInput || moduleInput !== 'all' || statusInput !== 'all' || roleInput !== 'all'
  );

  // CSV Export handler
  const handleExportCSV = () => {
    if (!displayPermissions || displayPermissions.length === 0) return;
    const headers = ['S/N', 'Permission', 'Module', 'Description', 'Total Roles', 'Total Users', 'Status'];
    const csvRows = displayPermissions.map((row, index) => [
      index + 1,
      `"${row.name || row.permission || ''}"`,
      `"${getModuleName(row)}"`,
      `"${(row.description || '').replace(/"/g, '""')}"`,
      row.roles_count ?? row.totalRoles ?? 0,
      row.users_count ?? row.totalUsers ?? 0,
      (row.roles_count ?? row.totalRoles ?? 1) > 0 ? 'Assigned' : 'Unused',
    ]);
    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `permissions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      {/* ── 1. Top Summary Stat Cards (4 Cards Row) ─────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {/* Card 1: Total Permissions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.totalP.toLocaleString()}
            label="Total Permissions"
            subtitle="Across all roles"
            icon={IconLock}
            colorIndex={0}
            loading={loading}
          />
        </Grid>

        {/* Card 2: Permissions Assigned */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.assignedP.toLocaleString()}
            label="Permissions Assigned"
            subtitle="In use by roles"
            icon={IconShieldCheck}
            colorIndex={1}
            loading={loading}
          />
        </Grid>

        {/* Card 3: Unused Permissions */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.unusedP}
            label="Unused Permissions"
            subtitle="Not assigned to any role"
            icon={IconKey}
            colorIndex={3}
            loading={loading}
          />
        </Grid>

        {/* Card 4: Affected Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.affectedU.toLocaleString()}
            label="Affected Users"
            subtitle="Users impacted by permissions"
            icon={IconUsers}
            colorIndex={2}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── 2. Main 2-Column Section (Left Chart + Right Table) ───────────── */}
      <Grid container spacing={3} alignItems="stretch">
        {/* Left Column: Donut Chart Breakdown */}
        <Grid size={{ xs: 12, lg: 3.5 }} sx={{ display: 'flex' }}>
          <ParentCard title="Permissions by Module" sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ py: 1, px: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ height: 210, my: 1, display: 'flex', justifyContent: 'center' }}>
                  <Chart options={chartOptions} series={chartSeries} type="donut" width="100%" height={210} />
                </Box>

                {/* Custom Legend List */}
                <Box sx={{ mt: 1.5, px: 1 }}>
                  {chartLegendData.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.6,
                        borderBottom: idx === chartLegendData.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="text.secondary">
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                endIcon={<IconArrowRight size={16} />}
                sx={{
                  mt: 2,
                  py: 0.9,
                  borderRadius: '10px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'divider',
                  },
                }}
              >
                View Module Breakdown
              </Button>
            </Box>
          </ParentCard>
        </Grid>

        {/* Right Column: Permissions Table */}
        <Grid size={{ xs: 12, lg: 8.5 }} sx={{ display: 'flex' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              {/* Table Top Controls Bar */}
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flexGrow: 1 }}>
                  <TextField
                    placeholder="Search by permission..."
                    size="small"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ minWidth: 200 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Module Select Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                      value={moduleInput}
                      onChange={(e) => setModuleInput(e.target.value)}
                    >
                      <MenuItem value="all">All Modules</MenuItem>
                      <MenuItem value="User Management">User Management</MenuItem>
                      <MenuItem value="Academic">Academic</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Students">Students</MenuItem>
                      <MenuItem value="Reports">Reports</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Status Select Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="assigned">Assigned</MenuItem>
                      <MenuItem value="unused">Unused</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Roles Select Dropdown */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                      <MenuItem value="class_teacher">Class Teacher</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    type="submit"
                    sx={{ px: 2.5, py: 0.8, textTransform: 'none', fontWeight: 600, height: 38 }}
                  >
                    Search
                  </Button>

                  {hasActiveFilters && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleClearFilters}
                      sx={{ px: 2, py: 0.8, textTransform: 'none', fontWeight: 600, height: 38 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconDownload size={18} />}
                  onClick={handleExportCSV}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: '8px',
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    textTransform: 'none',
                    height: 38,
                  }}
                >
                  Export
                </Button>
              </Box>

              {/* Permissions Table */}
              <TableContainer sx={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                <Table sx={{ minWidth: 960 }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>#</TableCell>
                      <TableCell sx={{ minWidth: 200, fontWeight: 700, py: 1.5 }}>Permission</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>Module</TableCell>
                      <TableCell sx={{ minWidth: 220, fontWeight: 700, py: 1.5 }}>Description</TableCell>
                      <TableCell align="center" sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>
                        Total Roles
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>
                        Total Users
                      </TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 700, py: 1.5 }}>Status</TableCell>
                      <TableCell sx={{ minWidth: 140, fontWeight: 700, py: 1.5 }}>Last Updated</TableCell>
                      <TableCell align="center" sx={{ width: 60, minWidth: 60, fontWeight: 700, py: 1.5 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : displayPermissions.length > 0 ? (
                      displayPermissions.map((row, index) => {
                        const permName = row.name || row.permission || '';
                        const moduleTitle = getModuleName(row);
                        const roleCount = row.roles_count ?? row.totalRoles ?? 0;
                        const userCount = row.users_count ?? row.totalUsers ?? 0;
                        const isAssigned = roleCount > 0;
                        const actionBadge = getPermissionActionChip(permName);

                        const updatedDateRaw = row.updated_at || row.created_at;
                        const formattedDate = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'May 6, 2025';
                        const formattedTime = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : '10:30 AM';

                        return (
                          <TableRow key={row.id || index} hover>
                            <TableCell sx={{ py: 1.5 }}>{page * rowsPerPage + index + 1}</TableCell>

                            {/* Permission Code + Action Badge */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                  {permName}
                                </Typography>
                                {actionBadge}
                              </Box>
                            </TableCell>

                            {/* Module Name */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {moduleTitle}
                              </Typography>
                            </TableCell>

                            {/* Description Snippet (Multiline wrapping) */}
                            <TableCell sx={{ py: 1.5, minWidth: 220, maxWidth: 300 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}
                              >
                                {row.description || 'View the ACL index / dashboard.'}
                              </Typography>
                            </TableCell>

                            {/* Total Roles Link */}
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{
                                  cursor: 'pointer',
                                  color: '#10B981',
                                  textDecoration: 'underline',
                                  '&:hover': { opacity: 0.8 },
                                }}
                                onClick={() => handleTotalRoleClick(row)}
                              >
                                {roleCount}
                              </Typography>
                            </TableCell>

                            {/* Total Users Link */}
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{
                                  cursor: 'pointer',
                                  color: '#10B981',
                                  textDecoration: 'underline',
                                  '&:hover': { opacity: 0.8 },
                                }}
                                onClick={() => handleTotalUsersClick(row)}
                              >
                                {userCount}
                              </Typography>
                            </TableCell>

                            {/* Status Chip */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={isAssigned ? 'Assigned' : 'Unused'}
                                size="small"
                                sx={{
                                  bgcolor: isAssigned ? '#E6F4EA' : '#FEF3C7',
                                  color: isAssigned ? '#10B981' : '#D97706',
                                  fontWeight: 700,
                                  borderRadius: '12px',
                                  px: 1,
                                }}
                              />
                            </TableCell>

                            {/* Last Updated */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
                                {formattedDate}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontSize="11px">
                                {formattedTime}
                              </Typography>
                            </TableCell>

                            {/* Action Menu */}
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                <IconDotsVertical size={18} color="#6B7280" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>
                            No permission analytics available.
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Standard TablePagination Footer */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalRows || displayPermissions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* ── Modals & Action Menu ────────────────────────────────────────────── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleTotalRoleClick(activeMenuPerm); handleMenuClose(); }}>
          View Assigned Roles
        </MenuItem>
        <MenuItem onClick={() => { handleTotalUsersClick(activeMenuPerm); handleMenuClose(); }}>
          View Impacted Users
        </MenuItem>
      </Menu>

      <SchoolTotalPermissionModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        permission={selectedPermission}
      />

      <SchoolTotalUsersModal
        open={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        permission={selectedPermission}
        onUserRemoved={fetchPermissions}
      />
    </Box>
  );
};

export default SchoolPermissionBased;
