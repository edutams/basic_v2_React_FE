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
  Skeleton,
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
  LinearProgress,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  Search as SearchIcon,
  Visibility as EyeIcon,
  FileDownload as ExportIcon,
  ArrowDropDown as ArrowDropDownIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import {
  IconUsers,
  IconShieldCheck,
  IconLock,
  IconKey,
  IconRefresh,
  IconFilter,
  IconDotsVertical,
  IconArrowRight,
  IconUserCheck,
  IconX,
  IconEye,
} from '@tabler/icons-react';
import aclApi from '@/api/tenant/acl/aclApi';
import ParentCard from '@/components/shared/ParentCard';
import StatCard from '@/components/shared/StatCard';
import { formatRoleName } from '@/pages/tenant/alc-manager/SchoolAlcManager';
import SchoolRolePermissionsModal from './SchoolRolePermissionsModal';
import SchoolRoleUsersModal from './SchoolRoleUsersModal';

const SchoolRoleBasedAccess = () => {
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
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [activeMenuRole, setActiveMenuRole] = useState(null);

  const [summaryStats, setSummaryStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchSummaryStats();
  }, []);

  const fetchSummaryStats = async () => {
    setStatsLoading(true);
    try {
      const res = await aclApi.getSchoolRoleAnalysisStats();
      const payload = res?.data?.data || res?.data || res;
      if (payload && typeof payload === 'object') {
        setSummaryStats(payload);
      }
    } catch (error) {
      console.error('Failed to fetch summary stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, nameFilter]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
        exclude_super_admin: true,
      };
      const res = await aclApi.getSchoolRoleAnalytics(params);

      if (res?.data) {
        const fetched = res.data.data || res.data || [];
        setRoles(Array.isArray(fetched) ? fetched : []);
        setTotalRows(res.data.total || (Array.isArray(fetched) ? fetched.length : 0));
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

  const handleExportExcel = async () => {
    setExportAnchorEl(null);
    try {
      const params = { exclude_super_admin: true };
      if (nameFilter) params.search = nameFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await aclApi.exportSchoolRolesExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `role_based_access_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export roles excel:', err);
    }
  };

  const handleExportPdf = async () => {
    setExportAnchorEl(null);
    try {
      const params = { exclude_super_admin: true };
      if (nameFilter) params.search = nameFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await aclApi.exportSchoolRolesPdf(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `role_based_access_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export roles pdf:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleTotalPermissionClick = (role) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  const handleTotalUsersClick = (role) => {
    setSelectedRole(role);
    setUsersModalOpen(true);
  };

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuRole(null);
  };

  // Filtered roles based on status
  const displayRoles = useMemo(() => {
    if (!roles || roles.length === 0) return [];
    return roles.filter((r) => {
      if (statusFilter === 'all') return true;
      const rStatus = (r.status || (r.is_active === false ? 'inactive' : 'active')).toLowerCase();
      return rStatus === statusFilter.toLowerCase();
    });
  }, [roles, statusFilter]);

  // Stat calculations from API
  const stats = useMemo(() => {
    const rawTotalR = summaryStats?.total_roles ?? summaryStats?.totalRoles;
    const rawTotalP = summaryStats?.total_permissions ?? summaryStats?.totalPermissions;
    const rawTotalU = summaryStats?.total_users ?? summaryStats?.totalUsers;
    const rawActiveU = summaryStats?.active_access ?? summaryStats?.activeAccess;
    const rawOrphanedR = summaryStats?.orphaned_roles ?? summaryStats?.orphanedRoles;

    const totalR =
      rawTotalR !== undefined && rawTotalR !== null
        ? Number(rawTotalR)
        : totalRows || roles.length || 0;
    const totalP =
      rawTotalP !== undefined && rawTotalP !== null
        ? Number(rawTotalP)
        : roles.reduce((acc, r) => acc + (r.totalPermissions ?? r.permissions_count ?? 0), 0);
    const totalU =
      rawTotalU !== undefined && rawTotalU !== null
        ? Number(rawTotalU)
        : roles.reduce((acc, r) => acc + (r.totalUsers ?? r.users_count ?? 0), 0);
    const activeU =
      rawActiveU !== undefined && rawActiveU !== null
        ? Number(rawActiveU)
        : roles
          .filter((r) => (r.status || 'active').toLowerCase() === 'active')
          .reduce((acc, r) => acc + (r.totalUsers ?? r.users_count ?? 0), 0);
    const orphanedR =
      rawOrphanedR !== undefined && rawOrphanedR !== null
        ? Number(rawOrphanedR)
        : roles.filter((r) => (r.totalUsers ?? r.users_count ?? 0) === 0).length;

    return { totalR, totalP, totalU, activeU, orphanedR };
  }, [summaryStats, roles, totalRows]);

  const COLOR_PALETTE = [
    '#0E9F6E',
    '#1A56DB',
    '#7E3AF2',
    '#D97706',
    '#0694A2',
    '#6B7280',
    '#EC4899',
    '#8B5CF6',
  ];

  const distributionData = useMemo(() => {
    const dist = summaryStats?.distribution;
    if (Array.isArray(dist) && dist.length > 0) {
      return dist.map((item, idx) => ({
        label: item.name || item.label || 'Role',
        count: Number(item.users_count ?? item.count ?? 0),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
    if (roles && roles.length > 0) {
      return roles.slice(0, 8).map((r, idx) => ({
        label: r.role ? r.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Role',
        count: Number(r.totalUsers ?? r.users_count ?? 0),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
    return [];
  }, [summaryStats, roles]);

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

  // Chart configuration for Access Distribution
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

  const chartLegendData = distributionData;

  // Helper avatar styling for roles
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
      <Box sx={{ py: 1, px: 0.5, mb: 2 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalR}
              label="Total Roles"
              subtitle="Across the system"
              icon={IconUserCheck}
              colorIndex={0}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalP}
              label="Total Permissions"
              subtitle="System permissions"
              icon={IconLock}
              colorIndex={1}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.totalU}
              label="Total Users"
              subtitle="Across all roles"
              icon={IconUsers}
              colorIndex={2}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.activeU}
              label="Active Access"
              subtitle="Users with active roles"
              icon={IconKey}
              colorIndex={3}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.orphanedR}
              label="Orphaned Roles"
              subtitle="No users assigned"
              icon={IconRefresh}
              colorIndex={4}
              loading={statsLoading}
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
                  {statsLoading ? (
                    <Skeleton variant="circular" width={120} height={120} />
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

                {/* Custom Legend List (Show Top 4 items on card) */}
                <Box sx={{ mt: 1.5, px: 1 }}>
                  {chartLegendData.slice(0, 4).map((item, idx) => {
                    const isLast = idx === Math.min(chartLegendData.length, 4) - 1;
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
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
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

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExportIcon fontSize="small" />}
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(e) => setExportAnchorEl(e.currentTarget)}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    textTransform: 'none',
                    height: 38,
                  }}
                >
                  Export
                </Button>

                <Menu
                  anchorEl={exportAnchorEl}
                  open={Boolean(exportAnchorEl)}
                  onClose={() => setExportAnchorEl(null)}
                  PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
                >
                  <MenuItem onClick={handleExportExcel}>
                    <TableChartIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
                    Export Excel
                  </MenuItem>
                  <MenuItem onClick={handleExportPdf}>
                    <PictureAsPdfIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                    Export PDF
                  </MenuItem>
                </Menu>
              </Box>

              <TableContainer sx={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                <Table sx={{ minWidth: 1120 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>
                        S/N
                      </TableCell>
                      <TableCell sx={{ minWidth: 260, fontWeight: 700, py: 1.5 }}>
                        Role Name
                      </TableCell>
                      <TableCell sx={{ minWidth: 250, fontWeight: 700, py: 1.5 }}>
                        Description
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 170, fontWeight: 700, py: 1.5 }}>
                        Total Permissions
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 130, fontWeight: 700, py: 1.5 }}>
                        Total Users
                      </TableCell>
                      <TableCell sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>Status</TableCell>
                      <TableCell sx={{ minWidth: 140, fontWeight: 700, py: 1.5 }}>
                        Last Updated
                      </TableCell>
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
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(8)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" width={j === 0 ? 30 : 80} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : displayRoles.length > 0 ? (
                      displayRoles.map((row, index) => {
                        const roleNameStr = row.role || row.name || '';
                        const isSystemRole = row.is_sys === 'yes';
                        const formattedName = formatRoleName(roleNameStr);
                        const permCount = row.totalPermissions ?? row.permissions_count ?? 0;
                        const userCount = row.totalUsers ?? row.users_count ?? 0;
                        const rawStatus = (
                          row.status || (row.is_active === false ? 'inactive' : 'active')
                        ).toLowerCase();
                        const isInactive = rawStatus === 'inactive';
                        const avatarStyle = getRoleAvatarStyle(index);
                        const IconComp = avatarStyle.icon;

                        const hasBeenUpdated =
                          Boolean(row.updated_by) ||
                          (Boolean(row.updated_at) &&
                            Boolean(row.created_at) &&
                            row.updated_at !== row.created_at);
                        const updatedDateRaw = row.updated_at || row.created_at;
                        const formattedDate = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                          : '—';
                        const formattedTime = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '';

                        return (
                          <TableRow key={row.id || index} hover>
                            <TableCell sx={{ py: 1.5 }}>{page * rowsPerPage + index + 1}</TableCell>

                            {/* Role Name + Icon + Protected Tag */}
                            <TableCell sx={{ py: 1.5, minWidth: 260 }}>
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

                            <TableCell sx={{ py: 1.5, minWidth: 250, maxWidth: 320 }}>
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
                                onClick={() => handleTotalPermissionClick(row)}
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
                                onClick={() => handleTotalUsersClick(row)}
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

                            <TableCell sx={{ py: 1.5 }}>
                              {hasBeenUpdated ? (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.primary"
                                    display="block"
                                  >
                                    {formattedDate}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" fontSize="11px">
                                    {formattedTime}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                  No updates yet
                                </Typography>
                              )}
                            </TableCell>

                            {/* Action Buttons */}
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
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
          </Paper>
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
            handleTotalPermissionClick(activeMenuRole);
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
            handleTotalUsersClick(activeMenuRole);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <IconUsers size={18} />
          </ListItemIcon>
          View Assigned Users
        </MenuItem>
      </Menu>

      <SchoolRolePermissionsModal
        open={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        role={selectedRole}
        onPermissionRemoved={fetchRoles}
      />

      <SchoolRoleUsersModal
        open={usersModalOpen}
        onClose={() => setUsersModalOpen(false)}
        role={selectedRole}
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
              Full breakdown of user allocations by role
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

export default SchoolRoleBasedAccess;
