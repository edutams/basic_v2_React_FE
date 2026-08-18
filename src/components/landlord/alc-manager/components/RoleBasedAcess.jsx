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
  Avatar,
  IconButton,
  Select,
  MenuItem,
  ListItemIcon,
  FormControl,
  Menu,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Chart from 'react-apexcharts';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  IconUsers,
  IconShieldCheck,
  IconLock,
  IconKey,
  IconRefresh,
  IconDotsVertical,
  IconArrowRight,
  IconUserCheck,
  IconX,
  IconEye,
} from '@tabler/icons-react';
import aclApi from '@/api/landlord/acl/aclApi';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import RolePermissionsModal from './RolePermissionsModal';
import RoleOrganizationModal from './RoleOrganizationModal';

const formatRoleName = (str = '') => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const RoleBasedAcess = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [orgsModalOpen, setOrgsModalOpen] = useState(false);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuRole, setActiveMenuRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, nameFilter, statusFilter]);

  const [summaryData, setSummaryData] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      const res = await aclApi.getRoleAnalytics(params);

      if (res?.data) {
        const fetchedData = res.data.data || res.data || [];
        setRoles(Array.isArray(fetchedData) ? fetchedData : []);
        setTotalRows(res.data.total || (Array.isArray(fetchedData) ? fetchedData.length : 0));
        if (res.data.summary) setSummaryData(res.data.summary);
        if (res.data.per_page) setRowsPerPage(res.data.per_page);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setNameFilter(searchInput);
    setStatusFilter(statusInput);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusInput('all');
    setNameFilter('');
    setStatusFilter('all');
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    nameFilter || statusFilter !== 'all' || searchInput || statusInput !== 'all',
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handlePermissionModalOpen = (role) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  const handleOrgsModalOpen = (role) => {
    setSelectedRole(role);
    setOrgsModalOpen(true);
  };

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuRole(null);
  };

  const displayRoles = useMemo(() => {
    return roles || [];
  }, [roles]);

  const stats = useMemo(() => {
    if (summaryData) {
      return {
        totalR: summaryData.total_roles ?? (totalRows || roles.length || 0),
        totalP: summaryData.total_permissions ?? 0,
        totalU: summaryData.total_users ?? 0,
        activeU: summaryData.active_users ?? 0,
        orphanedR: summaryData.orphaned_roles ?? 0,
      };
    }
    const totalR = totalRows || roles.length || 0;
    const totalP = roles.reduce((acc, r) => acc + (r.totalPermissions ?? r.permissions_count ?? 0), 0);
    const totalU = roles.reduce((acc, r) => acc + (r.totalUsers ?? r.users_count ?? 0), 0);
    const activeU = roles
      .filter((r) => (r.status || 'active').toLowerCase() === 'active')
      .reduce((acc, r) => acc + (r.totalUsers ?? r.users_count ?? 0), 0);
    const orphanedR = roles.filter((r) => (r.totalUsers ?? r.users_count ?? 0) === 0).length;

    return { totalR, totalP, totalU, activeU, orphanedR };
  }, [roles, totalRows, summaryData]);

  const COLOR_PALETTE = [
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#F59E0B',
    '#06B6D4',
    '#6B7280',
    '#EC4899',
    '#6366F1',
  ];

  const distributionData = useMemo(() => {
    const dist = summaryData?.distribution;
    if (Array.isArray(dist) && dist.length > 0) {
      return dist.map((item, idx) => ({
        label: formatRoleName(item.name || item.label || 'Role'),
        count: Number(item.count ?? 0),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
    if (roles && roles.length > 0) {
      return roles.map((r, idx) => ({
        label: formatRoleName(r.role || r.name || 'Role'),
        count: Number(r.totalUsers ?? r.users_count ?? 0),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
    return [];
  }, [summaryData, roles]);

  const chartLabels = useMemo(() => {
    if (distributionData && distributionData.length > 0) {
      const total = distributionData.reduce((acc, d) => acc + d.count, 0);
      if (total === 0) return ['No Users Assigned'];
      return distributionData.map((d) => d.label);
    }
    return ['No Users Assigned'];
  }, [distributionData]);

  const chartSeries = useMemo(() => {
    if (distributionData && distributionData.length > 0) {
      const total = distributionData.reduce((acc, d) => acc + d.count, 0);
      if (total === 0) return [1];
      return distributionData.map((d) => d.count);
    }
    return [1];
  }, [distributionData]);

  const chartColors = useMemo(() => {
    if (distributionData && distributionData.length > 0) {
      const total = distributionData.reduce((acc, d) => acc + d.count, 0);
      if (total === 0) return ['#9CA3AF'];
      return distributionData.map((d) => d.color);
    }
    return ['#9CA3AF'];
  }, [distributionData]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
        toolbar: { show: false },
      },
      labels: chartLabels,
      colors: chartColors,
      legend: { show: false },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '11px',
          fontWeight: '700',
          colors: ['#ffffff'],
        },
        dropShadow: { enabled: false },
        formatter: (val) => `${Math.round(val)}%`,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                fontWeight: 500,
                color: '#64748B',
                offsetY: 16,
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 800,
                color: '#1E293B',
                offsetY: -14,
                formatter: () => `${stats.totalU.toLocaleString()}`,
              },
              total: {
                show: true,
                label: 'Total Users',
                fontSize: '12px',
                fontWeight: 500,
                color: '#64748B',
                formatter: () => `${stats.totalU.toLocaleString()}`,
              },
            },
          },
        },
      },
      stroke: { width: 2, colors: ['#ffffff'] },
    }),
    [chartLabels, chartColors, stats.totalU],
  );

  const getRoleAvatarStyle = (index) => {
    const styles = [
      { bg: '#E6F4EA', color: '#10B981', icon: IconShieldCheck },
      { bg: '#EFF6FF', color: '#3B82F6', icon: IconUserCheck },
      { bg: '#F3E8FF', color: '#8B5CF6', icon: IconLock },
      { bg: '#FEF3C7', color: '#D97706', icon: IconUsers },
      { bg: '#FCE7F3', color: '#EC4899', icon: IconKey },
    ];
    return styles[index % styles.length];
  };

  return (
    <Box>
      {/* ── Metric Stat Cards ── */}
      <Box sx={{ py: 1, px: 0.5, mb: 2 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalR}
              label="Total Roles"
              subtitle="Across the system"
              icon={IconUserCheck}
              colorIndex={0}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalP}
              label="Total Permissions"
              subtitle="System permissions"
              icon={IconLock}
              colorIndex={1}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalU}
              label="Total Users"
              subtitle="Across all roles"
              icon={IconUsers}
              colorIndex={2}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.activeU}
              label="Active Access"
              subtitle="Users with active roles"
              icon={IconKey}
              colorIndex={3}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.orphanedR}
              label="Orphaned Roles"
              subtitle="No users assigned"
              icon={IconRefresh}
              colorIndex={4}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 3.5 }} sx={{ display: 'flex' }}>
          <ParentCard title="Access Distribution by Role" sx={{ width: '100%', height: '100%' }}>
            <Box
              sx={{
                py: 1,
                px: 0,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  sx={{
                    height: 230,
                    my: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={32} />
                  ) : (
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="donut"
                      width="100%"
                      height={230}
                    />
                  )}
                </Box>

                <Box sx={{ mt: 1.5, px: 1 }}>
                  {distributionData.slice(0, 4).map((item, idx) => {
                    const isLast = idx === Math.min(distributionData.length, 4) - 1;
                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 0.6,
                          borderBottom: isLast ? 'none' : '1px solid',
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
                    );
                  })}
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                endIcon={<IconArrowRight size={16} />}
                onClick={() => setBreakdownModalOpen(true)}
                sx={{
                  mt: 2,
                  py: 0.9,
                  borderRadius: '10px',
                  borderColor: 'divider',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                View Full Breakdown
              </Button>
            </Box>
          </ParentCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8.5 }} sx={{ display: 'flex' }}>
          <ParentCard>
            <Box>
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexWrap: 'wrap',
                    flexGrow: 1,
                  }}
                >
                  <TextField
                    placeholder="Search role..."
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

                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
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
              </Box>

              <TableContainer sx={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                <Table sx={{ minWidth: 800 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>
                        S/N
                      </TableCell>
                      <TableCell sx={{ minWidth: 240, fontWeight: 700, py: 1.5 }}>
                        Role Name
                      </TableCell>
                      <TableCell sx={{ minWidth: 220, fontWeight: 700, py: 1.5 }}>
                        Description
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>
                        Total Permissions
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 130, fontWeight: 700, py: 1.5 }}>
                        Assigned Users
                      </TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 700, py: 1.5 }}>Status</TableCell>
                      <TableCell
                        align="center"
                        sx={{ width: 60, minWidth: 60, fontWeight: 700, py: 1.5 }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : displayRoles.length > 0 ? (
                      displayRoles.map((row, index) => {
                        const roleNameStr = row.role || row.name || '';
                        const isSystemRole = row.is_sys === 'yes' || row.is_system;
                        const formattedName = formatRoleName(roleNameStr);
                        const permCount = row.totalPermissions ?? row.permissions_count ?? 0;
                        const userCount = row.totalUsers ?? row.users_count ?? 0;
                        const rawStatus = (
                          row.status || (row.is_active === false ? 'inactive' : 'active')
                        ).toLowerCase();
                        const isInactive = rawStatus === 'inactive';
                        const avatarStyle = getRoleAvatarStyle(index);
                        const IconComp = avatarStyle.icon;

                        return (
                          <TableRow key={row.id || index} hover>
                            <TableCell sx={{ py: 1.5 }}>{page * rowsPerPage + index + 1}</TableCell>

                            <TableCell sx={{ py: 1.5, minWidth: 240 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: avatarStyle.bg,
                                    color: avatarStyle.color,
                                  }}
                                >
                                  <IconComp size={16} />
                                </Avatar>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    color="text.primary"
                                  >
                                    {formattedName}
                                  </Typography>
                                  {isSystemRole && (
                                    <Chip
                                      label="Protected"
                                      size="small"
                                      sx={{
                                        bgcolor: '#E6F4EA',
                                        color: '#10B981',
                                        fontSize: '10px',
                                        height: '18px',
                                        fontWeight: 700,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.5, minWidth: 220, maxWidth: 300 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.4,
                                }}
                              >
                                {row.description || 'N/A'}
                              </Typography>
                            </TableCell>

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
                                onClick={() => handlePermissionModalOpen(row)}
                              >
                                {permCount}
                              </Typography>
                            </TableCell>

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
                                onClick={() => handleOrgsModalOpen(row)}
                              >
                                {userCount}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={isInactive ? 'Inactive' : 'Active'}
                                size="small"
                                sx={{
                                  bgcolor: isInactive ? '#FEF2F2' : '#E6F4EA',
                                  color: isInactive ? '#DC2626' : '#10B981',
                                  fontWeight: 700,
                                  borderRadius: '12px',
                                  px: 1,
                                }}
                              />
                            </TableCell>

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
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>
                            No role analytics available.
                          </Alert>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRows || displayRoles.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </ParentCard>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            '& .MuiMenuItem-root:hover': {
              bgcolor: 'primary.light',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handlePermissionModalOpen(activeMenuRole);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <IconEye size={18} />
          </ListItemIcon>
          View Permissions
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOrgsModalOpen(activeMenuRole);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <IconUsers size={18} />
          </ListItemIcon>
          View Assigned Users
        </MenuItem>
      </Menu>

      {/* Role Permissions Modal */}
      <RolePermissionsModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        roleId={selectedRole?.id}
      />

      {/* Role Organization Modal */}
      <RoleOrganizationModal
        open={orgsModalOpen}
        onClose={() => setOrgsModalOpen(false)}
        roleId={selectedRole?.id}
        roleName={selectedRole?.role || selectedRole?.name}
        onUserRemoved={fetchRoles}
      />

      {/* Access Distribution Breakdown Modal */}
      <Dialog
        open={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Access Distribution Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Full breakdown of member allocations by role
            </Typography>
          </Box>
          <IconButton onClick={() => setBreakdownModalOpen(false)}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={1.5}
            sx={{ bgcolor: '#F8FAFC', borderRadius: '10px' }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Total Assigned Users
            </Typography>
            <Chip
              label={`${stats.totalU.toLocaleString()} Users`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, width: 40 }}>S/N</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Users
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {distributionData.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {item.count.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setBreakdownModalOpen(false)}
            color="primary"
            size="small"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleBasedAcess;
