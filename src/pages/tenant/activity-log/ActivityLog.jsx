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
import tenantApi from '@/api/tenant/tenant_api';
import { IconSearch, IconEye, IconX, IconDownload } from '@tabler/icons-react';
import ShowTourGuideButton from '@/components/shared/ShowTourGuideButton';
import { AclTourProvider, StepContent } from '@/context/AclTourContext';

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
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

      const response = await tenantApi.get(`/activity-logs?${params.toString()}`);
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
      const res = await tenantApi.get(`/activity-logs/${selectedLog.id}/pdf`, {
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
      setError('Failed to download the activity report');
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
              <Typography variant="h5">
                System Activity Logs
              </Typography>
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
            <Button variant="contained" size="small" color="primary" onClick={handleSearch} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Search
            </Button>
            {(search || dateFrom || dateTo) && (
              <Button variant="contained" size="small" color="secondary" onClick={handleClearFilters} sx={{ width: { xs: '100%', sm: 'auto' } }}>
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
              <TableContainer sx={{ overflowX: "auto" }} data-tour="activity-log-table">
                <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "5%" }}>
                        <Typography variant="h6">S/N</Typography>
                      </TableCell>

                      <TableCell sx={{ width: "50%" }}>
                        <Typography variant="h6">Activity</Typography>
                      </TableCell>

                      <TableCell sx={{ width: "35%" }}>
                        <Typography variant="h6">Date Performed</Typography>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          width: "25%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Typography variant="h6">Action</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                            No activity logs found
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log, idx) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Typography variant="body1">
                              {idx + 1 + page * rowsPerPage}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body1"
                              sx={{
                                wordBreak: "break-word",
                              }}
                            >
                              <a href="#" className="text-success">
                                {log.causer?.fname && log.causer?.lname
                                  ? `${log.causer.fname} ${log.causer.lname}`
                                  : log.causer?.name || "System"}
                              </a>{" "}
                              {log.description}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {log.my_updated_at}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<IconEye />}
                              onClick={() => handleOpenModal(log)}
                              data-tour="activity-log-action"
                              sx={{
                                display: { xs: "none", md: "inline-flex" },
                              }}
                            >
                              View Details
                            </Button>

                            <IconButton
                              size="small"
                              onClick={() => handleOpenModal(log)}
                              sx={{
                                display: { xs: "inline-flex", md: "none" },
                              }}
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
                <Typography variant="subtitle2" gutterBottom>
                  Basic Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '150px' }}>Description</TableCell>
                      <TableCell>{selectedLog.description}</TableCell>
                    </TableRow>
                    {/* <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Log Name</TableCell>
                      <TableCell>{selectedLog.log_name || 'default'}</TableCell>
                    </TableRow> */}
                    {/* <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Subject Type</TableCell>
                      <TableCell>{selectedLog.subject_type || 'N/A'}</TableCell>
                    </TableRow> */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action By</TableCell>
                      <TableCell>
                        {selectedLog.causer?.fname && selectedLog.causer?.lname
                          ? `${selectedLog.causer.fname} ${selectedLog.causer.lname}`
                          : selectedLog.causer?.name || 'System'} ({selectedLog.causer.email})
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
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information
                  </Typography>
                  <TableContainer >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2">What changed</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Value Changed</Typography>
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
    </PageContainer>
  );
};

export default ActivityLog;
