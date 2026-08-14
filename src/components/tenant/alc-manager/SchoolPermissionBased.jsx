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
  ListItemIcon,
  FormControl,
  Menu,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import Chart from 'react-apexcharts';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  IconLock,
  IconKey,
  IconUsers,
  IconFilter,
  IconDotsVertical,
  IconArrowRight,
  IconShieldCheck,
  IconShield,
  IconDownload,
  IconX,
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
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuPerm, setActiveMenuPerm] = useState(null);

  const [rolesList, setRolesList] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchSummaryStats();
    fetchRolesList();
  }, []);

  const fetchRolesList = async () => {
    try {
      const res = await aclApi.getSchoolRolesList({ exclude_super_admin: true });
      const fetched = res?.data?.data || res?.data || res || [];
      if (Array.isArray(fetched)) {
        setRolesList(fetched.filter((r) => r.name !== 'super_admin'));
      }
    } catch (err) {
      console.error('Failed to fetch roles list:', err);
    }
  };

  const fetchSummaryStats = async () => {
    setStatsLoading(true);
    try {
      const res = await aclApi.getSchoolPermissionAnalysisStats();
      const payload = res?.data?.data || res?.data || res;
      if (payload && typeof payload === 'object') {
        setSummaryStats(payload);
      }
    } catch (error) {
      console.error('Failed to fetch permission summary stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [page, rowsPerPage, nameFilter, moduleFilter, statusFilter, roleFilter]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: nameFilter,
        module_id: moduleFilter,
        status: statusFilter,
        role_id: roleFilter,
      };
      const res = await aclApi.getSchoolPermissionAnalytics(params);

      if (res?.data) {
        const fetched = res.data.data || res.data || [];
        setPermissions(Array.isArray(fetched) ? fetched : []);
        setTotalRows(res.data.total || (Array.isArray(fetched) ? fetched.length : 0));
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
    setRoleInput(roleInput);
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

  const handleTotalRoleClick = (perm) => {
    setSelectedPermission(perm);
    setPermissionModalOpen(true);
  };

  const handleTotalUsersClick = (perm) => {
    setSelectedPermission(perm);
    setUsersModalOpen(true);
  };

  const handleMenuOpen = (event, perm) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuPerm(perm);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuPerm(null);
  };

  const getModuleName = (permission) => {
    if (!permission) return 'General';
    if (permission.module_name) return permission.module_name;
    const name =
      typeof permission === 'string' ? permission : permission.name || permission.permission || '';
    const parts = name.split(/[\._\-:]/);
    if (parts.length > 1 && parts[0].trim()) {
      return parts[0]
        .trim()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return 'General';
  };

  const displayPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) return [];
    return permissions.filter((p) => {
      const pName = (p.name || p.permission || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      const pModule = getModuleName(p).toLowerCase();
      const modFilterStr = String(moduleFilter || '').toLowerCase();
      const roleCount = p.roles_count ?? p.totalRoles ?? 0;
      const pStatus = roleCount > 0 ? 'assigned' : 'unused';

      if (
        nameFilter &&
        !pName.includes(nameFilter.toLowerCase()) &&
        !pDesc.includes(nameFilter.toLowerCase())
      ) {
        return false;
      }
      if (moduleFilter !== 'all' && modFilterStr !== 'all') {
        const isModIdMatch = p.module_id && String(p.module_id) === String(moduleFilter);
        const isModNameMatch = pModule === modFilterStr;
        if (!isModIdMatch && !isModNameMatch) return false;
      }
      if (statusFilter !== 'all' && pStatus !== String(statusFilter).toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [permissions, nameFilter, moduleFilter, statusFilter]);

  const stats = useMemo(() => {
    const rawTotalP = summaryStats?.total_permissions ?? summaryStats?.totalPermissions;
    const rawAssignedP = summaryStats?.assigned_permissions ?? summaryStats?.assignedPermissions;
    const rawUnusedP = summaryStats?.unused_permissions ?? summaryStats?.unusedPermissions;
    const rawAffectedU = summaryStats?.affected_users ?? summaryStats?.affectedUsers;

    const totalP =
      rawTotalP !== undefined && rawTotalP !== null
        ? Number(rawTotalP)
        : totalRows || permissions.length || 0;
    const assignedP =
      rawAssignedP !== undefined && rawAssignedP !== null
        ? Number(rawAssignedP)
        : permissions.filter((p) => (p.roles_count ?? p.totalRoles ?? 0) > 0).length;
    const unusedP =
      rawUnusedP !== undefined && rawUnusedP !== null
        ? Number(rawUnusedP)
        : permissions.filter((p) => (p.roles_count ?? p.totalRoles ?? 0) === 0).length;
    const affectedU =
      rawAffectedU !== undefined && rawAffectedU !== null
        ? Number(rawAffectedU)
        : permissions.reduce((acc, p) => acc + (p.users_count ?? p.totalUsers ?? 0), 0);

    return { totalP, assignedP, unusedP, affectedU };
  }, [summaryStats, permissions, totalRows]);

  const COLOR_PALETTE = [
    '#0E9F6E',
    '#1A56DB',
    '#7E3AF2',
    '#0694A2',
    '#D97706',
    '#6B7280',
    '#EC4899',
    '#8B5CF6',
  ];

  const distributionData = useMemo(() => {
    const dist = summaryStats?.distribution;
    if (Array.isArray(dist) && dist.length > 0) {
      return dist.map((item, idx) => ({
        label: item.name || item.label || 'Module',
        count: Number(item.count ?? item.users_count ?? 0),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }));
    }
    if (permissions && permissions.length > 0) {
      const countsMap = {};
      permissions.forEach((p) => {
        const m = getModuleName(p);
        countsMap[m] = (countsMap[m] || 0) + 1;
      });
      return Object.entries(countsMap)
        .map(([label, count], idx) => ({
          label,
          count,
          color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        }))
        .sort((a, b) => b.count - a.count);
    }
    return [];
  }, [summaryStats, permissions]);

  const chartLabels = useMemo(() => {
    if (distributionData && distributionData.length > 0) {
      const total = distributionData.reduce((acc, d) => acc + d.count, 0);
      if (total === 0) return ['No Permissions'];
      return distributionData.map((d) => d.label);
    }
    return ['No Permissions'];
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

  // Chart configuration for Permissions by Module
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
            size: '60%',
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
                formatter: () => `${stats.totalP.toLocaleString()}`,
              },
              total: {
                show: true,
                label: 'Total Permissions',
                fontSize: '12px',
                fontWeight: 500,
                color: '#64748B',
                formatter: () => `${stats.totalP.toLocaleString()}`,
              },
            },
          },
        },
      },
      stroke: { width: 2, colors: ['#ffffff'] },
    }),
    [chartLabels, chartColors, stats.totalP],
  );

  const chartLegendData = distributionData;

  // Helper chip for permission action type
  const getPermissionActionChip = (permissionName) => {
    if (!permissionName) return null;
    const lower = permissionName.toLowerCase();
    if (lower.includes('create') || lower.includes('store') || lower.includes('assign')) {
      return (
        <Chip
          label="Create"
          size="small"
          sx={{
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            fontSize: '10px',
            height: '18px',
            fontWeight: 700,
          }}
        />
      );
    }
    if (lower.includes('update') || lower.includes('edit')) {
      return (
        <Chip
          label="Update"
          size="small"
          sx={{
            bgcolor: '#F3E8FF',
            color: '#7E3AF2',
            fontSize: '10px',
            height: '18px',
            fontWeight: 700,
          }}
        />
      );
    }
    if (lower.includes('delete') || lower.includes('destroy') || lower.includes('unassign')) {
      return (
        <Chip
          label="Delete"
          size="small"
          sx={{
            bgcolor: '#FEF2F2',
            color: '#DC2626',
            fontSize: '10px',
            height: '18px',
            fontWeight: 700,
          }}
        />
      );
    }
    if (lower.includes('execute') || lower.includes('generate')) {
      return (
        <Chip
          label="Execute"
          size="small"
          sx={{
            bgcolor: '#FEF3C7',
            color: '#D97706',
            fontSize: '10px',
            height: '18px',
            fontWeight: 700,
          }}
        />
      );
    }
    return (
      <Chip
        label="View"
        size="small"
        sx={{
          bgcolor: '#E6F4EA',
          color: '#10B981',
          fontSize: '10px',
          height: '18px',
          fontWeight: 700,
        }}
      />
    );
  };

  const hasActiveFilters = Boolean(
    nameFilter ||
    moduleFilter !== 'all' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all' ||
    searchInput ||
    moduleInput !== 'all' ||
    statusInput !== 'all' ||
    roleInput !== 'all',
  );

  // CSV Export handler
  const handleExportCSV = () => {
    if (!displayPermissions || displayPermissions.length === 0) return;
    const headers = [
      'S/N',
      'Permission',
      'Module',
      'Description',
      'Total Roles',
      'Total Users',
      'Status',
    ];
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
    link.setAttribute(
      'download',
      `permissions_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.totalP.toLocaleString()}
            label="Total Permissions"
            subtitle="Across all roles"
            icon={IconLock}
            colorIndex={0}
            loading={statsLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.assignedP.toLocaleString()}
            label="Permissions Assigned"
            subtitle="In use by roles"
            icon={IconShieldCheck}
            colorIndex={1}
            loading={statsLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.unusedP}
            label="Unused Permissions"
            subtitle="Not assigned to any role"
            icon={IconKey}
            colorIndex={3}
            loading={statsLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.affectedU.toLocaleString()}
            label="Affected Users"
            subtitle="Users impacted by permissions"
            icon={IconUsers}
            colorIndex={2}
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 3.5 }} sx={{ display: 'flex' }}>
          <ParentCard title="Permissions by Module" sx={{ width: '100%', height: '100%' }}>
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
                  {chartLegendData.slice(0, 8).map((item, idx) => {
                    const isLast = idx === Math.min(chartLegendData.length, 8) - 1;
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
                onClick={() => setBreakdownModalOpen(true)}
                endIcon={<IconArrowRight size={16} />}
                sx={{
                  mt: 2,
                  py: 0.9,
                  borderRadius: '10px',
                  borderColor: 'divider',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                View Module Breakdown
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
              bgcolor: '#ffffff',
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

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select value={moduleInput} onChange={(e) => setModuleInput(e.target.value)}>
                      <MenuItem value="all">All Modules</MenuItem>
                      {summaryStats?.distribution?.map((m) => (
                        <MenuItem key={m.id || m.name} value={m.id || m.name}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="assigned">Assigned</MenuItem>
                      <MenuItem value="unused">Unused</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={roleInput} onChange={(e) => setRoleInput(e.target.value)}>
                      <MenuItem value="all">All Roles</MenuItem>
                      {rolesList.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {formatRoleName(r.name || r.role)}
                        </MenuItem>
                      ))}
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

              <TableContainer sx={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                <Table sx={{ minWidth: 960 }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>
                        #
                      </TableCell>
                      <TableCell sx={{ minWidth: 200, fontWeight: 700, py: 1.5 }}>
                        Permission
                      </TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>Module</TableCell>
                      <TableCell sx={{ minWidth: 220, fontWeight: 700, py: 1.5 }}>
                        Description
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>
                        Total Roles
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>
                        Total Users
                      </TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 700, py: 1.5 }}>Status</TableCell>
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

                            {/* Permission Code + Action Badge */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  color="text.primary"
                                >
                                  {permName}
                                </Typography>
                                {actionBadge}
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {moduleTitle}
                              </Typography>
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
                                {row.description || 'View the ACL index / dashboard.'}
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
                                onClick={() => handleTotalRoleClick(row)}
                              >
                                {roleCount}
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
            handleTotalRoleClick(activeMenuPerm);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <IconShield size={18} />
          </ListItemIcon>
          View Assigned Roles
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleTotalUsersClick(activeMenuPerm);
            handleMenuClose();
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
            <IconUsers size={18} />
          </ListItemIcon>
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

      {/* Permissions Module Distribution Breakdown Modal */}
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
              Permissions Module Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Full breakdown of permission counts by module
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
              Total Permissions
            </Typography>
            <Chip
              label={`${stats.totalP.toLocaleString()} Permissions`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Module Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Permissions
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

export default SchoolPermissionBased;
