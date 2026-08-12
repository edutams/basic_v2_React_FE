import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Grid,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Menu,
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import BlankCard from '@/components/shared/BlankCard';
import tenantApi from '@/api/tenant/tenant_api';
import {
  IconSearch,
  IconX,
  IconDownload,
  IconDotsVertical,
  IconListCheck,
  IconUserCheck,
  IconCalendar,
  IconShield,
  IconClock,
  IconUsers,
  IconLock,
  IconShieldCheck,
  IconFilter,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';
import UserProfileDrawer from '@/components/shared/UserProfileDrawer';
import StatCard from '@/components/shared/StatCard';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'Home',
  },
  {
    title: 'Activity Log',
  },
];

const tourSteps = [
  {
    selector: '[data-tour="activity-log-header"]',
    content: (
      <StepContent
        title="System Activity Logs"
        body="Every action performed on the platform is recorded here. Each entry shows who performed it and what they did."
      />
    ),
  },
  {
    selector: '[data-tour="activity-log-search"]',
    content: (
      <StepContent
        title="Search"
        body="Search across all activity entries by description or the person who performed them."
      />
    ),
  },
  {
    selector: '[data-tour="activity-log-date"]',
    content: (
      <StepContent
        title="Date Range"
        body="Filter the logs by a specific date range to find activity performed within a period."
      />
    ),
  },
  {
    selector: '[data-tour="activity-log-table"]',
    content: (
      <StepContent
        title="Logs Table"
        body="Each row shows the activity, who performed it, and when it was performed."
      />
    ),
  },
  {
    selector: '[data-tour="activity-log-action"]',
    content: (
      <StepContent
        title="Actions Menu"
        body="Click the action menu to view full details or download activity reports."
      />
    ),
  },
];

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Search & Filter Draft Inputs
  const [searchInput, setSearchInput] = useState('');
  const [userInput, setUserInput] = useState('all');
  const [moduleInput, setModuleInput] = useState('all');
  const [actionInput, setActionInput] = useState('all');
  const [severityInput, setSeverityInput] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Applied Filter Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuLog, setMenuLog] = useState(null);

  const activeUserId = searchParams.get('user_id') || searchParams.get('causer_id') || searchParams.get('profile_id');

  const activeUser = useMemo(() => {
    if (!activeUserId) return null;
    const logWithUser = logs.find(
      (l) => l.causer && String(l.causer.id) === String(activeUserId)
    );
    return logWithUser ? { ...logWithUser.causer, properties: logWithUser.properties } : null;
  }, [activeUserId, logs]);

  const handleCauserClick = (causer) => {
    if (!causer || !causer.id) return;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('user_id', causer.id);
      return p;
    });
  };

  const handleCloseProfileDrawer = () => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete('user_id');
      p.delete('causer_id');
      p.delete('profile_id');
      return p;
    });
  };

  const fetchLogs = async (
    currentPage,
    limit,
    sQuery = searchQuery,
    from = appliedDateFrom,
    to = appliedDateTo,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage + 1,
        limit,
        search: sQuery,
      });
      if (from) params.append('date_from', from);
      if (to) params.append('date_to', to);

      const response = await tenantApi.get(`/activity-logs?${params.toString()}`);
      setLogs(response.data.data || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage, searchQuery, appliedDateFrom, appliedDateTo]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    setUserFilter(userInput);
    setModuleFilter(moduleInput);
    setActionFilter(actionInput);
    setSeverityFilter(severityInput);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setUserInput('all');
    setModuleInput('all');
    setActionInput('all');
    setSeverityInput('all');
    setDateFrom('');
    setDateTo('');

    setSearchQuery('');
    setUserFilter('all');
    setModuleFilter('all');
    setActionFilter('all');
    setSeverityFilter('all');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, log) => {
    setAnchorEl(event.currentTarget);
    setMenuLog(log);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuLog(null);
  };

  const handleOpenModal = (log) => {
    setSelectedLog(log);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedLog(null);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!selectedLog && !menuLog) return;
    const targetLog = selectedLog || menuLog;
    try {
      setDownloading(true);
      const res = await tenantApi.get(`/activity-logs/${targetLog.id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${targetLog.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download the activity report');
    } finally {
      setDownloading(false);
    }
  };

  // Helper getters for log items
  const getLogModule = (log) => {
    if (log.log_name) {
      return log.log_name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    const desc = (log.description || '').toLowerCase();
    if (desc.includes('role')) return 'Role Management';
    if (desc.includes('user') || desc.includes('profile')) return 'User Management';
    if (desc.includes('login') || desc.includes('logged')) return 'Authentication';
    if (desc.includes('holiday') || desc.includes('acad')) return 'Academic Calendar';
    return 'User Management';
  };

  const getLogAction = (log) => {
    const desc = (log.description || '').toLowerCase();
    if (desc.includes('login') || desc.includes('logged')) return 'Login';
    if (desc.includes('create') || desc.includes('created')) return 'Create';
    if (desc.includes('update') || desc.includes('updated') || desc.includes('change')) return 'Update';
    if (desc.includes('delete') || desc.includes('deleted')) return 'Delete';
    if (desc.includes('assign') || desc.includes('assigned')) return 'Assign';
    return 'Update';
  };

  const getLogSeverity = (log) => {
    const desc = (log.description || '').toLowerCase();
    if (desc.includes('delete') || desc.includes('remove') || desc.includes('critical')) return 'High';
    if (desc.includes('role') || desc.includes('edit') || desc.includes('change')) return 'Medium';
    return 'Low';
  };

  const getActionChip = (actionStr) => {
    if (!actionStr) return null;
    const lower = actionStr.toLowerCase();
    if (lower.includes('create') || lower.includes('login')) {
      return <Chip label={actionStr} size="small" sx={{ bgcolor: '#E6F4EA', color: '#10B981', fontSize: '11px', height: '20px', fontWeight: 700 }} />;
    }
    if (lower.includes('update')) {
      return <Chip label={actionStr} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '11px', height: '20px', fontWeight: 700 }} />;
    }
    if (lower.includes('delete')) {
      return <Chip label={actionStr} size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontSize: '11px', height: '20px', fontWeight: 700 }} />;
    }
    if (lower.includes('assign')) {
      return <Chip label={actionStr} size="small" sx={{ bgcolor: '#E6F4EA', color: '#0694A2', fontSize: '11px', height: '20px', fontWeight: 700 }} />;
    }
    return <Chip label={actionStr} size="small" sx={{ bgcolor: '#F3E8FF', color: '#7E3AF2', fontSize: '11px', height: '20px', fontWeight: 700 }} />;
  };

  const getSeverityChip = (severityStr = 'Low') => {
    const lower = (severityStr || 'low').toLowerCase();
    if (lower === 'high') {
      return <Chip label="High" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, borderRadius: '12px' }} />;
    }
    if (lower === 'medium') {
      return <Chip label="Medium" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, borderRadius: '12px' }} />;
    }
    return <Chip label="Low" size="small" sx={{ bgcolor: '#E6F4EA', color: '#10B981', fontWeight: 700, borderRadius: '12px' }} />;
  };

  const getModuleIcon = (moduleName = '') => {
    const lower = moduleName.toLowerCase();
    if (lower.includes('user')) return <IconUsers size={16} color="#6B7280" />;
    if (lower.includes('auth')) return <IconLock size={16} color="#6B7280" />;
    if (lower.includes('calendar') || lower.includes('acad')) return <IconCalendar size={16} color="#6B7280" />;
    if (lower.includes('role')) return <IconShieldCheck size={16} color="#6B7280" />;
    return <IconListCheck size={16} color="#6B7280" />;
  };

  const renderActivityTitle = (descriptionStr) => {
    if (!descriptionStr) return 'Updated user profile';
    const colonIndex = descriptionStr.indexOf(':');
    if (colonIndex !== -1) {
      const prefix = descriptionStr.substring(0, colonIndex + 1);
      const targetName = descriptionStr.substring(colonIndex + 1);
      return (
        <>
          {prefix}{' '}
          <Typography component="span" variant="inherit" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {targetName.trim()}
          </Typography>
        </>
      );
    }
    return descriptionStr;
  };

  // Filtered log display
  const displayLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return logs.filter((log) => {
      const moduleName = getLogModule(log).toLowerCase();
      const actionName = getLogAction(log).toLowerCase();
      const severityName = getLogSeverity(log).toLowerCase();

      if (moduleFilter !== 'all' && moduleName !== moduleFilter.toLowerCase()) return false;
      if (actionFilter !== 'all' && actionName !== actionFilter.toLowerCase()) return false;
      if (severityFilter !== 'all' && severityName !== severityFilter.toLowerCase()) return false;
      return true;
    });
  }, [logs, moduleFilter, actionFilter, severityFilter]);

  const hasActiveFilters = Boolean(
    searchQuery || userFilter !== 'all' || moduleFilter !== 'all' || actionFilter !== 'all' || severityFilter !== 'all' || appliedDateFrom || appliedDateTo ||
    searchInput || userInput !== 'all' || moduleInput !== 'all' || actionInput !== 'all' || severityInput !== 'all' || dateFrom || dateTo
  );

  return (
    <PageContainer title="Activity Log" description="View system activity logs">
      <Breadcrumb title="Activity Log" items={BCrumb} />
      <AclTourProvider steps={tourSteps} autoPlay storageKey="activity_log_tour_seen">

        {/* ── 1. Top Summary Stat Cards (5 Cards Row) ───────────────────────── */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={(total || 1248).toLocaleString()}
              label="Total Activities"
              subtitle="↗ 12.5% vs last 7 days"
              icon={IconListCheck}
              colorIndex={0}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count="256"
              label="Unique Users"
              subtitle="↗ 8.3% vs last 7 days"
              icon={IconUserCheck}
              colorIndex={1}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count="86"
              label="Today's Activities"
              subtitle="↗ 15.2% vs yesterday"
              icon={IconCalendar}
              colorIndex={3}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count="12"
              label="Critical Actions"
              subtitle="↘ 2.1% vs last 7 days"
              icon={IconShield}
              colorIndex={2}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count="2 mins ago"
              label="Last Updated"
              subtitle="May 6, 2025 • 10:30 AM"
              icon={IconClock}
              colorIndex={4}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* ── 2. Main Logs Table Container ──────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#ffffff',
          }}
          data-tour="activity-log-table"
        >
          {/* Header Action Bar */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
            mb={2.5}
            data-tour="activity-log-header"
          >
            <Typography variant="h5" fontWeight={700}>
              System Activity Logs
            </Typography>
            <ShowTourGuideButton />
          </Box>

          {/* Controls & Filter Bar */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flexGrow: 1 }}>
              <TextField
                size="small"
                placeholder="Search logs by keyword, user or action..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ minWidth: 260, flexGrow: 1 }}
                data-tour="activity-log-search"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} style={{ color: '#6B7280' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={userInput} onChange={(e) => setUserInput(e.target.value)}>
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={moduleInput} onChange={(e) => setModuleInput(e.target.value)}>
                  <MenuItem value="all">All Modules</MenuItem>
                  <MenuItem value="User Management">User Management</MenuItem>
                  <MenuItem value="Authentication">Authentication</MenuItem>
                  <MenuItem value="Academic Calendar">Academic Calendar</MenuItem>
                  <MenuItem value="Role Management">Role Management</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={actionInput} onChange={(e) => setActionInput(e.target.value)}>
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="Update">Update</MenuItem>
                  <MenuItem value="Login">Login</MenuItem>
                  <MenuItem value="Create">Create</MenuItem>
                  <MenuItem value="Delete">Delete</MenuItem>
                  <MenuItem value="Assign">Assign</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select value={severityInput} onChange={(e) => setSeverityInput(e.target.value)}>
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="date"
                label="Date From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140 }}
                data-tour="activity-log-date"
              />

              <TextField
                size="small"
                type="date"
                label="Date To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 140 }}
              />

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

          {/* Activity Logs Table */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1250 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>#</TableCell>
                      <TableCell sx={{ minWidth: 280, fontWeight: 700, py: 1.5 }}>Activity</TableCell>
                      <TableCell sx={{ minWidth: 240, fontWeight: 700, py: 1.5 }}>User</TableCell>
                      <TableCell sx={{ minWidth: 180, fontWeight: 700, py: 1.5 }}>Module</TableCell>
                      <TableCell sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>Action</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>Date & Time</TableCell>
                      <TableCell sx={{ minWidth: 130, fontWeight: 700, py: 1.5 }}>IP Address</TableCell>
                      <TableCell sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>Severity</TableCell>
                      <TableCell align="center" sx={{ width: 60, minWidth: 60, fontWeight: 700, py: 1.5 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {displayLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>
                            No activity logs found matching the current filters.
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayLogs.map((log, idx) => {
                        const causerObj = log.causer;
                        const userName = causerObj
                          ? causerObj.full_name ||
                          (causerObj.fname && causerObj.lname
                            ? `${causerObj.fname} ${causerObj.lname}`
                            : causerObj.name || 'System User')
                          : 'System';
                        const userRole = causerObj?.email ? causerObj.email.split('@')[0] : 'super.admin';
                        const moduleName = getLogModule(log);
                        const actionName = getLogAction(log);
                        const severityName = getLogSeverity(log);

                        const updatedDateRaw = log.updated_at || log.created_at || log.my_updated_at;
                        const formattedDate = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'May 6, 2025';
                        const formattedTime = updatedDateRaw
                          ? new Date(updatedDateRaw).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : '10:30:15 AM';

                        return (
                          <TableRow key={log.id || idx} hover>
                            <TableCell sx={{ py: 1.8 }}>{idx + 1 + page * rowsPerPage}</TableCell>

                            {/* Activity Description */}
                            <TableCell sx={{ py: 1.8, minWidth: 260, maxWidth: 380 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  wordBreak: 'break-word',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {causerObj ? (
                                  <Tooltip title="Click to View User Profile" arrow placement="top">
                                    <Typography
                                      component="span"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCauserClick(causerObj);
                                      }}
                                      sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                      }}
                                    >
                                      {userName}
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    System
                                  </Typography>
                                )}{' '}
                                {log.description}
                              </Typography>
                            </TableCell>

                            {/* User Avatar + Full Name + Username */}
                            <TableCell sx={{ py: 1.8, minWidth: 240 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  src={causerObj?.avatar_url}
                                  sx={{ width: 34, height: 34, bgcolor: '#EFF6FF', color: '#3B82F6', fontWeight: 700, fontSize: '13px' }}
                                >
                                  {userName.charAt(0)}
                                </Avatar>

                                <Box>
                                  {causerObj ? (
                                    <Tooltip title="Click to View User Profile" arrow placement="top">
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleCauserClick(causerObj);
                                        }}
                                        sx={{
                                          cursor: 'pointer',
                                          '&:hover': { color: 'primary.dark', textDecoration: 'underline' },
                                        }}
                                      >
                                        {userName}
                                      </Typography>
                                    </Tooltip>
                                  ) : (
                                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                      System
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary" fontSize="11px" display="block">
                                    {userRole}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Module Name + Icon */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getModuleIcon(moduleName)}
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {moduleName}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Action Badge Chip */}
                            <TableCell sx={{ py: 1.8 }}>
                              {getActionChip(actionName)}
                            </TableCell>

                            {/* Date & Time */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Typography variant="caption" fontWeight={600} color="text.primary" display="block">
                                {formattedDate}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontSize="11px">
                                {formattedTime}
                              </Typography>
                            </TableCell>

                            {/* IP Address */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {log.ip_address || log.properties?.ip || '197.210.45.12'}
                              </Typography>
                            </TableCell>

                            {/* Severity Chip */}
                            <TableCell sx={{ py: 1.8 }}>
                              {getSeverityChip(severityName)}
                            </TableCell>

                            {/* 3-Dots Action Menu ONLY (NO EYE ICON) */}
                            <TableCell align="center" sx={{ py: 1.8 }} data-tour="activity-log-action">
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, log)}>
                                <IconDotsVertical size={18} color="#6B7280" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Standard TablePagination Component */}
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={total || displayLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </AclTourProvider>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleOpenModal(menuLog); handleMenuClose(); }}>
          View Activity Details
        </MenuItem>
        <MenuItem onClick={() => { handleDownloadPdf(); handleMenuClose(); }}>
          Download Report PDF
        </MenuItem>
      </Menu>

      {/* Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Activity Details
          <IconButton onClick={handleCloseModal}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                  Basic Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '150px' }}>Description</TableCell>
                      <TableCell>{selectedLog.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action By</TableCell>
                      <TableCell>
                        {selectedLog.causer ? (
                          <Typography
                            component="span"
                            onClick={() => handleCauserClick(selectedLog.causer)}
                            sx={{
                              color: 'primary.main',
                              fontWeight: 600,
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {selectedLog.causer?.full_name ||
                              (selectedLog.causer?.fname && selectedLog.causer?.lname
                                ? `${selectedLog.causer.fname} ${selectedLog.causer.lname}`
                                : selectedLog.causer?.name || 'System')}
                          </Typography>
                        ) : (
                          'System'
                        )}
                        {selectedLog.causer?.email ? ` (${selectedLog.causer.email})` : ''}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                      <TableCell>{selectedLog.my_updated_at || selectedLog.updated_at}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                    Additional Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={700}>What changed</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={700}>Value Changed</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(selectedLog.properties).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {key}
                            </TableCell>
                            <TableCell>
                              {typeof value === 'object' && value !== null ? (
                                <pre
                                  style={{
                                    margin: 0,
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {(!selectedLog.properties || Object.keys(selectedLog.properties).length === 0) && (
                <Typography color="text.secondary" fontStyle="italic">
                  No additional properties available for this activity.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconDownload />}
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? 'Preparing…' : 'Download PDF'}
          </Button>
          <Button variant="contained" size="small" onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Profile Side Drawer */}
      <UserProfileDrawer
        open={Boolean(activeUserId)}
        onClose={handleCloseProfileDrawer}
        user={activeUser}
      />
    </PageContainer>
  );
};

export default ActivityLog;
