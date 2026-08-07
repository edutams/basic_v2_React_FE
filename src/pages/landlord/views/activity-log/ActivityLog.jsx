import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import BlankCard from '@/components/shared/BlankCard';
import api from '@/api/landlord/landlord_api';
import { IconSearch, IconEye, IconX, IconDownload } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';
import UserProfileDrawer from '@/components/shared/UserProfileDrawer';

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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const activeUserId = searchParams.get('user_id') || searchParams.get('causer_id') || searchParams.get('profile_id');

  const activeUser = React.useMemo(() => {
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
    searchQuery = search,
    from = dateFrom,
    to = dateTo,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage + 1,
        limit,
        search: searchQuery,
      });
      if (from) params.append('date_from', from);
      if (to) params.append('date_to', to);

      const response = await api.get(`/v1/landlord/activity-logs?${params.toString()}`);
      setLogs(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    if (page === 0) {
      fetchLogs(0, rowsPerPage, search, dateFrom, dateTo);
    } else {
      setPage(0);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    if (page === 0) {
      fetchLogs(0, rowsPerPage, '', '', '');
    } else {
      setPage(0);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    if (!selectedLog) return;
    try {
      setDownloading(true);
      const res = await api.get(`/v1/landlord/activity-logs/${selectedLog.id}/pdf`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${selectedLog.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageContainer title="Activity Log" description="View system activity logs">
      <Breadcrumb title="Activity Log" items={BCrumb} />
      <AclTourProvider steps={tourSteps} autoPlay storageKey="activity_log_tour_seen">
        <BlankCard>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              mb={3}
              data-tour="activity-log-header"
            >
              <Typography variant="h5">System Activity Logs</Typography>
              <ShowTourGuideButton />
            </Box>
            <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
                data-tour="activity-log-search"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size="18" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                size="small"
                label="Date From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: '100%', sm: '160px' } }}
                data-tour="activity-log-date"
              />
              <TextField
                size="small"
                label="Date To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: dateFrom || undefined }}
                sx={{ width: { xs: '100%', sm: '160px' } }}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleSearch}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Search
              </Button>
              {(search || dateFrom || dateTo) && (
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  onClick={handleClearFilters}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Clear
                </Button>
              )}
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <>
                <TableContainer sx={{ overflowX: 'auto' }} data-tour="activity-log-table">
                  <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '5%' }}>
                          <Typography variant="h6">S/N</Typography>
                        </TableCell>
                        <TableCell sx={{ width: '50%' }}>
                          <Typography variant="h6">Activity</Typography>
                        </TableCell>
                        {/* <TableCell>
                        <Typography variant="h6">Description</Typography>
                      </TableCell> */}
                        {/* <TableCell>
                        <Typography variant="h6">Subject</Typography>
                      </TableCell> */}
                        <TableCell sx={{ width: '35%' }}>
                          <Typography variant="h6">Date Performed</Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            width: '25%',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Typography variant="h6">Action</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                              No activity logs found
                            </Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((log, idx) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Typography variant="body1">{idx + 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1">
                                {log.causer ? (
                                  <Typography
                                    component="span"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCauserClick(log.causer);
                                    }}
                                    sx={{
                                      color: 'primary.main',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    {log.causer?.full_name ||
                                      (log.causer?.fname && log.causer?.lname
                                        ? `${log.causer.fname} ${log.causer.lname}`
                                        : log.causer?.name || 'System')}
                                  </Typography>
                                ) : (
                                  <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    System
                                  </Typography>
                                )}{' '}
                                {log.description}
                              </Typography>
                            </TableCell>
                            {/* <TableCell>
                            <Typography variant="body1">{log.description}</Typography>
                          </TableCell> */}
                            {/* <TableCell>
                            <Chip
                              label={log.subject_type || 'System'}
                              size="small"
                              color="primary"
                              
                            />
                          </TableCell> */}
                            <TableCell>
                              <Typography variant="body2" color="textSecondary">
                                {log.my_updated_at}
                                {/* {dayjs(log.created_at).format('MMM D, YYYY HH:mm')} */}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<IconEye />}
                                onClick={() => handleOpenModal(log)}
                                data-tour="activity-log-action"
                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                              >
                                View Details
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenModal(log)}
                                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                              >
                                <IconEye size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component="div"
                  count={total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </BlankCard>
      </AclTourProvider>

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
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
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
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell>{selectedLog.my_updated_at}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {selectedLog.properties && Object.keys(selectedLog.properties).length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    What Changed
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2">Property</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Value</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(selectedLog.properties).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{key}</TableCell>
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
