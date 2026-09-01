import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
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
import api from '@/api/landlord/landlord_api';
import aclApi from '@/api/landlord/acl/aclApi';
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
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';
import UserProfileDrawer from '@/components/shared/UserProfileDrawer';
import StatCard from '@/components/shared/StatCard';
import useNotification from '@/hooks/useNotification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const formatTimeAgo = (activity) => {
  const rawTimeAgo = activity?.created_at
    ? dayjs(activity.created_at).fromNow()
    : activity?.time_ago;

  if (!rawTimeAgo) return '—';

  return rawTimeAgo
    .replace(/\bminutes\b/gi, 'mins')
    .replace(/\bminute\b/gi, 'min')
    .replace(/\bhours\b/gi, 'hrs')
    .replace(/\bhour\b/gi, 'hr')
    .replace(/\bseconds\b/gi, 'secs')
    .replace(/\bsecond\b/gi, 'sec');
};

const BCrumb = [
  {
    to: '/',
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
        title="View Details"
        body="Click View Details to open the full activity record, including exactly what changed."
      />
    ),
  },
];

const ActivityLog = () => {
  const notify = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Search & Filter Draft Inputs
  const [searchInput, setSearchInput] = useState('');
  const [userInput, setUserInput] = useState('all');
  const [actionInput, setActionInput] = useState('all');
  const [severityInput, setSeverityInput] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Applied Filter Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuLog, setMenuLog] = useState(null);

  const [stats, setStats] = useState({
    total_activities: 0,
    unique_users: 0,
    today_activities: 0,
    critical_actions: 0,
    last_activity: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [rolesList, setRolesList] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await aclApi.getRolesList();
        const rolesData = res?.data ?? res ?? [];
        if (Array.isArray(rolesData)) {
          setRolesList(rolesData);
        }
      } catch (err) {
        console.error('Failed to load roles for activity log filter:', err);
      }
    };
    fetchRoles();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/v1/landlord/activity-logs/statistics');
      const data = res.data?.data || res.data || {};
      setStats({
        total_activities: data.total_activities ?? 0,
        unique_users: data.unique_users ?? 0,
        today_activities: data.today_activities ?? 0,
        critical_actions: data.critical_actions ?? 0,
        last_activity: data.last_activity ?? null,
      });
    } catch (err) {
      console.error('Failed to fetch landlord activity log statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    act = actionFilter,
    sev = severityFilter,
    usr = userFilter,
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
      if (act && act !== 'all') params.append('action', act);
      if (sev && sev !== 'all') params.append('severity', sev);
      if (usr && usr !== 'all') params.append('user_type', usr);

      const response = await api.get(`/v1/landlord/activity-logs?${params.toString()}`);
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
    fetchLogs(
      page,
      rowsPerPage,
      searchQuery,
      appliedDateFrom,
      appliedDateTo,
      actionFilter,
      severityFilter,
      userFilter
    );
  }, [
    page,
    rowsPerPage,
    searchQuery,
    appliedDateFrom,
    appliedDateTo,
    actionFilter,
    severityFilter,
    userFilter,
  ]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    setUserFilter(userInput);
    setActionFilter(actionInput);
    setSeverityFilter(severityInput);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setUserInput('all');
    setActionInput('all');
    setSeverityInput('all');
    setDateFrom('');
    setDateTo('');

    setSearchQuery('');
    setUserFilter('all');
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
      const res = await api.get(`/v1/landlord/activity-logs/${targetLog.id}/pdf`, {
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
      notify.error('Failed to download PDF report');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const getLogModule = (log) => log?.module || log?.log_name || 'System';

  const getLogAction = (log) => log?.action || log?.event || 'Update';

  const getLogSeverity = (log) => log?.severity || log?.properties?.severity || 'Low';

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
    if (lower.includes('acl') || lower.includes('role') || lower.includes('permission')) return <IconShieldCheck size={16} color="#6B7280" />;
    if (lower.includes('finance') || lower.includes('bursary') || lower.includes('package') || lower.includes('subscription')) return <IconListCheck size={16} color="#6B7280" />;
    if (lower.includes('agent') || lower.includes('tenant') || lower.includes('school')) return <IconUserCheck size={16} color="#6B7280" />;
    if (lower.includes('calendar') || lower.includes('academic')) return <IconCalendar size={16} color="#6B7280" />;
    if (lower.includes('profile') || lower.includes('user')) return <IconUsers size={16} color="#6B7280" />;
    if (lower.includes('security') || lower.includes('auth')) return <IconLock size={16} color="#6B7280" />;
    return <IconListCheck size={16} color="#6B7280" />;
  };

  const displayLogs = useMemo(() => {
    return logs || [];
  }, [logs]);

  const hasActiveFilters = Boolean(
    searchQuery || userFilter !== 'all' || actionFilter !== 'all' || severityFilter !== 'all' || appliedDateFrom || appliedDateTo ||
    searchInput || userInput !== 'all' || actionInput !== 'all' || severityInput !== 'all' || dateFrom || dateTo
  );

  return (
    <PageContainer title="Activity Log" description="View system activity logs">
      <Breadcrumb title="Activity Log" items={BCrumb} />
      <AclTourProvider steps={tourSteps} autoPlay storageKey="landlord_activity_log_tour_seen">

        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={(stats.total_activities || total || 0).toLocaleString()}
              label="Total Activities"
              subtitle="System log entries"
              icon={IconListCheck}
              colorIndex={0}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.unique_users.toLocaleString()}
              label="Unique Users"
              subtitle="Users with activity"
              icon={IconUserCheck}
              colorIndex={1}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.today_activities.toLocaleString()}
              label="Today's Activities"
              subtitle="Recorded today"
              icon={IconCalendar}
              colorIndex={3}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={stats.critical_actions.toLocaleString()}
              label="Critical Actions"
              subtitle="Deletions/security events"
              icon={IconShield}
              colorIndex={2}
              loading={statsLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard
              count={formatTimeAgo(stats.last_activity)}
              label="Last Activity"
              subtitle={
                stats.last_activity?.created_at
                  ? dayjs(stats.last_activity.created_at).format('MMM D, YYYY • h:mm A')
                  : stats.last_activity?.date_formatted || 'No activity yet'
              }
              icon={IconClock}
              colorIndex={4}
              loading={statsLoading}
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
          }}
          data-tour="activity-log-table"
        >
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

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={userInput} onChange={(e) => setUserInput(e.target.value)}>
                  <MenuItem value="all">All Roles</MenuItem>
                  {rolesList.map((role) => {
                    const rawRoleName = typeof role === 'string' ? role : (role.name || role.title || role.id);
                    const displayLabel = rawRoleName
                      ? String(rawRoleName)
                        .replace(/[_-]/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                      : '';
                    return (
                      <MenuItem key={role.id || rawRoleName} value={rawRoleName}>
                        {displayLabel}
                      </MenuItem>
                    );
                  })}
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
                slotProps={{
                  htmlInput: {
                    max: dayjs().format('YYYY-MM-DD'),
                  },
                }}
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
                slotProps={{
                  htmlInput: {
                    max: dayjs().format('YYYY-MM-DD'),
                    min: dateFrom || undefined,
                  },
                }}
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
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 50, minWidth: 50, fontWeight: 700, py: 1.5 }}>S/N</TableCell>
                      <TableCell sx={{ minWidth: 250, fontWeight: 700, py: 1.5 }}>Activity</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>Module</TableCell>
                      <TableCell sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>Action</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 700, py: 1.5 }}>Date & Time</TableCell>
                      <TableCell sx={{ minWidth: 110, fontWeight: 700, py: 1.5 }}>Severity</TableCell>
                      <TableCell align="center" sx={{ width: 60, minWidth: 60, fontWeight: 700, py: 1.5 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {displayLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                        const causerAvatar =
                          causerObj?.avatar ||
                          causerObj?.avatar_url ||
                          causerObj?.profile_picture ||
                          causerObj?.picture ||
                          causerObj?.image ||
                          causerObj?.image_url ||
                          '';
                        const moduleName = getLogModule(log);
                        const actionName = getLogAction(log);
                        const severityName = getLogSeverity(log);

                        const updatedDateRaw = log.created_at || log.updated_at || log.my_updated_at;
                        const formattedDate = updatedDateRaw
                          ? dayjs(updatedDateRaw).format('MMM D, YYYY')
                          : '—';
                        const formattedTime = updatedDateRaw
                          ? dayjs(updatedDateRaw).format('h:mm:ss A')
                          : '';

                        return (
                          <TableRow key={log.id || idx} hover>
                            <TableCell sx={{ py: 1.8 }}>{idx + 1 + page * rowsPerPage}</TableCell>

                            {/* Activity Description with User Avatar */}
                            <TableCell sx={{ py: 1.8, minWidth: 260, maxWidth: 380 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  src={causerAvatar}
                                  alt={userName}
                                  onClick={(e) => {
                                    if (causerObj) {
                                      e.preventDefault();
                                      handleCauserClick(causerObj);
                                    }
                                  }}
                                  sx={{
                                    width: 34,
                                    height: 34,
                                    bgcolor: '#EFF6FF',
                                    color: '#3B82F6',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    flexShrink: 0,
                                    cursor: causerObj ? 'pointer' : 'default',
                                    '&:hover': causerObj ? { opacity: 0.85 } : {},
                                  }}
                                >
                                  {userName?.[0]?.toUpperCase() ?? '?'}
                                </Avatar>

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

                            {/* Severity Chip */}
                            <TableCell sx={{ py: 1.8 }}>
                              {getSeverityChip(severityName)}
                            </TableCell>

                            {/* 3-Dots Action Menu */}
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
                      <TableCell>
                        {selectedLog.created_at || selectedLog.updated_at || selectedLog.my_updated_at
                          ? dayjs(selectedLog.created_at || selectedLog.updated_at || selectedLog.my_updated_at).format('MMM D, YYYY • h:mm:ss A')
                          : '—'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                      <TableCell>{selectedLog.properties?.ip || selectedLog.ip_address || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {selectedLog.properties &&
                Object.entries(selectedLog.properties).filter(([key]) => key !== 'ip' && key !== 'ip_address').length > 0 ? (
                <Box mt={2}>
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
                        {Object.entries(selectedLog.properties)
                          .filter(([key]) => key !== 'ip' && key !== 'ip_address')
                          .map(([key, value]) => (
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
              ) : (
                <Typography color="text.secondary" fontStyle="italic" mt={2}>
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
        isLandlord={true}
      />
    </PageContainer>
  );
};

export default ActivityLog;
