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
import { IconSearch, IconEye, IconX } from '@tabler/icons-react';

const BCrumb = [
  {
    to: '/school-dashboard',
    title: 'Home',
  },
  {
    title: 'Activity Log',
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

  return (
    <PageContainer title="Activity Log" description="View system activity logs">
      <Breadcrumb title="Activity Log" items={BCrumb} />
      <BlankCard>
        <CardContent>
          <Typography variant="h5" mb={3}>
            System Activity Logs
          </Typography>
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
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "10%" }}>
                        <Typography variant="h6">S/N</Typography>
                      </TableCell>

                      <TableCell sx={{ width: "60%" }}>
                        <Typography variant="h6">Activity</Typography>
                      </TableCell>

                      <TableCell sx={{ width: "15%" }}>
                        <Typography variant="h6">Date</Typography>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
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
                        <TableCell colSpan={4} align="center">
                          No activity logs found
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
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Log Name</TableCell>
                      <TableCell>{selectedLog.log_name || 'default'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Subject Type</TableCell>
                      <TableCell>{selectedLog.subject_type || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Causer</TableCell>
                      <TableCell>
                        {selectedLog.causer?.fname && selectedLog.causer?.lname
                          ? `${selectedLog.causer.fname} ${selectedLog.causer.lname}`
                          : selectedLog.causer?.name || 'System'}
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
                    Additional Properties
                  </Typography>
                  <TableContainer component={Paper}>
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
          <Button variant="contained" size="small" onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ActivityLog;
