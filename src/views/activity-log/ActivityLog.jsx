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
  Chip,
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
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from 'src/components/shared/BlankCard';
import dayjs from 'dayjs';
import api from 'src/api/auth';
import { IconSearch, IconEye, IconX } from '@tabler/icons-react';

const BCrumb = [
  {
    to: '/',
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
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchLogs = async (currentPage, limit, searchQuery = search) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/agent/activity-logs?page=${currentPage + 1}&limit=${limit}&search=${searchQuery}`,
      );
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
      fetchLogs(0, rowsPerPage, search);
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
          <Box display="flex" gap={2} mb={3} alignItems="center">
            <TextField
              size="small"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              sx={{ width: '300px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size="18" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6">Activity</Typography>
                      </TableCell>
                      {/* <TableCell>
                        <Typography variant="h6">Description</Typography>
                      </TableCell> */}
                      {/* <TableCell>
                        <Typography variant="h6">Subject</Typography>
                      </TableCell> */}
                      <TableCell>
                        <Typography variant="h6">Date</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">Action</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Typography variant="body1">
                              <a href="#" className='text-success'>{log.causer?.org_name || 'System'}</a> {log.description}</Typography>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body1">{log.description}</Typography>
                          </TableCell> */}
                          {/* <TableCell>
                            <Chip
                              label={log.subject_type || 'System'}
                              size="small"
                              color="primary"
                              variant="outlined"
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
                              size="small"
                              variant="outlined"
                              startIcon={<IconEye size={18} />}
                              onClick={() => handleOpenModal(log)}
                            >
                              View Details
                            </Button>
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Activity Details
          <IconButton onClick={handleCloseModal}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && selectedLog.properties && Object.keys(selectedLog.properties).length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2">Property Key</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2">Value</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(selectedLog.properties).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {typeof value === 'object' && value !== null ? (
                          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
          ) : (
            <Typography>No additional properties available for this activity.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ActivityLog;
