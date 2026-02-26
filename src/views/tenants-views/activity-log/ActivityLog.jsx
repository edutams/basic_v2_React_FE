import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
} from '@mui/material';

import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  DeleteSweep as DeleteSweepIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import ParentCard from 'src/components/shared/ParentCard';
import activityLogApi from 'src/api/activityLogApi';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Activity Logs' }];

const ActivityLog = () => {
  const notify = useNotification();

  // State
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    log_name: '',
    description: '',
    date_from: '',
    date_to: '',
  });

  // Log names for filter dropdown
  const [logNames, setLogNames] = useState([]);

  // Statistics
  const [statistics, setStatistics] = useState(null);

  // Selected activity for detail view
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Prune dialog
  const [pruneDialogOpen, setPruneDialogOpen] = useState(false);
  const [pruneDays, setPruneDays] = useState(30);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        ...filters,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const res = await activityLogApi.getActivities(params);

      if (res.status === 'success') {
        setActivities(res.data || []);
        setTotal(res.meta?.total || 0);
      }
    } catch (error) {
      notify.error('Failed to fetch activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, notify]);

  // Fetch log names
  const fetchLogNames = useCallback(async () => {
    try {
      const res = await activityLogApi.getLogNames();
      if (res.status === 'success') {
        setLogNames(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch log names:', error);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const res = await activityLogApi.getStatistics();
      if (res.status === 'success') {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
    fetchLogNames();
    fetchStatistics();
  }, [fetchActivities, fetchLogNames, fetchStatistics]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Handle search
  const handleSearch = () => {
    setPage(0);
    fetchActivities();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      log_name: '',
      description: '',
      date_from: '',
      date_to: '',
    });
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view activity details
  const handleViewActivity = async (activity) => {
    try {
      const res = await activityLogApi.getActivity(activity.id);
      if (res.status === 'success') {
        setSelectedActivity(res.data);
        setDetailModalOpen(true);
      }
    } catch (error) {
      notify.error('Failed to fetch activity details');
    }
  };

  // Handle prune logs
  const handlePruneLogs = async () => {
    try {
      const res = await activityLogApi.pruneLogs(pruneDays);
      if (res.status === 'success') {
        notify.success(res.message);
        setPruneDialogOpen(false);
        fetchActivities();
        fetchStatistics();
      }
    } catch (error) {
      notify.error('Failed to prune logs');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get event color
  const getEventColor = (event) => {
    switch (event) {
      case 'created':
        return 'success';
      case 'updated':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <PageContainer title="Activity Logs" description="View and manage activity logs">
      <Breadcrumb title="Activity Logs" bcRumb={BCrumb} />

      {/* Stats Cards */}
      {statistics && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 3,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 300px' },
              minWidth: 0,
              maxWidth: { xs: '100%', sm: '300px' },
            }}
          >
            <Box
              component="div"
              sx={{
                boxShadow: 2,
                borderRadius: 1,
                p: { xs: 1.5, sm: 2 },
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                height: { xs: 'auto', sm: 90 },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 }, color: 'grey.800' }}>
                  Total
                </Box>
                <Box sx={{ fontWeight: 400, fontSize: { xs: 14, sm: 16 }, color: 'grey.500' }}>
                  Activities
                </Box>
              </Box>
              <Box
                sx={{
                  fontSize: { xs: 28, sm: 32 },
                  fontWeight: 700,
                  color: 'primary.main',
                  ml: { xs: 1, sm: 2 },
                }}
              >
                {statistics.total_activities || 0}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 300px' },
              minWidth: 0,
              maxWidth: { xs: '100%', sm: '300px' },
            }}
          >
            <Box
              component="div"
              sx={{
                boxShadow: 2,
                borderRadius: 1,
                p: { xs: 1.5, sm: 2 },
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                height: { xs: 'auto', sm: 90 },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 }, color: 'grey.800' }}>
                  Activities
                </Box>
                <Box sx={{ fontWeight: 400, fontSize: { xs: 14, sm: 16 }, color: 'grey.500' }}>
                  by Log Name
                </Box>
              </Box>
              <Box
                sx={{
                  fontSize: { xs: 28, sm: 32 },
                  fontWeight: 700,
                  color: 'primary.main',
                  ml: { xs: 1, sm: 2 },
                }}
              >
                {0}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Statistics Cards */}
      {/* {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Total Activities
                </Typography>
                <Typography variant="h3">{statistics.total_activities || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Activities by Log Name
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {statistics.by_log_name?.slice(0, 5).map((item, index) => (
                    <Chip
                      key={index}
                      label={`${item.log_name || 'default'}: ${item.count}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )} */}

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Activity Log</Typography>
          </Box>
        }
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search by description"
            value={filters.description}
            onChange={(e) => handleFilterChange('description', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Log Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Causer</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary">No activities found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id} hover>
                      <TableCell>{activity.id}</TableCell>
                      <TableCell>
                        <Chip
                          label={activity.log_name || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        {activity.event && (
                          <Chip
                            label={activity.event}
                            color={getEventColor(activity.event)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.causer ? (
                          <Box>
                            <Typography variant="body2">
                              {activity.causer.name || activity.causer_id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {activity.causer.type}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.subject ? (
                          <Box>
                            <Typography variant="body2">{activity.subject.type}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {activity.subject_id}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(activity.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewActivity(activity)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      count={total}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              }
            </Table>
          </TableContainer>
        </Paper>
      </ParentCard>

      {/* Activity Detail Dialog */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Activity Details</DialogTitle>
        <DialogContent dividers>
          {selectedActivity && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Log Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.log_name || 'default'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Event
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.event || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Causer Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.causer_type || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Causer ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.causer_id || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Subject Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.subject_type || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Subject ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedActivity.subject_id || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedActivity.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Updated At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedActivity.updated_at)}
                </Typography>
              </Grid>

              {selectedActivity.changes && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Changes
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      New Values
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <pre style={{ margin: 0, fontSize: '12px' }}>
                        {JSON.stringify(selectedActivity.changes.attributes || {}, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Old Values
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <pre style={{ margin: 0, fontSize: '12px' }}>
                        {JSON.stringify(selectedActivity.changes.old || {}, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                </>
              )}

              {selectedActivity.properties &&
                typeof selectedActivity.properties === 'object' &&
                !selectedActivity.changes && (
                  <Grid item xs={12}>
                    <Divider />
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Full Properties
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          maxHeight: '300px',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(selectedActivity.properties, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Prune Dialog */}
      <Dialog
        open={pruneDialogOpen}
        onClose={() => setPruneDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Prune Activity Logs</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Delete all activity logs older than the specified number of days.
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Days"
            value={pruneDays}
            onChange={(e) => setPruneDays(e.target.value)}
            helperText="Enter number of days (1-365)"
            sx={{ mt: 2 }}
            inputProps={{ min: 1, max: 365 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPruneDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePruneLogs} variant="contained" color="error">
            Prune Logs
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ActivityLog;
