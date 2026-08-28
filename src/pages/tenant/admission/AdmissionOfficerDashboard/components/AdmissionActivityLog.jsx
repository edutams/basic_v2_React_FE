import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { IconHistory, IconSearch, IconX } from '@tabler/icons-react';
import tenantApi from '@/api/tenant/tenant_api';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const getActivityIcon = (type) => {
  switch (type) {
    case 'applicant':
      return <PersonOutlineIcon sx={{ fontSize: 18 }} />;
    case 'document':
      return <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />;
    case 'review':
      return <FolderOutlinedIcon sx={{ fontSize: 18 }} />;
    case 'admitted':
      return <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />;
    case 'accepted':
      return <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />;
    default:
      return <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />;
  }
};

const getActivityStyles = (type) => {
  switch (type) {
    case 'applicant':
      return { color: '#7c3aed', background: '#f3e8ff' };
    case 'document':
      return { color: '#16a34a', background: '#dcfce7' };
    case 'review':
      return { color: '#2563eb', background: '#dbeafe' };
    case 'admitted':
      return { color: '#ea580c', background: '#ffedd5' };
    case 'accepted':
      return { color: '#16a34a', background: '#dcfce7' };
    default:
      return { color: '#64748b', background: '#f1f5f9' };
  }
};

const formatActivityDate = (createdAt, myUpdatedAt) => {
  if (myUpdatedAt) return myUpdatedAt;
  if (!createdAt) return '—';
  return dayjs(createdAt).format('DD MMM YYYY [at] hh:mm A');
};

/**
 * Recent Activity Log Component
 */
const AdmissionActivityLog = ({ onViewAll }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [activitiesList, setActivitiesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchUserActivities = async (isMounted = true) => {
    const causerId = user?.id || user?.user_id;
    try {
      setLoading(true);
      const url = causerId ? `/activity-logs/causer/${causerId}?limit=12` : `/activity-logs?limit=12`;
      const res = await tenantApi.get(url);
      const rawList = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);

      if (isMounted && rawList.length > 0) {
        const formatted = rawList.map((item) => {
          const description = item.description || 'Activity logged';
          const logName = (item.log_name || item.event || 'system').toLowerCase();

          let type = 'document';
          if (logName.includes('applicant') || logName.includes('user')) type = 'applicant';
          else if (logName.includes('doc') || logName.includes('file')) type = 'document';
          else if (logName.includes('review') || logName.includes('stage')) type = 'review';
          else if (logName.includes('admit') || logName.includes('batch')) type = 'admitted';
          else if (logName.includes('accept') || logName.includes('enroll')) type = 'accepted';

          const timeStr = item.my_updated_at || (item.created_at ? dayjs(item.created_at).fromNow() : 'Recently');

          return {
            id: item.id,
            type,
            title: description,
            category: item.log_name ? String(item.log_name).toUpperCase() : 'SYSTEM LOG',
            time: timeStr,
          };
        });

        setActivitiesList(formatted);
      }
    } catch (err) {
      console.warn('Failed to fetch activity logs:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchUserActivities(isMounted);
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '14px',
          bgcolor: isDark ? theme.palette.background.paper : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, pt: 1, pb: 0.75 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            RECENT ACTIVITY
          </Typography>
          <Button
            disableRipple
            onClick={() => setOpenModal(true)}
            endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
          >
            View All
          </Button>
        </Stack>

        {/* Log Items */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 1,
            pb: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? '#334155' : '#d1d5db', borderRadius: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          }}
        >
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : activitiesList.length > 0 ? (
            <Stack spacing={1.75}>
              {activitiesList.map((activity, index) => {
                const styles = getActivityStyles(activity.type);
                return (
                  <Stack
                    key={activity.id || `${activity.title}-${index}`}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{ transition: 'transform 150ms ease', '&:hover': { transform: 'translateX(2px)' } }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : styles.background,
                          color: isDark ? '#ffffff' : styles.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: isDark ? '#ffffff' : '#0f172a',
                            lineHeight: 1.25,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {activity.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: 1.3 }}>
                          {activity.category}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8', fontWeight: 500, flexShrink: 0 }}>
                      {activity.time}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ fontSize: '12px', borderRadius: '10px' }}>
              No recent activity logged.
            </Alert>
          )}
        </Box>
      </Card>

      {/* Activity Log Modal */}
      <ActivityLogModal open={openModal} onClose={() => setOpenModal(false)} user={user} />
    </>
  );
};

const ActivityLogModal = ({ open, onClose, user }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const causerId = user?.id || user?.user_id;
  const fullName = user?.full_name || (user?.fname && user?.lname ? `${user.fname} ${user.lname}` : user?.name || 'User');

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const url = causerId ? `/activity-logs/causer/${causerId}` : `/activity-logs`;
        const res = await tenantApi.get(url, {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: searchQuery.trim() || undefined,
          },
        });

        if (isMounted) {
          const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
          const total = res?.data?.total || res?.data?.meta?.total || list.length;
          setLogs(list);
          setTotalCount(total);
        }
      } catch (err) {
        console.error('Failed to load user activity logs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [open, causerId, page, rowsPerPage, searchQuery]);

  const handleSearchExecute = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchExecute();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              p: 1,
              borderRadius: 2,
              display: 'flex',
            }}
          >
            <IconHistory size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              System Activity Audit Trail
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Logged actions for{' '}
              <Typography component="span" variant="caption" color="primary.main" fontWeight={700}>
                {fullName}
              </Typography>
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Box mb={2} display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            fullWidth
            placeholder="Search activity logs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearchExecute}
            startIcon={<IconSearch size={16} />}
            sx={{ height: 38, px: 2.5, fontWeight: 600, flexShrink: 0, borderRadius: '8px', textTransform: 'none' }}
          >
            Search
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress size={32} />
          </Box>
        ) : logs.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconHistory size={40} color={theme.palette.text.disabled} />
            <Typography variant="subtitle1" fontWeight={600} mt={1} color="text.secondary">
              {searchQuery ? `No Activity Records Found for "${searchQuery}"` : 'No Activity Records Found'}
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 380 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 60, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>Activity</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>Date Performed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((item, idx) => (
                    <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={item.log_name ? item.log_name.toUpperCase() : 'SYSTEM'}
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          />
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {item.description || 'System Activity Executed'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.775rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {formatActivityDate(item.created_at, item.my_updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained" size="small" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdmissionActivityLog;
